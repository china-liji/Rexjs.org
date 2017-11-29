export let { Controller } = new function(){

this.Controller = function(){
	return class Controller {
		constructor($scope, $element, $stateParams){
			var name = $stateParams.name;
		
			$scope.$on(
				"preview-details-scroll-into-view",
				(e, name) => {
					$element[0].querySelector(`dt[data-name="${name}"]`).scrollIntoView();
				}
			);

			if(!name){
				return;
			}

			$element.ready(() => {
				var i = 0, max = $element[0].querySelectorAll("li[data-item]").length;

				$scope.$on(
					"code-mirror-ready",
					function(){
						if(++i < max){
							return;
						}

						$scope.$emit("preview-details-scroll-into-view", name);
					}
				);
			});
		};

		static get controllerName(){
			return "preview-details";
		};
	};
}();

}();