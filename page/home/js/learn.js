import example from "../example/learn.html";

export let { Controller } = new function(){

this.Controller = function(){
	return class Controller {
		constructor(GIT_REPO, $scope){
			$scope.example = example;
			$scope.repo = GIT_REPO;
		};

		static get controllerName(){
			return "home-learn";
		};
	};
}();

}();