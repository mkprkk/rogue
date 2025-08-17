class Field {
  constructor(settings) {
    this.width = settings.width;
    this.height = settings.height;
    this.cols = settings.cols;
    this.rows = settings.rows;
    this.cells = Array.from({ length: this.rows * this.cols }, () => ({
      type: settings.type,
    }));
  }

  getCellSize() {
    return {
      width: this.width / this.cols,
      height: this.height / this.rows,
    };
  }
}