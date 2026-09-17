import React, { createContext, useContext, useState } from 'react';

export type Language = 'ru' | 'en';

export const translations = {
  ru: {
    // App & Window
    appName: 'Настройки',
    appSubtitle: 'driftwm • cachyos',
    close: 'Закрыть',
    minimize: 'Свернуть',
    saving: 'Применение...',
    configSavedOk: 'Конфигурация сохранена OK',
    configSaveError: 'Ошибка записи конфигурации',
    autoApplyError: 'Ошибка автоприменения',
    escapeHint: 'Нажмите Escape для закрытия',
    error: 'Ошибка',
    ok: 'OK',

    // Sidebar Groups
    groupConnectivity: 'Связь',
    groupAppearance: 'Внешний вид',
    groupSystem: 'Система',

    // Tabs
    tabWifi: 'Wi-Fi',
    tabBluetooth: 'Bluetooth',
    tabPersonalization: 'Персонализация',
    tabAudio: 'Звук',
    tabWindows: 'Окна и блюр',
    tabInput: 'Клавиатура и мышь',
    tabShortcuts: 'Автозапуск и клавиши',
    tabSystem: 'Управление ПК',

    // Statuses
    enabled: 'Вкл',
    disabled: 'Выкл',
    connected: 'Подключено',
    disconnected: 'Отключено',
    connecting: 'Подключение...',
    disconnecting: 'Отключение...',
    pairing: 'Сопряжение...',
    saved: 'Сохранено',
    signal: 'Сигнал',

    // Wifi View
    wifiTitle: 'Wi-Fi',
    wifiConnectedTo: 'Подключено: ',
    wifiSearching: 'Поиск сетей...',
    wifiReadyToConnect: 'Готов к подключению',
    wifiDisabled: 'Выключен',
    wifiActiveNetwork: 'Активная сеть',
    wifiNoActiveConnection: 'Нет активных подключений',
    wifiAvailableNetworks: 'Доступные сети',
    wifiRefresh: 'Обновить',
    wifiScanningRange: 'Сканирование диапазона Wi-Fi...',
    wifiNoNetworks: 'Сети не найдены',
    wifiOpenNetwork: 'Открытая',
    wifiPasswordPlaceholder: 'Пароль от сети...',
    wifiConnect: 'Подключиться',
    wifiEditorButton: 'Все сетевые подключения (nm-connection-editor)',
    wifiFailedToConnect: 'Не удалось подключиться к сети',
    wifiConnectionError: 'Ошибка подключения',

    // Bluetooth View
    btTitle: 'Bluetooth',
    btConnectedTo: 'Подключено: ',
    btReadyToPair: 'Включен, готов к сопряжению',
    btDisabled: 'Выключен',
    btActiveConnection: 'Активное подключение',
    btSavedDevices: 'Сохраненные устройства',
    btScanRadio: 'Сканировать эфир',
    btScanning: 'Поиск...',
    btNoSavedDevices: 'Нет сохраненных устройств',
    btDisconnect: 'Отключить',
    btConnect: 'Подключить',
    btRemoveDevice: 'Удалить устройство',
    btAvailableDevicesNearby: 'Доступные устройства рядом',
    btScanningNearbyMsg: 'Поиск устройств поблизости...',
    btScanningRadioMsg: 'Сканирование радиоэфира...',
    btPressScanHint: 'Нажмите «Сканировать эфир», чтобы найти новые устройства',
    btPair: 'Сопряжение',
    btBluemanManager: 'Расширенный менеджер (blueman-manager)',

    // Personalization View
    persWallpaper: 'Обои рабочего стола',
    persFolder: 'Папка',
    persFile: 'Файл',
    persChooseFolderTitle: 'Выбрать папку с обоями',
    persChooseFileTitle: 'Выбрать файл обоев',
    persRefreshWallpapers: 'Обновить список обоев',
    persNoWallpapers: 'В папке нет обоев',
    persBordersAndCorners: 'Рамки и скругления окон (driftwm)',
    persBordersDesc: 'Декорации и обводка окон композитором',
    persBorderWidth: 'Толщина обводки окон (border_width):',
    persBorderFocused: 'Цвет активного окна (focused):',
    persBorderUnfocused: 'Цвет неактивного окна (unfocused):',
    persCornerRadius: 'Скругление углов окон (corner_radius):',
    persVisualEffects: 'Эффекты размытия и анимации',
    persBlurRadius: 'Сила размытия фона (blur_radius):',
    persAnimateBlur: 'Плавная анимация окон при открытии',
    persScreenOutline: 'Внешняя рамка мониторов (output outline)',
    persOutlineColor: 'Цвет рамки:',
    persOutlineThickness: 'Толщина (thickness):',

    // Audio View
    audioTitle: 'Громкость звука',
    audioMuted: 'Звук отключен (Mute)',
    audioPavucontrol: 'Расширенный микшер (pavucontrol)',

    // Windows View
    windowsTitle: 'Размытие фона приложений',
    windowsDesc: 'Включение аппаратного блюра под окнами в driftwm',
    windowsActiveApps: 'Открытые приложения',
    windowsNoActiveApps: 'Нет активных приложений',
    windowsAppFallback: 'Приложение',
    windowsBlurOn: 'Блюр вкл',
    windowsBlurOff: 'Выкл',
    windowsOpacity: 'Прозрачность',

    // Input View
    inputKbdTitle: 'Клавиатура и раскладки',
    inputKbdDesc: 'XKB параметры в driftwm',
    inputLayoutsLabel: 'Раскладки (layout):',
    inputSwitchKeyLabel: 'Смена языка (options):',
    inputMouseTitle: 'Мышь и трекпад',
    inputMouseDesc: 'Скорость и ускорение курсора',
    inputMouseSpeed: 'Скорость мыши:',
    inputTrackpadSpeed: 'Скорость трекпада:',
    inputTapToClick: 'Клик касанием по трекпаду (tap_to_click)',
    inputSnapTitle: 'Привязка окон (Snap)',
    inputSnapDesc: 'Магнитное прилипание к краям',
    inputSameEdge: 'Привязка по одной границе (same_edge)',
    inputResetZoom: 'Сброс зума при новом окне',

    // Shortcuts View
    shortcutsAutostartTitle: 'Автозапуск (Autostart)',
    shortcutsStartupCommands: 'команд при старте',
    shortcutsCmdPlaceholder: 'команда (например: swaync)',
    shortcutsKeybindingsTitle: 'Горячие клавиши',
    shortcutsCombinationsCount: 'комбинаций',
    shortcutsCancel: 'Отмена',
    shortcutsAdd: '+ Добавить',
    shortcutsComboPlaceholder: 'комбинация (например: mod+comma)',
    shortcutsActionPlaceholder: 'действие (например: exec kitty)',
    shortcutsSaveBind: 'Сохранить бинд',
    shortcutsDelete: 'Удалить',

    // System View
    systemTitle: 'Управление ПК и сессией',
    systemSubtitle: 'CachyOS • driftwm Wayland Compositor',
    systemLock: 'Заблокировать экран',
    systemLockDesc: 'Переход на экран блокировки lock.sh',
    systemSuspend: 'Спящий режим',
    systemSuspendDesc: 'systemctl suspend',
    systemReloadDriftwm: 'Перезагрузить driftwm',
    systemReloadDriftwmDesc: 'Применить config.toml без выхода из сессии',
    systemReboot: 'Перезагрузка ПК',
    systemRebootDesc: 'systemctl reboot',
    systemPoweroff: 'Выключить компьютер',
    systemPoweroffDesc: 'Безопасное завершение работы',
  },
  en: {
    // App & Window
    appName: 'Settings',
    appSubtitle: 'driftwm • cachyos',
    close: 'Close',
    minimize: 'Minimize',
    saving: 'Applying...',
    configSavedOk: 'Configuration saved OK',
    configSaveError: 'Failed to write configuration',
    autoApplyError: 'Auto-apply error',
    escapeHint: 'Press Escape to close',
    error: 'Error',
    ok: 'OK',

    // Sidebar Groups
    groupConnectivity: 'Connectivity',
    groupAppearance: 'Appearance',
    groupSystem: 'System',

    // Tabs
    tabWifi: 'Wi-Fi',
    tabBluetooth: 'Bluetooth',
    tabPersonalization: 'Personalization',
    tabAudio: 'Audio',
    tabWindows: 'Windows & Blur',
    tabInput: 'Input & Gestures',
    tabShortcuts: 'Shortcuts & Autostart',
    tabSystem: 'Power & Session',

    // Statuses
    enabled: 'On',
    disabled: 'Off',
    connected: 'Connected',
    disconnected: 'Disconnected',
    connecting: 'Connecting...',
    disconnecting: 'Disconnecting...',
    pairing: 'Pairing...',
    saved: 'Saved',
    signal: 'Signal',

    // Wifi View
    wifiTitle: 'Wi-Fi',
    wifiConnectedTo: 'Connected: ',
    wifiSearching: 'Searching networks...',
    wifiReadyToConnect: 'Ready to connect',
    wifiDisabled: 'Disabled',
    wifiActiveNetwork: 'Active Network',
    wifiNoActiveConnection: 'No active connections',
    wifiAvailableNetworks: 'Available Networks',
    wifiRefresh: 'Refresh',
    wifiScanningRange: 'Scanning Wi-Fi frequency range...',
    wifiNoNetworks: 'No networks found',
    wifiOpenNetwork: 'Open',
    wifiPasswordPlaceholder: 'Network password...',
    wifiConnect: 'Connect',
    wifiEditorButton: 'All network connections (nm-connection-editor)',
    wifiFailedToConnect: 'Failed to connect to network',
    wifiConnectionError: 'Connection error',

    // Bluetooth View
    btTitle: 'Bluetooth',
    btConnectedTo: 'Connected: ',
    btReadyToPair: 'Enabled, ready to pair',
    btDisabled: 'Disabled',
    btActiveConnection: 'Active Connection',
    btSavedDevices: 'Paired Devices',
    btScanRadio: 'Scan Air',
    btScanning: 'Scanning...',
    btNoSavedDevices: 'No saved devices',
    btDisconnect: 'Disconnect',
    btConnect: 'Connect',
    btRemoveDevice: 'Remove device',
    btAvailableDevicesNearby: 'Available Devices Nearby',
    btScanningNearbyMsg: 'Scanning nearby devices...',
    btScanningRadioMsg: 'Scanning radio frequencies...',
    btPressScanHint: 'Click "Scan Air" to discover new devices',
    btPair: 'Pair',
    btBluemanManager: 'Advanced Manager (blueman-manager)',

    // Personalization View
    persWallpaper: 'Desktop Wallpapers',
    persFolder: 'Folder',
    persFile: 'File',
    persChooseFolderTitle: 'Choose wallpapers folder',
    persChooseFileTitle: 'Choose wallpaper file',
    persRefreshWallpapers: 'Refresh wallpaper list',
    persNoWallpapers: 'No wallpapers found in folder',
    persBordersAndCorners: 'Window Borders & Rounding (driftwm)',
    persBordersDesc: 'Window decorations and borders by compositor',
    persBorderWidth: 'Window border width (border_width):',
    persBorderFocused: 'Focused border color (focused):',
    persBorderUnfocused: 'Unfocused border color (unfocused):',
    persCornerRadius: 'Corner radius (corner_radius):',
    persVisualEffects: 'Blur & Animations',
    persBlurRadius: 'Background blur strength (blur_radius):',
    persAnimateBlur: 'Smooth window open animation',
    persScreenOutline: 'Monitor Screen Outline (output outline)',
    persOutlineColor: 'Outline color:',
    persOutlineThickness: 'Thickness (thickness):',

    // Audio View
    audioTitle: 'Master Volume',
    audioMuted: 'Muted (Audio Off)',
    audioPavucontrol: 'Advanced Mixer (pavucontrol)',

    // Windows View
    windowsTitle: 'Application Background Blur',
    windowsDesc: 'Enable hardware blur beneath windows in driftwm',
    windowsActiveApps: 'Open Applications',
    windowsNoActiveApps: 'No active applications',
    windowsAppFallback: 'Application',
    windowsBlurOn: 'Blur On',
    windowsBlurOff: 'Off',
    windowsOpacity: 'Opacity',

    // Input View
    inputKbdTitle: 'Keyboard & Layouts',
    inputKbdDesc: 'XKB parameters in driftwm',
    inputLayoutsLabel: 'Layouts (layout):',
    inputSwitchKeyLabel: 'Switch shortcut (options):',
    inputMouseTitle: 'Mouse & Trackpad',
    inputMouseDesc: 'Cursor speed and acceleration',
    inputMouseSpeed: 'Mouse speed:',
    inputTrackpadSpeed: 'Trackpad speed:',
    inputTapToClick: 'Tap to click (tap_to_click)',
    inputSnapTitle: 'Window Snapping (Snap)',
    inputSnapDesc: 'Magnetic edge snapping',
    inputSameEdge: 'Snap on same edge (same_edge)',
    inputResetZoom: 'Reset zoom on new window',

    // Shortcuts View
    shortcutsAutostartTitle: 'Autostart',
    shortcutsStartupCommands: 'startup commands',
    shortcutsCmdPlaceholder: 'command (e.g. swaync)',
    shortcutsKeybindingsTitle: 'Keybindings',
    shortcutsCombinationsCount: 'keybindings',
    shortcutsCancel: 'Cancel',
    shortcutsAdd: '+ Add',
    shortcutsComboPlaceholder: 'combination (e.g. mod+comma)',
    shortcutsActionPlaceholder: 'action (e.g. exec kitty)',
    shortcutsSaveBind: 'Save binding',
    shortcutsDelete: 'Delete',

    // System View
    systemTitle: 'Power & Session Management',
    systemSubtitle: 'CachyOS • driftwm Wayland Compositor',
    systemLock: 'Lock Screen',
    systemLockDesc: 'Switch to lock screen (lock.sh)',
    systemSuspend: 'Suspend / Sleep',
    systemSuspendDesc: 'systemctl suspend',
    systemReloadDriftwm: 'Reload driftwm',
    systemReloadDriftwmDesc: 'Apply config.toml without leaving session',
    systemReboot: 'Restart PC',
    systemRebootDesc: 'systemctl reboot',
    systemPoweroff: 'Shut Down',
    systemPoweroffDesc: 'Safe system shutdown',
  },
};

export type TranslationKey = keyof typeof translations.ru;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType>({
  language: 'ru',
  setLanguage: () => {},
  t: (key: TranslationKey) => translations.ru[key] || key,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('drift_settings_lang');
      if (saved === 'ru' || saved === 'en') return saved;
      const navLang = navigator.language.toLowerCase();
      return navLang.startsWith('ru') ? 'ru' : 'en';
    } catch {
      return 'ru';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('drift_settings_lang', lang);
    } catch (e) {
      console.error('[i18n] Failed to persist language:', e);
    }
  };

  const t = (key: TranslationKey): string => {
    const dict = translations[language] || translations.ru;
    return dict[key] || translations.ru[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
