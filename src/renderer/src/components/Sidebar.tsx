import React from 'react';
import {
  Wifi,
  Bluetooth,
  Palette,
  Volume2,
  AppWindow,
  Keyboard,
  Command,
  Cpu,
} from 'lucide-react';
import { useI18n, TranslationKey } from '../i18n';
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
  labelKey: TranslationKey;
  icon: React.ComponentType<{ className?: string }>;
  detail?: string;
}

interface SidebarSection {
  groupKey: TranslationKey;
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
  const { t } = useI18n();

  const wifiDetail = wifiStatus.enabled
    ? wifiStatus.connected
      ? wifiStatus.ssid || t('enabled')
      : t('enabled')
    : t('disabled');

  const btDetail = bluetoothStatus.enabled
    ? bluetoothStatus.connected
      ? t('connected')
      : t('enabled')
    : t('disabled');

  const sections: SidebarSection[] = [
    {
      groupKey: 'groupConnectivity',
      items: [
        {
          id: 'wifi',
          labelKey: 'tabWifi',
          icon: Wifi,
          detail: wifiDetail,
        },
        {
          id: 'bluetooth',
          labelKey: 'tabBluetooth',
          icon: Bluetooth,
          detail: btDetail,
        },
      ],
    },
    {
      groupKey: 'groupAppearance',
      items: [
        {
          id: 'personalization',
          labelKey: 'tabPersonalization',
          icon: Palette,
        },
        {
          id: 'audio',
          labelKey: 'tabAudio',
          icon: Volume2,
        },
        {
          id: 'windows',
          labelKey: 'tabWindows',
          icon: AppWindow,
        },
      ],
    },
    {
      groupKey: 'groupSystem',
      items: [
        {
          id: 'input',
          labelKey: 'tabInput',
          icon: Keyboard,
        },
        {
          id: 'shortcuts',
          labelKey: 'tabShortcuts',
          icon: Command,
        },
        {
          id: 'system',
          labelKey: 'tabSystem',
          icon: Cpu,
        },
      ],
    },
  ];

  return (
    <aside className="w-[270px] bg-[#131315] border-r border-[#262529] flex flex-col justify-between p-3.5 select-none shrink-0 overflow-y-auto font-mono text-sm">
      <div className="space-y-4">
        {/* Navigation Categories */}
        {sections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-1">
            <div className="px-2.5 py-0.5 text-xs text-[#474648] tracking-wider uppercase font-semibold">
              {t(sec.groupKey)}
            </div>

            <div className="space-y-1">
              {sec.items.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onTabChange(item.id)}
                    className={`w-full px-3 py-2 rounded-xl transition-all text-left flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-[#201f24] text-[#e5e2e3] border border-[#262529]'
                        : 'text-[#929092] hover:text-[#e5e2e3] hover:bg-[#1a191d] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <Icon
                        className={`w-4.5 h-4.5 flex-shrink-0 transition-colors ${
                          isActive ? 'text-[#e5e2e3]' : 'text-[#929092]'
                        }`}
                      />
                      <span
                        className={`truncate text-sm ${
                          isActive ? 'font-medium text-[#e5e2e3]' : 'text-[#929092]'
                        }`}
                      >
                        {t(item.labelKey)}
                      </span>
                    </div>

                    {item.detail && (
                      <span className="text-xs px-2 py-0.5 rounded-lg bg-[#1a191d] text-[#929092] border border-[#262529] ml-1.5 truncate max-w-[105px]">
                        {item.detail}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer system info note */}
      <div className="px-2.5 py-1.5 text-xs text-[#474648] border-t border-[#262529] pt-2.5 flex items-center justify-between">
        <span>CachyOS · Wayland</span>
        <span className="text-[#929092]">driftwm</span>
      </div>
    </aside>
  );
};

export default Sidebar;
