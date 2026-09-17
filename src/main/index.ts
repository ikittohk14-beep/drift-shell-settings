import { app, BrowserWindow, ipcMain, dialog, protocol, net } from 'electron';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import { exec } from 'node:child_process';
import util from 'node:util';
import { parse as parseToml, stringify as stringifyToml } from 'smol-toml';

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'media',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      bypassCSP: true,
      stream: true,
      corsEnabled: true,
    },
  },
]);
import type {
  DriftConfig,
  ConfigValidationResult,
  ActiveWindow,
  WallpaperItem,
  WifiStatus,
  BluetoothStatus,
  AudioStatus,
  WifiNetwork,
  BluetoothDeviceItem,
} from '../preload/types';

const execAsync = util.promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure native Wayland flags
app.commandLine.appendSwitch('ozone-platform-hint', 'auto');
app.commandLine.appendSwitch('enable-features', 'WaylandWindowDecorations');

app.setName('drift-shell-settings');
app.setAppUserModelId('drift-shell-settings');

function parseTabFromArgs(args: string[]): string | null {
  for (const arg of args) {
    if (arg.startsWith('--tab=')) {
      return arg.slice(6).toLowerCase();
    }
    const clean = arg.toLowerCase().replace(/^-+/, '');
    if (['wifi', 'bluetooth', 'personalization', 'audio', 'windows', 'input', 'shortcuts', 'system'].includes(clean)) {
      return clean;
    }
  }
  return null;
}

let currentRequestedTab: string | null = parseTabFromArgs(process.argv);

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
} else {
  app.on('second-instance', (_event, commandLine) => {
    const tab = parseTabFromArgs(commandLine);
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      if (tab) {
        mainWindow.webContents.send('drift:switch-tab', tab);
      }
    }
  });
}

const HOME_DIR = os.homedir();
const CONFIG_PATH = path.join(HOME_DIR, '.config', 'driftwm', 'config.toml');

let mainWindow: BrowserWindow | null = null;

// ── Helpers ────────────────────────────────────────────────────────────────

function normalizePathForConfig(filePath: string): string {
  if (filePath.startsWith(HOME_DIR)) {
    return '~/' + path.relative(HOME_DIR, filePath);
  }
  return filePath;
}

function cleanWindowRule(r: any): any {
  if (!r || typeof r !== 'object') return null;
  const cleaned: any = {};
  if (typeof r.app_id === 'string' && r.app_id.trim()) cleaned.app_id = r.app_id.trim();
  if (typeof r.title === 'string' && r.title.trim()) cleaned.title = r.title.trim();
  if (Array.isArray(r.position) && r.position.length === 2 && !isNaN(Number(r.position[0])) && !isNaN(Number(r.position[1]))) {
    cleaned.position = [Math.round(Number(r.position[0])), Math.round(Number(r.position[1]))];
  }
  if (Array.isArray(r.size) && r.size.length === 2 && !isNaN(Number(r.size[0])) && !isNaN(Number(r.size[1]))) {
    cleaned.size = [Math.round(Number(r.size[0])), Math.round(Number(r.size[1]))];
  }
  if (typeof r.widget === 'boolean' && r.widget) cleaned.widget = true;
  if (typeof r.sticky === 'boolean' && r.sticky) cleaned.sticky = true;
  if (typeof r.decoration === 'string' && ['client', 'minimal', 'none', 'server'].includes(r.decoration)) {
    cleaned.decoration = r.decoration;
  }
  if (typeof r.blur === 'boolean') cleaned.blur = r.blur;
  if (typeof r.opacity === 'number' && !isNaN(r.opacity)) {
    cleaned.opacity = Math.max(0.05, Math.min(1.0, Math.round(r.opacity * 100) / 100));
  }
  if (typeof r.border_width === 'number' && !isNaN(r.border_width)) cleaned.border_width = Math.round(r.border_width);
  if (typeof r.border_color === 'string' && r.border_color.trim()) cleaned.border_color = r.border_color.trim();
  if (typeof r.border_color_focused === 'string' && r.border_color_focused.trim()) cleaned.border_color_focused = r.border_color_focused.trim();
  if (typeof r.corner_radius === 'number' && !isNaN(r.corner_radius)) cleaned.corner_radius = Math.round(r.corner_radius);
  if (typeof r.shadow === 'boolean') cleaned.shadow = r.shadow;
  if (r.pass_keys !== undefined) cleaned.pass_keys = r.pass_keys;

  if (Object.keys(cleaned).length > 0 && (cleaned.app_id || cleaned.title)) {
    return cleaned;
  }
  return null;
}

