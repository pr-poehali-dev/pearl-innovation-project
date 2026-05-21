import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/93dcd3bd-2a80-46e5-88e3-a0a07efc3fa2";

const PARTICIPANTS = [
  { id: "olga", name: "Ольга", emoji: "🧑" },
  { id: "bella", name: "Белла", emoji: "👩" },
];

const SWEETS = [
  "🍫 Шоколад",
  "🍬 Конфеты",
  "🍰 Торт / пирожное",
  "🧁 Кекс / маффин",
  "🍪 Печенье",
  "🍦 Мороженое",
  "🥤 Сладкий напиток",
  "🍩 Пончик",
];

const getTodayKey = () => new Date().toISOString().split("T")[0];

type Checks = Record<string, Record<string, boolean>>;

export default function Featured() {
  const [checks, setChecks] = useState<Checks>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const today = getTodayKey();

  const fetchChecks = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setChecks(data);
    } catch {
      // fallback silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChecks();
    const interval = setInterval(fetchChecks, 30000);
    return () => clearInterval(interval);
  }, [fetchChecks]);

  const toggle = async (person: string, sweet: string) => {
    const currentVal = !!checks[today]?.[`${person}__${sweet}`];
    const newVal = !currentVal;

    setChecks((prev) => ({
      ...prev,
      [today]: {
        ...(prev[today] ?? {}),
        [`${person}__${sweet}`]: newVal,
      },
    }));

    setSyncing(true);
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: today,
          person_id: person,
          sweet,
          checked: newVal,
        }),
      });
    } finally {
      setSyncing(false);
    }
  };

  const isChecked = (person: string, sweet: string) =>
    !!checks[today]?.[`${person}__${sweet}`];

  const failCount = (person: string, dateKey = today) =>
    SWEETS.filter((s) => !!checks[dateKey]?.[`${person}__${s}`]).length;

  const isClean = (person: string, dateKey = today) => failCount(person, dateKey) === 0;

  const historyDates = Object.keys(checks)
    .filter((d) => d !== today)
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 30);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });

  // Считаем серию чистых дней подряд для всех участников вместе
  const getTeamStreak = useCallback((data: Checks): number => {
    const allDates = Object.keys(data).sort((a, b) => b.localeCompare(a));
    let streak = 0;
    for (const d of allDates) {
      const allClean = PARTICIPANTS.every((p) =>
        SWEETS.every((s) => !data[d]?.[`${p.id}__${s}`])
      );
      if (allClean) streak++;
      else break;
    }
    return streak;
  }, []);

  useEffect(() => {
    if (!loading) {
      const streak = getTeamStreak(checks);
      if (streak > 0 && streak % 7 === 0) {
        const key = `streak_banner_${streak}`;
        if (!sessionStorage.getItem(key)) {
          setShowBanner(true);
          sessionStorage.setItem(key, "1");
        }
      }
    }
  }, [checks, loading, getTeamStreak]);

  const streak = getTeamStreak(checks);

  return (
    <div id="tracker" className="min-h-screen bg-white px-6 py-16 lg:py-24">
      {/* Баннер-мотивашка */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -80 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm mx-auto px-4"
          >
            <div className="bg-neutral-900 text-white rounded-2xl px-6 py-5 shadow-2xl flex items-start gap-4">
              <span className="text-4xl leading-none">🏆</span>
              <div className="flex-1">
                <p className="font-bold text-base mb-1">
                  {streak} дней без сладкого!
                </p>
                <p className="text-neutral-300 text-sm">
                  Ольга и Белла — вы просто космос. Держите ритм, следующая веха через 7 дней!
                </p>
              </div>
              <button
                onClick={() => setShowBanner(false)}
                className="text-neutral-500 hover:text-white transition-colors mt-0.5"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        <p className="uppercase text-xs tracking-widest text-neutral-400 mb-3 text-center">
          Ежедневный чек-лист
        </p>
        <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 text-center mb-4">
          Что съели сегодня?
        </h2>
        <p className="text-neutral-500 text-center mb-3">
          Честно отметьте — без осуждений. Цель видеть картину, а не скрывать.
        </p>

        <div className="flex items-center justify-center gap-4 mb-10 flex-wrap">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${syncing ? "bg-yellow-400 animate-pulse" : "bg-green-400"}`} />
            <span className="text-xs text-neutral-400">
              {syncing ? "Синхронизация..." : loading ? "Загрузка..." : "Синхронизировано"}
            </span>
          </div>
          {streak >= 1 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5">
              <span className="text-base">🔥</span>
              <span className="text-sm font-semibold text-amber-700">
                {streak} {streak === 1 ? "день" : streak < 5 ? "дня" : "дней"} подряд — так держать!
              </span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {PARTICIPANTS.map((p) => (
            <div key={p.id} className="border border-neutral-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{p.emoji}</span>
                  <h3 className="text-xl font-bold text-neutral-900">{p.name}</h3>
                </div>
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    isClean(p.id)
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <Icon
                    name={isClean(p.id) ? "ShieldCheck" : "AlertCircle"}
                    size={14}
                  />
                  {isClean(p.id) ? "Держится!" : `Срыв (${failCount(p.id)})`}
                </div>
              </div>

              <div className="space-y-3">
                {SWEETS.map((sweet) => {
                  const checked = isChecked(p.id, sweet);
                  return (
                    <button
                      key={sweet}
                      onClick={() => toggle(p.id, sweet)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-left ${
                        checked
                          ? "bg-red-50 border-red-200 text-red-700"
                          : "bg-neutral-50 border-neutral-200 text-neutral-700 hover:border-neutral-400"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          checked
                            ? "bg-red-500 border-red-500"
                            : "border-neutral-300"
                        }`}
                      >
                        {checked && (
                          <Icon name="Check" size={12} className="text-white" />
                        )}
                      </div>
                      <span className="text-sm">{sweet}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* История */}
        <div className="border border-neutral-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Icon name="CalendarDays" size={18} className="text-neutral-500" />
              <span className="font-semibold text-neutral-900">История по дням</span>
              {historyDates.length > 0 && (
                <span className="text-xs text-neutral-400">{historyDates.length} дней</span>
              )}
            </div>
            <Icon
              name={showHistory ? "ChevronUp" : "ChevronDown"}
              size={18}
              className="text-neutral-400"
            />
          </button>

          {showHistory && (
            <div className="border-t border-neutral-200">
              {historyDates.length === 0 ? (
                <p className="text-center text-neutral-400 py-8 text-sm">
                  История появится после первых дней вызова
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200">
                        <th className="text-left px-6 py-3 text-neutral-500 font-medium">Дата</th>
                        {PARTICIPANTS.map((p) => (
                          <th key={p.id} className="text-center px-4 py-3 text-neutral-500 font-medium">
                            {p.emoji} {p.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {historyDates.map((d) => (
                        <tr key={d} className="border-b border-neutral-100 hover:bg-neutral-50">
                          <td className="px-6 py-3 text-neutral-600">{formatDate(d)}</td>
                          {PARTICIPANTS.map((p) => (
                            <td key={p.id} className="px-4 py-3 text-center">
                              {isClean(p.id, d) ? (
                                <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                                  <Icon name="Check" size={14} />
                                  Чисто
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-red-500">
                                  <Icon name="X" size={14} />
                                  {failCount(p.id, d)} поз.
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">
          Данные синхронизируются между устройствами · обновление каждые 30 сек
        </p>
      </div>
    </div>
  );
}