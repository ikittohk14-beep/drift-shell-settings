import React from 'react';
import { Cpu, RotateCcw, RefreshCw, Lock, Moon, Power } from 'lucide-react';
import { useI18n } from '../../i18n';

export const SystemView: React.FC = () => {
  const { t, language } = useI18n();

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
    <div className="space-y-4 max-w-3xl text-[#e5e2e3] font-mono text-sm">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#e5e2e3]">{t('systemTitle')}</h1>
          <p className="text-sm text-[#929092] mt-1">
            CachyOS • Linux 7.1.8-1-cachyos • driftwm
          </p>
        </div>
      </div>

      {/* ── Bento Grid: Row 1 (2 Square Tiles side-by-side) ───────────── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Tile 1: Kernel & OS */}
        <div className="minimal-card p-5 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#201f24] border border-[#262529] flex items-center justify-center text-[#e5e2e3]">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-xs text-[#474648] font-mono">cachyos</span>
          </div>

          <div>
            <div className="text-xs text-[#929092] font-medium">
              {language === 'ru' ? 'Дистрибутив и ядро' : 'Distribution & Kernel'}
            </div>
            <div className="text-2xl font-bold text-[#e5e2e3] tracking-tight mt-1">
              CachyOS Linux
            </div>
            <div className="text-xs mt-1 text-[#929092]">
              7.1.8-1-cachyos BZ/Zen
            </div>
          </div>
        </div>

        {/* Tile 2: Hardware & Memory Metric */}
        <div className="minimal-card p-5 flex flex-col justify-between h-40">
          <div className="flex items-start justify-between">
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-[#e5e2e3] tracking-tight">
                13.5
              </span>
              <span className="text-sm text-[#929092] ml-1 font-medium">GiB</span>
            </div>
            <span className="text-xs text-[#474648] font-mono">ryzen 5</span>
          </div>

          <div>
            <div className="text-xs text-[#929092] font-medium">
              {language === 'ru' ? 'ОЗУ + ZRAM Своп' : 'RAM + ZRAM Swap'}
            </div>
            <div className="text-base font-semibold text-[#e5e2e3] truncate mt-0.5">
              Radeon Vega APU
            </div>
            <div className="text-xs text-[#474648] mt-1 font-mono">
              amdgpu • Wayland DRM
            </div>
          </div>
        </div>
      </div>

      {/* ── Bento Grid: Row 2 (Wide Card - Session Management) ─────────── */}
      <div className="minimal-card p-5 space-y-4">
        <div className="flex items-center space-x-3 border-b border-[#262529] pb-3">
          <div className="w-8 h-8 rounded-xl bg-[#201f24] border border-[#262529] flex items-center justify-center text-[#e5e2e3]">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#e5e2e3]">
              {language === 'ru' ? 'Сессия и композитор' : 'Compositor & Session'}
            </div>
            <div className="text-xs text-[#929092]">
              {language === 'ru' ? 'Перезагрузка driftwm и блокировка' : 'driftwm live reload and screen locking'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleReloadDriftwm}
            className="p-3.5 rounded-xl bg-[#201f24] hover:bg-[#2b2a30] border border-[#262529] hover:border-[#36353b] text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-2 text-[#e5e2e3]">
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-semibold">{t('systemReloadDriftwm')}</span>
            </div>
            <div className="text-xs text-[#474648] mt-1.5 font-mono">~/.config/driftwm/config.toml</div>
          </button>

          <button
            type="button"
            onClick={() => handleAction('lock')}
            className="p-3.5 rounded-xl bg-[#201f24] hover:bg-[#2b2a30] border border-[#262529] hover:border-[#36353b] text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-2 text-[#e5e2e3]">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-semibold">{t('systemLock')}</span>
            </div>
            <div className="text-xs text-[#474648] mt-1.5 font-mono">lock.sh</div>
          </button>
        </div>
      </div>

      {/* ── Bento Grid: Row 3 (Wide Card - Power Actions) ─────────────── */}
      <div className="minimal-card p-5 space-y-4">
        <div className="flex items-center space-x-3 border-b border-[#262529] pb-3">
          <div className="w-8 h-8 rounded-xl bg-[#201f24] border border-[#262529] flex items-center justify-center text-[#e5e2e3]">
            <Power className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#e5e2e3]">
              {language === 'ru' ? 'Управление питанием' : 'Power State'}
            </div>
            <div className="text-xs text-[#929092]">
              {language === 'ru' ? 'Операции завершения работы' : 'Systemd power operations'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-1">
          <button
            type="button"
            onClick={() => handleAction('suspend')}
            className="p-3.5 rounded-xl bg-[#201f24] hover:bg-[#2b2a30] border border-[#262529] hover:border-[#36353b] text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-2 text-[#929092] group-hover:text-[#e5e2e3] transition-colors">
              <Moon className="w-4 h-4" />
              <span className="text-sm font-semibold text-[#e5e2e3]">{t('systemSuspend')}</span>
            </div>
            <div className="text-xs text-[#474648] mt-1 font-mono">suspend</div>
          </button>

          <button
            type="button"
            onClick={() => handleAction('reboot')}
            className="p-3.5 rounded-xl bg-[#201f24] hover:bg-[#2b2a30] border border-[#262529] hover:border-[#36353b] text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-2 text-[#929092] group-hover:text-[#e5e2e3] transition-colors">
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm font-semibold text-[#e5e2e3]">{t('systemReboot')}</span>
            </div>
            <div className="text-xs text-[#474648] mt-1 font-mono">reboot</div>
          </button>

          <button
            type="button"
            onClick={() => handleAction('poweroff')}
            className="p-3.5 rounded-xl bg-[#201f24] hover:bg-[#2b2a30] border border-[#262529] hover:border-[#36353b] text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-2 text-[#929092] group-hover:text-[#e5e2e3] transition-colors">
              <Power className="w-4 h-4" />
              <span className="text-sm font-semibold text-[#e5e2e3]">{t('systemPoweroff')}</span>
            </div>
            <div className="text-xs text-[#474648] mt-1 font-mono">shutdown</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemView;
