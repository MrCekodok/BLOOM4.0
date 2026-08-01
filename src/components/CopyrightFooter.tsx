export default function CopyrightFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 pointer-events-auto select-none">
      <p className="text-[10px] sm:text-xs text-white/70 font-medium whitespace-nowrap">
        © {year}{" "}
        <a
          href="https://smkkunak.edu.my/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/90 hover:text-white underline underline-offset-2 transition-colors"
        >
          SMK Kunak
        </a>
      </p>
    </footer>
  );
}
