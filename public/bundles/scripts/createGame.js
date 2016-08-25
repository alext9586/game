var Components;
(function (Components) {
    function PlayerSelectorFilter() {
        return function (playersList, filter) {
            var caseInsensitiveMatch = function (value, filter) {
                return value.toUpperCase().search(filter.toUpperCase()) >= 0;
            };
            var initials = playersList.filter(function (player) {
                return caseInsensitiveMatch(player.player.initials, filter);
            });
            var nicknames = playersList.filter(function (player) {
                return caseInsensitiveMatch(player.player.nickname, filter);
            }).sort(function (a, b) {
                if (a.player.nickname.length < b.player.nickname.length)
                    return -1;
                if (a.player.nickname.length > b.player.nickname.length)
                    return 1;
                return 0;
            });
            var fullname = playersList.filter(function (player) {
                return caseInsensitiveMatch(player.player.fullname, filter);
            });
            var output = [];
            var existsInOutput = function (playerId) {
                return !output.length || output.map(function (p) { return p.playerId; }).indexOf(playerId) === -1;
            };
            initials.forEach(function (player) {
                output.push(player);
            });
            nicknames.forEach(function (player) {
                if (existsInOutput(player.playerId)) {
                    output.push(player);
                }
            });
            fullname.forEach(function (player) {
                if (existsInOutput(player.playerId)) {
                    output.push(player);
                }
            });
            var inactivePlayers = output.filter(function (player) {
                return player.player.inactive;
            });
            return output.filter(function (player) {
                return !player.player.inactive;
            }).concat(inactivePlayers);
        };
    }
    Components.PlayerSelectorFilter = PlayerSelectorFilter;
})(Components || (Components = {}));

var Components;
(function (Components) {
    function PlayerSelectorDirective() {
        return {
            scope: {
                players: "=",
                onSelected: "&",
                disabled: "="
            },
            templateUrl: "/components/PlayerSelector/directives/PlayerSelectorTemplate.html",
            controller: "PlayerSelectorController",
            controllerAs: "ctrl",
            bindToController: true
        };
    }
    Components.PlayerSelectorDirective = PlayerSelectorDirective;
    var PlayerSelectorController = (function () {
        function PlayerSelectorController($element, $timeout) {
            this.$element = $element;
            this.$timeout = $timeout;
            this.filter = "";
        }
        PlayerSelectorController.prototype.removeFilter = function () {
            this.filter = "";
        };
        PlayerSelectorController.prototype.selectPlayer = function (item, model, label) {
            this.$element.find("input").focus();
            this.onSelected({ data: item });
            this.removeFilter();
        };
        PlayerSelectorController.$inject = ["$element", "$timeout"];
        return PlayerSelectorController;
    }());
    Components.PlayerSelectorController = PlayerSelectorController;
})(Components || (Components = {}));

