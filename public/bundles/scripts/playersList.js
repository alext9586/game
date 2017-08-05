var Components;
(function (Components) {
    function PlayerFormDirective() {
        return {
            scope: {
                player: "=",
                disableForm: "=?"
            },
            templateUrl: "/components/playerForm/directives/PlayerFormTemplate.html",
            controller: "PlayerFormController",
            controllerAs: "ctrl",
            bindToController: true
        };
    }
    Components.PlayerFormDirective = PlayerFormDirective;
    var PlayerFormController = (function () {
        function PlayerFormController() {
        }
        PlayerFormController.$inject = [];
        return PlayerFormController;
    }());
    Components.PlayerFormController = PlayerFormController;
})(Components || (Components = {}));

var PlayerFormModule = angular.module('PlayerFormModule', []);
PlayerFormModule.controller('PlayerFormController', Components.PlayerFormController);
PlayerFormModule.directive('playerForm', Components.PlayerFormDirective);

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Players;
(function (Players) {
    var PlayersListService = (function (_super) {
        __extends(PlayersListService, _super);
        function PlayersListService($timeout, $q, apiService) {
            var _this = _super.call(this, $timeout) || this;
            _this.$q = $q;
            _this.apiService = apiService;
            _this.event = {
                editOpen: "editOpen",
                editCancel: "editCancel",
                editSave: "editSave"
            };
            _this.playerLoadPromise = _this.loadPlayers();
            return _this;
        }
        Object.defineProperty(PlayersListService.prototype, "players", {
            get: function () {
                return this.allPlayers;
            },
            enumerable: true,
            configurable: true
        });
        PlayersListService.prototype.subscribeEditOpen = function (callback) {
            this.subscribe(this.event.editOpen, callback);
        };
        PlayersListService.prototype.subscribeEditSave = function (callback) {
            this.subscribe(this.event.editSave, callback);
        };
        PlayersListService.prototype.subscribeEditCancel = function (callback) {
            this.subscribe(this.event.editCancel, callback);
        };
        PlayersListService.prototype.ready = function () {
            return this.playerLoadPromise;
        };
        PlayersListService.prototype.loadPlayers = function () {
            var _this = this;
            return this.apiService.getAllPlayers().then(function (data) {
                _this.allPlayers = data;
                _this.$q.resolve();
            }, function (data) {
                _this.$q.reject(data);
            });
        };
        PlayersListService.prototype.savePlayer = function (player, notify) {
            var _this = this;
            return this.apiService.saveExistingPlayer(player).then(function () {
                if (notify) {
                    _this.publish(_this.event.editSave, null);
                }
                _this.$q.resolve();
            }, function (data) {
                _this.$q.reject(data);
            });
        };
        PlayersListService.prototype.cancelEdit = function () {
            this.publish(this.event.editCancel, null);
        };
        PlayersListService.prototype.openEdit = function () {
            this.publish(this.event.editOpen, null);
        };
        PlayersListService.$inject = ['$timeout', '$q', 'apiService'];
        return PlayersListService;
    }(Shared.PubSubServiceBase));
    Players.PlayersListService = PlayersListService;
})(Players || (Players = {}));

var Players;
(function (Players) {
    function EditPlayerDirective() {
        return {
            scope: {
                player: "="
            },
            templateUrl: "/areas/players/directives/EditPlayerTemplate.html",
            controller: "EditPlayerController",
            controllerAs: "ctrl",
            bindToController: true
        };
    }
    Players.EditPlayerDirective = EditPlayerDirective;
    var EditPlayerController = (function () {
        function EditPlayerController(playersListService) {
            var _this = this;
            this.playersListService = playersListService;
            this.disabled = false;
            this.playersListService.subscribeEditOpen(function () {
                _this.disabled = false;
            });
        }
        EditPlayerController.prototype.save = function () {
            this.disabled = true;
            this.playersListService.savePlayer(this.player, true);
        };
        EditPlayerController.prototype.cancel = function () {
            this.playersListService.cancelEdit();
        };
        EditPlayerController.$inject = ["playersListService"];
        return EditPlayerController;
    }());
    Players.EditPlayerController = EditPlayerController;
})(Players || (Players = {}));

