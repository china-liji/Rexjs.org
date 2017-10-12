export let { Controller } = new function(){

this.Controller = function(){
	return class Controller {
		constructor($scope, $element, $state){
			$scope.$state = $state;

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