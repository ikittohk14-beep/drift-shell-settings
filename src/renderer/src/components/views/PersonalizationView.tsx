import React, { useState, useEffect } from 'react';
import Toggle from '../Toggle';
import { useI18n } from '../../i18n';
import type {
  BackgroundConfig,
  EffectsConfig,
  DecorationsConfig,
  OutputOutlineConfig,
  WallpaperItem,
} from '../../../../preload/types';

interface PersonalizationViewProps {
  background: BackgroundConfig;
  effects: EffectsConfig;
  decorations: DecorationsConfig;
  outline: OutputOutlineConfig;
  onBackgroundChange: (bg: BackgroundConfig) => void;
  onEffectsChange: (eff: EffectsConfig) => void;
  onDecorationsChange: (dec: DecorationsConfig) => void;
  onOutlineChange: (out: OutputOutlineConfig) => void;
}

export const PersonalizationView: React.FC<PersonalizationViewProps> = ({
  background,
  effects,
  decorations,
  outline,
  onBackgroundChange,
  onEffectsChange,
  onDecorationsChange,
  onOutlineChange,
}) => {
  const { t } = useI18n();
  const [wallpapers, setWallpapers] = useState<WallpaperItem[]>([]);
  const [currentDir, setCurrentDir] = useState<string>('~/Пикчи/Обои');
  const [loadingWallpapers, setLoadingWallpapers] = useState<boolean>(true);

  const fetchWallpapers = async () => {
    try {
      setLoadingWallpapers(true);
      if (window.driftAPI?.getWallpapers) {
        const items = await window.driftAPI.getWallpapers();
        setWallpapers(items);
      }
      if (window.driftAPI?.getWallpaperDir) {
        const dir = await window.driftAPI.getWallpaperDir();
        if (dir) setCurrentDir(dir);
      }
    } catch (err) {
      console.error('[PersonalizationView] Error fetching wallpapers:', err);
    } finally {
      setLoadingWallpapers(false);
    }
  };

  useEffect(() => {
    fetchWallpapers();
  }, []);

  const handleChooseFolder = async () => {
    try {
      if (window.driftAPI?.chooseWallpaperFolder) {
        const res = await window.driftAPI.chooseWallpaperFolder();
        if (res) {
          setCurrentDir(res.path);
          setWallpapers(res.items);
        }
      }
    } catch (err) {
      console.error('[PersonalizationView] Error choosing wallpaper folder:', err);
    }
  };

  const handleChooseFile = async () => {
    try {
      if (window.driftAPI?.chooseWallpaperFile) {
        const filePath = await window.driftAPI.chooseWallpaperFile();
        if (filePath) {
          onBackgroundChange({
            type: filePath.endsWith('.glsl') ? 'shader' : 'wallpaper',
            path: filePath,
          });
          await fetchWallpapers();
        }
      }
    } catch (err) {
      console.error('[PersonalizationView] Error picking wallpaper file:', err);
    }
  };

  const currentBlur = effects.blur_radius ?? 4;
  const currentCorners = decorations.corner_radius ?? 16;
  const currentBorderWidth = decorations.border_width ?? 0;
  const currentBorderFocused = decorations.border_color_focused || '#859aea';
  const currentBorderUnfocused = decorations.border_color || '#262529';
  const currentOutlineColor = outline.color || '#e5e2e3';
  const currentOutlineThickness = outline.thickness ?? 2;

  // Matugen-Slate palette presets from kitty current-theme.conf
  const presetColors = [
    '#e5e2e3', // silver / foreground
    '#ffb4ab', // soft coral / red
    '#e8cf8d', // warm sand / yellow
    '#a3d4a0', // sage mint / green
    '#88c0d0', // frost cyan
    '#859aea', // steel blue / primary
    '#c0c6dc', // lavender / magenta
    '#262529', // dark slate border
  ];

  const getWallpaperSrc = (w: WallpaperItem): string => {
    if (w.previewUrl) return w.previewUrl;
    const resolvedPath = w.path.startsWith('~')
      ? w.path.replace('~', '/home/ikitto')
      : w.path;
    return `file://${resolvedPath}`;
  };

  return (
    <div className="space-y-3.5 max-w-xl text-[#e5e2e3] font-mono text-xs">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#e5e2e3]">Personalization</h1>
          <p className="text-xs text-[#929092] mt-0.5">
            driftwm geometry • wallpapers • visual accents
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleChooseFolder}
            className="px-2.5 py-1.5 rounded-xl bg-[#1a191d] border border-[#262529] hover:border-[#36353b] text-[#859aea] text-[11px] transition-colors cursor-pointer"
            title={t('persChooseFolderTitle')}
          >
            [ {t('persFolder')} ]
          </button>
          <button
            type="button"
            onClick={handleChooseFile}
            className="px-2.5 py-1.5 rounded-xl bg-[#1a191d] border border-[#262529] hover:border-[#36353b] text-[#a3d4a0] text-[11px] transition-colors cursor-pointer"
            title={t('persChooseFileTitle')}
          >
            [ {t('persFile')} ]
          </button>
          <button
            type="button"
            onClick={fetchWallpapers}
            disabled={loadingWallpapers}
            className="w-8 h-8 rounded-xl bg-[#1a191d] border border-[#262529] hover:border-[#36353b] text-[#c0c6dc] flex items-center justify-center text-xs transition-colors cursor-pointer"
            title={t('persRefreshWallpapers')}
          >
            {loadingWallpapers ? '..' : '::'}
          </button>
        </div>
      </div>

      {/* ── Bento Grid: Row 1 (2 Square Tiles side-by-side) ───────────── */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Tile 1: Corner Radius Metric */}
        <div className="minimal-card p-4 flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
              1
            </div>
            <span className="text-[10px] text-[#474648] font-mono">corners</span>
          </div>

          <div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-[#e5e2e3] tracking-tight">
                {currentCorners}
              </span>
              <span className="text-xs text-[#929092] ml-1 font-medium">px</span>
            </div>
            <div className="text-[11px] text-[#929092] font-medium mt-0.5">
              {t('persCornerRadius')}
            </div>
            <div className="flex items-center space-x-1.5 mt-2">
              {[0, 8, 16, 24].map((rad) => (
                <button
                  key={rad}
                  type="button"
                  onClick={() => onDecorationsChange({ ...decorations, corner_radius: rad })}
                  className={`px-1.5 py-0.5 rounded text-[9px] border transition-colors cursor-pointer ${
                    currentCorners === rad
                      ? 'bg-[#201f21] border-[#859aea] text-[#859aea]'
                      : 'bg-[#131315] border-[#262529] text-[#929092] hover:text-[#e5e2e3]'
                  }`}
                >
                  {rad}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tile 2: Border Width & Focused Color Metric */}
        <div className="minimal-card p-4 flex flex-col justify-between h-36">
          <div className="flex items-start justify-between">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-[#e5e2e3] tracking-tight">
                {currentBorderWidth}
              </span>
              <span className="text-xs text-[#929092] ml-1 font-medium">px</span>
            </div>
            <span className="text-[10px] text-[#474648] font-mono">border</span>
          </div>

          <div>
            <div className="text-[11px] text-[#929092] font-medium">{t('persBorderWidth')}</div>
            <div className="flex items-center space-x-1.5 mt-1">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: currentBorderFocused }}
              />
              <span className="text-xs font-semibold text-[#859aea] truncate">
                {currentBorderFocused}
              </span>
            </div>
            <div className="text-[10px] text-[#474648] mt-1 font-mono">
              outline {currentOutlineThickness}px
            </div>
          </div>
        </div>
      </div>

      {/* ── Bento Grid: Row 2 (Wide Card - Wallpapers Gallery) ───────── */}
      <div className="minimal-card p-4 space-y-3.5">
        <div className="flex items-center justify-between border-b border-[#262529] pb-2.5">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
              2
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#e5e2e3]">{t('persWallpaper')}</div>
              <div className="text-[10px] text-[#929092] truncate max-w-[280px]">
                {currentDir}
              </div>
            </div>
          </div>

          <span className="text-[10px] text-[#474648] font-mono shrink-0">
            {wallpapers.length} items
          </span>
        </div>

        {/* Wallpaper Thumbnails Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1 max-h-56 overflow-y-auto pr-1">
          {wallpapers.length === 0 && !loadingWallpapers ? (
            <div className="col-span-full py-6 text-center text-[11px] text-[#929092]">
              {t('persNoWallpapers')}
            </div>
          ) : (
            wallpapers.map((w) => {
              const isSelected = background.path === w.path;
              const isShader = w.type === 'shader';

              return (
                <button
                  key={w.path}
                  type="button"
                  onClick={() =>
                    onBackgroundChange({
                      type: isShader ? 'shader' : 'wallpaper',
                      path: w.path,
                    })
                  }
                  className={`group relative aspect-video rounded-xl overflow-hidden border transition-all cursor-pointer flex flex-col justify-end bg-[#131315] ${
                    isSelected
                      ? 'border-[#859aea] ring-1 ring-[#859aea]'
                      : 'border-[#262529] hover:border-[#36353b]'
                  }`}
                  title={w.name}
                >
                  {isShader ? (
                    <div className="absolute inset-0 bg-[#161518] flex items-center justify-center text-[10px] text-[#c0c6dc]">
                      [ shader ]
                    </div>
                  ) : (
                    <img
                      src={getWallpaperSrc(w)}
                      alt={w.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const raw = w.path.startsWith('~') ? w.path.replace('~', '/home/ikitto') : w.path;
                        if (!target.src.includes('media://')) {
                          target.src = `media://${raw}`;
                        }
                      }}
                    />
                  )}

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 text-[10px] text-[#859aea] font-bold z-10 bg-[#131315]/90 px-1 rounded">
                      ●
                    </div>
                  )}

                  {/* Label */}
                  <div className="relative z-10 w-full bg-[#161518]/90 border-t border-[#262529]/60 px-1.5 py-0.5 text-[9px] text-[#e5e2e3] truncate text-left">
                    {w.name}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Bento Grid: Row 3 (Wide Card - Borders & Palette) ─────────── */}
      <div className="minimal-card p-4 space-y-3.5">
        <div className="flex items-center space-x-2.5 border-b border-[#262529] pb-2.5">
          <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
            3
          </div>
          <div>
            <div className="text-xs font-semibold text-[#e5e2e3]">{t('persBordersAndCorners')}</div>
            <div className="text-[10px] text-[#929092]">{t('persBordersDesc')}</div>
          </div>
        </div>

        <div className="space-y-3.5 pt-1">
          {/* Border Width Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#929092]">{t('persBorderWidth')}</span>
              <span className="text-[#e5e2e3] font-bold">{currentBorderWidth} px</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={currentBorderWidth}
              onChange={(e) =>
                onDecorationsChange({
                  ...decorations,
                  border_width: parseInt(e.target.value, 10),
                })
              }
              className="w-full cursor-pointer"
            />
          </div>

          {/* Border Color Focused Swatches */}
          {currentBorderWidth > 0 && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#929092]">{t('persBorderFocused')}</span>
              <div className="flex items-center space-x-2">
                {presetColors.map((color) => {
                  const isSelected = currentBorderFocused.toLowerCase() === color.toLowerCase();
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        onDecorationsChange({ ...decorations, border_color_focused: color })
                      }
                      style={{ backgroundColor: color }}
                      className={`w-4 h-4 rounded-full transition-all cursor-pointer ${
                        isSelected ? 'ring-2 ring-[#859aea] scale-110' : 'opacity-75 hover:opacity-100'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Border Color Unfocused Swatches */}
          {currentBorderWidth > 0 && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#929092]">{t('persBorderUnfocused')}</span>
              <div className="flex items-center space-x-2">
                {presetColors.map((color) => {
                  const isSelected = currentBorderUnfocused.toLowerCase() === color.toLowerCase();
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        onDecorationsChange({ ...decorations, border_color: color })
                      }
                      style={{ backgroundColor: color }}
                      className={`w-4 h-4 rounded-full transition-all cursor-pointer ${
                        isSelected ? 'ring-2 ring-[#859aea] scale-110' : 'opacity-75 hover:opacity-100'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Corner Radius Slider */}
          <div className="space-y-1.5 pt-1 border-t border-[#262529]">
            <div className="flex justify-between text-xs">
              <span className="text-[#929092]">{t('persCornerRadius')}</span>
              <span className="text-[#e5e2e3] font-bold">{currentCorners} px</span>
            </div>
            <input
              type="range"
              min="0"
              max="32"
              step="1"
              value={currentCorners}
              onChange={(e) =>
                onDecorationsChange({
                  ...decorations,
                  corner_radius: parseInt(e.target.value, 10),
                })
              }
              className="w-full cursor-pointer"
            />
          </div>

          {/* Monitor Outline Thickness */}
          <div className="space-y-1.5 pt-1 border-t border-[#262529]">
            <div className="flex justify-between text-xs">
              <span className="text-[#929092]">{t('persOutlineThickness')}</span>
              <span className="text-[#e5e2e3] font-bold">{currentOutlineThickness} px</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              step="1"
              value={currentOutlineThickness}
              onChange={(e) =>
                onOutlineChange({
                  ...outline,
                  thickness: parseInt(e.target.value, 10),
                })
              }
              className="w-full cursor-pointer"
            />
          </div>

          {/* Monitor Outline Color Swatches */}
          {currentOutlineThickness > 0 && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#929092]">{t('persOutlineColor')}</span>
              <div className="flex items-center space-x-2">
                {presetColors.map((color) => {
                  const isSelected = currentOutlineColor.toLowerCase() === color.toLowerCase();
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        onOutlineChange({ ...outline, color })
                      }
                      style={{ backgroundColor: color }}
                      className={`w-4 h-4 rounded-full transition-all cursor-pointer ${
                        isSelected ? 'ring-2 ring-[#859aea] scale-110' : 'opacity-75 hover:opacity-100'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bento Grid: Row 4 (Wide Card - Blur & Visual Effects) ─────── */}
      <div className="minimal-card p-4 space-y-3.5">
        <div className="flex items-center justify-between border-b border-[#262529] pb-2.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
              4
            </div>
            <div>
              <div className="text-xs font-semibold text-[#e5e2e3]">{t('persVisualEffects')}</div>
              <div className="text-[10px] text-[#929092]">Dual Kawase Backdrop Shader</div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-[#859aea]">
            {currentBlur} px
          </div>
        </div>

        <div className="space-y-3.5 pt-1">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#929092]">{t('persBlurRadius')}</span>
              <span className="text-[#e5e2e3] font-bold">{currentBlur} px</span>
            </div>
            <input
              type="range"
              min="0"
              max="32"
              step="1"
              value={currentBlur}
              onChange={(e) =>
                onEffectsChange({
                  ...effects,
                  blur_radius: parseInt(e.target.value, 10),
                })
              }
              className="w-full cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#262529]">
            <span className="text-xs text-[#e5e2e3]">{t('persAnimateBlur')}</span>
            <Toggle
              checked={effects.animate_blur ?? true}
              onChange={(val) => onEffectsChange({ ...effects, animate_blur: val })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationView;
