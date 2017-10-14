export let { Controller } = new function(){

this.Controller = function(){
	return class Controller {
		constructor($scope, $element, $state){
			$scope.$state = $state;

			$scope.getFocusedName = () => {
				return $element[0].querySelector(`a[data-focus="true"]`).textContent;
			};

			$element.ready(() => {
				var name = $state.params.name;

				$scope.books.every((book) => {
					if(book.name === name){
						book.fold = false;

						$scope.$apply();
						return false;
					}

					return true;
				});

				$element.removeAttr("hidden");
			});
		};

		static get controllerName(){
			return "book-nav";
		};
	};
}();

}();