class CollectableView extends EntityView {
  constructor(entity, canvasContext, spriteImage, cols, cellSize) {
    super(entity, canvasContext, spriteImage, cols, cellSize);
    
    this.entity.observer.subscribe("pickedUp", () => {
      this.entity.onField = false;
    });
  }
}