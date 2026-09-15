import React, { useState, useEffect } from 'react';
import { Layers, Monitor } from 'lucide-react';
import Toggle from '../Toggle';
import type { WindowRule, ActiveWindow } from '../../../../preload/types';

interface WindowsViewProps {
  rules: WindowRule[];
  onChange: (newRules: WindowRule[]) => void;
}

export const WindowsView: React.FC<WindowsViewProps> = ({ rules, onChange }) => {
  const [activeWindows, setActiveWindows] = useState<ActiveWindow[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchActive = async () => {
      try {
        if (window.driftAPI?.getActiveWindows) {
          const wins = await window.driftAPI.getActiveWindows();
          if (isMounted) setActiveWindows(wins);
        }
      } catch (err) {
        console.error('[WindowsView] Error fetching active windows:', err);
      }
    };

    fetchActive();
    const interval = setInterval(fetchActive, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
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
    <div className="space-y-4 max-w-xl animate-fadeIn text-[#e5e2e3]">
      {/* ── Header Card ──────────────────────────────────────────────── */}
      <div className="frosted-card p-5 flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#242329] border border-[#2a282d] flex items-center justify-center text-[#859aea] shadow-sm">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-semibold text-[#e5e2e3]">Размытие фона приложений</div>
          <div className="text-xs text-[#929092]">
            Включение аппаратного блюра под окнами в driftwm
          </div>
        </div>
      </div>

      {/* ── Open Apps Inset List Card ─────────────────────────────────── */}
      <div className="frosted-card overflow-hidden">
        <div className="px-5 py-3 text-[10px] font-semibold text-[#636265] uppercase tracking-wider">
          Открытые приложения
        </div>

        {uniqueApps.length === 0 ? (
          <div className="px-5 py-8 text-xs text-[#929092] text-center">
            Нет активных приложений
          </div>
        ) : (
          <div className="divide-y divide-[#2a282d]">
            {uniqueApps.map((appId) => {
              const blurEnabled = isAppBlurEnabled(appId);
              const opacity = getAppOpacity(appId);
              const win = activeWindows.find((w) => w.app_id === appId);

              return (
                <div key={appId} className="px-5 py-3.5 space-y-2 hover:bg-[#252429] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#242329] border border-[#2a282d] flex items-center justify-center text-[#859aea] shrink-0">
                        <Monitor className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-mono font-medium text-[#e5e2e3] truncate">
                          {appId}
                        </div>
                        <div className="text-xs text-[#929092] truncate">
                          {win?.title || 'Приложение'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span className="text-xs text-[#929092]">
                        {blurEnabled ? 'Блюр вкл' : 'Выкл'}
                      </span>
                      <Toggle
                        checked={blurEnabled}
                        onChange={(val) => handleToggleAppBlur(appId, val)}
                      />
                    </div>
                  </div>

                  {/* Opacity slider when blur is on */}
                  {blurEnabled && (
                    <div className="flex items-center space-x-3 pl-11 pt-1">
                      <span className="text-[11px] text-[#929092] w-24">
                        Прозрачность: {Math.round(opacity * 100)}%
                      </span>
                      <input
                        type="range"
                        min="0.2"
                        max="1.0"
                        step="0.05"
                        value={opacity}
                        onChange={(e) => handleOpacityChange(appId, parseFloat(e.target.value))}
                        className="flex-1 cursor-pointer"
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
