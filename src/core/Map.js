export class Map {
    constructor(blueprint, tileSize) {
        this.grid = JSON.parse(JSON.stringify(blueprint)); 
        this.tileSize = tileSize;
    }

    draw(ctx) {
        this.grid.forEach((row, y) => {
            row.forEach((tile, x) => {
                if (tile === 1) { 
                    ctx.fillStyle = "blue";
                    ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                } else if (tile === 2) { 
                    ctx.fillStyle = "white";
                    ctx.beginPath();
                    ctx.arc(x * this.tileSize + this.tileSize/2, y * this.tileSize + this.tileSize/2, 2, 0, Math.PI*2);
                    ctx.fill();
                } else if (tile === 3) { 
                    ctx.fillStyle = "white";
                    const pulse = Math.sin(Date.now() / 150) * 2; 
                    ctx.beginPath();
                    ctx.arc(x * this.tileSize + this.tileSize/2, y * this.tileSize + this.tileSize/2, 6 + pulse, 0, Math.PI*2);
                    ctx.fill();
                }
            });
        });
    }

    getPelletType(x, y) {
        const gridX = Math.floor(x / this.tileSize);
        const gridY = Math.floor(y / this.tileSize);
        if (this.grid[gridY] && this.grid[gridY][gridX]) {
            return this.grid[gridY][gridX];
        }
        return 0;
    }

    eatPellet(x, y) {
        const gridX = Math.floor(x / this.tileSize);
        const gridY = Math.floor(y / this.tileSize);
        
        if (this.grid[gridY] && (this.grid[gridY][gridX] === 2 || this.grid[gridY][gridX] === 3)) {
            this.grid[gridY][gridX] = 0;
            return true; 
        }
        return false;
    }
}