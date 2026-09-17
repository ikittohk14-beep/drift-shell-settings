import React, { useState, useEffect } from 'react';
import Toggle from '../Toggle';
import { useI18n } from '../../i18n';
import type { BluetoothStatus, BluetoothDeviceItem } from '../../../../preload/types';

export const BluetoothView: React.FC = () => {
  const { t, language } = useI18n();
  const [status, setStatus] = useState<BluetoothStatus>({
    enabled: true,
    connected: false,
    deviceName: null,
    batteryPercent: null,
  });

  const [devices, setDevices] = useState<BluetoothDeviceItem[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [busyMac, setBusyMac] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      if (window.driftAPI?.getBluetoothStatus) {
        const res = await window.driftAPI.getBluetoothStatus();
        setStatus(res);
      }
    } catch (err) {
      console.error('[BluetoothView] Error fetching status:', err);
    }
  };

  const fetchDevices = async () => {
    try {
      if (window.driftAPI?.getBluetoothDevices) {
        const list = await window.driftAPI.getBluetoothDevices();
        setDevices(list);
      }
    } catch (err) {
      console.error('[BluetoothView] Error fetching devices:', err);
    }
  };

  const handleScan = async () => {
    try {
      setIsScanning(true);
      setScanMessage(t('btScanningNearbyMsg'));
      if (window.driftAPI?.scanBluetoothDevices) {
        const list = await window.driftAPI.scanBluetoothDevices();
        setDevices(list);
      }
      await fetchStatus();
    } catch (err) {
      console.error('[BluetoothView] Scan error:', err);
    } finally {
      setIsScanning(false);
      setScanMessage(null);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchDevices();

    const timer = setInterval(() => {
      fetchStatus();
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleToggle = async (val: boolean) => {
    try {
      setStatus((prev) => ({ ...prev, enabled: val }));
      if (window.driftAPI?.toggleBluetooth) {
        await window.driftAPI.toggleBluetooth(val);
        await fetchStatus();
        if (val) {
          fetchDevices();
        } else {
          setDevices([]);
        }
      }
    } catch (err) {
      console.error('[BluetoothView] Toggle error:', err);
    }
  };

  const handleConnectToggle = async (dev: BluetoothDeviceItem) => {
    try {
      setBusyMac(dev.mac);
      if (dev.connected) {
        if (window.driftAPI?.disconnectBluetoothDevice) {
          await window.driftAPI.disconnectBluetoothDevice(dev.mac);
        }
      } else {
        if (window.driftAPI?.connectBluetoothDevice) {
          await window.driftAPI.connectBluetoothDevice(dev.mac);
        }
      }
      await fetchStatus();
      await fetchDevices();
    } catch (err) {
      console.error('[BluetoothView] Device connect error:', err);
    } finally {
      setBusyMac(null);
    }
  };

  const handlePair = async (mac: string) => {
    try {
      setBusyMac(mac);
      if (window.driftAPI?.pairBluetoothDevice) {
        await window.driftAPI.pairBluetoothDevice(mac);
      }
      await fetchStatus();
      await fetchDevices();
    } catch (err) {
      console.error('[BluetoothView] Pair error:', err);
    } finally {
      setBusyMac(null);
    }
  };

  const handleUnpair = async (mac: string) => {
    try {
      setBusyMac(mac);
      if (window.driftAPI?.unpairBluetoothDevice) {
        await window.driftAPI.unpairBluetoothDevice(mac);
      }
      await fetchStatus();
      await fetchDevices();
    } catch (err) {
      console.error('[BluetoothView] Unpair error:', err);
    } finally {
      setBusyMac(null);
    }
  };

  const handleOpenSettings = async () => {
    try {
      if (window.driftAPI?.openBluetoothSettings) {
        await window.driftAPI.openBluetoothSettings();
      }
    } catch (err) {
      console.error('[BluetoothView] Open settings error:', err);
    }
  };

  const getDeviceBadge = (dev: BluetoothDeviceItem) => {
    const iconType = (dev.icon || '').toLowerCase();
    const name = dev.name.toLowerCase();

    if (
      iconType.includes('headphone') ||
      iconType.includes('headset') ||
      iconType.includes('audio') ||
      name.includes('major') ||
      name.includes('headphone') ||
      name.includes('earbuds') ||
      name.includes('buds') ||
      name.includes('airpods') ||
      name.includes('wh-')
    ) {
      return { tag: language === 'ru' ? '[звук]' : '[audio]', color: 'text-[#859aea]' };
    }
    if (iconType.includes('keyboard') || name.includes('keyboard') || name.includes('клавиатура')) {
      return { tag: language === 'ru' ? '[клав]' : '[kbd]', color: 'text-[#a3d4a0]' };
    }
    if (iconType.includes('mouse') || name.includes('mouse') || name.includes('мышь')) {
      return { tag: language === 'ru' ? '[мышь]' : '[mouse]', color: 'text-[#e8cf8d]' };
    }
    if (
      iconType.includes('phone') ||
      name.includes('phone') ||
      name.includes('iphone') ||
      name.includes('pixel') ||
      name.includes('galaxy')
    ) {
      return { tag: language === 'ru' ? '[тел]' : '[phone]', color: 'text-[#88c0d0]' };
    }
    if (iconType.includes('computer') || iconType.includes('laptop')) {
      return { tag: language === 'ru' ? '[пк]' : '[pc]', color: 'text-[#c0c6dc]' };
    }
    return { tag: language === 'ru' ? '[устр]' : '[dev]', color: 'text-[#929092]' };
  };

  const pairedDevices = devices.filter((d) => d.paired);
  const availableDevices = devices.filter((d) => !d.paired);

  return (
    <div className="space-y-3.5 max-w-xl text-[#e5e2e3] font-mono text-xs">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#e5e2e3]">{t('btTitle')}</h1>
          <p className="text-xs text-[#929092] mt-0.5">
            {status.enabled
              ? status.connected
                ? `${t('btConnectedTo')}${status.deviceName}`
                : isScanning
                ? t('btScanningNearbyMsg')
                : t('btReadyToPair')
              : t('btDisabled')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleScan}
            disabled={isScanning || !status.enabled}
            className="w-8 h-8 rounded-xl bg-[#1a191d] border border-[#262529] hover:border-[#36353b] text-[#859aea] flex items-center justify-center text-xs transition-colors cursor-pointer disabled:opacity-40"
            title={t('btScanRadio')}
          >
            {isScanning ? '..' : '::'}
          </button>
          <Toggle checked={status.enabled} onChange={handleToggle} />
        </div>
      </div>

      {/* ── Scanning Banner ───────────────────────────────────────────── */}
      {scanMessage && (
        <div className="px-3.5 py-2.5 rounded-2xl bg-[#859aea]/10 border border-[#859aea]/30 flex items-center space-x-2 text-[11px] text-[#859aea]">
          <span className="font-bold animate-pulse">[i]</span>
          <span className="flex-1">{scanMessage}</span>
        </div>
      )}

      {/* ── Bento Grid: Row 1 (2 Square Tiles side-by-side) ───────────── */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Tile 1: Controller & State */}
        <div className="minimal-card p-4 flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
              1
            </div>
            <span className="text-[10px] text-[#474648] font-mono">hci0</span>
          </div>

          <div>
            <div className="text-[11px] text-[#929092] font-medium">
              {language === 'ru' ? 'Состояние адаптера' : 'Adapter State'}
            </div>
            <div className="text-xl font-bold text-[#e5e2e3] tracking-tight">
              {status.enabled
                ? (status.connected
                    ? (language === 'ru' ? 'Подключено' : 'Connected')
                    : (language === 'ru' ? 'Ожидание' : 'Standby'))
                : (language === 'ru' ? 'Выключено' : 'Disabled')}
            </div>
            <div className={`text-[10px] mt-0.5 ${status.enabled ? 'text-[#a3d4a0]' : 'text-[#474648]'}`}>
              {status.enabled
                ? (language === 'ru' ? '● адаптер активен' : '● adapter active')
                : (language === 'ru' ? '○ адаптер выключен' : '○ adapter disabled')}
            </div>
          </div>
        </div>

        {/* Tile 2: Connected Device & Battery Metric */}
        <div className="minimal-card p-4 flex flex-col justify-between h-36">
          <div className="flex items-start justify-between">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-[#e5e2e3] tracking-tight">
                {status.batteryPercent != null ? status.batteryPercent : (status.connected ? 'ON' : '0')}
              </span>
              {status.batteryPercent != null && (
                <span className="text-xs text-[#929092] ml-1 font-medium">%</span>
              )}
            </div>
            <span className="text-[10px] text-[#474648] font-mono">
              {language === 'ru' ? 'батарея' : 'battery'}
            </span>
          </div>

          <div>
            <div className="text-[11px] text-[#929092] font-medium">{t('btActiveConnection')}</div>
            <div className="text-sm font-semibold text-[#859aea] truncate">
              {status.connected && status.deviceName ? status.deviceName : t('btReadyToPair')}
            </div>
            <div className="text-[10px] text-[#474648] mt-0.5 font-mono">
              A2DP • AVRCP • BLE
            </div>
          </div>
        </div>
      </div>

      {/* ── Bento Grid: Row 2 (Wide Card - Bluetooth Protocols & Blueman) ─ */}
      <div className="minimal-card p-4 space-y-3.5">
        <div className="grid grid-cols-3 gap-2 text-center border-b border-[#262529] pb-3">
          <div>
            <div className="text-[11px] text-[#929092] font-medium mb-1.5">LE Audio</div>
            <div className="grid grid-cols-4 gap-1 w-fit mx-auto text-[8px] text-[#859aea]">
              <span>●</span><span>●</span><span>●</span><span>●</span>
              <span>●</span><span>●</span><span className="text-[#474648]">·</span><span className="text-[#474648]">·</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[#929092] font-medium mb-1.5">A2DP Stereo</div>
            <div className="grid grid-cols-4 gap-1 w-fit mx-auto text-[8px] text-[#a3d4a0]">
              <span>●</span><span>●</span><span>●</span><span>●</span>
              <span>●</span><span>●</span><span>●</span><span className="text-[#474648]">·</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[#929092] font-medium mb-1.5">HID Input</div>
            <div className="grid grid-cols-4 gap-1 w-fit mx-auto text-[8px] text-[#c0c6dc]">
              <span>●</span><span>●</span><span>●</span><span className="text-[#474648]">·</span>
              <span className="text-[#474648]">·</span><span className="text-[#474648]">·</span><span className="text-[#474648]">·</span><span className="text-[#474648]">·</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
              2
            </div>
            <div>
              <div className="text-xs font-semibold text-[#e5e2e3]">
                {language === 'ru' ? 'Менеджер Bluetooth' : 'Bluetooth Manager'}
              </div>
              <div className="text-[10px] text-[#929092]">{t('btBluemanManager')}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenSettings}
            className="px-2.5 py-1 rounded-lg bg-[#201f21] hover:bg-[#2a292d] border border-[#262529] text-[10px] text-[#859aea] transition-colors cursor-pointer"
          >
            blueman-manager &gt;
          </button>
        </div>
      </div>

      {/* ── Bento Grid: Row 3 (Wide Card - Paired Devices) ───────────── */}
      {status.enabled && (
        <div className="minimal-card overflow-hidden">
          <div className="px-4 py-3 border-b border-[#262529] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
                3
              </div>
              <span className="text-xs font-semibold text-[#e5e2e3]">{t('btSavedDevices')}</span>
              <span className="text-[10px] text-[#929092]">({pairedDevices.length})</span>
            </div>

            <button
              type="button"
              onClick={handleScan}
              disabled={isScanning}
              className="px-2.5 py-1 rounded-lg bg-[#201f21] hover:bg-[#2a292d] border border-[#262529] text-[10px] text-[#859aea] transition-colors cursor-pointer"
            >
              {isScanning
                ? (language === 'ru' ? '[ поиск.. ]' : '[ scanning.. ]')
                : (language === 'ru' ? '[ поиск ]' : '[ scan ]')}
            </button>
          </div>

          <div className="divide-y divide-[#262529]">
            {pairedDevices.length === 0 ? (
              <div className="px-4 py-6 text-center text-[11px] text-[#929092]">
                {t('btNoSavedDevices')}
              </div>
            ) : (
              pairedDevices.map((dev) => {
                const isBusy = busyMac === dev.mac;
                const badge = getDeviceBadge(dev);

                return (
                  <div
                    key={dev.mac}
                    className="px-4 py-3 flex items-center justify-between hover:bg-[#201f21]/40 transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className={`text-[10px] font-bold ${badge.color} shrink-0`}>
                        {badge.tag}
                      </span>
                      <div className="truncate min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-[#e5e2e3] truncate">
                            {dev.name}
                          </span>
                          {dev.batteryPercent != null && (
                            <span className="text-[10px] text-[#a3d4a0] font-mono">
                              {dev.batteryPercent}%
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#474648] font-mono">
                          {dev.mac}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => handleConnectToggle(dev)}
                        disabled={isBusy}
                        className={`px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer font-medium ${
                          dev.connected
                            ? 'bg-[#131315] hover:bg-[#ffb4ab]/20 hover:text-[#ffb4ab] text-[#929092] border border-[#262529]'
                            : 'bg-[#859aea] hover:bg-[#a4b5f5] text-[#131315]'
                        }`}
                      >
                        {isBusy ? '[ .. ]' : dev.connected ? t('btDisconnect') : t('btConnect')}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUnpair(dev.mac)}
                        disabled={isBusy}
                        title={t('btRemoveDevice')}
                        className="w-7 h-7 rounded-lg bg-[#131315] hover:bg-[#ffb4ab]/20 hover:text-[#ffb4ab] border border-[#262529] text-[#474648] flex items-center justify-center text-xs transition-colors cursor-pointer"
                      >
                        x
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── Bento Grid: Row 4 (Wide Card - Available Nearby Devices) ──── */}
      {status.enabled && availableDevices.length > 0 && (
        <div className="minimal-card overflow-hidden">
          <div className="px-4 py-3 border-b border-[#262529] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
                4
              </div>
              <span className="text-xs font-semibold text-[#e5e2e3]">{t('btAvailableDevicesNearby')}</span>
              <span className="text-[10px] text-[#929092]">({availableDevices.length})</span>
            </div>
          </div>

          <div className="divide-y divide-[#262529]">
            {availableDevices.map((dev) => {
              const isBusy = busyMac === dev.mac;
              const badge = getDeviceBadge(dev);

              return (
                <div
                  key={dev.mac}
                  className="px-4 py-3 flex items-center justify-between hover:bg-[#201f21]/40 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className={`text-[10px] font-bold ${badge.color} shrink-0`}>
                      {badge.tag}
                    </span>
                    <div className="truncate min-w-0">
                      <div className="text-xs font-semibold text-[#e5e2e3] truncate">
                        {dev.name}
                      </div>
                      <div className="text-[10px] text-[#474648] font-mono">
                        {dev.mac}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePair(dev.mac)}
                    disabled={isBusy}
                    className="px-2.5 py-1 text-xs rounded-lg bg-[#201f21] hover:bg-[#859aea] hover:text-[#131315] border border-[#262529] text-[#859aea] transition-colors cursor-pointer font-medium"
                  >
                    {isBusy ? '[ .. ]' : t('btPair')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BluetoothView;
