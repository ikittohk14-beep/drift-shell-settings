import { contextBridge, ipcRenderer } from 'electron';
import type {
  DriftControlAPI,
  DriftConfig,
  ConfigValidationResult,
  ActiveWindow,
  WallpaperItem,
  WifiStatus,
  BluetoothStatus,
  AudioStatus,
  AudioStreamItem,
  WifiNetwork,
  BluetoothDeviceItem,
} from './types';

const api: DriftControlAPI = {
  loadConfig: async (): Promise<DriftConfig> => {
    try {
      return await ipcRenderer.invoke('drift:load-config');
    } catch (error) {
      console.error('[Preload] loadConfig error:', error);
      return {};
    }
  },

  saveConfig: async (config: DriftConfig): Promise<{ success: boolean; error?: string }> => {
    try {
      return await ipcRenderer.invoke('drift:save-config', config);
    } catch (error: any) {
      console.error('[Preload] saveConfig error:', error);
      return { success: false, error: error?.message || 'Unknown save error' };
    }
  },

  checkConfig: async (): Promise<ConfigValidationResult> => {
    try {
      return await ipcRenderer.invoke('drift:check-config');
    } catch (error: any) {
      console.error('[Preload] checkConfig error:', error);
      return { valid: false, output: '', error: error?.message };
    }
  },

  getActiveWindows: async (): Promise<ActiveWindow[]> => {
    try {
      return await ipcRenderer.invoke('drift:get-active-windows');
    } catch (error) {
      console.error('[Preload] getActiveWindows error:', error);
      return [];
    }
  },

  getWallpapers: async (): Promise<WallpaperItem[]> => {
    try {
      return await ipcRenderer.invoke('drift:get-wallpapers');
    } catch (error) {
      console.error('[Preload] getWallpapers error:', error);
      return [];
    }
  },

  setWallpaper: async (path: string): Promise<boolean> => {
    try {
      return await ipcRenderer.invoke('drift:set-wallpaper', path);
    } catch (error) {
      console.error('[Preload] setWallpaper error:', error);
      return false;
    }
  },

  getWallpaperDir: async (): Promise<string> => {
    try {
      return await ipcRenderer.invoke('drift:get-wallpaper-dir');
    } catch (error) {
      console.error('[Preload] getWallpaperDir error:', error);
      return '';
    }
  },

  chooseWallpaperFolder: async (): Promise<{ path: string; items: WallpaperItem[] } | null> => {
    try {
      return await ipcRenderer.invoke('drift:choose-wallpaper-dir');
    } catch (error) {
      console.error('[Preload] chooseWallpaperFolder error:', error);
      return null;
    }
  },

  chooseWallpaperFile: async (): Promise<string | null> => {
    try {
      return await ipcRenderer.invoke('drift:choose-wallpaper-file');
    } catch (error) {
      console.error('[Preload] chooseWallpaperFile error:', error);
      return null;
    }
  },

  reloadDriftwm: async (): Promise<void> => {
    try {
      await ipcRenderer.invoke('drift:reload');
    } catch (error) {
      console.error('[Preload] reloadDriftwm error:', error);
    }
  },

  minimizeWindow: (): void => {
    try {
      ipcRenderer.send('drift:window-minimize');
    } catch (error) {
      console.error('[Preload] minimizeWindow error:', error);
    }
  },

  closeWindow: (): void => {
    try {
      ipcRenderer.send('drift:window-close');
    } catch (error) {
      console.error('[Preload] closeWindow error:', error);
    }
  },

  // ── Hardware & System APIs ──────────────────────────────────────────
  getWifiStatus: async (): Promise<WifiStatus> => {
    try {
      return await ipcRenderer.invoke('drift:wifi-status');
    } catch (error) {
      console.error('[Preload] getWifiStatus error:', error);
      return { enabled: false, connected: false, ssid: null, signal: 0 };
    }
  },

  toggleWifi: async (enable: boolean): Promise<boolean> => {
    try {
      return await ipcRenderer.invoke('drift:wifi-toggle', enable);
    } catch (error) {
      console.error('[Preload] toggleWifi error:', error);
      return false;
    }
  },

  openWifiSettings: async (): Promise<void> => {
    try {
      await ipcRenderer.invoke('drift:wifi-open-settings');
    } catch (error) {
      console.error('[Preload] openWifiSettings error:', error);
    }
  },

  getWifiNetworks: async (): Promise<WifiNetwork[]> => {
    try {
      return await ipcRenderer.invoke('drift:wifi-networks');
    } catch (error) {
      console.error('[Preload] getWifiNetworks error:', error);
      return [];
    }
  },

  connectWifi: async (ssid: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      return await ipcRenderer.invoke('drift:wifi-connect', { ssid, password });
    } catch (error: any) {
      console.error('[Preload] connectWifi error:', error);
      return { success: false, error: error?.message || 'Failed to connect to Wi-Fi' };
    }
  },

  disconnectWifi: async (ssid?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      return await ipcRenderer.invoke('drift:wifi-disconnect', ssid);
    } catch (error: any) {
      console.error('[Preload] disconnectWifi error:', error);
      return { success: false, error: error?.message || 'Failed to disconnect Wi-Fi' };
    }
  },

  getBluetoothStatus: async (): Promise<BluetoothStatus> => {
    try {
      return await ipcRenderer.invoke('drift:bt-status');
    } catch (error) {
      console.error('[Preload] getBluetoothStatus error:', error);
      return { enabled: false, connected: false, deviceName: null };
    }
  },

  toggleBluetooth: async (enable: boolean): Promise<boolean> => {
    try {
      return await ipcRenderer.invoke('drift:bt-toggle', enable);
    } catch (error) {
      console.error('[Preload] toggleBluetooth error:', error);
      return false;
    }
  },

  getBluetoothDevices: async (): Promise<BluetoothDeviceItem[]> => {
    try {
      return await ipcRenderer.invoke('drift:bt-devices');
    } catch (error) {
      console.error('[Preload] getBluetoothDevices error:', error);
      return [];
    }
  },

  scanBluetoothDevices: async (): Promise<BluetoothDeviceItem[]> => {
    try {
      return await ipcRenderer.invoke('drift:bt-scan');
    } catch (error) {
      console.error('[Preload] scanBluetoothDevices error:', error);
      return [];
    }
  },

  connectBluetoothDevice: async (mac: string): Promise<boolean> => {
    try {
      return await ipcRenderer.invoke('drift:bt-connect-device', mac);
    } catch (error) {
      console.error('[Preload] connectBluetoothDevice error:', error);
      return false;
    }
  },

  disconnectBluetoothDevice: async (mac: string): Promise<boolean> => {
    try {
      return await ipcRenderer.invoke('drift:bt-disconnect-device', mac);
    } catch (error) {
      console.error('[Preload] disconnectBluetoothDevice error:', error);
      return false;
    }
  },

  pairBluetoothDevice: async (mac: string): Promise<{ success: boolean; error?: string }> => {
    try {
      return await ipcRenderer.invoke('drift:bt-pair-device', mac);
    } catch (error: any) {
      console.error('[Preload] pairBluetoothDevice error:', error);
      return { success: false, error: error?.message || 'Failed to pair device' };
    }
  },

  unpairBluetoothDevice: async (mac: string): Promise<boolean> => {
    try {
      return await ipcRenderer.invoke('drift:bt-unpair-device', mac);
    } catch (error) {
      console.error('[Preload] unpairBluetoothDevice error:', error);
      return false;
    }
  },

  openBluetoothSettings: async (): Promise<void> => {
    try {
      await ipcRenderer.invoke('drift:bt-open-settings');
    } catch (error) {
      console.error('[Preload] openBluetoothSettings error:', error);
    }
  },

  getAudioStatus: async (): Promise<AudioStatus> => {
    try {
      return await ipcRenderer.invoke('drift:audio-status');
    } catch (error) {
      console.error('[Preload] getAudioStatus error:', error);
      return { volume: 50, isMuted: false };
    }
  },

  setAudioVolume: async (volume: number): Promise<void> => {
    try {
      await ipcRenderer.invoke('drift:audio-set-volume', volume);
    } catch (error) {
      console.error('[Preload] setAudioVolume error:', error);
    }
  },

  toggleAudioMute: async (): Promise<boolean> => {
    try {
      return await ipcRenderer.invoke('drift:audio-toggle-mute');
    } catch (error) {
      console.error('[Preload] toggleAudioMute error:', error);
      return false;
    }
  },

  getAudioStreams: async (): Promise<AudioStreamItem[]> => {
    try {
      return await ipcRenderer.invoke('drift:audio-streams');
    } catch (error) {
      console.error('[Preload] getAudioStreams error:', error);
      return [];
    }
  },

  setStreamVolume: async (id: number, volume: number): Promise<void> => {
    try {
      await ipcRenderer.invoke('drift:audio-stream-set-volume', { id, volume });
    } catch (error) {
      console.error('[Preload] setStreamVolume error:', error);
    }
  },

  toggleStreamMute: async (id: number): Promise<boolean> => {
    try {
      return await ipcRenderer.invoke('drift:audio-stream-toggle-mute', id);
    } catch (error) {
      console.error('[Preload] toggleStreamMute error:', error);
      return false;
    }
  },

  openAudioSettings: async (): Promise<void> => {
    try {
      await ipcRenderer.invoke('drift:audio-open-settings');
    } catch (error) {
      console.error('[Preload] openAudioSettings error:', error);
    }
  },

  systemAction: async (action: 'poweroff' | 'reboot' | 'suspend' | 'lock'): Promise<void> => {
    try {
      await ipcRenderer.invoke('drift:system-action', action);
    } catch (error) {
      console.error('[Preload] systemAction error:', error);
    }
  },

  onTabSwitch: (callback: (tab: string) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, tab: string) => {
      try {
        callback(tab);
      } catch (err) {
        console.error('[Preload] Tab switch callback error:', err);
      }
    };
    ipcRenderer.on('drift:switch-tab', handler);
    return () => {
      ipcRenderer.removeListener('drift:switch-tab', handler);
    };
  },

  getInitialTab: async (): Promise<string | null> => {
    try {
      return await ipcRenderer.invoke('drift:get-initial-tab');
    } catch (error) {
      console.error('[Preload] getInitialTab error:', error);
      return null;
    }
  },
};

contextBridge.exposeInMainWorld('driftAPI', api);
