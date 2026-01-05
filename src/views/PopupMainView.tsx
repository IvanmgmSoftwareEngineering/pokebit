import { Rocket, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import PopupHeader from "@/components/extension/PopupHeader";
import GlobalControls from "@/components/extension/GlobalControls";
import { useLanguage } from "@/contexts/LanguageContext";

interface PopupMainViewProps {
  onGenerate: () => void;
  onImport: () => void;
}

const PopupMainView = ({ onGenerate, onImport }: PopupMainViewProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-full">
      <GlobalControls />
      
      <PopupHeader 
        title={t("app.title")} 
        subtitle={t("app.subtitle")} 
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
            {t("main.generate")}
          </Button>

          <Button
            variant="import"
            size="lg"
            className="w-full text-base"
            onClick={onImport}
          >
            <FolderOpen className="w-5 h-5" />
            {t("main.import")}
          </Button>
        </div>

        {/* Security info */}
        <div className="mt-8 p-4 rounded-xl bg-secondary/30 border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            🛡️ {t("main.securityTitle")}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("main.securityText")}
          </p>
        </div>
      </main>

      <footer className="px-5 py-4 border-t border-border/50">
        <p className="text-center text-xs text-muted-foreground">
          {t("main.footer")}
        </p>
      </footer>
    </div>
  );
};

export default PopupMainView;
