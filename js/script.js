import Game from "./game.js";

window.onload = init;
let isCanvasFocused = false;

// On définit les couleurs du jeu
const gameColors = {
  background: "#232323",
  player: "#344fa1",
  walls: "#344fa1",
  resetTrigger: "#ffffff00",
  exit: "#ffd369",
  text: "#ffffff", // Couleur du texte pour le jeu
  darkness: "rgba(0, 0, 0, 0.95)", // Couleur de l'obscurité
};

let levels = []; // Tableau pour pouvoir importer les niveaux

async function loadLevels() {
  // On récupère les niveaux dans le fichier levels.json
  try {
    const response = await fetch("data/levels.json");
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération du JSON");
    }
    levels = await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération du JSON", error);
  }
}

async function init() {
  // On recupère le canvas
  let canvas = document.querySelector("#myCanvas");
  await loadLevels();

  // On cree une instance du jeu
  let game = new Game(canvas, gameColors, levels);
  // ici on utilise await car la méthode init est asynchrone
  // typiquement dans init on charge des images, des sons, etc.
  await game.init();

  // on peut démarrer le jeu
  game.start();
}

function focusOnCanvas() {
  let body = document.querySelector("body");
  if (isCanvasFocused) {
    body.style.overflow = "auto";
    isCanvasFocused = false;
  } else {
    body.style.overflow = "hidden";
    isCanvasFocused = true;
  }
}

document.querySelector("#myCanvas").addEventListener("click", focusOnCanvas);
