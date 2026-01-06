import { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Monitor, Smartphone } from "lucide-react";
import PopupMainView from "@/views/PopupMainView";
import PopupGenerateView from "@/views/PopupGenerateView";
import { useLanguage } from "@/contexts/LanguageContext";
import { WordCount } from "@/lib/model";

type PopupView = "main" | "generate";

const Index = () => {
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState<PopupView>("main");
  const [wordCount, setWordCount] = useState<WordCount>(12);

  const handleGenerate = (count: WordCount) => {
    setWordCount(count);
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
      {/* Simulated popup frame */}
      <div className="popup-frame animate-slide-up">
        {currentView === "main" && (
          <PopupMainView 
            onGenerate={handleGenerate}
            onImport={handleImport}
          />
        )}
        {currentView === "generate" && (
          <PopupGenerateView onBack={handleBack} initialWordCount={wordCount} />
        )}
      </div>
    </div>
  );
};

export default Index;