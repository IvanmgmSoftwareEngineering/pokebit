// Modelo - Lógica de negocio para la wallet
import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import CryptoJS from 'crypto-js';
import { HDKey } from '@scure/bip32';
import { base58check, bech32 } from '@scure/base';
import * as ed25519 from '@noble/ed25519';
import bs58 from 'bs58';

// HMAC-SHA512 usando CryptoJS (compatible con navegador)
function hmacSha512(key: Uint8Array, data: Uint8Array): Uint8Array {
  const keyWordArray = CryptoJS.lib.WordArray.create(key as unknown as number[]);
  const dataWordArray = CryptoJS.lib.WordArray.create(data as unknown as number[]);
  const hash = CryptoJS.HmacSHA512(dataWordArray, keyWordArray);
  return wordArrayToUint8Array(hash);
}

// Simple hash functions using crypto-js
function sha256Hash(data: Uint8Array): Uint8Array {
  const wordArray = CryptoJS.lib.WordArray.create(data as unknown as number[]);
  const hash = CryptoJS.SHA256(wordArray);
  return wordArrayToUint8Array(hash);
}

function ripemd160Hash(data: Uint8Array): Uint8Array {
  const wordArray = CryptoJS.lib.WordArray.create(data as unknown as number[]);
  const hash = CryptoJS.RIPEMD160(wordArray);
  return wordArrayToUint8Array(hash);
}

