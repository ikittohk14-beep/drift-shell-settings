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
    wifiEditorButton: 'Все сетевые подключения',
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
    btBluemanManager: 'Расширенный менеджер',

    // Personalization View
    persWallpaper: 'Обои рабочего стола',
    persFolder: 'Папка',
    persFile: 'Файл',
    persChooseFolderTitle: 'Выбрать папку с обоями',
    persChooseFileTitle: 'Выбрать файл обоев',
    persRefreshWallpapers: 'Обновить список обоев',
    persNoWallpapers: 'В папке нет обоев',
    persBordersAndCorners: 'Рамки и скругления окон',
    persBordersDesc: 'Декорации и обводка окон композитором',
    persBorderWidth: 'Толщина обводки окон:',
    persBorderFocused: 'Цвет активного окна:',
    persBorderUnfocused: 'Цвет неактивного окна:',
    persCornerRadius: 'Скругление углов окон:',
    persVisualEffects: 'Эффекты размытия и анимации',
    persBlurRadius: 'Сила размытия фона:',
    persAnimateBlur: 'Плавная анимация окон при открытии',
    persScreenOutline: 'Внешняя рамка мониторов',
    persOutlineColor: 'Цвет рамки:',
    persOutlineThickness: 'Толщина:',

    // Audio View
    audioTitle: 'Громкость звука',
    audioMuted: 'Звук отключен',
    audioPavucontrol: 'Расширенный микшер',

    // Windows View
    windowsTitle: 'Правила и параметры окон',
    windowsDesc: 'Настройка размытия, прозрачности, рамок и поведения окон в driftwm',
    windowsActiveApps: 'Открытые приложения',
    windowsNoActiveApps: 'Нет активных приложений',
    windowsAppFallback: 'Приложение',
    windowsBlurOn: 'Блюр вкл',
    windowsBlurOff: 'Выкл',
    windowsOpacity: 'Прозрачность',
    windowsAddRule: '+ Новое правило',
    windowsEditRule: 'Редактирование правила',
    windowsConfiguredRules: 'Настроенные правила',
    windowsSearchPlaceholder: 'Поиск правил по приложению или заголовку...',
    windowsNoRules: 'Правила еще не настроены',
    windowsNoMatchingRules: 'Правила не найдены',
    windowsAppId: 'Идентификатор приложения',
    windowsAppIdPlaceholder: 'например: kitty, zen, drift-widgets',
    windowsTitleMatcher: 'Заголовок окна',
    windowsTitleMatcherPlaceholder: 'например: Картинка в картинке',
    windowsQuickPickApp: 'Быстрый выбор из запущенных:',
    windowsBlur: 'Размытие фона под окном',
    windowsCustomOpacity: 'Задать прозрачность',
    windowsDecoration: 'Стиль рамок и заголовка',
    windowsDecorDefault: 'По умолчанию',
    windowsDecorNone: 'Без рамок',
    windowsDecorMinimal: 'Минимальные',
    windowsDecorClient: 'Клиентские',
    windowsDecorServer: 'Серверные',
    windowsSticky: 'Закрепить на всех экранах',
    windowsStickyDesc: 'Окно будет отображаться на всех рабочих пространствах',
    windowsWidget: 'Режим виджета',
    windowsWidgetDesc: 'Окно закрепляется на холсте и обрабатывается как виджет',
    windowsGeometry: 'Размеры и позиция',
    windowsSizeEnabled: 'Фиксированный начальный размер',
    windowsPosEnabled: 'Фиксированная начальная позиция',
    windowsWidth: 'Ширина (px)',
    windowsHeight: 'Высота (px)',
    windowsPosX: 'Позиция X',
    windowsPosY: 'Позиция Y',
    windowsBorders: 'Границы и скругление',
    windowsBorderWidth: 'Толщина границы (px)',
    windowsCornerRadius: 'Радиус скругления (px)',
    windowsSaveRule: 'Сохранить правило',
    windowsCancel: 'Отмена',
    windowsDeleteRule: 'Удалить',
    windowsQuickAdd: '+ Создать правило',
    windowsConfigured: 'Настроено',
    windowsNotConfigured: 'Без правила',
    windowsFocused: 'в фокусе',
    windowsWidgetBadge: 'виджет',
    windowsCopyCurrentGeometry: 'Взять геометрию окна',
    windowsActiveFilterPlaceholder: 'Поиск среди открытых окон...',
    windowsAllRulesCount: 'правил',

    // Input View
    inputKbdTitle: 'Клавиатура и раскладки',
    inputKbdDesc: 'XKB параметры в driftwm',
    inputLayoutsLabel: 'Раскладки:',
    inputSwitchKeyLabel: 'Смена языка:',
    inputMouseTitle: 'Мышь и трекпад',
    inputMouseDesc: 'Скорость и ускорение курсора',
    inputMouseSpeed: 'Скорость мыши:',
    inputTrackpadSpeed: 'Скорость трекпада:',
    inputTapToClick: 'Клик касанием по трекпаду',
    inputSnapTitle: 'Привязка окон',
    inputSnapDesc: 'Магнитное прилипание к краям',
    inputSameEdge: 'Привязка по одной границе',
    inputResetZoom: 'Сброс зума при новом окне',

    // Shortcuts View
    shortcutsAutostartTitle: 'Автозапуск',
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
    wifiEditorButton: 'All network connections',
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
    btBluemanManager: 'Advanced Manager',

    // Personalization View
    persWallpaper: 'Desktop Wallpapers',
    persFolder: 'Folder',
    persFile: 'File',
    persChooseFolderTitle: 'Choose wallpapers folder',
    persChooseFileTitle: 'Choose wallpaper file',
    persRefreshWallpapers: 'Refresh wallpaper list',
    persNoWallpapers: 'No wallpapers found in folder',
    persBordersAndCorners: 'Window Borders & Rounding',
    persBordersDesc: 'Window decorations and borders by compositor',
    persBorderWidth: 'Window border width:',
    persBorderFocused: 'Focused border color:',
    persBorderUnfocused: 'Unfocused border color:',
    persCornerRadius: 'Corner radius:',
    persVisualEffects: 'Blur & Animations',
    persBlurRadius: 'Background blur strength:',
    persAnimateBlur: 'Smooth window open animation',
    persScreenOutline: 'Monitor Screen Outline',
    persOutlineColor: 'Outline color:',
    persOutlineThickness: 'Thickness:',

    // Audio View
    audioTitle: 'Master Volume',
    audioMuted: 'Muted',
    audioPavucontrol: 'Advanced Mixer',

    // Windows View
    windowsTitle: 'Window Rules & Parameters',
    windowsDesc: 'Configure blur, opacity, decorations, and window behaviors in driftwm',
    windowsActiveApps: 'Open Applications',
    windowsNoActiveApps: 'No active applications',
    windowsAppFallback: 'Application',
    windowsBlurOn: 'Blur On',
    windowsBlurOff: 'Off',
    windowsOpacity: 'Opacity',
    windowsAddRule: '+ New Rule',
    windowsEditRule: 'Edit Window Rule',
    windowsConfiguredRules: 'Configured Rules',
    windowsSearchPlaceholder: 'Search rules by app_id or title...',
    windowsNoRules: 'No window rules configured',
    windowsNoMatchingRules: 'No matching rules found',
    windowsAppId: 'Application ID (app_id)',
    windowsAppIdPlaceholder: 'e.g. kitty, zen, drift-widgets',
    windowsTitleMatcher: 'Window Title',
    windowsTitleMatcherPlaceholder: 'e.g. Picture-in-Picture',
    windowsQuickPickApp: 'Quick pick from active:',
    windowsBlur: 'Background Blur',
    windowsCustomOpacity: 'Custom opacity',
    windowsDecoration: 'Window Decorations',
    windowsDecorDefault: 'Default',
    windowsDecorNone: 'None',
    windowsDecorMinimal: 'Minimal',
    windowsDecorClient: 'Client',
    windowsDecorServer: 'Server',
    windowsSticky: 'Sticky window',
    windowsStickyDesc: 'Keep window visible across all workspaces',
    windowsWidget: 'Widget mode',
    windowsWidgetDesc: 'Pin window to canvas as a desktop widget',
    windowsGeometry: 'Size & Position',
    windowsSizeEnabled: 'Fixed initial size',
    windowsPosEnabled: 'Fixed initial position',
    windowsWidth: 'Width (px)',
    windowsHeight: 'Height (px)',
    windowsPosX: 'Position X',
    windowsPosY: 'Position Y',
    windowsBorders: 'Border & Corner Radius',
    windowsBorderWidth: 'Border width (px)',
    windowsCornerRadius: 'Corner radius (px)',
    windowsSaveRule: 'Save Rule',
    windowsCancel: 'Cancel',
    windowsDeleteRule: 'Delete',
    windowsQuickAdd: '+ Create Rule',
    windowsConfigured: 'Configured',
    windowsNotConfigured: 'No rule',
    windowsFocused: 'focused',
    windowsWidgetBadge: 'widget',
    windowsCopyCurrentGeometry: 'Copy window geometry',
    windowsActiveFilterPlaceholder: 'Search open windows...',
    windowsAllRulesCount: 'rules',

    // Input View
    inputKbdTitle: 'Keyboard & Layouts',
    inputKbdDesc: 'XKB parameters in driftwm',
    inputLayoutsLabel: 'Layouts:',
    inputSwitchKeyLabel: 'Switch shortcut:',
    inputMouseTitle: 'Mouse & Trackpad',
    inputMouseDesc: 'Cursor speed and acceleration',
    inputMouseSpeed: 'Mouse speed:',
    inputTrackpadSpeed: 'Trackpad speed:',
    inputTapToClick: 'Tap to click',
    inputSnapTitle: 'Window Snapping',
    inputSnapDesc: 'Magnetic edge snapping',
    inputSameEdge: 'Snap on same edge',
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
