import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DerivationInfoPopupProps {
  className?: string;
}

const DerivationInfoPopup = ({ className = "" }: DerivationInfoPopupProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`text-xs text-primary hover:text-primary/80 hover:underline transition-colors flex items-center gap-1 ${className}`}
      >
        <HelpCircle className="w-3 h-3" />
        {t("derivation.question")}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🔑 {t("derivation.title")}
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>{t("derivation.paragraph1")}</p>
            <p>{t("derivation.paragraph2")}</p>
            <p>{t("derivation.paragraph3")}</p>
            <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <p className="text-xs text-primary font-medium">
                🔗 {t("derivation.note")}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DerivationInfoPopup;
