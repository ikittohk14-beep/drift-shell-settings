export interface WindowRule {
  id?: string;
  app_id?: string;
  title?: string;
  position?: [number, number];
  size?: [number, number];
  widget?: boolean;
  decoration?: 'client' | 'minimal' | 'none' | 'server';
  blur?: boolean;
  opacity?: number;
  sticky?: boolean;
  fullscreen?: boolean;
}

export interface EffectsConfig {
  blur_radius?: number;
  blur_strength?: number;
  animate_blur?: boolean;
}

export interface DecorationsConfig {
  default_mode?: 'client' | 'minimal' | 'none';
  bg_color?: string;
  fg_color?: string;
  corner_radius?: number;
  shadow?: boolean;
  title_bar_height?: number;
  border_width?: number;
  border_color?: string;
  border_color_focused?: string;
}

export interface BackgroundConfig {
  type: 'wallpaper' | 'color' | 'shader';
  path?: string;
  color?: string;
}

export interface OutputOutlineConfig {
  color?: string;
  thickness?: number;
}

export interface InputKeyboardConfig {
  layout?: string;
  options?: string;
  repeat_rate?: number;
  repeat_delay?: number;
}

export interface InputDeviceConfig {
  accel_speed?: number;
  accel_profile?: 'flat' | 'adaptive';
  natural_scroll?: boolean;
  tap_to_click?: boolean;
}

export interface ZoomConfig {
  reset_on_new_window?: boolean;
  reset_on_activation?: boolean;
}

export interface SnapConfig {
  enabled?: boolean;
  gap?: number;
  same_edge?: boolean;
  edge_center?: boolean;
}

export interface DriftConfig {
  autostart?: string[];
  focus_follows_mouse?: boolean;
  window_placement?: 'center' | 'cursor' | 'auto';
  effects?: EffectsConfig;
  background?: BackgroundConfig;
  decorations?: DecorationsConfig;
  output?: {
    outline?: OutputOutlineConfig;
  };
  input?: {
    keyboard?: InputKeyboardConfig;
    mouse?: InputDeviceConfig;
    trackpad?: InputDeviceConfig;
  };
  zoom?: ZoomConfig;
  snap?: SnapConfig;
  keybindings?: Record<string, string>;
  window_rules?: WindowRule[];
  raw?: Record<string, any>;
}

export interface ActiveWindow {
  app_id: string;
  title: string;
  position: [number, number];
  size: [number, number];
  is_focused: boolean;
  is_widget: boolean;
}

export interface WallpaperItem {
  name: string;
  path: string;
  type: 'image' | 'shader';
  previewUrl?: string;
}

export interface ConfigValidationResult {
  valid: boolean;
  output: string;
  error?: string;
}

export interface WifiStatus {
  enabled: boolean;
  connected: boolean;
  ssid: string | null;
  signal: number;
}

export interface BluetoothStatus {
  enabled: boolean;
  connected: boolean;
  deviceName: string | null;
  batteryPercent?: number | null;
}

export interface AudioStatus {
  volume: number;
  isMuted: boolean;
}

export interface WifiNetwork {
  ssid: string;
  signal: number;
  security: string;
  inUse: boolean;
  isSaved?: boolean;
}

export interface BluetoothDeviceItem {
  mac: string;
  name: string;
  connected: boolean;
  paired: boolean;
  trusted?: boolean;
  batteryPercent?: number | null;
  icon?: string;
}

export interface DriftControlAPI {
  loadConfig: () => Promise<DriftConfig>;
  saveConfig: (config: DriftConfig) => Promise<{ success: boolean; error?: string }>;
  checkConfig: () => Promise<ConfigValidationResult>;
  getActiveWindows: () => Promise<ActiveWindow[]>;
  getWallpapers: () => Promise<WallpaperItem[]>;
  setWallpaper: (path: string) => Promise<boolean>;
  getWallpaperDir: () => Promise<string>;
  chooseWallpaperFolder: () => Promise<{ path: string; items: WallpaperItem[] } | null>;
  chooseWallpaperFile: () => Promise<string | null>;
  reloadDriftwm: () => Promise<void>;
  minimizeWindow: () => void;
  closeWindow: () => void;

  // System & Hardware Controls
  getWifiStatus: () => Promise<WifiStatus>;
  toggleWifi: (enable: boolean) => Promise<boolean>;
  getWifiNetworks: () => Promise<WifiNetwork[]>;
  connectWifi: (ssid: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  openWifiSettings: () => Promise<void>;
  getBluetoothStatus: () => Promise<BluetoothStatus>;
  toggleBluetooth: (enable: boolean) => Promise<boolean>;
  getBluetoothDevices: () => Promise<BluetoothDeviceItem[]>;
  scanBluetoothDevices: () => Promise<BluetoothDeviceItem[]>;
  connectBluetoothDevice: (mac: string) => Promise<boolean>;
  disconnectBluetoothDevice: (mac: string) => Promise<boolean>;
  pairBluetoothDevice: (mac: string) => Promise<{ success: boolean; error?: string }>;
  unpairBluetoothDevice: (mac: string) => Promise<boolean>;
  openBluetoothSettings: () => Promise<void>;
  getAudioStatus: () => Promise<AudioStatus>;
  setAudioVolume: (volume: number) => Promise<void>;
  toggleAudioMute: () => Promise<boolean>;
  openAudioSettings: () => Promise<void>;
  systemAction: (action: 'poweroff' | 'reboot' | 'suspend' | 'lock') => Promise<void>;
  onTabSwitch: (callback: (tab: string) => void) => () => void;
  getInitialTab: () => Promise<string | null>;
}

declare global {
  interface Window {
    driftAPI: DriftControlAPI;
  }
}

