<template>
  <div id="app">
    <!-- MENU PRINCIPAL -->
    <div v-if="screen === 'menu'" class="screen menu-screen">
      <div class="logo">
        <span class="pac">PAC</span><span class="man">-MAN</span>
      </div>
      <div class="menu-ghost-row">
        <span v-for="(c, i) in ['👻','👻','👻','👻']" :key="i" class="menu-ghost" :style="{color: ['#ff0000','#ffb8ff','#00ffff','#ffb852'][i], animationDelay: i*0.15+'s'}">{{c}}</span>
      </div>
      <div class="menu-buttons">
        <button class="btn-main" @click="startGame">▶ JOUER</button>
        <button class="btn-secondary" @click="screen = 'settings'">⚙️ PARAMÈTRES</button>
      </div>
      <div class="menu-footer">Flèches directionnelles · P = Pause</div>
    </div>

    <!-- PARAMÈTRES -->
    <div v-if="screen === 'settings'" class="screen settings-screen">
      <h2 class="settings-title">⚙️ PARAMÈTRES</h2>

      <div class="setting-group">
        <label class="setting-label">🔊 Son</label>
        <div class="toggle-row">
          <button :class="['toggle-btn', settings.soundEnabled ? 'active' : '']" @click="settings.soundEnabled = !settings.soundEnabled">
            {{ settings.soundEnabled ? '🔊 Activé' : '🔇 Désactivé' }}
          </button>
        </div>
      </div>

      <div class="setting-group" v-if="settings.soundEnabled">
        <label class="setting-label">🎚️ Volume : {{ settings.volume }}%</label>
        <input type="range" min="0" max="100" v-model="settings.volume" class="slider" />
      </div>

      <div class="setting-group">
        <label class="setting-label">👻 Couleurs des fantômes</label>
        <div class="color-grid">
          <div v-for="(ghost, i) in ghostNames" :key="i" class="color-row">
            <span class="ghost-name" :style="{color: settings.ghostColors[i]}">{{ ghost }}</span>
            <div class="color-options">
              <button
                v-for="color in colorOptions"
                :key="color"
                :style="{ background: color, border: settings.ghostColors[i] === color ? '3px solid white' : '2px solid #444' }"
                class="color-dot"
                @click="settings.ghostColors[i] = color"
              ></button>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-buttons">
        <button class="btn-main" @click="screen = 'menu'">✅ Sauvegarder</button>
      </div>
    </div>

    <!-- JEU -->
    <div v-if="screen === 'game'" class="screen game-screen">
      <div class="hud">
        <div class="hud-left">
          <span class="hud-label">SCORE</span>
          <span class="hud-value score-val">{{ score }}</span>
        </div>
        <div class="hud-center">
          <span v-for="l in 3" :key="l" class="life-icon">{{ l <= lives ? '😊' : '💀' }}</span>
        </div>
        <div class="hud-right">
          <button class="pause-btn" @click="togglePause">{{ paused ? '▶' : '⏸' }}</button>
        </div>
      </div>
      <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
    </div>

    <!-- GAME OVER -->
    <div v-if="screen === 'gameover'" class="screen overlay-screen">
      <div class="overlay-box gameover-box">
        <div class="overlay-title gameover-title">💀 GAME OVER</div>
        <div class="overlay-score">Score final : <strong>{{ score }}</strong></div>
        <button class="btn-main" @click="startGame">🔄 Rejouer</button>
        <button class="btn-secondary" @click="screen = 'menu'">🏠 Menu</button>
      </div>
    </div>

    <!-- VICTOIRE -->
    <div v-if="screen === 'win'" class="screen overlay-screen">
      <div class="overlay-box win-box">
        <div class="overlay-title win-title">🏆 VICTOIRE !</div>
        <div class="overlay-score">Score final : <strong>{{ score }}</strong></div>
        <button class="btn-main" @click="startGame">🔄 Rejouer</button>
        <button class="btn-secondary" @click="screen = 'menu'">🏠 Menu</button>
      </div>
    </div>
  </div>
</template>

<script>
import { Game } from './core/Game';

export default {
  name: 'App',
  data() {
    return {
      screen: 'menu',
      score: 0,
      lives: 3,
      paused: false,
      game: null,
      animId: null,
      canvasWidth: 19 * 32,
      canvasHeight: 21 * 32,
      settings: {
        soundEnabled: true,
        volume: 70,
        ghostColors: ['red', 'pink', 'cyan', 'orange'],
      },
      ghostNames: ['Fantôme 1', 'Fantôme 2', 'Fantôme 3', 'Fantôme 4'],
      colorOptions: ['red', 'pink', 'cyan', 'orange', '#9b59b6', '#2ecc71', '#e67e22', '#e91e63', 'white'],
    };
  },
  mounted() {
    window.addEventListener('keydown', this.handleKey);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKey);
    if (this.animId) cancelAnimationFrame(this.animId);
  },
  methods: {
    startGame() {
      this.screen = 'game';
      this.score = 0;
      this.lives = 3;
      this.paused = false;
      this.$nextTick(() => {
        this.game = new Game(this.$refs.canvas, { ...this.settings });
        this.loop();
      });
    },
    togglePause() {
      if (this.game) {
        this.game.togglePause();
        this.paused = this.game.paused;
      }
    },
    handleKey(e) {
      if (this.screen !== 'game' || !this.game) return;

      const dirs = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      };

      if (dirs[e.key]) {
        e.preventDefault();
        this.game.pacman.nextDir = dirs[e.key];
      }

      if (e.key === 'p' || e.key === 'P') {
        this.togglePause();
      }
    },
    loop() {
      if (this.screen !== 'game' || !this.game) return;

      this.game.update();
      this.game.render();

      this.score = this.game.score;
      this.lives = this.game.lives;
      this.paused = this.game.paused;

      if (this.game.gameOver) {
        this.screen = 'gameover';
        return;
      }
      if (this.game.won) {
        this.screen = 'win';
        return;
      }

      this.animId = requestAnimationFrame(this.loop);
    },
  },
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: #0a0a0a;
  color: white;
  font-family: 'Press Start 2P', monospace;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

