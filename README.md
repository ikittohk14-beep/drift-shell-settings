# drift-shell-settings

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.1.0-859aea?style=for-the-badge" alt="Version 1.1.0" />
  <img src="https://img.shields.io/badge/Platform-CachyOS%20%7C%20Arch%20Linux-00a4dc?style=for-the-badge&logo=arch-linux" alt="Arch Linux / CachyOS" />
  <img src="https://img.shields.io/badge/Wayland-Native-5277C3?style=for-the-badge&logo=wayland" alt="Wayland Native" />
  <img src="https://img.shields.io/badge/Compositor-driftwm-e5e2e3?style=for-the-badge" alt="driftwm" />
  <img src="https://img.shields.io/badge/License-MIT-a3d4a0?style=for-the-badge" alt="MIT License" />
</p>

<p align="center">
  <b>Drift Shell Settings — современный, минималистичный центр управления и настроек системы для тайлингового Wayland-композитора <a href="https://github.com/malbiruk/driftwm">driftwm</a>.</b><br/>
  <i>A sleek, modern settings & control center suite tailored specifically for the driftwm infinite canvas compositor on CachyOS / Arch Linux.</i>
</p>

---

## 🆕 Что нового в v1.1.0 (What's New)

- 🎛️ **DotMeter UI:** фирменный минималистичный индикатор параметров и громкости в стиле точечной терминальной эстетики.
- 🖼️ **Галерея обоев:** быстрый генератор превью в 1/4 разрешения с карточным контейнером и плавной сеткой выбора.
- 🪟 **Аккордеон правил окон (Window Rules):** компактное сворачивание правил, поддержка параметров `blur_radius`, `blur_strength`, детальная прозрачность и привязка к холсту driftwm.
- 🌐 **Чистая русская локализация:** аккуратный лаконичный перевод интерфейса без визуального шума.
- 🔊 **Улучшенная интеграция звука и сети:** мгновенный отклик ползунков WirePlumber и NetworkManager.

---

## 🌟 Ключевые возможности (Features)

### 📶 1. Wi-Fi Менеджер (NetworkManager)
- **Сканирование сетей:** фоновое обнаружение доступных беспроводных сетей через `nmcli`.
- **Индикация уровня сигнала:** наглядное отображение уровня приёма и типа шифрования (WPA2/WPA3).
- **Быстрое подключение:** модальное окно для безопасного ввода пароля к защищенным точкам доступа.
- **Статус соединения:** мгновенный мониторинг текущего активного SSID и состояния радиомодуля.

### 🎧 2. Bluetooth Менеджер (BlueZ / bluetoothctl)
- **Активное сканирование эфира:** кнопка «Сканировать эфир» для поиска новых устройств поблизости (`bluetoothctl scan on`).
- **Разделение устройств:**
  - **Сохраненные устройства:** список сопряженных девайсов с индикацией статуса подключения, заряда аккумулятора (%) и кнопками отключения/удаления.
  - **Доступные рядом:** список обнаруженных устройств с функцией сопряжения в один клик (`pair` + `trust` + `connect`).
- **Иконки устройств:** автоматическое определение типов (наушники, клавиатуры, мыши, смартфоны, ПК).
- **Интеграция:** быстрый переход в `blueman-manager` при необходимости расширенной настройки.

### 🎨 3. Персонализация и оформление (Matugen-Slate Theme)
- **Обои рабочего стола:**
  - Поддержка изображений (`.png`, `.jpg`, `.jpeg`, `.webp`) и процедурных GLSL-шейдеров (`.glsl`).
  - Быстрый выбор папки с обоями и отдельных файлов через системные диалоги.
  - Реальные предпросмотры картинок с аппаратным ускорением.
- **Обводка и рамки окон (`[decorations]`):**
  - Толщина обводки (`border_width`) от 0 до 10 px.
  - Выбор цвета сфокусированного окна (`border_color_focused`) и неактивных окон (`border_color`).
  - Радиус скругления углов (`corner_radius`) от 0 до 32 px.
