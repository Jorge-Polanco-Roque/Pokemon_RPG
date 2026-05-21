// Tipos de elementos
export const TYPES = {
  FUEGO: 'Fuego',
  AGUA: 'Agua',
  PLANTA: 'Planta',
  ELECTRICO: 'Electrico',
  TIERRA: 'Tierra',
  VOLADOR: 'Volador',
  NORMAL: 'Normal',
  HIELO: 'Hielo',
  VENENO: 'Veneno'
};

// Tabla de efectividad de tipos (atacante -> defensor -> multiplicador)
export const TYPE_CHART = {
  [TYPES.FUEGO]:     { [TYPES.PLANTA]: 2, [TYPES.HIELO]: 2, [TYPES.AGUA]: 0.5, [TYPES.FUEGO]: 0.5, [TYPES.TIERRA]: 0.5 },
  [TYPES.AGUA]:      { [TYPES.FUEGO]: 2, [TYPES.TIERRA]: 2, [TYPES.PLANTA]: 0.5, [TYPES.AGUA]: 0.5, [TYPES.ELECTRICO]: 0.5 },
  [TYPES.PLANTA]:    { [TYPES.AGUA]: 2, [TYPES.TIERRA]: 2, [TYPES.FUEGO]: 0.5, [TYPES.VOLADOR]: 0.5, [TYPES.VENENO]: 0.5 },
  [TYPES.ELECTRICO]: { [TYPES.AGUA]: 2, [TYPES.VOLADOR]: 2, [TYPES.TIERRA]: 0, [TYPES.ELECTRICO]: 0.5, [TYPES.PLANTA]: 0.5 },
  [TYPES.TIERRA]:    { [TYPES.FUEGO]: 2, [TYPES.ELECTRICO]: 2, [TYPES.VENENO]: 2, [TYPES.VOLADOR]: 0, [TYPES.PLANTA]: 0.5 },
  [TYPES.VOLADOR]:   { [TYPES.PLANTA]: 2, [TYPES.VENENO]: 2, [TYPES.ELECTRICO]: 0.5, [TYPES.TIERRA]: 2 },
  [TYPES.NORMAL]:    { },
  [TYPES.HIELO]:     { [TYPES.PLANTA]: 2, [TYPES.VOLADOR]: 2, [TYPES.TIERRA]: 2, [TYPES.FUEGO]: 0.5, [TYPES.AGUA]: 0.5, [TYPES.HIELO]: 0.5 },
  [TYPES.VENENO]:    { [TYPES.PLANTA]: 2, [TYPES.TIERRA]: 0.5, [TYPES.VENENO]: 0.5 }
};

export function getTypeMultiplier(attackType, defenderType) {
  const chart = TYPE_CHART[attackType];
  if (!chart) return 1;
  return chart[defenderType] ?? 1;
}

