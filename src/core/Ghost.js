import { Entity } from './Entity';
import { Collision } from './Collision';

const CENTER_GRID = { x: 9, y: 9 };

export class Ghost extends Entity {
    constructor(x, y, tileSize, speed, color) {
        super(x, y, tileSize, speed);
        this.spawnX = CENTER_GRID.x * tileSize;
        this.spawnY = CENTER_GRID.y * tileSize;
        this.spawnGrid = { x: CENTER_GRID.x, y: CENTER_GRID.y };
        this.color = color;
        this.originalColor = color;
        this.dir = { x: 1, y: 0 };
        this.isVulnerable = false;
        this.isDead = false;
        this.vulnerableTimer = 0;
        this.detectionRadius = 250;
        this.baseSpeed = speed;
    }

    setColor(color) {
        this.color = color;
        this.originalColor = color;
    }

    makeVulnerable(duration) {
        if (this.isDead) return;
        this.isVulnerable = true;
        this.vulnerableTimer = duration;
        this.speed = this.baseSpeed * 0.5;
    }

    die() {
        this.isDead = true;
        this.isVulnerable = false;
        this.vulnerableTimer = 0;
        this.speed = this.baseSpeed * 2.5;
    }

    update(map, pacman) {
        if (!pacman) return;

        if (this.isDead) {
            const distToSpawn = Math.hypot(this.x - this.spawnX, this.y - this.spawnY);
            if (distToSpawn < this.speed + 1) {
                this.x = this.spawnX;
                this.y = this.spawnY;
                this.isDead = false;
                this.speed = this.baseSpeed;
                this.dir = { x: 1, y: 0 };
                return;
            }
        }

        if (this.vulnerableTimer > 0 && !this.isDead) {
            this.vulnerableTimer--;
            if (this.vulnerableTimer <= 0) {
                this.isVulnerable = false;
                this.speed = this.baseSpeed;
            }
        }

        const isAlignedX = this.x % this.tileSize === 0;
        const isAlignedY = this.y % this.tileSize === 0;

        if (isAlignedX && isAlignedY) {
            const gx = Math.round(this.x / this.tileSize);
            const gy = Math.round(this.y / this.tileSize);

            if (this.isDead) {
                const path = this.findPath(map, this.spawnGrid);
                if (path && path.length > 1) {
                    this.dir = { x: path[1].x - gx, y: path[1].y - gy };
                }
            } else if (this.isVulnerable) {
                const fleeDir = this.getFleeDir(map, pacman);
                if (fleeDir) this.dir = fleeDir;
            } else {
                const distToPacman = Math.hypot(this.x - pacman.x, this.y - pacman.y);
                if (distToPacman < this.detectionRadius) {
                    const targetGrid = {
                        x: Math.round(pacman.x / this.tileSize),
                        y: Math.round(pacman.y / this.tileSize)
                    };
                    const path = this.findPath(map, targetGrid);
                    if (path && path.length > 1) {
                        this.dir = { x: path[1].x - gx, y: path[1].y - gy };
                    }
                } else {
                    if (Collision.isWall(this.x + this.dir.x * this.tileSize, this.y + this.dir.y * this.tileSize, map, this.tileSize)) {
                        this.dir = this.getRandomDir(map);
                    }
                }
            }
        }

        this.x += this.dir.x * this.speed;
        this.y += this.dir.y * this.speed;
    }

    getFleeDir(map, pacman) {
        const dirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
        const valid = dirs.filter(d => !Collision.isWall(this.x + d.x * this.tileSize, this.y + d.y * this.tileSize, map, this.tileSize));
        if (valid.length === 0) return this.dir;
        return valid.reduce((best, d) => {
            const dist = Math.hypot(this.x + d.x * this.tileSize - pacman.x, this.y + d.y * this.tileSize - pacman.y);
            const bestDist = Math.hypot(this.x + best.x * this.tileSize - pacman.x, this.y + best.y * this.tileSize - pacman.y);
            return dist > bestDist ? d : best;
        }, valid[0]);
    }

