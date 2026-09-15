import React, { useState, useMemo } from 'react';
import { PlaySquare, Plus, Trash2, Terminal, Shield, Bell, Layout, Cpu } from 'lucide-react';

interface AutostartViewProps {
  commands: string[];
  onChange: (newCommands: string[]) => void;
  searchQuery?: string;
}

export const AutostartView: React.FC<AutostartViewProps> = ({
  commands,
  onChange,
  searchQuery = '',
}) => {
  const [newCmd, setNewCmd] = useState<string>('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCmd.trim()) return;
    onChange([...commands, newCmd.trim()]);
    setNewCmd('');
  };

  const handleDelete = (index: number) => {
    const updated = commands.filter((_, i) => i !== index);
    onChange(updated);
  };

  const getBadgeCategory = (cmd: string): { label: string; color: string; icon: any } => {
    const lower = cmd.toLowerCase();
    if (lower.includes('waybar')) {
      return { label: 'Панель', color: 'text-sky-300 bg-sky-500/10 border-sky-500/25', icon: Layout };
    }
    if (lower.includes('swaync') || lower.includes('notify')) {
      return { label: 'Уведомления', color: 'text-amber-300 bg-amber-500/10 border-amber-500/25', icon: Bell };
    }
    if (lower.includes('widget')) {
      return { label: 'Виджет', color: 'text-[#1ed760] bg-[#1ed760]/10 border-[#1ed760]/25', icon: Cpu };
    }
    if (lower.includes('cliphist')) {
      return { label: 'Буфер обмена', color: 'text-purple-300 bg-purple-500/10 border-purple-500/25', icon: Terminal };
    }
    if (lower.includes('sudo') || lower.includes('systemctl')) {
      return { label: 'Система', color: 'text-rose-300 bg-rose-500/10 border-rose-500/25', icon: Shield };
    }
    return { label: 'Демон', color: 'text-teal-300 bg-teal-500/10 border-teal-500/25', icon: Terminal };
  };

  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) return commands;
    const q = searchQuery.toLowerCase();
    return commands.filter((cmd) => cmd.toLowerCase().includes(q));
  }, [commands, searchQuery]);

  return (
    <div className="space-y-6 pb-6 select-none">
      {/* ── Add New Autostart Command ──────────────────────────────────── */}
      <section className="bg-white/[0.03] hover:bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5 backdrop-blur-md transition-all shadow-sm">
        <div className="flex items-center space-x-2.5 mb-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-neutral-950 shadow-sm">
            <PlaySquare className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide">
              Добавить сервис в автозапуск
            </h2>
            <p className="text-[11px] text-white/40">
              Выполняется при старте driftwm через sh -c
            </p>
          </div>
        </div>

        <form onSubmit={handleAdd} className="flex items-center space-x-2 mt-3">
          <div className="relative flex-1">
            <Terminal className="w-3.5 h-3.5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={newCmd}
              onChange={(e) => setNewCmd(e.target.value)}
              placeholder="например: swaync или waybar -c config.jsonc &"
              className="w-full pl-9 pr-4 py-2 bg-white/[0.06] border border-white/[0.1] rounded-full text-xs text-white font-mono placeholder-white/30 focus:border-[#1ed760] focus:outline-none transition-all shadow-inner"
            />
          </div>
          <button
            type="submit"
            className="flex items-center space-x-1.5 px-5 py-2 rounded-full bg-[#1ed760] text-neutral-950 font-semibold text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-glow-green shrink-0"
          >
            <Plus className="w-3.5 h-3.5 font-bold" />
            <span>Добавить</span>
          </button>
        </form>
      </section>

      {/* ── Commands List (Spotify Playlist Tracks Style) ──────────────── */}
      <section className="bg-white/[0.03] hover:bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5 backdrop-blur-md transition-all shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide">
              Список автозапуска (autostart)
            </h2>
            <p className="text-[11px] text-white/40">
              Демоны, виджеты и скрипты инициализации сессии
            </p>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/60 font-mono">
            {commands.length} команд
          </span>
        </div>

        {filteredCommands.length === 0 ? (
          <div className="text-center py-8 text-xs text-white/35 font-mono">
            {searchQuery
              ? `По запросу "${searchQuery}" команд не найдено`
              : 'Список автозапуска пуст'}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredCommands.map((cmd, idx) => {
              const originalIndex = commands.indexOf(cmd);
              const badge = getBadgeCategory(cmd);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={`${cmd}-${idx}`}
                  className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/[0.12] transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="w-5 text-right text-[11px] font-mono text-white/30 group-hover:text-white/60 shrink-0">
                      {idx + 1}
                    </span>

                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-medium flex items-center space-x-1 border shrink-0 ${badge.color}`}
                    >
                      <BadgeIcon className="w-2.5 h-2.5" />
                      <span>{badge.label}</span>
                    </span>

                    <span className="text-xs font-mono text-white/90 truncate group-hover:text-white">
                      {cmd}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(originalIndex >= 0 ? originalIndex : idx)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white/35 hover:text-rose-400 hover:bg-rose-500/15 transition-all cursor-pointer opacity-0 group-hover:opacity-100 shrink-0"
                    title="Удалить команду из автозапуска"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default AutostartView;
