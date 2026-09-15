import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Check, AlertTriangle, X } from 'lucide-react';
import Sidebar, { TabType } from './components/Sidebar';
import WifiView from './components/views/WifiView';
import BluetoothView from './components/views/BluetoothView';
import PersonalizationView from './components/views/PersonalizationView';
import AudioView from './components/views/AudioView';
import WindowsView from './components/views/WindowsView';
import InputSystemView from './components/views/InputSystemView';
import ShortcutsAutostartView from './components/views/ShortcutsAutostartView';
import SystemView from './components/views/SystemView';
import type {
  DriftConfig,
  ConfigValidationResult,
  WifiStatus,
  BluetoothStatus,
} from '../../preload/types';

export const App: React.FC = () => {
  const [config, setConfig] = useState<DriftConfig>({
    autostart: [],
    window_rules: [],
    keybindings: {},
    effects: {},
    background: { type: 'wallpaper', path: '' },
    decorations: {},
    output: { outline: {} },
    input: { keyboard: {}, mouse: {}, trackpad: {} },
    zoom: {},
    snap: {},
  });

  const [activeTab, setActiveTab] = useState<TabType>('wifi');
  const [validation, setValidation] = useState<ConfigValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasLoadedConfig, setHasLoadedConfig] = useState<boolean>(false);

  const isFirstUpdate = useRef<boolean>(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [wifiStatus, setWifiStatus] = useState<WifiStatus>({
    enabled: true,
    connected: false,
    ssid: null,
    signal: 0,
  });

  const [bluetoothStatus, setBluetoothStatus] = useState<BluetoothStatus>({
    enabled: true,
    connected: false,
    deviceName: null,
  });

  const tabTitles: Record<TabType, string> = {
    wifi: 'Wi-Fi',
    bluetooth: 'Bluetooth',
    personalization: 'Персонализация',
    audio: 'Звук',
    windows: 'Окна и блюр',
    input: 'Клавиатура и мышь',
    shortcuts: 'Автозапуск и клавиши',
    system: 'Управление ПК',
  };

  // Listen for initial tab and CLI / widget tab switches
  useEffect(() => {
    if (window.driftAPI?.getInitialTab) {
      window.driftAPI.getInitialTab().then((tab) => {
        if (tab && tab in tabTitles) {
          setActiveTab(tab as TabType);
        }
      });
    }

    if (window.driftAPI?.onTabSwitch) {
      const unsub = window.driftAPI.onTabSwitch((tab) => {
        if (tab && tab in tabTitles) {
          setActiveTab(tab as TabType);
        }
      });
      return unsub;
    }
  }, []);

  // Close window with Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.driftAPI?.closeWindow();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load config and initial hardware status on mount
  useEffect(() => {
    let isMounted = true;
    const fetchConfigAndStatus = async () => {
      try {
        if (window.driftAPI?.loadConfig) {
          const loaded = await window.driftAPI.loadConfig();
          if (isMounted) {
            setConfig(loaded);
            setHasLoadedConfig(true);
          }
        }
        if (window.driftAPI?.checkConfig) {
          const check = await window.driftAPI.checkConfig();
          if (isMounted) setValidation(check);
        }
        if (window.driftAPI?.getWifiStatus) {
          const wf = await window.driftAPI.getWifiStatus();
          if (isMounted) setWifiStatus(wf);
        }
        if (window.driftAPI?.getBluetoothStatus) {
          const bt = await window.driftAPI.getBluetoothStatus();
          if (isMounted) setBluetoothStatus(bt);
        }
      } catch (err) {
        console.error('[App] Failed to load config or status:', err);
      }
    };

    fetchConfigAndStatus();
    const interval = setInterval(async () => {
      try {
        if (window.driftAPI?.getWifiStatus) {
          const wf = await window.driftAPI.getWifiStatus();
          if (isMounted) setWifiStatus(wf);
        }
        if (window.driftAPI?.getBluetoothStatus) {
          const bt = await window.driftAPI.getBluetoothStatus();
          if (isMounted) setBluetoothStatus(bt);
        }
      } catch (e) {
        console.error('[App] Polling error:', e);
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // ── Debounced Auto-Apply on Any Config Change ─────────────────────────
  useEffect(() => {
    if (!hasLoadedConfig) return;
    if (isFirstUpdate.current) {
      isFirstUpdate.current = false;
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        if (window.driftAPI?.saveConfig) {
          const res = await window.driftAPI.saveConfig(config);
          if (res.success) {
            setValidation({ valid: true, output: 'Конфигурация сохранена OK' });
            if (window.driftAPI?.reloadDriftwm) {
              await window.driftAPI.reloadDriftwm();
            }
          } else {
            setValidation({
              valid: false,
              output: '',
              error: res.error || 'Ошибка записи конфигурации',
            });
          }
        }
      } catch (err: any) {
        console.error('[App] Auto-save error:', err);
        setValidation({
          valid: false,
          output: '',
          error: err?.message || 'Ошибка автоприменения',
        });
      } finally {
        setIsSaving(false);
      }
    }, 300);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [config, hasLoadedConfig]);

  const handleValidate = async () => {
    try {
      setIsValidating(true);
      if (window.driftAPI?.checkConfig) {
        const res = await window.driftAPI.checkConfig();
        setValidation(res);
      }
    } catch (err) {
      console.error('[App] Validation error:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const updateConfigField = <K extends keyof DriftConfig>(field: K, value: DriftConfig[K]) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="w-screen h-screen flex bg-[#131315] text-[#e5e2e3] font-sans overflow-hidden border border-[#2a282d] rounded-2xl shadow-2xl select-none">
      {/* ── Minimal Sidebar ──────────────────────────────────────────── */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        wifiStatus={wifiStatus}
        bluetoothStatus={bluetoothStatus}
      />

      {/* ── Main Content View (Solid, Minimal Header) ─────────────── */}
      <main className="flex-1 overflow-y-auto p-7 min-w-0 flex flex-col bg-[#131315]">
        {/* Minimal Integrated Header with Drag Area */}
        <div className="flex items-center justify-between mb-5 app-drag shrink-0 pb-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-bold text-[#e5e2e3] tracking-tight">
              {tabTitles[activeTab]}
            </h1>
            {/* Subtle Auto-Apply Indicator */}
            {isSaving ? (
              <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] text-[#929092] bg-[#242329] border border-[#2a282d] animate-pulse">
                <RefreshCw className="w-2.5 h-2.5 animate-spin text-[#859aea]" />
                <span>Применение...</span>
              </span>
            ) : validation && !validation.valid ? (
              <span
                className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] text-[#ffb4ab] bg-[#ffb4ab]/10 border border-[#ffb4ab]/25"
                title={validation.error || validation.output}
              >
                <AlertTriangle className="w-2.5 h-2.5" />
                <span>Ошибка</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] text-[#a3d4a0] bg-[#a3d4a0]/10 border border-[#a3d4a0]/25">
                <Check className="w-2.5 h-2.5 text-[#a3d4a0]" />
                <span>Применено</span>
              </span>
            )}
          </div>

          {/* Discreet Minimal Controls */}
          <div className="flex items-center space-x-2 app-no-drag">
            <button
              type="button"
              onClick={handleValidate}
              disabled={isValidating}
              title="Проверить конфиг"
              className="w-7 h-7 rounded-full bg-[#201f24] hover:bg-[#2c2b31] border border-[#2a282d] text-[#929092] hover:text-[#e5e2e3] flex items-center justify-center transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin text-[#e5e2e3]' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => window.driftAPI?.closeWindow()}
              title="Закрыть (Esc)"
              className="w-7 h-7 rounded-full bg-[#201f24] hover:bg-[#ffb4ab]/20 hover:border-[#ffb4ab]/40 hover:text-[#ffb4ab] border border-[#2a282d] text-[#929092] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          {activeTab === 'wifi' && <WifiView />}

          {activeTab === 'bluetooth' && <BluetoothView />}

          {activeTab === 'personalization' && (
            <PersonalizationView
              background={config.background ?? { type: 'wallpaper', path: '' }}
              effects={config.effects ?? {}}
              decorations={config.decorations ?? {}}
              outline={config.output?.outline ?? {}}
              onBackgroundChange={(bg) => updateConfigField('background', bg)}
              onEffectsChange={(eff) => updateConfigField('effects', eff)}
              onDecorationsChange={(dec) => updateConfigField('decorations', dec)}
              onOutlineChange={(out) =>
                updateConfigField('output', { ...config.output, outline: out })
              }
            />
          )}

          {activeTab === 'audio' && <AudioView />}

          {activeTab === 'windows' && (
            <WindowsView
              rules={config.window_rules ?? []}
              onChange={(newRules) => updateConfigField('window_rules', newRules)}
            />
          )}

          {activeTab === 'input' && (
            <InputSystemView
              keyboard={config.input?.keyboard ?? {}}
              mouse={config.input?.mouse ?? {}}
              trackpad={config.input?.trackpad ?? {}}
              zoom={config.zoom ?? {}}
              snap={config.snap ?? {}}
              onKeyboardChange={(kbd) =>
                updateConfigField('input', { ...config.input, keyboard: kbd })
              }
              onMouseChange={(m) => updateConfigField('input', { ...config.input, mouse: m })}
              onTrackpadChange={(tp) =>
                updateConfigField('input', { ...config.input, trackpad: tp })
              }
              onZoomChange={(zm) => updateConfigField('zoom', zm)}
              onSnapChange={(sn) => updateConfigField('snap', sn)}
            />
          )}

          {activeTab === 'shortcuts' && (
            <ShortcutsAutostartView
              autostart={config.autostart ?? []}
              keybindings={config.keybindings ?? {}}
              onAutostartChange={(cmds) => updateConfigField('autostart', cmds)}
              onKeybindingsChange={(kb) => updateConfigField('keybindings', kb)}
            />
          )}

          {activeTab === 'system' && <SystemView />}
        </div>
      </main>
    </div>
  );
};

export default App;
