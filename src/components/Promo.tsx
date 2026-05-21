import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";

export default function Promo() {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10vh", "10vh"]);

  const startDate = new Date("2026-05-21");
  const today = new Date();
  const daysPassed = Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysLeft = Math.max(0, 90 - daysPassed);
  const progress = Math.min(100, Math.round((daysPassed / 90) * 100));

  const stats = [
    { value: `${daysPassed}`, label: "Дней позади" },
    { value: `${daysLeft}`, label: "Дней впереди" },
    { value: `${progress}%`, label: "Пройдено пути" },
    { value: "2", label: "Участника" },
  ];

  return (
    <div
      ref={container}
      className="relative flex items-center justify-center h-screen overflow-hidden"
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      <div className="fixed top-[-10vh] left-0 h-[120vh] w-full">
        <motion.div style={{ y }} className="relative w-full h-full">
          <img
            src="/images/spiral-circles.jpg"
            alt="Abstract spiral"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </motion.div>
      </div>

      <h3 className="absolute top-12 right-6 text-white uppercase z-10 text-sm md:text-base lg:text-lg opacity-70 tracking-widest">
        Статистика вызова
      </h3>

      <div className="relative z-10 grid grid-cols-2 gap-6 md:gap-10 px-6 max-w-2xl w-full">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-5xl md:text-7xl font-bold text-white leading-none mb-2">{s.value}</p>
            <p className="text-white/60 text-sm uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      <p className="absolute bottom-12 left-6 text-white/50 text-sm z-10">
        Стартовали 21 мая 2026 · Финиш 19 августа 2026
      </p>
    </div>
  );
}