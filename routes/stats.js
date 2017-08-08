var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var PlayerModel = mongoose.model('Player');
var GameModel = mongoose.model('Game');
var GameHelper = require('./gameHelper');
var DateHelper = require('./dateHelper');

var statsHelper = {
    round: function(value, decimals) {
        return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    },
    getPlayerObject: function(playerId, callback) {
        PlayerModel.findById(playerId, function (err, player) {
            if (err) return next(err);
            callback(player);
        });
    },
    getGamesPlayed: function(playerId, dateRange, callback) {
        var startDateRange = dateRange[0];
        var endDateRange = dateRange[1];
    
        GameModel.find()
        .where('datePlayed').gte(startDateRange).lt(endDateRange)
        .populate('players.player')
        .exec(function (err, games) {
            if (err) return next(err);

            // Apparently the games aren't guaranteed to be returned in date order
            games.sort(function(a,b) {
                return a.datePlayed - b.datePlayed;
            });

            var aboveTenGamesOnly = true;
            // This leads to weird user expectations if the positions suddenly disappear
            // and re-arrange in the middle of the month.
            //
            // var currentPositions = GameHelper.getLeaderboardSnapshot(games, false);
            // var aboveTenGamesOnly = currentPositions.some(function(player) {
            //     return player.gamesPlayed >= 10;
            // });

            var previousRating = 0;
            var previousPosition = 0;

            var result = games.map(function(game, index) {
                var playerPosition = previousPosition;
                var playerRating = previousRating;
                var ratingDiff = 0;
                var positionDiff = 0;

                var leaderboard = GameHelper.getLeaderboardSnapshot(games.slice(0, index + 1), aboveTenGamesOnly);

                leaderboard.some(function(player) {
                    if(player.id == playerId) {
                        playerRating = statsHelper.round(player.rating, 2);
                        ratingDiff = statsHelper.round(playerRating - previousRating, 2);
                        previousRating = playerRating;

                        playerPosition = player.position;
                        positionDiff = playerPosition - previousPosition;
                        previousPosition = playerPosition;
                        return true;
                    }
                    else {
                        return false;
                    }
                });

                return {
                    gameId: game._id,
                    gameDate: game.datePlayed,
                    played: GameHelper.hasPlayedGame(playerId, game),
                    rating: playerRating,
                    ratingDiff: ratingDiff,
                    position: playerPosition,
                    positionDiff: positionDiff
                };
            });
    
            callback(result);
        });
    }
}

router.get('/json/:id', function (req, res, next) {
    var playerId = req.params.id;
    var dateRange = DateHelper.monthDefined(req) && DateHelper.yearDefined(req)
        ? DateHelper.getDateRange(req)
        : DateHelper.getCurrentMonthRange();
    
    statsHelper.getPlayerObject(playerId, function(player) {
        statsHelper.getGamesPlayed(playerId, dateRange, function(gameData) {
            res.json({
                player: player,
                dateRange: dateRange,
                gamesPlayed: gameData.filter(function(game) { return game.played; }).length,
                games: gameData.reverse()
            });
        });
    });
});

module.exports = router;