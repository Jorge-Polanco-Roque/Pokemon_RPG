# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pokemon-style RPG where all Pokemon are replaced by real animals. Browser-based game with at least 25 unique animals, procedurally generated assets (sprites, music, sound effects), and a populated overworld with NPCs that challenge the player to battles.

## Key Requirements

- **Framework**: Choose the best game framework for a browser-based RPG (e.g., Phaser.js, PixiJS)
- **All assets generated**: No external asset files — sprites, music, and sound effects must be generated programmatically at runtime
- **25+ unique animals** as the creature roster, each with distinct stats and moves
- **Populated world**: Dense map with roaming NPCs that can challenge the player
- **Main menu** with game entry screen
- **On-start instructions**: Controls and mission displayed when starting a new game
- **Locally hosted**: Must run in the browser via a local dev server
- **Language**: The original prompt is in mixed English/Spanish; the developer prefers Spanish

## Architecture Guidelines

- Structure the project professionally with clear separation of concerns (engine, scenes, entities, data, assets generation)
- Use a scene-based architecture: MainMenu, Instructions, Overworld, Battle
- Keep animal/creature data in a dedicated data module for easy expansion
- Asset generation (sprites, audio) should be encapsulated in its own module/service

## Technical Stack (Implemented)

- **Framework**: Phaser.js 3.90 (arcade physics)
- **Bundler**: Vite 5.4
- **Language**: JavaScript ES Modules
- **Dev server**: `npm run dev` (Vite, port 3000)

## Project Structure

```
src/
  main.js              - Phaser game config and scene registration
  data/
    animals.js         - 28 animals, moves, types, damage calc, type chart
  assets/
    SpriteGenerator.js - Canvas API pixel art for animals, player, NPCs, tiles
    AudioGenerator.js  - Web Audio API music (menu/overworld/battle) and SFX
  scenes/
    BootScene.js       - Asset generation with progress bar
    MainMenuScene.js   - Title screen with animated background
    InstructionsScene.js - Controls and mission briefing
    OverworldScene.js  - 60x50 tile map, 25 NPCs, encounters, collision
    BattleScene.js     - Turn-based combat, capture, switch, XP/level system
```

## Key Technical Decisions

- **All assets runtime-generated**: Canvas API for sprites (pixel art), Web Audio API for music/SFX
- **28 unique animals** across 9 types (Fuego, Agua, Planta, Electrico, Tierra, Volador, Normal, Hielo, Veneno)
- **Type effectiveness chart** with super effective (2x), not effective (0.5x), immune (0x)
- **Procedural map**: 60x50 tiles with paths, lakes, rivers, houses, forests, tall grass zones
- **25 NPCs** with 1-3 animals each, scaling difficulty
- **Player state persists** between scenes via scene data passing
- **Encounter system**: ~3% chance per movement frame in tall grass

## Development

- `npm install` then `npm run dev` to start
- Use Playwright MCP for automated testing when available
- Ensure the game is fully functional and bug-free before delivering
- Game runs at http://localhost:3000
