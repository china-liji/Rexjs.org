export let { Controller } = new function(){

this.Controller = function(angular, document){
	return class Controller {
		constructor($scope, $element){
			$scope.$on(
				"syntax-list-go",
				(e, name) => {
					e.preventDefault();

					angular
						.element(
							document.getElementById("preview-details")
						)
						.scope()
						.$emit(
							"preview-details-scroll-into-view",
							name
						);
				}
			);
		};

		static get controllerName(){
			return "preview-nav";
		};
	};
}(
	angular,
	document
);

}();