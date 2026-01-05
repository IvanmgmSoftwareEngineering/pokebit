import { useState, useEffect } from "react";
import { ArrowLeft, Download, RefreshCw, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import PopupHeader from "@/components/extension/PopupHeader";
import GlobalControls from "@/components/extension/GlobalControls";
import SeedPhraseDisplay from "@/components/extension/SeedPhraseDisplay";
import CryptoCard from "@/components/extension/CryptoCard";
import LoadingSpinner from "@/components/extension/LoadingSpinner";
import { generateWallet, Wallet } from "@/lib/model";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface PopupGenerateViewProps {
  onBack: () => void;
}

const PopupGenerateView = ({ onBack }: PopupGenerateViewProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    generateNewWallet();
  }, []);

  const generateNewWallet = async () => {
    setLoading(true);
    setPassword("");
    setConfirmPassword("");
    setPasswordError("");
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newWallet = await generateWallet();
    setWallet(newWallet);
    setLoading(false);
    toast.success(t("generate.success"));
  };

  const validatePasswords = (): boolean => {
    if (!password.trim()) {
      setPasswordError(t("generate.errorPassword"));
      return false;
    }
    if (password.length < 8) {
      setPasswordError(t("generate.errorPasswordLength"));
      return false;
    }
    if (!confirmPassword.trim()) {
      setPasswordError(t("generate.errorConfirm"));
      return false;
    }
    if (password !== confirmPassword) {
      setPasswordError(t("generate.errorMatch"));
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleExport = () => {
    if (!wallet) return;
    
    if (!validatePasswords()) {
      toast.error(passwordError || t("generate.errorPassword"));
      return;
    }
    
    const data = JSON.stringify({
      mnemonic: wallet.mnemonic,
      accounts: wallet.accounts,
      exportedAt: new Date().toISOString()
    }, null, 2);
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pokebit-wallet-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("generate.exported"));
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <GlobalControls />
        <PopupHeader 
          title={t("generate.loading")} 
          subtitle={t("generate.loadingMsg")} 
        />
        <div className="flex-1 flex items-center justify-center px-5">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <GlobalControls />
      <PopupHeader 
        title={t("generate.title")} 
        subtitle={t("generate.subtitle")} 
      />

      <main className="flex-1 px-5 pb-4 overflow-y-auto">
        {wallet && (
          <>
            <SeedPhraseDisplay seedPhrase={wallet.mnemonic} />

            <div className="mt-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                {t("generate.derivedAccounts")}
              </h3>
              
              <div className="space-y-3">
                <CryptoCard
                  type="eth"
                  icon="⧫"
                  name="Ethereum (ETH)"
                  privateKey={wallet.accounts.eth.privateKey}
                  publicAddress={wallet.accounts.eth.publicAddress}
                />
                
                <CryptoCard
                  type="btc"
                  icon="₿"
                  name="Bitcoin (BTC)"
                  privateKey={wallet.accounts.btc.privateKey}
                  publicAddress={wallet.accounts.btc.publicAddress}
                />
              </div>
            </div>

            {/* Password fields */}
            <div className="mt-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                {t("generate.protectVault")}
              </h3>
              
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                  placeholder={t("generate.passwordPlaceholder")}
                  className="w-full px-3 py-2 pr-10 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(""); }}
                placeholder={t("generate.repeatPassword")}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />

              {passwordError && (
                <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-xs">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  {passwordError}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-4 space-y-2">
              <Button
                variant="success"
                className="w-full"
                onClick={handleExport}
              >
                <Download className="w-4 h-4" />
                {t("generate.exportVault")}
              </Button>
              
              <Button
                variant="secondary"
                className="w-full"
                onClick={generateNewWallet}
              >
                <RefreshCw className="w-4 h-4" />
                {t("generate.generateNew")}
              </Button>
            </div>
          </>
        )}
      </main>

      <footer className="px-5 py-3 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
          {t("generate.back")}
        </Button>
      </footer>
    </div>
  );
};

export default PopupGenerateView;
