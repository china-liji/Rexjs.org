export let { Controller } = new function(reset){

this.Controller = function(defineProperty){
	return class Controller {
		constructor($scope, $state){
			$scope.nav = $state.params.nav;
		};

		static get controllerName(){
			return "book-context";
		};
	};
}(
	Object.defineProperty
);

}();