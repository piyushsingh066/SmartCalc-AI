# SmartCalc AI – Premium Multi-Mode AI Calculator

SmartCalc AI is a modern, premium, feature-rich, and visually stunning calculator web application built with **React.js + Vite**. The application is entirely data-driven, utilizing a local **IndexedDB database** (via **Dexie.js**) to manage settings, unit conversions, currency rates, calculation history, favorites, and custom function definitions instead of hardcoding them in the client source.

Designed with a premium glassmorphic UI, smooth transitions, and slow-drifting glowing background particles, it functions as a comprehensive productivity suite.

---

## ✨ Features

### 1. Standard Calculator
- Addition, subtraction, multiplication, division, percentage, decimals, brackets, sign toggles.
- Safe custom parser (no `eval()` calls) with invalid expression flags.

### 2. Scientific Calculator
- Square/Cube powers, $x^y$, square/cube roots, factorials, logs, natural logs ($\ln$), trigonometric & hyperbolic functions, $\pi$, $e$, modulus, and absolute values.

### 3. Programmer Calculator
- Decimal (DEC), Binary (BIN), Octal (OCT), and Hexadecimal (HEX) inputs.
- Concurrently displays base outputs.
- Supports bitwise operations: `AND`, `OR`, `XOR`, `NOT`, Left Shift (`<<`), and Right Shift (`>>`).

### 4. Unit Converter
- Dynamic conversion coefficients loaded from the IndexedDB database.
- Categories: Length, Weight, Temperature, Area, Volume, Time, Speed, Pressure, Energy, and Data Storage.

### 5. Live Currency Converter
- Fetches real-time exchange rates via the free `open.er-api.com` API and updates the local IndexedDB database.
- Interactive flag indicators, search filtering, and currency swaps.

### 6. Canvas Graph Plotter
- Render multiple math curves (e.g. `sin(x) * 2`, `x^2 - 4`) on a coordinate grid.
- Move axes by mouse-dragging and zoom in/out with the mouse wheel.
- Hover crosshairs trace active $(x, y)$ coordinates.

### 7. OCR Scanner Calculator
- Upload images of printed or handwritten equations to extract math text and solve them instantly via Tesseract.js.

### 8. Voice Calculator
- Convert speaking commands (e.g. *"25 plus 45"*, *"square root of 169"*) to math and calculate using the Web Speech API.

### 9. AI Explain Mode
- Instantly breaks down equations step-by-step with local explanations.
- Features optional Gemini API integration to get a complete mathematical teaching guide if an API key is supplied.

### 10. IndexedDB Database Explorer
- Visual console to inspect raw database rows.
- Modify currency rates, themes, or conversion factors manually to see changes instantly.

---

## 🛠️ Technology Stack

- **Core Framework**: React 19 + Vite 8 (JavaScript)
- **Styling**: Vanilla CSS (Custom Glassmorphism, Neumorphism, Keyframe Animations)
- **Database**: IndexedDB via Dexie.js & Dexie React Hooks
- **Icons**: Lucide React
- **OCR Engine**: Tesseract.js
- **Audio Synthesizer**: Native Web Audio API
- **Speech Recognition**: Web Speech API

---

## 📂 Folder Structure

```text
src/
├── components/          # Reusable UI Page Modules
│   ├── AIExplainer.jsx
│   ├── Calculator.jsx
│   ├── DatabaseViewer.jsx
│   ├── CurrencyConverter.jsx
│   ├── FavoritesList.jsx
│   ├── GraphPlotter.jsx
│   ├── Header.jsx
│   ├── HistoryList.jsx
│   ├── OCRScanner.jsx
│   ├── ProgrammerCalculator.jsx
│   ├── SettingsPanel.jsx
│   ├── Sidebar.jsx
│   └── VoiceAssistant.jsx
├── context/
│   ├── db.js            # Dexie IndexedDB schemas and seed defaults
│   └── ThemeContext.jsx # Theme classes & sound fx synthesizer context
├── styles/
├── utils/
│   └── mathParser.js    # Custom Math Parser & step solver
├── App.jsx              # Coordinator and layout manager
├── index.css            # Stylesheet, CSS variables, and animations
└── main.jsx
```

---

## 🚀 Installation & Local Execution

### Prerequisites
- Node.js (v18+)
- npm

### Steps
1. Clone this repository to your local workspace.
2. Navigate to the project root folder.
3. Install package dependencies:
   ```bash
   npm install
   ```
4. Run the local development server:
   ```bash
   npm run dev
   ```
5. Open your browser and go to: `http://localhost:5173/`

---

## 🖥️ Production Build & Deployment

To build the optimized static asset bundles for deployment (e.g. GitHub Pages):
```bash
npm run build
```

This compiles all files into the `dist/` directory, ready to be served statically.

---

## 🔮 Future Improvements
- **Extended Function Graphing**: Support intersection calculations and slope gradients on canvas.
- **Offline PWA support**: Cache assets and Tesseract language files locally for completely offline operations.
- **Scientific Constant Presets**: Expand database configurations to store common physical constants (gravity, speed of light, Planck's constant).

---

## 📄 License
This project is open-source and licensed under the MIT License.

## ✍️ Author
SmartCalc AI Developer
