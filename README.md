# Player Application

This is a React + TypeScript application designed for advanced audio playback and providing an interactive user interface. It utilizes the Web Audio API to process and visualize audio data, displaying a dynamic waveform in real-time. The application allows users to control playback with play, pause, stop functions and supports audio navigation by dragging the cursor along the waveform.

![image](https://github.com/user-attachments/assets/4fd05908-a955-4dac-b563-181a8f6703ec)

## Project Structure

```
player/
├── node_modules/          # Node.js dependencies
├── public/               # Static files (e.g., index.html, favicon)
├── src/                  # Main source code
│   ├── components/       # Reusable components
│   │   └── Player/       # Player-related components
│   │       ├── Drawer.tsx           # Drawer component
│   │       ├── interface.d.ts       # TypeScript interfaces
│   │       ├── Player.module.css    # Player-specific styles
│   │       ├── Player.tsx           # Main Player component
│   │       └── SoundDriver.tsx      # Sound handling logic
│   ├── pages/            # Page components
│   │   └── HomePage.tsx  # Main landing page
│   ├── types/            # TypeScript type definitions
│   │   ├── d3.d.ts       # d3 library types
│   │   └── declarations.d.ts # Global declarations
│   ├── App.css           # Global styles
│   ├── App.tsx           # Root component
│   ├── index.css         # Base CSS styles
│   └── index.tsx         # Entry point
├── .gitignore            # Git ignored files
├── package-lock.json     # Locked dependencies
├── package.json          # Project metadata and scripts
├── README.md             # Project documentation
└── tsconfig.json         # TypeScript configuration
```

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the application:**

   ```bash
   npm run start
   ```

4. **Build for production:**

   ```bash
   npm run build
   ```

## Technologies Used

- React
- TypeScript
- CSS Modules
- D3.js (with type declarations)
- Web Audio API (AudioContext)

## Project Features

- **Audio Playback and Control:**
  - Uses the Web Audio API (`AudioContext`) to handle audio streams.
  - Supports play, pause, and volume adjustments.
  - Enables audio seeking via a draggable progress bar.

- **Component-Based Structure:**
  - Modularized architecture for better code maintainability.

- **Type-Safe Development:**
  - Uses TypeScript for improved code reliability and type checking.

- **Responsive Design:**
  - Styled using CSS Modules to ensure scoped and maintainable styles.

## Component Overview

- **Drawer.tsx:**
  - A sliding panel for additional controls and settings.

- **Player.tsx:**
  - Main component for handling audio playback.
  - Manages the `AudioContext` and handles user interactions (play/pause, volume).

- **SoundDriver.tsx:**
  - Encapsulates logic for interfacing with the Web Audio API.
  - Initializes and manages the `AudioContext`, handling audio loading and playback.

- **HomePage.tsx:**
  - Landing page that renders the `Player` component.

## Contribution

Contributions are welcome! Feel free to open issues or submit pull requests.

