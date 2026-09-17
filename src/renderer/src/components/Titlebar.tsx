import React from 'react';
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

  return (
    <header className="h-9 px-4 flex items-center justify-between select-none app-drag shrink-0 border-b border-[#262529] bg-[#131315] z-50 font-mono text-xs">
      {/* Left: Window Title and Active Tab with minimalist divider | */}
      <div className="flex items-center space-x-2.5 pointer-events-none">
        <span className="text-[#c2c6d6] font-bold tracking-tight">
          :: drift-shell ::
        </span>
        <span className="text-[#474648]">|</span>
        <span className="text-[#e5e2e3] font-medium">
          {title}
        </span>
      </div>

      {/* Center: Subtle shortcut hint */}
      <div className="hidden sm:flex items-center text-[10px] text-[#474648] pointer-events-none tracking-wide">
        [ esc / super+q to close ]
      </div>

      {/* Right: Status and Language Switcher */}
      <div className="flex items-center space-x-3 app-no-drag">
        {/* Terminal Dot Status */}
        {isSaving ? (
          <span className="flex items-center space-x-1.5 text-[11px] text-[#859aea]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#859aea] animate-ping" />
            <span>{t('saving')}</span>
          </span>
        ) : validation && !validation.valid ? (
          <span
            className="flex items-center space-x-1.5 text-[11px] text-[#ffb4ab]"
            title={validation.error || validation.output}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab]" />
            <span>{t('error')}</span>
          </span>
        ) : (
          <span className="flex items-center space-x-1.5 text-[11px] text-[#a3d4a0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a3d4a0]" />
            <span>{t('ok')}</span>
          </span>
        )}

        <span className="text-[#262529]">|</span>

        {/* Minimalist Text-Only Language Switcher */}
        <div className="flex items-center space-x-1 text-[11px]">
          <button
            type="button"
            onClick={() => setLanguage('ru')}
            className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
              language === 'ru'
                ? 'bg-[#201f21] text-[#e5e2e3] font-bold border border-[#262529]'
                : 'text-[#929092] hover:text-[#e5e2e3]'
            }`}
          >
            ru
          </button>
          <span className="text-[#474648]">/</span>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
              language === 'en'
                ? 'bg-[#201f21] text-[#e5e2e3] font-bold border border-[#262529]'
                : 'text-[#929092] hover:text-[#e5e2e3]'
            }`}
          >
            en
          </button>
        </div>
      </div>
    </header>
  );
};

export default Titlebar;
