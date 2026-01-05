import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  submessage?: string;
}

const LoadingSpinner = ({ 
  message = "Generando bóveda segura...", 
  submessage = "Creando entropía criptográfica" 
}: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <div className="relative">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl animate-pulse" />
        
        {/* Spinning loader */}
        <div className="relative w-20 h-20 rounded-full border-4 border-primary/20 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </div>
      
      <p className="mt-6 text-foreground font-medium">{message}</p>
      <p className="text-sm text-muted-foreground mt-1">{submessage}</p>
      
      {/* Progress dots */}
      <div className="flex gap-1 mt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner;