#app {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
}

/* ---- SCREENS ---- */
.screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  min-height: 100vh;
  width: 100%;
}

/* ---- MENU ---- */
.menu-screen {
  background: radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0a 100%);
}

.logo {
  font-size: 3rem;
  letter-spacing: 4px;
  margin-bottom: 8px;
  text-shadow: 0 0 20px #ffe700;
}
.pac { color: #ffe700; }
.man { color: #ff6b6b; }

.menu-ghost-row { display: flex; gap: 16px; font-size: 2rem; }
.menu-ghost {
  display: inline-block;
  animation: bounce 0.6s infinite alternate;
  filter: drop-shadow(0 0 6px currentColor);
}
@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-12px); } }

.menu-buttons { display: flex; flex-direction: column; gap: 16px; align-items: center; }

.btn-main {
  background: #ffe700;
  color: #111;
  border: none;
  padding: 14px 40px;
  font-family: 'Press Start 2P', monospace;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
  box-shadow: 0 4px 0 #a09000;
  min-width: 240px;
}
.btn-main:hover { transform: translateY(-2px); box-shadow: 0 6px 0 #a09000; }
.btn-main:active { transform: translateY(2px); box-shadow: none; }

.btn-secondary {
  background: transparent;
  color: #aaa;
  border: 2px solid #444;
  padding: 12px 32px;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.75rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
  min-width: 240px;
}
.btn-secondary:hover { border-color: #ffe700; color: #ffe700; }

.menu-footer { color: #444; font-size: 0.6rem; margin-top: 8px; }

/* ---- SETTINGS ---- */
.settings-screen {
  background: #111;
  gap: 20px;
  padding: 40px;
  max-width: 540px;
  margin: 0 auto;
}
.settings-title { color: #ffe700; font-size: 1.2rem; margin-bottom: 8px; }

.setting-group { width: 100%; display: flex; flex-direction: column; gap: 10px; }
.setting-label { color: #ccc; font-size: 0.7rem; }

.toggle-row { display: flex; }
.toggle-btn {
  padding: 10px 24px;
  background: #222;
  border: 2px solid #444;
  color: #aaa;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.7rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
}
.toggle-btn.active { border-color: #ffe700; color: #ffe700; background: #1a1a00; }

.slider { width: 100%; accent-color: #ffe700; }

.color-grid { display: flex; flex-direction: column; gap: 12px; width: 100%; }
.color-row { display: flex; align-items: center; gap: 14px; }
.ghost-name { font-size: 0.6rem; min-width: 90px; }
.color-options { display: flex; gap: 8px; flex-wrap: wrap; }
.color-dot {
  width: 26px; height: 26px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.1s;
}
.color-dot:hover { transform: scale(1.2); }

.settings-buttons { margin-top: 16px; }

/* ---- HUD ---- */
.game-screen { gap: 0; padding: 16px; }

.hud {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 608px;
  padding: 8px 16px;
  background: #111;
  border-bottom: 2px solid #222;
  margin-bottom: 8px;
}
.hud-label { color: #666; font-size: 0.55rem; display: block; }
.hud-value { font-size: 1rem; }
.score-val { color: #ffe700; }
.life-icon { font-size: 1.3rem; margin: 0 2px; }
.pause-btn {
  background: none;
  border: 2px solid #444;
  color: #ffe700;
  font-size: 1rem;
  width: 36px; height: 36px;
  cursor: pointer;
  border-radius: 4px;
  font-family: monospace;
  transition: border-color 0.15s;
}
.pause-btn:hover { border-color: #ffe700; }

canvas {
  border: 3px solid #222;
  box-shadow: 0 0 30px rgba(0, 100, 255, 0.2);
  background: black;
  display: block;
}

/* ---- OVERLAY ---- */
.overlay-screen {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.overlay-box {
  display: flex; flex-direction: column; align-items: center;
  gap: 20px; padding: 48px 64px;
  border-radius: 8px;
  border: 3px solid #333;
}
.gameover-box { background: #1a0000; border-color: #660000; }
.win-box { background: #001a00; border-color: #006600; }
.overlay-title { font-size: 1.6rem; }
.gameover-title { color: #ff4444; text-shadow: 0 0 20px #ff0000; }
.win-title { color: #44ff44; text-shadow: 0 0 20px #00ff00; }
.overlay-score { color: #ccc; font-size: 0.75rem; }
.overlay-score strong { color: #ffe700; }
</style>
