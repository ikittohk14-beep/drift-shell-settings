import React, { useState, useEffect } from 'react';
import { Image, Check, Sparkles, RefreshCw, Play } from 'lucide-react';
import type { BackgroundConfig, WallpaperItem } from '../../../../preload/types';

interface WallpapersViewProps {
  background: BackgroundConfig;
  onBackgroundChange: (bg: BackgroundConfig) => void;
}

export const WallpapersView: React.FC<WallpapersViewProps> = ({
  background,
  onBackgroundChange,
}) => {
  const [wallpapers, setWallpapers] = useState<WallpaperItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [customPath, setCustomPath] = useState<string>(background.path || '');

  const fetchWallpapers = async () => {
    try {
      setLoading(true);
      if (window.driftAPI?.getWallpapers) {
        const items = await window.driftAPI.getWallpapers();
        setWallpapers(items);
      }
    } catch (err) {
      console.error('[WallpapersView] Error fetching wallpapers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallpapers();
  }, []);

  const handleSelect = (item: WallpaperItem) => {
    setCustomPath(item.path);
    onBackgroundChange({
      type: item.type === 'shader' ? 'shader' : 'wallpaper',
      path: item.path,
    });
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPath.trim()) return;
    onBackgroundChange({
      type: customPath.endsWith('.glsl') ? 'shader' : 'wallpaper',
      path: customPath.trim(),
    });
  };

  const activePath = background.path || '';

  return (
    <div className="space-y-6 pb-6 select-none">
      {/* ── Active Background Header ───────────────────────────────────── */}
      <section className="bg-white/[0.03] hover:bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5 backdrop-blur-md transition-all shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-sm">
              <Image className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">
                Активный фон рабочего стола
              </h2>
              <p className="text-[11px] text-white/40">
                Текущий файл обоев или анимированного шейдера в driftwm
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchWallpapers}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white/80 hover:text-white text-xs transition-all cursor-pointer border border-white/[0.05]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#1ed760]' : ''}`} />
            <span>Обновить список</span>
          </button>
        </div>

        {/* Custom path input pill */}
        <form onSubmit={handleApplyCustom} className="flex items-center space-x-2">
          <input
            type="text"
            value={customPath}
            onChange={(e) => setCustomPath(e.target.value)}
            placeholder="Путь к файлу (например: ~/Пикчи/Обои/wallpaper.jpg или *.glsl)"
            className="flex-1 px-4 py-2 bg-white/[0.06] border border-white/[0.1] rounded-full text-xs text-white font-mono placeholder-white/30 focus:border-[#1ed760] focus:outline-none transition-all shadow-inner"
          />
          <button
            type="submit"
            className="px-5 py-2 rounded-full bg-[#1ed760] text-neutral-950 font-semibold text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-glow-green shrink-0"
          >
            Применить
          </button>
        </form>
      </section>

      {/* ── Spotify-Style Wallpaper / Shader Album Grid ─────────────────── */}
      <section className="bg-white/[0.03] hover:bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5 backdrop-blur-md transition-all shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide">
              Галерея фонов и шейдеров
            </h2>
            <p className="text-[11px] text-white/40">
              Нажмите на плитку для моментальной установки обоев в driftwm
            </p>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/60 font-mono">
            {wallpapers.length} доступно
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-white/40 font-mono flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#1ed760]" />
            <span>Сканирование каталогов с обоями...</span>
          </div>
        ) : wallpapers.length === 0 ? (
          <div className="text-center py-12 text-xs text-white/40 font-mono">
            Обои не найдены в ~/Пикчи/Обои/ или ~/driftwm/wallpapers/
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {wallpapers.map((item) => {
              const isActive = activePath === item.path;
              const isShader = item.type === 'shader';

              return (
                <div
                  key={item.path}
                  onClick={() => handleSelect(item)}
                  className={`group relative p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'bg-white/[0.12] border-[#1ed760] shadow-glow-green/30'
                      : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.05] hover:border-white/[0.14]'
                  }`}
                >
                  {/* Visual Artwork Thumbnail */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/40 mb-3 border border-white/10 flex items-center justify-center group-hover:shadow-md transition-all">
                    {isShader ? (
                      <div className="w-full h-full bg-gradient-to-tr from-purple-800 via-indigo-900 to-cyan-800 flex flex-col items-center justify-center p-3 text-center">
                        <Sparkles className="w-8 h-8 text-cyan-300 animate-pulse mb-1" />
                        <span className="text-[10px] font-mono text-cyan-200 font-semibold uppercase tracking-wider">
                          GLSL Shader
                        </span>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-neutral-800 to-neutral-700 flex items-center justify-center">
                        <Image className="w-10 h-10 text-white/30 group-hover:scale-110 transition-transform duration-200" />
                      </div>
                    )}

                    {/* Floating Spotify Play / Active button on card */}
                    <div
                      className={`absolute right-2 bottom-2 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-[#1ed760] text-neutral-950 scale-100 shadow-glow-green'
                          : 'bg-[#1ed760] text-neutral-950 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 scale-90 hover:scale-105'
                      }`}
                    >
                      {isActive ? (
                        <Check className="w-4 h-4 font-bold" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Title and metadata */}
                  <div className="min-w-0">
                    <div
                      className={`text-xs font-semibold truncate ${
                        isActive ? 'text-white' : 'text-white/80 group-hover:text-white'
                      }`}
                      title={item.name}
                    >
                      {item.name}
                    </div>
                    <div className="flex items-center space-x-1.5 mt-1">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-medium uppercase ${
                          isShader
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-white/[0.06] text-white/50 border border-white/[0.08]'
                        }`}
                      >
                        {item.type}
                      </span>
                      {isActive && (
                        <span className="text-[10px] text-[#1ed760] font-mono font-semibold">
                          Активно
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default WallpapersView;
