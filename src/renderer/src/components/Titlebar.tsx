import React from 'react';
import { Sliders, X } from 'lucide-react';
import { useI18n } from '../i18n';
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
  isSaving,
}) => {
  const { language, setLanguage, t } = useI18n();

  const handleClose = () => {
    try {
      if (window.driftAPI?.closeWindow) {
        window.driftAPI.closeWindow();
      } else {
        window.close();
      }
    } catch {
      window.close();
    }
  };

  return (
    <header className="h-11 px-5 flex items-center justify-between select-none app-drag shrink-0 border-b border-[#262529] bg-[#131315] z-50 font-mono text-sm">
      {/* Left: Window Title and Active Tab */}
      <div className="flex items-center space-x-3 pointer-events-none">
        <Sliders className="w-4 h-4 text-[#e5e2e3]" />
        <span className="text-[#e5e2e3] font-semibold tracking-tight">
          drift-shell
        </span>
        <span className="text-[#474648]">·</span>
        <span className="text-[#929092] font-normal">
          {title}
        </span>
      </div>

      {/* Center: Subtle shortcut hint */}
      <div className="hidden sm:flex items-center text-xs text-[#474648] pointer-events-none tracking-wide">
        {language === 'ru' ? 'esc / super+q для выхода' : 'esc / super+q to exit'}
      </div>

      {/* Right: Status, Language Switcher & Close button */}
      <div className="flex items-center space-x-3 app-no-drag">
        {/* Status Indicator */}
        {isSaving ? (
          <span className="flex items-center space-x-1.5 text-xs text-[#e5e2e3]">
            <span className="w-2 h-2 rounded-full bg-[#e5e2e3] animate-ping" />
            <span>{t('saving')}</span>
          </span>
        ) : validation && !validation.valid ? (
          <span
            className="flex items-center space-x-1.5 text-xs text-[#e5e2e3] opacity-80"
            title={validation.error || validation.output}
          >
            <span className="w-2 h-2 rounded-full bg-[#e5e2e3]" />
            <span>{t('error')}</span>
          </span>
        ) : (
          <span className="flex items-center space-x-1.5 text-xs text-[#929092]">
            <span className="w-2 h-2 rounded-full bg-[#929092]" />
            <span>{t('ok')}</span>
          </span>
        )}

        <span className="text-[#262529]">|</span>

        {/* Minimalist Language Switcher */}
        <div className="flex items-center space-x-1 p-0.5 rounded-xl bg-[#1a191d] border border-[#262529] text-xs">
          <button
            type="button"
            onClick={() => setLanguage('ru')}
            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
              language === 'ru'
                ? 'bg-[#201f24] text-[#e5e2e3] font-bold border border-[#262529]'
                : 'text-[#929092] hover:text-[#e5e2e3]'
            }`}
          >
            RU
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-[#201f24] text-[#e5e2e3] font-bold border border-[#262529]'
                : 'text-[#929092] hover:text-[#e5e2e3]'
            }`}
          >
            EN
          </button>
        </div>

        {/* Real Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="w-7 h-7 flex items-center justify-center rounded-xl bg-[#1a191d] hover:bg-[#201f24] text-[#929092] hover:text-[#e5e2e3] border border-[#262529] hover:border-[#36353b] transition-all cursor-pointer"
          title="Закрыть окно"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Titlebar;
