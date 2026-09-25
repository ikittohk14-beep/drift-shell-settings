import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCw,
  SlidersHorizontal,
  Music,
  Globe,
  MessageSquare,
  Disc,
} from 'lucide-react';
import Toggle from '../Toggle';
import DotMeter from '../DotMeter';
import { useI18n } from '../../i18n';
import type { AudioStatus, AudioStreamItem } from '../../../../preload/types';

export const AudioView: React.FC = () => {
  const { t, language } = useI18n();
  const [status, setStatus] = useState<AudioStatus>({
    volume: 50,
    isMuted: false,
  });
  const [streams, setStreams] = useState<AudioStreamItem[]>([]);
  const [isLoadingStreams, setIsLoadingStreams] = useState<boolean>(false);

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

  const fetchStreams = async () => {
    try {
      if (window.driftAPI?.getAudioStreams) {
        const items = await window.driftAPI.getAudioStreams();
        setStreams(items);
      }
    } catch (err) {
      console.error('[AudioView] Error fetching audio streams:', err);
    }
  };

  const refreshAll = async () => {
    setIsLoadingStreams(true);
    await Promise.all([fetchStatus(), fetchStreams()]);
    setIsLoadingStreams(false);
  };

  useEffect(() => {
    refreshAll();
    const timer = setInterval(() => {
      fetchStatus();
      fetchStreams();
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const handleVolumeChange = async (newVol: number) => {
    const clamped = Math.max(0, Math.min(100, newVol));
    setStatus((prev) => ({ ...prev, volume: clamped }));
    try {
      if (window.driftAPI?.setAudioVolume) {
        await window.driftAPI.setAudioVolume(clamped);
      }
    } catch (err) {
      console.error('[AudioView] Set volume error:', err);
    }
  };

  const handleMuteToggle = async (val: boolean) => {
    const isMutedNow = !val;
    setStatus((prev) => ({ ...prev, isMuted: isMutedNow }));
    try {
      if (window.driftAPI?.toggleAudioMute) {
        await window.driftAPI.toggleAudioMute();
        await fetchStatus();
      }
    } catch (err) {
      console.error('[AudioView] Toggle mute error:', err);
    }
  };

  const handleStreamVolume = async (id: number, vol: number) => {
    const clamped = Math.max(0, Math.min(100, vol));
    setStreams((prev) =>
      prev.map((s) => (s.id === id ? { ...s, volume: clamped } : s))
    );
    try {
      if (window.driftAPI?.setStreamVolume) {
        await window.driftAPI.setStreamVolume(id, clamped);
      }
    } catch (err) {
      console.error('[AudioView] Set stream volume error:', err);
    }
  };

  const handleStreamMuteToggle = async (id: number) => {
    setStreams((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isMuted: !s.isMuted } : s))
    );
    try {
      if (window.driftAPI?.toggleStreamMute) {
        await window.driftAPI.toggleStreamMute(id);
        await fetchStreams();
      }
    } catch (err) {
      console.error('[AudioView] Toggle stream mute error:', err);
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

  const getStreamIcon = (stream: AudioStreamItem) => {
    const lowerName = stream.name.toLowerCase();
    const lowerBin = (stream.binary || '').toLowerCase();

    if (lowerName.includes('spotify') || lowerBin.includes('spotify')) {
      return <Music className="w-4 h-4 text-[#a6d189]" />;
    }
    if (lowerName.includes('zen') || lowerName.includes('firefox') || lowerName.includes('chrome') || lowerName.includes('browser')) {
      return <Globe className="w-4 h-4 text-[#8caaee]" />;
    }
    if (lowerName.includes('telegram') || lowerName.includes('discord') || lowerBin.includes('telegram')) {
      return <MessageSquare className="w-4 h-4 text-[#ca9ee6]" />;
    }
    return <Disc className="w-4 h-4 text-[#e5e2e3]" />;
  };

  const currentVolume = status.isMuted ? 0 : status.volume;

  return (
    <div className="space-y-4 max-w-3xl text-[#e5e2e3] font-mono text-sm pb-16">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#e5e2e3]">{t('audioTitle')}</h1>
          <p className="text-sm text-[#929092] mt-1">
            PipeWire • WirePlumber • {status.isMuted ? t('audioMuted') : `${status.volume}% ${language === 'ru' ? 'громкость' : 'output'}`}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={refreshAll}
            className="w-9 h-9 rounded-xl bg-[#201f24] hover:bg-[#2b2a30] border border-[#262529] hover:border-[#36353b] text-[#929092] hover:text-[#e5e2e3] flex items-center justify-center transition-all cursor-pointer"
            title={language === 'ru' ? 'Обновить' : 'Refresh Audio'}
          >
            <RotateCw className={`w-4 h-4 ${isLoadingStreams ? 'animate-spin' : ''}`} />
          </button>
          <Toggle checked={!status.isMuted} onChange={handleMuteToggle} />
        </div>
      </div>

      {/* ── Bento Grid: Row 1 (2 Square Tiles side-by-side) ───────────── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Tile 1: Sound Server & Sink State */}
        <div className="minimal-card p-5 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#201f24] border border-[#262529] flex items-center justify-center text-[#e5e2e3]">
              {status.isMuted ? <VolumeX className="w-4 h-4 text-[#929092]" /> : <Volume2 className="w-4 h-4" />}
            </div>
            <span className="text-xs text-[#474648] font-mono">@DEFAULT_SINK@</span>
          </div>

          <div>
            <div className="text-xs text-[#929092] font-medium">
              {language === 'ru' ? 'Состояние аудиовыхода' : 'Sink Stream State'}
            </div>
            <div className="text-2xl font-bold text-[#e5e2e3] tracking-tight mt-1">
              {!status.isMuted
                ? (language === 'ru' ? 'Активно' : 'Active')
                : (language === 'ru' ? 'Заглушено' : 'Muted')}
            </div>
            <div className="text-xs mt-1 text-[#929092]">
              {!status.isMuted
                ? (language === 'ru' ? 'Поток активен' : 'Active stream')
                : (language === 'ru' ? 'Звук отключен' : 'Output muted')}
            </div>
          </div>
        </div>

        {/* Tile 2: Volume Metric */}
        <div className="minimal-card p-5 flex flex-col justify-between h-40">
          <div className="flex items-start justify-between">
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-[#e5e2e3] tracking-tight">
                {currentVolume}
              </span>
              <span className="text-sm text-[#929092] ml-1 font-medium">%</span>
            </div>
            <span className="text-xs text-[#474648] font-mono">
              {language === 'ru' ? 'уровень' : 'gain'}
            </span>
          </div>

          <div>
            <div className="text-xs text-[#929092] font-medium">
              {language === 'ru' ? 'Громкость выхода' : 'Output Volume'}
            </div>
            <div className="text-base font-semibold text-[#e5e2e3] truncate mt-0.5">
              {status.isMuted
                ? t('audioMuted')
                : status.volume > 80
                ? (language === 'ru' ? 'Высокий уровень' : 'High Gain')
                : status.volume > 30
                ? (language === 'ru' ? 'Нормальный уровень' : 'Nominal Gain')
                : (language === 'ru' ? 'Низкий уровень' : 'Low Gain')}
            </div>
            <div className="text-xs text-[#474648] mt-1 font-mono">
              PipeWire WirePlumber
            </div>
          </div>
        </div>
      </div>

      {/* ── Bento Grid: Row 2 (Master Output Card) ────────────────────── */}
      <div className="minimal-card p-5 space-y-4">
        {/* 3 Channels / Peak meter */}
        <div className="grid grid-cols-3 gap-2 text-center border-b border-[#262529] pb-4">
          <div className="flex flex-col items-center">
            <div className="text-xs text-[#929092] font-medium mb-1.5">
              {language === 'ru' ? 'Левый канал' : 'Left Channel'}
            </div>
            <div className="text-sm font-semibold text-[#e5e2e3]">
              {currentVolume}%
            </div>
            <div className="text-[11px] text-[#474648] mt-0.5 mb-2">
              {status.isMuted ? 'Muted' : '0.0 dB'}
            </div>
            <DotMeter value={currentVolume} max={100} />
          </div>

          <div className="flex flex-col items-center">
            <div className="text-xs text-[#929092] font-medium mb-1.5">
              {language === 'ru' ? 'Правый канал' : 'Right Channel'}
            </div>
            <div className="text-sm font-semibold text-[#e5e2e3]">
              {currentVolume}%
            </div>
            <div className="text-[11px] text-[#474648] mt-0.5 mb-2">
              {status.isMuted ? 'Muted' : '0.0 dB'}
            </div>
            <DotMeter value={currentVolume} max={100} />
          </div>

          <div className="flex flex-col items-center">
            <div className="text-xs text-[#929092] font-medium mb-1.5">
              {language === 'ru' ? 'Пик-метр' : 'Peak Meter'}
            </div>
            <div className="text-sm font-semibold text-[#e5e2e3]">
              {status.isMuted ? '--' : (status.volume > 80 ? 'Peak' : 'Norm')}
            </div>
            <div className="text-[11px] text-[#474648] mt-0.5 mb-2">
              {status.isMuted ? 'Off' : 'ALSA stereo'}
            </div>
            <DotMeter value={Math.min(100, Math.round(currentVolume * 1.05))} max={100} />
          </div>
        </div>

        {/* Volume Slider & Preset Buttons */}
        <div className="space-y-3 pt-1">
          <div className="flex justify-between text-xs text-[#929092]">
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
            className="w-full cursor-pointer accent-[#e5e2e3]"
          />

          {/* Preset Buttons */}
          <div className="flex items-center justify-between pt-1 gap-2">
            {[0, 25, 50, 75, 100].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleVolumeChange(preset)}
                className={`flex-1 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                  status.volume === preset && !status.isMuted
                    ? 'bg-[#201f24] border-[#e5e2e3] text-[#e5e2e3] font-bold'
                    : 'bg-[#131315] border-[#262529] text-[#929092] hover:text-[#e5e2e3] hover:border-[#36353b]'
                }`}
              >
                {preset}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bento Grid: Row 3 (APPLICATION VOLUME MIXER) ──────────────── */}
      <div className="minimal-card overflow-hidden">
        {/* Card Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-[#262529]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#201f24] border border-[#262529] flex items-center justify-center text-[#e5e2e3]">
              <SlidersHorizontal className="w-4 h-4 text-[#e5e2e3]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-[#e5e2e3]">
                  {t('audioMixerTitle')}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full border bg-[#201f24] border-[#262529] text-[#929092] font-mono">
                  {streams.length}
                </span>
              </div>
              <div className="text-xs text-[#929092] mt-0.5">
                {t('audioMixerDesc')}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchStreams}
            className="w-8 h-8 rounded-xl bg-[#1a191d] border border-[#262529] hover:border-[#36353b] text-[#929092] hover:text-[#e5e2e3] flex items-center justify-center transition-colors cursor-pointer"
            title={language === 'ru' ? 'Обновить потоки' : 'Refresh Streams'}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Streams List */}
        <div className="p-4 space-y-3">
          {streams.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-full border border-[#262529] bg-[#161518] flex items-center justify-center mx-auto text-[#929092]">
                <Music className="w-5 h-5 opacity-60" />
              </div>
              <div className="text-xs font-medium text-[#e5e2e3]">
                {t('audioNoStreams')}
              </div>
              <div className="text-[11px] text-[#929092] max-w-sm mx-auto">
                {t('audioNoStreamsDesc')}
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {streams.map((stream) => {
                const streamVol = stream.isMuted ? 0 : stream.volume;
                const isPlayingNow = !stream.isMuted && !stream.corked;

                return (
                  <div
                    key={stream.id}
                    className={`p-3.5 rounded-xl transition-colors space-y-2.5 border ${
                      isPlayingNow
                        ? 'bg-[#a6d189]/5 border-l-2 border-l-[#a6d189] border-[#262529] hover:border-[#36353b]'
                        : 'bg-[#131315] border-[#262529] hover:border-[#36353b]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            isPlayingNow
                              ? 'bg-[#a6d189]/15 text-[#a6d189] border-[#a6d189]/30'
                              : 'bg-[#201f24] text-[#929092] border-[#262529]'
                          }`}
                        >
                          {getStreamIcon(stream)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-[#e5e2e3] truncate">
                              {stream.name}
                            </span>
                            {isPlayingNow ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#a6d189]/15 text-[#a6d189] border border-[#a6d189]/30 font-medium">
                                ✓ {language === 'ru' ? 'Играет' : 'Playing'}
                              </span>
                            ) : stream.isMuted ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ea999c]/15 text-[#ea999c] border border-[#ea999c]/30 font-medium">
                                {language === 'ru' ? 'Заглушено' : 'Muted'}
                              </span>
                            ) : stream.corked ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#201f24] text-[#929092] border border-[#262529]">
                                {language === 'ru' ? 'Пауза' : 'Paused'}
                              </span>
                            ) : null}
                          </div>
                          {stream.mediaName && (
                            <div className="text-[11px] text-[#929092] truncate mt-0.5 max-w-[340px]">
                              {stream.mediaName}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-xs font-bold font-mono text-[#e5e2e3] w-11 text-right">
                          {stream.isMuted ? (
                            <span className="text-[#ea999c] font-normal text-[11px]">
                              {language === 'ru' ? 'выкл' : 'mute'}
                            </span>
                          ) : (
                            `${stream.volume}%`
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStreamMuteToggle(stream.id)}
                          className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                            stream.isMuted
                              ? 'bg-[#ea999c]/15 border-[#ea999c]/40 text-[#ea999c]'
                              : 'bg-[#201f24] border-[#262529] hover:border-[#36353b] text-[#929092] hover:text-[#e5e2e3]'
                          }`}
                          title={stream.isMuted ? 'Включить звук' : 'Заглушить'}
                        >
                          {stream.isMuted ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Stream Volume Slider */}
                    <div className="flex items-center space-x-3 pt-0.5">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={streamVol}
                        onChange={(e) =>
                          handleStreamVolume(stream.id, parseInt(e.target.value, 10))
                        }
                        className="w-full cursor-pointer accent-[#e5e2e3]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: External pavucontrol link */}
        <div className="px-5 py-3 border-t border-[#262529] bg-[#161518]/60 flex items-center justify-between">
          <div className="text-[11px] text-[#929092]">
            {language === 'ru'
              ? 'Маршрутизация узлов и профили оборудования'
              : 'Advanced PipeWire stream routing & hardware profiles'}
          </div>
          <button
            type="button"
            onClick={handleOpenSettings}
            className="px-3 py-1.5 rounded-xl bg-[#201f24] hover:bg-[#2b2a30] border border-[#262529] hover:border-[#36353b] text-xs font-medium text-[#e5e2e3] transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <span>{t('audioPavucontrol')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioView;

