import "./index.css";

import "../../plugin/markdown/markdown-it.min.js";

export let { Markdown } = new function(XMLHttpRequest, markdownit, modes, forEach, element){

this.Markdown = function(statusChanged, getContent, render){
	return class Markdown {
		/**
		 * markdown 语言显示区域
		 * @param {Scope} $scope - $scope
		 * @param {Element} $element - $element
		 * @param {Attrs} $attrs - $attrs
		 * @param {Function} $compile - $compile
		 */
		constructor($scope, $element, $attrs, $compile){
			// 监听元素准备事件
			$element.ready(() => {
				// 获取 markdown 文件内容
				getContent(
					$attrs.src,
					(content) => {
						// 渲染文件内容
						render($scope, $element, $compile, content);
						// 设置状态
						statusChanged($element, Markdown.STATUS_SUCCESS);
					},
					() => {
						// 设置状态
						statusChanged($element, Markdown.STATUS_ERROR);
					}
				);
			});

			// 设置状态
			statusChanged($element, Markdown.STATUS_LOADING);
		};

		/**
		 * 控制器名称
		 */
		static get controllerName(){
			return "markdown";
		};

		/**
		 * 错误状态码
		 */
		static get STATUS_ERROR(){
			return 0;
		};

		/**
		 * 载入状态码
		 */
		static get STATUS_LOADING(){
			return 1;
		};

		/**
		 * 成功状态码
		 */
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

		// 监听 load 事件
		request.addEventListener(
			"load",
			function(){
				// 如果成功
				if(this.status === 200){
					// 调用成功回调
					success(this.responseText);
					return;
				}
				
				// 调用失败回调
				fail(this.status);
			}
		);

		request.open("get", src, true);
		request.send();
	},
	// render
	($scope, $element, $compile, content) => {
		// 设置 markdown 元素的 html
		$element.html(
			// 解析 markdown 为 html
			markdownit.render(content)
		);

		// 将 markdown 里面所有 pre 设置属性，避免影响 codeMirror 里面的 pre 样式
		$element.find("pre").attr("data-markdown", "");

		// 遍历语言
		["js", "javascript", "html"].forEach((lang) => {
			// 遍历所有 js
			forEach(
				$element[0].querySelectorAll(`pre > code.language-${lang}`),
				(code) => {
					// 初始化 codeMirror 元素
					var $div = element(`<div ng-controller="code-mirror" data-tip="${lang}" data-mode="${modes[lang]}"></div>`);

					// 设置文本内容
					$div.text(
						// 为了美观，去掉前后空格
						code.textContent.trim()
					);

					// 先替换掉之前 markdown 的 pre 元素，因为 codeMirror 要计算元素显示属性
					element(code.parentElement).replaceWith($div);
					// 编译 codeMirror 控制器
					$compile($div)($scope.$new());
				},
				null,
				true
			);
		});
	}
);

}(
	XMLHttpRequest,
	// markdownit
	markdownit(),
	// modes
	{
		js: "javascript",
		javascript: "javascript",
		html: "htmlmixed"
	},
	Rexjs.forEach,
	angular.element
);