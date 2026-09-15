import React from 'react';
import { Power, RotateCcw, Moon, Lock, RefreshCw } from 'lucide-react';

export const SystemView: React.FC = () => {
  const handleAction = async (action: 'poweroff' | 'reboot' | 'suspend' | 'lock') => {
    try {
      if (window.driftAPI?.systemAction) {
        await window.driftAPI.systemAction(action);
      }
    } catch (err) {
      console.error(`[SystemView] Error performing ${action}:`, err);
    }
  };

  const handleReloadDriftwm = async () => {
    try {
      if (window.driftAPI?.reloadDriftwm) {
        await window.driftAPI.reloadDriftwm();
      }
    } catch (err) {
      console.error('[SystemView] Error reloading driftwm:', err);
    }
  };

  return (
    <div className="space-y-4 max-w-xl animate-fadeIn text-[#e5e2e3]">
      {/* ── System Header Card ────────────────────────────────────────── */}
      <div className="frosted-card p-5 flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#242329] border border-[#2a282d] flex items-center justify-center text-[#ffb4ab] shadow-sm">
          <Power className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-semibold text-[#e5e2e3]">Управление ПК и сессией</div>
          <div className="text-xs text-[#929092]">CachyOS • driftwm Wayland Compositor</div>
        </div>
      </div>

      {/* ── Quick Action Tiles ────────────────────────────────────────── */}
      <div className="frosted-card overflow-hidden divide-y divide-[#2a282d]">
        {/* Lock */}
        <button
          type="button"
          onClick={() => handleAction('lock')}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#252429] transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#242329] border border-[#2a282d] text-[#88c0d0] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-[#e5e2e3]">Заблокировать экран</div>
              <div className="text-xs text-[#929092]">Переход на экран блокировки lock.sh</div>
            </div>
          </div>
        </button>

        {/* Suspend */}
        <button
          type="button"
          onClick={() => handleAction('suspend')}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#252429] transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#242329] border border-[#2a282d] text-[#859aea] flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-[#e5e2e3]">Спящий режим</div>
              <div className="text-xs text-[#929092]">systemctl suspend</div>
            </div>
          </div>
        </button>

        {/* Reload Driftwm */}
        <button
          type="button"
          onClick={handleReloadDriftwm}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#252429] transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#242329] border border-[#2a282d] text-[#e8cf8d] flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-[#e5e2e3]">Перезагрузить driftwm</div>
              <div className="text-xs text-[#929092]">Применить config.toml без выхода из сессии</div>
            </div>
          </div>
        </button>

        {/* Reboot */}
        <button
          type="button"
          onClick={() => handleAction('reboot')}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#252429] transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#242329] border border-[#2a282d] text-[#e8cf8d] flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-[#e5e2e3]">Перезагрузка ПК</div>
              <div className="text-xs text-[#929092]">systemctl reboot</div>
            </div>
          </div>
        </button>

        {/* Poweroff */}
        <button
          type="button"
          onClick={() => handleAction('poweroff')}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#ffb4ab]/15 transition-colors cursor-pointer group"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#ffb4ab]/15 border border-[#ffb4ab]/30 text-[#ffb4ab] flex items-center justify-center">
              <Power className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-[#ffb4ab]">Выключить компьютер</div>
              <div className="text-xs text-[#929092]">Безопасное завершение работы</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default SystemView;
