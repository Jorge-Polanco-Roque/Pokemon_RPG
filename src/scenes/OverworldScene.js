import Phaser from 'phaser';
import { ANIMALS, NPC_NAMES, createAnimalInstance, getRandomAnimal } from '../data/animals.js';
import { musicPlayer, sfxPlayer } from '../assets/AudioGenerator.js';

const TILE = 32;
const MAP_W = 60;
const MAP_H = 50;

// Tipos de tile
const T = {
  GRASS: 0,
  GRASS_DARK: 1,
  PATH: 2,
  WATER: 3,
  TREE: 4,
  HOUSE_WALL: 5,
  HOUSE_ROOF: 6,
  HOUSE_DOOR: 7,
  TALL_GRASS: 8,
  ROCK: 9,
  FENCE: 10,
  FLOWER: 11,
};

const TILE_TEXTURES = {
  [T.GRASS]: 'tile_grass',
  [T.GRASS_DARK]: 'tile_grass_dark',
  [T.PATH]: 'tile_path',
  [T.WATER]: 'tile_water',
  [T.TREE]: 'tile_tree_top',
  [T.HOUSE_WALL]: 'tile_house_wall',
  [T.HOUSE_ROOF]: 'tile_house_roof',
  [T.HOUSE_DOOR]: 'tile_house_door',
  [T.TALL_GRASS]: 'tile_tall_grass',
  [T.ROCK]: 'tile_rock',
  [T.FENCE]: 'tile_fence',
  [T.FLOWER]: 'tile_flower_red',
};

const SOLID_TILES = new Set([T.WATER, T.TREE, T.HOUSE_WALL, T.HOUSE_ROOF, T.ROCK, T.FENCE]);

// Mapa persistente (se genera una sola vez)
let cachedMap = null;
let cachedHouses = null;

// Generador pseudo-aleatorio con semilla para mapa consistente
function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

