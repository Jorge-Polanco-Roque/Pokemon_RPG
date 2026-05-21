# Animal Quest RPG

RPG por turnos estilo Pokemon donde todos los personajes son animales reales. Desarrollado con **Phaser.js 3** y assets generados completamente en runtime (sprites pixel art, musica y efectos de sonido). Sin archivos externos de arte ni audio.

![Phaser](https://img.shields.io/badge/Phaser-3.90-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)
![JavaScript](https://img.shields.io/badge/JavaScript-ES%20Modules-yellow)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Caracteristicas

- **28 animales unicos** distribuidos en 9 tipos elementales
- **Sprites pixel art** generados con Canvas API
- **Musica y SFX** sintetizados con Web Audio API
- **Mapa procedural** de 60x50 tiles con lagos, rios, bosques, casas y caminos
- **25 NPCs** con equipos propios y dificultad progresiva
- **Sistema de batalla por turnos** con tabla de efectividad de tipos
- **Captura de animales salvajes** en zonas de hierba alta
- **Sistema de experiencia y niveles** con mejora de stats
- **Efectos de estado**: veneno, reduccion de ataque

## Tipos Elementales

| Tipo | Fuerte contra | Debil contra |
|------|---------------|--------------|
| Fuego | Planta, Hielo | Agua, Tierra |
| Agua | Fuego, Tierra | Planta, Electrico |
| Planta | Agua, Tierra | Fuego, Volador, Veneno |
| Electrico | Agua, Volador | Tierra (inmune) |
| Tierra | Fuego, Electrico, Veneno | Volador (inmune), Planta |
| Volador | Planta, Veneno | Electrico |
| Hielo | Planta, Volador, Tierra | Fuego, Agua |
| Veneno | Planta | Tierra |
| Normal | — | — |

## Inicio Rapido

```bash
# Clonar el repositorio
git clone https://github.com/Jorge-Polanco-Roque/Pokemon_RPG.git
cd Pokemon_RPG

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El juego se abrira automaticamente en http://localhost:3000.

## Controles

| Tecla | Accion |
|-------|--------|
| `Flechas` / `WASD` | Mover al personaje |
| `Enter` / `Space` | Interactuar / Confirmar |
| `1` - `4` | Seleccionar movimiento en batalla |
| `C` | Intentar capturar (solo animales salvajes) |
| `T` | Cambiar animal en batalla |
| `ESC` | Cancelar |

## Estructura del Proyecto

```
src/
├── main.js                  # Configuracion de Phaser y registro de escenas
├── data/
│   └── animals.js           # Roster de 28 animales, movimientos, tipos y calculo de daño
├── assets/
│   ├── SpriteGenerator.js   # Generacion de sprites pixel art (Canvas API)
│   └── AudioGenerator.js    # Sintesis de musica y SFX (Web Audio API)
└── scenes/
    ├── BootScene.js          # Carga y generacion de assets con barra de progreso
    ├── MainMenuScene.js      # Pantalla de titulo
    ├── InstructionsScene.js  # Controles y mision
    ├── OverworldScene.js     # Mapa, NPCs, colisiones y encuentros
    └── BattleScene.js        # Combate por turnos, captura, XP y niveles
```

## Stack Tecnologico

| Componente | Tecnologia |
|------------|-----------|
| Motor de juego | Phaser.js 3.90 (Arcade Physics) |
| Bundler | Vite 5.4 |
| Sprites | Canvas API (pixel art procedural) |
| Audio | Web Audio API (sintesis de ondas) |
| Lenguaje | JavaScript ES Modules |

## Scripts

```bash
npm run dev      # Servidor de desarrollo con hot reload
npm run build    # Build de produccion en dist/
npm run preview  # Preview del build de produccion
```

---

Desarrollado con Phaser.js y generacion procedural de assets.
