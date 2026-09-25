import React, { useState, useEffect } from 'react';
import { Bluetooth, RotateCw, AlertCircle, Trash2, Headphones, Keyboard, Mouse, Smartphone, Laptop, Radio } from 'lucide-react';
import Toggle from '../Toggle';
import DotMeter from '../DotMeter';
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

  const getDeviceIcon = (dev: BluetoothDeviceItem) => {
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
      return Headphones;
    }
    if (iconType.includes('keyboard') || name.includes('keyboard') || name.includes('клавиатура')) {
      return Keyboard;
    }
    if (iconType.includes('mouse') || name.includes('mouse') || name.includes('мышь')) {
      return Mouse;
    }
    if (
      iconType.includes('phone') ||
      name.includes('phone') ||
      name.includes('iphone') ||
      name.includes('pixel') ||
      name.includes('galaxy')
    ) {
      return Smartphone;
    }
    if (iconType.includes('computer') || iconType.includes('laptop')) {
      return Laptop;
    }
    return Radio;
  };

  const pairedDevices = [...devices.filter((d) => d.paired)].sort(
    (a, b) => (b.connected ? 1 : 0) - (a.connected ? 1 : 0)
  );
  const availableDevices = devices.filter((d) => !d.paired);
  const connectedCount = status.connectedCount ?? devices.filter((d) => d.connected).length;
  const pairedCount = status.pairedCount ?? pairedDevices.length;

  return (
    <div className="space-y-4 max-w-3xl text-[#e5e2e3] font-mono text-sm">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#e5e2e3]">{t('btTitle')}</h1>
          <p className="text-sm text-[#929092] mt-1">
            {status.enabled
              ? status.connected
                ? `${t('btConnectedTo')}${status.deviceName}`
                : isScanning
                ? t('btScanningNearbyMsg')
                : t('btReadyToPair')
              : t('btDisabled')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleScan}
            disabled={isScanning || !status.enabled}
            className="w-9 h-9 rounded-xl bg-[#201f24] hover:bg-[#2b2a30] border border-[#262529] hover:border-[#36353b] text-[#929092] hover:text-[#e5e2e3] flex items-center justify-center transition-all cursor-pointer disabled:opacity-40"
            title={t('btScanRadio')}
          >
            <RotateCw className={`w-4 h-4 ${isScanning ? 'animate-spin text-[#e5e2e3]' : ''}`} />
          </button>
          <Toggle checked={status.enabled} onChange={handleToggle} />
        </div>
      </div>

      {/* ── Scanning Banner ───────────────────────────────────────────── */}
      {scanMessage && (
        <div className="px-4 py-3 rounded-2xl bg-[#201f24] border border-[#36353b] flex items-center space-x-2.5 text-sm text-[#e5e2e3]">
          <AlertCircle className="w-4 h-4 text-[#929092] animate-pulse flex-shrink-0" />
          <span className="flex-1">{scanMessage}</span>
        </div>
      )}

      {/* ── Bento Grid: Row 1 (2 Square Tiles side-by-side) ───────────── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Tile 1: Controller & State */}
        <div className="minimal-card p-5 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#201f24] border border-[#262529] flex items-center justify-center text-[#e5e2e3]">
              <Bluetooth className="w-4 h-4" />
            </div>
            <span className="text-xs text-[#474648] font-mono">{status.adapterName || 'hci0'}</span>
          </div>

          <div>
            <div className="text-xs text-[#929092] font-medium">
              {language === 'ru' ? 'Состояние адаптера' : 'Adapter State'}
            </div>
            <div className="text-2xl font-bold text-[#e5e2e3] tracking-tight mt-1">
              {status.enabled
                ? (status.connected
                    ? (language === 'ru' ? 'Подключено' : 'Connected')
                    : (language === 'ru' ? 'Ожидание' : 'Standby'))
                : (language === 'ru' ? 'Выключено' : 'Disabled')}
            </div>
            <div className="text-xs mt-1 text-[#929092]">
              {status.enabled
                ? (language === 'ru' ? 'Адаптер активен' : 'Adapter active')
                : (language === 'ru' ? 'Адаптер выключен' : 'Adapter disabled')}
            </div>
          </div>
        </div>

        {/* Tile 2: Connected Device & Battery Metric */}
        <div className="minimal-card p-5 flex flex-col justify-between h-40">
          <div className="flex items-start justify-between">
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-[#e5e2e3] tracking-tight">
                {status.batteryPercent != null ? status.batteryPercent : (status.connected ? 'ON' : '0')}
              </span>
              {status.batteryPercent != null && (
                <span className="text-sm text-[#929092] ml-1 font-medium">%</span>
              )}
            </div>
            {status.connected ? (
              <button
                type="button"
                onClick={() => {
                  const connectedDev = devices.find((d) => d.connected);
                  if (connectedDev) handleConnectToggle(connectedDev);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#ea999c]/10 text-[#ea999c] border border-[#ea999c]/30 hover:bg-[#ea999c]/20 text-xs font-medium transition-colors cursor-pointer"
              >
                {t('btDisconnect')}
              </button>
            ) : (
              <span className="text-xs text-[#474648] font-mono">
                {language === 'ru' ? 'батарея' : 'battery'}
              </span>
            )}
          </div>

          <div>
            <div className="text-xs text-[#929092] font-medium">{t('btActiveConnection')}</div>
            <div className="text-base font-semibold text-[#e5e2e3] truncate mt-0.5">
              {status.connected && status.deviceName ? status.deviceName : t('btReadyToPair')}
            </div>
            <div className="text-xs text-[#474648] mt-1 font-mono">
              {status.profile || 'A2DP • AVRCP • BLE'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bento Grid: Row 2 (Unified Wide Card matching Screenshot 2 & 3) ─ */}
      <div className="minimal-card p-5 space-y-4">
        {/* 3 Columns matching Screenshot 2 with DotMeter from Screenshot 3 */}
        <div className="grid grid-cols-3 gap-2 text-center border-b border-[#262529] pb-4">
          <div className="flex flex-col items-center">
            <div className="text-xs text-[#929092] font-medium mb-1.5">
              {language === 'ru' ? 'Аудиопрофиль' : 'Audio Profile'}
            </div>
            <div className="text-sm font-semibold text-[#e5e2e3]">
              {status.connected ? (status.profile || 'A2DP Sink') : '--'}
            </div>
            <div className="text-[11px] text-[#474648] mt-0.5 mb-2 truncate max-w-[170px]">
              {status.connected && status.deviceName ? status.deviceName : 'Нет устройств'}
            </div>
            <DotMeter value={status.connected ? 100 : 0} max={100} />
          </div>

          <div className="flex flex-col items-center">
            <div className="text-xs text-[#929092] font-medium mb-1.5">
              {language === 'ru' ? 'Заряд батареи' : 'Battery Level'}
            </div>
            <div className="text-sm font-semibold text-[#e5e2e3]">
              {status.batteryPercent != null ? `${status.batteryPercent}%` : (status.connected ? '100%' : '--')}
            </div>
            <div className="text-[11px] text-[#474648] mt-0.5 mb-2">
              {status.connected ? (status.batteryPercent != null ? 'Аккумулятор' : 'Питание OK') : 'Отключено'}
            </div>
            <DotMeter
              value={status.batteryPercent != null ? status.batteryPercent : (status.connected ? 100 : 0)}
              max={100}
            />
          </div>

          <div className="flex flex-col items-center">
            <div className="text-xs text-[#929092] font-medium mb-1.5">
              {language === 'ru' ? 'Устройства' : 'Devices'}
            </div>
            <div className="text-sm font-semibold text-[#e5e2e3]">
              {connectedCount} {language === 'ru' ? 'подкл.' : 'conn.'}
            </div>
            <div className="text-[11px] text-[#474648] mt-0.5 mb-2">
              {pairedCount} {language === 'ru' ? 'сопряжено' : 'paired'}
            </div>
            <DotMeter
              value={Math.round(((connectedCount || (status.connected ? 1 : 0)) / Math.max(1, pairedCount || 1)) * 100)}
              max={100}
            />
          </div>
        </div>

        {/* Bottom Row matching Screenshot 2 */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#201f24] border border-[#262529] flex items-center justify-center text-[#e5e2e3]">
              <Bluetooth className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#e5e2e3]">
                {language === 'ru' ? 'Менеджер Bluetooth' : 'Bluetooth Manager'}
              </div>
              <div className="text-xs text-[#929092]">
                BlueZ • {status.adapterName || 'Адаптер Bluetooth'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenSettings}
            className="px-3.5 py-1.5 rounded-xl bg-[#201f24] hover:bg-[#2b2a30] border border-[#262529] hover:border-[#36353b] text-xs font-medium text-[#e5e2e3] transition-all cursor-pointer no-drag flex items-center space-x-1.5"
          >
            <span>blueman-manager &gt;</span>
          </button>
        </div>
      </div>

      {/* ── Bento Grid: Row 3 (Paired Devices List) ───────────────────── */}
      {status.enabled && pairedDevices.length > 0 && (
        <div className="minimal-card overflow-hidden">
          <div className="px-5 py-3.5 bg-[#161518] border-b border-[#262529] flex items-center justify-between text-sm text-[#929092] font-semibold">
            <span>{t('btSavedDevices')} ({pairedDevices.length})</span>
          </div>

          <div className="divide-y divide-[#262529]">
            {pairedDevices.map((dev) => {
              const isBusy = busyMac === dev.mac;
              const DeviceIcon = getDeviceIcon(dev);

              return (
                <div
                  key={dev.mac}
                  className={`px-5 py-3.5 flex items-center justify-between transition-colors ${
                    dev.connected
                      ? 'bg-[#a6d189]/5 border-l-2 border-[#a6d189] hover:bg-[#a6d189]/10'
                      : 'hover:bg-[#201f24]/50'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        dev.connected
                          ? 'bg-[#a6d189]/15 text-[#a6d189] border border-[#a6d189]/30'
                          : 'bg-[#201f24] text-[#929092] border border-[#262529]'
                      }`}
                    >
                      <DeviceIcon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-[#e5e2e3] truncate">
                          {dev.name || dev.mac}
                        </span>
                        {dev.connected && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#a6d189]/15 text-[#a6d189] border border-[#a6d189]/30 font-medium">
                            ✓ {t('connected')}
                          </span>
                        )}
                        {!dev.connected && dev.paired && (
                          <span className="text-xs px-2 py-0.5 rounded-md bg-[#201f24] text-[#929092] border border-[#262529]">
                            {t('saved')}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#929092] flex items-center space-x-2 mt-0.5">
                        <span className="font-mono text-[#474648]">{dev.mac}</span>
                        {dev.batteryPercent != null && (
                          <span className="text-xs px-2 py-0.2 rounded-md bg-[#201f24] text-[#e5e2e3] border border-[#262529]">
                            {dev.batteryPercent}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 pl-2">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleConnectToggle(dev)}
                      className={`px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                        dev.connected
                          ? 'bg-[#ea999c]/10 text-[#ea999c] border-[#ea999c]/30 hover:bg-[#ea999c]/20'
                          : 'bg-[#201f24] hover:bg-[#2b2a30] text-[#e5e2e3] border-[#262529] hover:border-[#36353b]'
                      }`}
                    >
                      {isBusy ? '...' : dev.connected ? t('btDisconnect') : t('btConnect')}
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleUnpair(dev.mac)}
                      className="w-8 h-8 rounded-xl bg-[#201f24] hover:bg-[#2b2a30] border border-[#262529] hover:border-[#36353b] text-[#929092] hover:text-[#ea999c] flex items-center justify-center transition-colors cursor-pointer"
                      title={t('btRemoveDevice')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Bento Grid: Row 4 (Discovered Devices List) ────────────────── */}
      {status.enabled && availableDevices.length > 0 && (
        <div className="minimal-card overflow-hidden">
          <div className="px-5 py-3.5 bg-[#161518] border-b border-[#262529] flex items-center justify-between text-sm text-[#929092] font-semibold">
            <span>{t('btAvailableDevicesNearby')} ({availableDevices.length})</span>
          </div>

          <div className="divide-y divide-[#262529] max-h-60 overflow-y-auto">
            {availableDevices.map((dev) => {
              const isBusy = busyMac === dev.mac;
              const DeviceIcon = getDeviceIcon(dev);

              return (
                <div
                  key={dev.mac}
                  className="px-5 py-3.5 flex items-center justify-between hover:bg-[#201f24]/50 transition-colors"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <DeviceIcon className="w-4 h-4 text-[#929092] flex-shrink-0" />
                    <div className="truncate">
                      <div className="text-sm font-medium text-[#e5e2e3] truncate">
                        {dev.name || dev.mac}
                      </div>
                      <div className="text-xs text-[#474648] font-mono mt-0.5">
                        {dev.mac}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handlePair(dev.mac)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#201f24] hover:bg-[#2b2a30] text-[#e5e2e3] border border-[#262529] hover:border-[#36353b] text-xs transition-colors cursor-pointer font-medium"
                  >
                    {isBusy ? '...' : t('btPair')}
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
