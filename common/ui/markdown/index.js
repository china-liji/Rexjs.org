import "./index.css";

import "/common/plugin/marked/marked.min.js";

export let { Markdown } = new function(XMLHttpRequest, marked, div, forEach){

this.Markdown = function(statusChanged, getContent, render){
	return class Markdown {
		constructor($scope, $element, $attrs, $compile){
			$element.ready(() => {
				getContent(
					$attrs.src,
					(content) => {
						render($scope, $element, $compile, content);
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
	},
	// render
	($scope, $element, $compile, content) => {
		div.textContent = content;

		$element.html(
			marked(div.innerHTML)
		);

		forEach(
			$element[0].querySelectorAll("pre code.lang-js, pre code.lang-javascript"),
			(code) => {
				var $div = angular.element("<div ng-controller='code-mirror'></div>")

				$div.text("var b = 1")

				angular.element(code.parentElement).replaceWith($div	
				)
			},
			null,
			true
		);

		div.textContent = "";
	}
);

}(
	XMLHttpRequest,
	marked,
	// div
	document.createElement("div"),
	Rexjs.forEach
);