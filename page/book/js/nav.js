export let { Controller } = new function(){

this.Controller = function(){
	return class Controller {
		constructor($scope, $element, $state){
			$scope.$state = $state;

			$scope.getFocusedName = () => {
				// 返回文本内容
				return $element[0].querySelector(`a[data-focus="true"]`).textContent;
			};

			// 监听元素就绪
			$element.ready(() => {
				var name = $state.params.name;

				// 遍历数据
				$scope.books.every((book) => {
					// 如果名称一致
					if(book.name === name){
						// 展开书籍目录
						book.fold = false;

						$scope.$apply();
						return false;
					}

					return true;
				});

				// 显示元素
				$element.removeAttr("hidden");
			});
		};

		static get controllerName(){
			return "book-nav";
		};
	};
}();

}();