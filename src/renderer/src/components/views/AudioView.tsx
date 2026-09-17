import React, { useState, useEffect } from 'react';
import Toggle from '../Toggle';
import { useI18n } from '../../i18n';
import type { AudioStatus } from '../../../../preload/types';

export const AudioView: React.FC = () => {
  const { t, language } = useI18n();
  const [status, setStatus] = useState<AudioStatus>({
    volume: 50,
    isMuted: false,
  });

  const fetchStatus = async () => {
    try {
      if (window.driftAPI?.getAudioStatus) {
        const res = await window.driftAPI.getAudioStatus();
        setStatus(res);
      }
    } catch (err) {
      console.error('[AudioView] Error fetching status:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleVolumeChange = async (vol: number) => {
    try {
      setStatus((prev) => ({ ...prev, volume: vol }));
      if (window.driftAPI?.setAudioVolume) {
        await window.driftAPI.setAudioVolume(vol);
      }
    } catch (err) {
      console.error('[AudioView] Set volume error:', err);
    }
  };

  const handleToggleMute = async () => {
    try {
      if (window.driftAPI?.toggleAudioMute) {
        const isMuted = await window.driftAPI.toggleAudioMute();
        setStatus((prev) => ({ ...prev, isMuted }));
      }
    } catch (err) {
      console.error('[AudioView] Toggle mute error:', err);
    }
  };

  const handleOpenSettings = async () => {
    try {
      if (window.driftAPI?.openAudioSettings) {
        await window.driftAPI.openAudioSettings();
      }
    } catch (err) {
      console.error('[AudioView] Open audio mixer error:', err);
    }
  };

  // Helper to render volume dot matrix based on percentage
  const renderChannelDots = (count: number, activeColor: string) => {
    const totalDots = count;
    const activeDots = Math.round((status.volume / 100) * totalDots);
    return (
      <div className="grid grid-cols-4 gap-1 w-fit mx-auto text-[8px]">
        {Array.from({ length: totalDots }).map((_, i) => {
          const isActive = !status.isMuted && i < activeDots;
          return (
            <span
              key={i}
              className={isActive ? activeColor : 'text-[#474648]'}
            >
              {isActive ? '●' : '·'}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-3.5 max-w-xl text-[#e5e2e3] font-mono text-xs">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#e5e2e3]">{t('audioTitle')}</h1>
          <p className="text-xs text-[#929092] mt-0.5">
            PipeWire • WirePlumber • {status.isMuted ? t('audioMuted') : `${status.volume}% ${language === 'ru' ? 'громкость' : 'output'}`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={fetchStatus}
            className="w-8 h-8 rounded-xl bg-[#1a191d] border border-[#262529] hover:border-[#36353b] text-[#859aea] flex items-center justify-center text-xs transition-colors cursor-pointer"
            title={language === 'ru' ? 'Обновить' : 'Refresh Audio'}
          >
            ::
          </button>
          <Toggle checked={!status.isMuted} onChange={handleToggleMute} />
        </div>
      </div>

      {/* ── Bento Grid: Row 1 (2 Square Tiles side-by-side) ───────────── */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Tile 1: Master State */}
        <div className="minimal-card p-4 flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
              1
            </div>
            <span className="text-[10px] text-[#474648] font-mono">hw:pipewire</span>
          </div>

          <div>
            <div className="text-[11px] text-[#929092] font-medium">
              {language === 'ru' ? 'Основной выход' : 'Master Sink'}
            </div>
            <div className="text-xl font-bold text-[#e5e2e3] tracking-tight">
              {status.isMuted
                ? (language === 'ru' ? 'Без звука' : 'Muted')
                : (language === 'ru' ? 'Активен' : 'Online')}
            </div>
            <div className={`text-[10px] mt-0.5 ${!status.isMuted ? 'text-[#a3d4a0]' : 'text-[#ffb4ab]'}`}>
              {!status.isMuted
                ? (language === 'ru' ? '● поток активен' : '● active stream')
                : (language === 'ru' ? '○ звук отключен' : '○ output muted')}
            </div>
          </div>
        </div>

        {/* Tile 2: Volume Metric */}
        <div className="minimal-card p-4 flex flex-col justify-between h-36">
          <div className="flex items-start justify-between">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-[#e5e2e3] tracking-tight">
                {status.isMuted ? 0 : status.volume}
              </span>
              <span className="text-xs text-[#929092] ml-1 font-medium">%</span>
            </div>
            <span className="text-[10px] text-[#474648] font-mono">
              {language === 'ru' ? 'уровень' : 'gain'}
            </span>
          </div>

          <div>
            <div className="text-[11px] text-[#929092] font-medium">
              {language === 'ru' ? 'Громкость выхода' : 'Output Volume'}
            </div>
            <div className="text-sm font-semibold text-[#859aea] truncate">
              {status.isMuted
                ? t('audioMuted')
                : status.volume > 80
                ? (language === 'ru' ? 'Высокий уровень' : 'High Gain')
                : status.volume > 30
                ? (language === 'ru' ? 'Нормальный уровень' : 'Nominal Gain')
                : (language === 'ru' ? 'Низкий уровень' : 'Low Gain')}
            </div>
            <div className="text-[10px] text-[#474648] mt-0.5 font-mono">
              0 dB ~ +6 dB limit
            </div>
          </div>
        </div>
      </div>

      {/* ── Bento Grid: Row 2 (Wide Card - Dot Matrix & Range Control) ─ */}
      <div className="minimal-card p-4 space-y-3.5">
        {/* Dot Matrix Channels */}
        <div className="grid grid-cols-3 gap-2 text-center border-b border-[#262529] pb-3">
          <div>
            <div className="text-[11px] text-[#929092] font-medium mb-1.5">
              {language === 'ru' ? 'Левый канал' : 'Channel L'}
            </div>
            {renderChannelDots(8, 'text-[#859aea]')}
          </div>
          <div>
            <div className="text-[11px] text-[#929092] font-medium mb-1.5">
              {language === 'ru' ? 'Правый канал' : 'Channel R'}
            </div>
            {renderChannelDots(8, 'text-[#a3d4a0]')}
          </div>
          <div>
            <div className="text-[11px] text-[#929092] font-medium mb-1.5">
              {language === 'ru' ? 'Пик-метр' : 'Peak Meter'}
            </div>
            {renderChannelDots(8, 'text-[#e8cf8d]')}
          </div>
        </div>

        {/* Volume Slider & Preset Buttons */}
        <div className="space-y-3 pt-1">
          <div className="flex justify-between text-[11px] text-[#929092]">
            <span>0%</span>
            <span className="text-[#e5e2e3] font-bold">{status.volume}%</span>
            <span>100%</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={status.volume}
            onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
            className="w-full cursor-pointer"
          />

          {/* Preset Buttons */}
          <div className="flex items-center justify-between pt-1 gap-2">
            {[0, 25, 50, 75, 100].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleVolumeChange(preset)}
                className={`flex-1 py-1 rounded-lg border text-[10px] transition-colors cursor-pointer ${
                  status.volume === preset && !status.isMuted
                    ? 'bg-[#201f21] border-[#859aea] text-[#859aea]'
                    : 'bg-[#131315] border-[#262529] text-[#929092] hover:text-[#e5e2e3] hover:border-[#36353b]'
                }`}
              >
                {preset}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bento Grid: Row 3 (Wide Card - PipeWire & Pavucontrol Launcher) ── */}
      <div className="minimal-card p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
              2
            </div>
            <div>
              <div className="text-xs font-semibold text-[#e5e2e3]">{t('audioPavucontrol')}</div>
              <div className="text-[10px] text-[#929092]">
                {language === 'ru' ? 'Маршрутизация ALSA / PulseAudio' : 'PulseAudio / ALSA Routing • Dynamic Nodes'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenSettings}
            className="px-2.5 py-1 rounded-lg bg-[#201f21] hover:bg-[#2a292d] border border-[#262529] text-[10px] text-[#859aea] transition-colors cursor-pointer"
          >
            pavucontrol &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioView;