var Components;
(function (Components) {
    var PlayerSelectionService = (function () {
        function PlayerSelectionService($q, apiService) {
            this.$q = $q;
            this.apiService = apiService;
            this.allPlayers = [];
            this.players = [];
            this.unselectedPlayersList = [];
        }
        Object.defineProperty(PlayerSelectionService.prototype, "selectedPlayers", {
            get: function () {
                return this.players;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PlayerSelectionService.prototype, "unselectedPlayers", {
            get: function () {
                return this.unselectedPlayersList;
            },
            enumerable: true,
            configurable: true
        });
        PlayerSelectionService.prototype.playerIndex = function (playerId) {
            return this.players.map(function (p) { return p.playerId; }).indexOf(playerId);
        };
        PlayerSelectionService.prototype.addPlayer = function (player) {
            var found = this.allPlayers.filter(function (p) { return p.playerId === player._id; });
            if (found.length === 1) {
                this.players.push(found[0]);
                this.curateNewPlayerList();
            }
            else {
                console.error("Player not found.", player);
            }
        };
        PlayerSelectionService.prototype.removePlayer = function (player) {
            var index = this.playerIndex(player._id);
            this.players.splice(index, 1);
            this.curateNewPlayerList();
        };
        PlayerSelectionService.prototype.getPlayers = function () {
            var _this = this;
            var def = this.$q.defer();
            this.apiService.getPlayersForNewGame().then(function (data) {
                _this.allPlayers = data.players;
                def.resolve(data);
            }, function () {
                _this.allPlayers = [];
                def.reject();
            });
            return def.promise;
        };
        PlayerSelectionService.prototype.curateNewPlayerList = function () {
            var currentPlayerIds = this.players.map(function (p) { return p.playerId; });
            this.unselectedPlayersList = this.allPlayers.filter(function (player) {
                return currentPlayerIds.indexOf(player.playerId) === -1;
            });
        };
        PlayerSelectionService.prototype.reset = function () {
            this.players = [];
            this.curateNewPlayerList();
        };
        PlayerSelectionService.prototype.debugShowAllPlayersTable = function () {
            this.debugPrintPlayersTable(this.allPlayers);
        };
        PlayerSelectionService.prototype.debugShowCuratedPlayersTable = function () {
            this.debugPrintPlayersTable(this.unselectedPlayers);
        };
        PlayerSelectionService.prototype.debugPrintPlayersTable = function (players) {
            console.info(players.map(function (p) {
                return {
                    orderNumber: p.orderNumber,
                    rating: p.rating,
                    name: p.player.fullname
                };
            }));
        };
        PlayerSelectionService.$inject = ['$q', 'apiService'];
        return PlayerSelectionService;
    }());
    Components.PlayerSelectionService = PlayerSelectionService;
})(Components || (Components = {}));

var PlayerSelectorModule = angular.module('PlayerSelectorModule', []);
PlayerSelectorModule.service('playerSelectionService', Components.PlayerSelectionService);
PlayerSelectorModule.filter('playerSelectorFilter', Components.PlayerSelectorFilter);
PlayerSelectorModule.controller('PlayerSelectorController', Components.PlayerSelectorController);
PlayerSelectorModule.directive('playerSelector', Components.PlayerSelectorDirective);

var CreateGame;
(function (CreateGame) {
    (function (NewGameSort) {
        NewGameSort[NewGameSort["Selected"] = 0] = "Selected";
        NewGameSort[NewGameSort["Rating"] = 1] = "Rating";
    })(CreateGame.NewGameSort || (CreateGame.NewGameSort = {}));
    var NewGameSort = CreateGame.NewGameSort;
    var CreateGameService = (function () {
        function CreateGameService($q, apiService, playerSelectionService) {
            var _this = this;
            this.$q = $q;
            this.apiService = apiService;
            this.playerSelectionService = playerSelectionService;
            this.firstGameOfMonth = false;
            this.gameOrderSortedPlayers = [];
            this.sort = NewGameSort.Selected;
            this.playerLoadPromise = this.playerSelectionService.getPlayers().then(function (data) {
                _this.initializeData(data.firstGameOfMonth);
                _this.$q.resolve();
            }, function () {
                _this.initializeData(true);
                _this.$q.resolve();
            });
        }
        Object.defineProperty(CreateGameService.prototype, "players", {
            get: function () {
                return this.playerSelectionService.selectedPlayers;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CreateGameService.prototype, "sortOrder", {
            get: function () {
                return this.sort;
            },
            set: function (value) {
                this.sort = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CreateGameService.prototype, "playersSorted", {
            get: function () {
                if (this.sort === NewGameSort.Selected) {
                    return this.players;
                }
                else {
                    return this.gameOrderSortedPlayers;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CreateGameService.prototype, "unselectedPlayers", {
            get: function () {
                return this.playerSelectionService.unselectedPlayers;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CreateGameService.prototype, "hasMinimumPlayers", {
            get: function () {
                return this.players.length >= 3;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CreateGameService.prototype, "numPlayers", {
            get: function () {
                return this.players.length;
            },
            enumerable: true,
            configurable: true
        });
        CreateGameService.prototype.initializeData = function (firstGameOfMonth) {
            this.firstGameOfMonth = firstGameOfMonth;
            this.reset();
        };
        CreateGameService.prototype.sortPlayersByGameOrder = function () {
            var _this = this;
            var temp = angular.copy(this.players);
            temp.sort(function (a, b) {
                if (a.rating !== b.rating) {
                    return b.rating - a.rating;
                }
                else if (a.orderNumber !== b.orderNumber) {
                    return a.orderNumber - b.orderNumber;
                }
                else {
                    if (a.player.fullname < b.player.fullname) {
                        return -1;
                    }
                    else if (a.player.fullname > b.player.fullname) {
                        return 1;
                    }
                    else {
                        return 0;
                    }
                }
            });
            var first = true;
            var firstHalf = [];
            var secondHalf = [];
            while (temp.length > 0) {
                if (first) {
                    firstHalf.push(temp[0]);
                }
                else {
                    secondHalf.push(temp[0]);
                }
                temp.splice(0, 1);
                first = !first;
            }
            this.gameOrderSortedPlayers = [];
            firstHalf.forEach(function (p) {
                _this.gameOrderSortedPlayers.push(p);
            });
            secondHalf.reverse().forEach(function (p) {
                _this.gameOrderSortedPlayers.push(p);
            });
        };
        CreateGameService.prototype.init = function () {
            return this.playerLoadPromise;
        };
        CreateGameService.prototype.reset = function () {
            this.playerSelectionService.reset();
            this.sortPlayersByGameOrder();
            this.sortOrder = NewGameSort.Selected;
        };
        CreateGameService.prototype.addPlayer = function (player) {
            this.playerSelectionService.addPlayer(player.player);
            this.sortPlayersByGameOrder();
        };
        CreateGameService.prototype.removePlayer = function (player) {
            this.playerSelectionService.removePlayer(player.player);
            this.sortPlayersByGameOrder();
        };
        CreateGameService.prototype.createNewActiveGame = function (datePlayed) {
            var game = new Shared.Game();
            game.datePlayed = datePlayed.toISOString();
            game.players = this.playersSorted.map(function (player) {
                var gamePlayer = new Shared.GamePlayer();
                gamePlayer.player = player.player;
                return gamePlayer;
            });
            return this.apiService.createActiveGame(game);
        };
        CreateGameService.prototype.debugShowSortedPlayersTable = function () {
            this.playerSelectionService.debugPrintPlayersTable(this.playersSorted);
        };
        CreateGameService.$inject = ['$q', 'apiService', 'playerSelectionService'];
        return CreateGameService;
    }());
    CreateGame.CreateGameService = CreateGameService;
})(CreateGame || (CreateGame = {}));

var CreateGame;
(function (CreateGame) {
    function ButtonsPanelDirective() {
        return {
            scope: {
                datePlayed: "=",
                create: "&"
            },
            templateUrl: '/areas/createGame/directives/ButtonsPanelTemplate.html',
            controller: 'ButtonsPanelController',
            controllerAs: 'ctrl',
            bindToController: true
        };
    }
    CreateGame.ButtonsPanelDirective = ButtonsPanelDirective;
    var ButtonsPanelController = (function () {
        function ButtonsPanelController($window, createGameService) {
            this.$window = $window;
            this.createGameService = createGameService;
            this.datePlayed = null;
        }
        Object.defineProperty(ButtonsPanelController.prototype, "hasDate", {
            get: function () {
                return this.datePlayed !== null && this.datePlayed !== undefined && this.datePlayed.toISOString() !== "";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ButtonsPanelController.prototype, "hasSelectedPlayers", {
            get: function () {
                return this.createGameService.numPlayers > 0;
            },
            enumerable: true,
            configurable: true
        });
        ButtonsPanelController.prototype.reset = function () {
            this.datePlayed = null;
            this.createGameService.reset();
        };
        ButtonsPanelController.prototype.useCurrentDateTime = function () {
            this.datePlayed = new Date();
        };
        Object.defineProperty(ButtonsPanelController.prototype, "disableGameCreation", {
            get: function () {
                return !this.hasDate || !this.createGameService.hasMinimumPlayers;
            },
            enumerable: true,
            configurable: true
        });
        ButtonsPanelController.$inject = ['$window', 'createGameService'];
        return ButtonsPanelController;
    }());
    CreateGame.ButtonsPanelController = ButtonsPanelController;
})(CreateGame || (CreateGame = {}));

var CreateGame;
(function (CreateGame) {
    function SelectedPlayersDirective() {
        return {
            scope: {},
            templateUrl: '/areas/createGame/directives/SelectedPlayersTemplate.html',
            controller: 'SelectedPlayersController',
            controllerAs: 'ctrl',
            bindToController: true
        };
    }
    CreateGame.SelectedPlayersDirective = SelectedPlayersDirective;
    var SelectedPlayersController = (function () {
        function SelectedPlayersController(createGameService) {
            this.createGameService = createGameService;
        }
        Object.defineProperty(SelectedPlayersController.prototype, "players", {
            get: function () {
                return this.createGameService.playersSorted;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SelectedPlayersController.prototype, "hasMinimumPlayers", {
            get: function () {
                return this.createGameService.hasMinimumPlayers;
            },
            enumerable: true,
            configurable: true
        });
        SelectedPlayersController.prototype.removePlayer = function (player) {
            this.createGameService.removePlayer(player);
        };
        SelectedPlayersController.$inject = ['createGameService'];
        return SelectedPlayersController;
    }());
    CreateGame.SelectedPlayersController = SelectedPlayersController;
})(CreateGame || (CreateGame = {}));

var CreateGame;
(function (CreateGame) {
    function CreateGameDirective() {
        return {
            scope: {},
            templateUrl: '/areas/createGame/directives/CreateGameTemplate.html',
            controller: 'CreateGameController',
            controllerAs: 'ctrl',
            bindToController: true
        };
    }
    CreateGame.CreateGameDirective = CreateGameDirective;
    var State;
    (function (State) {
        State[State["Loading"] = 0] = "Loading";
        State[State["Error"] = 1] = "Error";
        State[State["Loaded"] = 2] = "Loaded";
        State[State["CreatingGame"] = 3] = "CreatingGame";
    })(State || (State = {}));
    var CreateGameController = (function () {
        function CreateGameController($window, createGameService) {
            var _this = this;
            this.$window = $window;
            this.createGameService = createGameService;
            this.showLoading = false;
            this.showErrorMessage = false;
            this.showForm = false;
            this.orderedPlayersLoaded = false;
            this.disableOrderedPlayers = false;
            this.datePlayed = null;
            this.createGameService.init().then(function () {
                _this.changeState(State.Loaded);
            });
        }
        Object.defineProperty(CreateGameController.prototype, "sortOrder", {
            get: function () {
                return CreateGame.NewGameSort[this.createGameService.sortOrder];
            },
            set: function (value) {
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CreateGameController.prototype, "unselectedPlayers", {
            get: function () {
                return this.createGameService.unselectedPlayers;
            },
            enumerable: true,
            configurable: true
        });
        CreateGameController.prototype.changeState = function (newState) {
            this.showLoading = (newState === State.Loading) || (newState === State.CreatingGame);
            this.showForm = (newState === State.Loaded);
            this.showErrorMessage = newState === State.Error;
            switch (newState) {
                case State.CreatingGame:
                    this.createNewActiveGame();
                    break;
            }
        };
        CreateGameController.prototype.addPlayer = function (data) {
            this.createGameService.addPlayer(data);
        };
        CreateGameController.prototype.createGame = function () {
            this.changeState(State.CreatingGame);
        };
        CreateGameController.prototype.createNewActiveGame = function () {
            var _this = this;
            this.createGameService.createNewActiveGame(this.datePlayed).then(function (editUrl) {
                _this.$window.location.href = editUrl;
            }, function () {
                _this.changeState(State.Error);
            });
        };
        CreateGameController.prototype.useThisOrder = function () {
            this.createGameService.sortOrder = CreateGame.NewGameSort.Selected;
        };
        CreateGameController.prototype.useGameOrder = function () {
            this.createGameService.sortOrder = CreateGame.NewGameSort.Rating;
        };
        CreateGameController.$inject = ['$window', 'createGameService'];
        return CreateGameController;
    }());
    CreateGame.CreateGameController = CreateGameController;
})(CreateGame || (CreateGame = {}));

var DorkModule = angular.module('DorkModule', ['UxControlsModule', 'PlayerSelectorModule']);

DorkModule.service('createGameService', CreateGame.CreateGameService);

DorkModule.controller('ButtonsPanelController', CreateGame.ButtonsPanelController);
DorkModule.directive('buttonsPanel', CreateGame.ButtonsPanelDirective);

DorkModule.controller('SelectedPlayersController', CreateGame.SelectedPlayersController);
DorkModule.directive('selectedPlayers', CreateGame.SelectedPlayersDirective);

DorkModule.controller('CreateGameController', CreateGame.CreateGameController);
DorkModule.directive('createGame', CreateGame.CreateGameDirective);
//# sourceMappingURL=maps/createGame.js.map