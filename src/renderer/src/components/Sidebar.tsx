import React from 'react';
import {
  Wifi,
  Bluetooth,
  Palette,
  Volume2,
  Layers,
  Keyboard,
  PlaySquare,
  Power,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import type { WifiStatus, BluetoothStatus } from '../../../preload/types';

export type TabType =
  | 'wifi'
  | 'bluetooth'
  | 'personalization'
  | 'audio'
  | 'windows'
  | 'input'
  | 'shortcuts'
  | 'system';

interface SidebarItem {
  id: TabType;
  label: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  detail?: string;
}

interface SidebarSection {
  group: string;
  items: SidebarItem[];
}

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  wifiStatus: WifiStatus;
  bluetoothStatus: BluetoothStatus;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  wifiStatus,
  bluetoothStatus,
}) => {
  const sections: SidebarSection[] = [
    {
      group: 'Связь',
      items: [
        {
          id: 'wifi' as TabType,
          label: 'Wi-Fi',
          icon: Wifi,
          detail: wifiStatus.enabled ? (wifiStatus.connected ? wifiStatus.ssid || 'Вкл' : 'Вкл') : 'Выкл',
        },
        {
          id: 'bluetooth' as TabType,
          label: 'Bluetooth',
          icon: Bluetooth,
          detail: bluetoothStatus.enabled ? (bluetoothStatus.connected ? 'Подключено' : 'Вкл') : 'Выкл',
        },
      ],
    },
    {
      group: 'Внешний вид',
      items: [
        {
          id: 'personalization' as TabType,
          label: 'Персонализация',
          icon: Palette,
        },
        {
          id: 'audio' as TabType,
          label: 'Звук',
          icon: Volume2,
        },
        {
          id: 'windows' as TabType,
          label: 'Окна и блюр',
          icon: Layers,
        },
      ],
    },
    {
      group: 'Система',
      items: [
        {
          id: 'input' as TabType,
          label: 'Клавиатура и мышь',
          icon: Keyboard,
        },
        {
          id: 'shortcuts' as TabType,
          label: 'Автозапуск и клавиши',
          icon: PlaySquare,
        },
        {
          id: 'system' as TabType,
          label: 'Управление ПК',
          icon: Power,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#161518] border-r border-[#2a282d] flex flex-col justify-between p-4 select-none shrink-0 app-no-drag overflow-y-auto">
      <div className="space-y-5">
        {/* Minimal Brand Header (Draggable window handle) */}
        <div className="flex items-center space-x-2.5 px-2 py-1 app-drag cursor-grab active:cursor-grabbing">
          <div className="w-7 h-7 rounded-xl bg-[#201f24] border border-[#2a282d] flex items-center justify-center text-[#859aea]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#e5e2e3] tracking-tight">Настройки</div>
            <div className="text-[10px] text-[#929092]">driftwm • cachyos</div>
          </div>
        </div>

        {/* Minimal Grouped Navigation */}
        <div className="space-y-4">
          {sections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              <div className="px-3 py-0.5 text-[10px] font-semibold text-[#636265] uppercase tracking-wider">
                {sec.group}
              </div>

              <div className="space-y-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onTabChange(item.id)}
                      className={`w-full px-3 py-2 rounded-xl flex items-center justify-between transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-[#242329] text-[#e5e2e3] shadow-sm border border-[#38363d]'
                          : 'text-[#929092] hover:text-[#e5e2e3] hover:bg-[#1c1b20]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-[#859aea]' : 'text-[#929092]'
                          }`}
                        />
                        <span className={`text-xs truncate ${isActive ? 'font-semibold text-[#e5e2e3]' : 'font-medium'}`}>
                          {item.label}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0 pl-2">
                        {item.detail && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1c1b1f] border border-[#2a282d] text-[#929092] max-w-[80px] truncate">
                            {item.detail}
                          </span>
                        )}
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-opacity ${
                            isActive ? 'opacity-90 text-[#859aea]' : 'opacity-30 text-[#929092]'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
