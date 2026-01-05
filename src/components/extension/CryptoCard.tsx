import { useState } from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CryptoCardProps {
  type: "eth" | "btc";
  privateKey: string;
  publicAddress: string;
  icon: string;
  name: string;
}

const CryptoCard = ({ type, privateKey, publicAddress, icon, name }: CryptoCardProps) => {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copied, setCopied] = useState<"priv" | "pub" | null>(null);

  const handleCopy = async (text: string, keyType: "priv" | "pub") => {
    await navigator.clipboard.writeText(text);
    setCopied(keyType);
    toast.success(`${keyType === "priv" ? "Clave privada" : "Dirección"} copiada`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className={`crypto-card ${type} animate-slide-up`} style={{ animationDelay: type === "eth" ? "0.1s" : "0.2s" }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <span className={`font-semibold ${type === "eth" ? "text-eth" : "text-btc"}`}>
          {name}
        </span>
      </div>

      {/* Private Key */}
      <div className="mb-3">
        <label className="text-xs text-muted-foreground mb-1 block">Clave Privada</label>
        <div className="flex items-center gap-2">
          <input
            type={showPrivateKey ? "text" : "password"}
            value={privateKey}
            readOnly
            className="key-display flex-1 text-foreground"
          />
          <Button
            variant="icon"
            size="icon"
            onClick={() => setShowPrivateKey(!showPrivateKey)}
          >
            {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button
            variant="icon"
            size="icon"
            onClick={() => handleCopy(privateKey, "priv")}
          >
            {copied === "priv" ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Public Address */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Dirección Pública</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={publicAddress}
            readOnly
            className="key-display flex-1 text-muted-foreground text-xs"
          />
          <Button
            variant="icon"
            size="icon"
            onClick={() => handleCopy(publicAddress, "pub")}
          >
            {copied === "pub" ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CryptoCard;