var Players;
(function (Players) {
    function PlayersListDirective() {
        return {
            scope: {},
            templateUrl: "/areas/players/directives/PlayersListTemplate.html",
            controller: "PlayersListController",
            controllerAs: "ctrl",
            bindToController: true
        };
    }
    Players.PlayersListDirective = PlayersListDirective;
    var State;
    (function (State) {
        State[State["Loading"] = 0] = "Loading";
        State[State["Ready"] = 1] = "Ready";
        State[State["Error"] = 2] = "Error";
        State[State["EditPlayer"] = 3] = "EditPlayer";
        State[State["Saved"] = 4] = "Saved";
    })(State || (State = {}));
    var PlayersListController = (function () {
        function PlayersListController(apiService, alertsService, playersListService) {
            var _this = this;
            this.apiService = apiService;
            this.alertsService = alertsService;
            this.playersListService = playersListService;
            this.disableControls = false;
            this.showError = false;
            this.showLoading = false;
            this.showPlayers = false;
            this.showPlayerEdit = false;
            this.filter = "";
            this.activity = "Both";
            this.changeState(State.Loading);
            this.playersListService.subscribeEditSave(function () {
                _this.changeState(State.Saved);
            });
            this.playersListService.subscribeEditCancel(function () {
                _this.selectedPlayer = undefined;
                _this.changeState(State.Ready);
            });
        }
        Object.defineProperty(PlayersListController.prototype, "alerts", {
            get: function () {
                return this.alertsService.alerts;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PlayersListController.prototype, "players", {
            get: function () {
                return this.playersListService.players;
            },
            enumerable: true,
            configurable: true
        });
        PlayersListController.prototype.changeState = function (newState) {
            this.showLoading = newState === State.Loading;
            this.showPlayers = newState === State.Ready;
            this.showPlayerEdit = newState === State.EditPlayer;
            this.showError = newState === State.Error;
            switch (newState) {
                case State.Loading:
                    this.loadPlayers();
                    break;
                case State.EditPlayer:
                    this.playersListService.openEdit();
                    this.alertsService.clearAlerts();
                    break;
                case State.Saved:
                    this.alertsService.addAlert("success", "Player saved successfully!");
                    this.changeState(State.Loading);
                    break;
            }
        };
        PlayersListController.prototype.errorHandler = function (data, errorMessage) {
            this.alertsService.addAlert("danger", errorMessage);
            console.error(data);
            this.changeState(State.Error);
        };
        PlayersListController.prototype.loadPlayers = function () {
            var _this = this;
            this.playersListService.loadPlayers().then(function () {
                _this.changeState(State.Ready);
            }, function (data) {
                _this.errorHandler(data, "Error fetching players!");
            });
        };
        PlayersListController.prototype.toggleInactive = function (player) {
            var _this = this;
            player.inactive = !player.inactive;
            this.playersListService.savePlayer(player, false).then(function () { }, function (data) {
                _this.errorHandler(data, "Player save failure!");
            });
        };
        PlayersListController.prototype.removeFilter = function () {
            this.filter = "";
        };
        PlayersListController.prototype.editPlayer = function (player) {
            this.selectedPlayer = angular.copy(player);
            this.changeState(State.EditPlayer);
        };
        PlayersListController.prototype.isPlayerVisible = function (player) {
            if (this.activity === "Both")
                return true;
            if (this.activity === "Active")
                return !player.inactive;
            return player.inactive;
        };
        PlayersListController.prototype.reload = function () {
            this.alertsService.clearAlerts();
            this.changeState(State.Loading);
        };
        PlayersListController.prototype.closeAlert = function (index) {
            this.alertsService.closeAlert(index);
        };
        PlayersListController.$inject = ["apiService", "alertsService", "playersListService"];
        return PlayersListController;
    }());
    Players.PlayersListController = PlayersListController;
})(Players || (Players = {}));

var DorkModule = angular.module('DorkModule', ['UxControlsModule', 'PlayerFormModule']);

DorkModule.service('alertsService', Shared.AlertsService);
DorkModule.service('playersListService', Players.PlayersListService);

DorkModule.controller('EditPlayerController', Players.EditPlayerController);
DorkModule.directive('editPlayer', Players.EditPlayerDirective);

DorkModule.controller('PlayersListController', Players.PlayersListController);
DorkModule.directive('playersList', Players.PlayersListDirective);

//# sourceMappingURL=maps/playersList.js.map