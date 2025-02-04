class DrawnObject {
    // Classe de base pour tous les objets du canvas
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }

    checkCollision(other) {
        // Vérifie si un objet est en collision avec un autre
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
}

class Character extends DrawnObject {
    // Le joueur
    constructor(x, y, width, height, color, speed) {
        super(x, y, width, height, color);
        this.speed = speed;
    }

    draw(ctx) {
        ctx.save();
        
        // Dessin du corps
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Dessin des yeux
        ctx.fillStyle = "#000";
        const posY = 35; // Position verticale des yeux
        const ecart = 20; // Ecart entre les yeux
        
        // Gauche
        ctx.beginPath();
        ctx.arc(
            this.x + 15,
            this.y + posY,
            4, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Droit
        ctx.beginPath();
        ctx.arc(
            this.x + 15 + ecart,
            this.y + posY,
            4, 0, Math.PI * 2
        );
        ctx.fill();
        
        ctx.restore();
    }

    move(keys, canvas) {
        // Déplacement du joueur

        // On sauvegarde la position précédente en cas de collision
        const previousX = this.x;
        const previousY = this.y;

        // Selon la touche pressée, on déplace le joueur selon sa vitesse
        if (keys.ArrowLeft) this.x -= this.speed;
        if (keys.ArrowRight) this.x += this.speed;
        if (keys.ArrowUp) this.y -= this.speed;
        if (keys.ArrowDown) this.y += this.speed;

        // Vérifie que le joueur ne sort pas du canvas
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));

        return { previousX, previousY };
    }

    reset() {
        // Réinitialise la position du joueur (position de départ)
        this.x = 20;
        this.y = 20;
    }
}

class Obstacle extends DrawnObject {
    constructor(x, y, width, height, color) {
        super(x, y, width, height, color);
        this.moving = false;
        this.pointA = null;
        this.pointB = null;
        this.speed = 0;
        this.progress = 0;
    }

    update() {
        // Si préciser, on peut faire bouger les obstacles
        if (this.moving) {
            this.progress += this.speed / 100;
            if (this.progress > 1) this.progress = 0;

            const t = Math.sin(this.progress * Math.PI);
            this.x = this.pointA.x + (this.pointB.x - this.pointA.x) * t;
            this.y = this.pointA.y + (this.pointB.y - this.pointA.y) * t;
        }
    }
}

class Wall extends Obstacle {
    // Les murs sont les obstacles que le joueur ne peut traverser
    constructor(x, y, width, height, colors) {
        super(x, y, width, height, colors.walls);
    }
}

class Reset extends Obstacle {
    // Les resets sont les obstacles qui font revenir le joueur à la position de départ
    constructor(x, y, width, height, colors) {
        super(x, y, width, height, colors.resetTrigger);
    }

