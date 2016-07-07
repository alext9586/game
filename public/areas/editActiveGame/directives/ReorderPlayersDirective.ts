﻿module EditActiveGame {
    export function ReorderPlayersDirective(): ng.IDirective {
        return {
            scope: {
            },
            templateUrl: '/areas/editActiveGame/directives/ReorderPlayersTemplate.html',
            controller: 'ReorderPlayersController',
            controllerAs: 'ctrl',
            bindToController: true
        };
    }

    export class ReorderPlayersController {
        public static $inject: string[] = ['$scope', 'editActiveGameService'];
        
        private selectedPlayerId: string;
        private dropZoneActive: boolean;

        private get players(): Shared.IGamePlayer[] {
            return this.editActiveGameService.players;
        }

        private set players(value: Shared.IGamePlayer[]) {
            this.editActiveGameService.players = value;
        }

        constructor(private $scope: ng.IScope, private editActiveGameService: IEditActiveGameService) {
            
        }
        
        private clickHandler(player): void {
            if (!this.dropZoneActive && !this.selectedPlayerId) {
                this.markToMove(player);
            } else if (this.dropZoneActive && this.selectedPlayerId) {
                if (this.isPlayerSelected(player)) {
                    this.unselectMove();
                } else {
                    this.dropPlayerHere(player);
                }
            }
        }

        private isPlayerSelected(player: Shared.IGamePlayer): boolean {
            return this.selectedPlayerId === player._id;
        }

        private markToMove(player: Shared.IGamePlayer): void {
            this.dropZoneActive = true;
            this.selectedPlayerId = player._id;
        }

        private unselectMove(): void {
            this.dropZoneActive = false;
            this.selectedPlayerId = null;
        }

        private dropPlayerHere(player: Shared.IGamePlayer): void {
            if (!!this.selectedPlayerId) {
                var selectedPlayer = this.players.filter(p => {
                    return p._id === this.selectedPlayerId;
                });

                if (selectedPlayer.length === 1) {
                    var selectedPlayerIndex = this.players.map(p => { return p._id; }).indexOf(this.selectedPlayerId);
                    this.players.splice(selectedPlayerIndex, 1);

                    var dropIndex = this.players.map(p => { return p._id; }).indexOf(player._id);
                    this.players.splice(dropIndex, 0, selectedPlayer[0]);
                }
            }

            this.unselectMove();
        };
    }
}