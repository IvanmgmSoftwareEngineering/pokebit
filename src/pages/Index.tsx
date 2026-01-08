import { useState } from "react";
import PopupMainView from "@/views/PopupMainView";
import PopupGenerateView from "@/views/PopupGenerateView";
import TabImportView from "@/views/TabImportView";
import { WordCount } from "@/lib/model";

type PopupView = "main" | "generate" | "import";

const Index = () => {
  const [currentView, setCurrentView] = useState<PopupView>("main");
  const [wordCount, setWordCount] = useState<WordCount>(12);

  const handleGenerate = (count: WordCount) => {
    setWordCount(count);
    setCurrentView("generate");
  };

  const handleImport = () => {
    setCurrentView("import");
  };

  const handleBack = () => {
    setCurrentView("main");
  };

  return (
    <div className="popup-frame">
      {currentView === "main" && (
        <PopupMainView 
          onGenerate={handleGenerate}
          onImport={handleImport}
        />
      )}
      {currentView === "generate" && (
        <PopupGenerateView onBack={handleBack} initialWordCount={wordCount} />
      )}
      {currentView === "import" && (
        <TabImportView onBack={handleBack} />
      )}
    </div>
  );
};

export default Index;