import { useLanguage } from "@/contexts/LanguageContext";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function getPasswordStrength(password: string): {
  level: 0 | 1 | 2 | 3;
  label: string;
} {
  if (!password) return { level: 0, label: "empty" };
  
  let score = 0;
  
  // Length checks
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  
  // Character variety
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  // Determine level
  if (score <= 2) return { level: 1, label: "weak" };
  if (score <= 4) return { level: 2, label: "medium" };
  return { level: 3, label: "strong" };
}

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const { t } = useLanguage();
  const { level, label } = getPasswordStrength(password);

  if (!password) return null;

  const colors = {
    1: "bg-destructive",
    2: "bg-warning",
    3: "bg-success",
  };

  const textColors = {
    1: "text-destructive",
    2: "text-warning",
    3: "text-success",
  };

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i <= level ? colors[level as 1 | 2 | 3] : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs ${textColors[level as 1 | 2 | 3]}`}>
        {t(`password.${label}`)}
      </p>
    </div>
  );
};

export default PasswordStrengthIndicator;