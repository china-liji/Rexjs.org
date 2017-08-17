import example from "../example/learn.html";

export let { Controller } = new function(){

this.Controller = function(){
	return class Controller {
		constructor($scope){
			$scope.example = example;
		};

		static get controllerName(){
			return "home-learn";
		};
	};
}();

}();