class Field {
  constructor(settings, mapGeneratorClass) {  
    this.settings = settings.field;
    this.width = this.settings.width;
    this.height = this.settings.height;
    this.cols = this.settings.cols;
    this.rows = this.settings.rows;
    
    this.cells = [];
    
    if (mapGeneratorClass) {
      const mapGenerator = new mapGeneratorClass(settings);
      this.cells = mapGenerator.generate();
    }
  }

  getCellSize() {
    return {
      width: this.width / this.cols,
      height: this.height / this.rows,
    };
  }
}