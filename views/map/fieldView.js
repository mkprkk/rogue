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