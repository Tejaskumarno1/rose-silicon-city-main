# 🌃 Silicon City: 3D Interactive Portfolio

An immersive, futuristic 3D portfolio experience built with **React**, **Three.js**, and **React Three Fiber**. Navigate through a neon-lit cyberpunk metropolis where your career milestones are represented by soaring architectural landmarks.

## 🚀 Experience Features

### 🎮 Silicon City Drone Combat (Tower Defense Mode)
A fully-featured combat minigame integrated directly into the 3D city environment.
- **Multi-Type AI Enemies**:
  - 🛰️ **Scouts**: Highly agile, aggressive rushers that hunt the player.
  - 🛸 **Cruisers**: Strategic units that split fire between the player and city towers.
  - 🏗️ **Motherships**: Heavy bombardment units that prioritize destroying city infrastructure.
- **Tower Defense Mechanics**: Protect 7 critical Info Towers (Education, Skills, Contacts, etc.) from enemy waves. Each tower has its own health system and 3D status indicators.
- **Power-Up System**: Drop-based bonuses including Health Repairs, Shield Overcharges, and Rapid Fire modules.
- **Global Combo System**: Rack up multipliers by chain-killing enemies to reach high scores.

### 🏛️ Interactive Architecture
- **Dynamic Camera Rig**: Camera path keyframes synchronized with your scroll progress, leading users through a curated tour of the city districts.
- **Info Landmarks**: Districts like **ServerStack**, **NeonObelisk**, and the **Lighthouse Beacon** serve as 3D containers for portfolio content.
- **Rich Aesthetics**: Custom-tuned post-processing, glassmorphism UI, and a consistent synthwave color palette.

## 🛠️ Tech Stack & Performance

- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **3D Engine**: [Three.js](https://threejs.org/) via [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- **UI & Animation**: Vanilla CSS with modern HSL palettes and Billboard-based 3D HUDs.
- **Optimization Layer**:
  - **Instanced Rendering**: Hundreds of bullets are rendered in a single draw call for 60FPS performance.
  - **Fast Array Compaction**: Custom garbage-reduction logic for smooth game loops.
  - **Audio Throttling**: Intelligent Web Audio oscillators to prevent node pile-up during intense combat.

## ⌨️ Controls

### Navigation Mode
- **Scroll**: Move the camera through the city story.
- **Mouse**: Subtle parallax viewing.

### Drone Combat Mode
- **Gamepad Button (Bottom Right)**: Enter/Exit Drone Mode.
- **`F` Key**: Engage/Start Combat.
- **`WASD`**: Flight movement.
- **`Space / Shift`**: Ascend / Descend.
- **`Left Click`**: Fire plasma cannons.
- **`ESC`**: Exit drone mode.

## 🔨 Getting Started

```bash
# Clone the repository
git clone https://github.com/Tejaskumarno1/rose-silicon-city-main.git

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## 📜 License
MIT © [Boddu Tejas Kumar](https://github.com/Tejaskumarno1)
