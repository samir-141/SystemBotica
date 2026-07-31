type Props = {
  compact?: boolean;
  dark?: boolean;
  showTagline?: boolean;
  className?: string;
};

/** Identidad visual reutilizable de Botica Marifarma. */
export default function MarifarmaBrand({ compact = false, dark = false, showTagline = false, className = "" }: Props) {
  const word = dark ? "text-white" : "text-slate-950";
  return (
    <div className={`flex items-center gap-2.5 ${className}`} aria-label="Botica Marifarma">
      <div className="marifarma-cross shrink-0" aria-hidden="true"><span>+</span></div>
      <div className="min-w-0 leading-none">
        <div className={`font-black uppercase tracking-[0.12em] ${compact ? "text-[9px]" : "text-xs"} ${dark ? "text-marifarma-gold" : "text-marifarma-green"}`}>Botica</div>
        <div className={`font-black italic tracking-[-0.065em] ${compact ? "text-lg" : "text-2xl"} ${word}`}>Marifarma</div>
        {showTagline && <p className={`mt-1 font-serif italic ${compact ? "text-[9px]" : "text-xs"} ${dark ? "text-marifarma-cream" : "text-marifarma-green"}`}>Tu salud va de la mano con tu doctora</p>}
      </div>
    </div>
  );
}
