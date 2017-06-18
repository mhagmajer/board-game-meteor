import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

const game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', {
  create: create,
});

const rows = 8;
const cols = 8;
const cellWidth = 50;
const cellHeight = 50;

const spritesBoard = [];

function create() {
  for (let x = 0; x < cols * cellWidth; x += cellWidth) {
    const boardRow = [];
    for (let y = 0; y < rows * cellHeight; y += cellHeight) {
      const text = game.add.text(x, y, '▢', {
        fill: 'white',
        font: 'monospace',
        fontSize: 60,
      });
      boardRow.push(text);
    }
    spritesBoard.push(boardRow);
  }

  game.input.onDown.add(onDown);
}

function onDown() {
  const row = Math.floor(game.input.x / cellWidth);
  const col = Math.floor(game.input.y / cellHeight);

  if (row >= rows || col >= cols) {
    return; // clicked outside of the board
  }

  Meteor.call('move', row, col, (err) => {
    if (err) {
      alert(err);
    }
  })
}


const Games = new Mongo.Collection('games');
Meteor.subscribe('game');

const gameAddedOrChanged = (id, fields) => {
  Object.keys(fields).forEach((key) => {
    if (!key.includes('_')) {
      return; // it's not a board cell change
    }

    const value = fields[key];
    const [row, col] = key.split('_').map(Number);
    spritesBoard[row][col].text = value;
  });
};

Games.find().observeChanges({
  added: gameAddedOrChanged,
  changed: gameAddedOrChanged,
});
