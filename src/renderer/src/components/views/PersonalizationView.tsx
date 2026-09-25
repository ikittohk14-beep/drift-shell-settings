import React, { useState, useEffect } from 'react';
import { Folder, File, RotateCw, Pipette, Maximize2, Palette, Image as ImageIcon, Sparkles } from 'lucide-react';
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

type ColorTarget = 'focused' | 'unfocused' | 'outline';

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
  const { t, language } = useI18n();
  const [wallpapers, setWallpapers] = useState<WallpaperItem[]>([]);
  const [currentDir, setCurrentDir] = useState<string>('~/Пикчи/Обои');
  const [loadingWallpapers, setLoadingWallpapers] = useState<boolean>(true);
  const [activeColorTarget, setActiveColorTarget] = useState<ColorTarget>('focused');

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

  const currentBlurRadius = effects.blur_radius ?? 2;
  const currentBlurStrength = typeof effects.blur_strength === 'number' ? effects.blur_strength : 1.1;
  const currentAnimateBlur = effects.animate_blur ?? false;
  const currentCorners = decorations.corner_radius ?? 16;
  const currentBorderWidth = decorations.border_width ?? 0;
  const currentBorderFocused = decorations.border_color_focused || '#e5e2e3';
  const currentBorderUnfocused = decorations.border_color || '#262529';
  const currentOutlineColor = outline.color || '#e5e2e3';
  const currentOutlineThickness = outline.thickness ?? 2;

  // Matugen-Slate & Kitty palette presets
  const presetColors = [
    { name: 'Silver', hex: '#e5e2e3' },
    { name: 'Dark Slate', hex: '#262529' },
    { name: 'Steel Blue', hex: '#859aea' },
    { name: 'Lavender', hex: '#c0c6dc' },
    { name: 'Sage Mint', hex: '#a3d4a0' },
    { name: 'Dusty Coral', hex: '#ffb4ab' },
    { name: 'Warm Sand', hex: '#e8cf8d' },
    { name: 'Frost Cyan', hex: '#88c0d0' },
    { name: 'Pure White', hex: '#ffffff' },
    { name: 'Graphite', hex: '#131315' },
  ];

  const getCurrentTargetColor = (): string => {
    if (activeColorTarget === 'focused') return currentBorderFocused;
    if (activeColorTarget === 'unfocused') return currentBorderUnfocused;
    return currentOutlineColor;
  };

  const handleColorChange = (hex: string) => {
    if (activeColorTarget === 'focused') {
      onDecorationsChange({ ...decorations, border_color_focused: hex });
    } else if (activeColorTarget === 'unfocused') {
      onDecorationsChange({ ...decorations, border_color: hex });
    } else {
      onOutlineChange({ ...outline, color: hex });
    }
  };

  const getWallpaperSrc = (w: WallpaperItem): string => {
    if (w.previewUrl) return w.previewUrl;
    const resolvedPath = w.path.startsWith('~')
      ? w.path.replace('~', '/home/ikitto')
      : w.path;
    return `file://${resolvedPath}`;
  };

  return (
    <div className="space-y-4 max-w-3xl text-[#e5e2e3] font-mono text-sm">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#e5e2e3]">{t('tabPersonalization')}</h1>
          <p className="text-sm text-[#929092] mt-1">
            {t('persBordersDesc')}
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={handleChooseFolder}
            className="px-3 py-1.5 rounded-xl bg-[#201f24] hover:bg-[#2b2a30] border border-[#262529] hover:border-[#36353b] text-[#e5e2e3] text-xs transition-colors cursor-pointer flex items-center space-x-1.5"
            title={t('persChooseFolderTitle')}
          >
            <Folder className="w-4 h-4 text-[#929092]" />
            <span>{t('persFolder')}</span>
          </button>
          <button
            type="button"
            onClick={handleChooseFile}
            className="px-3 py-1.5 rounded-xl bg-[#201f24] hover:bg-[#2b2a30] border border-[#262529] hover:border-[#36353b] text-[#e5e2e3] text-xs transition-colors cursor-pointer flex items-center space-x-1.5"
            title={t('persChooseFileTitle')}
          >
            <File className="w-4 h-4 text-[#929092]" />
            <span>{t('persFile')}</span>
          </button>
          <button
            type="button"
            onClick={fetchWallpapers}
            disabled={loadingWallpapers}
            className="w-9 h-9 rounded-xl bg-[#201f24] hover:bg-[#2b2a30] border border-[#262529] hover:border-[#36353b] text-[#929092] hover:text-[#e5e2e3] flex items-center justify-center transition-colors cursor-pointer"
            title={t('persRefreshWallpapers')}
          >
            <RotateCw className={`w-4 h-4 ${loadingWallpapers ? 'animate-spin text-[#e5e2e3]' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Bento Grid: Row 1 (2 Square Tiles side-by-side) ───────────── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Tile 1: Corner Radius Metric */}
        <div className="minimal-card p-5 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#201f24] border border-[#262529] flex items-center justify-center text-[#e5e2e3]">
              <Maximize2 className="w-4 h-4" />
            </div>
            <span className="text-xs text-[#474648] font-mono">
              {language === 'ru' ? 'скругление' : 'corners'}
            </span>
          </div>

          <div>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-[#e5e2e3] tracking-tight">
                {currentCorners}
              </span>
              <span className="text-sm text-[#929092] ml-1 font-medium">px</span>
            </div>
            <div className="text-xs text-[#929092] font-medium mt-0.5">
              {t('persCornerRadius')}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              {[0, 8, 16, 24, 32].map((rad) => (
                <button
                  key={rad}
                  type="button"
                  onClick={() => onDecorationsChange({ ...decorations, corner_radius: rad })}
                  className={`px-2 py-0.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                    currentCorners === rad
                      ? 'bg-[#201f24] border-[#e5e2e3] text-[#e5e2e3] font-bold'
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
        <div className="minimal-card p-5 flex flex-col justify-between h-40">
          <div className="flex items-start justify-between">
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-[#e5e2e3] tracking-tight">
                {currentBorderWidth}
              </span>
              <span className="text-sm text-[#929092] ml-1 font-medium">px</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#201f24] border border-[#262529] flex items-center justify-center text-[#e5e2e3]">
              <Palette className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-xs text-[#929092] font-medium">{t('persBorderWidth')}</div>
            <div className="flex items-center space-x-2 mt-1">
              <span
                className="w-3.5 h-3.5 rounded-full shrink-0 border border-[#262529] shadow-sm"
                style={{ backgroundColor: currentBorderFocused }}
              />
              <span className="text-sm font-semibold text-[#e5e2e3] truncate uppercase">
                {currentBorderFocused}
              </span>
            </div>
            <div className="text-xs text-[#474648] mt-1 font-mono">
              {language === 'ru' ? 'внешний контур' : 'outline'} {currentOutlineThickness}px
            </div>
          </div>
        </div>
      </div>

      {/* ── Bento Grid: Row 2 (Wallpapers Gallery) ───────────────────── */}
      <div className="minimal-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#262529] pb-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#201f24] border border-[#262529] flex items-center justify-center text-[#e5e2e3]">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[#e5e2e3]">{t('persWallpaper')}</div>
              <div className="text-xs text-[#929092] truncate max-w-md">
                {currentDir}
              </div>
            </div>
          </div>

          <div className="text-xs text-[#929092] shrink-0 font-mono">
            {wallpapers.length} {language === 'ru' ? 'файлов' : 'files'}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-3 gap-3.5 max-h-72 overflow-y-auto pr-1">
          {wallpapers.length === 0 ? (
            <div className="col-span-3 py-8 text-center text-sm text-[#929092]">
              {loadingWallpapers ? (language === 'ru' ? 'Загрузка обоев...' : 'Loading...') : t('persNoWallpapers')}
            </div>
          ) : (
            wallpapers.map((w) => {
              const isActive = background.path === w.path;
              const isShader = w.type === 'shader' || w.path.endsWith('.glsl');

              return (
                <div
                  key={w.path}
                  onClick={() =>
                    onBackgroundChange({
                      type: isShader ? 'shader' : 'wallpaper',
                      path: w.path,
                    })
                  }
                  className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all aspect-video bg-[#1a191d] ${
                    isActive
                      ? 'border-[#a6d189] ring-2 ring-[#a6d189]/30'
                      : 'border-[#262529] hover:border-[#36353b]'
                  }`}
                >
                  {isShader ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#161518] p-2 text-center">
                      <span className="text-xs font-bold text-[#e5e2e3]">GLSL SHADER</span>
                      <span className="text-[10px] text-[#929092] truncate max-w-[120px] mt-1 font-mono">
                        {w.name}
                      </span>
                    </div>
                  ) : (
                    <img
                      src={getWallpaperSrc(w)}
                      alt={w.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}

                  {/* Caption bar */}
                  <div className="absolute inset-x-0 bottom-0 bg-[#131315]/85 backdrop-blur-xs p-1.5 px-2.5 flex items-center justify-between border-t border-[#262529]/60">
                    <span className="text-xs font-medium text-[#e5e2e3] truncate">
                      {w.name}
                    </span>
                    {isActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#a6d189]/15 text-[#a6d189] border border-[#a6d189]/30 font-bold">
                        ✓ {language === 'ru' ? 'Активно' : 'Active'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Bento Grid: Row 3 (Wide Card - Borders, Corners & Color Picker) ─ */}
      <div className="minimal-card p-5 space-y-4">
        <div className="flex items-center space-x-3 border-b border-[#262529] pb-3">
          <div className="w-8 h-8 rounded-xl bg-[#201f24] border border-[#262529] flex items-center justify-center text-[#e5e2e3]">
            <Pipette className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#e5e2e3]">{t('persBordersAndCorners')}</div>
            <div className="text-xs text-[#929092]">{t('persBordersDesc')}</div>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          {/* Sliders Grid: Width & Thickness */}
          <div className="grid grid-cols-2 gap-4">
            {/* Border Width Slider */}
            <div className="space-y-2 bg-[#201f24]/40 p-3.5 rounded-2xl border border-[#262529]">
              <div className="flex justify-between text-xs">
                <span className="text-[#929092] font-medium">{t('persBorderWidth')}</span>
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
                className="w-full cursor-pointer accent-[#e5e2e3]"
              />
            </div>

            {/* Corner Radius Slider */}
            <div className="space-y-2 bg-[#201f24]/40 p-3.5 rounded-2xl border border-[#262529]">
              <div className="flex justify-between text-xs">
                <span className="text-[#929092] font-medium">{t('persCornerRadius')}</span>
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
                className="w-full cursor-pointer accent-[#e5e2e3]"
              />
            </div>
          </div>

          {/* Monitor Outline Thickness */}
          <div className="space-y-2 bg-[#201f24]/40 p-3.5 rounded-2xl border border-[#262529]">
            <div className="flex justify-between text-xs">
              <span className="text-[#929092] font-medium">{t('persOutlineThickness')}</span>
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
              className="w-full cursor-pointer accent-[#e5e2e3]"
            />
          </div>

          {/* ── COLOR SELECTION SECTION ───────────────────────────── */}
          <div className="bg-[#1a191d] p-4.5 rounded-2xl border border-[#262529] space-y-4">
            <div className="flex items-center justify-between border-b border-[#262529] pb-3">
              <div>
                <div className="text-sm font-semibold text-[#e5e2e3]">
                  {language === 'ru' ? 'Выбор цвета элементов' : 'Color Customization'}
                </div>
                <div className="text-xs text-[#929092]">
                  {language === 'ru' ? 'Выберите элемент для настройки цвета' : 'Select component to customize color'}
                </div>
              </div>

              {/* Target Switcher Tabs */}
              <div className="flex items-center space-x-1 p-1 bg-[#131315] rounded-xl border border-[#262529]">
                <button
                  type="button"
                  onClick={() => setActiveColorTarget('focused')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeColorTarget === 'focused'
                      ? 'bg-[#201f24] text-[#e5e2e3] border border-[#262529]'
                      : 'text-[#929092] hover:text-[#e5e2e3]'
                  }`}
                >
                  {language === 'ru' ? 'Активная' : 'Focused'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveColorTarget('unfocused')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeColorTarget === 'unfocused'
                      ? 'bg-[#201f24] text-[#e5e2e3] border border-[#262529]'
                      : 'text-[#929092] hover:text-[#e5e2e3]'
                  }`}
                >
                  {language === 'ru' ? 'Неактивная' : 'Unfocused'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveColorTarget('outline')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeColorTarget === 'outline'
                      ? 'bg-[#201f24] text-[#e5e2e3] border border-[#262529]'
                      : 'text-[#929092] hover:text-[#e5e2e3]'
                  }`}
                >
                  {language === 'ru' ? 'Экран' : 'Outline'}
                </button>
              </div>
            </div>

            {/* Current Color Details & Custom Picker */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative group cursor-pointer">
                  {/* Color Swatch / Native Picker Trigger */}
                  <div
                    className="w-10 h-10 rounded-xl border border-[#36353b] shadow-inner flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ backgroundColor: getCurrentTargetColor() }}
                  >
                    <Pipette className="w-4 h-4 text-white/80 drop-shadow mix-blend-difference" />
                  </div>
                  <input
                    type="color"
                    value={getCurrentTargetColor()}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    title={language === 'ru' ? 'Открыть палитру' : 'Open color picker'}
                  />
                </div>

                <div>
                  <div className="text-xs text-[#929092]">
                    {activeColorTarget === 'focused'
                      ? (language === 'ru' ? 'Цвет активной рамки окна' : 'Focused window border')
                      : activeColorTarget === 'unfocused'
                      ? (language === 'ru' ? 'Цвет неактивной рамки окна' : 'Unfocused window border')
                      : (language === 'ru' ? 'Цвет внешнего контура экрана' : 'Screen outline color')}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="text"
                      value={getCurrentTargetColor()}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                          handleColorChange(val);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#131315] border border-[#262529] focus:border-[#e5e2e3] text-xs font-mono font-bold text-[#e5e2e3] uppercase w-24 outline-none transition-colors"
                      maxLength={7}
                    />
                    <span className="text-xs text-[#474648]">HEX</span>
                  </div>
                </div>
              </div>

              {/* Mini Preview Box */}
              <div className="flex items-center space-x-3 bg-[#131315] p-2 px-3 rounded-xl border border-[#262529]">
                <span className="text-xs text-[#929092]">{language === 'ru' ? 'Превью:' : 'Preview:'}</span>
                <div
                  className="w-14 h-8 bg-[#1a191d] flex items-center justify-center transition-all"
                  style={{
                    borderRadius: `${Math.min(currentCorners, 12)}px`,
                    borderWidth: `${Math.max(1, Math.min(currentBorderWidth, 4))}px`,
                    borderColor: getCurrentTargetColor(),
                  }}
                >
                  <span className="text-[9px] text-[#929092]">окно</span>
                </div>
              </div>
            </div>

            {/* Quick Palette Swatches */}
            <div className="space-y-2 pt-1 border-t border-[#262529]/60">
              <div className="text-xs text-[#929092] font-medium">
                {language === 'ru' ? 'Готовые палитры (Matugen-Slate / Catppuccin):' : 'Preset palettes:'}
              </div>
              <div className="flex items-center flex-wrap gap-2.5">
                {presetColors.map((color) => {
                  const isSelected = getCurrentTargetColor().toLowerCase() === color.hex.toLowerCase();
                  return (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => handleColorChange(color.hex)}
                      className={`group relative flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#201f24] border-[#e5e2e3] text-[#e5e2e3]'
                          : 'bg-[#131315] border-[#262529] hover:border-[#36353b] text-[#929092]'
                      }`}
                      title={`${color.name} (${color.hex})`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/30 shadow-inner"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs font-medium">{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bento Grid: Row 4 (Wide Card - Blur & Visual Effects) ─────── */}
      <div className="minimal-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#262529] pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#201f24] border border-[#262529] flex items-center justify-center text-[#e5e2e3]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#e5e2e3]">{t('persVisualEffects')}</div>
              <div className="text-xs text-[#929092]">
                {language === 'ru' ? 'Аппаратный шейдер Dual Kawase в driftwm' : 'Dual Kawase Backdrop Shader in driftwm'}
              </div>
            </div>
          </div>

          <div className="text-xs font-mono text-[#e5e2e3]">
            R: {currentBlurRadius} · S: {currentBlurStrength.toFixed(1)}
          </div>
        </div>

        <div className="space-y-4 pt-1">
          {/* Parameter 1: blur_radius (passes) */}
          <div className="space-y-2 bg-[#201f24]/40 p-3.5 rounded-2xl border border-[#262529]">
            <div className="flex justify-between text-xs">
              <span className="text-[#929092] font-medium">{t('persBlurRadius')}</span>
              <span className="text-[#e5e2e3] font-bold">
                {currentBlurRadius} {language === 'ru' ? 'проходов' : 'passes'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              step="1"
              value={currentBlurRadius}
              onChange={(e) =>
                onEffectsChange({
                  ...effects,
                  blur_radius: parseInt(e.target.value, 10),
                })
              }
              className="w-full cursor-pointer accent-[#e5e2e3]"
            />
            <div className="flex items-center justify-between text-xs text-[#474648]">
              <span>{language === 'ru' ? '0 (выкл)' : '0 (off)'}</span>
              <div className="flex items-center space-x-2">
                {[0, 1, 2, 4, 6].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onEffectsChange({ ...effects, blur_radius: p })}
                    className={`px-2 py-0.5 rounded-lg border transition-colors cursor-pointer text-xs ${
                      currentBlurRadius === p
                        ? 'border-[#e5e2e3] text-[#e5e2e3] bg-[#e5e2e3]/10 font-bold'
                        : 'border-[#262529] text-[#929092] hover:text-[#e5e2e3]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <span>{language === 'ru' ? '8 (макс)' : '8 (max)'}</span>
            </div>
          </div>

          {/* Parameter 2: blur_strength (spread) */}
          <div className="space-y-2 bg-[#201f24]/40 p-3.5 rounded-2xl border border-[#262529]">
            <div className="flex justify-between text-xs">
              <span className="text-[#929092] font-medium">{t('persBlurStrength')}</span>
              <span className="text-[#e5e2e3] font-bold">
                {currentBlurStrength.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="3.0"
              step="0.1"
              value={currentBlurStrength}
              onChange={(e) =>
                onEffectsChange({
                  ...effects,
                  blur_strength: Math.round(parseFloat(e.target.value) * 10) / 10,
                })
              }
              className="w-full cursor-pointer accent-[#e5e2e3]"
            />
            <div className="flex items-center justify-between text-xs text-[#474648]">
              <span>0.0</span>
              <div className="flex items-center space-x-2">
                {[0.0, 0.5, 1.1, 1.5, 2.0].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onEffectsChange({ ...effects, blur_strength: s })}
                    className={`px-2 py-0.5 rounded-lg border transition-colors cursor-pointer text-xs ${
                      Math.abs(currentBlurStrength - s) < 0.05
                        ? 'border-[#e5e2e3] text-[#e5e2e3] bg-[#e5e2e3]/10 font-bold'
                        : 'border-[#262529] text-[#929092] hover:text-[#e5e2e3]'
                    }`}
                  >
                    {s === 1.1 ? (language === 'ru' ? '1.1 (дефолт)' : '1.1 (def)') : s.toFixed(1)}
                  </button>
                ))}
              </div>
              <span>3.0</span>
            </div>
          </div>

          {/* Parameter 3: animate_blur */}
          <div className="flex items-center justify-between p-3.5 bg-[#201f24]/40 rounded-2xl border border-[#262529]">
            <div className="pr-3">
              <div className="text-sm text-[#e5e2e3] font-medium">{t('persAnimateBlur')}</div>
              <div className="text-xs text-[#929092] mt-0.5">{t('persAnimateBlurDesc')}</div>
            </div>
            <Toggle
              checked={currentAnimateBlur}
              onChange={(val) => onEffectsChange({ ...effects, animate_blur: val })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationView;
