import pokeBitLogo from "@/assets/pokebit-logo.png";

interface PopupHeaderProps {
  title: string;
  subtitle: string;
}

const PopupHeader = ({ title, subtitle }: PopupHeaderProps) => {
  return (
    <header className="text-center py-6 animate-fade-in">
      <div className="relative inline-flex items-center justify-center w-28 h-28 mb-4">
        {/* Glow effect */}
        <div className="absolute inset-2 rounded-full bg-primary/30 blur-xl animate-pulse-glow" />
        
        {/* Main icon - larger, no background */}
        <img 
          src={pokeBitLogo} 
          alt="PokeBit" 
          className="relative w-28 h-28 drop-shadow-2xl"
        />
      </div>
      
      <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
        {title}
      </h1>
      <p className="text-sm text-muted-foreground">
        {subtitle}
      </p>
    </header>
  );
};

export default PopupHeader;
