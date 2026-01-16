# PokeBit Vault Format (.aes)

Technical documentation for the encrypted vault format used by PokeBit and compatible with PokeMetaX.

## Overview

PokeBit uses AES-256-CBC encryption to secure wallet data. The exported `.aes` files are JSON documents containing the encrypted payload and metadata.

## File Structure

```json
{
  "encrypted": "U2FsdGVkX1+...",
  "version": "1.0",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `encrypted` | string | Base64-encoded AES-256-CBC ciphertext (CryptoJS format with embedded salt) |
| `version` | string | Format version for future compatibility |
| `timestamp` | string | ISO 8601 timestamp of encryption |

## Decrypted Payload Structure

After decryption, the JSON payload contains:

```json
{
  "mnemonic": "word1 word2 word3 ... word12",
  "accounts": {
    "ethereum": {
      "privateKey": "0x...",
      "publicAddress": "0x..."
    },
    "bitcoin": {
      "privateKey": "KwDiBf...",
      "publicAddress": "bc1q..."
    },
    "solana": {
      "privateKey": "base58_encoded_keypair...",
      "publicAddress": "base58_encoded_pubkey..."
    }
  }
}
```

## Network IDs (Compatible with PokeMetaX)

| networkId | Type | Description |
|-----------|------|-------------|
| `ethereum` | evm | Ethereum + all EVM chains |
| `polygon` | evm | Polygon |
| `arbitrum` | evm | Arbitrum |
| `optimism` | evm | Optimism |
| `base` | evm | Base |
| `bsc` | evm | BNB Smart Chain |
| `avalanche` | evm | Avalanche C-Chain |
| `bitcoin` | bitcoin | Bitcoin mainnet |
| `solana` | solana | Solana |

> **Note:** All EVM networks share the same private key derived from the mnemonic. PokeBit generates `ethereum`, `bitcoin`, and `solana` accounts.

## Account Data Structure

```typescript
interface AccountData {
  privateKey: string;   // Hex (0x...) for EVM, WIF for Bitcoin, base58 keypair for Solana
  publicAddress: string; // Checksummed for EVM, bech32 for Bitcoin, base58 for Solana
}

interface WalletAccounts {
  [networkId: string]: AccountData;
}
```

## Derivation Paths

| Network | Standard | Path | Address Format |
|---------|----------|------|----------------|
| Ethereum (EVM) | BIP-44 | `m/44'/60'/0'/0/0` | 0x... (checksummed) |
| Bitcoin | BIP-84 | `m/84'/0'/0'/0/0` | bc1q... (Native SegWit) |
| Solana | SLIP-10 | `m/44'/501'/0'/0'` | base58 (ed25519 pubkey) |

### Solana Key Format

Solana uses ed25519 keys derived via SLIP-10 (not BIP-32). The key formats are:

- **Private Key**: 64-byte keypair (32-byte seed + 32-byte public key) encoded in base58
- **Public Address**: 32-byte ed25519 public key encoded in base58

## Encryption Details

