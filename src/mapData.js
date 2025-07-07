// 타일 색상 상수
const TILE_WALL_COLOR = 0x8B4513;
const TILE_FLOOR_COLOR = 0x90EE90;

export const tileTypes = {
  W: { name: '벽', color: TILE_WALL_COLOR, walkable: false },
  F: { name: '평지', color: TILE_FLOOR_COLOR, walkable: true }
};

export const mapData = [
  ['W', 'W', 'W', 'W', 'W'],
  ['W', 'F', 'F', 'F', 'W'],
  ['W', 'F', 'W', 'F', 'W'],
  ['W', 'F', 'F', 'F', 'W'],
  ['W', 'W', 'W', 'W', 'W']
]; 
