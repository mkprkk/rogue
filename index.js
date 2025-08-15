class Field {
  constructor(width, height, cols, rows, groundSprite) {
    this.width = width;
    this.height = height;
    this.cols = cols;
    this.rows = rows;
    this.groundSprite = groundSprite;
    this.fieldElement = document.querySelector(".field");

    this.initialize();
  }

  getCellSize() {
    return {
      width: this.width / this.cols,
      height: this.height / this.rows,
    };
  }

  createCell() {
    const cell = document.createElement("div");
    const size = this.getCellSize();
    cell.style.width = `${size.width}px`;
    cell.style.height = `${size.height}px`;
    return cell;
  }

  setFieldSize() {
    this.fieldElement.style.width = `${this.width}px`;
    this.fieldElement.style.height = `${this.height}px`;
  }

  setFieldGrid() {
    this.fieldElement.style.display = "grid";
    this.fieldElement.style.gridTemplateColumns = `repeat(${this.cols}, ${
      this.getCellSize().width
    }px)`;
    this.fieldElement.style.gridTemplateRows = `repeat(${this.rows}, ${
      this.getCellSize().height
    }px)`;
  }

  fillGround() {
    this.fieldElement.innerHTML = "";
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < this.rows * this.cols; i++) {
      const cell = this.createCell();
      cell.classList.add(this.groundSprite);
      fragment.appendChild(cell);
    }

    this.fieldElement.appendChild(fragment);
  }

  initialize() {
    this.setFieldSize();
    this.setFieldGrid();
    this.fillGround();
  }
}

const sprites = {
  ground: "tile",
  enemy: "tileE",
  health: "tileHP",
  player: "tileP",
  sword: "tileSW",
  wall: "tileW",
};

const variables = {
  cols: "--cols",
  rows: "--rows",
};

const gameField = new Field(1024, 640, 40, 24, sprites.ground);
