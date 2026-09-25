import React from 'react';
import { Keyboard, Mouse, Maximize2 } from 'lucide-react';
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
    <div className="space-y-4 max-w-3xl text-[#e5e2e3] font-mono text-sm">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#e5e2e3]">{t('tabInput')}</h1>
          <p className="text-sm text-[#929092] mt-1">
            {t('inputKbdDesc')} • {t('inputMouseDesc')}
          </p>
        </div>
      </div>

      {/* ── Bento Grid: Row 1 (2 Square Tiles side-by-side) ───────────── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Tile 1: Keyboard Layout */}
        <div className="minimal-card p-5 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#201f24] border border-[#262529] flex items-center justify-center text-[#e5e2e3]">
              <Keyboard className="w-4 h-4" />
            </div>
            <span className="text-xs text-[#474648] font-mono">xkbcommon</span>
          </div>

          <div>
            <div className="text-xs text-[#929092] font-medium">
              {language === 'ru' ? 'Раскладки' : 'Active Layouts'}
            </div>
            <div className="text-2xl font-bold text-[#e5e2e3] tracking-tight uppercase mt-1">
              {keyboard.layout || 'us, ru'}
            </div>
            <div className="text-xs mt-1 text-[#929092] truncate">
              ● {keyboard.options ? keyboard.options.split(',')[0] : 'grp:caps_toggle'}
            </div>
          </div>
        </div>

        {/* Tile 2: Mouse Speed Metric */}
        <div className="minimal-card p-5 flex flex-col justify-between h-40">
          <div className="flex items-start justify-between">
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-[#e5e2e3] tracking-tight">
                {mouse.accel_speed ?? 0}
              </span>
              <span className="text-sm text-[#929092] ml-1 font-medium">
                {language === 'ru' ? 'скорость' : 'speed'}
              </span>
            </div>
            <span className="text-xs text-[#474648] font-mono">libinput</span>
          </div>

          <div>
            <div className="text-xs text-[#929092] font-medium">
              {language === 'ru' ? 'Профиль курсора' : 'Pointer Profile'}
            </div>
            <div className="text-base font-semibold text-[#e5e2e3] truncate mt-0.5">
              {language === 'ru' ? 'Адаптивное ускорение' : 'Adaptive Acceleration'}
            </div>
            <div className="text-xs text-[#474648] mt-1 font-mono">
              {trackpad.tap_to_click
                ? (language === 'ru' ? '● касание вкл' : '● tap-to-click on')
                : (language === 'ru' ? '○ касание выкл' : '○ tap-to-click off')}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bento Grid: Row 2 (Wide Card - Keyboard Layouts) ─────────── */}
      <div className="minimal-card p-5 space-y-4">
        <div className="flex items-center space-x-3 border-b border-[#262529] pb-3">
          <div className="w-8 h-8 rounded-xl bg-[#201f24] border border-[#262529] flex items-center justify-center text-[#e5e2e3]">
            <Keyboard className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#e5e2e3]">{t('inputKbdTitle')}</div>
            <div className="text-xs text-[#929092]">{t('inputKbdDesc')}</div>
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
              className="w-full px-3 py-1.5 bg-[#131315] border border-[#262529] rounded-xl text-[#e5e2e3] font-mono focus:border-[#e5e2e3] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#929092] mb-1 font-medium">{t('inputSwitchKeyLabel')}</label>
            <input
              type="text"
              value={keyboard.options || 'grp:caps_toggle,grp_led:caps'}
              onChange={(e) => onKeyboardChange({ ...keyboard, options: e.target.value })}
              placeholder="grp:caps_toggle"
              className="w-full px-3 py-1.5 bg-[#131315] border border-[#262529] rounded-xl text-[#e5e2e3] font-mono focus:border-[#e5e2e3] focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ── Bento Grid: Row 3 (Wide Card - Mouse & Trackpad) ─────────── */}
      <div className="minimal-card p-5 space-y-4">
        <div className="flex items-center space-x-3 border-b border-[#262529] pb-3">
          <div className="w-8 h-8 rounded-xl bg-[#201f24] border border-[#262529] flex items-center justify-center text-[#e5e2e3]">
            <Mouse className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#e5e2e3]">{t('inputMouseTitle')}</div>
            <div className="text-xs text-[#929092]">{t('inputMouseDesc')}</div>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          {/* Mouse Speed */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-[#929092]">
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
              className="w-full cursor-pointer accent-[#e5e2e3]"
            />
          </div>

          {/* Trackpad Speed */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-[#929092]">
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
              className="w-full cursor-pointer accent-[#e5e2e3]"
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
      <div className="minimal-card p-5 space-y-4">
        <div className="flex items-center space-x-3 border-b border-[#262529] pb-3">
          <div className="w-8 h-8 rounded-xl bg-[#201f24] border border-[#262529] flex items-center justify-center text-[#e5e2e3]">
            <Maximize2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#e5e2e3]">{t('inputSnapTitle')}</div>
            <div className="text-[10px] text-[#929092]">{t('inputSnapDesc')}</div>
          </div>
        </div>

        <div className="divide-y divide-[#262529]">
          {/* Master Snap toggle */}
          <div className="flex items-center justify-between py-2.5 text-xs">
            <div className="pr-3">
              <div className="text-[#e5e2e3] font-medium">{t('inputSnapEnabled')}</div>
              <div className="text-[10px] text-[#929092] mt-0.5">{t('inputSnapEnabledDesc')}</div>
            </div>
            <Toggle
              checked={snap.enabled !== false}
              onChange={(val) => onSnapChange({ ...snap, enabled: val })}
            />
          </div>

          {/* Same edge toggle */}
          <div className="flex items-center justify-between py-2.5 text-xs">
            <div className="pr-3">
              <div className="text-[#e5e2e3]">{t('inputSameEdge')}</div>
              <div className="text-[10px] text-[#929092] mt-0.5">{t('inputSameEdgeDesc')}</div>
            </div>
            <Toggle
              checked={snap.same_edge ?? false}
              onChange={(val) => onSnapChange({ ...snap, same_edge: val })}
            />
          </div>

          {/* Edge center toggle */}
          <div className="flex items-center justify-between py-2.5 text-xs">
            <div className="pr-3">
              <div className="text-[#e5e2e3]">{t('inputEdgeCenter')}</div>
              <div className="text-[10px] text-[#929092] mt-0.5">{t('inputEdgeCenterDesc')}</div>
            </div>
            <Toggle
              checked={snap.edge_center ?? false}
              onChange={(val) => onSnapChange({ ...snap, edge_center: val })}
            />
          </div>

          {/* Snap Gap slider */}
          <div className="py-2.5 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#929092]">{t('inputSnapGap')}</span>
              <span className="font-mono text-[#e5e2e3] font-bold">{snap.gap ?? 12} px</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="2"
              value={snap.gap ?? 12}
              onChange={(e) =>
                onSnapChange({ ...snap, gap: parseInt(e.target.value, 10) })
              }
              className="w-full cursor-pointer accent-[#e5e2e3]"
            />
          </div>

          {/* Reset zoom on new window */}
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
