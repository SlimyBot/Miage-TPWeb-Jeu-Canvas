# TP Web - Jeu 
## Mathieu Da Vinha

### Description

Jeu fais en Canvas JS, aucun framework utilisé. Le but est d'atteindre la sortie (boule jaune) à travers les niveaux en évitant les obstacles et dans le noir. 
Un éditeur de niveau est aussi accessible.
Ce jeu a été réalisé dans le cadre d'une L3 à **Miage - Université Nice Côte D'Azur**

### Instructions

Pour lancer le jeu, il suffit de lancer : soit *index.html*, soit *game.html*
Pour accéder à l'éditeur, il suffit de lancer *editor.html*, ou d'y accéder par index.html

Après avoir exporté un niveau en JSON, la liste des niveaux du jeu se trouve dans le dossier **data/levels.json**

### Fichiers

Le jeu est chargé dans les fichiers *index.html* et *game.html*
Le code du jeu se trouve dans *js/script.js* (Lancement et config) et *js/game.js* (Canvas + toutes les classes du jeu)
Les niveaux sont stockées dans *data/levels.json*

Les fichiers liès à l'éditeur sont *editor.html* et *editor.js*

Les fichiers de styles sont stockées dans le dossier *css*

### Fonctionnement

Le jeu est géré par la classe **Game** qui va récupérer pour chaque level (JSON) l'emplacement de tous ses élements : Sortie, Torches, Murs et "Ennemis".
Tous les élements, dont le joueur, héritent de la classe **DrawnObject** qui va permettre une généralité pour les éléments.
Les obstacles (murs et resets) héritent de la classe **Obstacle**.

Le jeu possède aussi une interface utilisateur géré dans la classe **UI**, le système d'obscurité est aussi géré dans cette classe

Les niveaux du jeu sont stockés en JSON dans **data/levels.json** et sont chargés en chargement de la page (dans *script.js*)

### Règles de codage respectées dans ce projet

- Snake Case
- Développement en anglais
- Object Oriented Programming