- **Algorithm:** AES-256-CBC
- **Padding:** PKCS7
- **Key Derivation:** CryptoJS default (OpenSSL-compatible with embedded salt)
- **Library:** [crypto-js](https://www.npmjs.com/package/crypto-js)

## Code Examples

### Decryption (JavaScript/TypeScript)

```javascript
import CryptoJS from 'crypto-js';

function decryptVault(aesFileContent, password) {
  const vault = JSON.parse(aesFileContent);
  
  const decrypted = CryptoJS.AES.decrypt(vault.encrypted, password, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString(CryptoJS.enc.Utf8);
  
  if (!decrypted) {
    throw new Error('Invalid password or corrupted file');
  }
  
  return JSON.parse(decrypted);
}

// Usage
const fileContent = fs.readFileSync('wallet.aes', 'utf8');
const wallet = decryptVault(fileContent, 'your-password');

console.log(wallet.mnemonic);
console.log(wallet.accounts.ethereum.publicAddress);
console.log(wallet.accounts.bitcoin.publicAddress);
```

### Encryption (JavaScript/TypeScript)

```javascript
import CryptoJS from 'crypto-js';

function encryptVault(wallet, password) {
  const data = JSON.stringify({
    mnemonic: wallet.mnemonic,
    accounts: wallet.accounts
  });
  
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

// Usage
const vault = encryptVault(wallet, 'strong-password');
fs.writeFileSync('wallet.aes', JSON.stringify(vault, null, 2));
```

### Decryption (Python)

```python
import json
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
import base64
import hashlib

def decrypt_cryptojs(encrypted_b64: str, password: str) -> str:
    """Decrypt CryptoJS AES-256-CBC encrypted data."""
    data = base64.b64decode(encrypted_b64)
    
    # CryptoJS format: "Salted__" + 8-byte salt + ciphertext
    assert data[:8] == b'Salted__', "Invalid CryptoJS format"
    salt = data[8:16]
    ciphertext = data[16:]
    
    # Derive key and IV using OpenSSL EVP_BytesToKey
    def evp_bytes_to_key(password, salt, key_len=32, iv_len=16):
        dtot = b''
        d = b''
        while len(dtot) < key_len + iv_len:
            d = hashlib.md5(d + password.encode() + salt).digest()
            dtot += d
        return dtot[:key_len], dtot[key_len:key_len+iv_len]
    
    key, iv = evp_bytes_to_key(password, salt)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    
    # Decrypt and remove PKCS7 padding
    decrypted = cipher.decrypt(ciphertext)
    pad_len = decrypted[-1]
    return decrypted[:-pad_len].decode('utf-8')

def decrypt_vault(aes_file_path: str, password: str) -> dict:
    with open(aes_file_path, 'r') as f:
        vault = json.load(f)
    
    decrypted = decrypt_cryptojs(vault['encrypted'], password)
    return json.loads(decrypted)

# Usage
wallet = decrypt_vault('wallet.aes', 'your-password')
print(wallet['mnemonic'])
print(wallet['accounts']['ethereum']['publicAddress'])
```

## Legacy Format Support

For backwards compatibility, PokeBit also accepts the legacy format when importing:

```json
{
  "mnemonic": "...",
  "accounts": {
    "eth": { "privateKey": "...", "publicAddress": "..." },
    "btc": { "privateKey": "...", "publicAddress": "..." },
    "sol": { "privateKey": "...", "publicAddress": "..." }
  }
}
```

### Alias Mapping

| Legacy Key | Normalized Key |
|------------|----------------|
| `eth` | `ethereum` |
| `btc` | `bitcoin` |
| `sol` | `solana` |

The legacy keys are automatically mapped to their full network IDs on import.

## Security Considerations

1. **Password Strength:** Use a strong password (minimum 8 characters, recommended 12+)
2. **Mnemonic Security:** The seed phrase can derive ALL accounts - protect it carefully
3. **File Storage:** Store `.aes` files in secure locations with proper backups
4. **Memory Safety:** Clear sensitive data from memory after use

## Compatibility

- ✅ **PokeBit** (this app) - Generates ethereum, bitcoin, solana
- ✅ **PokeMetaX** (advanced wallet) - Full network support
- ✅ Any app implementing CryptoJS AES-256-CBC with this format

### Cross-App Import/Export

Files exported from PokeBit can be imported into PokeMetaX and vice versa. Both apps:
- Use the same encryption (AES-256-CBC with CryptoJS)
- Use the same network IDs (ethereum, bitcoin, solana, etc.)
- Support legacy format aliases (eth, btc, sol)

## Version History

| Version | Changes |
|---------|---------|
| 1.0 | Initial format with ethereum/bitcoin support |
| 1.1 | Added Solana support (SLIP-10 ed25519) |

---

**Questions?** Open an issue or contact the development team.
