const sprites = {
  ground: "tile",
  enemy: "tileE",
  healthPotion: "tileHP",
  player: "tileP",
  sword: "tileSW",
  wall: "tileW",
  health: "health",
};

const stats = {
  level: document.querySelector(".level"),
  healthLevel: document.querySelector(".health-level"),
  damageLevel: document.querySelector(".damage-level"),
};

class FieldView {
  constructor(field, fieldElementSelector = ".field") {
    this.field = field;
    this.fieldElement = document.querySelector(fieldElementSelector);
    this.cellElements = [];
    this.render();
  }

  render() {
    this.fieldElement.innerHTML = "";
    this.setFieldSize();
    this.setFieldGrid();

    const fragment = document.createDocumentFragment();
    this.cellElements = [];

    for (let i = 0; i < this.field.cells.length; i++) {
      const cellData = this.field.cells[i];
      const cell = document.createElement("div");
      const size = this.field.getCellSize();
      cell.style.width = `${size.width}px`;
      cell.style.height = `${size.height}px`;
      cell.classList.add(sprites[cellData.type] || sprites.ground);
      fragment.appendChild(cell);
      this.cellElements.push(cell);
    }

    this.fieldElement.appendChild(fragment);
  }

  setFieldSize() {
    this.fieldElement.style.width = `${this.field.width}px`;
    this.fieldElement.style.height = `${this.field.height}px`;
  }

  setFieldGrid() {
    this.fieldElement.style.display = "grid";
    this.fieldElement.style.gridTemplateColumns = `repeat(${this.field.cols}, ${
      this.field.getCellSize().width
    }px)`;
    this.fieldElement.style.gridTemplateRows = `repeat(${this.field.rows}, ${
      this.field.getCellSize().height
    }px)`;
  }
}

class EntityView {
  constructor(entity, cellElements, spriteClass, cols) {
    this.entity = entity;
    this.cellElements = cellElements;
    this.spriteClass = spriteClass;
    this.cols = cols;
    this.element = document.createElement("div");
    this.element.classList.add(spriteClass);
    this.render();
  }

  render() {
    this.cellElements.forEach(
      (cell) => cell.contains(this.element) && cell.removeChild(this.element)
    );
    const idx = this.entity.position.y * this.cols + this.entity.position.x;
    const cell = this.cellElements[idx];
    if (cell) {
      cell.appendChild(this.element);
    }
  }

  updatePosition() {
    this.render();
  }

  removeEntityView() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

class PlayerView extends EntityView {
  constructor(entity, cellElements, spriteClass, cols) {
    super(entity, cellElements, spriteClass, cols);
    const healthBar = document.createElement("div");
    healthBar.classList.add("health");
    this.element.append(healthBar);
    this.healthBar = healthBar;

    this.entity.observer.subscribe("getDamage", (data) => {
      this.healthView(data.health, data.maxHealth);
    });
    this.entity.observer.subscribe("die", () => {
      this.healthBar.style.display = "none";
      this.removeEntityView();
    });

    this.healthView(entity.health, entity.maxHealth);
  }

  healthView(health, maxHealth) {
    const healthPercentage = (health / maxHealth) * 100;
    this.healthBar.style.width = `${healthPercentage}%`;
  }
}
