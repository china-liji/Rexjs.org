import "../code-mirror/codemirror.css";

import "../code-mirror/codemirror.min.js";
import "../js-beautify/beautify.min.js";

export let { Editor, Transformer, CodeMirror } = new function(RegExp, LINE_TERMINATOR_REGEXP_SOURCE, defaults){

this.CodeMirror = function(OriginMirror, set, formatTextContent){
	return class CodeMirror {
		constructor($element, $attrs){
			var originMirror, { 0: element, 0: { textContent } } = $element, mode = $attrs.mode || "javascript";

			if(mode === "htmlmixed"){
				textContent = formatTextContent(element);
			}
			else {
				textContent = textContent.trim();
			}

			element.innerHTML = "";

			originMirror = new OriginMirror(
				element,
				set(
					set(
						{
							mode,
							theme: $attrs.theme || "default"
						},
						defaults
					),
					this.options
				),
				defaults
			);

			originMirror.setValue(textContent);

			this.originMirror = originMirror;
		};

		get options(){
			return {};
		};

		static get controllerName(){
			return "codeMirror";
		};
	};
}(
	window.CodeMirror,
	Rexjs.set,
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
			var originMirror = super($element, $attrs).originMirror;

			originMirror.on(
				"change",
				() => {
					$scope.$apply(() => {
						$scope.$emit(
							"editor-change",
							originMirror.getValue()
						);
					});
				}
			);
		};

		get options(){
			return {
				autofocus: true,
				readOnly: false
			};
		};

		static get controllerName(){
			return "editor";
		};
	};
}(
	this.CodeMirror
);

this.Transformer = function(CodeMirror, ECMAScriptParser, File, js_beautify){
	return class Transformer extends CodeMirror {
		constructor($scope, $element, $attrs){
			var originMirror = super($element, $attrs).originMirror, parser = new ECMAScriptParser();
			
			$scope.$watch(
				"code",
				(value) => {
					try {
						parser.parse(
							new File("test", value)
						);

						$scope.$emit("transformer-success");
					}
					catch(e){
						$scope.$emit("transformer-error", e.toString());
						return;
					}

					originMirror.setValue(
						js_beautify(
							parser.build()
						)
					);
				}
			);

			$scope.code = originMirror.getValue();
		};

		get options(){
			return {};
		};

		static get controllerName(){
			return "transformer";
		};
	};
}(
	this.CodeMirror,
	Rexjs.ECMAScriptParser,
	Rexjs.File,
	js_beautify
);

}(
	RegExp,
	// LINE_TERMINATOR_REGEXP_SOURCE
	/(?:^|\r\n?|\n|\u2028|\u2029)/.source,
	// defaults
	{
		lineNumbers: true,
		styleActiveLine: true,
		matchBrackets: true,
		readOnly: true
	}
);