function loadTomlConfig(): DriftConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const content = fs.readFileSync(CONFIG_PATH, 'utf-8');
      const parsed = parseToml(content) as any;
      return {
        autostart: Array.isArray(parsed.autostart) ? parsed.autostart : [],
        focus_follows_mouse: parsed.focus_follows_mouse,
        window_placement: parsed.window_placement,
        effects: parsed.effects || {},
        background: parsed.background || { type: 'wallpaper', path: '' },
        decorations: parsed.decorations || {},
        output: parsed.output || {},
        input: parsed.input || {},
        zoom: parsed.zoom || {},
        snap: parsed.snap || {},
        keybindings: parsed.keybindings || {},
        window_rules: Array.isArray(parsed.window_rules) ? parsed.window_rules : [],
        raw: parsed,
      };
    }
  } catch (error) {
    console.error('[Config] Failed to parse config.toml:', error);
  }
  return { autostart: [], window_rules: [], keybindings: {} };
}

async function validateConfig(): Promise<ConfigValidationResult> {
  try {
    const { stdout, stderr } = await execAsync('driftwm --check-config');
    const combined = (stdout + '\n' + stderr).trim();
    const valid = combined.includes('Config OK');
    return { valid, output: combined };
  } catch (error: any) {
    console.error('[Config] Config validation error:', error);
    return {
      valid: false,
      output: error?.stdout || '',
      error: error?.stderr || error?.message || 'Config validation failed',
    };
  }
}

let lastBackupTime = 0;

async function saveTomlConfig(newConfig: DriftConfig): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Create a backup (at most once every 60 seconds)
    const nowMs = Date.now();
    if (fs.existsSync(CONFIG_PATH) && nowMs - lastBackupTime > 60000) {
      lastBackupTime = nowMs;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(
        HOME_DIR,
        '.config',
        'driftwm',
        `config.toml.bak_${timestamp}`
      );
      fs.copyFileSync(CONFIG_PATH, backupPath);
    }

    // 2. Load existing raw structure to preserve any extra custom sections
    let rawObj: any = {};
    if (fs.existsSync(CONFIG_PATH)) {
      try {
        rawObj = parseToml(fs.readFileSync(CONFIG_PATH, 'utf-8')) as any;
      } catch (e) {
        console.error('[Config] Existing config parse error on pre-save:', e);
      }
    }

    // 3. Merge updated fields into raw object
    if (newConfig.autostart !== undefined) rawObj.autostart = newConfig.autostart;
    if (newConfig.focus_follows_mouse !== undefined) rawObj.focus_follows_mouse = newConfig.focus_follows_mouse;
    if (newConfig.window_placement !== undefined) rawObj.window_placement = newConfig.window_placement;
    if (newConfig.effects !== undefined) rawObj.effects = newConfig.effects;
    if (newConfig.background !== undefined) rawObj.background = newConfig.background;
    if (newConfig.decorations !== undefined) {
      rawObj.decorations = {
        ...(typeof rawObj.decorations === 'object' && rawObj.decorations !== null ? rawObj.decorations : {}),
        ...newConfig.decorations,
      };
    }
    if (newConfig.output !== undefined) {
      rawObj.output = {
        ...(typeof rawObj.output === 'object' && rawObj.output !== null ? rawObj.output : {}),
        ...newConfig.output,
      };
    }
    if (newConfig.input !== undefined) rawObj.input = newConfig.input;
    if (newConfig.zoom !== undefined) rawObj.zoom = newConfig.zoom;
    if (newConfig.snap !== undefined) rawObj.snap = newConfig.snap;
    if (newConfig.keybindings !== undefined) rawObj.keybindings = newConfig.keybindings;
    if (newConfig.window_rules !== undefined) {
      rawObj.window_rules = newConfig.window_rules
        .map(cleanWindowRule)
        .filter((r: any): r is Record<string, any> => r !== null);
    }

    // 4. Stringify to TOML
    const tomlStr = stringifyToml(rawObj);
    fs.writeFileSync(CONFIG_PATH, tomlStr, 'utf-8');

    // 5. Validate with driftwm --check-config
    const validation = await validateConfig();
    if (!validation.valid) {
      return { success: false, error: validation.error || validation.output };
    }

    // Touch config file so driftwm inotify watcher immediately picks up changes
    try {
      const now = new Date();
      fs.utimesSync(CONFIG_PATH, now, now);
    } catch (e) {
      // Ignore utimes error
    }

    return { success: true };
  } catch (error: any) {
    console.error('[Config] Failed to save config.toml:', error);
    return { success: false, error: error?.message || 'Failed to save config' };
  }
}

