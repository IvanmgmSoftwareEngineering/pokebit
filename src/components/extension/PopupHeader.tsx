import pokeBitIcon from "/extension/icons/icon128.png";

interface PopupHeaderProps {
  title: string;
  subtitle: string;
}

const PopupHeader = ({ title, subtitle }: PopupHeaderProps) => {
  return (
    <header className="text-center py-6 animate-fade-in">
      <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse-glow" />
        
        {/* Main icon */}
        <img 
          src={pokeBitIcon} 
          alt="PokeBit" 
          className="relative w-20 h-20 rounded-full drop-shadow-lg"
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