// Definicion de movimientos
export const MOVES = {
  // Fuego
  llamarada:    { name: 'Llamarada',    type: TYPES.FUEGO,     power: 40, accuracy: 100, pp: 25, description: 'Lanza una llamarada' },
  inferno:      { name: 'Inferno',      type: TYPES.FUEGO,     power: 70, accuracy: 85,  pp: 10, description: 'Fuego infernal' },
  ascuas:       { name: 'Ascuas',       type: TYPES.FUEGO,     power: 30, accuracy: 100, pp: 30, description: 'Pequenas brasas' },
  // Agua
  chorro_agua:  { name: 'Chorro Agua',  type: TYPES.AGUA,      power: 40, accuracy: 100, pp: 25, description: 'Dispara agua a presion' },
  maremoto:     { name: 'Maremoto',     type: TYPES.AGUA,      power: 75, accuracy: 80,  pp: 8,  description: 'Ola gigante' },
  burbuja:      { name: 'Burbuja',      type: TYPES.AGUA,      power: 25, accuracy: 100, pp: 30, description: 'Burbujas de agua' },
  // Planta
  latigo_cepa:  { name: 'Latigo Cepa',  type: TYPES.PLANTA,    power: 40, accuracy: 100, pp: 25, description: 'Golpe con lianas' },
  hoja_afilada: { name: 'Hoja Afilada', type: TYPES.PLANTA,    power: 55, accuracy: 95,  pp: 15, description: 'Hojas cortantes' },
  drenadoras:   { name: 'Drenadoras',   type: TYPES.PLANTA,    power: 35, accuracy: 90,  pp: 20, description: 'Drena vida del rival' },
  // Electrico
  impactrueno:  { name: 'Impactrueno',  type: TYPES.ELECTRICO, power: 40, accuracy: 100, pp: 25, description: 'Descarga electrica' },
  rayo:         { name: 'Rayo',         type: TYPES.ELECTRICO, power: 70, accuracy: 85,  pp: 10, description: 'Rayo potente' },
  chispa:       { name: 'Chispa',       type: TYPES.ELECTRICO, power: 30, accuracy: 100, pp: 30, description: 'Pequena chispa' },
  // Tierra
  terremoto:    { name: 'Terremoto',    type: TYPES.TIERRA,    power: 70, accuracy: 85,  pp: 10, description: 'Sacude la tierra' },
  excavar:      { name: 'Excavar',      type: TYPES.TIERRA,    power: 50, accuracy: 95,  pp: 15, description: 'Ataca desde bajo tierra' },
  lodo:         { name: 'Lodo',         type: TYPES.TIERRA,    power: 35, accuracy: 100, pp: 25, description: 'Lanza lodo' },
  // Volador
  tornado:      { name: 'Tornado',      type: TYPES.VOLADOR,   power: 40, accuracy: 100, pp: 25, description: 'Rafaga de viento' },
  vuelo:        { name: 'Vuelo',        type: TYPES.VOLADOR,   power: 65, accuracy: 90,  pp: 12, description: 'Ataque aereo' },
  picotazo:     { name: 'Picotazo',     type: TYPES.VOLADOR,   power: 30, accuracy: 100, pp: 30, description: 'Golpe con pico' },
  // Normal
  placaje:      { name: 'Placaje',      type: TYPES.NORMAL,    power: 35, accuracy: 100, pp: 30, description: 'Embestida basica' },
  golpe:        { name: 'Golpe',        type: TYPES.NORMAL,    power: 50, accuracy: 95,  pp: 20, description: 'Golpe fuerte' },
  aranazo:      { name: 'Aranazo',      type: TYPES.NORMAL,    power: 30, accuracy: 100, pp: 30, description: 'Aranazo rapido' },
  mordisco:     { name: 'Mordisco',     type: TYPES.NORMAL,    power: 45, accuracy: 100, pp: 25, description: 'Mordida potente' },
  cabezazo:     { name: 'Cabezazo',     type: TYPES.NORMAL,    power: 55, accuracy: 90,  pp: 15, description: 'Golpe con la cabeza' },
  cola_ferrea:  { name: 'Cola Ferrea',  type: TYPES.NORMAL,    power: 60, accuracy: 85,  pp: 12, description: 'Golpe de cola' },
  rugido:       { name: 'Rugido',       type: TYPES.NORMAL,    power: 0,  accuracy: 100, pp: 20, description: 'Baja ataque rival', effect: 'lower_atk' },
  // Hielo
  rayo_hielo:   { name: 'Rayo Hielo',   type: TYPES.HIELO,     power: 65, accuracy: 90,  pp: 12, description: 'Rayo congelante' },
  ventisca:     { name: 'Ventisca',     type: TYPES.HIELO,     power: 50, accuracy: 95,  pp: 15, description: 'Viento helado' },
  granizo:      { name: 'Granizo',      type: TYPES.HIELO,     power: 35, accuracy: 100, pp: 25, description: 'Piedras de hielo' },
  // Veneno
  toxico:       { name: 'Toxico',       type: TYPES.VENENO,    power: 0,  accuracy: 90,  pp: 10, description: 'Envenena al rival', effect: 'poison' },
  picadura:     { name: 'Picadura',     type: TYPES.VENENO,    power: 40, accuracy: 100, pp: 25, description: 'Picadura venenosa' },
  acido:        { name: 'Acido',        type: TYPES.VENENO,    power: 50, accuracy: 95,  pp: 15, description: 'Acido corrosivo' },
};

