export let { Controller } = new function(){

this.Controller = function(document, defineProperty, element){
	return class Controller {
		constructor($scope, $element, $state){
			var { name, nav } = $state.params;

			$scope.path = `${name}/${nav}`;

			$element.ready(() => {
				$element[0].querySelector("#book-context > dt").textContent = (
					element(
						document.getElementById("book-nav")
					)
					.scope()
					.getFocusedName()
				);
			});
		};

		static get controllerName(){
			return "book-context";
		};
	};
}(
	document,
	Object.defineProperty,
	angular.element
);

}();