// Modelo - Lógica de negocio para la wallet

const wordlist = [
  "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse",
  "access", "accident", "account", "accuse", "achieve", "acid", "acoustic", "acquire", "across", "act",
  "action", "actor", "actress", "actual", "adapt", "add", "addict", "address", "adjust", "admit",
  "adult", "advance", "advice", "aerobic", "affair", "afford", "afraid", "again", "age", "agent",
  "agree", "ahead", "aim", "air", "airport", "aisle", "alarm", "album", "alcohol", "alert",
  "alien", "all", "alley", "allow", "almost", "alone", "alpha", "already", "also", "alter",
  "always", "amateur", "amazing", "among", "amount", "amused", "analyst", "anchor", "ancient", "anger",
  "angle", "angry", "animal", "ankle", "announce", "annual", "another", "answer", "antenna", "antique"
];

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

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function generateMnemonic(): Promise<string> {
  const words: string[] = [];
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * wordlist.length);
    words.push(wordlist[randomIndex]);
  }
  return words.join(' ');
}

export async function deriveAccounts(mnemonic: string): Promise<WalletAccounts> {
  const hash = await sha256(mnemonic);
  const hash2 = await sha256(hash + "btc");
  
  return {
    eth: {
      privateKey: "0x" + hash.substring(0, 64),
      publicAddress: "0x" + hash.substring(0, 40)
    },
    btc: {
      privateKey: "L" + hash2.substring(0, 51),
      publicAddress: "bc1q" + hash2.substring(0, 38)
    }
  };
}

export async function generateWallet(): Promise<Wallet> {
  const mnemonic = await generateMnemonic();
  const accounts = await deriveAccounts(mnemonic);
  return { mnemonic, accounts };
}

export function validateMnemonic(mnemonic: string): boolean {
  const words = mnemonic.trim().toLowerCase().split(/\s+/);
  if (words.length !== 12 && words.length !== 24) {
    return false;
  }
  // En producción real, validarías contra el wordlist BIP-39 completo
  return words.every(word => word.length >= 3);
}
