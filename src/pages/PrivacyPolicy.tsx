import { forwardRef } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import GlobalControls from "@/components/extension/GlobalControls";

const PrivacyPolicy = forwardRef<HTMLDivElement>((_, ref) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const getLocale = () => {
    const locales: Record<string, string> = {
      en: "en-US",
      es: "es-ES",
      zh: "zh-CN",
      hi: "hi-IN",
      ru: "ru-RU",
    };
    return locales[language] || "en-US";
  };

  const renderList = (key: string) => {
    const items = t(key).split("|");
    return (
      <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  };

  return (
    <div ref={ref} className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header with controls */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("privacy.back")}
            </Button>
            <GlobalControls />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("privacy.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("privacy.subtitle")}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("privacy.lastUpdated")} {new Date().toLocaleDateString(getLocale(), { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>

        {/* Content */}
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t("privacy.section1.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("privacy.section1.text")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t("privacy.section2.title")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              {t("privacy.section2.text")}
            </p>
            {renderList("privacy.section2.items")}
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t("privacy.section3.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("privacy.section3.text")}
            </p>
            <div className="mt-3">
              {renderList("privacy.section3.items")}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t("privacy.section4.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("privacy.section4.text")}
            </p>
            <div className="mt-3">
              {renderList("privacy.section4.items")}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t("privacy.section5.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("privacy.section5.text")}
            </p>
            <div className="mt-3">
              {renderList("privacy.section5.items")}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t("privacy.section6.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("privacy.section6.text")}
            </p>
            <div className="mt-3">
              {renderList("privacy.section6.items")}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t("privacy.section7.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("privacy.section7.text")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t("privacy.section8.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("privacy.section8.text")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t("privacy.section9.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("privacy.section9.text")}
            </p>
            <p className="text-primary font-medium mt-2">
              joamgm88@gmail.com
            </p>
          </section>

          <section className="mt-8 p-4 bg-primary/10 border border-primary/30 rounded-xl">
            <p className="text-sm text-primary font-medium">
              🔐 <strong>{t("privacy.summary")}</strong>
            </p>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground">
            {t("privacy.footer")}
          </p>
        </footer>
      </div>
    </div>
  );
});

PrivacyPolicy.displayName = "PrivacyPolicy";

export default PrivacyPolicy;
