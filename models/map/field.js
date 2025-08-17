class Field {
  constructor(settings, mapGeneratorClass) {
    this.width = settings.width;
    this.height = settings.height;
    this.cols = settings.cols;
    this.rows = settings.rows;

    const mapGenerator = new mapGeneratorClass(settings);
    this.cells = mapGenerator.generate();
  }

  getCellSize() {
    return {
      width: Math.floor(this.width / this.cols),
      height: Math.floor(this.height / this.rows),
    };
  }
}
