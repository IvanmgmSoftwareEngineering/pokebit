import { Rocket, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import PopupHeader from "@/components/extension/PopupHeader";

interface PopupMainViewProps {
  onGenerate: () => void;
  onImport: () => void;
}

const PopupMainView = ({ onGenerate, onImport }: PopupMainViewProps) => {
  return (
    <div className="flex flex-col h-full">
      <PopupHeader 
        title="PokeBit Wallet" 
        subtitle="Generador Seguro de Wallets" 
      />

      <main className="flex-1 px-5 pb-4">
        <div className="space-y-3">
          <Button
            variant="generate"
            size="lg"
            className="w-full text-base"
            onClick={onGenerate}
          >
            <Rocket className="w-5 h-5" />
            GENERAR NUEVA BÓVEDA
          </Button>

          <Button
            variant="import"
            size="lg"
            className="w-full text-base"
            onClick={onImport}
          >
            <FolderOpen className="w-5 h-5" />
            IMPORTAR BÓVEDA
          </Button>
        </div>

        {/* Security info */}
        <div className="mt-8 p-4 rounded-xl bg-secondary/30 border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            🛡️ Seguridad Local
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Todas las claves se generan localmente en tu dispositivo. 
            Nunca se envían a servidores externos.
          </p>
        </div>
      </main>

      <footer className="px-5 py-4 border-t border-border/50">
        <p className="text-center text-xs text-muted-foreground">
          PokeBit 2024 | Secure Wallet Generator
        </p>
      </footer>
    </div>
  );
};

export default PopupMainView;