function getDriftwmActiveWindows(): ActiveWindow[] {
  try {
    const runtimeDir = process.env.XDG_RUNTIME_DIR || '/tmp';
    const statePath = path.join(runtimeDir, 'driftwm', 'state');
    if (fs.existsSync(statePath)) {
      const content = fs.readFileSync(statePath, 'utf-8');
      for (const line of content.split('\n')) {
        if (line.startsWith('windows=')) {
          const jsonStr = line.slice('windows='.length).trim();
          const parsed = JSON.parse(jsonStr);
          if (Array.isArray(parsed)) {
            return parsed.map((w: any) => ({
              app_id: w.app_id || '',
              title: w.title || '',
              position: Array.isArray(w.position) ? [w.position[0], w.position[1]] : [0, 0],
              size: Array.isArray(w.size) ? [w.size[0], w.size[1]] : [400, 300],
              is_focused: !!w.is_focused,
              is_widget: !!w.is_widget,
            }));
          }
        }
      }
    }
  } catch (error) {
    console.error('[Driftwm] Failed to read active windows from state:', error);
  }
  return [];
}

let currentWallpaperDir = path.join(HOME_DIR, 'Пикчи', 'Обои');

function getAvailableWallpapers(targetDir?: string): WallpaperItem[] {
  const result: WallpaperItem[] = [];
  const dir = targetDir || currentWallpaperDir;

  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.glsl'];

  try {
    if (fs.existsSync(dir)) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile()) {
          const name = entry.name;
          // Filter out screenshots, hidden files, and temp files
          if (name.startsWith('.') || name.startsWith('Screenshot_') || name.startsWith('.bak')) {
            continue;
          }
          const ext = path.extname(name).toLowerCase();
          if (allowedExts.includes(ext)) {
            const fullPath = path.join(dir, name);
            const isShader = ext === '.glsl';
            result.push({
              name,
              path: normalizePathForConfig(fullPath),
              type: isShader ? 'shader' : 'image',
              previewUrl: isShader ? undefined : pathToFileURL(fullPath).toString(),
            });
          }
        }
      }
    }
  } catch (error) {
    console.error(`[Wallpapers] Failed to read dir ${dir}:`, error);
  }

  // Also include animated shaders from driftwm/wallpapers/animated if present and not current dir
  const animatedDir = path.join(HOME_DIR, 'driftwm', 'wallpapers', 'animated');
  try {
    if (fs.existsSync(animatedDir) && animatedDir !== dir) {
      const entries = fs.readdirSync(animatedDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.glsl')) {
          const fullPath = path.join(animatedDir, entry.name);
          result.push({
            name: entry.name,
            path: normalizePathForConfig(fullPath),
            type: 'shader',
          });
        }
      }
    }
  } catch (e) {
    // Ignore animated dir error
  }

  return result;
}

// ── Hardware & System Helpers ──────────────────────────────────────────────

