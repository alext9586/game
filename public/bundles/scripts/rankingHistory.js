var Rankings;
(function (Rankings) {
    var PlayerSelection;
    (function (PlayerSelection) {
        PlayerSelection[PlayerSelection["All"] = 0] = "All";
        PlayerSelection[PlayerSelection["OverTen"] = 1] = "OverTen";
        PlayerSelection[PlayerSelection["UnderTen"] = 2] = "UnderTen";
    })(PlayerSelection || (PlayerSelection = {}));
    ;
    var RankingsService = (function () {
        function RankingsService($q, apiService) {
            this.$q = $q;
            this.apiService = apiService;
            this.cachedPlayers = [];
        }
        RankingsService.prototype.getRankings = function (month, year, hideUnranked) {
            var _this = this;
            var def = this.$q.defer();
            this.apiService.getRankedPlayers(month, year, hideUnranked).then(function (data) {
                _this.cachedPlayers = data;
                def.resolve();
            }, function () {
                def.reject();
            });
            return def.promise;
        };
        RankingsService.prototype.getAllPlayers = function () {
            return this.getPlayers(PlayerSelection.All);
        };
        RankingsService.prototype.getPlayersOverTenGames = function () {
            return this.getPlayers(PlayerSelection.OverTen);
        };
        RankingsService.prototype.getPlayersUnderTenGames = function () {
            return this.getPlayers(PlayerSelection.UnderTen);
        };
        RankingsService.prototype.getPlayers = function (playerSelection) {
            switch (playerSelection) {
                case PlayerSelection.UnderTen:
                    var underTen = this.cachedPlayers.filter(function (player) {
                        return player.gamesPlayed < 10;
                    });
                    return this.assignRankValue(underTen);
                case PlayerSelection.OverTen:
                    var overTen = this.cachedPlayers.filter(function (player) {
                        return player.gamesPlayed >= 10;
                    });
                    return this.assignRankValue(overTen);
                default:
                    return this.assignRankValue(this.cachedPlayers);
            }
        };
        ;
        RankingsService.prototype.assignRankValue = function (selectedPlayers) {
            var counter = 0;
            selectedPlayers.forEach(function (player, index) {
                if (!player.gamesPlayed) {
                    player.rank = 0;
                }
                else if (index > 0 && player.rating === selectedPlayers[index - 1].rating) {
                    player.rank = counter;
                }
                else {
                    player.rank = ++counter;
                }
            });
            return selectedPlayers;
        };
        RankingsService.$inject = ['$q', 'apiService'];
        return RankingsService;
    }());
    Rankings.RankingsService = RankingsService;
})(Rankings || (Rankings = {}));

