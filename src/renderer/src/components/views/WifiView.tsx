import React, { useState, useEffect } from 'react';
import { Wifi, Check, ExternalLink, Lock, RefreshCw, AlertCircle, KeyRound, ChevronDown, ChevronUp } from 'lucide-react';
import Toggle from '../Toggle';
import type { WifiStatus, WifiNetwork } from '../../../../preload/types';

export const WifiView: React.FC = () => {
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
          setConnectionError(res.error || 'Не удалось подключиться к сети');
        }
      }
    } catch (err: any) {
      console.error('[WifiView] Connect error:', err);
      setConnectionError(err?.message || 'Ошибка подключения');
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
    <div className="space-y-4 max-w-xl animate-fadeIn text-[#e5e2e3]">
      {/* ── Main Wi-Fi Switch Card ────────────────────────────────────── */}
      <div className="frosted-card p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#242329] border border-[#2a282d] flex items-center justify-center text-[#859aea] shadow-sm">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#e5e2e3]">Wi-Fi</div>
            <div className="text-xs text-[#929092]">
              {status.enabled
                ? status.connected
                  ? `Подключено: ${status.ssid}`
                  : isScanning
                  ? 'Поиск сетей...'
                  : 'Готов к подключению'
                : 'Выключен'}
            </div>
          </div>
        </div>

        <Toggle checked={status.enabled} onChange={handleToggle} />
      </div>

      {/* ── Error Banner ──────────────────────────────────────────────── */}
      {connectionError && (
        <div className="px-4 py-3 rounded-xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/25 flex items-center space-x-2.5 text-xs text-[#ffb4ab]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{connectionError}</span>
        </div>
      )}

      {/* ── Connected Network Card ─────────────────────────────────────── */}
      {status.enabled && (
        <div className="frosted-card overflow-hidden">
          <div className="px-5 py-3 text-[10px] font-semibold text-[#636265] uppercase tracking-wider">
            Активная сеть
          </div>

          <div className="divide-y divide-[#2a282d]">
            {status.connected && status.ssid ? (
              <div className="px-5 py-3.5 flex items-center justify-between hover:bg-[#252429] transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-[#a3d4a0]/15 border border-[#a3d4a0]/30 flex items-center justify-center text-[#a3d4a0]">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#e5e2e3]">{status.ssid}</div>
                    <div className="text-xs text-[#929092]">Сигнал: {status.signal}%</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-[#929092]">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="text-xs font-mono">WPA2/WPA3</span>
                </div>
              </div>
            ) : (
              <div className="px-5 py-4 text-xs text-[#929092] text-center">
                Нет активных подключений
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Available Networks List ───────────────────────────────────── */}
      {status.enabled && (
        <div className="frosted-card overflow-hidden">
          <div className="px-5 py-3 flex items-center justify-between border-b border-[#2a282d]">
            <span className="text-[10px] font-semibold text-[#636265] uppercase tracking-wider">
              Доступные сети {otherNetworks.length > 0 ? `(${otherNetworks.length})` : ''}
            </span>

            <button
              type="button"
              onClick={fetchNetworks}
              disabled={isScanning}
              className="flex items-center space-x-1.5 text-xs text-[#929092] hover:text-[#e5e2e3] transition-colors cursor-pointer"
              title="Повторить поиск сетей"
            >
              <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin text-[#859aea]' : ''}`} />
              <span>Обновить</span>
            </button>
          </div>

          <div className="divide-y divide-[#2a282d] max-h-72 overflow-y-auto">
            {isScanning && otherNetworks.length === 0 ? (
              <div className="px-5 py-6 text-center text-xs text-[#929092] flex flex-col items-center space-y-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#859aea]" />
                <span>Сканирование диапазона Wi-Fi...</span>
              </div>
            ) : otherNetworks.length === 0 ? (
              <div className="px-5 py-5 text-center text-xs text-[#929092]">
                Сети не найдены
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
                      className="px-5 py-3 flex items-center justify-between hover:bg-[#252429] cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <Wifi className="w-4 h-4 text-[#88c0d0] shrink-0" />
                        <div className="truncate">
                          <div className="text-xs font-medium text-[#e5e2e3] truncate">
                            {net.ssid}
                          </div>
                          <div className="text-[11px] text-[#929092] flex items-center space-x-2">
                            <span>Сигнал: {net.signal}%</span>
                            {net.isSaved && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#242329] text-[#c0c6dc] border border-[#2a282d]">
                                Сохранено
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2.5 shrink-0 pl-2">
                        {isConnecting ? (
                          <span className="flex items-center space-x-1.5 text-xs text-[#859aea]">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Подключение...</span>
                          </span>
                        ) : (
                          <>
                            {isEncrypted ? (
                              <Lock className="w-3.5 h-3.5 text-[#929092]" />
                            ) : (
                              <span className="text-[10px] text-[#a3d4a0]">Открытая</span>
                            )}

                            {isEncrypted && !net.isSaved && (
                              isEnteringPassword ? (
                                <ChevronUp className="w-3.5 h-3.5 text-[#859aea]" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-[#929092]" />
                              )
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Inline Password Entry Form */}
                    {isEnteringPassword && (
                      <div className="px-5 py-3 bg-[#161519] border-t border-[#2a282d] flex items-center space-x-2.5">
                        <div className="relative flex-1">
                          <KeyRound className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#929092]" />
                          <input
                            type="password"
                            placeholder="Пароль от сети..."
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleConnect(net.ssid, passwordInput);
                            }}
                            autoFocus
                            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#131315] border border-[#2a282d] focus:border-[#859aea] rounded-lg text-[#e5e2e3] placeholder-[#636265] outline-none transition-colors"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleConnect(net.ssid, passwordInput)}
                          disabled={!passwordInput}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#859aea] hover:bg-[#a4b5f5] text-[#131315] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          Подключиться
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Network Connections Editor Button */}
            <button
              type="button"
              onClick={handleOpenSettings}
              className="w-full px-5 py-3 flex items-center justify-between text-xs text-[#929092] hover:text-[#e5e2e3] hover:bg-[#252429] transition-colors cursor-pointer"
            >
              <span className="font-medium">Все сетевые подключения (nm-connection-editor)</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#929092]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WifiView;