async function getWifiInfo(): Promise<WifiStatus> {
  try {
    let enabled = true;
    try {
      const radioRes = await execAsync('nmcli radio wifi');
      const out = radioRes.stdout.trim().toLowerCase();
      enabled = out.includes('enabled') || out.includes('включен');
    } catch (e) {
      console.error('[Wifi] Radio check failed:', e);
    }

    if (!enabled) {
      return { enabled: false, connected: false, ssid: null, signal: 0 };
    }

    const wifiResult = await execAsync('nmcli -t -f ACTIVE,SSID,SIGNAL dev wifi', {
      env: { ...process.env, LC_ALL: 'C' },
    });
    for (const line of wifiResult.stdout.trim().split('\n')) {
      if (line.startsWith('yes:')) {
        const parts = line.split(':');
        const ssid = parts[1] || 'Wi-Fi';
        const signal = parseInt(parts[2] || '100', 10);
        return { enabled: true, connected: true, ssid, signal: isNaN(signal) ? 100 : signal };
      }
    }

    const devResult = await execAsync('nmcli -t -f DEVICE,TYPE,STATE,CONNECTION dev', {
      env: { ...process.env, LC_ALL: 'C' },
    });
    for (const line of devResult.stdout.trim().split('\n')) {
      const parts = line.split(':');
      const dev = parts[0];
      const type = parts[1];
      const state = parts[2];
      const conn = parts[3];

      if (state && state.includes('connected') && dev !== 'lo') {
        const displayName = conn || (type === 'ethernet' ? 'Ethernet' : dev);
        return { enabled: true, connected: true, ssid: displayName, signal: 100 };
      }
    }

    return { enabled: true, connected: false, ssid: null, signal: 0 };
  } catch (error) {
    console.error('[Wifi] Failed to query wifi info:', error);
    return { enabled: false, connected: false, ssid: null, signal: 0 };
  }
}

async function getWifiNetworksList(): Promise<WifiNetwork[]> {
  try {
    const savedConnections = new Set<string>();
    try {
      const { stdout: savedOut } = await execAsync('nmcli -t -f NAME,TYPE connection show', {
        env: { ...process.env, LC_ALL: 'C' },
      });
      for (const line of savedOut.trim().split('\n')) {
        const parts = line.split(':');
        if (parts.length >= 2 && parts[1].includes('wireless')) {
          savedConnections.add(parts[0].trim());
        }
      }
    } catch (e) {
      console.error('[Wifi] Saved connections query error:', e);
    }

    const { stdout } = await execAsync('nmcli -t -f IN-USE,SSID,SIGNAL,SECURITY dev wifi list --rescan auto', {
      env: { ...process.env, LC_ALL: 'C' },
    });

    const networkMap = new Map<string, WifiNetwork>();
    for (const line of stdout.trim().split('\n')) {
      if (!line) continue;
      const parts = line.split(/(?<!\\):/);
      if (parts.length < 4) continue;
      const inUse = parts[0].trim() === '*';
      const rawSsid = parts[1].replace(/\\:/g, ':').trim();
      if (!rawSsid || rawSsid === '--') continue;

      const signal = parseInt(parts[2].trim(), 10) || 0;
      const security = parts[3].replace(/\\:/g, ':').trim() || 'Open';

      const existing = networkMap.get(rawSsid);
      if (!existing || inUse || signal > existing.signal) {
        networkMap.set(rawSsid, {
          ssid: rawSsid,
          signal,
          security,
          inUse,
          isSaved: savedConnections.has(rawSsid),
        });
      }
    }

    const list = Array.from(networkMap.values());
    list.sort((a, b) => {
      if (a.inUse !== b.inUse) return a.inUse ? -1 : 1;
      if (a.isSaved !== b.isSaved) return a.isSaved ? -1 : 1;
      return b.signal - a.signal;
    });

    return list;
  } catch (error) {
    console.error('[Wifi] Failed to scan wifi networks:', error);
    return [];
  }
}

