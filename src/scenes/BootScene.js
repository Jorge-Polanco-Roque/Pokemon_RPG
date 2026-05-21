import Phaser from 'phaser';
import { generatePlayerSprite, generateTilesets, generateCaptureBall, generateAnimalSprite, generateNPCSprite } from '../assets/SpriteGenerator.js';
import { ANIMALS } from '../data/animals.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Mostrar barra de carga
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 15, 320, 30);

    const loadingText = this.add.text(width / 2, height / 2 - 40, 'Generando mundo...', {
      fontSize: '18px',
      fill: '#ffffff',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    // Simular progreso de generacion de assets
    this.loadProgress = 0;
    this.totalAssets = ANIMALS.length + 5; // animales + tiles + player + NPCs + ball

    this.progressBar = progressBar;
    this.progressBox = progressBox;
    this.barWidth = width / 2 - 160;
    this.barHeight = height / 2 - 15;
  }

  create() {
    const steps = [];
    let step = 0;

    // Generar tilesets
    steps.push(() => {
      generateTilesets(this);
    });

    // Generar jugador
    steps.push(() => {
      generatePlayerSprite(this);
    });

    // Generar captura ball
    steps.push(() => {
      generateCaptureBall(this);
    });

    // Generar sprites de animales
    ANIMALS.forEach(animal => {
      steps.push(() => {
        generateAnimalSprite(this, animal, `animal_${animal.id}`);
      });
    });

    // Generar NPCs
    const hairColors = ['#4A2800', '#1A1A1A', '#DAA520', '#8B0000', '#FF6347', '#FFF8DC'];
    const shirtColors = ['#CC3333', '#3333CC', '#33CC33', '#CC33CC', '#CCCC33', '#33CCCC', '#FF6600', '#6600FF'];
    steps.push(() => {
      for (let i = 0; i < 25; i++) {
        const hair = hairColors[i % hairColors.length];
        const shirt = shirtColors[i % shirtColors.length];
        generateNPCSprite(this, i, hair, shirt);
      }
    });

    // Ejecutar pasos con animacion de progreso
    const timer = this.time.addEvent({
      delay: 30,
      repeat: steps.length - 1,
      callback: () => {
        if (step < steps.length) {
          steps[step]();
          step++;

          // Actualizar barra de progreso
          const progress = step / steps.length;
          this.progressBar.clear();
          this.progressBar.fillStyle(0x44AA44, 1);
          this.progressBar.fillRect(this.barWidth + 5, this.barHeight + 5, 310 * progress, 20);
        }

        if (step >= steps.length) {
          this.time.delayedCall(300, () => {
            this.scene.start('MainMenuScene');
          });
        }
      }
    });
  }
}
