import React, { useState } from 'react';
import { Play, Command, Terminal, Plus, Trash2 } from 'lucide-react';
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
  const { t, language } = useI18n();
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
    <div className="space-y-4 max-w-3xl text-[#e5e2e3] font-mono text-sm">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#e5e2e3]">{t('tabShortcuts')}</h1>
          <p className="text-sm text-[#929092] mt-1">
            {t('shortcutsAutostartTitle')} • {t('shortcutsKeybindingsTitle')}
          </p>
        </div>
      </div>

      {/* ── Bento Grid: Row 1 (2 Square Tiles side-by-side) ───────────── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Tile 1: Autostart Count */}
        <div className="minimal-card p-5 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#201f24] border border-[#262529] flex items-center justify-center text-[#e5e2e3]">
              <Play className="w-4 h-4" />
            </div>
            <span className="text-xs text-[#474648] font-mono">
              {language === 'ru' ? 'старт' : 'startup'}
            </span>
          </div>

          <div>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-[#e5e2e3] tracking-tight">
                {autostart.length}
              </span>
              <span className="text-sm text-[#929092] ml-1 font-medium">
                {language === 'ru' ? 'служб' : 'services'}
              </span>
            </div>
            <div className="text-xs text-[#929092] font-medium mt-0.5">
              {language === 'ru' ? 'Службы автозапуска' : 'Startup Daemons'}
            </div>
            <div className="text-xs mt-1 text-[#474648] font-mono">
              {language === 'ru' ? '● запуск в фоне' : '● background spawn'}
            </div>
          </div>
        </div>

        {/* Tile 2: Keybindings Count */}
        <div className="minimal-card p-5 flex flex-col justify-between h-40">
          <div className="flex items-start justify-between">
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-[#e5e2e3] tracking-tight">
                {Object.keys(keybindings).length}
              </span>
              <span className="text-sm text-[#929092] ml-1 font-medium">
                {language === 'ru' ? 'клавиш' : 'binds'}
              </span>
            </div>
            <span className="text-xs text-[#474648] font-mono">mod4</span>
          </div>

          <div>
            <div className="text-xs text-[#929092] font-medium">
              {language === 'ru' ? 'Горячие клавиши' : 'Global Hotkeys'}
            </div>
            <div className="text-base font-semibold text-[#e5e2e3] truncate mt-0.5">
              {language === 'ru' ? 'Перехватчик driftwm' : 'driftwm Grabbers'}
            </div>
            <div className="text-xs text-[#474648] mt-1 font-mono">
              {language === 'ru' ? '● перехватчик активен' : '● input dispatch online'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bento Grid: Row 2 (Wide Card - Autostart List) ───────────── */}
      <div className="minimal-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#262529] pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#201f24] border border-[#262529] flex items-center justify-center text-[#e5e2e3]">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#e5e2e3]">{t('shortcutsAutostartTitle')}</div>
              <div className="text-xs text-[#929092]">
                {language === 'ru' ? 'Выполняются при запуске driftwm' : 'Executed on driftwm initialization'}
              </div>
            </div>
          </div>
          <span className="text-xs text-[#474648] font-mono">
            {autostart.length} {t('shortcutsStartupCommands')}
          </span>
        </div>

        {/* Add command form */}
        <form onSubmit={handleAddCmd} className="flex items-center space-x-2">
          <span className="text-[#474648] font-mono font-bold">$</span>
          <input
            type="text"
            value={newCmd}
            onChange={(e) => setNewCmd(e.target.value)}
            placeholder={t('shortcutsCmdPlaceholder')}
            className="flex-1 px-3 py-1.5 bg-[#131315] border border-[#262529] rounded-xl text-xs text-[#e5e2e3] font-mono placeholder-[#474648] focus:border-[#e5e2e3] focus:outline-none transition-colors"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-xl bg-[#201f24] hover:bg-[#2b2a30] border border-[#262529] text-xs font-semibold text-[#e5e2e3] transition-colors cursor-pointer flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'ru' ? 'Добавить' : 'Add'}</span>
          </button>
        </form>

        {/* Commands List */}
        <div className="max-h-48 overflow-y-auto divide-y divide-[#262529] pr-1">
          {autostart.map((cmd, idx) => (
            <div
              key={`${cmd}-${idx}`}
              className="py-2.5 flex items-center justify-between text-xs group hover:bg-[#201f24]/40 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-2.5 truncate pr-2">
                <span className="text-[#474648] text-xs font-mono">{idx + 1}.</span>
                <span className="font-mono text-[#e5e2e3] truncate">{cmd}</span>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteCmd(idx)}
                title={t('shortcutsDelete')}
                className="w-7 h-7 rounded-lg bg-[#201f24] hover:bg-[#ea999c]/15 hover:text-[#ea999c] hover:border-[#ea999c]/30 border border-[#262529] text-[#929092] flex items-center justify-center transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bento Grid: Row 3 (Wide Card - Keybindings) ───────────────── */}
      <div className="minimal-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#262529] pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#201f24] border border-[#262529] flex items-center justify-center text-[#e5e2e3]">
              <Command className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#e5e2e3]">{t('shortcutsKeybindingsTitle')}</div>
              <div className="text-xs text-[#929092]">
                {language === 'ru' ? 'Привязка действий к клавишам' : 'Custom compositor action mappings'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddKeyOpen(!isAddKeyOpen)}
            className="px-3 py-1.5 rounded-xl bg-[#201f24] hover:bg-[#2b2a30] border border-[#262529] text-xs font-medium text-[#e5e2e3] transition-colors cursor-pointer flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddKeyOpen ? t('shortcutsCancel') : (language === 'ru' ? 'Клавиша' : 'Bind')}</span>
          </button>
        </div>

        {isAddKeyOpen && (
          <form onSubmit={handleAddKey} className="p-3.5 rounded-xl bg-[#161518] border border-[#262529] space-y-2.5 text-xs">
            <input
              type="text"
              value={comboInput}
              onChange={(e) => setComboInput(e.target.value)}
              placeholder={t('shortcutsComboPlaceholder')}
              className="w-full px-3 py-1.5 bg-[#131315] border border-[#262529] rounded-xl text-[#e5e2e3] font-mono focus:border-[#e5e2e3] focus:outline-none transition-colors"
            />
            <input
              type="text"
              value={actionInput}
              onChange={(e) => setActionInput(e.target.value)}
              placeholder={t('shortcutsActionPlaceholder')}
              className="w-full px-3 py-1.5 bg-[#131315] border border-[#262529] rounded-xl text-[#e5e2e3] font-mono focus:border-[#e5e2e3] focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="w-full py-1.5 rounded-xl bg-[#e5e2e3] text-[#131315] font-semibold text-xs cursor-pointer hover:bg-[#ffffff] transition-colors"
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
              className="py-2.5 flex items-center justify-between text-xs group hover:bg-[#201f24]/40 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-2.5 truncate pr-2">
                <span className="px-2 py-0.5 rounded-lg bg-[#201f24] border border-[#262529] text-[#e5e2e3] font-mono text-xs font-semibold shrink-0">
                  {combo}
                </span>
                <span className="font-mono text-[#e5e2e3] truncate">{action}</span>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteKey(combo)}
                title={t('shortcutsDelete')}
                className="w-7 h-7 rounded-lg bg-[#201f24] hover:bg-[#ea999c]/15 hover:text-[#ea999c] hover:border-[#ea999c]/30 border border-[#262529] text-[#929092] flex items-center justify-center transition-colors cursor-pointer"
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