    draw(ctx) {
        // Les resets sont représentés par un X
        super.draw(ctx);
        
        // Draw X pattern
        ctx.save();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.moveTo(this.x + this.width, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.stroke();
        ctx.restore();
    }
}

class Torch extends DrawnObject {
    constructor(x, y, colors) {
        super(x, y, 10, 10, 'transparent'); // La torche est invisible
        this.moving = false;
        this.pointA = null;
        this.pointB = null;
        this.speed = 0;
        this.progress = 0;
    }
}

class Exit extends DrawnObject {
    // La sortie du niveau
    constructor(x, y, colors) {
        super(x, y, 40, 40, colors.exit);
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, 
                this.width/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class UI {
    // Classe pour l'interface utilisateur
    // Elle gère l'affichage des informations du jeu

    // La classe UI va ici gérer l'affichage des textes et informations (nom du niveau, temps, timeline)
    // Elle va aussi gérer le système d'obscurité et les lumières
    constructor(canvas, colors) {
        this.canvas = canvas;
        this.colors = colors;
        this.levelInfo = { // Affiche le nom et le numéro du niveau actuel
            x: 20,
            y: 40,
            font: "24px Times New Roman",
            color: colors.text,
            spacing: 30
        };
        this.timer = {
            x: canvas.width - 150,
            y: 40,
            font: "24px Times New Roman",
            color: colors.text
        };
        this.timeline = { // La timeline représente les niveaux du jeu
            y: canvas.height - 30, 
            dotRadius: 6,
            dotSpacing: 30,
            color: '#aaaaaa',
            completedColor: "#ffffff"
        };
    }

    drawLevelInfo(ctx, currentLevel, levelName) {
        // Affiche le nom et le numéro du niveau actuel
        ctx.save();
        ctx.fillStyle = this.levelInfo.color;
        ctx.font = this.levelInfo.font;
        ctx.fillText(`${currentLevel + 1} - ${levelName}`, 
                    this.levelInfo.x, this.levelInfo.y);
        ctx.restore();
    }

    drawTimer(ctx, time) {
        // Affiche le temps écoulé depuis le début du jeu
        // On affiche le temps en secondes écoulés
        ctx.save();
        ctx.fillStyle = this.timer.color;
        ctx.font = this.timer.font;
        ctx.fillText(`Time: ${Math.floor(time / 1000)}s`, 
                    this.timer.x, this.timer.y);
        ctx.restore();
    }

    drawTimeline(ctx, currentLevel, totalLevels) {
        // La timeline représente les niveaux du jeu
        // Un niveau est représenté par un cercle sauf le dernier qui est un triangle
        // Les cercles sont colorés en fonction de leur completion
        ctx.save();
        
        // Positionnement de la ligne selon le nombre de niveaux
        const totalWidth = (totalLevels - 1) * this.timeline.dotSpacing;
        const startX = (this.canvas.width - totalWidth) / 2;

        for (let i = 0; i < totalLevels; i++) {
            const x = startX + (i * this.timeline.dotSpacing);
            
            // Ligne
            if (i < totalLevels - 1) {
                ctx.beginPath();
                ctx.strokeStyle = this.timeline.color;
                ctx.lineWidth = 2;
                ctx.moveTo(x + this.timeline.dotRadius, this.timeline.y);
                ctx.lineTo(x + this.timeline.dotSpacing - this.timeline.dotRadius, this.timeline.y);
                ctx.stroke();
            }

            // Level
            ctx.beginPath();
            if (i === totalLevels - 1) {
                // Level final
                ctx.moveTo(x, this.timeline.y - this.timeline.dotRadius);
                ctx.lineTo(x - this.timeline.dotRadius, this.timeline.y + this.timeline.dotRadius);
                ctx.lineTo(x + this.timeline.dotRadius, this.timeline.y + this.timeline.dotRadius);
                ctx.closePath();
            } else {
                // Level basique
                ctx.arc(x, this.timeline.y, this.timeline.dotRadius, 0, Math.PI * 2);
            }
            
            // Completion
            if (i < currentLevel) {
                ctx.fillStyle = this.timeline.completedColor; // Level complété
            } else if (i === currentLevel) {
                ctx.fillStyle = this.colors.player; // Level actuel
            } else {
                ctx.fillStyle = this.timeline.color; // Restants
            }
            
            ctx.fill();
            
            // Bordures
            ctx.strokeStyle = this.timeline.color;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.restore();
    }

    drawDarkness(ctx, lighting, player, torches) {
        // Pour le système d'obscurité
        // Dans un premier temps on crée un canvas de la même taille que le canvas du jeu
        // On le remplit de la couleur d'obscurité
        // Puis on dessine les lumières qui vont être retirées de l'obscurité grâce à un filtre de composition

        const darkCanvas = document.createElement('canvas');
        darkCanvas.width = this.canvas.width;
        darkCanvas.height = this.canvas.height;
        const darkCtx = darkCanvas.getContext('2d');

        // Système d'obscurité
        darkCtx.fillStyle = lighting.darkness;
        darkCtx.fillRect(0, 0, darkCanvas.width, darkCanvas.height);

        // Filtre pour les lumières
        // Destination out : les lumières sont en réalité les endroits où l'obscuritée ne sera pas dessinée
        darkCtx.globalCompositeOperation = 'destination-out';

        // Lumière du joueur
        this.drawLight(darkCtx, player.x + player.width/2, 
                      player.y + player.height/2, lighting.playerRadius);

        // Lumières des torches avec clignotement
        for (const torch of torches) {
            const flickerAmount = Math.random() * 0.2 + 0.9; // Système de clignotement
            this.drawLight(darkCtx, torch.x, torch.y, 
                          lighting.torchRadius * flickerAmount);
        }

        // Couche d'obscurité
        ctx.drawImage(darkCanvas, 0, 0);
    }

    drawLight(ctx, x, y, radius) {
        // Création d'un gradient radial pour un effet de lumière
        // On crée un gradient radial avec un rayon de 0 à radius
        // Le gradient rajoute de la transparence aux couleurs pour créer un effet de dissipation
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.7)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

export default class Game {
    constructor(canvas, colors, levels) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.colors = colors;
        this.levels = levels;
        this.currentLevelIndex = 0;
        this.ui = new UI(canvas, colors);
        
        // Initialise le timer
        this.timer = {
            startTime: 0,
            currentTime: 0,
            running: false
        };

        // Initialise les touches du clavier, par défaut toutes les touches sont relâchées
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            ArrowUp: false,
            ArrowDown: false,
            KeyR: false,
            KeyS: false
        };

        // Configuration de la lumière
        this.lighting = {
            darkness: this.colors.darkness,
            playerRadius: 100,
            torchRadius: 50
        };

        // Lance le niveau actuel
        this.startLevel(this.currentLevelIndex);
    }

    startLevel(index) {
        const levelData = this.levels[index];
        if (!levelData) {
            console.error('Level data not found');
            return;
        }
        console.log('Starting level:', levelData.name);
        this.initLevel(levelData);
        this.start(); // On lance le niveau
    }

    initLevel(levelData) {
        // On initialise le niveau

        // On initialise le joueur
        this.player = new Character(10, 60, 50, 50, this.colors.player, 2);
        
        // On initialise la sortie
        this.exit = new Exit(levelData.exit.x, levelData.exit.y, this.colors);

        // On récupère les obstacles dans le JSON et on les initialise
        this.obstacles = levelData.obstacles.map(obs => {
            if (obs.type === "wall") {
                return new Wall(obs.x, obs.y, obs.width, obs.height, this.colors);
            }
            if (obs.type === "reset") {
                return new Reset(obs.x, obs.y, obs.width, obs.height, this.colors);
            }
            return null;
        }).filter(obs => obs !== null);

        // Même principe que pour les obstacles pour les torches
        this.torches = levelData.torches.map(torch => 
            new Torch(torch.x, torch.y, this.colors)
        );
    }
  
    async init() {
        // Initialise les écouteurs d'évènements
        // On écoute les évènements du clavier pour pouvoir récupérer les touches pressées par le joueur
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        console.log("Jeu initialisé");
    }
  
    handleKeyDown(e) {
        // Selon la touche pressée, on réagit

        // N'importe quelle touche initialisée
        if (this.keys.hasOwnProperty(e.code)) {
            this.keys[e.code] = true;
            
        // Si la touche R est pressée, on réinitialise le jeu
        if (e.code === 'KeyR') {
          this.resetGame();
        }
        
        // Si la touche S est pressée, on passe au niveau suivant
        if (e.code === 'KeyS') {
          this.nextLevel();
        }
      }
    }

    handleKeyUp(e) {
        // Remet la touche à false quand elle est relâchée
        if (this.keys.hasOwnProperty(e.code)) {
            this.keys[e.code] = false;
        }
    }

    start() {
        // Lance le jeu et démarre le timer
      this.timer.startTime = Date.now();
      this.timer.running = true;
      requestAnimationFrame(this.mainAnimationLoop.bind(this));
    }
  
    mainAnimationLoop() {
      // Boucle principale pour dessiner tous les éléments du jeu

      // Efface le canvas et dessine le fond
      this.ctx.fillStyle = this.colors.background;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  
      // Met à jour le jeu et le timer
      this.update();
      this.updateTimer();
      
      // Dessine les éléments du niveau récupérés dans le JSON
      this.drawCurrentLevel();
      
      // Dessine le joueur et la sortie
      this.player.draw(this.ctx);
      this.exit.draw(this.ctx);
      
      // Dessine tous les éléments de l'UI
      this.ui.drawDarkness(this.ctx, this.lighting, this.player, this.torches);
      this.ui.drawLevelInfo(this.ctx, this.currentLevelIndex, this.levels[this.currentLevelIndex].name);
      this.ui.drawTimer(this.ctx, this.timer.currentTime);
      this.ui.drawTimeline(this.ctx, this.currentLevelIndex, this.levels.length);
  
      requestAnimationFrame(this.mainAnimationLoop.bind(this));
    }
  
    update() {
      // Réaction selon les actions du joueur

      // Déplacement du joueur
      const { previousX, previousY } = this.player.move(this.keys, this.canvas);

      // Détection des collisions avec les objets (Obstacles)
      for (const obstacle of this.obstacles) {
        if (this.player.checkCollision(obstacle)) {
          // Si l'obstacle est un reset, on réinitialise la position du joueur
          if (obstacle instanceof Reset) {
            this.player.reset();
          } else {
            // Sinon on remet la position du joueur à la position précédente
            // Dans notre cas, on l'empeche de traverser les murs
            this.player.x = previousX;
            this.player.y = previousY;
          }
          break;
        }
      }

      // Met à jour les obstacles en mouvement
      for (const obstacle of this.obstacles) {
        if (obstacle.moving) {
          obstacle.update();
        }
      }

      // Même principe que pour les obstacles pour les torches
      for (const torch of this.torches) {
        if (torch.moving) {
          torch.update();
        }
      }

      // Si le joueur touche la sortie, on passe au niveau suivant
      if (this.player.checkCollision(this.exit)) {
        this.nextLevel();
      }
    }

    drawCurrentLevel() {
      // Dessine tous les obstacles
      for (const obstacle of this.obstacles) {
        obstacle.draw(this.ctx);
      }
      
      // Dessine les torches
      for (const torch of this.torches) {
        torch.draw(this.ctx);
      }
    }

    updateTimer() {
      if (this.timer.running) {
        this.timer.currentTime = Date.now() - this.timer.startTime;
      }
    }

    nextLevel() {
        // Passe au niveau suivant
        this.currentLevelIndex++;

        // Si on a fini tous les niveaux, on affiche le temps écoulé et on réinitialise le jeu
        if (this.currentLevelIndex >= this.levels.length) {
            alert(`You won! Total time: ${Math.floor(this.timer.currentTime / 1000)} seconds`);

            this.resetGame();
            return;
        }

        // Initialise le niveau suivant
        this.initLevel(this.levels[this.currentLevelIndex]);
    }

    resetGame() {
        // Réinitialise le jeu
        this.currentLevelIndex = 0;
        this.initLevel(this.levels[this.currentLevelIndex]);
        this.timer.startTime = Date.now();
        this.timer.currentTime = 0;

        // Remet les touches à false par défaut
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            ArrowUp: false,
            ArrowDown: false,
            KeyR: false,
            KeyS: false
        };
    }
}
  