// 28 animales unicos
export const ANIMALS = [
  // FUEGO
  { id: 1,  name: 'Leon',       type: TYPES.FUEGO,     hp: 85, atk: 80, def: 55, spd: 70, moves: ['llamarada', 'mordisco', 'rugido', 'inferno'],      color: '#D4A017', desc: 'Rey de la sabana, feroz y valiente' },
  { id: 2,  name: 'Fenix-Ave',  type: TYPES.FUEGO,     hp: 70, atk: 85, def: 45, spd: 90, moves: ['inferno', 'tornado', 'ascuas', 'vuelo'],            color: '#FF4500', desc: 'Ave mitologica renacida del fuego' },
  { id: 3,  name: 'Salamandra', type: TYPES.FUEGO,     hp: 60, atk: 65, def: 60, spd: 55, moves: ['ascuas', 'llamarada', 'placaje', 'lodo'],           color: '#FF6347', desc: 'Lagartija que vive entre las llamas' },
  // AGUA
  { id: 4,  name: 'Delfin',     type: TYPES.AGUA,      hp: 75, atk: 65, def: 60, spd: 85, moves: ['chorro_agua', 'cabezazo', 'maremoto', 'placaje'],   color: '#4169E1', desc: 'Inteligente y veloz en el agua' },
  { id: 5,  name: 'Tiburon',    type: TYPES.AGUA,      hp: 90, atk: 90, def: 50, spd: 65, moves: ['maremoto', 'mordisco', 'chorro_agua', 'golpe'],     color: '#1C3A5F', desc: 'Depredador implacable del oceano' },
  { id: 6,  name: 'Nutria',     type: TYPES.AGUA,      hp: 65, atk: 55, def: 55, spd: 75, moves: ['burbuja', 'chorro_agua', 'aranazo', 'placaje'],     color: '#8B6914', desc: 'Juguetona y astuta en los rios' },
  // PLANTA
  { id: 7,  name: 'Oso Panda',  type: TYPES.PLANTA,    hp: 95, atk: 70, def: 70, spd: 35, moves: ['latigo_cepa', 'golpe', 'hoja_afilada', 'placaje'], color: '#2E8B57', desc: 'Gigante pacifico del bambu' },
  { id: 8,  name: 'Ciervo',     type: TYPES.PLANTA,    hp: 70, atk: 60, def: 55, spd: 80, moves: ['hoja_afilada', 'cabezazo', 'latigo_cepa', 'placaje'], color: '#6B8E23', desc: 'Elegante guardian del bosque' },
  { id: 9,  name: 'Tortuga',    type: TYPES.PLANTA,    hp: 100, atk: 50, def: 90, spd: 20, moves: ['drenadoras', 'latigo_cepa', 'placaje', 'cabezazo'], color: '#228B22', desc: 'Lenta pero con defensa impenetrable' },
  // ELECTRICO
  { id: 10, name: 'Anguila',    type: TYPES.ELECTRICO, hp: 65, atk: 80, def: 45, spd: 85, moves: ['impactrueno', 'rayo', 'chorro_agua', 'placaje'],    color: '#FFD700', desc: 'Genera electricidad en el agua' },
  { id: 11, name: 'Guepardo',   type: TYPES.ELECTRICO, hp: 60, atk: 75, def: 40, spd: 95, moves: ['chispa', 'impactrueno', 'aranazo', 'rayo'],         color: '#FFA500', desc: 'Rapido como un relampago' },
  { id: 12, name: 'Luciernaga', type: TYPES.ELECTRICO, hp: 45, atk: 55, def: 35, spd: 90, moves: ['chispa', 'impactrueno', 'tornado', 'picotazo'],     color: '#FFFF00', desc: 'Brilla con energia electrica' },
  // TIERRA
  { id: 13, name: 'Rinoceronte',type: TYPES.TIERRA,    hp: 95, atk: 85, def: 80, spd: 30, moves: ['terremoto', 'cabezazo', 'excavar', 'golpe'],        color: '#808080', desc: 'Blindado natural, embiste sin piedad' },
  { id: 14, name: 'Topo',       type: TYPES.TIERRA,    hp: 55, atk: 60, def: 60, spd: 65, moves: ['excavar', 'lodo', 'aranazo', 'placaje'],             color: '#8B4513', desc: 'Experto en tuneles subterraneos' },
  { id: 15, name: 'Jabali',     type: TYPES.TIERRA,    hp: 80, atk: 75, def: 65, spd: 55, moves: ['terremoto', 'mordisco', 'lodo', 'cabezazo'],         color: '#654321', desc: 'Fiero habitante del bosque' },
  // VOLADOR
  { id: 16, name: 'Aguila',     type: TYPES.VOLADOR,   hp: 70, atk: 80, def: 50, spd: 90, moves: ['vuelo', 'tornado', 'aranazo', 'picotazo'],           color: '#DAA520', desc: 'Vision aguda y garras letales' },
  { id: 17, name: 'Murcielago', type: TYPES.VOLADOR,   hp: 55, atk: 60, def: 45, spd: 85, moves: ['tornado', 'mordisco', 'picotazo', 'toxico'],         color: '#4B0082', desc: 'Cazador nocturno con sonar' },
  { id: 18, name: 'Colibri',    type: TYPES.VOLADOR,   hp: 40, atk: 50, def: 35, spd: 95, moves: ['picotazo', 'tornado', 'chispa', 'drenadoras'],       color: '#00CED1', desc: 'Diminuto pero increiblemente agil' },
  // NORMAL
  { id: 19, name: 'Lobo',       type: TYPES.NORMAL,    hp: 80, atk: 75, def: 60, spd: 70, moves: ['mordisco', 'golpe', 'rugido', 'cabezazo'],           color: '#708090', desc: 'Lider de la manada, leal y fuerte' },
  { id: 20, name: 'Oso',        type: TYPES.NORMAL,    hp: 100, atk: 85, def: 65, spd: 40, moves: ['golpe', 'mordisco', 'aranazo', 'cola_ferrea'],       color: '#8B4513', desc: 'Fuerza bruta de la montanna' },
  { id: 21, name: 'Zorro',      type: TYPES.NORMAL,    hp: 60, atk: 55, def: 45, spd: 85, moves: ['aranazo', 'mordisco', 'placaje', 'picadura'],         color: '#FF8C00', desc: 'Astuto y escurridizo' },
  // HIELO
  { id: 22, name: 'Pingüino',   type: TYPES.HIELO,     hp: 75, atk: 60, def: 70, spd: 50, moves: ['rayo_hielo', 'burbuja', 'ventisca', 'placaje'],      color: '#B0E0E6', desc: 'Resistente al frio extremo' },
  { id: 23, name: 'Oso Polar',  type: TYPES.HIELO,     hp: 95, atk: 80, def: 70, spd: 35, moves: ['ventisca', 'golpe', 'rayo_hielo', 'mordisco'],       color: '#F0F8FF', desc: 'Gigante del artico' },
  { id: 24, name: 'Foca',       type: TYPES.HIELO,     hp: 80, atk: 55, def: 65, spd: 55, moves: ['granizo', 'chorro_agua', 'cabezazo', 'ventisca'],     color: '#ADD8E6', desc: 'Juguetona en aguas heladas' },
  // VENENO
  { id: 25, name: 'Serpiente',  type: TYPES.VENENO,    hp: 65, atk: 75, def: 50, spd: 80, moves: ['picadura', 'toxico', 'mordisco', 'acido'],            color: '#9932CC', desc: 'Sigilosa y mortal' },
  { id: 26, name: 'Escorpion',  type: TYPES.VENENO,    hp: 60, atk: 70, def: 65, spd: 60, moves: ['picadura', 'acido', 'aranazo', 'toxico'],             color: '#800020', desc: 'Pinza y aguijon letales' },
  { id: 27, name: 'Rana',       type: TYPES.VENENO,    hp: 50, atk: 60, def: 40, spd: 75, moves: ['toxico', 'burbuja', 'picadura', 'placaje'],            color: '#00FF7F', desc: 'Pequena pero muy toxica' },
  { id: 28, name: 'Medusa',     type: TYPES.VENENO,    hp: 55, atk: 65, def: 45, spd: 70, moves: ['toxico', 'acido', 'chorro_agua', 'picadura'],          color: '#DA70D6', desc: 'Tentaculos urticantes del mar' },
];

