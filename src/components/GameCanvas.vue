<template>
  <div class="game-wrapper">
    <div class="stats">
      <h2>Score: {{ game ? game.score : 0 }}</h2>
    </div>
    <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
    <div class="controls-hint">
      Utilisez les flèches directionnelles pour jouer
    </div>
  </div>
</template>

<script>
import {Game} from "../core/Game";

export default {
  name: "GameCanvas",
  data() {
    const TILE_SIZE = 32;
    const levelLayout = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 3, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 3, 1],
      [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1],
      [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
      [1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 1],
      [0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0],
      [1, 1, 1, 1, 2, 1, 0, 1, 1, 0, 1, 1, 0, 1, 2, 1, 1, 1, 1],
      [0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0],
      [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1],
      [0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0],
      [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
      [1, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1],
      [1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1],
      [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1],
      [1, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    return {
      game: null,
      level: levelLayout,
      canvasWidth: levelLayout[0].length * TILE_SIZE,
      canvasHeight: levelLayout.length * TILE_SIZE,
    };
  },
  mounted() {
    this.game = new Game(this.$refs.canvas, this.level);

    window.addEventListener("keydown", this.handleInput);

    this.loop();
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleInput);
  },
  methods: {
    handleInput(e) {
      const keys = {
        ArrowUp: {x: 0, y: -1},
        ArrowDown: {x: 0, y: 1},
        ArrowLeft: {x: -1, y: 0},
        ArrowRight: {x: 1, y: 0},
      };

      if (keys[e.key]) {
        e.preventDefault();
        this.game.pacman.nextDir = keys[e.key];
      }
    },
    loop() {
      if (this.game) {
        this.game.update();
        this.game.render();
      }
      requestAnimationFrame(this.loop);
    },
  },
};
</script>

<style scoped>
.game-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #111;
  min-height: 100vh;
}

.stats h2 {
  color: #ffff00;
  font-family: "Press Start 2P", cursive, Arial; /* Style arcade si tu as la font */
  margin-bottom: 15px;
  text-transform: uppercase;
}

canvas {
  border: 5px solid #222;
  box-shadow: 0 0 20px rgba(0, 0, 255, 0.2);
  background: black;
}

.controls-hint {
  margin-top: 15px;
  color: #555;
  font-size: 0.9em;
}
</style>
