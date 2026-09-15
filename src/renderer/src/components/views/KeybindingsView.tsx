import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Command } from 'lucide-react';

interface KeybindingsViewProps {
  keybindings: Record<string, string>;
  onChange: (newBindings: Record<string, string>) => void;
  searchQuery?: string;
}

export const KeybindingsView: React.FC<KeybindingsViewProps> = ({
  keybindings,
  onChange,
  searchQuery = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [comboInput, setComboInput] = useState<string>('');
  const [actionInput, setActionInput] = useState<string>('');

  const entries = Object.entries(keybindings);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(
      ([key, action]) => key.toLowerCase().includes(q) || action.toLowerCase().includes(q)
    );
  }, [entries, searchQuery]);

  const handleDelete = (keyToDelete: string) => {
    const updated = { ...keybindings };
    delete updated[keyToDelete];
    onChange(updated);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comboInput.trim() || !actionInput.trim()) return;
    const updated = {
      ...keybindings,
      [comboInput.trim()]: actionInput.trim(),
    };
    onChange(updated);
    setComboInput('');
    setActionInput('');
    setIsModalOpen(false);
  };

  const renderKeyChips = (combo: string) => {
    const parts = combo.split('+');
    return (
      <div className="flex items-center space-x-1.5 font-mono">
        {parts.map((p, i) => (
          <React.Fragment key={i}>
            <kbd className="px-2.5 py-1 rounded-lg bg-white/[0.08] border border-white/[0.12] text-white font-semibold text-xs shadow-sm uppercase tracking-wider">
              {p}
            </kbd>
            {i < parts.length - 1 && <span className="text-white/30 text-xs font-bold">+</span>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-6 select-none">
      {/* ── Keybindings Table Section ──────────────────────────────────── */}
      <section className="bg-white/[0.03] hover:bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5 backdrop-blur-md transition-all shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-sm">
              <Command className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">
                Комбинации клавиш ([keybindings])
              </h2>
              <p className="text-[11px] text-white/40">
                Глобальные шорткаты оконного менеджера driftwm
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setComboInput('');
              setActionInput('');
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-[#1ed760] text-neutral-950 font-semibold text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-glow-green"
          >
            <Plus className="w-3.5 h-3.5 font-bold" />
            <span>Добавить комбинацию</span>
          </button>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-xs text-white/35 font-mono">
            {searchQuery
              ? `По запросу "${searchQuery}" комбинаций не найдено`
              : 'Комбинации клавиш не заданы'}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredEntries.map(([combo, action], idx) => (
              <div
                key={combo}
                className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/[0.12] transition-all flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="w-5 text-right text-[11px] font-mono text-white/30 group-hover:text-white/60 shrink-0">
                    {idx + 1}
                  </span>

                  <div className="shrink-0">{renderKeyChips(combo)}</div>

                  <span className="text-xs font-mono text-white/90 truncate group-hover:text-white pl-2">
                    {action}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(combo)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white/35 hover:text-rose-400 hover:bg-rose-500/15 transition-all cursor-pointer opacity-0 group-hover:opacity-100 shrink-0"
                  title="Удалить комбинацию"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Glass Modal: New Keybinding ─────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-fadeIn">
          <form
            onSubmit={handleSaveModal}
            className="bg-[#121520]/85 border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-glass backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-sm font-semibold text-white tracking-wide">
                Новая комбинация клавиш
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-white/60 mb-1 font-medium">
                  Комбинация клавиш (например: mod+return, mod+shift+d):
                </label>
                <input
                  type="text"
                  value={comboInput}
                  onChange={(e) => setComboInput(e.target.value)}
                  placeholder="mod+space или super+f"
                  className="w-full px-3.5 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white font-mono placeholder-white/30 focus:border-[#1ed760] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1 font-medium">
                  Команда или действие driftwm:
                </label>
                <input
                  type="text"
                  value={actionInput}
                  onChange={(e) => setActionInput(e.target.value)}
                  placeholder="exec kitty или fit-window-snapped"
                  className="w-full px-3.5 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white font-mono placeholder-white/30 focus:border-[#1ed760] focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2.5 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-full text-xs text-white/60 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full text-xs font-semibold text-neutral-950 bg-[#1ed760] hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-glow-green"
              >
                Добавить
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default KeybindingsView;