    getRandomDir(map) {
        const dirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
        const valid = dirs.filter(d => !Collision.isWall(this.x + d.x * this.tileSize, this.y + d.y * this.tileSize, map, this.tileSize));
        return valid.length > 0 ? valid[Math.floor(Math.random() * valid.length)] : this.dir;
    }

    findPath(map, targetGrid) {
        const start = { x: Math.round(this.x / this.tileSize), y: Math.round(this.y / this.tileSize) };
        const openSet = [start];
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();
        const key = (p) => `${p.x},${p.y}`;
        const h = (p) => Math.abs(p.x - targetGrid.x) + Math.abs(p.y - targetGrid.y);
        gScore.set(key(start), 0);
        fScore.set(key(start), h(start));
        let safety = 0;
        while (openSet.length > 0 && safety < 500) {
            safety++;
            openSet.sort((a, b) => (fScore.get(key(a)) || 0) - (fScore.get(key(b)) || 0));
            const current = openSet.shift();
            if (current.x === targetGrid.x && current.y === targetGrid.y) {
                const path = [current];
                let currKey = key(current);
                while (cameFrom.has(currKey)) {
                    const prev = cameFrom.get(currKey);
                    path.unshift(prev);
                    currKey = key(prev);
                }
                return path;
            }
            const neighbors = [
                { x: current.x + 1, y: current.y }, { x: current.x - 1, y: current.y },
                { x: current.x, y: current.y + 1 }, { x: current.x, y: current.y - 1 }
            ];
            for (const n of neighbors) {
                if (map[n.y] && map[n.y][n.x] !== 1) {
                    const tG = (gScore.get(key(current)) || 0) + 1;
                    if (tG < (gScore.get(key(n)) ?? Infinity)) {
                        cameFrom.set(key(n), current);
                        gScore.set(key(n), tG);
                        fScore.set(key(n), tG + h(n));
                        if (!openSet.some(p => p.x === n.x && p.y === n.y)) openSet.push(n);
                    }
                }
            }
        }
        return [];
    }

    draw(ctx) {
        const r = this.tileSize / 2;
        const cx = this.x + r;
        const cy = this.y + r;

        if (this.isDead) {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(cx - 5, cy - 2, 4, 0, Math.PI * 2);
            ctx.arc(cx + 5, cy - 2, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#00f';
            ctx.beginPath();
            ctx.arc(cx - 5 + this.dir.x * 2, cy - 2 + this.dir.y * 2, 2, 0, Math.PI * 2);
            ctx.arc(cx + 5 + this.dir.x * 2, cy - 2 + this.dir.y * 2, 2, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        let bodyColor = this.color;
        if (this.isVulnerable) {
            bodyColor = '#0000cc';
            if (this.vulnerableTimer < 120 && Math.floor(Date.now() / 200) % 2 === 0) bodyColor = 'white';
        }

        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(cx, cy - 2, r - 2, Math.PI, 0);
        ctx.lineTo(cx + r - 2, cy + r - 2);
        const feet = 4;
        const footW = (this.tileSize - 4) / feet;
        for (let i = 0; i <= feet; i++) {
            const wave = Math.sin(Date.now() / 150 + i) * 3;
            ctx.lineTo(cx + r - 2 - i * footW, cy + r - 2 + wave);
        }
        ctx.closePath();
        ctx.fill();

        const ex = cx + this.dir.x * 4;
        const ey = cy - 4 + this.dir.y * 4;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(ex - 5, ey, 4, 0, Math.PI * 2);
        ctx.arc(ex + 5, ey, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = this.isVulnerable ? 'red' : 'black';
        ctx.beginPath();
        ctx.arc(ex - 5 + this.dir.x * 2, ey + this.dir.y * 2, 2, 0, Math.PI * 2);
        ctx.arc(ex + 5 + this.dir.x * 2, ey + this.dir.y * 2, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}
