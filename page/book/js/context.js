export let { Controller } = new function(reset){

this.Controller = function(defineProperty){
	return class Controller {
		constructor($scope, $state){
			var params = $state.params;

			$scope.path = `${params.name}/${params.nav}`;
		};

		static get controllerName(){
			return "book-context";
		};
	};
}(
	Object.defineProperty
);

}();