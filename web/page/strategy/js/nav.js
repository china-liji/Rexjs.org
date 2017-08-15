export let { Controller } = new function(){

this.Controller = function(){
	return class Controller {
		constructor($scope, $state){
			$scope.$state = $state;
		};

		static get controllerName(){
			return "strategy-nav";
		};
	};
}();

}();