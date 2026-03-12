export default function FooterSection() {
  return (
    <footer className="border-t border-border px-6 md:px-12 py-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="font-display text-2xl uppercase tracking-tight">COLLA</div>
        <div className="flex gap-8 text-sm text-muted-foreground font-body">
          <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
          <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
          <a href="#" className="hover:text-foreground transition-colors">Discord</a>
          <a href="#" className="hover:text-foreground transition-colors">Docs</a>
        </div>
        <p className="text-xs text-muted-foreground font-body">© 2026 Colla. All rights reserved.</p>
      </div>
    </footer>
  );
}
