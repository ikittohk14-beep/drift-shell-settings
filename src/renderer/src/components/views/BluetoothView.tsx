import React, { useState, useEffect } from 'react';
import {
  Bluetooth,
  Check,
  ExternalLink,
  Battery,
  RefreshCw,
  Smartphone,
  Headphones,
  HardDrive,
  Radio,
  Trash2,
  Keyboard,
  Mouse,
  Laptop,
} from 'lucide-react';
import Toggle from '../Toggle';
import type { BluetoothStatus, BluetoothDeviceItem } from '../../../../preload/types';

export const BluetoothView: React.FC = () => {
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
      setScanMessage('Поиск устройств поблизости...');
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
      return <Headphones className="w-4 h-4 text-[#859aea] shrink-0" />;
    }
    if (iconType.includes('keyboard') || name.includes('keyboard') || name.includes('клавиатура')) {
      return <Keyboard className="w-4 h-4 text-[#a3d4a0] shrink-0" />;
    }
    if (iconType.includes('mouse') || name.includes('mouse') || name.includes('мышь')) {
      return <Mouse className="w-4 h-4 text-[#e8cf8d] shrink-0" />;
    }
    if (
      iconType.includes('phone') ||
      name.includes('phone') ||
      name.includes('iphone') ||
      name.includes('pixel') ||
      name.includes('galaxy')
    ) {
      return <Smartphone className="w-4 h-4 text-[#88c0d0] shrink-0" />;
    }
    if (iconType.includes('computer') || iconType.includes('laptop')) {
      return <Laptop className="w-4 h-4 text-[#c0c6dc] shrink-0" />;
    }
    return <HardDrive className="w-4 h-4 text-[#929092] shrink-0" />;
  };

  const pairedDevices = devices.filter((d) => d.paired);
  const availableDevices = devices.filter((d) => !d.paired);

  return (
    <div className="space-y-4 max-w-xl animate-fadeIn text-[#e5e2e3]">
      {/* ── Main Bluetooth Switch Card ─────────────────────────────────── */}
      <div className="frosted-card p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#242329] border border-[#2a282d] flex items-center justify-center text-[#859aea] shadow-sm">
            <Bluetooth className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#e5e2e3]">Bluetooth</div>
            <div className="text-xs text-[#929092]">
              {status.enabled
                ? status.connected
                  ? `Подключено: ${status.deviceName}`
                  : 'Включен, готов к сопряжению'
                : 'Выключен'}
            </div>
          </div>
        </div>

        <Toggle checked={status.enabled} onChange={handleToggle} />
      </div>

      {/* ── Connected Device Banner ────────────────────────────────────── */}
      {status.enabled && status.connected && status.deviceName && (
        <div className="frosted-card p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#859aea]/15 border border-[#859aea]/30 flex items-center justify-center text-[#859aea] shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-sm font-medium text-[#e5e2e3] truncate">{status.deviceName}</div>
              <div className="text-xs text-[#a3d4a0]">Активное подключение</div>
            </div>
          </div>

          {status.batteryPercent != null && (
            <div className="flex items-center space-x-1.5 text-xs text-[#e5e2e3] font-mono px-2.5 py-1 rounded-md bg-[#242329] border border-[#2a282d]">
              <Battery className="w-3.5 h-3.5 text-[#a3d4a0]" />
              <span>{status.batteryPercent}%</span>
            </div>
          )}
        </div>
      )}

      {/* ── Paired & Known Devices Card ────────────────────────────────── */}
      {status.enabled && (
        <div className="frosted-card overflow-hidden">
          <div className="px-5 py-3 flex items-center justify-between border-b border-[#2a282d]">
            <span className="text-[10px] font-semibold text-[#636265] uppercase tracking-wider">
              Сохраненные устройства {pairedDevices.length > 0 ? `(${pairedDevices.length})` : ''}
            </span>

            <button
              type="button"
              onClick={handleScan}
              disabled={isScanning}
              className="flex items-center space-x-1.5 text-xs text-[#929092] hover:text-[#e5e2e3] transition-colors cursor-pointer"
              title="Поиск устройств"
            >
              <Radio className={`w-3.5 h-3.5 text-[#859aea] ${isScanning ? 'animate-pulse' : ''}`} />
              <span>{isScanning ? 'Поиск...' : 'Сканировать эфир'}</span>
            </button>
          </div>

          <div className="divide-y divide-[#2a282d]">
            {pairedDevices.length === 0 ? (
              <div className="px-5 py-5 text-xs text-[#929092] text-center">
                Нет сохраненных устройств
              </div>
            ) : (
              pairedDevices.map((dev) => {
                const isBusy = busyMac === dev.mac;

                return (
                  <div
                    key={dev.mac}
                    className="px-5 py-3.5 flex items-center justify-between hover:bg-[#252429] transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {getDeviceIcon(dev)}
                      <div className="truncate">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium text-[#e5e2e3] truncate">
                            {dev.name}
                          </span>
                          {dev.batteryPercent != null && (
                            <span className="text-[10px] text-[#a3d4a0] font-mono">
                              {dev.batteryPercent}%
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#929092] font-mono">
                          {dev.mac}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleConnectToggle(dev)}
                        disabled={isBusy}
                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
                          dev.connected
                            ? 'bg-[#28272c] hover:bg-[#ffb4ab]/20 hover:text-[#ffb4ab] text-[#929092] border border-[#38363d]'
                            : 'bg-[#859aea] hover:bg-[#a4b5f5] text-[#131315]'
                        }`}
                      >
                        {isBusy ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>...</span>
                          </>
                        ) : dev.connected ? (
                          <span>Отключить</span>
                        ) : (
                          <span>Подключить</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUnpair(dev.mac)}
                        disabled={isBusy}
                        title="Удалить устройство"
                        className="p-1.5 rounded-lg bg-[#201f24] hover:bg-[#ffb4ab]/20 hover:text-[#ffb4ab] text-[#929092] border border-[#2a282d] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── Available / Discovered Devices ─────────────────────────────── */}
      {status.enabled && (
        <div className="frosted-card overflow-hidden">
          <div className="px-5 py-3 flex items-center justify-between border-b border-[#2a282d]">
            <span className="text-[10px] font-semibold text-[#636265] uppercase tracking-wider">
              Доступные устройства рядом {availableDevices.length > 0 ? `(${availableDevices.length})` : ''}
            </span>

            {isScanning && (
              <span className="flex items-center space-x-1.5 text-[11px] text-[#859aea] animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>{scanMessage || 'Поиск...'}</span>
              </span>
            )}
          </div>

          <div className="divide-y divide-[#2a282d]">
            {availableDevices.length === 0 ? (
              <div className="px-5 py-5 text-xs text-[#929092] text-center">
                {isScanning
                  ? 'Сканирование радиоэфира...'
                  : 'Нажмите «Сканировать эфир», чтобы найти новые устройства'}
              </div>
            ) : (
              availableDevices.map((dev) => {
                const isBusy = busyMac === dev.mac;

                return (
                  <div
                    key={dev.mac}
                    className="px-5 py-3.5 flex items-center justify-between hover:bg-[#252429] transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {getDeviceIcon(dev)}
                      <div className="truncate">
                        <div className="text-xs font-medium text-[#e5e2e3] truncate">
                          {dev.name}
                        </div>
                        <div className="text-[11px] text-[#929092] font-mono">
                          {dev.mac}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePair(dev.mac)}
                      disabled={isBusy}
                      className="px-3 py-1 text-xs font-medium rounded-lg bg-[#859aea] hover:bg-[#a4b5f5] text-[#131315] transition-colors cursor-pointer flex items-center space-x-1.5 shrink-0"
                    >
                      {isBusy ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Сопряжение...</span>
                        </>
                      ) : (
                        <span>Сопряжение</span>
                      )}
                    </button>
                  </div>
                );
              })
            )}

            {/* Blueman Manager Shortcut */}
            <button
              type="button"
              onClick={handleOpenSettings}
              className="w-full px-5 py-3 flex items-center justify-between text-xs text-[#929092] hover:text-[#e5e2e3] hover:bg-[#252429] transition-colors cursor-pointer"
            >
              <span className="font-medium">Расширенный менеджер (blueman-manager)</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#929092]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BluetoothView;

