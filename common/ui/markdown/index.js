import "./index.css";

import "/common/plugin/marked/marked.min.js";

export let { Markdown } = new function(){

this.Markdown = function(){
	return class Markdown {
		constructor(){

		};

		static get controllerName(){
			return "markdown";
		};
	};
}();

}();