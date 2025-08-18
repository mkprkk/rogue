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
    this.ensureAllAreasConnected();
    return this.cells;
  }

  // ======================= Flood Fill =======================
  ensureAllAreasConnected() {
    const areas = this.findAllEmptyAreas();
    if (areas.length > 1) this.connectAreas(areas);
  }

  findAllEmptyAreas() {
    const visited = new Array(this.rows * this.cols).fill(false);
    const areas = [];

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const idx = y * this.cols + x;
        if (this.cells[idx] === this.groundType && !visited[idx]) {
          areas.push(this.floodFill(x, y, visited));
        }
      }
    }
    return areas;
  }

  floodFill(startX, startY, visited) {
    const area = [];
    const queue = [{ x: startX, y: startY }];
    const directions = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];

    while (queue.length) {
      const { x, y } = queue.shift();
      if (!this.isInside(x, y)) continue;

      const idx = y * this.cols + x;
      if (visited[idx] || this.cells[idx] !== this.groundType) continue;

      visited[idx] = true;
      area.push({ x, y });

      directions.forEach((dir) => queue.push({ x: x + dir.dx, y: y + dir.dy }));
    }

    return area;
  }

  // ======================= Rooms =======================
  createRandomRooms() {
    const [minRooms, maxRooms] = this.roomsRange;
    const roomCount = this.randomInt(minRooms, maxRooms);
    const [minSize, maxSize] = this.roomsSize;

    for (let i = 0; i < roomCount; i++) {
      let valid = false;
      let attempts = 0;
      let rect;

      while (!valid && attempts < 100) {
        const width = this.randomInt(minSize, maxSize);
        const height = this.randomInt(minSize, maxSize);
        const left = this.randomInt(0, this.cols - width);
        const top = this.randomInt(0, this.rows - height);
        const right = left + width - 1;
        const bottom = top + height - 1;

        rect = { left, top, right, bottom };
        valid = !this.roomRects.some(
          (r) =>
            left <= r.right + 1 &&
            right >= r.left - 1 &&
            top <= r.bottom + 1 &&
            bottom >= r.top - 1
        );
        attempts++;
      }

      if (valid) {
        this.roomRects.push(rect);
        this.fillRect(rect);
      }
    }
  }

  fillRect({ left, top, right, bottom }) {
    for (let y = top; y <= bottom; y++) {
      for (let x = left; x <= right; x++) {
        this.cells[y * this.cols + x] = this.groundType;
      }
    }
  }

  // ======================= Halls =======================
  createRandomHalls() {
    const [minHalls, maxHalls] = this.hallsRange;
    const hallCount = this.randomInt(minHalls, maxHalls);
    const horizontalHalls = this.randomInt(0, hallCount);
    const verticalHalls = hallCount - horizontalHalls;

    for (let i = 0; i < horizontalHalls; i++) this.createHall(true);
    for (let i = 0; i < verticalHalls; i++) this.createHall(false);
  }

  createHall(horizontal = true) {
    const mid = horizontal
      ? this.randomInt(0, this.rows - 1)
      : this.randomInt(0, this.cols - 1);
    const size =
      this.hallsSize[Math.floor(Math.random() * this.hallsSize.length)];
    const start = Math.max(0, mid - Math.floor(size / 2));
    const end = horizontal
      ? Math.min(this.rows - 1, mid + Math.floor(size / 2))
      : Math.min(this.cols - 1, mid + Math.floor(size / 2));

    if (horizontal) {
      for (let y = start; y <= end; y++) {
        for (let x = 0; x < this.cols; x++)
          this.cells[y * this.cols + x] = this.groundType;
      }
    } else {
      for (let x = start; x <= end; x++) {
        for (let y = 0; y < this.rows; y++)
          this.cells[y * this.cols + x] = this.groundType;
      }
    }
  }

  // ======================= Connect Rooms & Points =======================
  connectAllRooms() {
    if (!this.roomRects.length) return;

    const centers = this.roomRects.map((r) => ({
      x: Math.floor((r.left + r.right) / 2),
      y: Math.floor((r.top + r.bottom) / 2),
      rect: r,
    }));

    // MST для соединения всех комнат
    const edges = [];
    for (let i = 0; i < centers.length; i++) {
      for (let j = i + 1; j < centers.length; j++) {
        const dx = centers[i].x - centers[j].x;
        const dy = centers[i].y - centers[j].y;
        edges.push({ i, j, dist: Math.sqrt(dx * dx + dy * dy) });
      }
    }
    edges.sort((a, b) => a.dist - b.dist);

    const parent = centers.map((_, i) => i);
    const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    const unite = (a, b) => (parent[find(a)] = find(b));

    for (const e of edges) {
      if (find(e.i) !== find(e.j)) {
        this.connectPoints(centers[e.i], centers[e.j]);
        unite(e.i, e.j);
      }
    }

    this.roomRects.forEach((room) => this.connectRoomToHalls(room));
  }

  connectRoomToHalls(room) {
    const center = {
      x: Math.floor((room.left + room.right) / 2),
      y: Math.floor((room.top + room.bottom) / 2),
    };
    let closest = null;
    let minDist = Infinity;

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.cells[y * this.cols + x] === this.groundType) {
          const dx = x - center.x;
          const dy = y - center.y;
          const dist = dx * dx + dy * dy;
          if (dist < minDist) {
            minDist = dist;
            closest = { x, y };
          }
        }
      }
    }
    if (closest) this.connectPoints(center, closest);
  }

  connectPoints(p1, p2) {
    this.drawLine(p1.x, p1.y, p2.x, p1.y);
    this.drawLine(p2.x, p1.y, p2.x, p2.y);
  }

  drawLine(x1, y1, x2, y2) {
    const [sx, ex] = x1 < x2 ? [x1, x2] : [x2, x1];
    const [sy, ey] = y1 < y2 ? [y1, y2] : [y2, y1];

    for (let x = sx; x <= ex; x++)
      this.cells[y1 * this.cols + x] = this.groundType;
    for (let y = sy; y <= ey; y++)
      this.cells[y * this.cols + x2] = this.groundType;
  }

  // ======================= Utility =======================
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  isInside(x, y) {
    return x >= 0 && x < this.cols && y >= 0 && y < this.rows;
  }
}
