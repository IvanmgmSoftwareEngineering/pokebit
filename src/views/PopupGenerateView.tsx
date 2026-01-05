import { useState, useEffect } from "react";
import { ArrowLeft, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import PopupHeader from "@/components/extension/PopupHeader";
import SeedPhraseDisplay from "@/components/extension/SeedPhraseDisplay";
import CryptoCard from "@/components/extension/CryptoCard";
import LoadingSpinner from "@/components/extension/LoadingSpinner";
import { generateWallet, Wallet } from "@/lib/model";
import { toast } from "sonner";

interface PopupGenerateViewProps {
  onBack: () => void;
}

const PopupGenerateView = ({ onBack }: PopupGenerateViewProps) => {
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    generateNewWallet();
  }, []);

  const generateNewWallet = async () => {
    setLoading(true);
    // Simular tiempo de generación para UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newWallet = await generateWallet();
    setWallet(newWallet);
    setLoading(false);
    toast.success("Bóveda generada exitosamente");
  };

  const handleExport = () => {
    if (!wallet) return;
    
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
    toast.success("Archivo exportado correctamente");
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <PopupHeader 
          title="PokeBit Generator" 
          subtitle="Generador de Alta Entropía" 
        />
        <div className="flex-1 flex items-center justify-center px-5">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PopupHeader 
        title="🔐 Bóveda Generada" 
        subtitle="Tu frase semilla y claves derivadas" 
      />

      <main className="flex-1 px-5 pb-4 overflow-y-auto">
        {wallet && (
          <>
            <SeedPhraseDisplay seedPhrase={wallet.mnemonic} />

            <div className="mt-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                🛡️ Cuentas Derivadas
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

            {/* Action buttons */}
            <div className="mt-5 space-y-2">
              <Button
                variant="success"
                className="w-full"
                onClick={handleExport}
              >
                <Download className="w-4 h-4" />
                Exportar Bóveda
              </Button>
              
              <Button
                variant="secondary"
                className="w-full"
                onClick={generateNewWallet}
              >
                <RefreshCw className="w-4 h-4" />
                Generar Nueva
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
          Volver al Inicio
        </Button>
      </footer>
    </div>
  );
};

export default PopupGenerateView;
