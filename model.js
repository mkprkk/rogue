class Field {
  constructor(width = 1024, height = 640, cols = 40, rows = 24) {
    this.width = width;
    this.height = height;
    this.cols = cols;
    this.rows = rows;
    this.cells = Array.from({ length: rows * cols }, () => ({
      type: "grd",
    }));
  }

  getCellSize() {
    return {
      width: this.width / this.cols,
      height: this.height / this.rows,
    };
  }
}

class Entity {
  static entities = [];

  constructor(field, zIndex = 0) {
    this.field = field;
    this.position = { x: 0, y: 0 };
    this.zIndex = zIndex;
    Entity.entities.push(this);
  }

  placeEntity(x, y) {
    const newX = ((x % this.field.cols) + this.field.cols) % this.field.cols;
    const newY = ((y % this.field.rows) + this.field.rows) % this.field.rows;

    const occupant = Entity.entities.find(
      (entity) =>
        entity !== this &&
        entity.position.x === newX &&
        entity.position.y === newY
    );

    if (occupant && this.zIndex <= occupant.zIndex) {
      return false;
    }

    this.position.x = newX;
    this.position.y = newY;
    return true;
  }

  moveTo(delta) {
    return this.placeEntity(
      this.position.x + delta.x,
      this.position.y + delta.y
    );
  }

  removeEntity() {
    Entity.entities = Entity.entities.filter((entity) => entity !== this);
  }
}

class Collectable extends Entity {
  constructor(name, power, field, zIndex) {
    super(field, zIndex);
    this.name = name;
    this.power = power;
  }
  pickUp(player) {
    if (
      player.position.x === this.position.x &&
      player.position.y === this.position.y
    ) {
      this.apply(player);
    }
  }
  apply(player) {
    throw new Error("Метод apply должен быть реализован в наследнике!");
  }
}

class SwordBuff extends Collectable {
  constructor() {
    super("Sword", 25);
  }
  apply(player) {
    player.damage += this.power;
    const applySword = new CustomEvent("applySword");
  }
}

class HealthBuff extends Collectable {
  constructor() {
    super("Health Potion", 25);
  }
  apply(player) {
    player.health += this.power;
    const applyHealthPotion = new CustomEvent("applyHealthPotion");
  }
}

class Player extends Entity {
  constructor(health, damage, field) {
    super(field, 10);
    this.health = health;
    this.maxHealth = health;
    this.damage = damage;
    this.isAlive = true;
    this.lastMoveTime = 0;
    this.moveDelay = 250;
    this.observer = new Observer();
  }

  isAdjacent(target) {
    const distX = Math.min(
      Math.abs(this.position.x - target.position.x),
      this.field.cols - Math.abs(this.position.x - target.position.x)
    );
    const distY = Math.min(
      Math.abs(this.position.y - target.position.y),
      this.field.rows - Math.abs(this.position.y - target.position.y)
    );
    return (distX === 1 && distY === 0) || (distY === 1 && distX === 0);
  }

  moveTo(direction) {
    this.placeEntity(
      this.position.x + direction.x,
      this.position.y + direction.y
    );
  }

  isAdjacentAlivePlayer(player) {
    return (
      player instanceof Player && player.isAlive && this.isAdjacent(player)
    );
  }

  attack(target) {
    if (this.isAdjacentAlivePlayer(target)) {
      target.getDamage(this.damage);
      this.observer.notify("attack", { target });
    }
  }

  getDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) {
      this.die();
    }
    this.observer.notify("getDamage", {
      health: this.health,
      maxHealth: this.maxHealth,
    });
  }

  die() {
    this.isAlive = false;
    this.removeEntity();
    this.observer.notify("die");
  }
}

class Bot extends Player {
  constructor(player, field) {
    super(100, 15, field);
    this.player = player;
    this.field = field;
    this.moveDelay = 700;
    this.intervalId = null;
    this.startInterval();
  }

  startInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(() => {
      if (!this.isAlive) return;
      if (this.detectPlayer(this.player)) {
        this.attackPlayer(this.player);
      } else {
        this.autoMove();
      }
    }, this.moveDelay);
  }

  detectPlayer(player) {
    if (!player.isAlive) return;
    this.moveDelay = 250;
    this.startInterval();

    const distX = Math.min(
      Math.abs(this.position.x - player.position.x),
      this.field.cols - Math.abs(this.position.x - player.position.x)
    );
    const distY = Math.min(
      Math.abs(this.position.y - player.position.y),
      this.field.rows - Math.abs(this.position.y - player.position.y)
    );

    const playerDetected = new CustomEvent("playerDetected");
    console.log(this.moveDelay);
    return distX <= 7 && distY <= 7;
  }

  attackPlayer(player) {
    if (!player.isAlive) return;
    if (this.isAdjacent(player)) {
      this.attack(player);
    } else {
      let dx = player.position.x - this.position.x;
      let dy = player.position.y - this.position.y;

      if (Math.abs(dx) > this.field.cols / 2) {
        dx = dx > 0 ? dx - this.field.cols : dx + this.field.cols;
      }
      if (Math.abs(dy) > this.field.rows / 2) {
        dy = dy > 0 ? dy - this.field.rows : dy + this.field.rows;
      }

      const moveX = dx !== 0 ? dx / Math.abs(dx) : 0;
      const moveY = dy !== 0 ? dy / Math.abs(dy) : 0;
      this.moveTo({ x: moveX, y: moveY });
    }
  }

  isAdjacent(player) {
    if (!player.isAlive) return;
    const distX = Math.min(
      Math.abs(this.position.x - player.position.x),
      this.field.cols - Math.abs(this.position.x - player.position.x)
    );
    const distY = Math.min(
      Math.abs(this.position.y - player.position.y),
      this.field.rows - Math.abs(this.position.y - player.position.y)
    );
    return distX <= 1 && distY <= 1;
  }

  autoMove() {
    this.moveDelay = 700;
    this.startInterval();
    const dx = Math.floor(Math.random() * 3) - 1;
    const dy = Math.floor(Math.random() * 3) - 1;
    this.moveTo({ x: dx, y: dy });
  }

  die() {
    super.die();
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

class HumanPlayer extends Player {
  constructor(field) {
    super(150000, 20, field);
    this.moveDelay = 190;
  }

  restrictActionByDelay() {
    const currentTime = Date.now();
    if (currentTime - this.lastMoveTime < this.moveDelay) {
      return false;
    }
    this.lastMoveTime = currentTime;
    return true;
  }

  moveTo(key) {
    if (!this.isAlive) return;
    this.restrictActionByDelay();

    const directions = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
    };

    if (directions[key]) {
      super.moveTo(directions[key]);
      this.lastMoveTime = currentTime;
    }
  }

  attackKey(key) {
    if (!this.isAlive) return;
    if (key !== " ") return;
    this.restrictActionByDelay();
    const target = Entity.entities.find(
      (player) => player !== this && this.isAdjacentAlivePlayer(player)
    );

    if (target) {
      this.attack(target);
      this.lastMoveTime = currentTime;
    }
  }
}

class Observer {
  constructor() {
    this.observers = new Map();
  }

  subscribe(eventType, callback) {
    if (!this.observers.has(eventType)) {
      this.observers.set(eventType, []);
    }
    this.observers.get(eventType).push(callback);
  }

  unsubscribe(eventType, callback) {
    if (this.observers.has(eventType)) {
      const callbacks = this.observers.get(eventType);
      this.observers.set(
        eventType,
        callbacks.filter((cb) => cb !== callback)
      );
    }
  }

  notify(eventType, data) {
    if (this.observers.has(eventType)) {
      this.observers.get(eventType).forEach((callback) => callback(data));
    }
  }
}

// class MapGenerator {
//   constructor() {
//     this.roomsRange = [5, 10];
//     this.roomsSize = [3, 8];
//     this.wallSprite = wallSprite;
//   }
//   getRandomCells() {
//     const [min, max] = this.roomsRange;
//     const count = Math.floor(Math.random() * (max - min + 1)) + min;
//     const cellsCopy = [...this.cells];
//     const selected = [];

//     for (let i = 0; i < count && cellsCopy.length > 0; i++) {
//       const idx = Math.floor(Math.random() * cellsCopy.length);
//       selected.push(cellsCopy[idx]);
//       cellsCopy.splice(idx, 1);
//     }

//     return selected;
//   }

//   createRandomRooms() {
//     const [minSize, maxSize] = this.roomsSize;
//     const centers = this.getRandomCells();
//     const rooms = [];
//     const roomRects = []; // Храним координаты комнат

//     centers.forEach((center) => {
//       const centerIdx = this.cells.indexOf(center);
//       const col = centerIdx % this.cols;
//       const row = Math.floor(centerIdx / this.cols);

//       const roomWidth =
//         Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
//       const roomHeight =
//         Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;

//       const left = Math.max(0, col - Math.floor(roomWidth / 2));
//       const top = Math.max(0, row - Math.floor(roomHeight / 2));
//       const right = Math.min(this.cols - 1, left + roomWidth - 1);
//       const bottom = Math.min(this.rows - 1, top + roomHeight - 1);

//       // Проверка на пересечение с уже созданными комнатами
//       let intersects = false;
//       for (const rect of roomRects) {
//         if (
//           left <= rect.right &&
//           right >= rect.left &&
//           top <= rect.bottom &&
//           bottom >= rect.top
//         ) {
//           intersects = true;
//           break;
//         }
//       }
//       if (intersects) return; // Пропускаем пересекающуюся комнату

//       // Если не пересекается, добавляем координаты
//       roomRects.push({ left, right, top, bottom });

//       const roomCells = [];
//       for (let r = top; r <= bottom; r++) {
//         for (let c = left; c <= right; c++) {
//           const idx = r * this.cols + c;
//           const cell = this.cells[idx];

//           if (r === top || r === bottom || c === left || c === right) {
//             cell.classList.add(this.wallSprite);
//           }
//           roomCells.push(cell);
//         }
//       }
//       rooms.push(roomCells);
//     });

//     return rooms;
//   }
// }
