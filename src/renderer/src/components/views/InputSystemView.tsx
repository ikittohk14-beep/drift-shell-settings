import React from 'react';
import { Keyboard, MousePointer, Magnet } from 'lucide-react';
import Toggle from '../Toggle';
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
  return (
    <div className="space-y-4 max-w-xl animate-fadeIn text-[#e5e2e3]">
      {/* ── Keyboard Card ────────────────────────────────────────────── */}
      <div className="frosted-card p-5 space-y-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#242329] border border-[#2a282d] flex items-center justify-center text-[#859aea] shadow-sm">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#e5e2e3]">Клавиатура и раскладки</div>
            <div className="text-xs text-[#929092]">XKB параметры в driftwm</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          <div>
            <label className="block text-[#929092] mb-1.5 font-medium">Раскладки (layout):</label>
            <input
              type="text"
              value={keyboard.layout || 'us,ru'}
              onChange={(e) => onKeyboardChange({ ...keyboard, layout: e.target.value })}
              placeholder="us,ru"
              className="w-full px-3.5 py-2 bg-[#131315] border border-[#2a282d] rounded-xl text-[#e5e2e3] font-mono focus:border-[#859aea] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#929092] mb-1.5 font-medium">Смена языка (options):</label>
            <input
              type="text"
              value={keyboard.options || 'grp:caps_toggle,grp_led:caps'}
              onChange={(e) => onKeyboardChange({ ...keyboard, options: e.target.value })}
              placeholder="grp:caps_toggle"
              className="w-full px-3.5 py-2 bg-[#131315] border border-[#2a282d] rounded-xl text-[#e5e2e3] font-mono focus:border-[#859aea] focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ── Mouse & Trackpad Card ─────────────────────────────────────── */}
      <div className="frosted-card p-5 space-y-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#242329] border border-[#2a282d] flex items-center justify-center text-[#859aea] shadow-sm">
            <MousePointer className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#e5e2e3]">Мышь и трекпад</div>
            <div className="text-xs text-[#929092]">Скорость и ускорение курсора</div>
          </div>
        </div>

        <div className="space-y-3 pt-1 text-xs">
          {/* Mouse Speed */}
          <div className="space-y-1">
            <div className="flex justify-between text-[#929092]">
              <span>Скорость мыши:</span>
              <span className="font-mono text-[#e5e2e3] font-medium">{mouse.accel_speed ?? 0}</span>
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
          <div className="space-y-1">
            <div className="flex justify-between text-[#929092]">
              <span>Скорость трекпада:</span>
              <span className="font-mono text-[#e5e2e3] font-medium">{trackpad.accel_speed ?? -0.2}</span>
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
          <div className="flex items-center justify-between pt-2 border-t border-[#2a282d]">
            <span className="text-[#e5e2e3]">Клик касанием по трекпаду (tap_to_click)</span>
            <Toggle
              checked={trackpad.tap_to_click ?? true}
              onChange={(val) => onTrackpadChange({ ...trackpad, tap_to_click: val })}
            />
          </div>
        </div>
      </div>

      {/* ── Canvas Snap Card ──────────────────────────────────────────── */}
      <div className="frosted-card p-5 space-y-3">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#242329] border border-[#2a282d] flex items-center justify-center text-[#859aea] shadow-sm">
            <Magnet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#e5e2e3]">Привязка окон (Snap)</div>
            <div className="text-xs text-[#929092]">Магнитное прилипание к краям</div>
          </div>
        </div>

        <div className="divide-y divide-[#2a282d] pt-1 text-xs">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-[#e5e2e3]">Привязка по одной границе (same_edge)</span>
            <Toggle
              checked={snap.same_edge ?? true}
              onChange={(val) => onSnapChange({ ...snap, same_edge: val })}
            />
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-[#e5e2e3]">Сброс зума при новом окне</span>
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
