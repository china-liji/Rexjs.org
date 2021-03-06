import "../../plugin/code-mirror/code-mirror.css";

import "../../plugin/code-mirror/code-mirror.min.js";
import "../../plugin/js-beautify/js-beautify.min.js";

export let { Editor, Transformer, CodeMirror } = new function(ECMAScriptParser, RegExp, LINE_TERMINATOR_REGEXP_SOURCE, js_beautify, defaults, forEach){

this.CodeMirror = function(OriginMirror, assign, formatTextContent){
	return class CodeMirror {
		constructor($scope, $element, $attrs){
			var originMirror, hasCode = $attrs.hasOwnProperty("code"), text = $element.text();
			
			$element.html("");

			this.originMirror = originMirror = new OriginMirror(
				$element[0],
				assign(
					{
						mode: $attrs.mode || "javascript",
						theme: $attrs.theme || "default"
					},
					defaults,
					this.options
				),
				defaults
			);

			$element.ready(() => {
				var code = $attrs.hasOwnProperty("code") ? $attrs.code : text;

				if($scope.$emit("code-mirror-fill-code", code).defaultPrevented){
					return;
				}

				originMirror.setValue(
					$attrs.hasOwnProperty("beautify") && $attrs.beautify !== "false" ?
						js_beautify(code) :
						code
				);

				$scope.$emit("code-mirror-ready");
			});
		};

		static get controllerName(){
			return "code-mirror";
		};

		get options(){
			return {};
		};
	};
}(
	window.CodeMirror,
	// assign
	(obj, ...objs) => {
		// 兼容 IE
		objs.forEach((o) => {
			forEach(o, (value, name) => obj[name] = value);
		});

		return obj;
	},
	// formatTextContent
	(element) => {
		return (
			element
				.querySelector("noscript")
				.textContent
				.trim()
				.replace(
					new RegExp(
						`(${LINE_TERMINATOR_REGEXP_SOURCE})${
							element.innerHTML.match(
								new RegExp(`${LINE_TERMINATOR_REGEXP_SOURCE}([ \t]*)<noscript`)
							)[1]
						}(?:\t| {0, 4})`,
						"g"
					),
					"$1"
				)
		);
	}
);

this.Editor = function(CodeMirror){
	return class Editor extends CodeMirror {
		constructor($scope, $element, $attrs){
			super(
				$scope,
				$element,
				$attrs
			)
			.originMirror
			.on(
				"change",
				() => {
					$scope.$emit(
						"editor-change",
						this.originMirror.getValue()
					);

					if($scope.$$phase === "$digest"){
						return;
					}

					$scope.$apply();
				}
			);
		};

		static get controllerName(){
			return "editor";
		};

		get options(){
			return {
				autofocus: true,
				readOnly: false
			};
		};
	};
}(
	this.CodeMirror
);

this.Transformer = function(CodeMirror, File, parser){
	return class Transformer extends CodeMirror {
		constructor($scope, $element, $attrs){
			super($scope, $element, $attrs);

			$scope.$on(
				"code-mirror-fill-code",
				(e, code) => {
					try {
						parser.parse(
							new File("test.js", code)
						);

						$scope.$emit("transformer-success");
					}
					catch(e){
						$scope.$emit(
							"transformer-error",
							e.toString()
						);

						return;
					}

					this.originMirror.setValue(
						js_beautify(
							parser.build()
						)
					);

					e.preventDefault();
				}
			);
		};

		static get controllerName(){
			return "transformer";
		};

		get options(){
			return {};
		};
	};
}(
	this.CodeMirror,
	Rexjs.File,
	// parser
	new ECMAScriptParser()
);

}(
	Rexjs.ECMAScriptParser,
	RegExp,
	// LINE_TERMINATOR_REGEXP_SOURCE
	/(?:^|\r\n?|\n|\u2028|\u2029)/.source,
	js_beautify,
	// defaults
	{
		lineNumbers: true,
		styleActiveLine: true,
		matchBrackets: true,
		readOnly: true
	},
	Rexjs.forEach
);