import { Pacman } from './Pacman';
import { Map } from './Map';
import { Ghost } from './Ghost';

export class Game {
    constructor(canvas, blueprint) {
        this.ctx = canvas.getContext('2d');
        this.tileSize = 32;
        this.map = new Map(blueprint, this.tileSize);
        
        this.pacman = new Pacman(9, 15, this.tileSize, 2); 
        
        this.ghosts = [
            new Ghost(9, 9, this.tileSize, 2, 'red'),
            new Ghost(8, 9, this.tileSize, 2, 'pink'),
            new Ghost(10, 9, this.tileSize, 2, 'cyan'),
            new Ghost(9, 8, this.tileSize, 2, 'orange')
        ];
        
        this.score = 0;
        this.gameOver = false;
    }

    update() {
        if (this.gameOver || !this.pacman) return;

        this.pacman.update(this.map.grid);
        
        // 1. Détecter le type de pastille AVANT de la manger
        const pelletType = this.map.getPelletType(this.pacman.x + 16, this.pacman.y + 16);

        // 2. Tenter de manger la pastille
        if (this.map.eatPellet(this.pacman.x + 16, this.pacman.y + 16)) {
            if (pelletType === 3) {
                this.score += 50;
                // On rend les fantômes vulnérables
                this.ghosts.forEach(g => g.makeVulnerable(480)); 
            } else {
                this.score += 10;
            }
        }

        // 3. Gestion des fantômes
        this.ghosts.forEach(ghost => {
            ghost.update(this.map.grid, this.pacman);
            
            const dist = Math.hypot(this.pacman.x - ghost.x, this.pacman.y - ghost.y);
            if (dist < 24) {
                // Si le fantôme est bleu (vulnérable) et pas déjà mort
                if (ghost.isVulnerable && !ghost.isDead) {
                    this.score += 200;
                    ghost.die(); // C'est ici qu'on utilise die() à la place de respawn()
                } 
                // Si le fantôme est normal et vivant
                else if (!ghost.isDead) {
                    this.gameOver = true;
                    setTimeout(() => {
                        alert("Game Over! Score: " + this.score);
                        location.reload();
                    }, 10);
                }
            }
        });
    }

    render() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.map.draw(this.ctx);
        this.pacman.draw(this.ctx);
        this.ghosts.forEach(g => g.draw(this.ctx));
    }
}