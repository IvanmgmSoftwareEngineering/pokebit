import { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Monitor, Smartphone } from "lucide-react";
import PopupMainView from "@/views/PopupMainView";
import PopupGenerateView from "@/views/PopupGenerateView";
import { useLanguage } from "@/contexts/LanguageContext";

type PopupView = "main" | "generate";

const Index = () => {
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState<PopupView>("main");

  const handleGenerate = () => {
    setCurrentView("generate");
  };

  const handleImport = () => {
    window.open("/import", "_blank");
  };

  const handleBack = () => {
    setCurrentView("main");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex flex-col items-center justify-center p-6">
      {/* Demo info banner */}
      <div className="mb-6 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-4">
          <Monitor className="w-4 h-4" />
          {t("demo.badge")}
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t("demo.title")}
        </h1>
        <p className="text-muted-foreground max-w-md">
          {t("demo.subtitle")}
        </p>
      </div>

      {/* Simulated popup frame */}
      <div className="popup-frame animate-slide-up">
        {currentView === "main" && (
          <PopupMainView 
            onGenerate={handleGenerate}
            onImport={handleImport}
          />
        )}
        {currentView === "generate" && (
          <PopupGenerateView onBack={handleBack} />
        )}
      </div>

      {/* Navigation hint */}
      <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <span className="flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          {t("demo.popupSize")}
        </span>
        <span className="text-border">|</span>
        <Link to="/import" className="flex items-center gap-1 text-primary hover:underline">
          {t("demo.viewTab")}
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* MVC Architecture info */}
      <div className="mt-8 max-w-lg p-4 rounded-xl bg-card/50 border border-border/50 animate-fade-in" style={{ animationDelay: "0.5s" }}>
        <h3 className="text-sm font-semibold text-foreground mb-2">{t("demo.architecture")}</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li><strong className="text-foreground">{t("demo.model")}</strong> {t("demo.modelDesc")}</li>
          <li><strong className="text-foreground">{t("demo.views")}</strong> {t("demo.viewsDesc")}</li>
          <li><strong className="text-foreground">{t("demo.controller")}</strong> {t("demo.controllerDesc")}</li>
        </ul>
      </div>
    </div>
  );
};

export default Index;
