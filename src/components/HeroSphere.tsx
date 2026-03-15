export default function HeroSphere() {
  return (
    <div className="w-full h-full absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative h-72 w-72 md:h-[26rem] md:w-[26rem] rounded-full border border-border bg-gradient-to-br from-card via-background to-muted shadow-2xl animate-pulse [animation-duration:4s]" />
      <div className="absolute h-56 w-56 md:h-80 md:w-80 rounded-full border border-border/70 bg-background/50 backdrop-blur-sm" />
      <div className="absolute h-80 w-80 md:h-[32rem] md:w-[32rem] rounded-full border border-accent/40 animate-ping [animation-duration:3s]" />
    </div>
  );
}
