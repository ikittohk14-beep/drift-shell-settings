import React, { useState, useEffect, useMemo } from 'react';
import { Wifi, RotateCw, AlertCircle, Lock, Unlock, Shield } from 'lucide-react';
import Toggle from '../Toggle';
import DotMeter from '../DotMeter';
import { useI18n } from '../../i18n';
import type { WifiStatus, WifiNetwork } from '../../../../preload/types';

export const WifiView: React.FC = () => {
  const { t, language } = useI18n();
  const [status, setStatus] = useState<WifiStatus>({
    enabled: true,
    connected: false,
    ssid: null,
    signal: 0,
  });

  const [networks, setNetworks] = useState<WifiNetwork[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [connectingSsid, setConnectingSsid] = useState<string | null>(null);
  const [passwordSsid, setPasswordSsid] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState<boolean>(false);

  const fetchStatus = async () => {
    try {
      if (window.driftAPI?.getWifiStatus) {
        const res = await window.driftAPI.getWifiStatus();
        setStatus(res);
      }
    } catch (err) {
      console.error('[WifiView] Error fetching status:', err);
    }
  };

  const fetchNetworks = async () => {
    try {
      setIsScanning(true);
      if (window.driftAPI?.getWifiNetworks) {
        const list = await window.driftAPI.getWifiNetworks();
        setNetworks(list);
      }
    } catch (err) {
      console.error('[WifiView] Error scanning networks:', err);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchNetworks();

    const timer = setInterval(() => {
      fetchStatus();
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleToggle = async (val: boolean) => {
    try {
      setStatus((prev) => ({ ...prev, enabled: val }));
      if (window.driftAPI?.toggleWifi) {
        await window.driftAPI.toggleWifi(val);
        await fetchStatus();
        if (val) {
          fetchNetworks();
        } else {
          setNetworks([]);
        }
      }
    } catch (err) {
      console.error('[WifiView] Toggle error:', err);
    }
  };

  const handleConnect = async (ssid: string, password?: string) => {
    try {
      setConnectingSsid(ssid);
      setConnectionError(null);

      if (window.driftAPI?.connectWifi) {
        const res = await window.driftAPI.connectWifi(ssid, password);
        if (res.success) {
          setPasswordSsid(null);
          setPasswordInput('');
          await fetchStatus();
          await fetchNetworks();
        } else {
          setConnectionError(res.error || t('wifiFailedToConnect'));
        }
      }
    } catch (err: any) {
      console.error('[WifiView] Connect error:', err);
      setConnectionError(err?.message || t('wifiConnectionError'));
    } finally {
      setConnectingSsid(null);
    }
  };

  const handleDisconnect = async (ssid?: string) => {
    try {
      setIsDisconnecting(true);
      setConnectionError(null);
      if (window.driftAPI?.disconnectWifi) {
        const res = await window.driftAPI.disconnectWifi(ssid);
        if (res.success) {
          await fetchStatus();
          await fetchNetworks();
        } else {
          setConnectionError(res.error || t('wifiConnectionError'));
        }
      }
    } catch (err: any) {
      console.error('[WifiView] Disconnect error:', err);
      setConnectionError(err?.message || 'Failed to disconnect');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleNetworkClick = (net: WifiNetwork) => {
    if (net.inUse) return;

    if (net.isSaved || net.security === 'Open' || !net.security) {
      handleConnect(net.ssid);
    } else {
      if (passwordSsid === net.ssid) {
        setPasswordSsid(null);
        setPasswordInput('');
      } else {
        setPasswordSsid(net.ssid);
        setPasswordInput('');
        setConnectionError(null);
      }
    }
  };

  const handleOpenSettings = async () => {
    try {
      if (window.driftAPI?.openWifiSettings) {
        await window.driftAPI.openWifiSettings();
      }
    } catch (err) {
      console.error('[WifiView] Open settings error:', err);
    }
  };

  const sortedNetworks = useMemo(() => {
    return [...networks].sort((a, b) => {
      if (a.inUse !== b.inUse) return a.inUse ? -1 : 1;
      if (a.isSaved !== b.isSaved) return a.isSaved ? -1 : 1;
      return b.signal - a.signal;
    });
  }, [networks]);

  return (
    <div className="space-y-4 max-w-3xl text-[#e5e2e3] font-mono text-sm">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#e5e2e3]">{t('wifiTitle')}</h1>
          <p className="text-sm text-[#929092] mt-1">
            {status.enabled
              ? status.connected
                ? `${t('wifiConnectedTo')}${status.ssid}`
                : isScanning
                ? t('wifiSearching')
                : t('wifiReadyToConnect')
              : t('wifiDisabled')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={fetchNetworks}
            disabled={isScanning}
            className="w-9 h-9 rounded-xl bg-[#201f24] hover:bg-[#2b2a30] border border-[#262529] hover:border-[#36353b] text-[#929092] hover:text-[#e5e2e3] flex items-center justify-center transition-all cursor-pointer no-drag"
            title={t('wifiRefresh')}
          >
            <RotateCw className={`w-4 h-4 ${isScanning ? 'animate-spin text-[#e5e2e3]' : ''}`} />
          </button>
          <Toggle checked={status.enabled} onChange={handleToggle} />
        </div>
      </div>

      {/* ── Error Banner ──────────────────────────────────────────────── */}
      {connectionError && (
        <div className="px-4 py-3 rounded-2xl bg-[#201f24] border border-[#36353b] flex items-center space-x-2.5 text-sm text-[#e5e2e3]">
          <AlertCircle className="w-4 h-4 text-[#929092] flex-shrink-0" />
          <span className="flex-1">{connectionError}</span>
        </div>
      )}

      {/* ── Bento Grid: Row 1 (2 Square Tiles side-by-side) ───────────── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Tile 1: Interface & Status */}
        <div className="minimal-card p-5 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#201f24] border border-[#262529] flex items-center justify-center text-[#e5e2e3]">
              <Wifi className="w-4 h-4" />
            </div>
            <span className="text-xs text-[#474648] font-mono">{status.device || 'wlan0'}</span>
          </div>

          <div>
            <div className="text-xs text-[#929092] font-medium">
              {language === 'ru' ? 'Состояние интерфейса' : 'Interface State'}
            </div>
            <div className="text-2xl font-bold text-[#e5e2e3] tracking-tight mt-1">
              {status.enabled
                ? (status.connected
                    ? (language === 'ru' ? 'Подключено' : 'Connected')
                    : (language === 'ru' ? 'Поиск...' : 'Scanning'))
                : (language === 'ru' ? 'Выключено' : 'Disabled')}
            </div>
            <div className="text-xs mt-1 text-[#929092]">
              {status.enabled
                ? (language === 'ru' ? 'Адаптер активен' : 'Adapter active')
                : (language === 'ru' ? 'Адаптер выключен' : 'Adapter disabled')}
            </div>
          </div>
        </div>

        {/* Tile 2: Connected SSID & Signal Metric */}
        <div className="minimal-card p-5 flex flex-col justify-between h-40">
          <div className="flex items-start justify-between">
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-[#e5e2e3] tracking-tight">
                {status.connected ? status.signal : 0}
              </span>
              <span className="text-sm text-[#929092] ml-1 font-medium">%</span>
            </div>
            <span className="text-xs text-[#474648] font-mono">
              {language === 'ru' ? 'сигнал' : 'signal'}
            </span>
          </div>

          <div>
            <div className="text-xs text-[#929092] font-medium">{t('wifiActiveNetwork')}</div>
            <div className="flex items-center justify-between mt-0.5">
              <div className="text-base font-semibold text-[#e5e2e3] truncate pr-2">
                {status.connected && status.ssid ? status.ssid : t('wifiNoActiveConnection')}
              </div>
              {status.connected && status.ssid && (
                <button
                  type="button"
                  onClick={() => handleDisconnect(status.ssid || undefined)}
                  disabled={isDisconnecting}
                  className="px-2.5 py-1 rounded-lg border border-[#ea999c]/40 bg-[#ea999c]/15 hover:bg-[#ea999c]/25 text-[#ea999c] text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                  {isDisconnecting ? t('wifiDisconnecting') : t('wifiDisconnect')}
                </button>
              )}
            </div>
            <div className="text-xs text-[#474648] mt-1 font-mono">
              {status.security || 'WPA2/WPA3 Personal'}
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
              {language === 'ru' ? 'Частота / Стандарт' : 'Frequency / Band'}
            </div>
            <div className="text-sm font-semibold text-[#e5e2e3]">
              {status.connected ? (status.frequency || '5.2 GHz') : '--'}
            </div>
            <div className="text-[11px] text-[#474648] mt-0.5 mb-2">
              {status.connected ? (status.security || '802.11 ac/ax') : 'Нет несущей'}
            </div>
            <DotMeter value={status.connected ? status.signal : 0} max={100} />
          </div>

          <div className="flex flex-col items-center">
            <div className="text-xs text-[#929092] font-medium mb-1.5">
              {language === 'ru' ? 'Скорость канала' : 'Link Rate'}
            </div>
            <div className="text-sm font-semibold text-[#e5e2e3]">
              {status.connected ? (status.rate || '1170 Mbit/s') : '--'}
            </div>
            <div className="text-[11px] text-[#474648] mt-0.5 mb-2">
              {status.connected ? (language === 'ru' ? 'Канал активен' : 'Active link') : 'Отключено'}
            </div>
            <DotMeter value={status.connected ? Math.min(100, Math.max(20, status.signal)) : 0} max={100} />
          </div>

          <div className="flex flex-col items-center">
            <div className="text-xs text-[#929092] font-medium mb-1.5">
              {language === 'ru' ? 'IP-адрес / Шлюз' : 'IP / Gateway'}
            </div>
            <div className="text-sm font-semibold text-[#e5e2e3] truncate max-w-[170px]">
              {status.connected && status.ip ? status.ip.split('/')[0] : (status.connected ? '192.168.0.110' : '--')}
            </div>
            <div className="text-[11px] text-[#474648] mt-0.5 mb-2 truncate max-w-[170px]">
              {status.connected && status.gateway ? `шлюз ${status.gateway}` : (status.connected ? 'IPv4 DHCP' : 'Отключено')}
            </div>
            <DotMeter value={status.connected ? 100 : 0} max={100} />
          </div>
        </div>

        {/* Bottom Row matching Screenshot 2 */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#201f24] border border-[#262529] flex items-center justify-center text-[#e5e2e3]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#e5e2e3]">
                {language === 'ru' ? 'Сетевой стек' : 'Network Stack'}
              </div>
              <div className="text-xs text-[#929092]">
                IPv4 / IPv6 DHCP • NetworkManager ({status.device || 'wlan0'})
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenSettings}
            className="px-3.5 py-1.5 rounded-xl bg-[#201f24] hover:bg-[#2b2a30] border border-[#262529] hover:border-[#36353b] text-xs font-medium text-[#e5e2e3] transition-all cursor-pointer no-drag flex items-center space-x-1.5"
          >
            <span>{language === 'ru' ? 'nm-connection-editor' : 'Connection Editor'} &gt;</span>
          </button>
        </div>
      </div>

      {/* ── Bento Grid: Row 3 (Wide Card - Available Networks List) ───── */}
      {status.enabled && (
        <div className="minimal-card overflow-hidden">
          <div className="px-5 py-3.5 bg-[#161518] border-b border-[#262529] flex items-center justify-between text-sm text-[#929092] font-semibold">
            <span>
              {t('wifiAvailableNetworks')} {sortedNetworks.length > 0 ? `(${sortedNetworks.length})` : ''}
            </span>

            <button
              type="button"
              onClick={fetchNetworks}
              disabled={isScanning}
              className="px-3 py-1.5 rounded-xl bg-[#201f24] hover:bg-[#2b2a30] text-[#929092] hover:text-[#e5e2e3] border border-[#262529] hover:border-[#36353b] transition-all cursor-pointer text-xs flex items-center space-x-1.5"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-[#e5e2e3]' : ''}`} />
              <span>{isScanning ? (language === 'ru' ? 'Поиск...' : 'Scanning...') : t('wifiRefresh')}</span>
            </button>
          </div>

          <div className="divide-y divide-[#262529] max-h-72 overflow-y-auto">
            {isScanning && sortedNetworks.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[#929092]">
                {t('wifiScanningRange')}
              </div>
            ) : sortedNetworks.length === 0 ? (
              <div className="px-5 py-6 text-center text-sm text-[#929092]">
                {t('wifiNoNetworks')}
              </div>
            ) : (
              sortedNetworks.map((net) => {
                const isConnected = net.inUse;
                const isConnecting = connectingSsid === net.ssid;
                const isEnteringPassword = passwordSsid === net.ssid;
                const isEncrypted = net.security && net.security !== 'Open';

                return (
                  <div key={net.ssid} className="transition-colors">
                    <div
                      onClick={() => {
                        if (isConnected) return;
                        if (!isConnecting) handleNetworkClick(net);
                      }}
                      className={`px-5 py-3.5 flex items-center justify-between transition-colors ${
                        isConnected
                          ? 'bg-[#a6d189]/10 border-l-2 border-[#a6d189]'
                          : 'hover:bg-[#201f24]/50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <Wifi
                          className={`w-4 h-4 flex-shrink-0 ${
                            isConnected ? 'text-[#a6d189]' : 'text-[#929092]'
                          }`}
                        />
                        <div className="truncate">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-sm font-medium truncate ${
                                isConnected ? 'text-[#e5e2e3] font-bold' : 'text-[#e5e2e3]'
                              }`}
                            >
                              {net.ssid}
                            </span>
                            {isConnected && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#a6d189]/20 text-[#a6d189] border border-[#a6d189]/40 font-semibold font-mono">
                                ✓ {t('wifiConnectedBadge')}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#929092] flex items-center space-x-2 mt-0.5">
                            <span>{t('signal')}: {net.signal}%</span>
                            <span className="text-[#474648]">•</span>
                            <span>{net.security || 'Open'}</span>
                            {net.isSaved && !isConnected && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#201f24] text-[#e5e2e3] border border-[#262529]">
                                {t('saved')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2.5 shrink-0 pl-2">
                        {isConnected ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDisconnect(net.ssid);
                            }}
                            disabled={isDisconnecting}
                            className="px-3 py-1.5 rounded-xl border border-[#ea999c]/40 bg-[#ea999c]/15 hover:bg-[#ea999c]/25 text-[#ea999c] text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1"
                          >
                            <span>{isDisconnecting ? t('wifiDisconnecting') : t('wifiDisconnect')}</span>
                          </button>
                        ) : isConnecting ? (
                          <span className="text-sm text-[#e5e2e3] animate-pulse">
                            {t('connecting')}
                          </span>
                        ) : (
                          <>
                            {isEncrypted ? (
                              <Lock className="w-4 h-4 text-[#929092]" />
                            ) : (
                              <Unlock className="w-4 h-4 text-[#929092]" />
                            )}

                            {isEncrypted && !net.isSaved && (
                              <button
                                type="button"
                                className="px-2.5 py-1 rounded-lg bg-[#201f24] text-xs text-[#929092] border border-[#262529]"
                              >
                                {isEnteringPassword ? 'Отмена' : 'Пароль'}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Inline Password Entry Form */}
                    {isEnteringPassword && (
                      <div className="px-5 py-3 bg-[#161518] border-t border-[#262529] flex items-center space-x-2.5">
                        <input
                          type="password"
                          placeholder={t('wifiPasswordPlaceholder')}
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleConnect(net.ssid, passwordInput);
                          }}
                          autoFocus
                          className="flex-1 px-3.5 py-2 text-sm bg-[#131315] border border-[#262529] focus:border-[#e5e2e3] rounded-xl text-[#e5e2e3] placeholder-[#474648] outline-none transition-colors"
                        />

                        <button
                          type="button"
                          onClick={() => handleConnect(net.ssid, passwordInput)}
                          disabled={!passwordInput}
                          className="px-4 py-2 text-sm font-semibold rounded-xl bg-[#e5e2e3] hover:bg-white text-[#131315] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          {t('wifiConnect')}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WifiView;
