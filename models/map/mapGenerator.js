




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


