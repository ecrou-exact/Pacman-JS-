# Pac-Man Vue.js Project

<p align="center">
  <img src="/src/images/logo.png" width="300" alt="logo">
</p>

This project is a modern implementation of the classic Pac-Man arcade
game built using Vue.js and HTML5 Canvas. It features an intelligent
pathfinding system for ghosts, smooth grid-based movement, and reactive
game states.

## Features

- **Grid-Based Movement**: Precise player and ghost navigation within
  a tiled labyrinth.
- **Intelligent Ghost AI**: Ghosts use the A\* (A-Star) search
  algorithm to track Pac-Man or return to their spawn point.
- **Vulnerability States**: Power Pellets turn ghosts blue and
  vulnerable, allowing Pac-Man to eat them for extra points.
- **Custom Animations**: Includes particle explosion effects when
  ghosts are defeated and specialized respawn timers.
- **Responsive Canvas**: High-performance rendering using the HTML5
  Canvas API integrated within Vue components.

## Prerequisites

Before starting, ensure you have the following installed on your system:

- Node.js (LTS version recommended)
- npm (Node Package Manager)

## Setup and Launch Procedure

Follow these steps to get the project running on your local machine:

1. **Download the Project**\
   Clone this repository or download the source code and navigate to
   the project directory:

```bash
cd pacman-vuejs
```

2. **Initialize the Project**\
   Install the necessary dependencies. If this is your first time
   running the project, execute:

```bash
npm install
```

_Note: Ensure you have a valid `package.json` file in your directory
before running this command._

3. **Launch the Development Server**\
   Start the local server to play the game:

```bash
npm run serve
```

_Note: Use `npm run dev` if the project is configured with Vite._

4. **Open the Browser**\
   Once the terminal displays the local URL (usually
   `http://localhost:8080` or `http://localhost:5173`), copy and paste
   it into your web browser to start the game.

## Project Structure

- `src/components/`: Contains the **GameCanvas** Vue component.
- `src/core/`: Contains the logic for the game engine, including
  `Entity.js`, `Ghost.js`, and `Collision.js`.
- `src/assets/`: Static assets and global styles.
