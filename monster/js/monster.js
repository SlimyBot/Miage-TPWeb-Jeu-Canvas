export default class Game {
  constructor(canvas) {
    this.canvas = canvas;
  }

  async init(canvas) {
    this.ctx = this.canvas.getContext("2d");

    console.log("Game initialisé");
  }

  start() {
    console.log("Game démarré");

    //this.drawGrid(10, 10, "red", 5);

    // on dessine un rectangle rouge (la couleur = syntaxe CSS)
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(10, 10, 100, 100);

    // on dessine un rectangle vert
    this.ctx.fillStyle = "green";
    this.ctx.fillRect(120, 10, 150, 10);
    this.ctx.fillRect(120, 100, 10, 150);

    // utilsation de la fonction drawCircleImmediat
    this.drawCircleImmediat(500, 200, 200, "blue");

    // un rectangle en fil de fer, on remplac "fill" par "stroke"
    this.ctx.strokeStyle = "blue";
    this.ctx.lineWidth = 5;
    this.ctx.strokeRect(10, 120, 100, 100);

    // un arc de cercle, nous ne sommes plus en mode "direct"
    // mais en mode "bufferise" ou comme le nomme l'API
    // en mode "path"

    this.ctx.beginPath();
    this.ctx.arc(200, 200, 50, 0, Math.PI * 2);
    // un autre cercle plus petit, mais de 0 à PI seulement
    this.ctx.arc(500, 200, 40, 0, Math.PI);

    // Pour ordonner le dessin, utilise la méthode
    // ctx.fill() ou ctx.stroke() qui dessineront tout
    // ce qui est bufferise (c'est à dire "dans le path/chemin");
    this.ctx.fill();
    this.ctx.stroke();

    // Même exemple mais avec deux cercles "bien séparés", pour cela
    // il faut utiliser beginPath() pour "vider" le path entre
    // les deux dessins
    this.ctx.fillStyle = "yellow";

    this.ctx.beginPath();
    this.ctx.arc(200, 100, 50, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.arc(500, 400, 40, 0, Math.PI);
    this.ctx.fill();
    this.ctx.closePath();
    this.ctx.stroke();

    // dessine le monstre (le joueur)
    this.drawMonstre(600, 100);

    // On démarre une animation à 60 images par seconde
    requestAnimationFrame(this.mainAnimationLoop.bind(this));
  }

  x = 100;
  mainAnimationLoop() {
    // 1 - on efface le canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 2 - on dessine les objets à animer dans le jeu
    // ici on dessine le monstre
    this.drawMonstre(this.x, 100);

    // 3 - On regarde l'état du clavier, manette, souris et on met à jour
    // l'état des objets du jeu en conséquence
    //this.update();

    // 4 - on demande au navigateur d'appeler la fonction mainAnimationLoop
    // à nouveau dans 1/60 de seconde
    requestAnimationFrame(this.mainAnimationLoop.bind(this));
  }

  update() {
    this.x += 10;
    if (this.x > this.canvas.width) {
      this.x = 0;
    }
  }

  drawCircleImmediat(x, y, r, color) {
    // BONNE PRATIQUE : on sauvegarde le contexte
    // des qu'une fonction ou un bout de code le modifie
    // couleur, épaisseur du trait, systeme de coordonnées etc.
    this.ctx.save();

    // AUTRE BONNE PRATIQUE : on dessine toujours
    // en 0, 0 !!!! et on utilise les transformations
    // géométriques pour placer le dessin, le tourner, le rescaler
    // etc.
    this.ctx.fillStyle = color;
    this.ctx.beginPath();

    // on translate le systeme de coordonnées pour placer le cercle
    // en x, y
    this.ctx.translate(x, y);
    this.ctx.arc(0, 0, r, 0, Math.PI * 2);
    this.ctx.fill();

    // on restore le contexte à la fin
    this.ctx.restore();
  }

  drawGrid(nbLignes, nbColonnes, couleur, largeurLignes) {
    // dessine une grille de lignes verticales et horizontales
    // de couleur couleur
    this.ctx.save();

    this.ctx.strokeStyle = couleur;
    this.ctx.lineWidth = largeurLignes;

    let largeurColonnes = this.canvas.width / nbColonnes;
    let hauteurLignes = this.canvas.height / nbLignes;

    this.ctx.beginPath();

    // on dessine les lignes verticales
    for (let i = 1; i < nbColonnes; i++) {
      this.ctx.moveTo(i * largeurColonnes, 0);
      this.ctx.lineTo(i * largeurColonnes, this.canvas.height);
    }

    // on dessine les lignes horizontales
    for (let i = 1; i < nbLignes; i++) {
      this.ctx.moveTo(0, i * hauteurLignes);
      this.ctx.lineTo(this.canvas.width, i * hauteurLignes);
    }

    // gpu call pour dessiner d'un coup toutes les lignes
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawMonstre(x, y) {
    // Ici on dessine un monstre
    this.ctx.save();

    // on déplace le systeme de coordonnées pour placer
    // le monstre en x, y.Tous les ordres de dessin
    // dans cette fonction seront par rapport à ce repère
    // translaté
    this.ctx.translate(x, y);
    //this.ctx.rotate(0.3);
    //this.ctx.scale(0.5, 0.5);

    // tete du monstre
    this.ctx.fillStyle = "beige";
    this.ctx.fillRect(0, 0, 100, 100);
    // yeux
    this.drawCircleImmediat(30, 40, 10, "black");
    this.drawCircleImmediat(70, 40, 10, "black");

    // Les bras
    this.drawBrasGauche();
    this.drawBrasDroit();

    // Les jambes
    this.drawJambeGauche();
    this.drawJambeDroite();

    // Le chapeau
    this.drawTopHat();

    // Le corps
    this.drawBody();

    // restore
    this.ctx.restore();
  }

  drawBrasGauche() {
    this.ctx.save();

    this.ctx.translate(-30, 130);
    this.ctx.rotate(-0.7);

    // on dessine le bras gauche
    this.ctx.fillStyle = "beige";
    this.ctx.fillRect(-50, 0, 70, 10);

    // on dessine l'avant bras gauche
    this.drawAvantBrasGauche();

    this.ctx.restore();
  }

  drawAvantBrasGauche() {
    this.ctx.save();

    this.ctx.translate(0, 0);

    this.ctx.fillStyle = "brown";
    this.ctx.fillRect(-20, 0, 70, 10);

    this.ctx.restore();
  }

  drawBrasDroit() {
    this.ctx.save();

    this.ctx.translate(-20, 0);
    this.ctx.rotate(0.7);

    // on dessine le bras gauche
    this.ctx.fillStyle = "beige";
    this.ctx.fillRect(250, 0, -50, 10);

    // on dessine l'avant bras gauche
    this.drawAvantBrasDroit();

    this.ctx.restore();
  }

  drawAvantBrasDroit() {
    this.ctx.save();

    this.ctx.translate(0, 0);

    this.ctx.fillStyle = "brown";
    this.ctx.fillRect(220, 0, -70, 10);

    this.ctx.restore();
  }

  drawJambeGauche() {
    this.ctx.save();

    this.ctx.translate(-25, 175);
    //this.ctx.rotate(0.7);

    this.ctx.translate(0, 0);

    this.ctx.fillStyle = "darkgreen";
    this.ctx.fillRect(0, 0, 50, 10);

    this.ctx.restore();
  }

  drawJambeDroite() {
    this.ctx.save();

    this.ctx.translate(75, 175);
    //this.ctx.rotate(0.7);

    this.ctx.translate(0, 0);

    this.ctx.fillStyle = "darkgreen";
    this.ctx.fillRect(0, 0, 50, 10);

    this.ctx.restore();
  }

  drawTopHat() {
    this.ctx.save();

    this.ctx.translate(-25, 30);

    this.ctx.fillStyle = "black";

    this.ctx.fillRect(0, -50, 150, 20);

    this.drawTopHatTop();

    this.ctx.restore();
  }

  drawTopHatTop() {
    this.ctx.save();

    this.ctx.translate(0, 0);

    this.ctx.fillStyle = "red";

    this.ctx.fillRect(25, -70, 100, 20);

    this.ctx.fillStyle = "black";

    this.ctx.fillRect(25, -120, 100, 50);

    this.ctx.restore();
  }

  drawBody() {
    this.ctx.save();

    this.ctx.translate(0, 75);

    this.ctx.fillStyle = "brown";
    this.ctx.fillRect(0, 0, 100, 100);

    this.ctx.restore();
  }
}
