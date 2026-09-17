import React from 'react';
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
          detail: wifiDetail,
        },
        {
          id: 'bluetooth',
          labelKey: 'tabBluetooth',
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
        },
        {
          id: 'audio',
          labelKey: 'tabAudio',
        },
        {
          id: 'windows',
          labelKey: 'tabWindows',
        },
      ],
    },
    {
      groupKey: 'groupSystem',
      items: [
        {
          id: 'input',
          labelKey: 'tabInput',
        },
        {
          id: 'shortcuts',
          labelKey: 'tabShortcuts',
        },
        {
          id: 'system',
          labelKey: 'tabSystem',
        },
      ],
    },
  ];

  return (
    <aside className="w-56 bg-[#131315] border-r border-[#262529] flex flex-col justify-between p-3 select-none shrink-0 overflow-y-auto font-mono text-xs">
      <div className="space-y-5">
        {/* Navigation Categories */}
        <div className="space-y-4">
          {sections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              <div className="px-2 py-0.5 text-[10px] text-[#474648] tracking-wider uppercase font-semibold">
                // {t(sec.groupKey)}
              </div>

              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onTabChange(item.id)}
                      className={`w-full px-3 py-2 rounded-xl transition-all text-left flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-[#1a191d] text-[#e5e2e3] border border-[#262529]'
                          : 'text-[#929092] hover:text-[#e5e2e3] hover:bg-[#1a191d]/40 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <span className={`text-[9px] ${isActive ? 'text-[#859aea]' : 'text-[#474648]'}`}>
                          {isActive ? '●' : '○'}
                        </span>
                        <span className={`truncate ${isActive ? 'font-bold text-[#e5e2e3]' : 'font-medium'}`}>
                          {t(item.labelKey)}
                        </span>
                      </div>

                      {item.detail && (
                        <span className="text-[10px] text-[#474648] ml-1.5 truncate max-w-[65px]">
                          [{item.detail}]
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer system info note */}
      <div className="px-2 py-1 text-[10px] text-[#474648] border-t border-[#262529] pt-2">
        <span>cachyos | wayland</span>
      </div>
    </aside>
  );
};

export default Sidebar;
