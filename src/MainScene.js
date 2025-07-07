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

// 건물 디자인 상수 (마름모 기둥)
const BUILDING_TOP_COLOR = 0xFF6B6B;     // 밝은 빨간색 (상면)
const BUILDING_SIDE_COLOR = 0xCC5555;    // 어두운 빨간색 (측면)
const BUILDING_HEIGHT = 30;             // 기둥 높이

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.cameras.main.setBackgroundColor(SCENE_BACKGROUND_COLOR);
  }

  create() {
    this.renderMap();
    this.setupMouseTracking();
  }

  setupMouseTracking() {
    // 마우스 위치 저장 변수
    this.mouseX = 0;
    this.mouseY = 0;
    this.currentGridCol = -1;
    this.currentGridRow = -1;
    this.buildingPreview = null;
    this.placedBuildings = []; // 배치된 건물들을 저장하는 배열
    
    // 마우스 움직임 이벤트 리스너
    this.input.on('pointermove', (pointer) => {
      this.mouseX = pointer.x;
      this.mouseY = pointer.y;
      this.updateGridPosition();
      this.updateBuildingPreview();
    });
    
    // 마우스 클릭 이벤트 리스너
    this.input.on('pointerdown', (pointer) => {
      this.placeBuildingAtCurrentPosition();
    });
  }

  // 마우스 위치를 격자 좌표로 변환
  updateGridPosition() {
    const gridPos = this.screenToGrid(this.mouseX, this.mouseY);
    this.currentGridCol = gridPos.col;
    this.currentGridRow = gridPos.row;
  }

  // 건물 미리보기 업데이트
  updateBuildingPreview() {
    // 기존 미리보기 제거
    if (this.buildingPreview) {
      this.buildingPreview.building.destroy();
      this.buildingPreview = null;
    }
    
    // 유효한 격자 위치이고 해당 위치에 건물이 없는 경우에만 미리보기 표시
    if (this.isValidGridPosition(this.currentGridCol, this.currentGridRow) &&
        !this.isBuildingAt(this.currentGridCol, this.currentGridRow)) {
      this.buildingPreview = this.renderBuilding(this.currentGridCol, this.currentGridRow);
      // 미리보기는 반투명하게
      this.buildingPreview.building.setAlpha(0.7);
    }
  }

  // 유효한 격자 위치인지 확인
  isValidGridPosition(col, row) {
    return col >= 0 && col < mapData[0].length && 
           row >= 0 && row < mapData.length;
  }

  // 현재 위치에 건물 배치
  placeBuildingAtCurrentPosition() {
    // 유효한 위치이고 해당 위치에 건물이 없는 경우만 배치
    if (this.isValidGridPosition(this.currentGridCol, this.currentGridRow) && 
        !this.isBuildingAt(this.currentGridCol, this.currentGridRow)) {
      
      // 영구 건물 생성 (알파값 1.0으로 불투명)
      const building = this.renderBuilding(this.currentGridCol, this.currentGridRow);
      building.building.setAlpha(1.0);
      
      // 배치된 건물 목록에 추가
      this.placedBuildings.push({
        col: this.currentGridCol,
        row: this.currentGridRow,
        building: building
      });
    }
  }

  // 특정 위치에 건물이 있는지 확인
  isBuildingAt(col, row) {
    return this.placedBuildings.some(placed => 
      placed.col === col && placed.row === row
    );
  }

  // 화면 좌표를 격자 좌표로 변환 (아이소메트릭 역변환)
  screenToGrid(screenX, screenY) {
    // 화면 중앙 오프셋 제거
    const x = screenX - MAP_CENTER_X;
    const y = screenY - MAP_CENTER_Y;
    
    // 아이소메트릭 역변환
    const col = Math.floor((x / ISO_TILE_HALF_WIDTH + y / ISO_TILE_HALF_HEIGHT) / 2);
    const row = Math.floor((y / ISO_TILE_HALF_HEIGHT - x / ISO_TILE_HALF_WIDTH) / 2);
    
    return { col, row };
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

  renderBuilding(col, row) {
    const { x, y } = this.toIsometric(col, row);
    const screenX = x + MAP_CENTER_X;
    const screenY = y + MAP_CENTER_Y;
    
    // 간단한 빨간 마름모 타일
    const building = this.add.polygon(screenX, screenY, [
      0, -ISO_TILE_HALF_HEIGHT,      // 상단
      ISO_TILE_HALF_WIDTH, 0,        // 우측
      0, ISO_TILE_HALF_HEIGHT,       // 하단
      -ISO_TILE_HALF_WIDTH, 0        // 좌측
    ], BUILDING_TOP_COLOR);
    
    building.setStrokeStyle(TILE_BORDER_WIDTH, BUILDING_SIDE_COLOR);
    
    return { building };
  }
}
