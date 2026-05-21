// Genera sprites pixel art para cada animal usando Canvas API
const SPRITE_SIZE = 64;
const TILE_SIZE = 32;

// Patrones de cuerpo para cada animal (simplificados como pixel art)
const BODY_PATTERNS = {
  'Leon':        { body: 'quadruped', mane: true, tail: 'long' },
  'Fenix-Ave':   { body: 'bird', wings: 'large', tail: 'fan' },
  'Salamandra':  { body: 'lizard', tail: 'long' },
  'Delfin':      { body: 'fish', fin: 'dorsal' },
  'Tiburon':     { body: 'fish', fin: 'sharp', teeth: true },
  'Nutria':      { body: 'quadruped_small', tail: 'flat' },
  'Oso Panda':   { body: 'bear', patches: true },
  'Ciervo':      { body: 'quadruped', antlers: true },
  'Tortuga':     { body: 'turtle', shell: true },
  'Anguila':     { body: 'snake', fins: true },
  'Guepardo':    { body: 'quadruped', spots: true, tail: 'long' },
  'Luciernaga':  { body: 'insect', glow: true },
  'Rinoceronte': { body: 'quadruped_large', horn: true },
  'Topo':        { body: 'quadruped_small', claws: true },
  'Jabali':      { body: 'quadruped', tusks: true },
  'Aguila':      { body: 'bird', wings: 'spread', beak: 'hooked' },
  'Murcielago':  { body: 'bat', wings: 'membrane' },
  'Colibri':     { body: 'bird_small', wings: 'blur', beak: 'long' },
  'Lobo':        { body: 'quadruped', ears: 'pointed', tail: 'bushy' },
  'Oso':         { body: 'bear' },
  'Zorro':       { body: 'quadruped_small', ears: 'large', tail: 'bushy' },
  'Pingüino':    { body: 'penguin' },
  'Oso Polar':   { body: 'bear' },
  'Foca':        { body: 'seal' },
  'Serpiente':   { body: 'snake' },
  'Escorpion':   { body: 'scorpion' },
  'Rana':        { body: 'frog' },
  'Medusa':      { body: 'jellyfish' },
};

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function darken(hex, factor = 0.6) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
}

