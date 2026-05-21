interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const startDate = new Date("2026-05-21");
  const today = new Date();
  const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, 90 - daysPassed);

  return (
    <header className={`absolute top-0 left-0 right-0 z-10 p-6 ${className ?? ""}`}>
      <div className="flex justify-between items-center">
        <div className="text-white text-sm uppercase tracking-wide font-bold">🍭 NO SUGAR</div>
        <nav className="flex gap-6 items-center">
          <span className="text-white text-sm uppercase tracking-wide opacity-80">
            День {Math.max(0, daysPassed + 1)} из 90
          </span>
          <span className="text-white bg-white/20 backdrop-blur-sm px-3 py-1 text-sm rounded-full">
            Осталось: {daysLeft} дн.
          </span>
        </nav>
      </div>
    </header>
  );
}