var Rankings;
(function (Rankings) {
    function RankingsCard() {
        return {
            bindings: {
                player: "="
            },
            templateUrl: '/components/rankings/directives/RankingsCardTemplate.html',
            controller: RankingsCardController
        };
    }
    Rankings.RankingsCard = RankingsCard;
    var RankingsCardController = (function () {
        function RankingsCardController(monthYearQueryService) {
            var _this = this;
            this.monthYearQueryService = monthYearQueryService;
            this.playerStatsUrl = "";
            monthYearQueryService.subscribeDateChange(function (event, date) {
                _this.appendQueryParams("" + date.getVisibleQueryString());
            });
            var date = monthYearQueryService.getQueryParams();
            this.appendQueryParams(!date ? "" : "" + date.getVisibleQueryString());
        }
        Object.defineProperty(RankingsCardController.prototype, "playerStatsBaseUrl", {
            get: function () {
                return "/playerStats/" + this.player.player.urlId;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RankingsCardController.prototype, "hasPlayedGames", {
            get: function () {
                return this.player.gamesPlayed > 0;
            },
            enumerable: true,
            configurable: true
        });
        RankingsCardController.prototype.appendQueryParams = function (value) {
            this.playerStatsUrl = "" + this.playerStatsBaseUrl + value;
        };
        RankingsCardController.$inject = ["monthYearQueryService"];
        return RankingsCardController;
    }());
    Rankings.RankingsCardController = RankingsCardController;
})(Rankings || (Rankings = {}));

var Rankings;
(function (Rankings) {
    function RankingsPanel() {
        return {
            bindings: {
                month: "=",
                year: "=",
                hideUnranked: "="
            },
            templateUrl: '/components/rankings/directives/RankingsPanelTemplate.html',
            controller: RankingsPanelController
        };
    }
    Rankings.RankingsPanel = RankingsPanel;
    var State;
    (function (State) {
        State[State["Loading"] = 0] = "Loading";
        State[State["Loaded"] = 1] = "Loaded";
        State[State["Error"] = 2] = "Error";
        State[State["NoRankings"] = 3] = "NoRankings";
    })(State || (State = {}));
    ;
    var RankingsPanelController = (function () {
        function RankingsPanelController($scope, rankingsService) {
            var _this = this;
            this.$scope = $scope;
            this.rankingsService = rankingsService;
            this.showLoading = true;
            this.showRankings = false;
            this.showUnrankedPlayers = false;
            this.showUnrankBtn = false;
            this.showErrorMessage = false;
            this.showNoRankingsMessage = false;
            this.players = [];
            this.playersUnderTen = [];
            this.numberNoGames = 0;
            $scope.$watchGroup([function () { return _this.month; }, function () { return _this.year; }], function (newValue, oldValue) {
                if ((newValue !== oldValue)) {
                    _this.changeState(State.Loading);
                }
            });
            this.changeState(State.Loading);
        }
        RankingsPanelController.prototype.changeState = function (newState) {
            this.showLoading = newState === State.Loading;
            this.showRankings = newState === State.Loaded;
            this.showUnrankBtn = newState === State.Loaded && this.numberNoGames > 0;
            this.showErrorMessage = newState === State.Error;
            this.showNoRankingsMessage = newState === State.NoRankings;
            switch (newState) {
                case State.Loading:
                    this.getRankings();
                    break;
            }
        };
        RankingsPanelController.prototype.getRankings = function () {
            var _this = this;
            this.rankingsService.getRankings(this.month, this.year, this.hideUnranked)
                .then(this.loadingSuccess.bind(this), function (data) {
                _this.changeState(State.Error);
                console.error(data);
            });
        };
        RankingsPanelController.prototype.loadingSuccess = function () {
            this.players = this.rankingsService.getPlayersOverTenGames();
            this.playersUnderTen = this.rankingsService.getPlayersUnderTenGames();
            if (this.playersUnderTen.some(function (elem) { return elem.gamesPlayed > 0; })) {
                this.numberNoGames = this.playersUnderTen.filter(function (element) { return element.gamesPlayed <= 0; }).length;
                this.changeState(State.Loaded);
            }
            else {
                this.changeState(State.NoRankings);
            }
        };
        RankingsPanelController.prototype.hasNoRank = function (player) {
            if (player.gamesPlayed > 0) {
                return '';
            }
            if (!this.showUnrankedPlayers) {
                return 'hidden';
            }
            return 'ranking-no-rank';
        };
        RankingsPanelController.prototype.toggleUnrankedPlayers = function () {
            this.showUnrankedPlayers = !this.showUnrankedPlayers;
        };
        RankingsPanelController.$inject = ['$scope', 'rankingsService'];
        return RankingsPanelController;
    }());
    Rankings.RankingsPanelController = RankingsPanelController;
})(Rankings || (Rankings = {}));

var Rankings;
(function (Rankings) {
    var RankingsModule = angular.module('RankingsModule', []);
    RankingsModule.service('rankingsService', Rankings.RankingsService);
    RankingsModule.component('rankingsCard', Rankings.RankingsCard());
    RankingsModule.component('rankingsPanel', Rankings.RankingsPanel());
})(Rankings || (Rankings = {}));

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
var Components;
(function (Components) {
    var DotmService = (function (_super) {
        __extends(DotmService, _super);
        function DotmService($timeout, apiService) {
            var _this = _super.call(this, $timeout) || this;
            _this.apiService = apiService;
            _this.events = {
                dateChanged: "dateChanged"
            };
            return _this;
        }
        Object.defineProperty(DotmService.prototype, "data", {
            get: function () {
                return this.localDotmData;
            },
            enumerable: true,
            configurable: true
        });
        DotmService.prototype.changeDate = function (month, year) {
            this.getDotm(month, year);
        };
        DotmService.prototype.subscribeDateChange = function (callback) {
            this.subscribe(this.events.dateChanged, callback);
        };
        DotmService.prototype.getDotm = function (month, year) {
            var _this = this;
            this.apiService.getDotm(month, year).then(function (data) {
                _this.localDotmData = data;
                _this.publish(_this.events.dateChanged, null);
            }, function () {
                console.error("Cannot get DOTM.");
            });
        };
        DotmService.$inject = ["$timeout", "apiService"];
        return DotmService;
    }(Shared.PubSubServiceBase));
    Components.DotmService = DotmService;
})(Components || (Components = {}));

var Components;
(function (Components) {
    function Dotm() {
        return {
            templateUrl: '/components/dotm/directives/DotmTemplate.html',
            controller: DotmController
        };
    }
    Components.Dotm = Dotm;
    var DotmController = (function () {
        function DotmController(dotmService, apiService) {
            this.dotmService = dotmService;
            this.apiService = apiService;
        }
        Object.defineProperty(DotmController.prototype, "dotm", {
            get: function () {
                return this.dotmService.data;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DotmController.prototype, "hasUberdorks", {
            get: function () {
                return !this.dotm ? false : this.dotm.uberdorks.length > 0;
            },
            enumerable: true,
            configurable: true
        });
        DotmController.$inject = ['dotmService', 'apiService'];
        return DotmController;
    }());
    Components.DotmController = DotmController;
})(Components || (Components = {}));

var Components;
(function (Components) {
    var DotmModule = angular.module('DotmModule', []);
    DotmModule.service('dotmService', Components.DotmService);
    DotmModule.component('dotm', Components.Dotm());
})(Components || (Components = {}));

var RankingHistory;
(function (RankingHistory_1) {
    function RankingHistory() {
        return {
            templateUrl: '/areas/rankingHistory/directives/RankingHistoryTemplate.html',
            controller: RankingHistoryController
        };
    }
    RankingHistory_1.RankingHistory = RankingHistory;
    var State;
    (function (State) {
        State[State["Init"] = 0] = "Init";
        State[State["Ready"] = 1] = "Ready";
        State[State["Change"] = 2] = "Change";
    })(State || (State = {}));
    ;
    var RankingHistoryController = (function () {
        function RankingHistoryController($timeout, monthYearQueryService, dateTimeService, dotmService) {
            this.$timeout = $timeout;
            this.monthYearQueryService = monthYearQueryService;
            this.dateTimeService = dateTimeService;
            this.dotmService = dotmService;
            this.changeState(State.Init);
        }
        Object.defineProperty(RankingHistoryController.prototype, "isCurrentMonth", {
            get: function () {
                return this.month === this.dateTimeService.currentMonthValue() && this.year === this.dateTimeService.currentYear();
            },
            enumerable: true,
            configurable: true
        });
        RankingHistoryController.prototype.changeState = function (newState) {
            var _this = this;
            switch (newState) {
                case State.Init:
                    this.$timeout(function () {
                        var date = _this.monthYearQueryService.getQueryParams();
                        if (date) {
                            _this.month = date.month;
                            _this.year = date.year;
                        }
                        else {
                            _this.month = _this.dateTimeService.lastMonthValue();
                            _this.year = _this.dateTimeService.lastMonthYear();
                        }
                        _this.changeState(State.Change);
                    }, 0);
                    break;
                case State.Change:
                    this.$timeout(function () {
                        _this.monthYearQueryService.saveQueryParams(_this.month, _this.year);
                        _this.dotmService.changeDate(_this.month, _this.year);
                    }, 0);
                    this.changeState(State.Ready);
                    break;
            }
        };
        RankingHistoryController.prototype.updateQueryParams = function () {
            this.changeState(State.Change);
        };
        RankingHistoryController.$inject = ['$timeout', 'monthYearQueryService', 'dateTimeService', 'dotmService'];
        return RankingHistoryController;
    }());
    RankingHistory_1.RankingHistoryController = RankingHistoryController;
})(RankingHistory || (RankingHistory = {}));

var RankingHistory;
(function (RankingHistory) {
    var RankingHistoryModule = angular.module('RankingHistoryModule', ['UxControlsModule', 'DotmModule', 'RankingsModule']);
    RankingHistoryModule.component('rankingHistory', RankingHistory.RankingHistory());
})(RankingHistory || (RankingHistory = {}));

//# sourceMappingURL=maps/rankingHistory.js.map