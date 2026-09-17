import React, { useState, useEffect } from 'react';
import Toggle from '../Toggle';
import { useI18n } from '../../i18n';
import type { WifiStatus, WifiNetwork } from '../../../../preload/types';

export const WifiView: React.FC = () => {
  const { t } = useI18n();
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

  const otherNetworks = networks.filter((n) => !n.inUse);

  return (
    <div className="space-y-3.5 max-w-xl text-[#e5e2e3] font-mono text-xs">
      {/* ── Page Header matching reference image ─────────────────────── */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#e5e2e3]">{t('wifiTitle')}</h1>
          <p className="text-xs text-[#929092] mt-0.5">
            {status.enabled
              ? status.connected
                ? `${t('wifiConnectedTo')}${status.ssid}`
                : isScanning
                ? t('wifiSearching')
                : t('wifiReadyToConnect')
              : t('wifiDisabled')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={fetchNetworks}
            disabled={isScanning}
            className="w-8 h-8 rounded-xl bg-[#1a191d] border border-[#262529] hover:border-[#36353b] text-[#859aea] flex items-center justify-center text-xs transition-colors cursor-pointer"
            title={t('wifiRefresh')}
          >
            {isScanning ? '..' : '::'}
          </button>
          <Toggle checked={status.enabled} onChange={handleToggle} />
        </div>
      </div>

      {/* ── Error Banner ──────────────────────────────────────────────── */}
      {connectionError && (
        <div className="px-3.5 py-2.5 rounded-2xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 flex items-center space-x-2 text-[11px] text-[#ffb4ab]">
          <span className="font-bold">[!]</span>
          <span className="flex-1">{connectionError}</span>
        </div>
      )}

      {/* ── Bento Grid: Row 1 (2 Square Tiles side-by-side) ───────────── */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Tile 1: Interface & Status */}
        <div className="minimal-card p-4 flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-full border border-[#36353b] flex items-center justify-center text-xs font-semibold text-[#e5e2e3]">
              1
            </div>
            <span className="text-[10px] text-[#474648] font-mono">wlan0</span>
          </div>

          <div>
            <div className="text-[11px] text-[#929092] font-medium">Interface State</div>
            <div className="text-xl font-bold text-[#e5e2e3] tracking-tight">
              {status.enabled ? (status.connected ? 'Connected' : 'Scanning') : 'Disabled'}
            </div>
            <div className={`text-[10px] mt-0.5 ${status.enabled ? 'text-[#a3d4a0]' : 'text-[#474648]'}`}>
              {status.enabled ? '● radio online' : '○ radio offline'}
            </div>
          </div>
        </div>

        {/* Tile 2: Connected SSID & Signal Metric */}
        <div className="minimal-card p-4 flex flex-col justify-between h-36">
          <div className="flex items-start justify-between">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-[#e5e2e3] tracking-tight">
                {status.connected ? status.signal : 0}
              </span>
              <span className="text-xs text-[#929092] ml-1 font-medium">%</span>
            </div>
            <span className="text-[10px] text-[#474648] font-mono">signal</span>
          </div>

          <div>
            <div className="text-[11px] text-[#929092] font-medium">{t('wifiActiveNetwork')}</div>
            <div className="text-sm font-semibold text-[#859aea] truncate">
              {status.connected && status.ssid ? status.ssid : t('wifiNoActiveConnection')}
            </div>
            <div className="text-[10px] text-[#474648] mt-0.5 font-mono">
              WPA2/WPA3 Personal
            </div>
          </div>
        </div>
      </div>

      {/* ── Bento Grid: Row 2 (Wide Card - Dot Matrix Activity & Security) ─ */}
      <div className="minimal-card p-4 space-y-3.5">
        <div className="grid grid-cols-3 gap-2 text-center border-b border-[#262529] pb-3">
          <div>
            <div className="text-[11px] text-[#929092] font-medium mb-1.5">2.4 GHz</div>
            <div className="grid grid-cols-4 gap-1 w-fit mx-auto text-[8px] text-[#859aea]">
              <span>●</span><span>●</span><span>●</span><span className="text-[#474648]">·</span>
              <span>●</span><span>●</span><span className="text-[#474648]">·</span><span className="text-[#474648]">·</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[#929092] font-medium mb-1.5">5.0 GHz</div>
            <div className="grid grid-cols-4 gap-1 w-fit mx-auto text-[8px] text-[#a3d4a0]">
              <span>●</span><span>●</span><span>●</span><span>●</span>
              <span>●</span><span>●</span><span>●</span><span className="text-[#474648]">·</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[#929092] font-medium mb-1.5">6.0 GHz</div>
            <div className="grid grid-cols-4 gap-1 w-fit mx-auto text-[8px] text-[#c0c6dc]">
              <span>●</span><span>●</span><span className="text-[#474648]">·</span><span className="text-[#474648]">·</span>
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
              <div className="text-xs font-semibold text-[#e5e2e3]">Network Protocol</div>
              <div className="text-[10px] text-[#929092]">IPv4 / IPv6 DHCP • Wi-Fi 6 Ready</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenSettings}
            className="px-2.5 py-1 rounded-lg bg-[#201f21] hover:bg-[#2a292d] border border-[#262529] text-[10px] text-[#859aea] transition-colors cursor-pointer"
          >
            nm-connection-editor &gt;
          </button>
        </div>
      </div>

      {/* ── Bento Grid: Row 3 (Wide Card - Available Networks List) ───── */}
      {status.enabled && (
        <div className="minimal-card overflow-hidden">
          <div className="px-4 py-3 bg-[#161518] border-b border-[#262529] flex items-center justify-between text-[11px] text-[#929092] font-semibold">
            <span>
              {t('wifiAvailableNetworks')} {otherNetworks.length > 0 ? `(${otherNetworks.length})` : ''}
            </span>

            <button
              type="button"
              onClick={fetchNetworks}
              disabled={isScanning}
              className="text-[#859aea] hover:text-[#a4b5f5] transition-colors cursor-pointer text-[10px]"
            >
              {isScanning ? '[ scanning... ]' : `[ ${t('wifiRefresh')} ]`}
            </button>
          </div>

          <div className="divide-y divide-[#262529] max-h-64 overflow-y-auto">
            {isScanning && otherNetworks.length === 0 ? (
              <div className="px-4 py-6 text-center text-[11px] text-[#929092]">
                [ {t('wifiScanningRange')} ]
              </div>
            ) : otherNetworks.length === 0 ? (
              <div className="px-4 py-5 text-center text-[11px] text-[#929092]">
                {t('wifiNoNetworks')}
              </div>
            ) : (
              otherNetworks.map((net) => {
                const isConnecting = connectingSsid === net.ssid;
                const isEnteringPassword = passwordSsid === net.ssid;
                const isEncrypted = net.security && net.security !== 'Open';

                return (
                  <div key={net.ssid} className="transition-colors">
                    <div
                      onClick={() => !isConnecting && handleNetworkClick(net)}
                      className="px-4 py-3 flex items-center justify-between hover:bg-[#201f21]/40 cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <span className="text-[#859aea] font-bold">●</span>
                        <div className="truncate">
                          <div className="text-xs text-[#e5e2e3] font-medium truncate">
                            {net.ssid}
                          </div>
                          <div className="text-[10px] text-[#929092] flex items-center space-x-2">
                            <span>{t('signal')}: {net.signal}%</span>
                            {net.isSaved && (
                              <span className="text-[10px] text-[#a3d4a0]">
                                [{t('saved')}]
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 pl-2">
                        {isConnecting ? (
                          <span className="text-[11px] text-[#859aea]">
                            [ {t('connecting')} ]
                          </span>
                        ) : (
                          <>
                            {isEncrypted ? (
                              <span className="text-[10px] text-[#474648]">[sec]</span>
                            ) : (
                              <span className="text-[10px] text-[#a3d4a0]">[open]</span>
                            )}

                            {isEncrypted && !net.isSaved && (
                              <span className="text-[10px] text-[#859aea]">
                                {isEnteringPassword ? '[-]' : '[+]'}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Inline Password Entry Form */}
                    {isEnteringPassword && (
                      <div className="px-4 py-2.5 bg-[#161518] border-t border-[#262529] flex items-center space-x-2">
                        <input
                          type="password"
                          placeholder={t('wifiPasswordPlaceholder')}
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleConnect(net.ssid, passwordInput);
                          }}
                          autoFocus
                          className="flex-1 px-3 py-1.5 text-xs bg-[#131315] border border-[#262529] focus:border-[#859aea] rounded-lg text-[#e5e2e3] placeholder-[#474648] outline-none transition-colors"
                        />

                        <button
                          type="button"
                          onClick={() => handleConnect(net.ssid, passwordInput)}
                          disabled={!passwordInput}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#859aea] hover:bg-[#a4b5f5] text-[#131315] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
