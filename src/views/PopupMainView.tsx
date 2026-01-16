import { Rocket, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PopupHeader from "@/components/extension/PopupHeader";
import GlobalControls from "@/components/extension/GlobalControls";
import { useLanguage } from "@/contexts/LanguageContext";
import { WordCount } from "@/lib/model";

interface PopupMainViewProps {
  onGenerate: (wordCount: WordCount) => void;
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
          {/* 12 words button */}
          <Button
            variant="generate"
            size="lg"
            className="w-full text-base"
            onClick={() => onGenerate(12)}
          >
            <Rocket className="w-5 h-5" />
            {t("main.generate12")}
          </Button>

          {/* 24 words button */}
          <Button
            variant="generate"
            size="lg"
            className="w-full text-base bg-primary/80 hover:bg-primary/90"
            onClick={() => onGenerate(24)}
          >
            <Rocket className="w-5 h-5" />
            {t("main.generate24")}
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
        <div className="text-center mt-3">
          <a 
            href="https://chromewebstore.google.com/detail/jfeggeoablgcjdpeadembmajifdagbce"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-3.952 6.848a11.955 11.955 0 0 0 9.298-4.509A11.99 11.99 0 0 0 24 12c0-.424-.021-.843-.063-1.257zM12 8.181a3.818 3.818 0 1 0 0 7.636 3.818 3.818 0 0 0 0-7.636z"/>
            </svg>
            {t("main.downloadExtension")}
          </a>
        </div>
        <p className="text-center mt-2 space-x-3">
          <Link 
            to="/privacy" 
            className="text-xs text-primary hover:text-primary/80 hover:underline transition-colors"
          >
            {t("main.privacyLink")}
          </Link>
          <a 
            href="https://ud.me/doctor.bitcoin" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-primary hover:text-primary/80 hover:underline transition-colors"
          >
            doctor.bitcoin
          </a>
        </p>
      </footer>
    </div>
  );
};

export default PopupMainView;