// Nombres para NPCs
export const NPC_NAMES = [
  'Carlos', 'Maria', 'Pedro', 'Ana', 'Luis', 'Sofia', 'Diego', 'Elena',
  'Miguel', 'Laura', 'Javier', 'Carmen', 'Roberto', 'Isabel', 'Fernando',
  'Rosa', 'Andres', 'Paula', 'Sergio', 'Lucia', 'Pablo', 'Marta',
  'Raul', 'Diana', 'Hugo'
];

// Obtener animal aleatorio
export function getRandomAnimal(minLevel = 1, maxLevel = 10) {
  const template = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const level = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
  return createAnimalInstance(template, level);
}

// Crear instancia de animal con nivel
export function createAnimalInstance(template, level) {
  const levelMult = 1 + (level - 1) * 0.12;
  const hp = Math.floor(template.hp * levelMult);
  return {
    ...template,
    level,
    maxHp: hp,
    currentHp: hp,
    atk: Math.floor(template.atk * levelMult),
    def: Math.floor(template.def * levelMult),
    spd: Math.floor(template.spd * levelMult),
    exp: 0,
    expToNext: level * 25,
    moveSet: template.moves.map(m => ({ ...MOVES[m], currentPp: MOVES[m].pp })),
    isWild: false,
    statusEffect: null
  };
}

// Calcular danno
export function calculateDamage(attacker, defender, move) {
  if (move.power === 0) return 0;
  const typeMultiplier = getTypeMultiplier(move.type, defender.type);
  const stab = move.type === attacker.type ? 1.5 : 1;
  const random = 0.85 + Math.random() * 0.15;
  const base = ((2 * attacker.level / 5 + 2) * move.power * (attacker.atk / defender.def)) / 50 + 2;
  return Math.max(1, Math.floor(base * typeMultiplier * stab * random));
}
