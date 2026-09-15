# driftsettings

<p align="center">
  <b>Современный и минималистичный центр управления и настроек для тайлингового Wayland-композитора <a href="https://github.com/malbiruk/driftwm">driftwm</a> на CachyOS / Arch Linux.</b>
</p>

---

## 🌟 Возможности (Features)

- **📶 Менеджер Wi-Fi:**
  - Сканирование эфира в реальном времени (`nmcli`).
  - Отображение уровня сигнала, защиты и сохраненных сетей.
  - Форма быстрого подключения с вводом пароля.
- **🎧 Менеджер Bluetooth:**
  - Автоматическое сканирование эфира (`bluetoothctl scan on`).
  - Отображение подключенных устройств с уровнем заряда аккумулятора.
  - Разделение на **Сохраненные устройства** и **Доступные рядом**.
  - Подключение, отключение, создание пары (`pair + trust`) и удаление устройств в один клик.
- **🎨 Персонализация и оформление:**
  - Управление обоями рабочего стола (выбор папки, выбор файла, реальные превью картинок, поддержка GLSL-шейдеров).
  - **Обводка и рамки окон (`decorations`):** толщина рамки (`border_width`), цвет активного окна (`border_color_focused`), цвет неактивного окна (`border_color`), скругление углов (`corner_radius`).
  - **Обводка экрана (`output.outline`):** толщина и цвет внешней рамки мониторов.
  - **Размытие и эффекты (`effects`):** радиус размытия (`blur_radius`), плавная анимация окон (`animate_blur`).
- **🔊 Управление звуком:**
  - PipeWire / WirePlumber (`wpctl`): регулировка громкости колесом/слайдером, быстрое выключение звука (Mute).
  - Интеграция с `pavucontrol`.
- **🪟 Правила окон и блюр (`[[window_rules]]`):**
  - Интерактивный редактор правил окон driftwm: прозрачность (`opacity`), размытие (`blur`), тип декораций (`minimal`, `server`, `none`), режим виджета.
- **⌨️ Ввод и клавиатура:**
  - Настройка раскладки XKB (`us,ru`), переключателей (`grp:caps_toggle`), задержки и скорости повтора клавиш.
  - Параметры мыши и тачпада (акселерация, профили, естественная прокрутка).
- **🚀 Автозапуск и комбинации клавиш:**
  - Редактирование списка `autostart` и горячих клавиш `[keybindings]`.
- **⚡ Автоприменение и безопасность:**
  - Мгновенное сохранение с валидацией (`driftwm --check-config`) и автоматическим созданием бэкапов конфигурации (`config.toml.bak_*`).
  - Поддержка одиночного экземпляра (Single Instance Lock) с переключением вкладок по аргументам CLI (`--tab=wifi`, `--tab=bluetooth` и др.).

---

## 🛠 Стек технологий (Tech Stack)

- **Платформа:** Node.js + Electron 33 (Native Wayland: `--ozone-platform-hint=auto --enable-features=WaylandWindowDecorations`)
- **Язык:** TypeScript + Strict Mode
- **Интерфейс:** React 18 + Tailwind CSS
- **Тема оформления:** Палитра `Matugen-Slate` (`#131315`, `#1c1b1f`, `#2a282d`, `#e5e2e3`, `#859aea`)
- **Парсер конфигурации:** `smol-toml` (безопасное сохранение и слияние секций TOML)
- **Иконки:** `lucide-react`

---

## 🚀 Установка и сборка (Installation & Build)

### 1. Системные зависимости (CachyOS / Arch Linux)

```bash
paru -S nodejs pnpm electron bluez bluez-utils networkmanager wireplumber
```

### 2. Клонирование и установка зависимостей

```bash
git clone https://github.com/username/driftsettings.git
cd driftsettings
pnpm install
```

### 3. Сборка проекта

```bash
pnpm run build
```

### 4. Запуск приложения

```bash
pnpm start
# Или прямой запуск с Wayland-флагами:
electron . --ozone-platform-hint=auto --enable-features=WaylandWindowDecorations
```

---

## ⌨️ Интеграция с driftwm

Добавьте в ваш `~/.config/driftwm/config.toml`:

```toml
[keybindings]
"mod+i" = "exec driftsettings"
"mod+comma" = "exec driftsettings"

[[window_rules]]
app_id = "driftsettings"
blur = false
opacity = 1
decoration = "none"
```

### Вызов конкретных вкладок:

```bash
driftsettings --tab=wifi
driftsettings --tab=bluetooth
driftsettings --tab=personalization
driftsettings --tab=audio
driftsettings --tab=windows
driftsettings --tab=input
driftsettings --tab=shortcuts
driftsettings --tab=system
```

---

## 📄 Лицензия

MIT License. Разработано для экосистемы **driftwm** и CachyOS.