export class OverworldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OverworldScene' });
  }

  init(data) {
    this.playerData = data.playerData || {
      team: [createAnimalInstance(ANIMALS.find(a => a.name === 'Lobo'), 5)],
      captureBalls: 10,
      victories: 0,
      name: 'Jugador'
    };
    this.defeatedNPCIndex = data.defeatedNPC;
    this.isReturning = !!data.playerData;
    this.returnPosition = data.playerPosition || null;
  }

  create() {
    // Usar mapa cacheado o generar uno nuevo (solo la primera vez)
    if (cachedMap) {
      this.map = cachedMap;
      this.houses = cachedHouses;
    } else {
      this.map = this.generateMap();
      cachedMap = this.map;
      cachedHouses = this.houses;
    }

    // Crear tilemap visual
    this.createTilemap();

    // Crear jugador
    this.createPlayer();

    // Crear NPCs
    this.npcs = [];
    this.createNPCs();

    // UI del overworld
    this.createUI();

    // Camara
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // Estado
    this.isMoving = false;
    this.interacting = false;
    this.dialogBox = null;
    this.encounterCooldown = 0;
    this.encounterSteps = 0;

    // Marcar NPC derrotado si volvemos de batalla
    if (this.defeatedNPCIndex !== undefined && this.npcs[this.defeatedNPCIndex]) {
      this.npcs[this.defeatedNPCIndex].defeated = true;
    }

    // Restaurar NPCs derrotados previamente
    if (this.playerData._defeatedNPCs) {
      this.playerData._defeatedNPCs.forEach(idx => {
        if (this.npcs[idx]) this.npcs[idx].defeated = true;
      });
    }
    if (!this.playerData._defeatedNPCs) this.playerData._defeatedNPCs = [];
    if (this.defeatedNPCIndex !== undefined && !this.playerData._defeatedNPCs.includes(this.defeatedNPCIndex)) {
      this.playerData._defeatedNPCs.push(this.defeatedNPCIndex);
    }

    // Musica
    musicPlayer.playOverworldMusic();

    // Mensaje solo la primera vez
    if (!this.isReturning) {
      this.showDialog('Has recibido un Lobo nivel 5!\nExplora el mundo y derrota entrenadores.\nCamina por la hierba alta para encontrar animales salvajes.\nEntra en casas con puerta para curarte.', () => {
        this.interacting = false;
      });
    }
  }

  generateMap() {
    const rng = seededRandom(42);
    const map = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(T.GRASS));

    // Variar el pasto
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        if (rng() < 0.3) map[y][x] = T.GRASS_DARK;
      }
    }

    // Lago central
    const lakeX = 28, lakeY = 24;
    for (let y = lakeY - 4; y <= lakeY + 4; y++) {
      for (let x = lakeX - 5; x <= lakeX + 5; x++) {
        if (x >= 0 && x < MAP_W && y >= 0 && y < MAP_H) {
          const dist = Math.sqrt((x - lakeX) ** 2 + (y - lakeY) ** 2);
          if (dist < 4.5) map[y][x] = T.WATER;
        }
      }
    }

    // Segundo lago pequeno
    const lake2X = 48, lake2Y = 12;
    for (let y = lake2Y - 2; y <= lake2Y + 2; y++) {
      for (let x = lake2X - 3; x <= lake2X + 3; x++) {
        if (x >= 0 && x < MAP_W && y >= 0 && y < MAP_H) {
          const dist = Math.sqrt((x - lake2X) ** 2 + (y - lake2Y) ** 2);
          if (dist < 2.8) map[y][x] = T.WATER;
        }
      }
    }

    // Rio
    for (let y = 0; y < MAP_H; y++) {
      const rx = 15 + Math.floor(Math.sin(y * 0.3) * 2);
      if (rx >= 0 && rx < MAP_W) {
        map[y][rx] = T.WATER;
        if (rx + 1 < MAP_W) map[y][rx + 1] = T.WATER;
      }
    }

    // Caminos principales - horizontal
    for (let x = 0; x < MAP_W; x++) {
      map[10][x] = T.PATH;
      map[11][x] = T.PATH;
      map[25][x] = T.PATH;
      map[26][x] = T.PATH;
      map[40][x] = T.PATH;
      map[41][x] = T.PATH;
    }

    // Caminos verticales
    for (let y = 0; y < MAP_H; y++) {
      map[y][5] = T.PATH;
      map[y][6] = T.PATH;
      map[y][30] = T.PATH;
      map[y][31] = T.PATH;
      map[y][50] = T.PATH;
      map[y][51] = T.PATH;
    }

    // Puentes sobre el rio
    [10, 11, 25, 26, 40, 41].forEach(y => {
      for (let x = 13; x <= 18; x++) {
        if (x >= 0 && x < MAP_W) map[y][x] = T.PATH;
      }
    });

    // Zonas de hierba alta (para encuentros)
    const tallGrassZones = [
      { x: 8, y: 3, w: 6, h: 6 },
      { x: 20, y: 3, w: 8, h: 6 },
      { x: 35, y: 5, w: 7, h: 5 },
      { x: 45, y: 28, w: 8, h: 6 },
      { x: 8, y: 30, w: 6, h: 8 },
      { x: 38, y: 14, w: 6, h: 6 },
      { x: 8, y: 14, w: 5, h: 5 },
      { x: 22, y: 32, w: 7, h: 6 },
      { x: 42, y: 42, w: 8, h: 6 },
      { x: 10, y: 44, w: 6, h: 5 },
      { x: 53, y: 30, w: 6, h: 7 },
      { x: 34, y: 43, w: 7, h: 5 },
    ];
    tallGrassZones.forEach(zone => {
      for (let y = zone.y; y < zone.y + zone.h && y < MAP_H; y++) {
        for (let x = zone.x; x < zone.x + zone.w && x < MAP_W; x++) {
          if (map[y][x] === T.GRASS || map[y][x] === T.GRASS_DARK) {
            map[y][x] = T.TALL_GRASS;
          }
        }
      }
    });

    // Bosques (clusters de arboles)
    const forests = [
      { x: 0, y: 0, w: 4, h: 8 },
      { x: 56, y: 0, w: 4, h: 10 },
      { x: 0, y: 45, w: 5, h: 5 },
      { x: 55, y: 45, w: 5, h: 5 },
      { x: 35, y: 30, w: 4, h: 4 },
      { x: 20, y: 14, w: 3, h: 4 },
      { x: 42, y: 8, w: 3, h: 3 },
    ];
    forests.forEach(f => {
      for (let y = f.y; y < f.y + f.h && y < MAP_H; y++) {
        for (let x = f.x; x < f.x + f.w && x < MAP_W; x++) {
          if (map[y][x] === T.GRASS || map[y][x] === T.GRASS_DARK) {
            if (rng() < 0.7) map[y][x] = T.TREE;
          }
        }
      }
    });

    // Arboles sueltos decorativos
    for (let i = 0; i < 40; i++) {
      const tx = Math.floor(rng() * MAP_W);
      const ty = Math.floor(rng() * MAP_H);
      if (map[ty][tx] === T.GRASS || map[ty][tx] === T.GRASS_DARK) {
        map[ty][tx] = T.TREE;
      }
    }

    // Rocas
    for (let i = 0; i < 20; i++) {
      const rx = Math.floor(rng() * MAP_W);
      const ry = Math.floor(rng() * MAP_H);
      if (map[ry][rx] === T.GRASS || map[ry][rx] === T.GRASS_DARK) {
        map[ry][rx] = T.ROCK;
      }
    }

    // Casas/edificios
    const houses = [
      { x: 7, y: 8, w: 3, h: 2, label: 'Casa de Carlos' },
      { x: 33, y: 8, w: 3, h: 2, label: 'Tienda' },
      { x: 52, y: 22, w: 3, h: 2, label: 'Centro Animal', heals: true },
      { x: 7, y: 23, w: 3, h: 2, label: 'Casa de Maria' },
      { x: 33, y: 22, w: 3, h: 2, label: 'Lab. Profesor' },
      { x: 52, y: 38, w: 3, h: 2, label: 'Casa del Lider' },
      { x: 20, y: 38, w: 3, h: 2, label: 'Gimnasio' },
      { x: 7, y: 38, w: 3, h: 2, label: 'Casa de Pedro' },
    ];

    houses.forEach(h => {
      // Techo
      for (let x = h.x; x < h.x + h.w; x++) {
        if (x < MAP_W && h.y < MAP_H) map[h.y][x] = T.HOUSE_ROOF;
      }
      // Paredes
      for (let x = h.x; x < h.x + h.w; x++) {
        if (x < MAP_W && h.y + 1 < MAP_H) map[h.y + 1][x] = T.HOUSE_WALL;
      }
      // Puerta
      const doorX = h.x + Math.floor(h.w / 2);
      if (doorX < MAP_W && h.y + 1 < MAP_H) map[h.y + 1][doorX] = T.HOUSE_DOOR;
    });

    this.houses = houses;

    // Cercas alrededor de algunas zonas
    for (let x = 28; x <= 36; x++) {
      if (map[19][x] === T.GRASS || map[19][x] === T.GRASS_DARK) map[19][x] = T.FENCE;
      if (map[24][x] === T.GRASS || map[24][x] === T.GRASS_DARK) map[24][x] = T.FENCE;
    }

    // Flores decorativas
    const flowerSpots = [
      { x: 9, y: 9 }, { x: 10, y: 9 }, { x: 34, y: 24 }, { x: 35, y: 24 },
      { x: 53, y: 24 }, { x: 54, y: 24 }, { x: 8, y: 24 }, { x: 9, y: 24 },
      { x: 21, y: 39 }, { x: 22, y: 39 }, { x: 53, y: 39 }, { x: 54, y: 39 },
    ];
    flowerSpots.forEach(f => {
      if (f.x < MAP_W && f.y < MAP_H && !SOLID_TILES.has(map[f.y][f.x])) {
        map[f.y][f.x] = T.FLOWER;
      }
    });

    return map;
  }

  createTilemap() {
    this.tileSprites = [];
    this.collisionMap = [];

    for (let y = 0; y < MAP_H; y++) {
      this.collisionMap[y] = [];
      for (let x = 0; x < MAP_W; x++) {
        const tileType = this.map[y][x];
        const textureKey = TILE_TEXTURES[tileType] || 'tile_grass';

        // Poner pasto debajo de todo
        this.add.image(x * TILE + TILE / 2, y * TILE + TILE / 2, 'tile_grass');

        if (tileType !== T.GRASS) {
          this.add.image(x * TILE + TILE / 2, y * TILE + TILE / 2, textureKey);
        }

        this.collisionMap[y][x] = SOLID_TILES.has(tileType);
      }
    }

    // Labels de casas
    this.houses.forEach(h => {
      const label = this.add.text(
        (h.x + h.w / 2) * TILE,
        h.y * TILE - 8,
        h.label,
        { fontSize: '9px', fontFamily: 'monospace', fill: '#FFD700', stroke: '#000', strokeThickness: 2 }
      ).setOrigin(0.5);
      if (h.heals) {
        label.setColor('#FF88AA');
      }
    });

    // Bordes del mundo como colision
    this.physics.world.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);
  }

  createPlayer() {
    let startX, startY;

    if (this.returnPosition) {
      startX = this.returnPosition.x;
      startY = this.returnPosition.y;
    } else {
      startX = 6 * TILE + TILE / 2;
      startY = 11 * TILE + TILE / 2;
    }

    this.player = this.physics.add.sprite(startX, startY, 'player_down');
    this.player.setCollideWorldBounds(true);
    this.player.setSize(20, 20);
    this.player.setOffset(6, 10);
    this.player.setDepth(10);
    this.playerDir = 'down';
  }

  createNPCs() {
    // Posiciones para NPCs (en caminos o cerca de casas)
    const npcPositions = [
      { x: 10, y: 10 },
      { x: 32, y: 10 },
      { x: 53, y: 24 },
      { x: 8, y: 25 },
      { x: 34, y: 24 },
      { x: 53, y: 40 },
      { x: 21, y: 40 },
      { x: 8, y: 40 },
      { x: 20, y: 11 },
      { x: 40, y: 11 },
      { x: 25, y: 26 },
      { x: 45, y: 26 },
      { x: 15, y: 41 },
      { x: 35, y: 41 },
      { x: 10, y: 5 },
      { x: 23, y: 5 },
      { x: 37, y: 7 },
      { x: 47, y: 30 },
      { x: 10, y: 33 },
      { x: 40, y: 16 },
      { x: 55, y: 10 },
      { x: 30, y: 35 },
      { x: 12, y: 18 },
      { x: 46, y: 44 },
      { x: 25, y: 44 },
    ];

    npcPositions.forEach((pos, i) => {
      // Validar que la posición no sea un tile sólido
      if (pos.x >= 0 && pos.x < MAP_W && pos.y >= 0 && pos.y < MAP_H) {
        if (SOLID_TILES.has(this.map[pos.y][pos.x])) {
          // Buscar tile caminable cercano
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              const nx = pos.x + dx;
              const ny = pos.y + dy;
              if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && !SOLID_TILES.has(this.map[ny][nx])) {
                pos.x = nx;
                pos.y = ny;
                dy = 3; dx = 3; // break both loops
              }
            }
          }
        }
      }

      const name = NPC_NAMES[i % NPC_NAMES.length];
      const spriteKey = `npc_${i}`;

      const npcSprite = this.physics.add.sprite(
        pos.x * TILE + TILE / 2,
        pos.y * TILE + TILE / 2,
        spriteKey
      );
      npcSprite.setSize(20, 20);
      npcSprite.setOffset(6, 10);
      npcSprite.setImmovable(true);
      npcSprite.setDepth(9);

      // Guardar posición original para limitar rango de movimiento
      const originX = pos.x * TILE + TILE / 2;
      const originY = pos.y * TILE + TILE / 2;

      // Equipo del NPC (1-3 animales aleatorios)
      const teamSize = Math.min(3, Math.floor(i / 5) + 1);
      const minLevel = Math.max(1, Math.floor(i / 4) + 2);
      const maxLevel = minLevel + 4;
      const team = [];
      for (let t = 0; t < teamSize; t++) {
        team.push(getRandomAnimal(minLevel, maxLevel));
      }

      const npc = {
        sprite: npcSprite,
        name,
        team,
        defeated: false,
        index: i,
        moveTimer: 0,
        moveDir: null,
        originX,
        originY,
        dialogues: {
          before: this.getPreBattleDialogue(name),
          after: `${name}: Bien jugado, eres fuerte!`
        }
      };

      this.npcs.push(npc);

      // Colision con jugador
      this.physics.add.collider(this.player, npcSprite);
    });
  }

  getPreBattleDialogue(name) {
    const dialogues = [
      `${name}: Te reto a una batalla!\nMis animales son muy fuertes!`,
      `${name}: Preparate para pelear!\nNo tendras oportunidad!`,
      `${name}: Un retador! Perfecto!\nVeamos que tan bueno eres!`,
      `${name}: Crees que puedes ganarme?\nDemuestramelo en batalla!`,
      `${name}: Mis animales estan listos!\nAceptas el desafio?`,
      `${name}: He entrenado mucho!\nEs hora de probarlo!`,
      `${name}: Nada mejor que una batalla!\nVamos a ello!`,
    ];
    return dialogues[Math.floor(Math.random() * dialogues.length)];
  }

  createUI() {
    // Info del equipo (esquina superior izquierda)
    this.teamInfo = this.add.text(10, 10, '', {
      fontSize: '11px', fontFamily: 'monospace', fill: '#FFF',
      backgroundColor: '#00000088', padding: { x: 6, y: 4 }
    }).setScrollFactor(0).setDepth(100);

    // Victorias
    this.victoryInfo = this.add.text(10, 570, '', {
      fontSize: '11px', fontFamily: 'monospace', fill: '#FFD700',
      backgroundColor: '#00000088', padding: { x: 6, y: 4 }
    }).setScrollFactor(0).setDepth(100);

    this.updateUI();
  }

  updateUI() {
    const team = this.playerData.team;
    let teamText = 'EQUIPO:\n';
    team.forEach((a, i) => {
      const hpPct = Math.floor((a.currentHp / a.maxHp) * 100);
      teamText += `${i + 1}. ${a.name} Nv.${a.level} HP:${a.currentHp}/${a.maxHp} (${hpPct}%)\n`;
    });
    teamText += `Capturas: ${this.playerData.captureBalls}`;
    this.teamInfo.setText(teamText);

    const totalNPCs = this.npcs.length;
    const defeated = this.npcs.filter(n => n.defeated).length;
    this.victoryInfo.setText(`Victorias: ${defeated}/${totalNPCs} | Bolas: ${this.playerData.captureBalls}`);
  }

  update(time, delta) {
    if (this.interacting) {
      this.player.setVelocity(0, 0);
      return;
    }

    // Movimiento del jugador
    const speed = 160;
    let vx = 0, vy = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) { vx = -speed; this.playerDir = 'left'; }
    else if (this.cursors.right.isDown || this.wasd.right.isDown) { vx = speed; this.playerDir = 'right'; }

    if (this.cursors.up.isDown || this.wasd.up.isDown) { vy = -speed; this.playerDir = 'up'; }
    else if (this.cursors.down.isDown || this.wasd.down.isDown) { vy = speed; this.playerDir = 'down'; }

    // Normalizar diagonal
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.player.setVelocity(vx, vy);

    // Cambiar sprite segun direccion
    const dirKey = `player_${this.playerDir}`;
    if (this.player.texture.key !== dirKey) {
      this.player.setTexture(dirKey);
    }

    // Colision con tiles solidos
    this.handleTileCollision();

    // Verificar hierba alta para encuentros (basado en distancia recorrida, no por frame)
    if (vx !== 0 || vy !== 0) {
      const distThisFrame = Math.sqrt(vx * vx + vy * vy) * (delta / 1000);
      this.encounterSteps += distThisFrame;

      if (this.encounterCooldown > 0) {
        this.encounterCooldown -= delta;
      } else if (this.isOnTallGrass() && this.encounterSteps > 32) {
        // Cada ~1 tile recorrido en hierba, 8% de probabilidad
        this.encounterSteps = 0;
        if (Math.random() < 0.08) {
          this.triggerWildEncounter();
        }
      }
    }

    // Interaccion con NPCs y puertas
    if (Phaser.Input.Keyboard.JustDown(this.enterKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (!this.tryHealAtDoor()) {
        this.interactWithNearbyNPC();
      }
    }

    // Movimiento de NPCs
    this.updateNPCs(time, delta);

    // Actualizar exclamaciones de NPCs
    this.npcs.forEach(npc => {
      if (npc._exclamation) {
        npc._exclamation.setPosition(npc.sprite.x, npc.sprite.y - 24);
        npc._exclamation.setVisible(!npc.defeated);
      }
    });
  }

  tryHealAtDoor() {
    const tx = Math.floor(this.player.x / TILE);
    const ty = Math.floor(this.player.y / TILE);

    // Verificar tile enfrente del jugador
    const facingOffsets = {
      up: { dx: 0, dy: -1 },
      down: { dx: 0, dy: 1 },
      left: { dx: -1, dy: 0 },
      right: { dx: 1, dy: 0 },
    };
    const offset = facingOffsets[this.playerDir];
    const doorX = tx + offset.dx;
    const doorY = ty + offset.dy;

    if (doorX >= 0 && doorX < MAP_W && doorY >= 0 && doorY < MAP_H &&
        this.map[doorY][doorX] === T.HOUSE_DOOR) {
      // Buscar si es el Centro Animal
      const house = this.houses.find(h => {
        const hDoorX = h.x + Math.floor(h.w / 2);
        return hDoorX === doorX && h.y + 1 === doorY;
      });

      if (house && house.heals) {
        this.playerData.team.forEach(a => {
          a.currentHp = a.maxHp;
          a.statusEffect = null;
          a.moveSet.forEach(m => m.currentPp = m.pp);
        });
        sfxPlayer.playLevelUp();
        this.showDialog('Tus animales han sido curados!\nTodos recuperaron su salud completa.', () => {
          this.interacting = false;
          this.updateUI();
        });
        return true;
      } else if (house) {
        // Curación parcial en cualquier casa
        this.playerData.team.forEach(a => {
          a.currentHp = Math.min(a.maxHp, a.currentHp + Math.floor(a.maxHp * 0.3));
          a.moveSet.forEach(m => m.currentPp = Math.min(m.pp, m.currentPp + Math.floor(m.pp * 0.3)));
        });
        sfxPlayer.playSelect();
        this.showDialog(`${house.label}: Descansas un momento.\nTus animales recuperaron algo de salud.`, () => {
          this.interacting = false;
          this.updateUI();
        });
        return true;
      }
    }
    return false;
  }

  handleTileCollision() {
    const px = Math.floor(this.player.x / TILE);
    const py = Math.floor(this.player.y / TILE);

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const tx = px + dx;
        const ty = py + dy;
        if (tx >= 0 && tx < MAP_W && ty >= 0 && ty < MAP_H && this.collisionMap[ty][tx]) {
          const tileLeft = tx * TILE;
          const tileRight = tileLeft + TILE;
          const tileTop = ty * TILE;
          const tileBottom = tileTop + TILE;

          const playerLeft = this.player.x - 10;
          const playerRight = this.player.x + 10;
          const playerTop = this.player.y - 10;
          const playerBottom = this.player.y + 10;

          if (playerRight > tileLeft && playerLeft < tileRight &&
              playerBottom > tileTop && playerTop < tileBottom) {
            const overlapX = Math.min(playerRight - tileLeft, tileRight - playerLeft);
            const overlapY = Math.min(playerBottom - tileTop, tileBottom - playerTop);

            if (overlapX < overlapY) {
              if (this.player.x < tx * TILE + TILE / 2) {
                this.player.x -= overlapX;
              } else {
                this.player.x += overlapX;
              }
            } else {
              if (this.player.y < ty * TILE + TILE / 2) {
                this.player.y -= overlapY;
              } else {
                this.player.y += overlapY;
              }
            }
          }
        }
      }
    }
  }

  isOnTallGrass() {
    const tx = Math.floor(this.player.x / TILE);
    const ty = Math.floor(this.player.y / TILE);
    return tx >= 0 && tx < MAP_W && ty >= 0 && ty < MAP_H && this.map[ty][tx] === T.TALL_GRASS;
  }

  triggerWildEncounter() {
    this.encounterCooldown = 2000;
    sfxPlayer.playEncounter();
    musicPlayer.stop();

    this.cameras.main.flash(300, 0, 0, 0);

    this.time.delayedCall(400, () => {
      const wildAnimal = getRandomAnimal(
        Math.max(1, this.playerData.team[0].level - 3),
        this.playerData.team[0].level + 2
      );
      wildAnimal.isWild = true;

      this.scene.start('BattleScene', {
        playerData: this.playerData,
        enemy: { name: 'Salvaje', team: [wildAnimal], isWild: true },
        returnScene: 'OverworldScene',
        playerPosition: { x: this.player.x, y: this.player.y }
      });
    });
  }

  interactWithNearbyNPC() {
    const interactDist = 50;
    let closestNPC = null;
    let closestDist = Infinity;

    this.npcs.forEach(npc => {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        npc.sprite.x, npc.sprite.y
      );
      if (dist < interactDist && dist < closestDist) {
        closestDist = dist;
        closestNPC = npc;
      }
    });

    if (closestNPC) {
      this.interacting = true;
      if (closestNPC.defeated) {
        this.showDialog(closestNPC.dialogues.after, () => {
          this.interacting = false;
        });
      } else {
        this.showDialog(closestNPC.dialogues.before, () => {
          this.interacting = false;
          musicPlayer.stop();
          this.cameras.main.flash(300, 0, 0, 0);
          this.time.delayedCall(400, () => {
            this.scene.start('BattleScene', {
              playerData: this.playerData,
              enemy: {
                name: closestNPC.name,
                team: closestNPC.team.map(a => ({
                  ...a,
                  currentHp: a.maxHp,
                  statusEffect: null,
                  moveSet: a.moveSet.map(m => ({ ...m, currentPp: m.pp }))
                })),
                isWild: false,
                npcIndex: closestNPC.index
              },
              returnScene: 'OverworldScene',
              playerPosition: { x: this.player.x, y: this.player.y }
            });
          });
        });
      }
    }
  }

  showDialog(text, onClose) {
    this.interacting = true;

    if (this.dialogContainer) {
      this.dialogContainer.destroy();
    }

    const { width, height } = this.cameras.main;

    this.dialogContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(200);

    const bg = this.add.graphics().setScrollFactor(0);
    bg.fillStyle(0x111122, 0.95);
    bg.fillRoundedRect(20, height - 130, width - 40, 110, 8);
    bg.lineStyle(2, 0x4488AA);
    bg.strokeRoundedRect(20, height - 130, width - 40, 110, 8);

    const dialogText = this.add.text(40, height - 120, text, {
      fontSize: '14px', fontFamily: 'monospace', fill: '#FFFFFF',
      wordWrap: { width: width - 80 }, lineSpacing: 4
    }).setScrollFactor(0);

    const continueText = this.add.text(width - 50, height - 35, '[ENTER]', {
      fontSize: '11px', fontFamily: 'monospace', fill: '#88AACC'
    }).setScrollFactor(0);

    this.tweens.add({
      targets: continueText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    this.dialogContainer.add([bg, dialogText, continueText]);

    const closeDialog = () => {
      if (this.dialogContainer) {
        this.dialogContainer.destroy();
        this.dialogContainer = null;
      }
      this.input.keyboard.off('keydown-ENTER', closeDialog);
      this.input.keyboard.off('keydown-SPACE', closeDialog);
      this.input.off('pointerdown', closeDialog);
      if (onClose) onClose();
    };

    this.time.delayedCall(200, () => {
      this.input.keyboard.on('keydown-ENTER', closeDialog);
      this.input.keyboard.on('keydown-SPACE', closeDialog);
      this.input.on('pointerdown', closeDialog);
    });
  }

  updateNPCs(time, delta) {
    this.npcs.forEach(npc => {
      // Crear exclamación una sola vez (sin tween para que siga al NPC)
      if (!npc._exclamation) {
        npc._exclamation = this.add.text(
          npc.sprite.x,
          npc.sprite.y - 24,
          '!',
          { fontSize: '14px', fontFamily: 'monospace', fill: '#FF4444', fontStyle: 'bold', stroke: '#000', strokeThickness: 2 }
        ).setOrigin(0.5).setDepth(11);
      }

      npc.moveTimer -= delta;
      if (npc.moveTimer <= 0) {
        npc.moveTimer = 1500 + Math.random() * 3000;
        const dirs = [
          { vx: 0, vy: 0 },
          { vx: 40, vy: 0 },
          { vx: -40, vy: 0 },
          { vx: 0, vy: 40 },
          { vx: 0, vy: -40 },
          { vx: 0, vy: 0 },
          { vx: 0, vy: 0 },
        ];
        const dir = dirs[Math.floor(Math.random() * dirs.length)];

        // Verificar que no se mueva a un tile sólido
        const nextX = npc.sprite.x + dir.vx * 0.5;
        const nextY = npc.sprite.y + dir.vy * 0.5;
        const nextTileX = Math.floor(nextX / TILE);
        const nextTileY = Math.floor(nextY / TILE);

        // Limitar rango de movimiento (3 tiles de su posición original)
        const distFromOrigin = Math.abs(nextX - npc.originX) + Math.abs(nextY - npc.originY);

        if (nextTileX >= 0 && nextTileX < MAP_W && nextTileY >= 0 && nextTileY < MAP_H &&
            !this.collisionMap[nextTileY][nextTileX] && distFromOrigin < TILE * 3) {
          npc.sprite.setVelocity(dir.vx, dir.vy);
        } else {
          npc.sprite.setVelocity(0, 0);
        }

        this.time.delayedCall(500, () => {
          if (npc.sprite.active) npc.sprite.setVelocity(0, 0);
        });
      }

      // Mantener NPCs dentro del mapa
      const nx = Phaser.Math.Clamp(npc.sprite.x, TILE, (MAP_W - 1) * TILE);
      const ny = Phaser.Math.Clamp(npc.sprite.y, TILE, (MAP_H - 1) * TILE);
      if (nx !== npc.sprite.x || ny !== npc.sprite.y) {
        npc.sprite.setPosition(nx, ny);
        npc.sprite.setVelocity(0, 0);
      }
    });
  }
}
