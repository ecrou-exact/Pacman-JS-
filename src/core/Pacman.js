import { Entity } from './Entity';
import { Collision } from './Collision';

export class Pacman extends Entity {
    constructor(x, y, tileSize, speed) {
        super(x, y, tileSize, speed);
        this.dir = { x: 0, y: 0 };
        this.nextDir = { x: 0, y: 0 };
        this.lastAngle = 0; 
    }

    update(map) {
        const isAligned = this.x % this.tileSize === 0 && this.y % this.tileSize === 0;

        if (isAligned) {
            if (this.nextDir.x !== 0 || this.nextDir.y !== 0) {
                const canTurn = !Collision.isWall(
                    this.x + this.nextDir.x * this.tileSize, 
                    this.y + this.nextDir.y * this.tileSize, 
                    map, 
                    this.tileSize
                );

                if (canTurn) {
                    this.dir = { ...this.nextDir };
                    this.updateAngle();
                }
            }

            const isPathBlocked = Collision.isWall(
                this.x + this.dir.x * this.tileSize, 
                this.y + this.dir.y * this.tileSize, 
                map, 
                this.tileSize
            );

            if (isPathBlocked) {
                this.dir = { x: 0, y: 0 };
            }
        }

        this.x += this.dir.x * this.speed;
        this.y += this.dir.y * this.speed;

        this.handleTunnel(map);
    }

    updateAngle() {
        if (this.dir.x === 1) this.lastAngle = 0;
        else if (this.dir.x === -1) this.lastAngle = Math.PI;
        else if (this.dir.y === 1) this.lastAngle = Math.PI / 2;
        else if (this.dir.y === -1) this.lastAngle = -Math.PI / 2;
    }

    handleTunnel(map) {
        const mapWidth = map[0].length * this.tileSize;
        if (this.x < -this.tileSize / 2) this.x = mapWidth + this.tileSize / 2;
        if (this.x > mapWidth + this.tileSize / 2) this.x = -this.tileSize / 2;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.tileSize / 2, this.y + this.tileSize / 2);
        
        ctx.rotate(this.lastAngle);
        
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        
        const isMoving = this.dir.x !== 0 || this.dir.y !== 0;
        const mouthOpen = isMoving ? (Math.sin(Date.now() / 100) + 1) * 0.2 : 0.15; 
        
        ctx.arc(0, 0, this.tileSize / 2 - 2, mouthOpen * Math.PI, (2 - mouthOpen) * Math.PI);
        ctx.lineTo(0, 0);
        ctx.fill();
        
        ctx.restore();
    }
}