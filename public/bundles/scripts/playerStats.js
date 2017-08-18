var PlayerStats;
(function (PlayerStats) {
    var PlayerStatsService = (function () {
        function PlayerStatsService($q, playerId, apiService) {
            this.$q = $q;
            this.playerId = playerId;
            this.apiService = apiService;
        }
        Object.defineProperty(PlayerStatsService.prototype, "playerStats", {
            get: function () {
                return this.localPlayerStats;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PlayerStatsService.prototype, "latestGame", {
            get: function () {
                if (this.localPlayerStats && this.localPlayerStats.games) {
                    return this.localPlayerStats.games[0];
                }
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PlayerStatsService.prototype, "hasPlayedGames", {
            get: function () {
                return !this.playerStats ? false : this.playerStats.gamesPlayed > 0;
            },
            enumerable: true,
            configurable: true
        });
        PlayerStatsService.prototype.getPlayerStats = function (date) {
            var _this = this;
            var def = this.$q.defer();
            this.apiService.getPlayerStats(this.playerId, date).then(function (playerStats) {
                _this.localPlayerStats = playerStats;
                def.resolve();
            }, function () {
                def.reject();
            });
            return def.promise;
        };
        PlayerStatsService.$inject = ["$q", "playerId", "apiService"];
        return PlayerStatsService;
    }());
    PlayerStats.PlayerStatsService = PlayerStatsService;
})(PlayerStats || (PlayerStats = {}));

var PlayerStats;
(function (PlayerStats) {
    function DeltaBoxDirective() {
        return {
            scope: {
                value: "=",
                decimal: "@",
                diff: "="
            },
            templateUrl: "/areas/playerStats/directives/DeltaBoxTemplate.html",
            controller: "DeltaBoxController",
            controllerAs: "ctrl",
            bindToController: true
        };
    }
    PlayerStats.DeltaBoxDirective = DeltaBoxDirective;
    var DeltaBoxController = (function () {
        function DeltaBoxController() {
        }
        Object.defineProperty(DeltaBoxController.prototype, "hasNoValue", {
            get: function () {
                return this.value === null || this.value === undefined;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DeltaBoxController.prototype, "hasValue", {
            get: function () {
                return (this.value === 0) || !!this.value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DeltaBoxController.prototype, "isDiffPositive", {
            get: function () {
                return this.diff > 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DeltaBoxController.prototype, "isDiffNegative", {
            get: function () {
                return this.diff < 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DeltaBoxController.prototype, "absDiff", {
            get: function () {
                return Math.abs(this.diff);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DeltaBoxController.prototype, "absValue", {
            get: function () {
                return Math.abs(this.value);
            },
            enumerable: true,
            configurable: true
        });
        return DeltaBoxController;
    }());
    PlayerStats.DeltaBoxController = DeltaBoxController;
})(PlayerStats || (PlayerStats = {}));

var PlayerStats;
(function (PlayerStats) {
    function PlayerStatsCardDirective() {
        return {
            scope: {},
            templateUrl: "/areas/playerStats/directives/PlayerStatsCardTemplate.html",
            controller: "PlayerStatsCardController",
            controllerAs: "ctrl",
            bindToController: true
        };
    }
    PlayerStats.PlayerStatsCardDirective = PlayerStatsCardDirective;
    var PlayerStatsCardController = (function () {
        function PlayerStatsCardController(playerStatsService) {
            this.playerStatsService = playerStatsService;
        }
        Object.defineProperty(PlayerStatsCardController.prototype, "playerStats", {
            get: function () {
                return this.playerStatsService.playerStats;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PlayerStatsCardController.prototype, "rating", {
            get: function () {
                if (!this.playerStatsService.latestGame) {
                    return 0;
                }
                return this.playerStatsService.latestGame.rating;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PlayerStatsCardController.prototype, "rank", {
            get: function () {
                if (!this.playerStatsService.latestGame) {
                    return 0;
                }
                return this.playerStatsService.latestGame.rank;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PlayerStatsCardController.prototype, "hasPlayedGames", {
            get: function () {
                return this.playerStatsService.hasPlayedGames;
            },
            enumerable: true,
            configurable: true
        });
        PlayerStatsCardController.$inject = ["playerStatsService"];
        return PlayerStatsCardController;
    }());
    PlayerStats.PlayerStatsCardController = PlayerStatsCardController;
})(PlayerStats || (PlayerStats = {}));

var PlayerStats;
(function (PlayerStats) {
    var MonthYearParams = Shared.MonthYearParams;
    function PlayerStatsDirective() {
        return {
            scope: {},
            templateUrl: "/areas/playerStats/directives/PlayerStatsTemplate.html",
            controller: "PlayerStatsController",
            controllerAs: "ctrl",
            bindToController: true
        };
    }
    PlayerStats.PlayerStatsDirective = PlayerStatsDirective;
    var State;
    (function (State) {
        State[State["Loading"] = 0] = "Loading";
        State[State["Ready"] = 1] = "Ready";
        State[State["Change"] = 2] = "Change";
        State[State["Error"] = 3] = "Error";
    })(State || (State = {}));
    var PlayerStatsController = (function () {
        function PlayerStatsController($timeout, monthYearQueryService, playerStatsService) {
            var _this = this;
            this.$timeout = $timeout;
            this.monthYearQueryService = monthYearQueryService;
            this.playerStatsService = playerStatsService;
            this.showLoading = false;
            this.showErrorMessage = false;
            this.showContent = false;
            this.changeState(State.Loading);
            monthYearQueryService.subscribeDateChange(function (event, date) {
                _this.getPlayerStats(date);
            });
            this.date = monthYearQueryService.getQueryParams() || new MonthYearParams();
            this.getPlayerStats(this.date);
        }
        Object.defineProperty(PlayerStatsController.prototype, "playerStats", {
            get: function () {
                return this.playerStatsService.playerStats;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PlayerStatsController.prototype, "hasPlayedGames", {
            get: function () {
                return this.playerStatsService.hasPlayedGames;
            },
            enumerable: true,
            configurable: true
        });
        PlayerStatsController.prototype.getPlayerStats = function (date) {
            var _this = this;
            this.playerStatsService.getPlayerStats(date).then(function () {
                _this.changeState(State.Ready);
            }, function () {
                _this.changeState(State.Error);
            });
        };
        PlayerStatsController.prototype.changeState = function (newState) {
            this.showLoading = newState === State.Loading || newState === State.Change;
            this.showContent = newState === State.Ready;
            this.showErrorMessage = newState === State.Error;
        };
        PlayerStatsController.prototype.rankValue = function (value) {
            return value === 0 ? null : value;
        };
        PlayerStatsController.prototype.updateQueryParams = function () {
            var _this = this;
            this.changeState(State.Change);
            this.$timeout(function () {
                _this.monthYearQueryService.saveQueryParams(_this.date.month, _this.date.year);
            });
        };
        PlayerStatsController.$inject = ["$timeout", "monthYearQueryService", "playerStatsService"];
        return PlayerStatsController;
    }());
    PlayerStats.PlayerStatsController = PlayerStatsController;
})(PlayerStats || (PlayerStats = {}));

var DorkModule = angular.module('DorkModule', ['UxControlsModule']);

DorkModule.service('playerStatsService', PlayerStats.PlayerStatsService);

DorkModule.controller('DeltaBoxController', PlayerStats.DeltaBoxController);
DorkModule.directive('deltaBox', PlayerStats.DeltaBoxDirective);

DorkModule.controller('PlayerStatsCardController', PlayerStats.PlayerStatsCardController);
DorkModule.directive('playerStatsCard', PlayerStats.PlayerStatsCardDirective);

DorkModule.controller('PlayerStatsController', PlayerStats.PlayerStatsController);
DorkModule.directive('playerStats', PlayerStats.PlayerStatsDirective);

function setPlayerId(value) {
    DorkModule.constant('playerId', value);
}
//# sourceMappingURL=maps/playerStats.js.map