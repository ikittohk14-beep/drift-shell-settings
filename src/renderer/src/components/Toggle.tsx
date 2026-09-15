import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  color?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-[#859aea] border-[#859aea]' : 'bg-[#28272c] border-[#38363d]'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-4 w-4 my-auto mx-0.5 transform rounded-full shadow transition duration-200 ease-in-out ${
          checked ? 'translate-x-5 bg-[#131315]' : 'translate-x-0 bg-[#929092]'
        }`}
      />
    </button>
  );
};

export default Toggle;
