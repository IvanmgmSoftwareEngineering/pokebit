import { useState } from "react";
import { ArrowLeft, Upload, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deriveAccounts, validateMnemonic, WalletAccounts } from "@/lib/model";
import CryptoCard from "@/components/extension/CryptoCard";
import { toast } from "sonner";

interface TabImportViewProps {
  onBack: () => void;
}

const TabImportView = ({ onBack }: TabImportViewProps) => {
  const [mnemonic, setMnemonic] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accounts, setAccounts] = useState<WalletAccounts | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImport = async () => {
    setError("");
    
    if (!validateMnemonic(mnemonic)) {
      setError("La frase semilla debe tener 12 o 24 palabras válidas");
      toast.error("Frase semilla inválida");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      toast.error("Contraseña muy corta");
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const derivedAccounts = await deriveAccounts(mnemonic);
    setAccounts(derivedAccounts);
    setLoading(false);
    toast.success("Bóveda importada exitosamente");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/50 flex items-center justify-center">
              <Upload className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Importar Bóveda</h1>
          <p className="text-muted-foreground">
            Restaura tu wallet con tu frase de recuperación
          </p>
        </header>

        {!accounts ? (
          <div className="space-y-6 animate-fade-in">
            {/* Mnemonic Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                📝 Frase de Recuperación (12 o 24 palabras)
              </label>
              <textarea
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                placeholder="Ingresa tu frase semilla separada por espacios..."
                className="w-full h-32 px-4 py-3 bg-input border border-border rounded-xl font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                🔒 Contraseña de Cifrado
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres..."
                  className="w-full px-4 py-3 pr-12 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                🔒 Confirmar Contraseña
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña..."
                className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Import Button */}
            <Button
              variant="generate"
              size="lg"
              className="w-full text-base"
              onClick={handleImport}
              disabled={loading || !mnemonic.trim()}
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  IMPORTAR BÓVEDA
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="animate-slide-up">
            {/* Success message */}
            <div className="flex items-center gap-3 p-4 mb-6 bg-success/10 border border-success/30 rounded-xl">
              <CheckCircle className="w-6 h-6 text-success" />
              <div>
                <p className="font-medium text-success">Bóveda importada correctamente</p>
                <p className="text-sm text-muted-foreground">Tus cuentas han sido restauradas</p>
              </div>
            </div>

            {/* Derived accounts */}
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              🛡️ Cuentas Derivadas
            </h3>

            <div className="space-y-4">
              <CryptoCard
                type="eth"
                icon="⧫"
                name="Ethereum (ETH)"
                privateKey={accounts.eth.privateKey}
                publicAddress={accounts.eth.publicAddress}
              />
              
              <CryptoCard
                type="btc"
                icon="₿"
                name="Bitcoin (BTC)"
                privateKey={accounts.btc.privateKey}
                publicAddress={accounts.btc.publicAddress}
              />
            </div>
          </div>
        )}

        {/* Back button */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <Button
            variant="ghost"
            className="w-full"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Popup
          </Button>
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center">
          <p className="text-sm text-muted-foreground">
            PokeBit 2024 | Secure Wallet Generator
          </p>
        </footer>
      </div>
    </div>
  );
};

export default TabImportView;
