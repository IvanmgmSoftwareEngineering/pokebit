// Modelo - Lógica de negocio para la wallet
import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import CryptoJS from 'crypto-js';

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

// Deriva cuentas ETH y BTC desde el mnemonic
export async function deriveAccounts(mnemonic: string): Promise<WalletAccounts> {
  // Derivar cuenta Ethereum usando ethers.js
  const ethWallet = ethers.Wallet.fromPhrase(mnemonic);
  
  // Para Bitcoin, usamos una derivación simplificada basada en el seed
  // En producción real usarías bitcoinjs-lib con paths BIP44
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const seedHex = Buffer.from(seed).toString('hex');
  
  // Generar claves BTC usando hash del seed (simplificado)
  // En producción: usar derivación BIP44 m/44'/0'/0'/0/0
  const btcPrivateKeyHex = seedHex.substring(0, 64);
  const btcAddressHash = seedHex.substring(64, 104);
  
  return {
    eth: {
      privateKey: ethWallet.privateKey,
      publicAddress: ethWallet.address
    },
    btc: {
      privateKey: `L${btcPrivateKeyHex.substring(0, 51)}`,
      publicAddress: `bc1q${btcAddressHash.substring(0, 38)}`
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
