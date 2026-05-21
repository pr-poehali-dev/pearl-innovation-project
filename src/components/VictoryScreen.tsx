import { motion } from "framer-motion";
import Confetti from "@/components/Confetti";

interface VictoryScreenProps {
  totalDays: number;
  cleanDays: Record<string, number>;
}

export default function VictoryScreen({ totalDays, cleanDays }: VictoryScreenProps) {
  return (
    <div className="fixed inset-0 z-50 bg-neutral-900 flex items-center justify-center overflow-hidden">
      <Confetti className="absolute inset-0 pointer-events-none z-0" />

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="text-8xl mb-6"
        >
          🏆
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-4"
        >
          90 ДНЕЙ!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="text-xl text-neutral-300 mb-10"
        >
          Ольга и Белла — вы прошли весь путь. Три месяца без сладкого — это не просто вызов, это победа над собой!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="grid grid-cols-2 gap-4 mb-10"
        >
          {Object.entries(cleanDays).map(([name, days]) => (
            <div key={name} className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-5">
              <p className="text-3xl font-bold text-white">{days}</p>
              <p className="text-neutral-400 text-sm mt-1">чистых дней</p>
              <p className="text-white font-semibold mt-2">{name}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="flex items-center justify-center gap-3 text-neutral-400 text-sm"
        >
          <span>🎯</span>
          <span>{totalDays} дней вызова завершены · 19 августа 2026</span>
        </motion.div>
      </div>
    </div>
  );
}