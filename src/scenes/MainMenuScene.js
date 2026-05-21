import Phaser from 'phaser';
import { musicPlayer, sfxPlayer } from '../assets/AudioGenerator.js';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Fondo
    const bg = this.add.graphics();
    bg.fillStyle(0x1a3a2a, 1);
    bg.fillRect(0, 0, width, height);
    bg.fillStyle(0x0a2a1a, 0.5);
    bg.fillRect(0, height / 2, width, height / 2);

    // Estrellas animadas en el fondo
    this.stars = [];
    for (let i = 0; i < 60; i++) {
      const star = this.add.circle(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 2 + 1,
        0xFFFFFF,
        Math.random() * 0.5 + 0.3
      );
      this.stars.push(star);
      this.tweens.add({
        targets: star,
        alpha: { from: star.alpha, to: Math.random() * 0.3 + 0.1 },
        duration: 1000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1
      });
    }

    // Siluetas de animales decorativas
    this.drawDecorativeAnimals(width, height);

    // Titulo principal
    const titleShadow = this.add.text(width / 2 + 3, 103, 'ANIMAL QUEST', {
      fontSize: '52px',
      fontFamily: 'monospace',
      fill: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const title = this.add.text(width / 2, 100, 'ANIMAL QUEST', {
      fontSize: '52px',
      fontFamily: 'monospace',
      fill: '#FFD700',
      fontStyle: 'bold',
      stroke: '#8B6914',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      y: 95,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Subtitulo
    this.add.text(width / 2, 155, 'El mundo animal te espera', {
      fontSize: '16px',
      fontFamily: 'monospace',
      fill: '#88CC88',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Boton Nuevo Juego
    this.createButton(width / 2, 280, 'NUEVO JUEGO', () => {
      sfxPlayer.playSelect();
      musicPlayer.stop();
      this.scene.start('InstructionsScene');
    });

    // Version
    this.add.text(width / 2, height - 30, 'v1.0 - Hecho con Phaser.js', {
      fontSize: '12px',
      fontFamily: 'monospace',
      fill: '#446644'
    }).setOrigin(0.5);

    // Instruccion
    const pressText = this.add.text(width / 2, 350, 'Presiona ENTER o haz clic', {
      fontSize: '14px',
      fontFamily: 'monospace',
      fill: '#88AA88'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: pressText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Input
    this.input.keyboard.on('keydown-ENTER', () => {
      sfxPlayer.playSelect();
      musicPlayer.stop();
      this.scene.start('InstructionsScene');
    });

    // Iniciar musica con interaccion del usuario
    this.musicStarted = false;
    this.input.on('pointerdown', () => {
      if (!this.musicStarted) {
        musicPlayer.playMenuMusic();
        this.musicStarted = true;
      }
    });
    this.input.keyboard.on('keydown', () => {
      if (!this.musicStarted) {
        musicPlayer.playMenuMusic();
        this.musicStarted = true;
      }
    });
  }

  drawDecorativeAnimals(width, height) {
    // Dibujar siluetas simples de animales como decoracion
    const animals = [
      { x: 100, y: height - 100, type: 'quadruped' },
      { x: width - 120, y: height - 80, type: 'bird' },
      { x: 200, y: height - 60, type: 'small' },
      { x: width - 200, y: height - 100, type: 'quadruped' },
    ];

    animals.forEach(a => {
      const g = this.add.graphics();
      g.fillStyle(0x1A4A2A, 0.6);
      if (a.type === 'quadruped') {
        g.fillRect(a.x - 15, a.y - 10, 30, 15);
        g.fillRect(a.x + 10, a.y - 20, 12, 12);
        g.fillRect(a.x - 12, a.y + 5, 5, 10);
        g.fillRect(a.x + 8, a.y + 5, 5, 10);
      } else if (a.type === 'bird') {
        g.fillRect(a.x - 8, a.y - 5, 16, 10);
        g.fillRect(a.x - 20, a.y - 8, 15, 5);
        g.fillRect(a.x + 5, a.y - 8, 15, 5);
        g.fillRect(a.x + 8, a.y - 12, 8, 8);
      } else {
        g.fillRect(a.x - 6, a.y - 4, 12, 8);
        g.fillRect(a.x + 4, a.y - 8, 6, 6);
      }
    });

    // Suelo decorativo
    const ground = this.add.graphics();
    ground.fillStyle(0x1A4A2A, 0.4);
    ground.fillRect(0, height - 40, width, 40);
    ground.fillStyle(0x2A5A3A, 0.3);
    for (let x = 0; x < width; x += 40) {
      ground.fillTriangle(x, height - 40, x + 20, height - 55, x + 40, height - 40);
    }
  }

  createButton(x, y, text, callback) {
    const bg = this.add.graphics();
    bg.fillStyle(0x336633, 1);
    bg.fillRoundedRect(x - 120, y - 22, 240, 44, 8);
    bg.lineStyle(2, 0x66AA66);
    bg.strokeRoundedRect(x - 120, y - 22, 240, 44, 8);

    const btnText = this.add.text(x, y, text, {
      fontSize: '22px',
      fontFamily: 'monospace',
      fill: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const hitArea = this.add.rectangle(x, y, 240, 44).setInteractive({ useHandCursor: true });
    hitArea.setAlpha(0.001);

    hitArea.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x448844, 1);
      bg.fillRoundedRect(x - 120, y - 22, 240, 44, 8);
      bg.lineStyle(2, 0x88CC88);
      bg.strokeRoundedRect(x - 120, y - 22, 240, 44, 8);
      btnText.setColor('#FFD700');
    });

    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x336633, 1);
      bg.fillRoundedRect(x - 120, y - 22, 240, 44, 8);
      bg.lineStyle(2, 0x66AA66);
      bg.strokeRoundedRect(x - 120, y - 22, 240, 44, 8);
      btnText.setColor('#FFFFFF');
    });

    hitArea.on('pointerdown', callback);
  }
}
