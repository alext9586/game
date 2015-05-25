var GlobalNavDirective = function() {
	return {
		scope: {

		},
		templateUrl: '/directives/GlobalNavTemplate.html',
		controller: 'GlobalNavController',
		controllerAs: 'ctrl',
		bindToController: true
	};
}

var GlobalNavController = function ($scope) {
	var me = this;

	this.closeSidebar = function() {
		if(me.sidebarOpen === true){
			me.sidebarOpen = false;
		}
	}
}

GlobalNavController.$inject = ['$scope'];

DorkModule.controller('GlobalNavController', GlobalNavController);
DorkModule.directive('globalNav', GlobalNavDirective);