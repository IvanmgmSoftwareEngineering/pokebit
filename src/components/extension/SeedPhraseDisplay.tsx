import { useState } from "react";
import { Copy, Check, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import Bip39InfoPopup from "./Bip39InfoPopup";

interface SeedPhraseDisplayProps {
  seedPhrase: string;
}

const SeedPhraseDisplay = ({ seedPhrase }: SeedPhraseDisplayProps) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  const words = seedPhrase.split(" ");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(seedPhrase);
    setCopied(true);
    toast.success(t("seedPhrase.copied"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-slide-up" style={{ animationDelay: "0.05s" }}>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          {t("seedPhrase.title")}
        </label>
        <div className="flex items-center gap-2">
          <Bip39InfoPopup />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVisible(!visible)}
            className="text-xs"
          >
            {visible ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
          </Button>
        </div>
      </div>

      <div className="bg-input/30 rounded-xl p-4 border border-border/50 mb-3">
        {visible ? (
          <div className="grid grid-cols-3 gap-2">
            {words.map((word, index) => (
              <div
                key={index}
                className="bg-secondary/50 rounded-lg px-2 py-1.5 text-center"
              >
                <span className="text-xs text-muted-foreground mr-1">{index + 1}.</span>
                <span className="font-mono text-sm text-foreground">{word}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <span className="text-sm">••••••••••••••••••••••••</span>
          </div>
        )}
      </div>

      <Button
        variant="copy"
        className="w-full"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="w-4 h-4" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>

      <p className="mt-3 text-xs text-warning/80 leading-relaxed text-center">
        ⚠️ {t("seedPhrase.warning")}
      </p>
    </div>
  );
};

export default SeedPhraseDisplay;
