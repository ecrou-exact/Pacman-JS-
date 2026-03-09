import { Entity } from './Entity';
import { Collision } from './Collision';

export class Ghost extends Entity {
    constructor(x, y, tileSize, speed, color) {
        super(x, y, tileSize, speed);
        this.spawnX = x;
        this.spawnY = y;
        this.spawnGrid = { 
            x: Math.round(x / tileSize), 
            y: Math.round(y / tileSize) 
        };
        
        this.color = color;
        this.dir = { x: 1, y: 0 };
        this.isVulnerable = false;
        this.isDead = false;
        this.vulnerableTimer = 0;
        this.detectionRadius = 200;
        this.baseSpeed = speed;
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
        // On réduit un peu la vitesse de retour pour la précision
        this.speed = this.baseSpeed; 
    }

    update(map, pacman) {
        if (!pacman) return;

        // 1. Logique de Résurrection
        if (this.isDead) {
            const distToSpawn = Math.hypot(this.x - this.spawnX, this.y - this.spawnY);
            if (distToSpawn < this.speed) {
                this.x = this.spawnX;
                this.y = this.spawnY;
                this.isDead = false;
                this.speed = this.baseSpeed;
            }
        }

        if (this.vulnerableTimer > 0 && !this.isDead) {
            this.vulnerableTimer--;
            if (this.vulnerableTimer <= 0) {
                this.isVulnerable = false;
                this.speed = this.baseSpeed;
            }
        }

        // 2. Alignement et IA
        // Correction : Utilisation d'un modulo strict pour le virage
        const isAlignedX = this.x % this.tileSize === 0;
        const isAlignedY = this.y % this.tileSize === 0;

        if (isAlignedX && isAlignedY) {
            const gx = Math.round(this.x / this.tileSize);
            const gy = Math.round(this.y / this.tileSize);

            let nextDir = null;

            if (this.isDead) {
                // Vise le spawn avec le même algo que pour Pacman
                const path = this.findPath(map, this.spawnGrid);
                if (path && path.length > 1) {
                    nextDir = { x: path[1].x - gx, y: path[1].y - gy };
                }
            } else if (this.isVulnerable) {
                nextDir = this.getRandomDir(map);
            } else {
                const distToPacman = Math.hypot(this.x - pacman.x, this.y - pacman.y);
                if (distToPacman < this.detectionRadius) {
                    const targetGrid = { 
                        x: Math.round(pacman.x / this.tileSize), 
                        y: Math.round(pacman.y / this.tileSize) 
                    };
                    const path = this.findPath(map, targetGrid);
                    if (path && path.length > 1) {
                        nextDir = { x: path[1].x - gx, y: path[1].y - gy };
                    }
                }
            }

            if (nextDir) {
                this.dir = nextDir;
            } else if (Collision.isWall(this.x + this.dir.x * this.tileSize, this.y + this.dir.y * this.tileSize, map, this.tileSize)) {
                this.dir = this.getRandomDir(map);
            }
        }

        // 3. Application du mouvement
        this.x += this.dir.x * this.speed;
        this.y += this.dir.y * this.speed;
    }

    getRandomDir(map) {
        const dirs = [{x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}];
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

            const neighbors = [{x:current.x+1,y:current.y},{x:current.x-1,y:current.y},{x:current.x,y:current.y+1},{x:current.x,y:current.y-1}];
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
        const x = this.x + r;
        const y = this.y + r;
        
        if (!this.isDead) {
            ctx.fillStyle = this.isVulnerable ? "#0000FF" : this.color;
            if (this.isVulnerable && this.vulnerableTimer < 120 && Math.floor(Date.now() / 200) % 2 === 0) ctx.fillStyle = "white";

            ctx.beginPath();
            ctx.arc(x, y - 2, r - 2, Math.PI, 0);
            ctx.lineTo(x + r - 2, y + r - 2);
            const feet = 4;
            const footW = (this.tileSize - 4) / feet;
            for (let i = 0; i <= feet; i++) {
                const wave = Math.sin(Date.now() / 150 + i) * 3;
                ctx.lineTo(x + r - 2 - (i * footW), y + r - 2 + wave);
            }
            ctx.fill();
        }

        ctx.fillStyle = "white";
        const ex = x + this.dir.x * 4;
        const ey = y - 4 + this.dir.y * 4;
        ctx.beginPath();
        ctx.arc(ex - 5, ey, 4, 0, Math.PI * 2);
        ctx.arc(ex + 5, ey, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(ex - 5 + this.dir.x * 2, ey + this.dir.y * 2, 2, 0, Math.PI * 2);
        ctx.arc(ex + 5 + this.dir.x * 2, ey + this.dir.y * 2, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}