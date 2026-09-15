import React, { useState } from 'react';
import { PlaySquare, Keyboard, Trash2, Terminal } from 'lucide-react';

interface ShortcutsAutostartViewProps {
  autostart: string[];
  keybindings: Record<string, string>;
  onAutostartChange: (newCmds: string[]) => void;
  onKeybindingsChange: (newKb: Record<string, string>) => void;
}

export const ShortcutsAutostartView: React.FC<ShortcutsAutostartViewProps> = ({
  autostart,
  keybindings,
  onAutostartChange,
  onKeybindingsChange,
}) => {
  const [newCmd, setNewCmd] = useState<string>('');
  const [comboInput, setComboInput] = useState<string>('');
  const [actionInput, setActionInput] = useState<string>('');
  const [isAddKeyOpen, setIsAddKeyOpen] = useState<boolean>(false);

  const handleAddCmd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCmd.trim()) return;
    onAutostartChange([...autostart, newCmd.trim()]);
    setNewCmd('');
  };

  const handleDeleteCmd = (index: number) => {
    onAutostartChange(autostart.filter((_, i) => i !== index));
  };

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comboInput.trim() || !actionInput.trim()) return;
    onKeybindingsChange({
      ...keybindings,
      [comboInput.trim()]: actionInput.trim(),
    });
    setComboInput('');
    setActionInput('');
    setIsAddKeyOpen(false);
  };

  const handleDeleteKey = (key: string) => {
    const updated = { ...keybindings };
    delete updated[key];
    onKeybindingsChange(updated);
  };

  return (
    <div className="space-y-4 max-w-xl animate-fadeIn text-[#e5e2e3]">
      {/* ── Autostart Card ───────────────────────────────────────────── */}
      <div className="frosted-card p-5 space-y-3">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#242329] border border-[#2a282d] flex items-center justify-center text-[#859aea] shadow-sm">
            <PlaySquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#e5e2e3]">Автозапуск (Autostart)</div>
            <div className="text-xs text-[#929092]">{autostart.length} команд при старте</div>
          </div>
        </div>

        {/* Add command input */}
        <form onSubmit={handleAddCmd} className="flex items-center space-x-2 pt-1">
          <div className="relative flex-1">
            <Terminal className="w-3.5 h-3.5 text-[#929092] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={newCmd}
              onChange={(e) => setNewCmd(e.target.value)}
              placeholder="команда (например: swaync)"
              className="w-full pl-8 pr-3 py-1.5 bg-[#131315] border border-[#2a282d] rounded-xl text-xs text-[#e5e2e3] font-mono placeholder-[#636265] focus:border-[#859aea] focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-xl bg-[#859aea] hover:bg-[#a4b5f5] text-xs font-semibold text-[#131315] transition-colors cursor-pointer"
          >
            +
          </button>
        </form>

        {/* List */}
        <div className="max-h-44 overflow-y-auto divide-y divide-[#2a282d] pt-1">
          {autostart.map((cmd, idx) => (
            <div
              key={`${cmd}-${idx}`}
              className="py-2 flex items-center justify-between text-xs group hover:bg-[#252429] px-2 rounded-lg transition-colors"
            >
              <span className="font-mono text-[#e5e2e3] truncate pr-2">{cmd}</span>
              <button
                type="button"
                onClick={() => handleDeleteCmd(idx)}
                className="text-[#929092] hover:text-[#ffb4ab] p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Keybindings Card ─────────────────────────────────────────── */}
      <div className="frosted-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#242329] border border-[#2a282d] flex items-center justify-center text-[#859aea] shadow-sm">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#e5e2e3]">Горячие клавиши</div>
              <div className="text-xs text-[#929092]">{Object.keys(keybindings).length} комбинаций</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddKeyOpen(!isAddKeyOpen)}
            className="text-xs text-[#859aea] hover:text-[#a4b5f5] font-medium cursor-pointer"
          >
            {isAddKeyOpen ? 'Отмена' : '+ Добавить'}
          </button>
        </div>

        {isAddKeyOpen && (
          <form onSubmit={handleAddKey} className="p-3 rounded-xl bg-[#161519] border border-[#2a282d] space-y-2 text-xs">
            <input
              type="text"
              value={comboInput}
              onChange={(e) => setComboInput(e.target.value)}
              placeholder="комбинация (например: mod+comma)"
              className="w-full px-3 py-1.5 bg-[#131315] border border-[#2a282d] rounded-lg text-[#e5e2e3] font-mono focus:border-[#859aea] focus:outline-none transition-colors"
            />
            <input
              type="text"
              value={actionInput}
              onChange={(e) => setActionInput(e.target.value)}
              placeholder="действие (например: exec kitty)"
              className="w-full px-3 py-1.5 bg-[#131315] border border-[#2a282d] rounded-lg text-[#e5e2e3] font-mono focus:border-[#859aea] focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-[#859aea] text-[#131315] font-semibold text-xs cursor-pointer shadow-sm hover:bg-[#a4b5f5] transition-colors"
            >
              Сохранить бинд
            </button>
          </form>
        )}

        {/* List */}
        <div className="max-h-56 overflow-y-auto divide-y divide-[#2a282d] pt-1">
          {Object.entries(keybindings).map(([key, action]) => (
            <div
              key={key}
              className="py-2 flex items-center justify-between text-xs group hover:bg-[#252429] px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-2 min-w-0 pr-2">
                <kbd className="px-2 py-0.5 rounded bg-[#201f24] border border-[#2a282d] font-mono text-[11px] text-[#e5e2e3] shrink-0">
                  {key}
                </kbd>
                <span className="font-mono text-[#929092] truncate">{action}</span>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteKey(key)}
                className="text-[#929092] hover:text-[#ffb4ab] p-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShortcutsAutostartView;
