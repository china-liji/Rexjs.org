export let { Controller } = new function(){

this.Controller = function(angular){
	return class Controller {
		constructor($scope, $element){
			$scope.error = "";

			$scope.$on(
				"editor-change",
				(e, value) => {
					$scope;

					angular.element(
							$element[0].querySelector('[ng-controller="transformer"]')
						)
						.scope()
						.$emit(
							"code-mirror-fill-code",
							value
						);
				}
			);

			$scope.$on(
				"transformer-success",
				(e, error) => {
					$scope.error = "";
				}
			);

			$scope.$on(
				"transformer-error",
				(e, error) => {
					$scope.error = error;
				}
			);
		};

		static get controllerName(){
			return "home-code";
		};
	};
}(
	angular
);

}();