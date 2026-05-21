import { useState } from "react";
import Icon from "@/components/ui/icon";

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

const loadChecks = (): Checks => {
  try {
    const raw = localStorage.getItem("sugar_checks");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveChecks = (data: Checks) => {
  localStorage.setItem("sugar_checks", JSON.stringify(data));
};

export default function Featured() {
  const [checks, setChecks] = useState<Checks>(loadChecks);
  const today = getTodayKey();

  const toggle = (person: string, sweet: string) => {
    const updated: Checks = {
      ...checks,
      [today]: {
        ...(checks[today] ?? {}),
        [`${person}__${sweet}`]: !checks[today]?.[`${person}__${sweet}`],
      },
    };
    setChecks(updated);
    saveChecks(updated);
  };

  const isChecked = (person: string, sweet: string) =>
    !!checks[today]?.[`${person}__${sweet}`];

  const failCount = (person: string) =>
    SWEETS.filter((s) => isChecked(person, s)).length;

  const isClean = (person: string) => failCount(person) === 0;

  return (
    <div id="tracker" className="min-h-screen bg-white px-6 py-16 lg:py-24">
      <div className="max-w-4xl mx-auto">
        <p className="uppercase text-xs tracking-widest text-neutral-400 mb-3 text-center">
          Ежедневный чек-лист
        </p>
        <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 text-center mb-4">
          Что съели сегодня?
        </h2>
        <p className="text-neutral-500 text-center mb-12">
          Честно отметьте — без осуждений. Цель видеть картину, а не скрывать.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
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
                  {isClean(p.id) ? "Чист!" : `Сорвался (${failCount(p.id)})`}
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

        <p className="text-center text-xs text-neutral-400 mt-8">
          Данные сохраняются на вашем устройстве · {new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>
    </div>
  );
}