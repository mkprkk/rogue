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
    this.hallsSize = obstacles.halls.size;

    this.cells = Array(this.rows * this.cols).fill(this.wallType);
    this.roomRects = [];
  }

  generate() {
    this.createRandomRooms();
    this.createRandomHalls();
    this.connectAllRooms();
    
    // Гарантируем, что все области соединены
    this.ensureAllAreasConnected();
    
    return this.cells;
  }

  ensureAllAreasConnected() {
    const areas = this.findAllEmptyAreas();
    if (areas.length > 1) {
      this.connectAreas(areas);
    }
  }

  findAllEmptyAreas() {
    const visited = new Array(this.rows * this.cols).fill(false);
    const areas = [];
    
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const idx = y * this.cols + x;
        if (this.cells[idx] === this.groundType && !visited[idx]) {
          const area = this.floodFill(x, y, visited);
          areas.push(area);
        }
      }
    }
    
    return areas;
  }

  floodFill(startX, startY, visited) {
    const area = [];
    const queue = [{x: startX, y: startY}];
    const directions = [
      {dx: 1, dy: 0},
      {dx: -1, dy: 0},
      {dx: 0, dy: 1},
      {dx: 0, dy: -1}
    ];
    
    while (queue.length > 0) {
      const {x, y} = queue.shift();
      const idx = y * this.cols + x;
      
      if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) continue;
      if (visited[idx] || this.cells[idx] !== this.groundType) continue;
      
      visited[idx] = true;
      area.push({x, y});
      
      for (const dir of directions) {
        queue.push({x: x + dir.dx, y: y + dir.dy});
      }
    }
    
    return area;
  }

  connectAreas(areas) {
    // Находим ближайшие точки между областями и соединяем их
    for (let i = 1; i < areas.length; i++) {
      const area1 = areas[0]; // Главная область
      const area2 = areas[i]; // Область для соединения
      
      let closestPair = null;
      let minDistance = Infinity;
      
      // Ищем ближайшую пару точек между областями
      for (const p1 of area1) {
        for (const p2 of area2) {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = dx * dx + dy * dy; // Квадрат расстояния для оптимизации
          
          if (dist < minDistance) {
            minDistance = dist;
            closestPair = {p1, p2};
          }
        }
      }
      
      // Соединяем области
      if (closestPair) {
        this.connectPoints(closestPair.p1, closestPair.p2);
      }
    }
  }

  connectPoints(p1, p2) {
    // Соединяем две точки L-образным коридором
    const midX = p1.x;
    const midY = p2.y;
    
    // Горизонтальная часть
    const startX = Math.min(p1.x, midX);
    const endX = Math.max(p1.x, midX);
    for (let x = startX; x <= endX; x++) {
      const idx = p1.y * this.cols + x;
      this.cells[idx] = this.groundType;
    }
    
    // Вертикальная часть
    const startY = Math.min(midY, p2.y);
    const endY = Math.max(midY, p2.y);
    for (let y = startY; y <= endY; y++) {
      const idx = y * this.cols + midX;
      this.cells[idx] = this.groundType;
    }
  }

  // Остальные методы остаются без изменений
  createRandomHalls() {
    const [minHalls, maxHalls] = this.hallsRange;
    const hallCount = Math.floor(Math.random() * (maxHalls - minHalls + 1)) + minHalls;
    
    const horizontalHalls = Math.floor(Math.random() * hallCount);
    const verticalHalls = hallCount - horizontalHalls;

    for (let i = 0; i < horizontalHalls; i++) {
      this.createHorizontalHall();
    }

    for (let i = 0; i < verticalHalls; i++) {
      this.createVerticalHall();
    }
  }

  createHorizontalHall() {
    const y = Math.floor(Math.random() * this.rows);
    const hallWidth = this.getRandomHallSize();
    
    const minY = Math.max(0, y - Math.floor(hallWidth / 2));
    const maxY = Math.min(this.rows - 1, y + Math.floor(hallWidth / 2));
    
    for (let row = minY; row <= maxY; row++) {
      for (let col = 0; col < this.cols; col++) {
        const idx = row * this.cols + col;
        this.cells[idx] = this.groundType;
      }
    }
  }

  createVerticalHall() {
    const x = Math.floor(Math.random() * this.cols);
    const hallWidth = this.getRandomHallSize();
    
    const minX = Math.max(0, x - Math.floor(hallWidth / 2));
    const maxX = Math.min(this.cols - 1, x + Math.floor(hallWidth / 2));
    
    for (let col = minX; col <= maxX; col++) {
      for (let row = 0; row < this.rows; row++) {
        const idx = row * this.cols + col;
        this.cells[idx] = this.groundType;
      }
    }
  }

  getRandomHallSize() {
    return this.hallsSize[Math.floor(Math.random() * this.hallsSize.length)];
  }

  createRandomRooms() {
    const [minRooms, maxRooms] = this.roomsRange;
    const roomCount =
      Math.floor(Math.random() * (maxRooms - minRooms + 1)) + minRooms;
    const [minSize, maxSize] = this.roomsSize;

    for (let i = 0; i < roomCount; i++) {
      const width =
        Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
      const height =
        Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;

      let validPosition = false;
      let attempts = 0;
      let left, top, right, bottom;

      while (!validPosition && attempts < 100) {
        left = Math.floor(Math.random() * (this.cols - width));
        top = Math.floor(Math.random() * (this.rows - height));
        right = left + width - 1;
        bottom = top + height - 1;

        validPosition = !this.roomRects.some(
          (rect) =>
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
        this.cells[idx] = this.groundType;
      }
    }
  }

  connectAllRooms() {
    if (this.roomRects.length < 2) return;

    const centers = this.roomRects.map((r) => ({
      x: Math.floor((r.left + r.right) / 2),
      y: Math.floor((r.top + r.bottom) / 2),
      rect: r,
    }));

    let edges = [];
    for (let i = 0; i < centers.length; i++) {
      for (let j = i + 1; j < centers.length; j++) {
        const dx = centers[i].x - centers[j].x;
        const dy = centers[i].y - centers[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        edges.push({ i, j, dist });
      }
    }

    edges.sort((a, b) => a.dist - b.dist);

    const parent = Array(centers.length)
      .fill(0)
      .map((_, i) => i);
    const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    const unite = (a, b) => {
      parent[find(a)] = find(b);
    };

    let connections = [];
    for (const e of edges) {
      if (find(e.i) !== find(e.j)) {
        unite(e.i, e.j);
        connections.push([centers[e.i], centers[e.j]]);
      }
    }

    for (let k = 0; k < Math.floor(centers.length / 3); k++) {
      const r1 = centers[Math.floor(Math.random() * centers.length)];
      const r2 = centers[Math.floor(Math.random() * centers.length)];
      if (r1 !== r2) {
        connections.push([r1, r2]);
      }
    }

    for (const [c1, c2] of connections) {
      this.connectCenters(c1, c2);
    }
  }

  connectCenters(center1, center2) {
    const startX = Math.min(center1.x, center2.x);
    const endX = Math.max(center1.x, center2.x);
    for (let x = startX; x <= endX; x++) {
      const idx = center1.y * this.cols + x;
      this.cells[idx] = this.groundType;
    }
    
    const startY = Math.min(center1.y, center2.y);
    const endY = Math.max(center1.y, center2.y);
    for (let y = startY; y <= endY; y++) {
      const idx = y * this.cols + center2.x;
      this.cells[idx] = this.groundType;
    }
  }
}