function lighten(hex, factor = 1.4) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.min(255, Math.floor(r * factor))}, ${Math.min(255, Math.floor(g * factor))}, ${Math.min(255, Math.floor(b * factor))})`;
}

function drawPixel(ctx, x, y, size = 2) {
  ctx.fillRect(x * size, y * size, size, size);
}

function drawBody(ctx, pattern, color, size) {
  const s = size;
  const p = 2; // pixel size
  const cx = Math.floor(s / (2 * p));
  const cy = Math.floor(s / (2 * p));

  ctx.fillStyle = color;
  const darkColor = darken(color);
  const lightColor = lighten(color);

  switch (pattern.body) {
    case 'quadruped':
    case 'quadruped_large':
      // Cuerpo
      for (let x = cx - 6; x <= cx + 5; x++) {
        for (let y = cy - 3; y <= cy + 3; y++) {
          ctx.fillStyle = color;
          drawPixel(ctx, x, y, p);
        }
      }
      // Cabeza
      for (let x = cx + 4; x <= cx + 9; x++) {
        for (let y = cy - 5; y <= cy + 1; y++) {
          ctx.fillStyle = lightColor;
          drawPixel(ctx, x, y, p);
        }
      }
      // Patas
      ctx.fillStyle = darkColor;
      for (let y = cy + 4; y <= cy + 7; y++) {
        drawPixel(ctx, cx - 4, y, p);
        drawPixel(ctx, cx - 3, y, p);
        drawPixel(ctx, cx + 3, y, p);
        drawPixel(ctx, cx + 4, y, p);
      }
      // Ojo
      ctx.fillStyle = '#000';
      drawPixel(ctx, cx + 7, cy - 3, p);
      ctx.fillStyle = '#FFF';
      drawPixel(ctx, cx + 7, cy - 4, p);
      // Cola
      if (pattern.tail === 'long') {
        ctx.fillStyle = darkColor;
        for (let i = 0; i < 5; i++) drawPixel(ctx, cx - 7 - i, cy - 2 + Math.floor(i / 2), p);
      }
      if (pattern.tail === 'bushy') {
        ctx.fillStyle = lightColor;
        for (let i = 0; i < 4; i++) {
          drawPixel(ctx, cx - 7 - i, cy - 2, p);
          drawPixel(ctx, cx - 7 - i, cy - 1, p);
        }
      }
      // Extras
      if (pattern.mane) {
        ctx.fillStyle = darken(color, 0.5);
        for (let x = cx + 3; x <= cx + 6; x++) {
          drawPixel(ctx, x, cy - 6, p);
          drawPixel(ctx, x, cy - 7, p);
        }
      }
      if (pattern.antlers) {
        ctx.fillStyle = '#8B6914';
        drawPixel(ctx, cx + 6, cy - 7, p); drawPixel(ctx, cx + 7, cy - 8, p);
        drawPixel(ctx, cx + 8, cy - 7, p); drawPixel(ctx, cx + 5, cy - 8, p);
        drawPixel(ctx, cx + 9, cy - 8, p);
      }
      if (pattern.spots) {
        ctx.fillStyle = darkColor;
        drawPixel(ctx, cx - 2, cy - 1, p); drawPixel(ctx, cx + 1, cy + 1, p);
        drawPixel(ctx, cx - 4, cy + 1, p); drawPixel(ctx, cx + 2, cy - 2, p);
      }
      if (pattern.horn) {
        ctx.fillStyle = '#AAA';
        drawPixel(ctx, cx + 9, cy - 4, p); drawPixel(ctx, cx + 10, cy - 5, p);
        drawPixel(ctx, cx + 10, cy - 6, p);
      }
      if (pattern.tusks) {
        ctx.fillStyle = '#FFF';
        drawPixel(ctx, cx + 9, cy + 1, p); drawPixel(ctx, cx + 9, cy, p);
      }
      if (pattern.ears === 'pointed') {
        ctx.fillStyle = lightColor;
        drawPixel(ctx, cx + 5, cy - 6, p); drawPixel(ctx, cx + 8, cy - 6, p);
        drawPixel(ctx, cx + 5, cy - 7, p); drawPixel(ctx, cx + 8, cy - 7, p);
      }
      if (pattern.ears === 'large') {
        ctx.fillStyle = lightColor;
        drawPixel(ctx, cx + 5, cy - 6, p); drawPixel(ctx, cx + 8, cy - 6, p);
        drawPixel(ctx, cx + 5, cy - 7, p); drawPixel(ctx, cx + 8, cy - 7, p);
        drawPixel(ctx, cx + 5, cy - 8, p); drawPixel(ctx, cx + 8, cy - 8, p);
      }
      break;

    case 'quadruped_small':
      // Cuerpo pequeno
      for (let x = cx - 4; x <= cx + 3; x++) {
        for (let y = cy - 2; y <= cy + 2; y++) {
          ctx.fillStyle = color;
          drawPixel(ctx, x, y, p);
        }
      }
      // Cabeza
      for (let x = cx + 3; x <= cx + 7; x++) {
        for (let y = cy - 4; y <= cy; y++) {
          ctx.fillStyle = lightColor;
          drawPixel(ctx, x, y, p);
        }
      }
      // Patas cortas
      ctx.fillStyle = darkColor;
      drawPixel(ctx, cx - 3, cy + 3, p); drawPixel(ctx, cx - 2, cy + 3, p);
      drawPixel(ctx, cx + 1, cy + 3, p); drawPixel(ctx, cx + 2, cy + 3, p);
      // Ojo
      ctx.fillStyle = '#000';
      drawPixel(ctx, cx + 5, cy - 3, p);
      // Tail
      if (pattern.tail === 'flat') {
        ctx.fillStyle = darkColor;
        for (let i = 0; i < 4; i++) drawPixel(ctx, cx - 5 - i, cy, p);
      }
      if (pattern.tail === 'bushy') {
        ctx.fillStyle = lightColor;
        for (let i = 0; i < 3; i++) {
          drawPixel(ctx, cx - 5 - i, cy - 1, p);
          drawPixel(ctx, cx - 5 - i, cy, p);
        }
      }
      if (pattern.claws) {
        ctx.fillStyle = '#CCC';
        drawPixel(ctx, cx + 7, cy, p); drawPixel(ctx, cx + 7, cy + 1, p);
      }
      if (pattern.ears === 'large') {
        ctx.fillStyle = lightColor;
        drawPixel(ctx, cx + 4, cy - 5, p); drawPixel(ctx, cx + 6, cy - 5, p);
        drawPixel(ctx, cx + 4, cy - 6, p); drawPixel(ctx, cx + 6, cy - 6, p);
      }
      break;

    case 'bird':
    case 'bird_small': {
      const birdScale = pattern.body === 'bird_small' ? 0.6 : 1;
      const bs = Math.ceil;
      // Cuerpo
      for (let x = cx - 3; x <= cx + 3; x++) {
        for (let y = cy - 2; y <= cy + 2; y++) {
          ctx.fillStyle = color;
          drawPixel(ctx, x, y, p);
        }
      }
      // Cabeza
      for (let x = cx + 3; x <= cx + 7; x++) {
        for (let y = cy - 5; y <= cy - 1; y++) {
          ctx.fillStyle = lightColor;
          drawPixel(ctx, x, y, p);
        }
      }
      // Alas
      ctx.fillStyle = darkColor;
      if (pattern.wings === 'large' || pattern.wings === 'spread') {
        for (let i = 0; i < 6; i++) {
          drawPixel(ctx, cx - 2 + i, cy - 4 - Math.floor(i / 2), p);
          drawPixel(ctx, cx - 2 + i, cy + 4, p);
        }
      } else if (pattern.wings === 'blur') {
        ctx.fillStyle = lighten(color, 1.2);
        for (let i = 0; i < 3; i++) {
          drawPixel(ctx, cx - 1 + i, cy - 3, p);
          drawPixel(ctx, cx - 1 + i, cy + 3, p);
        }
      } else {
        for (let i = 0; i < 4; i++) {
          drawPixel(ctx, cx - 1 + i, cy - 3, p);
        }
      }
      // Pico
      ctx.fillStyle = '#FFD700';
      if (pattern.beak === 'long') {
        drawPixel(ctx, cx + 8, cy - 3, p); drawPixel(ctx, cx + 9, cy - 3, p);
        drawPixel(ctx, cx + 10, cy - 3, p);
      } else {
        drawPixel(ctx, cx + 8, cy - 3, p); drawPixel(ctx, cx + 8, cy - 2, p);
      }
      // Ojo
      ctx.fillStyle = '#000';
      drawPixel(ctx, cx + 5, cy - 4, p);
      // Patas
      ctx.fillStyle = '#FFD700';
      drawPixel(ctx, cx - 1, cy + 3, p); drawPixel(ctx, cx + 1, cy + 3, p);
      drawPixel(ctx, cx - 1, cy + 4, p); drawPixel(ctx, cx + 1, cy + 4, p);
      // Cola de ave
      if (pattern.tail === 'fan') {
        ctx.fillStyle = darken(color, 0.7);
        for (let i = 0; i < 4; i++) {
          drawPixel(ctx, cx - 4 - i, cy - 1 + (i % 3) - 1, p);
        }
      }
      break;
    }

    case 'bat':
      // Cuerpo
      for (let x = cx - 2; x <= cx + 2; x++) {
        for (let y = cy - 2; y <= cy + 1; y++) {
          ctx.fillStyle = color;
          drawPixel(ctx, x, y, p);
        }
      }
      // Alas de membrana
      ctx.fillStyle = darkColor;
      for (let i = 0; i < 7; i++) {
        drawPixel(ctx, cx - 9 + i, cy - 1 + Math.abs(i - 3), p);
        drawPixel(ctx, cx + 3 + i, cy - 1 + Math.abs(i - 3), p);
        drawPixel(ctx, cx - 9 + i, cy + Math.abs(i - 3), p);
        drawPixel(ctx, cx + 3 + i, cy + Math.abs(i - 3), p);
      }
      // Orejas
      ctx.fillStyle = lightColor;
      drawPixel(ctx, cx - 1, cy - 3, p); drawPixel(ctx, cx + 1, cy - 3, p);
      drawPixel(ctx, cx - 1, cy - 4, p); drawPixel(ctx, cx + 1, cy - 4, p);
      // Ojos
      ctx.fillStyle = '#FF0000';
      drawPixel(ctx, cx - 1, cy - 1, p); drawPixel(ctx, cx + 1, cy - 1, p);
      break;

    case 'fish':
      // Cuerpo ovalado
      for (let x = cx - 6; x <= cx + 5; x++) {
        const w = Math.max(0, 4 - Math.abs(x - cx) * 0.6);
        for (let y = cy - Math.floor(w); y <= cy + Math.floor(w); y++) {
          ctx.fillStyle = color;
          drawPixel(ctx, x, y, p);
        }
      }
      // Aleta
      ctx.fillStyle = darkColor;
      if (pattern.fin === 'dorsal') {
        drawPixel(ctx, cx, cy - 4, p); drawPixel(ctx, cx + 1, cy - 3, p);
        drawPixel(ctx, cx - 1, cy - 3, p);
      }
      if (pattern.fin === 'sharp') {
        drawPixel(ctx, cx, cy - 5, p); drawPixel(ctx, cx + 1, cy - 4, p);
        drawPixel(ctx, cx - 1, cy - 4, p); drawPixel(ctx, cx, cy - 4, p);
      }
      // Cola
      ctx.fillStyle = lightColor;
      drawPixel(ctx, cx - 7, cy - 2, p); drawPixel(ctx, cx - 7, cy + 2, p);
      drawPixel(ctx, cx - 8, cy - 3, p); drawPixel(ctx, cx - 8, cy + 3, p);
      // Ojo
      ctx.fillStyle = '#000';
      drawPixel(ctx, cx + 3, cy - 1, p);
      ctx.fillStyle = '#FFF';
      drawPixel(ctx, cx + 4, cy - 1, p);
      // Dientes
      if (pattern.teeth) {
        ctx.fillStyle = '#FFF';
        drawPixel(ctx, cx + 5, cy + 1, p); drawPixel(ctx, cx + 6, cy, p);
      }
      break;

    case 'bear':
      // Cuerpo grande
      for (let x = cx - 5; x <= cx + 4; x++) {
        for (let y = cy - 4; y <= cy + 3; y++) {
          ctx.fillStyle = color;
          drawPixel(ctx, x, y, p);
        }
      }
      // Cabeza
      for (let x = cx + 3; x <= cx + 8; x++) {
        for (let y = cy - 6; y <= cy - 1; y++) {
          ctx.fillStyle = lightColor;
          drawPixel(ctx, x, y, p);
        }
      }
      // Orejas
      ctx.fillStyle = darkColor;
      drawPixel(ctx, cx + 4, cy - 7, p); drawPixel(ctx, cx + 7, cy - 7, p);
      // Ojos
      ctx.fillStyle = '#000';
      drawPixel(ctx, cx + 5, cy - 4, p); drawPixel(ctx, cx + 7, cy - 4, p);
      // Nariz
      ctx.fillStyle = '#333';
      drawPixel(ctx, cx + 6, cy - 2, p);
      // Patas
      ctx.fillStyle = darkColor;
      for (let y = cy + 4; y <= cy + 7; y++) {
        drawPixel(ctx, cx - 4, y, p); drawPixel(ctx, cx - 3, y, p);
        drawPixel(ctx, cx + 2, y, p); drawPixel(ctx, cx + 3, y, p);
      }
      // Manchas panda
      if (pattern.patches) {
        ctx.fillStyle = '#111';
        // Parches de ojos
        drawPixel(ctx, cx + 4, cy - 5, p); drawPixel(ctx, cx + 5, cy - 5, p);
        drawPixel(ctx, cx + 6, cy - 5, p); drawPixel(ctx, cx + 7, cy - 5, p);
        drawPixel(ctx, cx + 4, cy - 4, p); drawPixel(ctx, cx + 8, cy - 4, p);
        // Orejas negras
        drawPixel(ctx, cx + 3, cy - 7, p); drawPixel(ctx, cx + 8, cy - 7, p);
        // Patas negras
        for (let y = cy + 4; y <= cy + 7; y++) {
          drawPixel(ctx, cx - 4, y, p); drawPixel(ctx, cx - 3, y, p);
          drawPixel(ctx, cx + 2, y, p); drawPixel(ctx, cx + 3, y, p);
        }
      }
      break;

    case 'turtle':
      // Caparazon
      ctx.fillStyle = darken(color, 0.5);
      for (let x = cx - 5; x <= cx + 3; x++) {
        for (let y = cy - 4; y <= cy + 2; y++) {
          drawPixel(ctx, x, y, p);
        }
      }
      // Interior caparazon
      ctx.fillStyle = color;
      for (let x = cx - 4; x <= cx + 2; x++) {
        for (let y = cy - 3; y <= cy + 1; y++) {
          drawPixel(ctx, x, y, p);
        }
      }
      // Patron hexagonal
      ctx.fillStyle = darkColor;
      drawPixel(ctx, cx - 1, cy - 2, p); drawPixel(ctx, cx - 3, cy, p);
      drawPixel(ctx, cx + 1, cy, p);
      // Cabeza
      ctx.fillStyle = lighten(color, 1.3);
      for (let x = cx + 4; x <= cx + 7; x++) {
        for (let y = cy - 2; y <= cy + 1; y++) drawPixel(ctx, x, y, p);
      }
      // Patas
      ctx.fillStyle = lighten(color, 1.3);
      drawPixel(ctx, cx - 4, cy + 3, p); drawPixel(ctx, cx - 3, cy + 3, p);
      drawPixel(ctx, cx + 1, cy + 3, p); drawPixel(ctx, cx + 2, cy + 3, p);
      // Ojo
      ctx.fillStyle = '#000';
      drawPixel(ctx, cx + 6, cy - 1, p);
      break;

    case 'snake':
      // Cuerpo serpenteante
      ctx.fillStyle = color;
      for (let i = 0; i < 16; i++) {
        const sx = cx - 8 + i;
        const sy = cy + Math.floor(Math.sin(i * 0.8) * 2);
        drawPixel(ctx, sx, sy, p);
        drawPixel(ctx, sx, sy + 1, p);
      }
      // Cabeza
      ctx.fillStyle = lightColor;
      drawPixel(ctx, cx + 8, cy, p); drawPixel(ctx, cx + 9, cy, p);
      drawPixel(ctx, cx + 8, cy + 1, p); drawPixel(ctx, cx + 9, cy + 1, p);
      drawPixel(ctx, cx + 8, cy - 1, p); drawPixel(ctx, cx + 9, cy - 1, p);
      // Ojo
      ctx.fillStyle = '#FF0000';
      drawPixel(ctx, cx + 9, cy - 1, p);
      // Lengua
      ctx.fillStyle = '#FF0000';
      drawPixel(ctx, cx + 10, cy, p); drawPixel(ctx, cx + 11, cy - 1, p);
      drawPixel(ctx, cx + 11, cy + 1, p);
      // Aletas si tiene
      if (pattern.fins) {
        ctx.fillStyle = darkColor;
        drawPixel(ctx, cx - 2, cy - 2, p); drawPixel(ctx, cx + 2, cy - 2, p);
      }
      break;

    case 'scorpion':
      // Cuerpo
      ctx.fillStyle = color;
      for (let x = cx - 3; x <= cx + 3; x++) {
        drawPixel(ctx, x, cy, p);
        drawPixel(ctx, x, cy + 1, p);
      }
      // Pinzas
      ctx.fillStyle = darkColor;
      drawPixel(ctx, cx + 5, cy - 2, p); drawPixel(ctx, cx + 6, cy - 3, p);
      drawPixel(ctx, cx + 5, cy + 3, p); drawPixel(ctx, cx + 6, cy + 4, p);
      drawPixel(ctx, cx + 4, cy - 1, p); drawPixel(ctx, cx + 4, cy + 2, p);
      // Cola
      ctx.fillStyle = lightColor;
      for (let i = 0; i < 5; i++) {
        drawPixel(ctx, cx - 4 - i, cy - i, p);
      }
      // Aguijon
      ctx.fillStyle = '#FF0000';
      drawPixel(ctx, cx - 9, cy - 5, p);
      // Patas
      ctx.fillStyle = darkColor;
      for (let i = 0; i < 4; i++) {
        drawPixel(ctx, cx - 2 + i * 2, cy + 2, p);
        drawPixel(ctx, cx - 2 + i * 2, cy + 3, p);
      }
      // Ojos
      ctx.fillStyle = '#000';
      drawPixel(ctx, cx + 3, cy - 1, p);
      break;

    case 'frog':
      // Cuerpo
      ctx.fillStyle = color;
      for (let x = cx - 4; x <= cx + 4; x++) {
        for (let y = cy - 2; y <= cy + 2; y++) {
          drawPixel(ctx, x, y, p);
        }
      }
      // Ojos grandes
      ctx.fillStyle = '#FFF';
      drawPixel(ctx, cx + 2, cy - 3, p); drawPixel(ctx, cx + 3, cy - 3, p);
      drawPixel(ctx, cx - 1, cy - 3, p); drawPixel(ctx, cx - 2, cy - 3, p);
      ctx.fillStyle = '#000';
      drawPixel(ctx, cx + 3, cy - 3, p); drawPixel(ctx, cx - 1, cy - 3, p);
      // Patas traseras
      ctx.fillStyle = darkColor;
      drawPixel(ctx, cx - 5, cy + 2, p); drawPixel(ctx, cx - 6, cy + 3, p);
      drawPixel(ctx, cx + 5, cy + 2, p); drawPixel(ctx, cx + 6, cy + 3, p);
      // Patas delanteras
      drawPixel(ctx, cx - 3, cy + 3, p); drawPixel(ctx, cx + 3, cy + 3, p);
      break;

    case 'jellyfish':
      // Campana
      ctx.fillStyle = color;
      for (let x = cx - 5; x <= cx + 5; x++) {
        const h = Math.max(0, 5 - Math.abs(x - cx));
        for (let y = cy - h; y <= cy; y++) {
          drawPixel(ctx, x, y, p);
        }
      }
      // Tentaculos
      ctx.fillStyle = lightColor;
      for (let i = -4; i <= 4; i += 2) {
        for (let j = 1; j < 7; j++) {
          drawPixel(ctx, cx + i, cy + j + (j % 2 === 0 ? 0 : (i > 0 ? 1 : -1)), p);
        }
      }
      // Ojos
      ctx.fillStyle = '#FFF';
      drawPixel(ctx, cx - 2, cy - 2, p); drawPixel(ctx, cx + 2, cy - 2, p);
      ctx.fillStyle = '#000';
      drawPixel(ctx, cx - 1, cy - 2, p); drawPixel(ctx, cx + 1, cy - 2, p);
      break;

    case 'penguin':
      // Cuerpo
      ctx.fillStyle = '#111';
      for (let x = cx - 3; x <= cx + 3; x++) {
        for (let y = cy - 4; y <= cy + 3; y++) {
          drawPixel(ctx, x, y, p);
        }
      }
      // Panza blanca
      ctx.fillStyle = '#F5F5F5';
      for (let x = cx - 2; x <= cx + 2; x++) {
        for (let y = cy - 2; y <= cy + 2; y++) {
          drawPixel(ctx, x, y, p);
        }
      }
      // Cabeza
      ctx.fillStyle = '#111';
      for (let x = cx - 3; x <= cx + 3; x++) {
        for (let y = cy - 7; y <= cy - 4; y++) {
          drawPixel(ctx, x, y, p);
        }
      }
      // Ojos
      ctx.fillStyle = '#FFF';
      drawPixel(ctx, cx - 1, cy - 6, p); drawPixel(ctx, cx + 1, cy - 6, p);
      // Pico
      ctx.fillStyle = '#FFD700';
      drawPixel(ctx, cx, cy - 5, p);
      // Aletas
      ctx.fillStyle = '#222';
      drawPixel(ctx, cx - 4, cy - 2, p); drawPixel(ctx, cx + 4, cy - 2, p);
      drawPixel(ctx, cx - 4, cy - 1, p); drawPixel(ctx, cx + 4, cy - 1, p);
      // Patas
      ctx.fillStyle = '#FFD700';
      drawPixel(ctx, cx - 2, cy + 4, p); drawPixel(ctx, cx + 2, cy + 4, p);
      break;

    case 'seal':
      // Cuerpo
      ctx.fillStyle = color;
      for (let x = cx - 6; x <= cx + 4; x++) {
        const w = Math.max(0, 3 - Math.abs(x - cx + 1) * 0.3);
        for (let y = cy - Math.floor(w); y <= cy + Math.floor(w); y++) {
          drawPixel(ctx, x, y, p);
        }
      }
      // Cabeza
      ctx.fillStyle = lightColor;
      for (let x = cx + 4; x <= cx + 8; x++) {
        for (let y = cy - 3; y <= cy + 1; y++) {
          drawPixel(ctx, x, y, p);
        }
      }
      // Ojo
      ctx.fillStyle = '#000';
      drawPixel(ctx, cx + 6, cy - 2, p);
      // Nariz
      ctx.fillStyle = '#333';
      drawPixel(ctx, cx + 8, cy - 1, p);
      // Bigotes
      ctx.fillStyle = '#666';
      drawPixel(ctx, cx + 9, cy, p); drawPixel(ctx, cx + 9, cy - 2, p);
      // Aleta trasera
      ctx.fillStyle = darkColor;
      drawPixel(ctx, cx - 7, cy - 1, p); drawPixel(ctx, cx - 7, cy + 1, p);
      drawPixel(ctx, cx - 8, cy - 2, p); drawPixel(ctx, cx - 8, cy + 2, p);
      // Aletas
      drawPixel(ctx, cx + 2, cy + 3, p); drawPixel(ctx, cx + 3, cy + 3, p);
      break;

    case 'lizard':
      // Cuerpo
      ctx.fillStyle = color;
      for (let x = cx - 4; x <= cx + 4; x++) {
        drawPixel(ctx, x, cy, p);
        drawPixel(ctx, x, cy + 1, p);
      }
      // Cabeza
      ctx.fillStyle = lightColor;
      for (let x = cx + 4; x <= cx + 7; x++) {
        for (let y = cy - 1; y <= cy + 1; y++) drawPixel(ctx, x, y, p);
      }
      // Patas
      ctx.fillStyle = darkColor;
      drawPixel(ctx, cx - 2, cy + 2, p); drawPixel(ctx, cx - 2, cy + 3, p);
      drawPixel(ctx, cx + 2, cy + 2, p); drawPixel(ctx, cx + 2, cy + 3, p);
      drawPixel(ctx, cx - 2, cy - 1, p); drawPixel(ctx, cx + 2, cy - 1, p);
      // Cola
      ctx.fillStyle = darkColor;
      for (let i = 0; i < 5; i++) drawPixel(ctx, cx - 5 - i, cy + 1, p);
      // Ojo
      ctx.fillStyle = '#000';
      drawPixel(ctx, cx + 6, cy - 1, p);
      break;

    case 'insect':
      // Cuerpo
      ctx.fillStyle = color;
      for (let x = cx - 2; x <= cx + 2; x++) {
        drawPixel(ctx, x, cy, p);
        drawPixel(ctx, x, cy + 1, p);
      }
      // Cabeza
      ctx.fillStyle = darkColor;
      drawPixel(ctx, cx + 3, cy, p); drawPixel(ctx, cx + 3, cy + 1, p);
      drawPixel(ctx, cx + 4, cy, p);
      // Alas
      ctx.fillStyle = 'rgba(200,200,255,0.7)';
      for (let i = 0; i < 4; i++) {
        drawPixel(ctx, cx - 1 + i, cy - 2, p);
        drawPixel(ctx, cx - 1 + i, cy - 3, p);
      }
      // Patas
      ctx.fillStyle = '#333';
      drawPixel(ctx, cx - 1, cy + 2, p); drawPixel(ctx, cx, cy + 2, p); drawPixel(ctx, cx + 1, cy + 2, p);
      // Brillo (luciernaga)
      if (pattern.glow) {
        ctx.fillStyle = '#FFFF00';
        drawPixel(ctx, cx - 2, cy + 1, p); drawPixel(ctx, cx - 3, cy + 1, p);
        ctx.fillStyle = 'rgba(255,255,0,0.5)';
        drawPixel(ctx, cx - 3, cy, p); drawPixel(ctx, cx - 3, cy + 2, p);
        drawPixel(ctx, cx - 4, cy + 1, p);
      }
      // Ojos
      ctx.fillStyle = '#000';
      drawPixel(ctx, cx + 4, cy, p);
      // Antenas
      ctx.fillStyle = '#333';
      drawPixel(ctx, cx + 4, cy - 1, p); drawPixel(ctx, cx + 5, cy - 2, p);
      break;

    default:
      // Generico
      ctx.fillStyle = color;
      for (let x = cx - 4; x <= cx + 4; x++) {
        for (let y = cy - 4; y <= cy + 4; y++) {
          drawPixel(ctx, x, y, p);
        }
      }
      ctx.fillStyle = '#000';
      drawPixel(ctx, cx + 2, cy - 2, p);
      break;
  }
}

export function generateAnimalSprite(scene, animal, key) {
  const canvas = document.createElement('canvas');
  canvas.width = SPRITE_SIZE;
  canvas.height = SPRITE_SIZE;
  const ctx = canvas.getContext('2d');

  const pattern = BODY_PATTERNS[animal.name] || { body: 'quadruped' };
  drawBody(ctx, pattern, animal.color, SPRITE_SIZE);

  if (scene.textures.exists(key)) {
    scene.textures.remove(key);
  }
  scene.textures.addCanvas(key, canvas);
  return key;
}

// Genera sprite para el jugador (humano)
export function generatePlayerSprite(scene) {
  const frames = ['player_down', 'player_up', 'player_left', 'player_right'];
  const directions = [
    { dx: 0, dy: 1 },  // down
    { dx: 0, dy: -1 }, // up
    { dx: -1, dy: 0 }, // left
    { dx: 1, dy: 0 },  // right
  ];

  frames.forEach((key, i) => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const cx = 16;
    const cy = 16;
    const dir = directions[i];

    // Cuerpo
    ctx.fillStyle = '#3366CC';
    ctx.fillRect(cx - 5, cy - 2, 10, 10);

    // Cabeza
    ctx.fillStyle = '#FFCC99';
    ctx.fillRect(cx - 4, cy - 8, 8, 7);

    // Pelo
    ctx.fillStyle = '#4A2800';
    ctx.fillRect(cx - 4, cy - 9, 8, 3);

    // Ojos
    ctx.fillStyle = '#000';
    if (i === 0) { // down
      ctx.fillRect(cx - 2, cy - 5, 2, 2);
      ctx.fillRect(cx + 1, cy - 5, 2, 2);
    } else if (i === 1) { // up - no eyes visible
    } else if (i === 2) { // left
      ctx.fillRect(cx - 3, cy - 5, 2, 2);
    } else { // right
      ctx.fillRect(cx + 2, cy - 5, 2, 2);
    }

    // Piernas
    ctx.fillStyle = '#222';
    ctx.fillRect(cx - 4, cy + 8, 3, 5);
    ctx.fillRect(cx + 1, cy + 8, 3, 5);

    // Zapatos
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(cx - 5, cy + 12, 4, 2);
    ctx.fillRect(cx + 1, cy + 12, 4, 2);

    if (scene.textures.exists(key)) scene.textures.remove(key);
    scene.textures.addCanvas(key, canvas);
  });
}

// Genera sprite de NPC
export function generateNPCSprite(scene, id, hairColor, shirtColor) {
  const key = `npc_${id}`;
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const cx = 16;
  const cy = 16;

  // Cuerpo
  ctx.fillStyle = shirtColor;
  ctx.fillRect(cx - 5, cy - 2, 10, 10);

  // Cabeza
  ctx.fillStyle = '#FFCC99';
  ctx.fillRect(cx - 4, cy - 8, 8, 7);

  // Pelo
  ctx.fillStyle = hairColor;
  ctx.fillRect(cx - 4, cy - 9, 8, 3);

  // Ojos
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - 2, cy - 5, 2, 2);
  ctx.fillRect(cx + 1, cy - 5, 2, 2);

  // Piernas
  ctx.fillStyle = '#333';
  ctx.fillRect(cx - 4, cy + 8, 3, 5);
  ctx.fillRect(cx + 1, cy + 8, 3, 5);

  // Zapatos
  ctx.fillStyle = '#444';
  ctx.fillRect(cx - 5, cy + 12, 4, 2);
  ctx.fillRect(cx + 1, cy + 12, 4, 2);

  if (scene.textures.exists(key)) scene.textures.remove(key);
  scene.textures.addCanvas(key, canvas);
  return key;
}

// Genera tiles para el mapa
export function generateTilesets(scene) {
  const tiles = {
    grass: '#4A8C2A',
    grass_dark: '#3A7A1A',
    path: '#C4A46C',
    path_edge: '#B09060',
    water: '#2266AA',
    water_light: '#3388CC',
    tree_trunk: '#6B4226',
    tree_top: '#2D6B1E',
    house_wall: '#D4A46C',
    house_roof: '#8B2020',
    house_door: '#654321',
    flower_red: '#FF4444',
    flower_yellow: '#FFDD44',
    flower_blue: '#4488FF',
    fence: '#8B6914',
    rock: '#888888',
    tall_grass: '#3A9C1A',
  };

  Object.entries(tiles).forEach(([name, color]) => {
    const key = `tile_${name}`;
    const canvas = document.createElement('canvas');
    canvas.width = TILE_SIZE;
    canvas.height = TILE_SIZE;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

    // Add texture/detail
    switch (name) {
      case 'grass':
      case 'grass_dark':
        ctx.fillStyle = lighten(color, 1.15);
        for (let i = 0; i < 5; i++) {
          const gx = Math.random() * 28 + 2;
          const gy = Math.random() * 28 + 2;
          ctx.fillRect(gx, gy, 1, 3);
        }
        break;
      case 'tall_grass':
        ctx.fillStyle = lighten(color, 1.2);
        for (let i = 0; i < 8; i++) {
          const gx = Math.random() * 28 + 2;
          const gy = Math.random() * 20 + 2;
          ctx.fillRect(gx, gy, 2, 6);
        }
        ctx.fillStyle = darken(color, 0.8);
        for (let i = 0; i < 4; i++) {
          const gx = Math.random() * 28 + 2;
          ctx.fillRect(gx, 4, 1, 8);
        }
        break;
      case 'path':
      case 'path_edge':
        ctx.fillStyle = darken(color, 0.9);
        for (let i = 0; i < 6; i++) {
          ctx.fillRect(Math.random() * 30, Math.random() * 30, 3, 2);
        }
        break;
      case 'water':
      case 'water_light':
        ctx.fillStyle = lighten(color, 1.2);
        ctx.fillRect(4, 10, 8, 1);
        ctx.fillRect(18, 20, 10, 1);
        break;
      case 'tree_trunk':
        ctx.fillStyle = darken(color, 0.8);
        ctx.fillRect(12, 0, 8, 32);
        ctx.fillStyle = color;
        ctx.fillRect(14, 0, 4, 32);
        break;
      case 'tree_top':
        // circular canopy
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = lighten(color, 1.3);
        ctx.fillRect(4, 4, 10, 10);
        ctx.fillRect(16, 8, 8, 8);
        ctx.fillStyle = darken(color, 0.7);
        ctx.fillRect(2, 20, 12, 6);
        break;
      case 'house_wall':
        ctx.fillStyle = darken(color, 0.95);
        for (let y = 0; y < 32; y += 8) {
          ctx.fillRect(0, y, 32, 1);
        }
        break;
      case 'house_roof':
        ctx.fillStyle = darken(color, 0.8);
        ctx.fillRect(0, 28, 32, 4);
        ctx.fillStyle = lighten(color, 1.2);
        ctx.fillRect(4, 4, 24, 4);
        break;
      case 'house_door':
        ctx.fillStyle = lighten(color, 1.2);
        ctx.fillRect(10, 4, 12, 24);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(18, 16, 3, 3);
        break;
      case 'rock':
        ctx.fillStyle = darken(color, 0.8);
        ctx.fillRect(4, 8, 24, 20);
        ctx.fillStyle = lighten(color, 1.2);
        ctx.fillRect(8, 4, 16, 8);
        break;
      case 'fence':
        ctx.fillStyle = 'transparent';
        ctx.clearRect(0, 0, 32, 32);
        ctx.fillStyle = color;
        ctx.fillRect(2, 8, 4, 20);
        ctx.fillRect(26, 8, 4, 20);
        ctx.fillRect(0, 10, 32, 4);
        ctx.fillRect(0, 20, 32, 4);
        break;
    }

    if (scene.textures.exists(key)) scene.textures.remove(key);
    scene.textures.addCanvas(key, canvas);
  });
}

// Genera sprite de pokebola (captura)
export function generateCaptureBall(scene) {
  const key = 'capture_ball';
  const canvas = document.createElement('canvas');
  canvas.width = 24;
  canvas.height = 24;
  const ctx = canvas.getContext('2d');

  // Parte superior roja
  ctx.fillStyle = '#DD2222';
  ctx.beginPath();
  ctx.arc(12, 12, 10, Math.PI, 0);
  ctx.fill();

  // Parte inferior blanca
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(12, 12, 10, 0, Math.PI);
  ctx.fill();

  // Linea central
  ctx.fillStyle = '#333';
  ctx.fillRect(2, 11, 20, 2);

  // Boton central
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(12, 12, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(12, 12, 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(12, 12, 2, 0, Math.PI * 2);
  ctx.fill();

  if (scene.textures.exists(key)) scene.textures.remove(key);
  scene.textures.addCanvas(key, canvas);
}
