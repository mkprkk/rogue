const sprites = {
  ground: "images/tile-.png",
  enemy: "images/tile-E.png",
  healthPotion: "images/tile-HP.png",
  player: "images/tile-P.png", 
  sword: "images/tile-SW.png",
  wall: "images/tile-W.png",
};

class SpriteLoader {
  constructor() {
    this.images = {};
    this.loaded = false;
  }

   async load(assets) {
    const promises = Object.entries(assets).map(([name, path]) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
          this.images[name] = img;
          resolve();
        };
        img.onerror = () => reject(`Failed to load image: ${path}`);
      });
    });

    return Promise.all(promises).then(() => {
      this.loaded = true;
    });
  }

  getImage(name) {
    if (!this.loaded) throw new Error('Assets not loaded yet');
    return this.images[name];
  }
}