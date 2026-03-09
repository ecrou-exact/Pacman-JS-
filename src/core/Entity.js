export class Entity {
    constructor(x, y, tileSize, speed) {
        this.x = x * tileSize;
        this.y = y * tileSize;
        this.tileSize = tileSize;
        this.speed = speed;
        this.dir = { x: 0, y: 0 };
        this.nextDir = { x: 0, y: 0 };
    }

    draw(ctx) { }
}