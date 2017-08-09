module PlayerStats {
    import IPlayerStats = Shared.IPlayerStats;
    import IPlayerStatsGame = Shared.IPlayerStatsGame;

    export interface IPlayerStatsService {
        playerStats: IPlayerStats;
        latestGame: IPlayerStatsGame;

        getPlayerStats(): ng.IPromise<void>;
    }

    export class PlayerStatsService {
        public static $inject: string[] = ["$location", "$q", "apiService"];
        
        private playerId: string = "";
        private errorMessageList: string[] = [];

        private localPlayerStats: IPlayerStats;

        public get playerStats(): IPlayerStats {
            return this.localPlayerStats;
        }

        public get latestGame(): IPlayerStatsGame {
            if(this.localPlayerStats) {
                return this.localPlayerStats.games[0];
            }

            return null;
        }

        constructor(private $location: ng.ILocationService,
            private $q: ng.IQService,
            private apiService: Shared.IApiService)
        {
            this.getPlayerStats();
        }

        public getPlayerStats(): ng.IPromise<void> {
            var def = this.$q.defer<void>();
            
            if (this.$location.path() !== undefined || this.$location.path() !== '') {
                this.playerId = this.$location.path();
            }

            this.apiService.getPlayerStats(this.playerId).then((playerStats) => {
                this.localPlayerStats = playerStats;
                def.resolve();
            }, () => {
                this.addErrorMessage('Cannot get active game.');
                def.reject();
            });

            return def.promise;
        }

        private addErrorMessage(message: string, clear: boolean = true) {
            if (clear) {
                this.clearerrorMessageList();
            }

            this.errorMessageList.push(message);
        }

        private clearerrorMessageList() {
            this.errorMessageList = [];
        }
    }   
}