import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, ExternalLink, Sliders } from 'lucide-react';
import Toggle from '../Toggle';
import type { AudioStatus } from '../../../../preload/types';

export const AudioView: React.FC = () => {
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

  return (
    <div className="space-y-4 max-w-xl animate-fadeIn text-[#e5e2e3]">
      {/* ── Volume Slider Card ────────────────────────────────────────── */}
      <div className="frosted-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#242329] border border-[#2a282d] flex items-center justify-center text-[#859aea] shadow-sm">
              {status.isMuted ? <VolumeX className="w-5 h-5 text-[#ffb4ab]" /> : <Volume2 className="w-5 h-5 text-[#859aea]" />}
            </div>
            <div>
              <div className="text-sm font-semibold text-[#e5e2e3]">Громкость звука</div>
              <div className="text-xs text-[#929092]">
                {status.isMuted ? 'Звук отключен (Mute)' : `${status.volume}%`}
              </div>
            </div>
          </div>

          <Toggle checked={status.isMuted} onChange={handleToggleMute} />
        </div>

        {/* Slider */}
        <div className="flex items-center space-x-3 pt-2">
          <VolumeX className="w-4 h-4 text-[#929092]" />
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={status.volume}
            onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
            className="flex-1 cursor-pointer"
          />
          <Volume2 className="w-4 h-4 text-[#e5e2e3]" />
        </div>
      </div>

      {/* ── Audio Mixer Card ───────────────────────────────────────────── */}
      <div className="frosted-card overflow-hidden">
        <div className="divide-y divide-[#2a282d]">
          <button
            type="button"
            onClick={handleOpenSettings}
            className="w-full px-5 py-4 flex items-center justify-between text-xs text-[#929092] hover:text-[#e5e2e3] hover:bg-[#252429] transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <Sliders className="w-4 h-4 text-[#859aea]" />
              <span className="font-medium">Расширенный микшер (pavucontrol)</span>
            </div>
            <ExternalLink className="w-4 h-4 text-[#929092]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioView;
