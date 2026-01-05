// Modelo - Lógica de negocio para la wallet
import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import CryptoJS from 'crypto-js';
import { HDKey } from '@scure/bip32';
import { base58check } from '@scure/base';

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

export interface WalletAccounts {
  eth: {
    privateKey: string;
    publicAddress: string;
  };
  btc: {
    privateKey: string;
    publicAddress: string;
  };
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

// Genera dirección Bitcoin desde clave pública comprimida
function publicKeyToAddress(publicKey: Uint8Array): string {
  // SHA256 -> RIPEMD160
  const sha256Result = sha256Hash(publicKey);
  const hash160 = ripemd160Hash(sha256Result);
  
  // Prefix 0x00 para mainnet P2PKH
  const prefixed = new Uint8Array([0x00, ...hash160]);
  return base58check(sha256ForBase58).encode(prefixed);
}

// Deriva cuentas ETH y BTC desde el mnemonic usando BIP44
export async function deriveAccounts(mnemonic: string): Promise<WalletAccounts> {
  // Derivar cuenta Ethereum usando ethers.js
  const ethWallet = ethers.Wallet.fromPhrase(mnemonic);
  
  // Derivar cuenta Bitcoin usando BIP44 path: m/44'/0'/0'/0/0
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const masterKey = HDKey.fromMasterSeed(seed);
  
  // BIP44 path para Bitcoin mainnet: m/44'/0'/0'/0/0
  const btcPath = "m/44'/0'/0'/0/0";
  const btcKey = masterKey.derive(btcPath);
  
  if (!btcKey.privateKey || !btcKey.publicKey) {
    throw new Error("Failed to derive BTC keys");
  }
  
  const btcPrivateKeyWIF = privateKeyToWIF(btcKey.privateKey);
  const btcAddress = publicKeyToAddress(btcKey.publicKey);
  
  return {
    eth: {
      privateKey: ethWallet.privateKey,
      publicAddress: ethWallet.address
    },
    btc: {
      privateKey: btcPrivateKeyWIF,
      publicAddress: btcAddress
    }
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

// Descifrado AES-256
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
    
    return {
      mnemonic: data.mnemonic,
      accounts: data.accounts
    };
  } catch (error) {
    return null;
  }
}
