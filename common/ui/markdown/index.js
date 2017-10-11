import "./index.css";

import "/common/plugin/marked/marked.min.js";

export let { Markdown } = new function(XMLHttpRequest){

this.Markdown = function(marked, div, statusChanged, getContent){
	return class Markdown {
		constructor($scope, $element, $attrs){
			$element.ready(() => {
				getContent(
					$attrs.src,
					(content) => {
						div.textContent = content;

						$element.html(
							marked(div.innerHTML)
						);

						statusChanged($element, Markdown.STATUS_SUCCESS);
					},
					() => {
						statusChanged($element, Markdown.STATUS_ERROR);
					}
				);
			});

			statusChanged($element, Markdown.STATUS_LOADING);
		};

		static get controllerName(){
			return "markdown";
		};

		static get STATUS_ERROR(){
			return 0;
		};

		static get STATUS_LOADING(){
			return 1;
		};

		static get STATUS_SUCCESS(){
			return 2;
		};
	};
}(
	marked,
	// div
	document.createElement("div"),
	// statusChanged
	($element, status) => {
		$element.attr("data-markdownstatus", status);
	},
	// getContent
	(src, success, fail) => {
		var request = new XMLHttpRequest();

		request.addEventListener(
			"load",
			function(){
				if(this.status === 200){
					success(this.responseText);
					return;
				}
				
				fail(this.status);
			}
		);

		request.open("get", src, true);
		request.send();
	}
);

}(
	XMLHttpRequest
);