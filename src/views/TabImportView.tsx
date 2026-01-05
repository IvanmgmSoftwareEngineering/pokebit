import { useState, useRef } from "react";
import { ArrowLeft, Upload, Eye, EyeOff, CheckCircle, AlertCircle, FileUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wallet } from "@/lib/model";
import SeedPhraseDisplay from "@/components/extension/SeedPhraseDisplay";
import CryptoCard from "@/components/extension/CryptoCard";
import GlobalControls from "@/components/extension/GlobalControls";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface TabImportViewProps {
  onBack: () => void;
}

const TabImportView = ({ onBack }: TabImportViewProps) => {
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError("");
    
    if (!file.name.endsWith('.json')) {
      setError(t("import.errorFormat"));
      toast.error(t("import.errorFormat"));
      return;
    }
    
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImport = async () => {
    setError("");
    
    if (!selectedFile) {
      setError(t("import.errorFile"));
      toast.error(t("import.errorFile"));
      return;
    }

    if (!password.trim()) {
      setError(t("import.errorPassword"));
      toast.error(t("import.errorPassword"));
      return;
    }

    if (password.length < 8) {
      setError(t("import.errorPasswordLength"));
      toast.error(t("import.errorPasswordLength"));
      return;
    }

    setLoading(true);
    
    try {
      const fileContent = await selectedFile.text();
      const data = JSON.parse(fileContent);
      
      // Validate file structure
      if (!data.mnemonic || !data.accounts?.eth || !data.accounts?.btc) {
        throw new Error("Invalid structure");
      }

      // Simulate password verification delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const importedWallet: Wallet = {
        mnemonic: data.mnemonic,
        accounts: data.accounts
      };
      
      setWallet(importedWallet);
      toast.success(t("import.success"));
    } catch (err) {
      setError(t("import.errorInvalid"));
      toast.error(t("import.errorInvalid"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-4">
        {/* Global Controls */}
        <GlobalControls />

        {/* Header */}
        <header className="text-center mb-10 mt-4">
          <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/50 flex items-center justify-center">
              <Upload className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t("import.title")}</h1>
          <p className="text-muted-foreground">
            {t("import.subtitle")}
          </p>
        </header>

        {!wallet ? (
          <div className="space-y-6 animate-fade-in">
            {/* File Drop Zone */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("import.fileLabel")}
              </label>
              
              {!selectedFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                    ${isDragOver 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }
                  `}
                >
                  <FileUp className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="text-foreground font-medium mb-1">
                    {t("import.dragHere")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("import.clickSelect")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("import.onlyJson")}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/30 rounded-xl">
                  <FileUp className="w-8 h-8 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={clearFile}
                    className="p-1 hover:bg-destructive/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("import.passwordLabel")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder={t("import.passwordPlaceholder")}
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
              disabled={loading || !selectedFile}
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  {t("import.importing")}
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  {t("import.importButton")}
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
                <p className="font-medium text-success">{t("import.success")}</p>
                <p className="text-sm text-muted-foreground">{t("import.successMsg")}</p>
              </div>
            </div>

            {/* Seed phrase */}
            <SeedPhraseDisplay seedPhrase={wallet.mnemonic} />

            {/* Derived accounts */}
            <h3 className="text-lg font-semibold text-foreground mt-6 mb-4 flex items-center gap-2">
              {t("generate.derivedAccounts")}
            </h3>

            <div className="space-y-4">
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
        )}

        {/* Back button */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <Button
            variant="ghost"
            className="w-full"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4" />
            {t("import.back")}
          </Button>
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center">
          <p className="text-sm text-muted-foreground">
            {t("main.footer")}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default TabImportView;
