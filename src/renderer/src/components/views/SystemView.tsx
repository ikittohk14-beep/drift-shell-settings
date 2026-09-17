import React from 'react';
import { useI18n } from '../../i18n';

export const SystemView: React.FC = () => {
  const { t } = useI18n();

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
    <div className="space-y-3.5 max-w-xl text-[#e5e2e3] font-mono text-xs">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#e5e2e3]">{t('systemTitle')}</h1>
          <p className="text-xs text-[#929092] mt-0.5">
            CachyOS • Linux 7.1.8-1-cachyos • driftwm
          </p>
        </div>
      </div>

      {/* ── Bento Grid: Row 1 (2 Square Tiles side-by-side) ───────────── */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Tile 1: Kernel & OS */}
        <div className="minimal-card p-4 flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
              1
            </div>
            <span className="text-[10px] text-[#474648] font-mono">cachyos</span>
          </div>

          <div>
            <div className="text-[11px] text-[#929092] font-medium">Distribution & Kernel</div>
            <div className="text-xl font-bold text-[#e5e2e3] tracking-tight">
              CachyOS Linux
            </div>
            <div className="text-[10px] mt-0.5 text-[#a3d4a0]">
              ● 7.1.8-1-cachyos BZ/Zen
            </div>
          </div>
        </div>

        {/* Tile 2: Hardware & Memory Metric */}
        <div className="minimal-card p-4 flex flex-col justify-between h-36">
          <div className="flex items-start justify-between">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-[#e5e2e3] tracking-tight">
                13.5
              </span>
              <span className="text-xs text-[#929092] ml-1 font-medium">GiB</span>
            </div>
            <span className="text-[10px] text-[#474648] font-mono">ryzen 5</span>
          </div>

          <div>
            <div className="text-[11px] text-[#929092] font-medium">RAM + ZRAM Swap</div>
            <div className="text-sm font-semibold text-[#859aea] truncate">
              Radeon Vega APU
            </div>
            <div className="text-[10px] text-[#474648] mt-0.5 font-mono">
              amdgpu • Wayland DRM
            </div>
          </div>
        </div>
      </div>

      {/* ── Bento Grid: Row 2 (Wide Card - Session Management) ─────────── */}
      <div className="minimal-card p-4 space-y-3.5">
        <div className="flex items-center space-x-2.5 border-b border-[#262529] pb-2.5">
          <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
            2
          </div>
          <div>
            <div className="text-xs font-semibold text-[#e5e2e3]">Compositor & Session</div>
            <div className="text-[10px] text-[#929092]">driftwm live reload and screen locking</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleReloadDriftwm}
            className="p-3 rounded-xl bg-[#201f21] hover:bg-[#2a292d] border border-[#262529] hover:border-[#859aea] text-left transition-all cursor-pointer group"
          >
            <div className="text-[10px] text-[#a3d4a0] font-bold">[ reload ]</div>
            <div className="text-xs font-semibold text-[#e5e2e3] mt-1">{t('systemReloadDriftwm')}</div>
            <div className="text-[10px] text-[#474648] mt-0.5 font-mono">config.toml</div>
          </button>

          <button
            type="button"
            onClick={() => handleAction('lock')}
            className="p-3 rounded-xl bg-[#201f21] hover:bg-[#2a292d] border border-[#262529] hover:border-[#859aea] text-left transition-all cursor-pointer group"
          >
            <div className="text-[10px] text-[#859aea] font-bold">[ lock ]</div>
            <div className="text-xs font-semibold text-[#e5e2e3] mt-1">{t('systemLock')}</div>
            <div className="text-[10px] text-[#474648] mt-0.5 font-mono">lock.sh</div>
          </button>
        </div>
      </div>

      {/* ── Bento Grid: Row 3 (Wide Card - Power Actions) ─────────────── */}
      <div className="minimal-card p-4 space-y-3.5">
        <div className="flex items-center space-x-2.5 border-b border-[#262529] pb-2.5">
          <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
            3
          </div>
          <div>
            <div className="text-xs font-semibold text-[#e5e2e3]">Power State</div>
            <div className="text-[10px] text-[#929092]">Systemd power operations</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => handleAction('suspend')}
            className="p-3 rounded-xl bg-[#201f21] hover:bg-[#2a292d] border border-[#262529] hover:border-[#c0c6dc] text-left transition-all cursor-pointer group"
          >
            <div className="text-[10px] text-[#c0c6dc] font-bold">[ sleep ]</div>
            <div className="text-xs font-semibold text-[#e5e2e3] mt-1">{t('systemSuspend')}</div>
            <div className="text-[10px] text-[#474648] mt-0.5 font-mono">suspend</div>
          </button>

          <button
            type="button"
            onClick={() => handleAction('reboot')}
            className="p-3 rounded-xl bg-[#201f21] hover:bg-[#2a292d] border border-[#262529] hover:border-[#e8cf8d] text-left transition-all cursor-pointer group"
          >
            <div className="text-[10px] text-[#e8cf8d] font-bold">[ reboot ]</div>
            <div className="text-xs font-semibold text-[#e5e2e3] mt-1">{t('systemReboot')}</div>
            <div className="text-[10px] text-[#474648] mt-0.5 font-mono">reboot</div>
          </button>

          <button
            type="button"
            onClick={() => handleAction('poweroff')}
            className="p-3 rounded-xl bg-[#201f21] hover:bg-[#ffb4ab]/15 border border-[#262529] hover:border-[#ffb4ab] text-left transition-all cursor-pointer group"
          >
            <div className="text-[10px] text-[#ffb4ab] font-bold">[ poweroff ]</div>
            <div className="text-xs font-semibold text-[#ffb4ab] mt-1">{t('systemPoweroff')}</div>
            <div className="text-[10px] text-[#ffb4ab]/60 mt-0.5 font-mono">shutdown</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemView;
