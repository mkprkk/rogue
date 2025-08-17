class MapGenerator {
  constructor(settings) {
    const { field, obstacles } = settings;
    this.rows = field.rows;
    this.cols = field.cols;
    this.wallType = obstacles.type;
    this.groundType = field.type;
    
    this.roomsRange = obstacles.rooms.range;
    this.roomsSize = obstacles.rooms.size;
    this.hallsRange = obstacles.halls.range;
    
    this.cells = Array(this.rows * this.cols).fill(this.groundType);
    this.roomRects = [];
  }

  generate() {
    this.createRandomRooms();
    this.createRandomHalls();
    this.removeBorderWalls();
    return this.cells;
  }

  createRandomRooms() {
    const [minRooms, maxRooms] = this.roomsRange;
    const roomCount = Math.floor(Math.random() * (maxRooms - minRooms + 1)) + minRooms;
    const [minSize, maxSize] = this.roomsSize;

    for (let i = 0; i < roomCount; i++) {
      const width = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
      const height = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
      
      let validPosition = false;
      let attempts = 0;
      let left, top, right, bottom;

      while (!validPosition && attempts < 100) {
        left = Math.floor(Math.random() * (this.cols - width));
        top = Math.floor(Math.random() * (this.rows - height));
        right = left + width - 1;
        bottom = top + height - 1;
        
        validPosition = !this.roomRects.some(rect => 
          left <= rect.right + 1 &&
          right >= rect.left - 1 &&
          top <= rect.bottom + 1 &&
          bottom >= rect.top - 1
        );
        attempts++;
      }

      if (validPosition) {
        this.roomRects.push({ left, top, right, bottom });
        this.addRoom(left, top, right, bottom);
      }
    }
  }

  addRoom(left, top, right, bottom) {
    for (let y = top; y <= bottom; y++) {
      for (let x = left; x <= right; x++) {
        const idx = y * this.cols + x;
        if (y === top || y === bottom || x === left || x === right) {
          this.cells[idx] = this.wallType;
        } else {
          this.cells[idx] = this.groundType;
        }
      }
    }
  }

  createRandomHalls() {
    if (this.roomRects.length < 2) return;
    
    const [minHalls, maxHalls] = this.hallsRange;
    const hallCount = Math.floor(Math.random() * (maxHalls - minHalls + 1)) + minHalls;
    
    for (let i = 0; i < hallCount; i++) {
      const room1 = this.roomRects[Math.floor(Math.random() * this.roomRects.length)];
      const room2 = this.roomRects[Math.floor(Math.random() * this.roomRects.length)];
      
      if (room1 !== room2) {
        this.connectRooms(room1, room2);
      }
    }
  }

  connectRooms(room1, room2) {
    const center1 = {
      x: Math.floor((room1.left + room1.right) / 2),
      y: Math.floor((room1.top + room1.bottom) / 2)
    };
    
    const center2 = {
      x: Math.floor((room2.left + room2.right) / 2),
      y: Math.floor((room2.top + room2.bottom) / 2)
    };

    // Горизонтальный коридор
    const startX = Math.min(center1.x, center2.x);
    const endX = Math.max(center1.x, center2.x);
    for (let x = startX; x <= endX; x++) {
      const idx = center1.y * this.cols + x;
      this.cells[idx] = this.groundType;
    }

    // Вертикальный коридор
    const startY = Math.min(center1.y, center2.y);
    const endY = Math.max(center1.y, center2.y);
    for (let y = startY; y <= endY; y++) {
      const idx = y * this.cols + center2.x;
      this.cells[idx] = this.groundType;
    }
  }

  removeBorderWalls() {
    // Верхняя и нижняя границы
    for (let x = 0; x < this.cols; x++) {
      this.cells[x] = this.groundType;
      this.cells[(this.rows - 1) * this.cols + x] = this.groundType;
    }

    // Левая и правая границы
    for (let y = 0; y < this.rows; y++) {
      this.cells[y * this.cols] = this.groundType;
      this.cells[y * this.cols + this.cols - 1] = this.groundType;
    }
  }
}