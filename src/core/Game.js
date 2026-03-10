import { Pacman } from './Pacman';
import { Map } from './Map';
import { Ghost } from './Ghost';

const LEVEL_LAYOUT = [
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

export class Game {
    constructor(canvas, settings = {}) {
        this.ctx = canvas.getContext('2d');
        this.tileSize = 32;
        this.settings = settings;

        this.lives = 3;
        this.score = 0;
        this.paused = false;
        this.gameOver = false;
        this.won = false;

        this._initLevel();
    }

    _initLevel() {
        const blueprint = JSON.parse(JSON.stringify(LEVEL_LAYOUT));
        this.map = new Map(blueprint, this.tileSize);

        this.totalPellets = 0;
        blueprint.forEach(row => row.forEach(t => { if (t === 2 || t === 3) this.totalPellets++; }));

        this.pacman = new Pacman(9, 15, this.tileSize, 2);

        const ghostColors = this.settings.ghostColors || ['red', 'pink', 'cyan', 'orange'];
        this.ghosts = [
            new Ghost(9, 9, this.tileSize, 2, ghostColors[0] || 'red'),
            new Ghost(8, 9, this.tileSize, 2, ghostColors[1] || 'pink'),
            new Ghost(10, 9, this.tileSize, 2, ghostColors[2] || 'cyan'),
            new Ghost(9, 8, this.tileSize, 2, ghostColors[3] || 'orange'),
        ];
    }

    _loseLife() {
        this.lives--;
        if (this.lives <= 0) {
            this.gameOver = true;
        } else {
            this.pacman.x = 9 * this.tileSize;
            this.pacman.y = 15 * this.tileSize;
            this.pacman.dir = { x: 0, y: 0 };
            this.pacman.nextDir = { x: 0, y: 0 };
            this.ghosts.forEach(g => {
                g.x = g.spawnX;
                g.y = g.spawnY;
                g.isDead = false;
                g.isVulnerable = false;
                g.vulnerableTimer = 0;
                g.speed = g.baseSpeed;
                g.dir = { x: 1, y: 0 };
            });
        }
    }

    countRemainingPellets() {
        let count = 0;
        this.map.grid.forEach(row => row.forEach(t => { if (t === 2 || t === 3) count++; }));
        return count;
    }

    togglePause() {
        if (!this.gameOver && !this.won) this.paused = !this.paused;
    }

    update() {
        if (this.gameOver || this.won || this.paused) return;

        this.pacman.update(this.map.grid);

        const pelletType = this.map.getPelletType(this.pacman.x + 16, this.pacman.y + 16);
        if (this.map.eatPellet(this.pacman.x + 16, this.pacman.y + 16)) {
            if (pelletType === 3) {
                this.score += 50;
                this.ghosts.forEach(g => g.makeVulnerable(480));
                this._playSound('powerup');
            } else {
                this.score += 10;
                this._playSound('eat');
            }
        }

        if (this.countRemainingPellets() === 0) {
            this.won = true;
            return;
        }

        this.ghosts.forEach(ghost => {
            ghost.update(this.map.grid, this.pacman);
            const dist = Math.hypot(this.pacman.x - ghost.x, this.pacman.y - ghost.y);
            if (dist < 20) {
                if (ghost.isVulnerable && !ghost.isDead) {
                    this.score += 200;
                    ghost.die();
                    this._playSound('ghost');
                } else if (!ghost.isDead && !ghost.isVulnerable) {
                    this._playSound('death');
                    this._loseLife();
                }
            }
        });
    }

    _playSound(type) {
        if (!this.settings.soundEnabled) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);
            const vol = (this.settings.volume ?? 80) / 100;
            g.gain.setValueAtTime(vol * 0.3, ctx.currentTime);

            if (type === 'eat') {
                o.frequency.setValueAtTime(880, ctx.currentTime);
                o.frequency.setValueAtTime(440, ctx.currentTime + 0.05);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
                o.start(); o.stop(ctx.currentTime + 0.1);
            } else if (type === 'powerup') {
                o.frequency.setValueAtTime(300, ctx.currentTime);
                o.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.3);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                o.start(); o.stop(ctx.currentTime + 0.4);
            } else if (type === 'ghost') {
                o.frequency.setValueAtTime(600, ctx.currentTime);
                o.frequency.setValueAtTime(200, ctx.currentTime + 0.1);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                o.start(); o.stop(ctx.currentTime + 0.3);
            } else if (type === 'death') {
                o.type = 'sawtooth';
                o.frequency.setValueAtTime(400, ctx.currentTime);
                o.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.5);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
                o.start(); o.stop(ctx.currentTime + 0.6);
            }
        } catch (e) { /* silence */ }
    }

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.map.draw(ctx);
        this.pacman.draw(ctx);
        this.ghosts.forEach(g => g.draw(ctx));

        if (this.paused) {
            ctx.fillStyle = 'rgba(0,0,0,0.55)';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.fillStyle = '#ffe700';
            ctx.font = 'bold 28px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('⏸ PAUSE', ctx.canvas.width / 2, ctx.canvas.height / 2);
            ctx.font = '14px monospace';
            ctx.fillStyle = '#aaa';
            ctx.fillText('Appuie sur P pour reprendre', ctx.canvas.width / 2, ctx.canvas.height / 2 + 36);
        }
    }
}
