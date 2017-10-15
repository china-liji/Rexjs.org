export let { Controller } = new function(){

this.Controller = function(){
	return class Controller {
		constructor(GIT_REPO, $scope){
			$scope.issues = GIT_REPO + "/issues";
		};

		static get controllerName(){
			return "feedback";
		};
	};
}();

}();