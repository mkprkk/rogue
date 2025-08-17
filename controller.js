const field = new Field();
const fieldView = new FieldView(field);

const player = new HumanPlayer(field);
player.placeEntity(0, 0);

const bots = [];
const botViews = [];

function createBots(count) {
  for (let i = 0; i < count; i++) {
    const bot = new Bot(player, field);
    const x = Math.floor(Math.random() * field.cols);
    const y = Math.floor(Math.random() * field.rows);
    bot.placeEntity(x, y);

    const botView = new PlayerView(
      bot,
      fieldView.cellElements,
      sprites.enemy,
      field.cols
    );

    bots.push(bot);
    botViews.push(botView);
  }
}

createBots(5);

const playerView = new PlayerView(
  player,
  fieldView.cellElements,
  sprites.player,
  field.cols
);

document.addEventListener("keydown", (e) => {
  e.preventDefault();
  player.moveTo(e.key);
  player.attackKey(e.key);
});

setInterval(() => {
  if (player.isAlive) {
    playerView.updatePosition();
  }
  botViews.forEach((botView, index) => {
    if (bots[index].isAlive) {
      botView.updatePosition();
    }
  });
}, 16);
