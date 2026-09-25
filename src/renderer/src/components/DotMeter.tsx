import React from 'react';

interface DotMeterProps {
  value: number; // 0 to max
  max?: number;
  className?: string;
}

export const DotMeter: React.FC<DotMeterProps> = ({
  value,
  max = 100,
  className = '',
}) => {
  const safeMax = max > 0 ? max : 100;
  const clamped = Math.max(0, Math.min(safeMax, value));
  const progress = (clamped / safeMax) * 8; // 0 to 8 steps

  const columns = Array.from({ length: 8 }, (_, i) => {
    if (i + 0.75 <= progress) {
      return 'bright';
    } else if (i < progress) {
      return 'medium';
    }
    return 'dark';
  });

  const getDotClass = (state: 'bright' | 'medium' | 'dark') => {
    switch (state) {
      case 'bright':
        return 'bg-[#e5e2e3] shadow-[0_0_2px_rgba(229,226,227,0.4)]';
      case 'medium':
        return 'bg-[#929092]';
      case 'dark':
      default:
        return 'bg-[#262529]';
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 items-center justify-center select-none ${className}`}>
      {/* Row 1 (8 dots) */}
      <div className="flex items-center gap-1.5">
        {columns.map((state, idx) => (
          <span
            key={`r1-${idx}`}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${getDotClass(state)}`}
          />
        ))}
      </div>
      {/* Row 2 (8 dots) */}
      <div className="flex items-center gap-1.5">
        {columns.map((state, idx) => (
          <span
            key={`r2-${idx}`}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${getDotClass(state)}`}
          />
        ))}
      </div>
    </div>
  );
};

export default DotMeter;
