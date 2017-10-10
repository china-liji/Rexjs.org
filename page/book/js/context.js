import { Markdown } from "/common/ui/markdown";

debugger

export let { Controller } = new function(reset){

this.Controller = function(defineProperty){
	return class Controller {
		constructor($state){
			this.$state = $state;
		};

		static get controllerName(){
			return "book-context";
		};
	};
}(
	Object.defineProperty
);

}();