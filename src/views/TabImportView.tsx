import { useState, useRef } from "react";
import { ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle, FileUp, X, RotateCcw, Download, HelpCircle } from "lucide-react";
import pokeBitLogo from "@/assets/pokebit-logo.png";
import { Button } from "@/components/ui/button";
import { Wallet, decryptVault, encryptVault, EncryptedVault } from "@/lib/model";
import SeedPhraseDisplay from "@/components/extension/SeedPhraseDisplay";
import CryptoCard from "@/components/extension/CryptoCard";
import GlobalControls from "@/components/extension/GlobalControls";
import PasswordStrengthIndicator from "@/components/extension/PasswordStrengthIndicator";
import ImportInfoPopup from "@/components/extension/ImportInfoPopup";
import DerivationInfoPopup from "@/components/extension/DerivationInfoPopup";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetFinal, setShowResetFinal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export with new password states
  const [exportPassword, setExportPassword] = useState("");
  const [exportConfirmPassword, setExportConfirmPassword] = useState("");
  const [showExportPassword, setShowExportPassword] = useState(false);
  const [exportError, setExportError] = useState("");

  const handleFileSelect = (file: File) => {
    setError("");
    
    if (!file.name.endsWith('.aes')) {
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
      const encryptedData: EncryptedVault = JSON.parse(fileContent);
      
      // Validate encrypted vault structure
      if (!encryptedData.encrypted || !encryptedData.version) {
        throw new Error("Invalid structure");
      }

      // Decrypt with AES-256
      const decryptedWallet = decryptVault(encryptedData, password);
      
      if (!decryptedWallet) {
        setError(t("import.errorInvalid"));
        toast.error(t("import.errorInvalid"));
        setLoading(false);
        return;
      }
      
      setWallet(decryptedWallet);
      toast.success(t("import.success"));
    } catch (err) {
      setError(t("import.errorInvalid"));
      toast.error(t("import.errorInvalid"));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const handleResetConfirm = () => {
    setShowResetConfirm(false);
    setShowResetFinal(true);
  };

  const handleResetFinal = () => {
    setShowResetFinal(false);
    setWallet(null);
    setPassword("");
    setSelectedFile(null);
    setError("");
    setExportPassword("");
    setExportConfirmPassword("");
    setExportError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success(t("import.resetSuccess"));
  };

  const handleExportWithNewPassword = () => {
    if (!wallet) return;
    
    setExportError("");

    if (!exportPassword.trim()) {
      setExportError(t("generate.errorPassword"));
      toast.error(t("generate.errorPassword"));
      return;
    }

    if (exportPassword.length < 8) {
      setExportError(t("generate.errorPasswordLength"));
      toast.error(t("generate.errorPasswordLength"));
      return;
    }

    if (!exportConfirmPassword.trim()) {
      setExportError(t("generate.errorConfirm"));
      toast.error(t("generate.errorConfirm"));
      return;
    }

    if (exportPassword !== exportConfirmPassword) {
      setExportError(t("generate.errorMatch"));
      toast.error(t("generate.errorMatch"));
      return;
    }

    // Encrypt with new password
    const encryptedData = encryptVault(wallet, exportPassword);
    
    const blob = new Blob([JSON.stringify(encryptedData, null, 2)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pokebit-vault-${Date.now()}.aes`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Clear export fields after successful export
    setExportPassword("");
    setExportConfirmPassword("");
    toast.success(t("generate.exported"));
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-full mx-auto px-4 py-4">
        {/* Global Controls */}
        <GlobalControls />

        {/* Header - compact for side panel */}
        <header className="text-center mb-6 mt-2">
          <div className="relative inline-flex items-center justify-center w-16 h-16 mb-3">
            <div className="absolute inset-1 rounded-full bg-primary/30 blur-lg animate-pulse" />
            <img 
              src={pokeBitLogo} 
              alt="PokeBit" 
              className="relative w-16 h-16 drop-shadow-xl"
            />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-1">{t("import.title")}</h1>
          <p className="text-sm text-muted-foreground">
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
                    {t("import.onlyAes")}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".aes"
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
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-foreground">
                  {t("import.passwordLabel")}
                </label>
                <ImportInfoPopup />
              </div>
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
                  <FileUp className="w-5 h-5" />
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
              <DerivationInfoPopup />
            </h3>

            <div className="space-y-4">
              <CryptoCard
                type="eth"
                icon="⧫"
                name="Ethereum (ETH)"
                privateKey={wallet.accounts.ethereum?.privateKey || wallet.accounts.eth?.privateKey}
                publicAddress={wallet.accounts.ethereum?.publicAddress || wallet.accounts.eth?.publicAddress}
              />
              
              <CryptoCard
                type="btc"
                icon="₿"
                name="Bitcoin (BTC)"
                privateKey={wallet.accounts.bitcoin?.privateKey || wallet.accounts.btc?.privateKey}
                publicAddress={wallet.accounts.bitcoin?.publicAddress || wallet.accounts.btc?.publicAddress}
              />

              {(wallet.accounts.solana?.privateKey || wallet.accounts.sol?.privateKey) && (
                <CryptoCard
                  type="sol"
                  icon="◎"
                  name="Solana (SOL)"
                  privateKey={wallet.accounts.solana?.privateKey || wallet.accounts.sol?.privateKey}
                  publicAddress={wallet.accounts.solana?.publicAddress || wallet.accounts.sol?.publicAddress}
                />
              )}
            </div>

            {/* Export with new password section */}
            <div className="mt-8 p-4 bg-secondary/30 border border-border/50 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Download className="w-4 h-4 text-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  {t("import.exportNewPassword")}
                </h3>
                <ImportInfoPopup />
              </div>
              
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showExportPassword ? "text" : "password"}
                    value={exportPassword}
                    onChange={(e) => { setExportPassword(e.target.value); setExportError(""); }}
                    placeholder={t("import.newPassword")}
                    className="w-full px-3 py-2 pr-10 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowExportPassword(!showExportPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showExportPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <PasswordStrengthIndicator password={exportPassword} />

                <input
                  type={showExportPassword ? "text" : "password"}
                  value={exportConfirmPassword}
                  onChange={(e) => { setExportConfirmPassword(e.target.value); setExportError(""); }}
                  placeholder={t("import.repeatNewPassword")}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />

                {exportError && (
                  <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-xs">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {exportError}
                  </div>
                )}

                <Button
                  variant="success"
                  className="w-full"
                  onClick={handleExportWithNewPassword}
                >
                  <Download className="w-4 h-4" />
                  {t("import.exportButton")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom button */}
        <div className="mt-8 pt-6 border-t border-border/50">
          {wallet ? (
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4" />
              {t("import.reset")}
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="w-full"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4" />
              {t("import.backMenu")}
            </Button>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center">
          <p className="text-xs text-muted-foreground">
            {t("main.footer")}
          </p>
        </footer>
      </div>

      {/* First Reset Confirmation Dialog */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              ⚠️ {t("import.resetTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("import.resetWarning1")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("import.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("import.continue")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Final Reset Confirmation Dialog */}
      <AlertDialog open={showResetFinal} onOpenChange={setShowResetFinal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              🚨 {t("import.resetFinalTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("import.resetWarning2")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("import.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetFinal}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("import.confirmReset")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TabImportView;
