import React, { useState, useEffect, useRef } from 'react';
import { I18nProvider, useI18n, TranslationKey } from './i18n';
import Titlebar from './components/Titlebar';
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

const SettingsAppInner: React.FC = () => {
  const { t } = useI18n();

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

  const tabTitleKeys: Record<TabType, TranslationKey> = {
    wifi: 'tabWifi',
    bluetooth: 'tabBluetooth',
    personalization: 'tabPersonalization',
    audio: 'tabAudio',
    windows: 'tabWindows',
    input: 'tabInput',
    shortcuts: 'tabShortcuts',
    system: 'tabSystem',
  };

  // Listen for initial tab and CLI / widget tab switches
  useEffect(() => {
    if (window.driftAPI?.getInitialTab) {
      window.driftAPI.getInitialTab().then((tab) => {
        if (tab && tab in tabTitleKeys) {
          setActiveTab(tab as TabType);
        }
      });
    }

    if (window.driftAPI?.onTabSwitch) {
      const unsub = window.driftAPI.onTabSwitch((tab) => {
        if (tab && tab in tabTitleKeys) {
          setActiveTab(tab as TabType);
        }
      });
      return unsub;
    }
  }, []);

  // Close window with Escape, Ctrl+W, Ctrl+Q, Alt+F4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const code = e.code;
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      if (
        e.key === 'Escape' ||
        (isCtrlOrMeta && (key === 'w' || key === 'ц' || code === 'KeyW' || key === 'q' || key === 'й' || code === 'KeyQ')) ||
        (e.altKey && e.key === 'F4')
      ) {
        e.preventDefault();
        window.driftAPI?.closeWindow();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load configuration and hardware status
  useEffect(() => {
    let isMounted = true;

    const fetchConfigAndStatus = async () => {
      try {
        if (window.driftAPI?.loadConfig) {
          const initialConfig = await window.driftAPI.loadConfig();
          if (isMounted) {
            setConfig(initialConfig);
            setHasLoadedConfig(true);
          }
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

  // Debounced Auto-Apply on Any Config Change
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
            setValidation({ valid: true, output: t('configSavedOk') });
            if (window.driftAPI?.reloadDriftwm) {
              await window.driftAPI.reloadDriftwm();
            }
          } else {
            setValidation({
              valid: false,
              output: '',
              error: res.error || t('configSaveError'),
            });
          }
        }
      } catch (err: any) {
        console.error('[App] Auto-save error:', err);
        setValidation({
          valid: false,
          output: '',
          error: err?.message || t('autoApplyError'),
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
    <div className="w-screen h-screen flex flex-col bg-[#131315] text-[#e5e2e3] font-mono overflow-hidden rounded-3xl border border-[#262529] select-none">
      {/* ── Draggable Titlebar across full window width ────────────── */}
      <Titlebar
        title={t(tabTitleKeys[activeTab])}
        validation={validation}
        isValidating={isValidating}
        isSaving={isSaving}
        onValidate={handleValidate}
      />

      {/* ── Main Workspace Body ───────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          wifiStatus={wifiStatus}
          bluetoothStatus={bluetoothStatus}
        />

        {/* ── Scrollable Content Views ────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-5 min-w-0 flex flex-col bg-[#131315]">
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
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <I18nProvider>
      <SettingsAppInner />
    </I18nProvider>
  );
};

export default App;
