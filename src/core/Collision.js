export class Collision {
    
    static checkPoint(x, y, map, tileSize) {
        const gridX = Math.floor(x / tileSize);
        const gridY = Math.floor(y / tileSize);
        
        
        if (!map[gridY] || map[gridY][gridX] === undefined) return true;
        
        return map[gridY][gridX] === 1;
    }

    
    static isWall(x, y, map, tileSize) {
        const padding = 2; 
        const size = tileSize - padding;

        
        const topLeft = this.checkPoint(x + padding, y + padding, map, tileSize);
        const topRight = this.checkPoint(x + size, y + padding, map, tileSize);
        const bottomLeft = this.checkPoint(x + padding, y + size, map, tileSize);
        const bottomRight = this.checkPoint(x + size, y + size, map, tileSize);

        return topLeft || topRight || bottomLeft || bottomRight;
    }

   
    static circleRect(circle, rect) {
        
        const distX = Math.abs(circle.x - rect.x - rect.w / 2);
        const distY = Math.abs(circle.y - rect.y - rect.h / 2);

        if (distX > (rect.w / 2 + circle.r)) return false;
        if (distY > (rect.h / 2 + circle.r)) return false;

        if (distX <= (rect.w / 2)) return true; 
        if (distY <= (rect.h / 2)) return true;

        const dx = distX - rect.w / 2;
        const dy = distY - rect.h / 2;
        return (dx * dx + dy * dy <= (circle.r * circle.r));
    }
}