async function connectWifiNetwork(ssid: string, password?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanSsid = ssid.replace(/"/g, '\\"');
    let cmd = `nmcli dev wifi connect "${cleanSsid}"`;
    if (password && password.trim()) {
      const cleanPassword = password.replace(/"/g, '\\"');
      cmd += ` password "${cleanPassword}"`;
    }
    const { stdout, stderr } = await execAsync(cmd, {
      env: { ...process.env, LC_ALL: 'C' },
    });
    const combined = (stdout + '\n' + stderr).toLowerCase();
    if (combined.includes('successfully') || combined.includes('connection activated')) {
      return { success: true };
    }
    return { success: true, error: combined.trim() || undefined };
  } catch (error: any) {
    console.error('[Wifi] Connect error:', error);
    return { success: false, error: error?.stderr || error?.message || 'Failed to connect' };
  }
}

async function getBtInfo(): Promise<BluetoothStatus> {
  try {
    let rfkillBlocked = false;
    try {
      const { stdout: rfOut } = await execAsync('rfkill list bluetooth');
      if (rfOut.includes('Soft blocked: yes') || rfOut.includes('Hard blocked: yes')) {
        rfkillBlocked = true;
      }
    } catch (e) {
      // Ignore rfkill error
    }

    if (rfkillBlocked) {
      return { enabled: false, connected: false, deviceName: null, batteryPercent: null };
    }

    let enabled = false;
    try {
      const showRes = await execAsync('bluetoothctl show');
      enabled = showRes.stdout.includes('Powered: yes');
    } catch (e) {
      console.error('[Bluetooth] Show error:', e);
    }

    if (!enabled) {
      return { enabled: false, connected: false, deviceName: null, batteryPercent: null };
    }

    try {
      const { stdout: devOut } = await execAsync('bluetoothctl devices Connected');
      const lines = devOut.trim().split('\n').filter(Boolean);
      if (lines.length > 0) {
        const firstLine = lines[0];
        if (firstLine.startsWith('Device ')) {
          const parts = firstLine.split(' ');
          const mac = parts[1];
          const name = parts.slice(2).join(' ') || 'Bluetooth Device';
          let battery: number | null = null;
          try {
            const { stdout: infoRes } = await execAsync(`bluetoothctl info ${mac}`);
            for (const line of infoRes.split('\n')) {
              const trimmed = line.trim();
              if (trimmed.includes('Battery Percentage:')) {
                const match =
                  trimmed.match(/\((0x[0-9a-fA-F]+|\d+)\)/) ||
                  trimmed.match(/Battery Percentage:\s*(\d+)/);
                if (match) battery = parseInt(match[1], 10);
              }
            }
          } catch (e) {
            // Ignore info detail error
          }
          return {
            enabled: true,
            connected: true,
            deviceName: name,
            batteryPercent: battery,
          };
        }
      }
    } catch (e) {
      // No connected devices
    }

    return { enabled: true, connected: false, deviceName: null, batteryPercent: null };
  } catch (error) {
    console.error('[Bluetooth] Failed to query bluetooth info:', error);
    return { enabled: false, connected: false, deviceName: null, batteryPercent: null };
  }
}

async function getBtDevicesList(): Promise<BluetoothDeviceItem[]> {
  try {
    const { stdout: allOut } = await execAsync('bluetoothctl devices').catch(() => ({ stdout: '' }));
    const { stdout: pairedOut } = await execAsync('bluetoothctl devices Paired').catch(() => ({ stdout: '' }));
    const { stdout: connOut } = await execAsync('bluetoothctl devices Connected').catch(() => ({ stdout: '' }));

    const pairedMacs = new Set<string>();
    for (const line of pairedOut.trim().split('\n')) {
      const match = line.match(/^Device\s+([0-9A-Fa-f:]{17})/);
      if (match) pairedMacs.add(match[1].toUpperCase());
    }

    const connectedMacs = new Set<string>();
    for (const line of connOut.trim().split('\n')) {
      const match = line.match(/^Device\s+([0-9A-Fa-f:]{17})/);
      if (match) connectedMacs.add(match[1].toUpperCase());
    }

    const rawList: { mac: string; name: string }[] = [];
    const seen = new Set<string>();

    for (const line of allOut.trim().split('\n')) {
      const match = line.match(/^Device\s+([0-9A-Fa-f:]{17})\s+(.*)$/);
      if (match) {
        const mac = match[1].toUpperCase();
        if (!seen.has(mac)) {
          seen.add(mac);
          rawList.push({
            mac,
            name: match[2].trim() || mac,
          });
        }
      }
    }

    const devices: BluetoothDeviceItem[] = await Promise.all(
      rawList.map(async ({ mac, name }) => {
        let batteryPercent: number | null = null;
        let icon: string | undefined = undefined;
        let trusted = false;

        const isPaired = pairedMacs.has(mac);
        const isConnected = connectedMacs.has(mac);

        if (isPaired || isConnected) {
          try {
            const { stdout: infoRes } = await execAsync(`bluetoothctl info ${mac}`);
            for (const line of infoRes.split('\n')) {
              const trimmed = line.trim();
              if (trimmed.startsWith('Icon:')) {
                icon = trimmed.replace(/^Icon:\s*/, '').trim();
              }
              if (trimmed.startsWith('Trusted:')) {
                trusted = trimmed.includes('yes');
              }
              if (trimmed.includes('Battery Percentage:')) {
                const match =
                  trimmed.match(/\((0x[0-9a-fA-F]+|\d+)\)/) ||
                  trimmed.match(/Battery Percentage:\s*(\d+)/);
                if (match) {
                  batteryPercent = parseInt(match[1], 10);
                }
              }
            }
          } catch (e) {
            // Ignore info lookup error
          }
        }

        return {
          mac,
          name,
          connected: isConnected,
          paired: isPaired,
          trusted,
          batteryPercent,
          icon,
        };
      })
    );

    devices.sort((a, b) => {
      if (a.connected !== b.connected) return a.connected ? -1 : 1;
      if (a.paired !== b.paired) return a.paired ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return devices;
  } catch (error) {
    console.error('[Bluetooth] Failed to get devices:', error);
    return [];
  }
}

async function scanBtDevices(): Promise<BluetoothDeviceItem[]> {
  try {
    await execAsync('bluetoothctl --timeout 5 scan on').catch(() => {});
    return await getBtDevicesList();
  } catch (error) {
    console.error('[Bluetooth] Scan error:', error);
    return await getBtDevicesList();
  }
}

async function pairBtDevice(mac: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { stdout, stderr } = await execAsync(`bluetoothctl pair ${mac}`);
    await execAsync(`bluetoothctl trust ${mac}`).catch(() => {});
    await execAsync(`bluetoothctl connect ${mac}`).catch(() => {});
    const combined = (stdout + '\n' + stderr).toLowerCase();
    if (combined.includes('failed') || combined.includes('error') || combined.includes('not available')) {
      return { success: false, error: combined.trim() };
    }
    return { success: true };
  } catch (error: any) {
    console.error('[Bluetooth] Pair error:', error);
    return { success: false, error: error?.stderr || error?.message || 'Failed to pair device' };
  }
}

async function unpairBtDevice(mac: string): Promise<boolean> {
  try {
    await execAsync(`bluetoothctl remove ${mac}`);
    return true;
  } catch (error) {
    console.error('[Bluetooth] Unpair error:', error);
    return false;
  }
}

async function disconnectBtDevice(mac: string): Promise<boolean> {
  try {
    await execAsync(`bluetoothctl disconnect ${mac}`);
    return true;
  } catch (error) {
    console.error('[Bluetooth] Disconnect error:', error);
    return false;
  }
}

async function connectBtDevice(mac: string): Promise<boolean> {
  try {
    await execAsync(`bluetoothctl connect ${mac}`);
    return true;
  } catch (error) {
    console.error('[Bluetooth] Connect error:', error);
    return false;
  }
}

async function getAudioInfo(): Promise<AudioStatus> {
  try {
    const { stdout } = await execAsync('wpctl get-volume @DEFAULT_AUDIO_SINK@');
    const parts = stdout.trim().split(/\s+/);
    if (parts.length >= 2) {
      const vol = Math.round(parseFloat(parts[1]) * 100);
      const isMuted = stdout.includes('[MUTED]');
      return { volume: isNaN(vol) ? 0 : Math.min(100, vol), isMuted };
    }
    return { volume: 50, isMuted: false };
  } catch (error) {
    console.error('[Audio] Info error:', error);
    return { volume: 50, isMuted: false };
  }
}

async function handleSystemAction(action: 'poweroff' | 'reboot' | 'suspend' | 'lock'): Promise<void> {
  try {
    if (action === 'poweroff') {
      await execAsync('systemctl poweroff');
    } else if (action === 'reboot') {
      await execAsync('systemctl reboot');
    } else if (action === 'suspend') {
      await execAsync('systemctl suspend');
    } else if (action === 'lock') {
      const lockScript = path.join(HOME_DIR, 'driftwm/extras/scripts/lock.sh');
      if (fs.existsSync(lockScript)) {
        await execAsync(`sh ${lockScript}`);
      } else {
        await execAsync('loginctl lock-session');
      }
    }
  } catch (error) {
    console.error(`[System] Failed to perform ${action}:`, error);
  }
}

// ── IPC Handlers ───────────────────────────────────────────────────────────

function registerIpc(): void {
  ipcMain.handle('drift:load-config', () => {
    return loadTomlConfig();
  });

  ipcMain.handle('drift:save-config', async (_event, config: DriftConfig) => {
    return await saveTomlConfig(config);
  });

  ipcMain.handle('drift:check-config', async () => {
    return await validateConfig();
  });

  ipcMain.handle('drift:get-active-windows', () => {
    return getDriftwmActiveWindows();
  });

  ipcMain.handle('drift:get-wallpapers', () => {
    return getAvailableWallpapers();
  });

  ipcMain.handle('drift:get-wallpaper-dir', () => {
    return currentWallpaperDir;
  });

  ipcMain.handle('drift:choose-wallpaper-dir', async () => {
    try {
      if (mainWindow) {
        const res = await dialog.showOpenDialog(mainWindow, {
          title: 'Выберите папку с обоями',
          defaultPath: currentWallpaperDir,
          properties: ['openDirectory'],
        });
        if (!res.canceled && res.filePaths.length > 0) {
          currentWallpaperDir = res.filePaths[0];
          return {
            path: currentWallpaperDir,
            items: getAvailableWallpapers(currentWallpaperDir),
          };
        }
      }
    } catch (e) {
      console.error('[Wallpapers] Choose directory error:', e);
    }
    return null;
  });

  ipcMain.handle('drift:choose-wallpaper-file', async () => {
    try {
      if (mainWindow) {
        const res = await dialog.showOpenDialog(mainWindow, {
          title: 'Выберите файл обоев',
          defaultPath: currentWallpaperDir,
          filters: [
            { name: 'Изображения и шейдеры', extensions: ['jpg', 'jpeg', 'png', 'webp', 'glsl'] },
          ],
          properties: ['openFile'],
        });
        if (!res.canceled && res.filePaths.length > 0) {
          const chosen = res.filePaths[0];
          const normalized = normalizePathForConfig(chosen);
          const config = loadTomlConfig();
          config.background = {
            type: chosen.endsWith('.glsl') ? 'shader' : 'wallpaper',
            path: normalized,
          };
          await saveTomlConfig(config);
          return normalized;
        }
      }
    } catch (e) {
      console.error('[Wallpapers] Choose file error:', e);
    }
    return null;
  });

  ipcMain.handle('drift:set-wallpaper', async (_event, wallPath: string) => {
    try {
      const config = loadTomlConfig();
      config.background = {
        type: wallPath.endsWith('.glsl') ? 'shader' : 'wallpaper',
        path: wallPath,
      };
      const res = await saveTomlConfig(config);
      return res.success;
    } catch (error) {
      console.error('[Wallpapers] Failed to set wallpaper:', error);
      return false;
    }
  });

  ipcMain.handle('drift:reload', async () => {
    try {
      const now = new Date();
      fs.utimesSync(CONFIG_PATH, now, now);
    } catch (error) {
      console.error('[Driftwm] Reload error:', error);
    }
  });

  ipcMain.on('drift:window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.on('drift:window-close', () => {
    if (mainWindow) mainWindow.close();
  });

  // Hardware and system handlers
  ipcMain.handle('drift:wifi-status', async () => {
    return await getWifiInfo();
  });

  ipcMain.handle('drift:wifi-toggle', async (_event, enable: boolean) => {
    try {
      await execAsync(`nmcli radio wifi ${enable ? 'on' : 'off'}`);
      return true;
    } catch (error) {
      console.error('[Wifi] Toggle error:', error);
      return false;
    }
  });

  ipcMain.handle('drift:wifi-open-settings', async () => {
    try {
      exec('nm-connection-editor');
    } catch (error) {
      console.error('[Wifi] Open settings error:', error);
    }
  });

  ipcMain.handle('drift:wifi-networks', async () => {
    return await getWifiNetworksList();
  });

  ipcMain.handle('drift:wifi-connect', async (_event, { ssid, password }: { ssid: string; password?: string }) => {
    return await connectWifiNetwork(ssid, password);
  });

  ipcMain.handle('drift:bt-status', async () => {
    return await getBtInfo();
  });

  ipcMain.handle('drift:bt-toggle', async (_event, enable: boolean) => {
    try {
      if (enable) {
        try {
          await execAsync('rfkill unblock bluetooth');
        } catch (e) {
          console.error('[Bluetooth] rfkill unblock error:', e);
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
        try {
          await execAsync('bluetoothctl power on');
        } catch (e) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          await execAsync('bluetoothctl power on');
        }
        return true;
      } else {
        try {
          await execAsync('bluetoothctl power off');
        } catch (e) {
          console.error('[Bluetooth] power off error:', e);
        }
        try {
          await execAsync('rfkill block bluetooth');
        } catch (e) {
          console.error('[Bluetooth] rfkill block error:', e);
        }
        return true;
      }
    } catch (error) {
      console.error('[Bluetooth] Toggle error:', error);
      return false;
    }
  });

  ipcMain.handle('drift:bt-devices', async () => {
    return await getBtDevicesList();
  });

  ipcMain.handle('drift:bt-scan', async () => {
    return await scanBtDevices();
  });

  ipcMain.handle('drift:bt-connect-device', async (_event, mac: string) => {
    return await connectBtDevice(mac);
  });

  ipcMain.handle('drift:bt-disconnect-device', async (_event, mac: string) => {
    return await disconnectBtDevice(mac);
  });

  ipcMain.handle('drift:bt-pair-device', async (_event, mac: string) => {
    return await pairBtDevice(mac);
  });

  ipcMain.handle('drift:bt-unpair-device', async (_event, mac: string) => {
    return await unpairBtDevice(mac);
  });

  ipcMain.handle('drift:bt-open-settings', async () => {
    try {
      exec('blueman-manager');
    } catch (error) {
      console.error('[Bluetooth] Open settings error:', error);
    }
  });

  ipcMain.handle('drift:audio-status', async () => {
    return await getAudioInfo();
  });

  ipcMain.handle('drift:audio-set-volume', async (_event, volume: number) => {
    try {
      const frac = (Math.max(0, Math.min(100, volume)) / 100).toFixed(2);
      await execAsync(`wpctl set-volume @DEFAULT_AUDIO_SINK@ ${frac}`);
    } catch (error) {
      console.error('[Audio] Set volume error:', error);
    }
  });

  ipcMain.handle('drift:audio-toggle-mute', async () => {
    try {
      await execAsync('wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle');
      const st = await getAudioInfo();
      return st.isMuted;
    } catch (error) {
      console.error('[Audio] Toggle mute error:', error);
      return false;
    }
  });

  ipcMain.handle('drift:audio-open-settings', async () => {
    try {
      exec('pavucontrol');
    } catch (error) {
      console.error('[Audio] Open settings error:', error);
    }
  });

  ipcMain.handle('drift:system-action', async (_event, action: 'poweroff' | 'reboot' | 'suspend' | 'lock') => {
    await handleSystemAction(action);
  });

  ipcMain.handle('drift:get-initial-tab', () => {
    const tab = currentRequestedTab;
    currentRequestedTab = null;
    return tab;
  });

  ipcMain.on('drift:window-close', () => {
    if (mainWindow) {
      mainWindow.close();
    }
  });

  ipcMain.on('drift:window-minimize', () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });
}

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 980,
    height: 680,
    minWidth: 800,
    minHeight: 520,
    frame: false,
    titleBarStyle: 'hidden',
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    title: 'drift-shell-settings',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.cjs'),
      sandbox: false,
      contextIsolation: true,
      webSecurity: false,
    },
  });

  win.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown') {
      const key = input.key.toLowerCase();
      const code = input.code;
      const isCtrlOrMeta = input.control || input.meta;
      const isAlt = input.alt;

      if (
        input.key === 'Escape' ||
        (isCtrlOrMeta && (key === 'w' || key === 'ц' || code === 'KeyW' || key === 'q' || key === 'й' || code === 'KeyQ')) ||
        (isAlt && input.key === 'F4')
      ) {
        event.preventDefault();
        win.close();
      }
    }
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  const baseUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

  if (isDev) {
    win.loadURL(baseUrl).catch((err) => {
      console.error('[Window] Failed to load URL:', err);
    });
  } else {
    win.loadFile(path.join(__dirname, '../../dist/index.html')).catch((err) => {
      console.error('[Window] Failed to load file:', err);
    });
  }

  return win;
}

app.whenReady().then(() => {
  protocol.handle('media', (request) => {
    try {
      const url = new URL(request.url);
      let filePath = decodeURIComponent(url.pathname);
      if (url.host && url.host !== 'local') {
        filePath = '/' + url.host + filePath;
      }
      return net.fetch(pathToFileURL(filePath).toString());
    } catch (err) {
      console.error('[Protocol] Error serving media:', err);
      return new Response('Not found', { status: 404 });
    }
  });

  registerIpc();
  mainWindow = createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
