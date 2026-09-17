import React from 'react';
import Toggle from '../Toggle';
import { useI18n } from '../../i18n';
import type {
  InputKeyboardConfig,
  InputDeviceConfig,
  ZoomConfig,
  SnapConfig,
} from '../../../../preload/types';

interface InputSystemViewProps {
  keyboard: InputKeyboardConfig;
  mouse: InputDeviceConfig;
  trackpad: InputDeviceConfig;
  zoom: ZoomConfig;
  snap: SnapConfig;
  onKeyboardChange: (kbd: InputKeyboardConfig) => void;
  onMouseChange: (mouse: InputDeviceConfig) => void;
  onTrackpadChange: (trackpad: InputDeviceConfig) => void;
  onZoomChange: (zoom: ZoomConfig) => void;
  onSnapChange: (snap: SnapConfig) => void;
}

export const InputSystemView: React.FC<InputSystemViewProps> = ({
  keyboard,
  mouse,
  trackpad,
  zoom,
  snap,
  onKeyboardChange,
  onMouseChange,
  onTrackpadChange,
  onZoomChange,
  onSnapChange,
}) => {
  const { t, language } = useI18n();

  return (
    <div className="space-y-3.5 max-w-xl text-[#e5e2e3] font-mono text-xs">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#e5e2e3]">{t('tabInput')}</h1>
          <p className="text-xs text-[#929092] mt-0.5">
            {t('inputKbdDesc')} • {t('inputMouseDesc')}
          </p>
        </div>
      </div>

      {/* ── Bento Grid: Row 1 (2 Square Tiles side-by-side) ───────────── */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Tile 1: Keyboard Layout */}
        <div className="minimal-card p-4 flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
              1
            </div>
            <span className="text-[10px] text-[#474648] font-mono">xkbcommon</span>
          </div>

          <div>
            <div className="text-[11px] text-[#929092] font-medium">
              {language === 'ru' ? 'Раскладки' : 'Active Layouts'}
            </div>
            <div className="text-xl font-bold text-[#859aea] tracking-tight uppercase">
              {keyboard.layout || 'us, ru'}
            </div>
            <div className="text-[10px] mt-0.5 text-[#a3d4a0] truncate">
              ● {keyboard.options ? keyboard.options.split(',')[0] : 'grp:caps_toggle'}
            </div>
          </div>
        </div>

        {/* Tile 2: Mouse Speed Metric */}
        <div className="minimal-card p-4 flex flex-col justify-between h-36">
          <div className="flex items-start justify-between">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-[#e5e2e3] tracking-tight">
                {mouse.accel_speed ?? 0}
              </span>
              <span className="text-xs text-[#929092] ml-1 font-medium">
                {language === 'ru' ? 'скорость' : 'speed'}
              </span>
            </div>
            <span className="text-[10px] text-[#474648] font-mono">libinput</span>
          </div>

          <div>
            <div className="text-[11px] text-[#929092] font-medium">
              {language === 'ru' ? 'Профиль курсора' : 'Pointer Profile'}
            </div>
            <div className="text-sm font-semibold text-[#859aea] truncate">
              {language === 'ru' ? 'Адаптивное ускорение' : 'Adaptive Acceleration'}
            </div>
            <div className="text-[10px] text-[#474648] mt-0.5 font-mono">
              {trackpad.tap_to_click
                ? (language === 'ru' ? '● касание вкл' : '● tap-to-click on')
                : (language === 'ru' ? '○ касание выкл' : '○ tap-to-click off')}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bento Grid: Row 2 (Wide Card - Keyboard Layouts) ─────────── */}
      <div className="minimal-card p-4 space-y-3.5">
        <div className="flex items-center space-x-2.5 border-b border-[#262529] pb-2.5">
          <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
            2
          </div>
          <div>
            <div className="text-xs font-semibold text-[#e5e2e3]">{t('inputKbdTitle')}</div>
            <div className="text-[10px] text-[#929092]">{t('inputKbdDesc')}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <div>
            <label className="block text-[#929092] mb-1 font-medium">{t('inputLayoutsLabel')}</label>
            <input
              type="text"
              value={keyboard.layout || 'us,ru'}
              onChange={(e) => onKeyboardChange({ ...keyboard, layout: e.target.value })}
              placeholder="us,ru"
              className="w-full px-3 py-1.5 bg-[#131315] border border-[#262529] rounded-xl text-[#e5e2e3] font-mono focus:border-[#859aea] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#929092] mb-1 font-medium">{t('inputSwitchKeyLabel')}</label>
            <input
              type="text"
              value={keyboard.options || 'grp:caps_toggle,grp_led:caps'}
              onChange={(e) => onKeyboardChange({ ...keyboard, options: e.target.value })}
              placeholder="grp:caps_toggle"
              className="w-full px-3 py-1.5 bg-[#131315] border border-[#262529] rounded-xl text-[#e5e2e3] font-mono focus:border-[#859aea] focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ── Bento Grid: Row 3 (Wide Card - Mouse & Trackpad) ─────────── */}
      <div className="minimal-card p-4 space-y-3.5">
        <div className="flex items-center space-x-2.5 border-b border-[#262529] pb-2.5">
          <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
            3
          </div>
          <div>
            <div className="text-xs font-semibold text-[#e5e2e3]">{t('inputMouseTitle')}</div>
            <div className="text-[10px] text-[#929092]">{t('inputMouseDesc')}</div>
          </div>
        </div>

        <div className="space-y-3.5 pt-1">
          {/* Mouse Speed */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-[#929092]">
              <span>{t('inputMouseSpeed')}</span>
              <span className="font-mono text-[#e5e2e3] font-bold">{mouse.accel_speed ?? 0}</span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.1"
              value={mouse.accel_speed ?? 0}
              onChange={(e) =>
                onMouseChange({ ...mouse, accel_speed: parseFloat(e.target.value) })
              }
              className="w-full cursor-pointer"
            />
          </div>

          {/* Trackpad Speed */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-[#929092]">
              <span>{t('inputTrackpadSpeed')}</span>
              <span className="font-mono text-[#e5e2e3] font-bold">{trackpad.accel_speed ?? -0.2}</span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.1"
              value={trackpad.accel_speed ?? -0.2}
              onChange={(e) =>
                onTrackpadChange({ ...trackpad, accel_speed: parseFloat(e.target.value) })
              }
              className="w-full cursor-pointer"
            />
          </div>

          {/* Tap to click toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-[#262529]">
            <span className="text-[#e5e2e3] text-xs">{t('inputTapToClick')}</span>
            <Toggle
              checked={trackpad.tap_to_click ?? true}
              onChange={(val) => onTrackpadChange({ ...trackpad, tap_to_click: val })}
            />
          </div>
        </div>
      </div>

      {/* ── Bento Grid: Row 4 (Wide Card - Snap & Canvas) ───────────── */}
      <div className="minimal-card p-4 space-y-3.5">
        <div className="flex items-center space-x-2.5 border-b border-[#262529] pb-2.5">
          <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
            4
          </div>
          <div>
            <div className="text-xs font-semibold text-[#e5e2e3]">{t('inputSnapTitle')}</div>
            <div className="text-[10px] text-[#929092]">{t('inputSnapDesc')}</div>
          </div>
        </div>

        <div className="divide-y divide-[#262529]">
          <div className="flex items-center justify-between py-2.5 text-xs">
            <span className="text-[#e5e2e3]">{t('inputSameEdge')}</span>
            <Toggle
              checked={snap.same_edge ?? true}
              onChange={(val) => onSnapChange({ ...snap, same_edge: val })}
            />
          </div>

          <div className="flex items-center justify-between py-2.5 text-xs">
            <span className="text-[#e5e2e3]">{t('inputResetZoom')}</span>
            <Toggle
              checked={zoom.reset_on_new_window ?? false}
              onChange={(val) => onZoomChange({ ...zoom, reset_on_new_window: val })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputSystemView;