function wordArrayToUint8Array(wordArray: CryptoJS.lib.WordArray): Uint8Array {
  const words = wordArray.words;
  const sigBytes = wordArray.sigBytes;
  const u8 = new Uint8Array(sigBytes);
  for (let i = 0; i < sigBytes; i++) {
    u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  return u8;
}

// Polyfill Buffer para el navegador
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

// NetworkIds compatibles con PokeMetaX
export type NetworkId = 
  | 'ethereum'   // EVM - Ethereum + todas EVM
  | 'polygon'    // EVM - Polygon
  | 'arbitrum'   // EVM - Arbitrum
  | 'optimism'   // EVM - Optimism
  | 'base'       // EVM - Base
  | 'bsc'        // EVM - BNB Smart Chain
  | 'avalanche'  // EVM - Avalanche C-Chain
  | 'bitcoin'    // Bitcoin mainnet
  | 'solana';    // Solana

export type NetworkType = 'evm' | 'bitcoin' | 'solana';

export interface AccountData {
  privateKey: string;
  publicAddress: string;
}

// Formato compatible con PokeMetaX
export interface WalletAccounts {
  [networkId: string]: AccountData;
}

// Formato legacy para compatibilidad interna
export interface LegacyWalletAccounts {
  eth: AccountData;
  btc: AccountData;
}

export interface Wallet {
  mnemonic: string;
  accounts: WalletAccounts;
}

export interface EncryptedVault {
  encrypted: string;
  version: string;
  timestamp: string;
}

export type WordCount = 12 | 24;

// Genera mnemonic con alta entropía usando BIP-39
export async function generateMnemonic(wordCount: WordCount = 12): Promise<string> {
  // 128 bits = 12 palabras, 256 bits = 24 palabras
  const strength = wordCount === 24 ? 256 : 128;
  const mnemonic = bip39.generateMnemonic(strength);
  return mnemonic;
}

// Función sha256 para base58check
function sha256ForBase58(data: Uint8Array): Uint8Array {
  return sha256Hash(data);
}

// Convierte clave privada a formato WIF (Wallet Import Format)
function privateKeyToWIF(privateKey: Uint8Array): string {
  // Prefix 0x80 para mainnet
  const prefixed = new Uint8Array([0x80, ...privateKey, 0x01]); // 0x01 para compressed
  return base58check(sha256ForBase58).encode(prefixed);
}

// Genera dirección Bitcoin Native SegWit (bech32) desde clave pública comprimida
function publicKeyToBech32Address(publicKey: Uint8Array): string {
  // SHA256 -> RIPEMD160
  const sha256Result = sha256Hash(publicKey);
  const hash160 = ripemd160Hash(sha256Result);
  
  // Convertir a formato bech32 con witness version 0
  const words = bech32.toWords(hash160);
  const wordsWithVersion = [0, ...words]; // witness version 0
  return bech32.encode('bc', wordsWithVersion);
}

// SLIP-10 ed25519 key derivation (browser compatible)
// Implementación basada en SLIP-0010: https://github.com/satoshilabs/slips/blob/master/slip-0010.md
const ED25519_CURVE = 'ed25519 seed';
const HARDENED_OFFSET = 0x80000000;

interface Slip10Result {
  key: Uint8Array<ArrayBuffer>;
  chainCode: Uint8Array<ArrayBuffer>;
}

function slip10DeriveChild(parentKey: Uint8Array, parentChainCode: Uint8Array, index: number): Slip10Result {
  // Solo soportamos derivación hardened para ed25519
  if (index < HARDENED_OFFSET) {
    throw new Error('Ed25519 only supports hardened derivation');
  }
  
  const data = new Uint8Array(37);
  data[0] = 0x00;
  data.set(parentKey, 1);
  data[33] = (index >>> 24) & 0xff;
  data[34] = (index >>> 16) & 0xff;
  data[35] = (index >>> 8) & 0xff;
  data[36] = index & 0xff;
  
  const I = hmacSha512(parentChainCode, data);
  return {
    key: new Uint8Array(I.slice(0, 32)),
    chainCode: new Uint8Array(I.slice(32))
  };
}

function slip10DerivePath(path: string, seed: Uint8Array): Slip10Result {
  // Derivar master key
  const I = hmacSha512(new TextEncoder().encode(ED25519_CURVE), seed);
  let key: Uint8Array<ArrayBuffer> = new Uint8Array(I.slice(0, 32));
  let chainCode: Uint8Array<ArrayBuffer> = new Uint8Array(I.slice(32));
  
  // Parsear path (ej: "m/44'/501'/0'/0'")
  const segments = path.split('/').slice(1); // Quitar 'm'
  
  for (const segment of segments) {
    const hardened = segment.endsWith("'");
    const indexStr = hardened ? segment.slice(0, -1) : segment;
    const index = parseInt(indexStr, 10) + (hardened ? HARDENED_OFFSET : 0);
    
    const derived = slip10DeriveChild(key, chainCode, index);
    key = derived.key;
    chainCode = derived.chainCode;
  }
  
  return { key, chainCode };
}

// Deriva clave privada Solana usando SLIP-10 ed25519
async function deriveSolanaAccount(seed: Uint8Array): Promise<AccountData> {
  // Solana usa SLIP-10 con path m/44'/501'/0'/0'
  const solanaPath = "m/44'/501'/0'/0'";
  const { key } = slip10DerivePath(solanaPath, seed);
  
  // Derivar clave pública desde la privada usando ed25519
  const publicKey = await ed25519.getPublicKeyAsync(key);
  
  // La dirección de Solana es la clave pública codificada en base58
  const publicAddress = bs58.encode(publicKey);
  
  // La clave privada en Solana se representa como el keypair completo (64 bytes)
  const privateKeyBytes = new Uint8Array([...key, ...publicKey]);
  const privateKey = bs58.encode(privateKeyBytes);
  
  return {
    privateKey,
    publicAddress
  };
}

// Deriva cuentas desde el mnemonic - Formato compatible con PokeMetaX
export async function deriveAccounts(mnemonic: string): Promise<WalletAccounts> {
  // Derivar cuenta Ethereum usando ethers.js (usada para todas las EVM)
  const ethWallet = ethers.Wallet.fromPhrase(mnemonic);
  
  // Derivar seed desde mnemonic
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const masterKey = HDKey.fromMasterSeed(seed);
  
  // BIP84 path para Bitcoin Native SegWit (bc1q): m/84'/0'/0'/0/0
  const btcPath = "m/84'/0'/0'/0/0";
  const btcKey = masterKey.derive(btcPath);
  
  if (!btcKey.privateKey || !btcKey.publicKey) {
    throw new Error("Failed to derive BTC keys");
  }
  
  const btcPrivateKeyWIF = privateKeyToWIF(btcKey.privateKey);
  const btcAddress = publicKeyToBech32Address(btcKey.publicKey);
  
  // Derivar cuenta Solana usando SLIP-10 ed25519
  const solanaAccount = await deriveSolanaAccount(Buffer.from(seed));
  
  // Formato PokeMetaX: usar networkIds estándar
  // La misma clave EVM sirve para todas las redes EVM
  return {
    ethereum: {
      privateKey: ethWallet.privateKey,
      publicAddress: ethWallet.address
    },
    bitcoin: {
      privateKey: btcPrivateKeyWIF,
      publicAddress: btcAddress
    },
    solana: solanaAccount
  };
}

// Función helper para convertir formato legacy a nuevo formato
export function convertLegacyToNewFormat(legacy: LegacyWalletAccounts): WalletAccounts {
  return {
    ethereum: legacy.eth,
    bitcoin: legacy.btc
  };
}

// Función helper para convertir nuevo formato a legacy (compatibilidad interna)
export function convertNewToLegacyFormat(accounts: WalletAccounts): LegacyWalletAccounts {
  return {
    eth: accounts.ethereum || accounts.eth,
    btc: accounts.bitcoin || accounts.btc
  };
}

export async function generateWallet(wordCount: WordCount = 12): Promise<Wallet> {
  const mnemonic = await generateMnemonic(wordCount);
  const accounts = await deriveAccounts(mnemonic);
  return { mnemonic, accounts };
}

export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic);
}

