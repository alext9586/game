module Components {
    export function NewPlayerPanelDirective(): ng.IDirective {
        return {
            scope: {
			},
			templateUrl: "/components/newPlayerPanel/directives/NewPlayerPanelTemplate.html",
			controller: "NewPlayerPanelController",
			controllerAs: "ctrl",
			bindToController: true
        };
    }

    export class NewPlayerPanelController {
        public static $inject: string[] = ["newPlayerPanelService"];

        private addPlayerForm: ng.IFormController;
        private player: Shared.IPlayer = new Shared.Player();
        private disabled: boolean;
        private showError: boolean;

        constructor(private panelService: INewPlayerPanelService) {
			this.resetForm();
        }

        private resetForm(): void {
			this.player = new Shared.Player();

			if (this.addPlayerForm) {
				this.addPlayerForm.$setPristine();
				this.addPlayerForm.$setUntouched();
			}

            this.disabled = false;
            this.showError = false;
		}

        private cancel(): void {
            this.resetForm();
            this.panelService.formActive = false;
        }

        private save(): void {
            this.showError = false;
            this.disabled = true;
            this.panelService.savePlayer(this.player).then(() => {
                this.resetForm();
            }, (data) => {
                console.error(data);
                this.showError = true;
                this.disabled = false;
            });
        }
    }
}
