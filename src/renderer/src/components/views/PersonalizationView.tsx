import React, { useState, useEffect } from 'react';
import { Image, Sparkles, Check, RefreshCw, FolderOpen, FileUp } from 'lucide-react';
import Toggle from '../Toggle';
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
  const currentBorderUnfocused = decorations.border_color || '#2a282d';
  const currentOutlineColor = outline.color || '#e5e2e3';
  const currentOutlineThickness = outline.thickness ?? 2;

  // Matugen-Slate palette presets
  const presetColors = ['#e5e2e3', '#ffb4ab', '#e8cf8d', '#a3d4a0', '#88c0d0', '#859aea', '#c0c6dc', '#2a282d'];

  const getWallpaperSrc = (w: WallpaperItem): string => {
    if (w.previewUrl) return w.previewUrl;
    const resolvedPath = w.path.startsWith('~')
      ? w.path.replace('~', '/home/ikitto')
      : w.path;
    return `file://${resolvedPath}`;
  };

  return (
    <div className="space-y-4 max-w-xl animate-fadeIn text-[#e5e2e3]">
      {/* ── Wallpaper Selection Card ──────────────────────────────────── */}
      <div className="frosted-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#242329] border border-[#2a282d] flex items-center justify-center text-[#859aea] shadow-sm shrink-0">
              <Image className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="text-sm font-semibold text-[#e5e2e3]">Обои рабочего стола</div>
              <div className="text-xs text-[#929092] truncate max-w-[280px]">
                Папка: {currentDir}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              type="button"
              onClick={handleChooseFolder}
              className="p-2 rounded-lg bg-[#242329] hover:bg-[#2e2d35] border border-[#2a282d] text-[#929092] hover:text-[#e5e2e3] transition-colors cursor-pointer flex items-center space-x-1.5 text-xs"
              title="Выбрать папку с обоями"
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#859aea]" />
              <span className="hidden sm:inline">Папка</span>
            </button>

            <button
              type="button"
              onClick={handleChooseFile}
              className="p-2 rounded-lg bg-[#242329] hover:bg-[#2e2d35] border border-[#2a282d] text-[#929092] hover:text-[#e5e2e3] transition-colors cursor-pointer flex items-center space-x-1.5 text-xs"
              title="Выбрать файл обоев"
            >
              <FileUp className="w-3.5 h-3.5 text-[#88c0d0]" />
              <span className="hidden sm:inline">Файл</span>
            </button>

            <button
              type="button"
              onClick={fetchWallpapers}
              className="p-2 rounded-lg bg-[#242329] hover:bg-[#2e2d35] border border-[#2a282d] text-[#929092] hover:text-[#e5e2e3] transition-colors cursor-pointer"
              title="Обновить список обоев"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingWallpapers ? 'animate-spin text-[#859aea]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Wallpaper Thumbnails Grid with Real Image Previews */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1 max-h-56 overflow-y-auto pr-1">
          {wallpapers.length === 0 && !loadingWallpapers ? (
            <div className="col-span-full py-8 text-center text-xs text-[#929092]">
              В папке нет обоев
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
                  className={`group relative aspect-video rounded-xl overflow-hidden border transition-all cursor-pointer flex flex-col justify-end p-1.5 bg-[#161519] ${
                    isSelected
                      ? 'border-[#859aea] shadow-lg scale-95 ring-2 ring-[#859aea]/40'
                      : 'border-[#2a282d] hover:border-[#3d3b42] hover:scale-[1.02]'
                  }`}
                  title={w.name}
                >
                  {/* Real Image or Shader background */}
                  {isShader ? (
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#161519] to-[#242329] flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-[#859aea]/60" />
                    </div>
                  ) : (
                    <img
                      src={getWallpaperSrc(w)}
                      alt={w.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const raw = w.path.startsWith('~') ? w.path.replace('~', '/home/ikitto') : w.path;
                        if (!target.src.includes('media://')) {
                          target.src = `media://${raw}`;
                        }
                      }}
                    />
                  )}

                  {/* Gradient shadow for text readability */}
                  <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#859aea] text-[#131315] flex items-center justify-center shadow-md z-10">
                      <Check className="w-2.5 h-2.5 font-bold" />
                    </div>
                  )}

                  {/* Filename */}
                  <span className="relative z-10 text-[9px] font-mono text-[#e5e2e3] truncate px-0.5">
                    {w.name}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Window Borders & Decorations ──────────────────────────────── */}
      <div className="frosted-card p-5 space-y-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#242329] border border-[#2a282d] flex items-center justify-center text-[#859aea] shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#e5e2e3]">Рамки и скругления окон (driftwm)</div>
            <div className="text-xs text-[#929092]">
              Декорации и обводка окон композитором
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          {/* Border Width Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#929092]">Толщина обводки окон (border_width):</span>
              <span className="font-mono text-[#e5e2e3] font-medium">{currentBorderWidth} px</span>
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

          {/* Border Color Focused */}
          {currentBorderWidth > 0 && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#929092]">Цвет активного окна (focused):</span>
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
                      className={`w-5 h-5 rounded-full transition-transform flex items-center justify-center cursor-pointer ${
                        isSelected ? 'scale-125 ring-2 ring-[#859aea]' : 'opacity-80'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Border Color Unfocused */}
          {currentBorderWidth > 0 && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#929092]">Цвет неактивного окна (unfocused):</span>
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
                      className={`w-5 h-5 rounded-full transition-transform flex items-center justify-center cursor-pointer ${
                        isSelected ? 'scale-125 ring-2 ring-[#859aea]' : 'opacity-80'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Corner Radius Slider */}
          <div className="space-y-1.5 pt-1 border-t border-[#2a282d]">
            <div className="flex justify-between text-xs">
              <span className="text-[#929092]">Скругление углов окон (corner_radius):</span>
              <span className="font-mono text-[#e5e2e3] font-medium">{currentCorners} px</span>
            </div>
            <input
              type="range"
              min="0"
              max="32"
              step="2"
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
        </div>
      </div>

      {/* ── Visual Effects (Blur & Animations) ───────────────────────── */}
      <div className="frosted-card p-5 space-y-4">
        <div className="text-xs font-semibold text-[#636265] uppercase tracking-wider">
          Эффекты размытия и анимации
        </div>

        <div className="space-y-4 pt-1">
          {/* Blur Radius Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#929092]">Сила размытия фона (blur_radius):</span>
              <span className="font-mono text-[#e5e2e3] font-medium">{currentBlur} px</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={currentBlur}
              onChange={(e) =>
                onEffectsChange({ ...effects, blur_radius: parseInt(e.target.value, 10) })
              }
              className="w-full cursor-pointer"
            />
          </div>

          {/* Animate blur toggle */}
          <div className="flex items-center justify-between pt-1 border-t border-[#2a282d]">
            <span className="text-xs text-[#929092]">Плавная анимация окон при открытии</span>
            <Toggle
              checked={effects.animate_blur ?? false}
              onChange={(val) => onEffectsChange({ ...effects, animate_blur: val })}
            />
          </div>
        </div>
      </div>

      {/* ── Screen Outline Card ───────────────────────────────────────── */}
      <div className="frosted-card p-5 space-y-3">
        <div className="text-xs font-semibold text-[#636265] uppercase tracking-wider">
          Внешняя рамка мониторов (output outline)
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-[#929092]">Цвет рамки:</span>
          <div className="flex items-center space-x-2">
            {presetColors.map((color) => {
              const isSelected = currentOutlineColor.toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => onOutlineChange({ ...outline, color })}
                  style={{ backgroundColor: color }}
                  className={`w-5 h-5 rounded-full transition-transform flex items-center justify-center cursor-pointer ${
                    isSelected ? 'scale-125 ring-2 ring-[#859aea]' : 'opacity-80'
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs">
            <span className="text-[#929092]">Толщина (thickness):</span>
            <span className="font-mono text-[#e5e2e3] font-medium">{currentOutlineThickness} px</span>
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
    </div>
  );
};

export default PersonalizationView;
