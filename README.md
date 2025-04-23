# Solar System Visualization

An interactive 3D visualization of our solar system built with Three.js and Vite. This project provides an educational and engaging way to explore the planets, their moons, and basic astronomical information.

## Features

- 3D visualization of all planets in the solar system (including Pluto)
- Interactive planet selection and camera focusing
- Detailed information panel for each celestial body
- Realistic orbital movements
- Satellite/moon visualization for planets
- Smooth camera transitions
- Responsive design
- Planet labels and orbit paths

## Technical Stack

- Three.js for 3D rendering
- Vite as the build tool and development server
- Pure JavaScript for application logic
- CSS for styling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/KrishnaPrasadMaddula/solar-system.git
```

2. Navigate to the project directory:
```bash
cd solar-system
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and visit `http://localhost:5173` (or the port shown in your terminal)

## Usage

- **View the Solar System**: When you first load the application, you'll see a complete view of the solar system with all planets orbiting the sun.
- **Select a Planet**: Click on any planet to focus on it and view detailed information.
- **Return to Overview**: Use the back button to return to the full solar system view.
- **Zoom and Rotate**: Use your mouse wheel to zoom in/out and click and drag to rotate the view.

## Planet Information

Each planet displays the following information when selected:
- Type of celestial body
- Diameter
- Distance from the Sun
- Orbital period
- Surface temperature
- Description
- List of major moons (if any)

## Development

The project uses Vite for fast development and building. Key commands:

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Planet data sourced from NASA
- Three.js for 3D rendering capabilities
- Vite for the excellent development experience 