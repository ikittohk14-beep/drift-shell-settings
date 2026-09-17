import React, { useState } from 'react';
import { useI18n } from '../../i18n';

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
  const { t } = useI18n();
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
    <div className="space-y-3.5 max-w-xl text-[#e5e2e3] font-mono text-xs">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#e5e2e3]">Shortcuts & Daemons</h1>
          <p className="text-xs text-[#929092] mt-0.5">
            System startup commands • Global compositor keybindings
          </p>
        </div>
      </div>

      {/* ── Bento Grid: Row 1 (2 Square Tiles side-by-side) ───────────── */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Tile 1: Autostart Count */}
        <div className="minimal-card p-4 flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
              1
            </div>
            <span className="text-[10px] text-[#474648] font-mono">startup</span>
          </div>

          <div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-[#e5e2e3] tracking-tight">
                {autostart.length}
              </span>
              <span className="text-xs text-[#929092] ml-1 font-medium">services</span>
            </div>
            <div className="text-[11px] text-[#929092] font-medium mt-0.5">
              Startup Daemons
            </div>
            <div className="text-[10px] mt-1 text-[#a3d4a0]">
              ● background spawn
            </div>
          </div>
        </div>

        {/* Tile 2: Keybindings Count */}
        <div className="minimal-card p-4 flex flex-col justify-between h-36">
          <div className="flex items-start justify-between">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-[#e5e2e3] tracking-tight">
                {Object.keys(keybindings).length}
              </span>
              <span className="text-xs text-[#929092] ml-1 font-medium">binds</span>
            </div>
            <span className="text-[10px] text-[#474648] font-mono">mod4</span>
          </div>

          <div>
            <div className="text-[11px] text-[#929092] font-medium">Global Hotkeys</div>
            <div className="text-sm font-semibold text-[#859aea] truncate">
              driftwm Grabbers
            </div>
            <div className="text-[10px] text-[#474648] mt-0.5 font-mono">
              ● input dispatch online
            </div>
          </div>
        </div>
      </div>

      {/* ── Bento Grid: Row 2 (Wide Card - Autostart List) ───────────── */}
      <div className="minimal-card p-4 space-y-3.5">
        <div className="flex items-center justify-between border-b border-[#262529] pb-2.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
              2
            </div>
            <div>
              <div className="text-xs font-semibold text-[#e5e2e3]">{t('shortcutsAutostartTitle')}</div>
              <div className="text-[10px] text-[#929092]">Executed on driftwm initialization</div>
            </div>
          </div>
          <span className="text-[10px] text-[#474648] font-mono">
            {autostart.length} {t('shortcutsStartupCommands')}
          </span>
        </div>

        {/* Add command form */}
        <form onSubmit={handleAddCmd} className="flex items-center space-x-2">
          <span className="text-[#474648] font-bold">$</span>
          <input
            type="text"
            value={newCmd}
            onChange={(e) => setNewCmd(e.target.value)}
            placeholder={t('shortcutsCmdPlaceholder')}
            className="flex-1 px-3 py-1.5 bg-[#131315] border border-[#262529] rounded-xl text-xs text-[#e5e2e3] font-mono placeholder-[#474648] focus:border-[#859aea] focus:outline-none transition-colors"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-[#201f21] hover:bg-[#2a292d] border border-[#262529] text-xs font-semibold text-[#859aea] transition-colors cursor-pointer"
          >
            [+]
          </button>
        </form>

        {/* Commands List */}
        <div className="max-h-48 overflow-y-auto divide-y divide-[#262529] pr-1">
          {autostart.map((cmd, idx) => (
            <div
              key={`${cmd}-${idx}`}
              className="py-2.5 flex items-center justify-between text-xs group hover:bg-[#201f21]/40 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-2.5 truncate pr-2">
                <span className="text-[#474648] text-[10px] font-mono">{idx + 1}.</span>
                <span className="font-mono text-[#e5e2e3] truncate">{cmd}</span>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteCmd(idx)}
                title={t('shortcutsDelete')}
                className="w-6 h-6 rounded-lg bg-[#131315] hover:bg-[#ffb4ab]/20 hover:text-[#ffb4ab] border border-[#262529] text-[#474648] flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                x
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bento Grid: Row 3 (Wide Card - Keybindings) ───────────────── */}
      <div className="minimal-card p-4 space-y-3.5">
        <div className="flex items-center justify-between border-b border-[#262529] pb-2.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
              3
            </div>
            <div>
              <div className="text-xs font-semibold text-[#e5e2e3]">{t('shortcutsKeybindingsTitle')}</div>
              <div className="text-[10px] text-[#929092]">Custom compositor action mappings</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddKeyOpen(!isAddKeyOpen)}
            className="px-2.5 py-1 rounded-lg bg-[#201f21] hover:bg-[#2a292d] border border-[#262529] text-[10px] text-[#859aea] transition-colors cursor-pointer"
          >
            {isAddKeyOpen ? `[ ${t('shortcutsCancel')} ]` : `[ + bind ]`}
          </button>
        </div>

        {isAddKeyOpen && (
          <form onSubmit={handleAddKey} className="p-3 rounded-xl bg-[#161518] border border-[#262529] space-y-2 text-xs">
            <input
              type="text"
              value={comboInput}
              onChange={(e) => setComboInput(e.target.value)}
              placeholder={t('shortcutsComboPlaceholder')}
              className="w-full px-3 py-1.5 bg-[#131315] border border-[#262529] rounded-xl text-[#e5e2e3] font-mono focus:border-[#859aea] focus:outline-none transition-colors"
            />
            <input
              type="text"
              value={actionInput}
              onChange={(e) => setActionInput(e.target.value)}
              placeholder={t('shortcutsActionPlaceholder')}
              className="w-full px-3 py-1.5 bg-[#131315] border border-[#262529] rounded-xl text-[#e5e2e3] font-mono focus:border-[#859aea] focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="w-full py-1.5 rounded-xl bg-[#859aea] text-[#131315] font-semibold text-xs cursor-pointer hover:bg-[#a4b5f5] transition-colors"
            >
              {t('shortcutsSaveBind')}
            </button>
          </form>
        )}

        {/* Hotkeys list */}
        <div className="max-h-56 overflow-y-auto divide-y divide-[#262529] pr-1">
          {Object.entries(keybindings).map(([combo, action]) => (
            <div
              key={combo}
              className="py-2.5 flex items-center justify-between text-xs group hover:bg-[#201f21]/40 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-2.5 truncate pr-2">
                <span className="px-2 py-0.5 rounded-lg bg-[#201f21] border border-[#262529] text-[#859aea] font-mono text-[11px] font-semibold shrink-0">
                  {combo}
                </span>
                <span className="font-mono text-[#e5e2e3] truncate">{action}</span>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteKey(combo)}
                title={t('shortcutsDelete')}
                className="w-6 h-6 rounded-lg bg-[#131315] hover:bg-[#ffb4ab]/20 hover:text-[#ffb4ab] border border-[#262529] text-[#474648] flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                x
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShortcutsAutostartView;
