import { tileTypes, mapData } from './mapData.js';

// 맵 중앙 좌표
const MAP_CENTER_X = 400;
const MAP_CENTER_Y = 200;

// 타일 크기
const TILE_SIZE = 60;
const ISO_TILE_HALF_WIDTH = TILE_SIZE / 2;
const ISO_TILE_HALF_HEIGHT = TILE_SIZE / 4;

// 타일 테두리 상수
const SCENE_BACKGROUND_COLOR = '#2c3e50';
const TILE_BORDER_COLOR = 0x444444;
const TILE_BORDER_WIDTH = 2;

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.cameras.main.setBackgroundColor(SCENE_BACKGROUND_COLOR);
  }

  create() {
    this.renderMap();
  }

  renderMap() {
    mapData.forEach((rowData, row) => {
      rowData.forEach((tileKey, col) => {
        const tile = tileTypes[tileKey];
        this.drawTile(col, row, tile.color);
      });
    });
  }

  drawTile(col, row, color) {
    const { x, y } = this.toIsometric(col, row);
    const screenX = x + MAP_CENTER_X;
    const screenY = y + MAP_CENTER_Y;
    this.renderTile(screenX, screenY, color);
  }
  
  toIsometric(x, y) {
    const isoX = (x - y) * ISO_TILE_HALF_WIDTH;
    const isoY = (x + y) * ISO_TILE_HALF_HEIGHT;
    return { x: isoX, y: isoY };
  }

  renderTile(x, y, color) {
    // 아이소메트릭 다이아몬드 형태
    const points = [
      0, -ISO_TILE_HALF_HEIGHT,      // 상단
      ISO_TILE_HALF_WIDTH, 0,        // 우측
      0, ISO_TILE_HALF_HEIGHT,       // 하단
      -ISO_TILE_HALF_WIDTH, 0        // 좌측
    ];
    
    const tile = this.add.polygon(x, y, points, color);
    tile.setStrokeStyle(TILE_BORDER_WIDTH, TILE_BORDER_COLOR);
  }
}
