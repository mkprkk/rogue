class CollectableView extends EntityView {
  constructor(entity, cellElements, spriteClass, cols) {
    super(entity, cellElements, spriteClass, cols);
    const collectableDiv = document.createElement("div");
    collectableDiv.classList.add(entity.name);
    this.element.appendChild(collectableDiv);

    this.entity.observer.subscribe("pickedUp", () => {
      this.removeEntityView();
    });
  }
}