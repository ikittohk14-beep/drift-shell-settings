import React from 'react';
import { useI18n } from '../i18n';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
}) => {
  const { t } = useI18n();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`font-mono text-[11px] px-2.5 py-0.5 rounded border transition-colors cursor-pointer select-none inline-flex items-center space-x-1.5 ${
        checked
          ? 'bg-[#a3d4a0]/15 border-[#a3d4a0]/40 text-[#a3d4a0]'
          : 'bg-[#131315] border-[#262529] text-[#929092] hover:text-[#e5e2e3]'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <span className={`text-[9px] ${checked ? 'text-[#a3d4a0]' : 'text-[#474648]'}`}>
        {checked ? '●' : '○'}
      </span>
      <span>{checked ? t('enabled') : t('disabled')}</span>
    </button>
  );
};

export default Toggle;
