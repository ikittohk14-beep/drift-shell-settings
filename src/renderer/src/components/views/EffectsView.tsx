import React from 'react';
import { Sparkles, Palette, Sliders, Check } from 'lucide-react';
import type {
  EffectsConfig,
  OutputOutlineConfig,
  DecorationsConfig,
} from '../../../../preload/types';

interface EffectsViewProps {
  effects: EffectsConfig;
  outline: OutputOutlineConfig;
  decorations: DecorationsConfig;
  onEffectsChange: (effects: EffectsConfig) => void;
  onOutlineChange: (outline: OutputOutlineConfig) => void;
  onDecorationsChange: (decorations: DecorationsConfig) => void;
}

export const EffectsView: React.FC<EffectsViewProps> = ({
  effects,
  outline,
  decorations,
  onEffectsChange,
  onOutlineChange,
  onDecorationsChange,
}) => {
  const presetColors = [
    '#ffffff',
    '#1ed760',
    '#7fe2e8',
    '#8ab4f8',
    '#c09ef5',
    '#f5c06d',
    '#ff5f56',
  ];

  const currentBlurRadius = effects.blur_radius ?? 4;
  const currentBlurStrength = effects.blur_strength ?? 100;
  const currentCornerRadius = decorations.corner_radius ?? 16;
  const currentOutlineColor = outline.color || '#ffffff';
  const currentOutlineThickness = outline.thickness ?? 2;

  return (
    <div className="space-y-6 pb-6 select-none">
      {/* ── Live Glassmorphism Preview Deck ────────────────────────────── */}
      <section className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-md relative overflow-hidden shadow-sm">
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#1ed760] to-drift-cyan flex items-center justify-center text-neutral-950 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide">
              Интерактивное превью стекла
            </h2>
            <p className="text-[11px] text-white/40">
              Визуализация параметров размытия, скругления и внешней рамки
            </p>
          </div>
        </div>

        {/* Live Preview Stage */}
        <div className="relative h-44 rounded-xl overflow-hidden bg-gradient-to-tr from-purple-900/40 via-blue-900/30 to-emerald-900/40 border border-white/10 flex items-center justify-center p-6">
          {/* Background colorful elements to demonstrate blur */}
          <div className="absolute -left-4 -top-4 w-32 h-32 bg-[#1ed760]/30 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -right-4 -bottom-4 w-36 h-36 bg-purple-500/30 rounded-full blur-xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-2 w-28 h-28 bg-cyan-400/20 rounded-full blur-lg pointer-events-none" />

          {/* Frosted Glass Window Preview */}
          <div
            style={{
              borderRadius: `${currentCornerRadius}px`,
              backdropFilter: `blur(${Math.max(currentBlurRadius * 3, 8)}px)`,
              border: `${currentOutlineThickness}px solid ${currentOutlineColor}40`,
            }}
            className="relative z-10 w-80 p-4 bg-black/40 text-white shadow-2xl flex flex-col justify-between transition-all duration-150"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
              </div>
              <span className="text-[10px] font-mono text-white/50">
                blur: {currentBlurRadius}px • r: {currentCornerRadius}px
              </span>
            </div>
            <div className="py-2.5 text-xs">
              <div className="font-semibold text-white/95">Spotify-grade Glassmorphism</div>
              <div className="text-[10px] text-white/50 mt-0.5">
                driftwm Wayland Compositor Hardware Blur
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Blur Controls ──────────────────────────────────────────────── */}
      <section className="bg-white/[0.03] hover:bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5 backdrop-blur-md transition-all shadow-sm">
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white shadow-sm">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide">
              Параметры размытия ([effects])
            </h2>
            <p className="text-[11px] text-white/40">
              Глубина и интенсивность аппаратного блюра композитора
            </p>
          </div>
        </div>

        <div className="space-y-4 max-w-xl">
          {/* Blur Radius */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-white/80">Радиус размытия (blur_radius):</span>
              <span className="text-[#1ed760] font-mono">{currentBlurRadius} px</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={currentBlurRadius}
              onChange={(e) =>
                onEffectsChange({ ...effects, blur_radius: parseInt(e.target.value, 10) })
              }
              className="w-full cursor-pointer"
            />
            <div className="text-[11px] text-white/40 mt-1">
              Рекомендуемое значение для эффекта стекла: 4–6 px.
            </div>
          </div>

          {/* Blur Strength */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-white/80">Сила размытия (blur_strength):</span>
              <span className="text-[#1ed760] font-mono">{currentBlurStrength}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="5"
              value={currentBlurStrength}
              onChange={(e) =>
                onEffectsChange({ ...effects, blur_strength: parseInt(e.target.value, 10) })
              }
              className="w-full cursor-pointer"
            />
          </div>

          {/* Animate Blur */}
          <div className="pt-2">
            <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={effects.animate_blur ?? false}
                onChange={(e) =>
                  onEffectsChange({ ...effects, animate_blur: e.target.checked })
                }
                className="rounded accent-[#1ed760]"
              />
              <span className="text-xs text-white/90">
                Плавная анимация появления размытия при открытии окон (animate_blur)
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* ── Screen Outline & Window Corner Radius ─────────────────────── */}
      <section className="bg-white/[0.03] hover:bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5 backdrop-blur-md transition-all shadow-sm">
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-sm">
            <Palette className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide">
              Рамки и скругление окон ([decorations] и [output.outline])
            </h2>
            <p className="text-[11px] text-white/40">
              Цвета обводки монитора и форма углов приложений
            </p>
          </div>
        </div>

        <div className="space-y-4 max-w-xl text-xs">
          {/* Corner Radius */}
          <div>
            <div className="flex justify-between mb-1.5 font-medium">
              <span className="text-white/80">Скругление углов окон (corner_radius):</span>
              <span className="text-[#1ed760] font-mono">{currentCornerRadius} px</span>
            </div>
            <input
              type="range"
              min="0"
              max="32"
              step="2"
              value={currentCornerRadius}
              onChange={(e) =>
                onDecorationsChange({
                  ...decorations,
                  corner_radius: parseInt(e.target.value, 10),
                })
              }
              className="w-full cursor-pointer"
            />
          </div>

          {/* Outline Color */}
          <div>
            <label className="block text-white/80 mb-2 font-medium">
              Цвет внешней рамки монитора (outline color):
            </label>
            <div className="flex items-center space-x-2">
              {presetColors.map((color) => {
                const isSelected = currentOutlineColor.toLowerCase() === color.toLowerCase();
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => onOutlineChange({ ...outline, color })}
                    style={{ backgroundColor: color }}
                    className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center shadow-md cursor-pointer ${
                      isSelected ? 'scale-125 ring-2 ring-white/50' : 'hover:scale-110 opacity-80'
                    }`}
                  >
                    {isSelected && (
                      <Check
                        className={`w-3.5 h-3.5 ${
                          color === '#ffffff' ? 'text-black' : 'text-white'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
              <input
                type="text"
                value={outline.color || ''}
                onChange={(e) => onOutlineChange({ ...outline, color: e.target.value })}
                placeholder="#ffffff"
                className="w-24 px-3 py-1 bg-white/[0.06] border border-white/[0.1] rounded-full text-white font-mono text-center focus:border-[#1ed760] focus:outline-none"
              />
            </div>
          </div>

          {/* Outline Thickness */}
          <div>
            <div className="flex justify-between mb-1.5 font-medium">
              <span className="text-white/80">Толщина рамки экрана (thickness):</span>
              <span className="text-[#1ed760] font-mono">{currentOutlineThickness} px</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              step="1"
              value={currentOutlineThickness}
              onChange={(e) =>
                onOutlineChange({ ...outline, thickness: parseInt(e.target.value, 10) })
              }
              className="w-full cursor-pointer"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default EffectsView;
