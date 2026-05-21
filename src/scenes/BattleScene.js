import Phaser from 'phaser';
import { calculateDamage, getTypeMultiplier, ANIMALS, createAnimalInstance } from '../data/animals.js';
import { generateAnimalSprite } from '../assets/SpriteGenerator.js';
import { musicPlayer, sfxPlayer } from '../assets/AudioGenerator.js';

const STATE = {
  INTRO: 'intro',
  PLAYER_TURN: 'player_turn',
  ENEMY_TURN: 'enemy_turn',
  ANIMATING: 'animating',
  VICTORY: 'victory',
  DEFEAT: 'defeat',
  CAPTURE: 'capture',
  SWITCH: 'switch',
};

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data) {
    this.playerData = data.playerData;
    this.enemy = data.enemy;
    this.returnScene = data.returnScene;
    this.playerPosition = data.playerPosition || null;
    this.currentPlayerAnimal = 0;
    this.currentEnemyAnimal = 0;
    this.state = STATE.INTRO;
    this.battleLog = [];
  }

  create() {
    const { width, height } = this.cameras.main;

    this.drawBattleBackground(width, height);
    this.setupBattleAnimals();
    this.createBattleUI(width, height);

    // Input - crear keys una sola vez
    this.keys = {
      one: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      two: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      three: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      four: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
      five: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE),
      six: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SIX),
      c: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C),
      t: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T),
      r: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R),
      enter: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      esc: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
    };
    this.switchKeys = [this.keys.one, this.keys.two, this.keys.three, this.keys.four, this.keys.five, this.keys.six];

    musicPlayer.playBattleMusic();
    this.showBattleIntro();
  }

  getPlayerAnimal() {
    return this.playerData.team[this.currentPlayerAnimal];
  }

  getEnemyAnimal() {
    return this.enemy.team[this.currentEnemyAnimal];
  }

  drawBattleBackground(w, h) {
    const bg = this.add.graphics();

    bg.fillStyle(0x4488CC, 1);
    bg.fillRect(0, 0, w, h * 0.45);

    bg.fillStyle(0x88AA66, 1);
    bg.fillRect(0, h * 0.45, w, h * 0.55);

    bg.lineStyle(2, 0x6B8E23);
    bg.lineBetween(0, h * 0.45, w, h * 0.45);

    bg.fillStyle(0x557744, 0.5);
    for (let i = 0; i < 5; i++) {
      const mx = i * 200 - 50;
      bg.fillTriangle(mx, h * 0.45, mx + 100, h * 0.25, mx + 200, h * 0.45);
    }
  }

  setupBattleAnimals() {
    const { width, height } = this.cameras.main;

    const playerAnimal = this.getPlayerAnimal();
    const playerKey = `battle_player_${playerAnimal.id}`;
    generateAnimalSprite(this, playerAnimal, playerKey);
    this.playerAnimalSprite = this.add.image(180, height * 0.55, playerKey);
    this.playerAnimalSprite.setScale(2.5);

    const enemyAnimal = this.getEnemyAnimal();
    const enemyKey = `battle_enemy_${enemyAnimal.id}`;
    generateAnimalSprite(this, enemyAnimal, enemyKey);
    this.enemyAnimalSprite = this.add.image(width - 180, height * 0.32, enemyKey);
    this.enemyAnimalSprite.setScale(2.5);

    const platforms = this.add.graphics();
    platforms.fillStyle(0x557744, 0.6);
    platforms.fillEllipse(180, height * 0.65, 160, 30);
    platforms.fillEllipse(width - 180, height * 0.42, 160, 30);
  }

  createBattleUI(w, h) {
    // Panel de info del enemigo (arriba izquierda)
    this.enemyInfoPanel = this.add.container(20, 20);
    const enemyBg = this.add.graphics();
    enemyBg.fillStyle(0x222233, 0.9);
    enemyBg.fillRoundedRect(0, 0, 280, 75, 8);
    enemyBg.lineStyle(1, 0x4466AA);
    enemyBg.strokeRoundedRect(0, 0, 280, 75, 8);
    this.enemyInfoPanel.add(enemyBg);

    this.enemyNameText = this.add.text(10, 8, '', {
      fontSize: '14px', fontFamily: 'monospace', fill: '#FFF', fontStyle: 'bold'
    });
    this.enemyInfoPanel.add(this.enemyNameText);

    this.enemyLevelText = this.add.text(210, 8, '', {
      fontSize: '12px', fontFamily: 'monospace', fill: '#AAA'
    });
    this.enemyInfoPanel.add(this.enemyLevelText);

    this.enemyTypeText = this.add.text(10, 26, '', {
      fontSize: '11px', fontFamily: 'monospace', fill: '#88AACC'
    });
    this.enemyInfoPanel.add(this.enemyTypeText);

    this.enemyHpBarBg = this.add.graphics();
    this.enemyHpBarBg.fillStyle(0x333333, 1);
    this.enemyHpBarBg.fillRect(10, 45, 260, 12);
    this.enemyInfoPanel.add(this.enemyHpBarBg);

    this.enemyHpBar = this.add.graphics();
    this.enemyInfoPanel.add(this.enemyHpBar);

    this.enemyHpText = this.add.text(140, 45, '', {
      fontSize: '10px', fontFamily: 'monospace', fill: '#FFF'
    }).setOrigin(0.5, 0);
    this.enemyInfoPanel.add(this.enemyHpText);

    // Panel de info del jugador (abajo derecha)
    this.playerInfoPanel = this.add.container(w - 300, h - 180);
    const playerBg = this.add.graphics();
    playerBg.fillStyle(0x222233, 0.9);
    playerBg.fillRoundedRect(0, 0, 280, 90, 8);
    playerBg.lineStyle(1, 0x44AA66);
    playerBg.strokeRoundedRect(0, 0, 280, 90, 8);
    this.playerInfoPanel.add(playerBg);

    this.playerNameText = this.add.text(10, 8, '', {
      fontSize: '14px', fontFamily: 'monospace', fill: '#FFF', fontStyle: 'bold'
    });
    this.playerInfoPanel.add(this.playerNameText);

    this.playerLevelText = this.add.text(210, 8, '', {
      fontSize: '12px', fontFamily: 'monospace', fill: '#AAA'
    });
    this.playerInfoPanel.add(this.playerLevelText);

    this.playerTypeText = this.add.text(10, 26, '', {
      fontSize: '11px', fontFamily: 'monospace', fill: '#88CCAA'
    });
    this.playerInfoPanel.add(this.playerTypeText);

    this.playerHpBarBg = this.add.graphics();
    this.playerHpBarBg.fillStyle(0x333333, 1);
    this.playerHpBarBg.fillRect(10, 45, 260, 12);
    this.playerInfoPanel.add(this.playerHpBarBg);

    this.playerHpBar = this.add.graphics();
    this.playerInfoPanel.add(this.playerHpBar);

    this.playerHpText = this.add.text(140, 45, '', {
      fontSize: '10px', fontFamily: 'monospace', fill: '#FFF'
    }).setOrigin(0.5, 0);
    this.playerInfoPanel.add(this.playerHpText);

    this.playerExpBarBg = this.add.graphics();
    this.playerExpBarBg.fillStyle(0x333333, 1);
    this.playerExpBarBg.fillRect(10, 65, 260, 8);
    this.playerInfoPanel.add(this.playerExpBarBg);

    this.playerExpBar = this.add.graphics();
    this.playerInfoPanel.add(this.playerExpBar);

    this.playerExpText = this.add.text(140, 65, '', {
      fontSize: '9px', fontFamily: 'monospace', fill: '#88BBFF'
    }).setOrigin(0.5, 0);
    this.playerInfoPanel.add(this.playerExpText);

    // Panel de acciones (abajo)
    this.actionPanel = this.add.container(0, h - 80);

    const actionBg = this.add.graphics();
    actionBg.fillStyle(0x111122, 0.95);
    actionBg.fillRect(0, 0, w, 80);
    actionBg.lineStyle(2, 0x3355AA);
    actionBg.lineBetween(0, 0, w, 0);
    this.actionPanel.add(actionBg);

    // Log de batalla
    this.logText = this.add.text(w / 2, h - 105, '', {
      fontSize: '13px', fontFamily: 'monospace', fill: '#FFFFFF',
      backgroundColor: '#000000AA', padding: { x: 10, y: 5 },
      align: 'center'
    }).setOrigin(0.5).setDepth(50);

    this.moveTexts = [];
    this.moveHitAreas = [];
    this.extraActionTexts = [];

    this.updateBattleInfo();
  }

  updateBattleInfo() {
    const pAnimal = this.getPlayerAnimal();
    const eAnimal = this.getEnemyAnimal();

    const enemyLabel = this.enemy.isWild ? `${eAnimal.name} (Salvaje)` : `${eAnimal.name}`;
    this.enemyNameText.setText(enemyLabel);
    this.enemyLevelText.setText(`Nv.${eAnimal.level}`);
    this.enemyTypeText.setText(`Tipo: ${eAnimal.type}`);

    const eHpPct = Math.max(0, eAnimal.currentHp / eAnimal.maxHp);
    this.enemyHpBar.clear();
    this.enemyHpBar.fillStyle(this.getHpColor(eHpPct), 1);
    this.enemyHpBar.fillRect(10, 45, 260 * eHpPct, 12);
    this.enemyHpText.setText(`${eAnimal.currentHp}/${eAnimal.maxHp}`);

    this.playerNameText.setText(pAnimal.name);
    this.playerLevelText.setText(`Nv.${pAnimal.level}`);
    this.playerTypeText.setText(`Tipo: ${pAnimal.type}`);

    const pHpPct = Math.max(0, pAnimal.currentHp / pAnimal.maxHp);
    this.playerHpBar.clear();
    this.playerHpBar.fillStyle(this.getHpColor(pHpPct), 1);
    this.playerHpBar.fillRect(10, 45, 260 * pHpPct, 12);
    this.playerHpText.setText(`${pAnimal.currentHp}/${pAnimal.maxHp}`);

    const expPct = pAnimal.expToNext > 0 ? pAnimal.exp / pAnimal.expToNext : 0;
    this.playerExpBar.clear();
    this.playerExpBar.fillStyle(0x4488FF, 1);
    this.playerExpBar.fillRect(10, 65, 260 * expPct, 8);
    this.playerExpText.setText(`EXP: ${pAnimal.exp}/${pAnimal.expToNext}`);
  }

  getHpColor(pct) {
    if (pct > 0.5) return 0x44CC44;
    if (pct > 0.25) return 0xCCAA22;
    return 0xCC3333;
  }

  showBattleIntro() {
    const eAnimal = this.getEnemyAnimal();
    const introText = this.enemy.isWild
      ? `Un ${eAnimal.name} salvaje aparecio!`
      : `${this.enemy.name} quiere pelear!\nEnvia a ${eAnimal.name}!`;

    this.showLog(introText);

    this.time.delayedCall(1500, () => {
      this.state = STATE.PLAYER_TURN;
      this.showPlayerActions();
    });
  }

  showPlayerActions() {
    if (this.state !== STATE.PLAYER_TURN) return;

    this.clearActions();

    const pAnimal = this.getPlayerAnimal();
    const { width } = this.cameras.main;

    pAnimal.moveSet.forEach((move, i) => {
      const x = 20 + (i % 2) * (width / 2 - 10);
      const y = 8 + Math.floor(i / 2) * 28;

      const typeColor = this.getTypeColor(move.type);
      const ppText = `${move.currentPp}/${move.pp}`;
      const ppColor = move.currentPp <= 0 ? '#666666' : typeColor;
      const label = `[${i + 1}] ${move.name} (${move.type}) P:${move.power} PP:${ppText}`;

      const text = this.add.text(x, y, label, {
        fontSize: '12px', fontFamily: 'monospace', fill: ppColor
      });
      this.actionPanel.add(text);
      this.moveTexts.push(text);

      const hitArea = this.add.rectangle(x + 150, this.cameras.main.height - 80 + y + 8, 300, 24)
        .setInteractive({ useHandCursor: true })
        .setAlpha(0.001);
      hitArea.on('pointerdown', () => this.selectMove(i));
      hitArea.on('pointerover', () => text.setColor('#FFD700'));
      hitArea.on('pointerout', () => text.setColor(ppColor));
      this.moveHitAreas.push(hitArea);
    });

    // Opciones adicionales en la ultima fila
    const extraY = 64;
    if (this.enemy.isWild) {
      const captureText = this.add.text(20, extraY, `[C] Capturar (${this.playerData.captureBalls})`, {
        fontSize: '11px', fontFamily: 'monospace', fill: '#FF8844'
      });
      this.actionPanel.add(captureText);
      this.extraActionTexts.push(captureText);

      const fleeText = this.add.text(width / 2 + 100, extraY, `[R] Huir`, {
        fontSize: '11px', fontFamily: 'monospace', fill: '#CC8888'
      });
      this.actionPanel.add(fleeText);
      this.extraActionTexts.push(fleeText);
    }

    if (this.playerData.team.length > 1) {
      const switchX = this.enemy.isWild ? width / 2 : 20;
      const switchText = this.add.text(switchX, extraY, `[T] Cambiar animal`, {
        fontSize: '11px', fontFamily: 'monospace', fill: '#88CCFF'
      });
      this.actionPanel.add(switchText);
      this.extraActionTexts.push(switchText);
    }

    this.showLog('Que deberia hacer ' + pAnimal.name + '?');
  }

  clearActions() {
    this.moveTexts.forEach(t => t.destroy());
    this.moveTexts = [];
    this.moveHitAreas.forEach(h => h.destroy());
    this.moveHitAreas = [];
    this.extraActionTexts.forEach(t => t.destroy());
    this.extraActionTexts = [];
  }

  getTypeColor(type) {
    const colors = {
      'Fuego': '#FF6644', 'Agua': '#4488FF', 'Planta': '#44CC44',
      'Electrico': '#FFDD00', 'Tierra': '#CC8844', 'Volador': '#88AADD',
      'Normal': '#CCCCCC', 'Hielo': '#88DDFF', 'Veneno': '#CC44CC'
    };
    return colors[type] || '#FFFFFF';
  }

  update() {
    if (this.state === STATE.PLAYER_TURN) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.one)) this.selectMove(0);
      else if (Phaser.Input.Keyboard.JustDown(this.keys.two)) this.selectMove(1);
      else if (Phaser.Input.Keyboard.JustDown(this.keys.three)) this.selectMove(2);
      else if (Phaser.Input.Keyboard.JustDown(this.keys.four)) this.selectMove(3);
      else if (Phaser.Input.Keyboard.JustDown(this.keys.c)) this.attemptCapture();
      else if (Phaser.Input.Keyboard.JustDown(this.keys.t)) this.showSwitchMenu();
      else if (Phaser.Input.Keyboard.JustDown(this.keys.r)) this.attemptFlee();
    }

    if (this.state === STATE.SWITCH) {
      for (let i = 0; i < Math.min(this.playerData.team.length, 6); i++) {
        if (Phaser.Input.Keyboard.JustDown(this.switchKeys[i]) && i !== this.currentPlayerAnimal) {
          if (this.playerData.team[i].currentHp > 0) {
            this.switchAnimal(i);
            break;
          }
        }
      }
      if (Phaser.Input.Keyboard.JustDown(this.keys.esc)) {
        // Solo cancelar si el animal actual está vivo
        if (this.getPlayerAnimal().currentHp > 0) {
          this.state = STATE.PLAYER_TURN;
          this.showPlayerActions();
        }
      }
    }

    if (this.state === STATE.VICTORY || this.state === STATE.DEFEAT) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.enter) ||
          Phaser.Input.Keyboard.JustDown(this.keys.space)) {
        this.endBattle();
      }
    }
  }

  attemptFlee() {
    if (!this.enemy.isWild) {
      this.showLog('No puedes huir de una batalla con un entrenador!');
      return;
    }

    this.state = STATE.ANIMATING;
    this.clearActions();

    // 70% de probabilidad de huir, basado en velocidad
    const pAnimal = this.getPlayerAnimal();
    const eAnimal = this.getEnemyAnimal();
    const fleeChance = Math.min(0.95, 0.5 + (pAnimal.spd - eAnimal.spd) * 0.01);

    if (Math.random() < fleeChance) {
      this.showLog('Escapaste con exito!');
      musicPlayer.stop();
      this.time.delayedCall(1000, () => {
        this.endBattle();
      });
    } else {
      this.showLog('No pudiste escapar!');
      this.time.delayedCall(1000, () => {
        this.executeEnemyMove(() => {
          if (this.checkBattleEnd()) return;
          this.state = STATE.PLAYER_TURN;
          this.showPlayerActions();
        });
      });
    }
  }

  selectMove(index) {
    const pAnimal = this.getPlayerAnimal();
    if (index >= pAnimal.moveSet.length) return;

    const move = pAnimal.moveSet[index];
    if (move.currentPp <= 0) {
      this.showLog('No quedan PP para ese movimiento!');
      return;
    }

    this.state = STATE.ANIMATING;
    this.clearActions();

    const eAnimal = this.getEnemyAnimal();
    const playerFirst = pAnimal.spd >= eAnimal.spd;

    if (playerFirst) {
      this.executePlayerMove(move, () => {
        if (this.checkBattleEnd()) return;
        this.executeEnemyMove(() => {
          if (this.checkBattleEnd()) return;
          this.applyStatusEffects();
          if (this.checkBattleEnd()) return;
          this.state = STATE.PLAYER_TURN;
          this.showPlayerActions();
        });
      });
    } else {
      this.executeEnemyMove(() => {
        if (this.checkBattleEnd()) return;
        this.executePlayerMove(move, () => {
          if (this.checkBattleEnd()) return;
          this.applyStatusEffects();
          if (this.checkBattleEnd()) return;
          this.state = STATE.PLAYER_TURN;
          this.showPlayerActions();
        });
      });
    }
  }

  executePlayerMove(move, callback) {
    const attacker = this.getPlayerAnimal();
    const defender = this.getEnemyAnimal();

    move.currentPp--;

    if (Math.random() * 100 > move.accuracy) {
      this.showLog(`${attacker.name} uso ${move.name} pero fallo!`);
      this.time.delayedCall(1200, callback);
      return;
    }

    if (move.effect === 'poison' && !defender.statusEffect) {
      defender.statusEffect = 'poison';
      this.showLog(`${attacker.name} uso ${move.name}!\n${defender.name} fue envenenado!`);
      sfxPlayer.playAttack();
      this.animateAttack(this.playerAnimalSprite, this.enemyAnimalSprite, () => {
        this.time.delayedCall(1000, callback);
      });
      return;
    }

    if (move.effect === 'lower_atk') {
      defender.atk = Math.max(1, Math.floor(defender.atk * 0.8));
      this.showLog(`${attacker.name} uso ${move.name}!\nEl ataque de ${defender.name} bajo!`);
      sfxPlayer.playAttack();
      this.time.delayedCall(1200, callback);
      return;
    }

    const damage = calculateDamage(attacker, defender, move);
    const typeMultiplier = getTypeMultiplier(move.type, defender.type);

    defender.currentHp = Math.max(0, defender.currentHp - damage);

    let effectText = '';
    if (typeMultiplier > 1) {
      effectText = '\nEs super efectivo!';
      sfxPlayer.playSuperEffective();
    } else if (typeMultiplier > 0 && typeMultiplier < 1) {
      effectText = '\nNo es muy efectivo...';
      sfxPlayer.playNotEffective();
    } else if (typeMultiplier === 0) {
      effectText = '\nNo tiene efecto!';
    } else {
      sfxPlayer.playHit();
    }

    this.showLog(`${attacker.name} uso ${move.name}!\nHizo ${damage} de danno!${effectText}`);

    this.animateAttack(this.playerAnimalSprite, this.enemyAnimalSprite, () => {
      this.animateDamage(this.enemyAnimalSprite, () => {
        this.updateBattleInfo();
        this.time.delayedCall(800, callback);
      });
    });
  }

  executeEnemyMove(callback) {
    const attacker = this.getEnemyAnimal();
    const defender = this.getPlayerAnimal();

    // IA: elegir mejor movimiento con PP disponible
    let bestMove = null;
    let bestScore = -1;

    attacker.moveSet.forEach(move => {
      if (move.currentPp <= 0) return;
      let score = move.power;
      const mult = getTypeMultiplier(move.type, defender.type);
      score *= mult;
      if (move.type === attacker.type) score *= 1.5;
      if (move.effect) score += 30;
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    });

    // Si no hay PP en ningún movimiento, usar Forcejeo
    if (!bestMove) {
      bestMove = { name: 'Forcejeo', type: 'Normal', power: 30, accuracy: 100, pp: 999, currentPp: 999, description: '' };
    }

    if (bestMove.currentPp !== 999) {
      bestMove.currentPp--;
    }

    if (Math.random() * 100 > bestMove.accuracy) {
      this.showLog(`${attacker.name} enemigo uso ${bestMove.name} pero fallo!`);
      this.time.delayedCall(1200, callback);
      return;
    }

    if (bestMove.effect === 'poison' && !defender.statusEffect) {
      defender.statusEffect = 'poison';
      this.showLog(`${attacker.name} enemigo uso ${bestMove.name}!\nTu ${defender.name} fue envenenado!`);
      sfxPlayer.playAttack();
      this.animateAttack(this.enemyAnimalSprite, this.playerAnimalSprite, () => {
        this.time.delayedCall(1000, callback);
      });
      return;
    }

    if (bestMove.effect === 'lower_atk') {
      defender.atk = Math.max(1, Math.floor(defender.atk * 0.8));
      this.showLog(`${attacker.name} enemigo uso ${bestMove.name}!\nEl ataque de tu ${defender.name} bajo!`);
      sfxPlayer.playAttack();
      this.time.delayedCall(1200, callback);
      return;
    }

    const damage = calculateDamage(attacker, defender, bestMove);
    const typeMultiplier = getTypeMultiplier(bestMove.type, defender.type);

    defender.currentHp = Math.max(0, defender.currentHp - damage);

    let effectText = '';
    if (typeMultiplier > 1) {
      effectText = '\nEs super efectivo!';
      sfxPlayer.playSuperEffective();
    } else if (typeMultiplier > 0 && typeMultiplier < 1) {
      effectText = '\nNo es muy efectivo...';
      sfxPlayer.playNotEffective();
    } else if (typeMultiplier === 0) {
      effectText = '\nNo tiene efecto!';
    } else {
      sfxPlayer.playHit();
    }

    this.showLog(`${attacker.name} enemigo uso ${bestMove.name}!\nHizo ${damage} de danno!${effectText}`);

    this.animateAttack(this.enemyAnimalSprite, this.playerAnimalSprite, () => {
      this.animateDamage(this.playerAnimalSprite, () => {
        this.updateBattleInfo();
        this.time.delayedCall(800, callback);
      });
    });
  }

  animateAttack(attackerSprite, targetSprite, callback) {
    const origX = attackerSprite.x;
    const origY = attackerSprite.y;
    const dx = (targetSprite.x - attackerSprite.x) * 0.3;
    const dy = (targetSprite.y - attackerSprite.y) * 0.3;

    this.tweens.add({
      targets: attackerSprite,
      x: origX + dx,
      y: origY + dy,
      duration: 150,
      yoyo: true,
      ease: 'Power2',
      onComplete: callback
    });
  }

  animateDamage(sprite, callback) {
    this.tweens.add({
      targets: sprite,
      alpha: 0.2,
      duration: 80,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        sprite.setAlpha(1);
        if (callback) callback();
      }
    });
  }

  applyStatusEffects() {
    const pAnimal = this.getPlayerAnimal();
    const eAnimal = this.getEnemyAnimal();

    if (pAnimal.statusEffect === 'poison' && pAnimal.currentHp > 0) {
      const poisonDmg = Math.max(1, Math.floor(pAnimal.maxHp * 0.06));
      pAnimal.currentHp = Math.max(0, pAnimal.currentHp - poisonDmg);
      this.showLog(`${pAnimal.name} sufre ${poisonDmg} por veneno!`);
    }

    if (eAnimal.statusEffect === 'poison' && eAnimal.currentHp > 0) {
      const poisonDmg = Math.max(1, Math.floor(eAnimal.maxHp * 0.06));
      eAnimal.currentHp = Math.max(0, eAnimal.currentHp - poisonDmg);
      this.showLog(`${eAnimal.name} enemigo sufre ${poisonDmg} por veneno!`);
    }

    this.updateBattleInfo();
  }

  checkBattleEnd() {
    const eAnimal = this.getEnemyAnimal();
    const pAnimal = this.getPlayerAnimal();

    if (eAnimal.currentHp <= 0) {
      const nextEnemy = this.enemy.team.findIndex((a, i) => i > this.currentEnemyAnimal && a.currentHp > 0);
      if (nextEnemy !== -1) {
        this.currentEnemyAnimal = nextEnemy;
        const newEnemy = this.getEnemyAnimal();
        this.showLog(`${this.enemy.name} envia a ${newEnemy.name}!`);

        const enemyKey = `battle_enemy_${newEnemy.id}`;
        generateAnimalSprite(this, newEnemy, enemyKey);
        this.enemyAnimalSprite.setTexture(enemyKey);
        this.enemyAnimalSprite.setAlpha(1);
        this.updateBattleInfo();

        this.time.delayedCall(1500, () => {
          this.state = STATE.PLAYER_TURN;
          this.showPlayerActions();
        });
        return true;
      }

      this.handleVictory();
      return true;
    }

    if (pAnimal.currentHp <= 0) {
      const nextPlayer = this.playerData.team.findIndex((a, i) => i !== this.currentPlayerAnimal && a.currentHp > 0);
      if (nextPlayer !== -1) {
        this.showLog(`${pAnimal.name} fue derrotado!\nElige otro animal! (1-${this.playerData.team.length})`);
        this.state = STATE.SWITCH;
        this.showSwitchMenu();
        return true;
      }

      this.handleDefeat();
      return true;
    }

    return false;
  }

  handleVictory() {
    this.state = STATE.VICTORY;
    musicPlayer.stop();
    sfxPlayer.playVictory();

    this.tweens.add({
      targets: this.enemyAnimalSprite,
      y: this.enemyAnimalSprite.y + 60,
      alpha: 0,
      duration: 500
    });

    // Dar experiencia por CADA enemigo derrotado
    const pAnimal = this.getPlayerAnimal();
    let totalExp = 0;
    this.enemy.team.forEach(eAnimal => {
      totalExp += Math.floor((eAnimal.level * 15 + 10) * (this.enemy.isWild ? 1 : 1.5));
    });
    pAnimal.exp += totalExp;

    let levelUpText = '';

    while (pAnimal.exp >= pAnimal.expToNext) {
      pAnimal.exp -= pAnimal.expToNext;
      pAnimal.level++;
      pAnimal.expToNext = pAnimal.level * 25;

      const template = ANIMALS.find(a => a.id === pAnimal.id);
      const mult = 1 + (pAnimal.level - 1) * 0.12;
      pAnimal.maxHp = Math.floor(template.hp * mult);
      pAnimal.currentHp = Math.min(pAnimal.currentHp + 15, pAnimal.maxHp);
      pAnimal.atk = Math.floor(template.atk * mult);
      pAnimal.def = Math.floor(template.def * mult);
      pAnimal.spd = Math.floor(template.spd * mult);

      levelUpText = `\n${pAnimal.name} subio al nivel ${pAnimal.level}!`;
      sfxPlayer.playLevelUp();
    }

    this.showLog(`Victoria! +${totalExp} EXP${levelUpText}\n[ENTER] para continuar`);
    this.updateBattleInfo();

    if (!this.enemy.isWild) {
      this.playerData.victories++;
    }
  }

  handleDefeat() {
    this.state = STATE.DEFEAT;
    musicPlayer.stop();
    sfxPlayer.playDefeat();

    this.tweens.add({
      targets: this.playerAnimalSprite,
      y: this.playerAnimalSprite.y + 60,
      alpha: 0,
      duration: 500
    });

    this.playerData.team.forEach(a => {
      a.currentHp = Math.max(1, Math.floor(a.maxHp * 0.3));
      a.statusEffect = null;
      a.moveSet.forEach(m => m.currentPp = m.pp);
    });

    this.showLog('Todos tus animales fueron derrotados!\nTe recuperas con HP parcial...\n[ENTER] para continuar');
  }

  attemptCapture() {
    if (this.state !== STATE.PLAYER_TURN) return;
    if (!this.enemy.isWild) {
      this.showLog('No puedes capturar animales de entrenadores!');
      return;
    }
    if (this.playerData.captureBalls <= 0) {
      this.showLog('No te quedan bolas de captura!');
      return;
    }
    if (this.playerData.team.length >= 6) {
      this.showLog('Tu equipo esta lleno! (max 6)');
      return;
    }

    this.state = STATE.ANIMATING;
    this.clearActions();
    this.playerData.captureBalls--;

    const eAnimal = this.getEnemyAnimal();
    const hpPct = eAnimal.currentHp / eAnimal.maxHp;
    const captureChance = Math.min(0.9, (1 - hpPct) * 0.7 + 0.15);

    this.showLog(`Lanzas una bola de captura...`);

    if (this.textures.exists('capture_ball')) {
      const ball = this.add.image(200, 400, 'capture_ball');
      this.tweens.add({
        targets: ball,
        x: this.enemyAnimalSprite.x,
        y: this.enemyAnimalSprite.y,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          ball.destroy();
          this.processCaptureResult(captureChance);
        }
      });
    } else {
      this.time.delayedCall(500, () => {
        this.processCaptureResult(captureChance);
      });
    }
  }

  processCaptureResult(captureChance) {
    const eAnimal = this.getEnemyAnimal();

    this.tweens.add({
      targets: this.enemyAnimalSprite,
      x: this.enemyAnimalSprite.x + 10,
      duration: 100,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        if (Math.random() < captureChance) {
          sfxPlayer.playCapture();

          // Deep copy del animal capturado
          const captured = {
            ...eAnimal,
            isWild: false,
            statusEffect: null,
            moveSet: eAnimal.moveSet.map(m => ({ ...m, currentPp: m.pp }))
          };
          this.playerData.team.push(captured);

          this.tweens.add({
            targets: this.enemyAnimalSprite,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            duration: 300
          });

          // Dar EXP por captura tambien
          const pAnimal = this.getPlayerAnimal();
          const expGain = Math.floor((eAnimal.level * 10 + 5));
          pAnimal.exp += expGain;

          let levelUpText = '';
          while (pAnimal.exp >= pAnimal.expToNext) {
            pAnimal.exp -= pAnimal.expToNext;
            pAnimal.level++;
            pAnimal.expToNext = pAnimal.level * 25;
            const template = ANIMALS.find(a => a.id === pAnimal.id);
            const mult = 1 + (pAnimal.level - 1) * 0.12;
            pAnimal.maxHp = Math.floor(template.hp * mult);
            pAnimal.currentHp = Math.min(pAnimal.currentHp + 15, pAnimal.maxHp);
            pAnimal.atk = Math.floor(template.atk * mult);
            pAnimal.def = Math.floor(template.def * mult);
            pAnimal.spd = Math.floor(template.spd * mult);
            levelUpText = `\n${pAnimal.name} subio al nivel ${pAnimal.level}!`;
            sfxPlayer.playLevelUp();
          }

          this.showLog(`Capturaste a ${eAnimal.name}! +${expGain} EXP${levelUpText}\nSe unio a tu equipo!\n[ENTER] para continuar`);
          this.state = STATE.VICTORY;
          musicPlayer.stop();
          this.updateBattleInfo();
        } else {
          this.showLog(`${eAnimal.name} escapo de la bola!`);

          this.time.delayedCall(1000, () => {
            this.executeEnemyMove(() => {
              if (this.checkBattleEnd()) return;
              this.state = STATE.PLAYER_TURN;
              this.showPlayerActions();
            });
          });
        }
      }
    });
  }

  showSwitchMenu() {
    if (this.playerData.team.filter(a => a.currentHp > 0).length <= 1 &&
        this.getPlayerAnimal().currentHp > 0) {
      this.showLog('No tienes otros animales disponibles!');
      if (this.state === STATE.SWITCH) {
        this.state = STATE.PLAYER_TURN;
        this.showPlayerActions();
      }
      return;
    }

    this.state = STATE.SWITCH;
    this.clearActions();

    const canCancel = this.getPlayerAnimal().currentHp > 0;
    this.showLog(`Elige un animal (1-${this.playerData.team.length})${canCancel ? ' | [ESC] cancelar' : ''}`);

    this.playerData.team.forEach((animal, i) => {
      const x = 20;
      const y = 8 + i * 14;
      const isCurrent = i === this.currentPlayerAnimal;
      const isAlive = animal.currentHp > 0;
      const color = isCurrent ? '#FFD700' : (isAlive ? '#FFFFFF' : '#666666');
      const label = `[${i + 1}] ${animal.name} Nv.${animal.level} HP:${animal.currentHp}/${animal.maxHp} ${isCurrent ? '(actual)' : ''} ${!isAlive ? '(KO)' : ''}`;

      const text = this.add.text(x, y, label, {
        fontSize: '11px', fontFamily: 'monospace', fill: color
      });
      this.actionPanel.add(text);
      this.moveTexts.push(text);
    });
  }

  switchAnimal(index) {
    if (index === this.currentPlayerAnimal) return;
    if (this.playerData.team[index].currentHp <= 0) return;

    const oldAnimal = this.getPlayerAnimal();
    this.currentPlayerAnimal = index;
    const newAnimal = this.getPlayerAnimal();

    this.showLog(`${oldAnimal.name}, regresa!\nVe, ${newAnimal.name}!`);

    const playerKey = `battle_player_${newAnimal.id}`;
    generateAnimalSprite(this, newAnimal, playerKey);

    this.tweens.add({
      targets: this.playerAnimalSprite,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.playerAnimalSprite.setTexture(playerKey);
        this.tweens.add({
          targets: this.playerAnimalSprite,
          alpha: 1,
          duration: 200,
        });
      }
    });

    this.updateBattleInfo();

    this.time.delayedCall(1200, () => {
      this.executeEnemyMove(() => {
        if (this.checkBattleEnd()) return;
        this.state = STATE.PLAYER_TURN;
        this.showPlayerActions();
      });
    });
  }

  showLog(text) {
    this.logText.setText(text);
  }

  endBattle() {
    musicPlayer.stop();

    this.scene.start('OverworldScene', {
      playerData: this.playerData,
      defeatedNPC: (!this.enemy.isWild && this.state === STATE.VICTORY) ? this.enemy.npcIndex : undefined,
      playerPosition: this.playerPosition
    });
  }
}
