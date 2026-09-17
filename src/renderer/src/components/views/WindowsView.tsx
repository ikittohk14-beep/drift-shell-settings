import React, { useState, useEffect } from 'react';
import Toggle from '../Toggle';
import { useI18n } from '../../i18n';
import type { WindowRule, ActiveWindow } from '../../../../preload/types';

interface WindowsViewProps {
  rules: WindowRule[];
  onChange: (newRules: WindowRule[]) => void;
}

export const WindowsView: React.FC<WindowsViewProps> = ({ rules, onChange }) => {
  const { t } = useI18n();
  const [activeWindows, setActiveWindows] = useState<ActiveWindow[]>([]);

  const fetchActive = async () => {
    try {
      if (window.driftAPI?.getActiveWindows) {
        const wins = await window.driftAPI.getActiveWindows();
        setActiveWindows(wins);
      }
    } catch (err) {
      console.error('[WindowsView] Error fetching active windows:', err);
    }
  };

  useEffect(() => {
    fetchActive();
    const interval = setInterval(fetchActive, 2500);
    return () => clearInterval(interval);
  }, []);

  // Check if an app_id has blur enabled in rules
  const isAppBlurEnabled = (appId: string): boolean => {
    const found = rules.find((r) => r.app_id === appId);
    return found ? !!found.blur : false;
  };

  // Get opacity for an app_id
  const getAppOpacity = (appId: string): number => {
    const found = rules.find((r) => r.app_id === appId);
    return found?.opacity ?? 1.0;
  };

  // Toggle blur for an app_id
  const handleToggleAppBlur = (appId: string, enable: boolean) => {
    const index = rules.findIndex((r) => r.app_id === appId);
    if (index >= 0) {
      const updated = [...rules];
      updated[index] = { ...updated[index], blur: enable };
      onChange(updated);
    } else {
      const newRule: WindowRule = {
        app_id: appId,
        blur: enable,
        opacity: 0.85,
        decoration: 'none',
      };
      onChange([...rules, newRule]);
    }
  };

  const handleOpacityChange = (appId: string, opacity: number) => {
    const index = rules.findIndex((r) => r.app_id === appId);
    if (index >= 0) {
      const updated = [...rules];
      updated[index] = { ...updated[index], opacity };
      onChange(updated);
    } else {
      const newRule: WindowRule = {
        app_id: appId,
        blur: true,
        opacity,
        decoration: 'none',
      };
      onChange([...rules, newRule]);
    }
  };

  const uniqueApps = Array.from(
    new Set(activeWindows.map((w) => w.app_id).filter((id) => id && id.length > 0))
  );

  return (
    <div className="space-y-3.5 max-w-xl text-[#e5e2e3] font-mono text-xs">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#e5e2e3]">{t('windowsTitle')}</h1>
          <p className="text-xs text-[#929092] mt-0.5">
            {t('windowsDesc')}
          </p>
        </div>
        <button
          type="button"
          onClick={fetchActive}
          className="w-8 h-8 rounded-xl bg-[#1a191d] border border-[#262529] hover:border-[#36353b] text-[#859aea] flex items-center justify-center text-xs transition-colors cursor-pointer"
          title="Refresh Windows"
        >
          ::
        </button>
      </div>

      {/* ── Bento Grid: Row 1 (2 Square Tiles side-by-side) ───────────── */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Tile 1: Compositor Mode */}
        <div className="minimal-card p-4 flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
              1
            </div>
            <span className="text-[10px] text-[#474648] font-mono">xdg_shell</span>
          </div>

          <div>
            <div className="text-[11px] text-[#929092] font-medium">Compositor</div>
            <div className="text-xl font-bold text-[#e5e2e3] tracking-tight">
              driftwm
            </div>
            <div className="text-[10px] mt-0.5 text-[#a3d4a0]">
              ● Wayland wlr_scene
            </div>
          </div>
        </div>

        {/* Tile 2: Active Clients Metric */}
        <div className="minimal-card p-4 flex flex-col justify-between h-36">
          <div className="flex items-start justify-between">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-[#e5e2e3] tracking-tight">
                {uniqueApps.length}
              </span>
              <span className="text-xs text-[#929092] ml-1 font-medium">apps</span>
            </div>
            <span className="text-[10px] text-[#474648] font-mono">clients</span>
          </div>

          <div>
            <div className="text-[11px] text-[#929092] font-medium">Window Pipeline</div>
            <div className="text-sm font-semibold text-[#859aea] truncate">
              {rules.length > 0 ? `${rules.length} custom rules` : 'Hardware Blit'}
            </div>
            <div className="text-[10px] text-[#474648] mt-0.5 font-mono">
              Dual Kawase Shader
            </div>
          </div>
        </div>
      </div>

      {/* ── Bento Grid: Row 2 (Wide Card - Open Apps List) ───────────── */}
      <div className="minimal-card overflow-hidden">
        <div className="px-4 py-3 border-b border-[#262529] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
              2
            </div>
            <span className="text-xs font-semibold text-[#e5e2e3]">{t('windowsActiveApps')}</span>
            <span className="text-[10px] text-[#929092]">({uniqueApps.length})</span>
          </div>
          <span className="text-[10px] text-[#474648] font-mono">app_id override</span>
        </div>

        {uniqueApps.length === 0 ? (
          <div className="px-4 py-8 text-center text-[#929092]">
            {t('windowsNoActiveApps')}
          </div>
        ) : (
          <div className="divide-y divide-[#262529]">
            {uniqueApps.map((appId) => {
              const blurEnabled = isAppBlurEnabled(appId);
              const opacity = getAppOpacity(appId);
              const win = activeWindows.find((w) => w.app_id === appId);

              return (
                <div key={appId} className="px-4 py-3 space-y-2 hover:bg-[#201f21]/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span className="text-[#859aea] font-semibold text-[11px] shrink-0">
                        [{appId.length > 14 ? appId.slice(0, 12) + '..' : appId}]
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs text-[#e5e2e3] truncate">
                          {win?.title || t('windowsAppFallback')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 ml-2">
                      <span className="text-[11px] text-[#929092]">
                        {blurEnabled ? t('windowsBlurOn') : t('windowsBlurOff')}
                      </span>
                      <Toggle
                        checked={blurEnabled}
                        onChange={(val) => handleToggleAppBlur(appId, val)}
                      />
                    </div>
                  </div>

                  {/* Opacity slider when blur is on */}
                  {blurEnabled && (
                    <div className="flex items-center space-x-3 pl-2 pt-1">
                      <span className="text-[11px] text-[#929092] w-28 shrink-0">
                        {t('windowsOpacity')}: {Math.round(opacity * 100)}%
                      </span>
                      <input
                        type="range"
                        min="0.2"
                        max="1.0"
                        step="0.05"
                        value={opacity}
                        onChange={(e) =>
                          handleOpacityChange(appId, parseFloat(e.target.value))
                        }
                        className="w-full cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WindowsView;
