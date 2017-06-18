import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

const Games = new Mongo.Collection('games');

Meteor.publish('game', function () {
  return Games.find();
});

Meteor.methods({
  move(x, y) {
    const game = Games.findOne();
    if (game[`${x}_${y}`]) {
      throw new Meteor.Error('400', 'Illegal move');
    }
    const numUpdated = Games.update({
      turn: game.turn, // guard against race conditions of different server processes
    }, {
      $inc: {
        turn: 1,
      },
      $set: {
        [`${x}_${y}`]: game.turn % 2 ? 'x' : 'o',
      },
    });
    if (numUpdated !== 1) {
      throw new Meteor.Error('400', 'Try again');
    }
  },
});

Meteor.startup(() => {
  // reset the board on startup
  Games.remove({});
  Games.insert({
    turn: 0,
  });
});
