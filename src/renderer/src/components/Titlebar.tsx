import React from 'react';
import { RefreshCw, Check, AlertTriangle } from 'lucide-react';
import type { ConfigValidationResult } from '../../../preload/types';

interface TitlebarProps {
  title: string;
  validation: ConfigValidationResult | null;
  isValidating: boolean;
  isSaving: boolean;
  onValidate: () => void;
}

export const Titlebar: React.FC<TitlebarProps> = ({
  title,
  validation,
  isValidating,
  isSaving,
  onValidate,
}) => {
  const handleMinimize = () => {
    try {
      window.driftAPI?.minimizeWindow();
    } catch (err) {
      console.error('[Titlebar] Minimize error:', err);
    }
  };

  const handleClose = () => {
    try {
      window.driftAPI?.closeWindow();
    } catch (err) {
      console.error('[Titlebar] Close error:', err);
    }
  };

  return (
    <header className="h-12 px-4 flex items-center justify-between select-none app-drag shrink-0 z-50 border-b border-white/[0.06] bg-black/15 backdrop-blur-md">
      {/* Left: Window Dots */}
      <div className="flex items-center space-x-2 app-no-drag">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Закрыть"
          title="Закрыть"
          className="w-3 h-3 rounded-full bg-[#ff5f56] hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-sm"
        />
        <button
          type="button"
          onClick={handleMinimize}
          aria-label="Свернуть"
          title="Свернуть"
          className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-sm"
        />
      </div>

      {/* Center: Title / Active Category Name */}
      <div className="text-xs font-semibold text-white/90 tracking-wide">
        {title}
      </div>

      {/* Right: Auto-Apply Status */}
      <div className="flex items-center space-x-2 app-no-drag">
        {isSaving ? (
          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs text-white/60 bg-white/[0.06] animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin text-[#007aff]" />
            <span>Применение...</span>
          </div>
        ) : validation && !validation.valid ? (
          <div
            className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs text-[#ff3b30] bg-[#ff3b30]/10 border border-[#ff3b30]/20"
            title={validation.error || validation.output}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Ошибка конфига</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs text-[#34c759] bg-[#34c759]/10 border border-[#34c759]/20">
            <Check className="w-3 h-3" />
            <span>Применено</span>
          </div>
        )}

        <button
          type="button"
          onClick={onValidate}
          disabled={isValidating}
          className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Проверить синтаксис конфига driftwm"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin text-[#007aff]' : ''}`}
          />
        </button>
      </div>
    </header>
  );
};

export default Titlebar;
