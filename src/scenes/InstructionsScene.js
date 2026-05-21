import Phaser from 'phaser';
import { sfxPlayer } from '../assets/AudioGenerator.js';
import { ANIMALS } from '../data/animals.js';

export class InstructionsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'InstructionsScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Fondo
    const bg = this.add.graphics();
    bg.fillStyle(0x0a1a2a, 1);
    bg.fillRect(0, 0, width, height);

    // Panel central
    const panel = this.add.graphics();
    panel.fillStyle(0x112233, 0.9);
    panel.fillRoundedRect(40, 30, width - 80, height - 60, 12);
    panel.lineStyle(2, 0x3388AA);
    panel.strokeRoundedRect(40, 30, width - 80, height - 60, 12);

    // Titulo
    this.add.text(width / 2, 60, 'BIENVENIDO A ANIMAL QUEST', {
      fontSize: '24px',
      fontFamily: 'monospace',
      fill: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Linea separadora
    const line = this.add.graphics();
    line.lineStyle(1, 0x3388AA);
    line.lineBetween(80, 80, width - 80, 80);

    // Mision
    const missionY = 100;
    this.add.text(width / 2, missionY, 'TU MISION', {
      fontSize: '18px', fontFamily: 'monospace', fill: '#FF8844', fontStyle: 'bold'
    }).setOrigin(0.5);

    const missionText = [
      'Explora el mundo y conviertete en el mejor',
      'domador de animales. Derrota a todos los',
      'entrenadores NPC que encontraras en tu camino.',
      'Captura animales salvajes en la hierba alta',
      'y forma el equipo mas poderoso.'
    ];
    missionText.forEach((line, i) => {
      this.add.text(width / 2, missionY + 25 + i * 20, line, {
        fontSize: '13px', fontFamily: 'monospace', fill: '#BBDDEE'
      }).setOrigin(0.5);
    });

    // Controles
    const controlY = 250;
    this.add.text(width / 2, controlY, 'CONTROLES', {
      fontSize: '18px', fontFamily: 'monospace', fill: '#FF8844', fontStyle: 'bold'
    }).setOrigin(0.5);

    const controls = [
      ['Flechas / WASD', 'Mover al personaje'],
      ['ENTER / SPACE', 'Interactuar / Confirmar'],
      ['ESC', 'Cancelar / Menu'],
      ['1-4', 'Seleccionar movimiento en batalla'],
      ['C', 'Intentar capturar (en batalla)'],
      ['T', 'Cambiar animal (en batalla)'],
    ];

    controls.forEach(([key, desc], i) => {
      const y = controlY + 25 + i * 22;
      this.add.text(120, y, key, {
        fontSize: '13px', fontFamily: 'monospace', fill: '#FFD700', fontStyle: 'bold'
      });
      this.add.text(340, y, desc, {
        fontSize: '13px', fontFamily: 'monospace', fill: '#BBDDEE'
      });
    });

    // Info de tipos
    const typeY = 410;
    this.add.text(width / 2, typeY, 'TIPOS DE ANIMALES', {
      fontSize: '16px', fontFamily: 'monospace', fill: '#FF8844', fontStyle: 'bold'
    }).setOrigin(0.5);

    const typeColors = {
      'Fuego': '#FF4444', 'Agua': '#4488FF', 'Planta': '#44CC44',
      'Electrico': '#FFDD00', 'Tierra': '#CC8844', 'Volador': '#88AADD',
      'Normal': '#AAAAAA', 'Hielo': '#88DDFF', 'Veneno': '#CC44CC'
    };

    let tx = 80;
    Object.entries(typeColors).forEach(([type, color], i) => {
      if (i === 5) tx = 80; // Segunda fila
      const row = i < 5 ? 0 : 1;
      const xPos = tx + (i % 5) * 135;
      this.add.text(xPos, typeY + 25 + row * 22, type, {
        fontSize: '12px', fontFamily: 'monospace', fill: color, fontStyle: 'bold'
      });
    });

    // Tu animal inicial
    const starterY = 490;
    this.add.text(width / 2, starterY, 'Recibiras un Lobo nivel 5 como tu primer companero!', {
      fontSize: '13px', fontFamily: 'monospace', fill: '#88FF88'
    }).setOrigin(0.5);

    // Boton comenzar
    const startY = 535;
    const startBtn = this.add.graphics();
    startBtn.fillStyle(0x336633, 1);
    startBtn.fillRoundedRect(width / 2 - 120, startY - 18, 240, 36, 8);
    startBtn.lineStyle(2, 0x66AA66);
    startBtn.strokeRoundedRect(width / 2 - 120, startY - 18, 240, 36, 8);

    const startText = this.add.text(width / 2, startY, 'COMENZAR AVENTURA', {
      fontSize: '16px', fontFamily: 'monospace', fill: '#FFFFFF', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: 0.5,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    const hitArea = this.add.rectangle(width / 2, startY, 240, 36).setInteractive({ useHandCursor: true });
    hitArea.setAlpha(0.001);

    const startGame = () => {
      sfxPlayer.playSelect();
      this.scene.start('OverworldScene');
    };

    hitArea.on('pointerdown', startGame);
    this.input.keyboard.on('keydown-ENTER', startGame);
    this.input.keyboard.on('keydown-SPACE', startGame);
  }
}
