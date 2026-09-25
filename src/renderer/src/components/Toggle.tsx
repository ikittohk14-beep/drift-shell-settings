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
      className={`group flex items-center space-x-2.5 font-mono text-xs cursor-pointer select-none transition-all ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      }`}
    >
      <div
        className={`w-11 h-6 rounded-full p-0.5 transition-all border flex items-center ${
          checked
            ? 'bg-[#a6d189] border-[#a6d189]'
            : 'bg-[#18171b] border-[#36353b] group-hover:border-[#474648]'
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full transition-transform duration-200 ease-out shadow-sm ${
            checked
              ? 'bg-[#131315] translate-x-5'
              : 'bg-[#929092] translate-x-0.5'
          }`}
        />
      </div>
      <span
        className={`text-xs font-semibold transition-colors ${
          checked ? 'text-[#a6d189]' : 'text-[#929092]'
        }`}
      >
        {checked ? t('enabled') : t('disabled')}
      </span>
    </button>
  );
};

export default Toggle;
