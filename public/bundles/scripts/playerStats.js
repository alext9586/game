var PlayerStats;
(function (PlayerStats) {
    var PlayerStatsService = (function () {
        function PlayerStatsService($location, $q, apiService) {
            this.$location = $location;
            this.$q = $q;
            this.apiService = apiService;
            this.playerId = "";
            this.errorMessageList = [];
            this.getPlayerStats();
        }
        Object.defineProperty(PlayerStatsService.prototype, "playerStats", {
            get: function () {
                return this.localPlayerStats;
            },
            enumerable: true,
            configurable: true
        });
        PlayerStatsService.prototype.getPlayerStats = function () {
            var _this = this;
            var def = this.$q.defer();
            if (this.$location.path() !== undefined || this.$location.path() !== '') {
                this.playerId = this.$location.path();
            }
            this.apiService.getPlayerStats(this.playerId).then(function (playerStats) {
                _this.localPlayerStats = playerStats;
                def.resolve();
            }, function () {
                _this.addErrorMessage('Cannot get active game.');
                def.reject();
            });
            return def.promise;
        };
        PlayerStatsService.prototype.addErrorMessage = function (message, clear) {
            if (clear === void 0) { clear = true; }
            if (clear) {
                this.clearerrorMessageList();
            }
            this.errorMessageList.push(message);
        };
        PlayerStatsService.prototype.clearerrorMessageList = function () {
            this.errorMessageList = [];
        };
        PlayerStatsService.$inject = ["$location", "$q", "apiService"];
        return PlayerStatsService;
    }());
    PlayerStats.PlayerStatsService = PlayerStatsService;
})(PlayerStats || (PlayerStats = {}));

var PlayerStats;
(function (PlayerStats) {
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
    var PlayerStatsController = (function () {
        function PlayerStatsController(playerStatsService) {
            var _this = this;
            this.playerStatsService = playerStatsService;
            playerStatsService.getPlayerStats().then(function () {
                _this.tempJsonData = playerStatsService.playerStats;
            });
        }
        PlayerStatsController.$inject = ["playerStatsService"];
        return PlayerStatsController;
    }());
    PlayerStats.PlayerStatsController = PlayerStatsController;
})(PlayerStats || (PlayerStats = {}));

var DorkModule = angular.module('DorkModule', ['UxControlsModule']);

DorkModule.service('playerStatsService', PlayerStats.PlayerStatsService);

DorkModule.controller('PlayerStatsController', PlayerStats.PlayerStatsController);
DorkModule.directive('playerStats', PlayerStats.PlayerStatsDirective);
//# sourceMappingURL=maps/playerStats.js.map