- **Рамка мониторов (`[output.outline]`):**
  - Настройка цвета и толщины рамки области экранов для удобной навигации по бесконечному холсту driftwm.
- **Эффекты размытия (`[effects]`):**
  - Глобальный радиус размытия фона (`blur_radius`) и переключатель плавной анимации (`animate_blur`).

### 🔊 4. Управление звуком (PipeWire / WirePlumber)
- **Точная регулировка громкости:** слайдер с шагом в 1% и поддержка колеса мыши.
- **Mute-переключатель:** мгновенное выключение/включение звука через `wpctl`.
- **Интеграция с микшером:** кнопка быстрого запуска `pavucontrol`.

### 🪟 5. Правила окон и эффекты (`[[window_rules]]`)
- **Интерактивный редактор правил:**
  - Настройка прозрачности (`opacity`) и размытия (`blur`) для отдельных приложений (`app_id` / `title`).
  - Выбор типа декораций (`minimal`, `server`, `none`, `client`).
  - Переключение режима виджета (`widget = true`) для фоновых панелей.

### ⌨️ 6. Ввод и раскладка клавиатуры
- **Параметры XKB:** настройка списка раскладок (например, `us,ru`), комбинаций переключения (`grp:caps_toggle`, `grp:win_space_toggle`).
- **Задержка и повтор:** настройка `repeat_delay` и `repeat_rate`.
- **Мышь и тачпад:** акселерация (`accel_speed`), профили (`flat`/`adaptive`), `natural_scroll` и `tap_to_click`.

### 🚀 7. Автозапуск и горячие клавиши
- **`autostart`:** удобный список запускаемых демонов и скриптов при старте сессии driftwm.
- **`keybindings`:** визуализация и редактирование комбинаций клавиш для запуска приложений и действий оконного менеджера.

### ⚡ 8. Автоприменение и отказоустойчивость
- **Debounced Auto-Save:** настройки сохраняются автоматически с задержкой в 300 мс.
- **Валидация:** перед перезагрузкой конфиг проверяется встроенной утилитой `driftwm --check-config`.
- **Резервные копии:** автоматическое создание резервных копий `config.toml.bak_*` перед каждой записью.
- **Мгновенный reload:** обновление интерфейса driftwm в реальном времени через inotify.

---

## 🛠 Стек технологий (Tech Stack)

| Компонент | Технология | Описание |
| :--- | :--- | :--- |
| **Оболочка** | Electron 33 | Нативный Wayland (`--ozone-platform-hint=auto`) |
| **Язык** | TypeScript 5.6 | Строгая типизация и безопасность типов |
| **Фронтенд** | React 18 | Компонентная архитектура и быстрый рендеринг |
| **Стилизация** | Tailwind CSS 3.4 | Дизайн-система Matugen-Slate (`#131315`, `#1c1b1f`, `#859aea`) |
| **TOML Парсер** | `smol-toml` | Корректное слияние и сериализация секций конфигурации |
| **Иконки** | `lucide-react` | Чистый векторный набор иконок |

---

## 🚀 Установка и сборка (Installation & Build)

### 1. Системные зависимости (CachyOS / Arch Linux)

```bash
paru -S nodejs pnpm electron bluez bluez-utils networkmanager wireplumber
```

### 2. Клонирование репозитория

```bash
git clone https://github.com/ikittohk14-beep/drift-shell-settings.git
cd drift-shell-settings
pnpm install
```

### 3. Сборка проекта

```bash
pnpm run build
```

### 4. Создание системного бинарника и ярлыка

```bash
# Исполняемый файл в ~/.local/bin
cat << 'EOF' > ~/.local/bin/drift-shell-settings
#!/usr/bin/env bash
exec electron /path/to/drift-shell-settings --ozone-platform-hint=auto --enable-features=WaylandWindowDecorations "$@"
EOF
chmod +x ~/.local/bin/drift-shell-settings
```

---

## 📄 Лицензия (License)

Распространяется под лицензией [MIT](LICENSE). Разработано для комфортной работы в экосистеме **driftwm**.