// Cifrado AES-256 con contraseña
export function encryptVault(wallet: Wallet, password: string): EncryptedVault {
  const data = JSON.stringify({
    mnemonic: wallet.mnemonic,
    accounts: wallet.accounts
  });
  
  // AES-256 encryption con salt derivado de la contraseña
  const encrypted = CryptoJS.AES.encrypt(data, password, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString();
  
  return {
    encrypted,
    version: "1.0",
    timestamp: new Date().toISOString()
  };
}

// Descifrado AES-256 - Compatible con PokeMetaX
export function decryptVault(encryptedVault: EncryptedVault, password: string): Wallet | null {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedVault.encrypted, password, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedText) {
      return null;
    }
    
    const data = JSON.parse(decryptedText);
    
    if (!data.mnemonic || !data.accounts) {
      return null;
    }
    
    // Normalizar formato de accounts para compatibilidad PokeMetaX
    // Soporta tanto formato legacy (eth/btc) como nuevo (ethereum/bitcoin)
    const normalizedAccounts: WalletAccounts = {};
    
    // Mapear networkIds de PokeMetaX
    if (data.accounts.ethereum) {
      normalizedAccounts.ethereum = data.accounts.ethereum;
    } else if (data.accounts.eth) {
      normalizedAccounts.ethereum = data.accounts.eth;
    }
    
    if (data.accounts.bitcoin) {
      normalizedAccounts.bitcoin = data.accounts.bitcoin;
    } else if (data.accounts.btc) {
      normalizedAccounts.bitcoin = data.accounts.btc;
    }
    
    // Copiar cualquier otra red soportada por PokeMetaX
    const supportedNetworks = ['polygon', 'arbitrum', 'optimism', 'base', 'bsc', 'avalanche', 'solana'];
    for (const network of supportedNetworks) {
      if (data.accounts[network]) {
        normalizedAccounts[network] = data.accounts[network];
      }
    }
    
    return {
      mnemonic: data.mnemonic,
      accounts: normalizedAccounts
    };
  } catch (error) {
    return null;
  }
}
