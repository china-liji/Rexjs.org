import "../js-beautify/beautify.min.js";

export let { Editor, Transformer, CodeMirror } = new function(ECMAScriptParser, RegExp, LINE_TERMINATOR_REGEXP_SOURCE, defaults, forEach){

this.CodeMirror = function(OriginMirror, assign, formatTextContent){
	return class CodeMirror {
		constructor($scope, $element, $attrs){
			var originMirror;
			
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
				var code = $attrs.code || "";

				if($scope.$emit("code-mirror-fill-code", code).defaultPrevented){
					return;
				}

				originMirror.setValue(code);
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

this.Transformer = function(CodeMirror, File, parser, js_beautify){
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
	new ECMAScriptParser(),
	js_beautify
);

}(
	Rexjs.ECMAScriptParser,
	RegExp,
	// LINE_TERMINATOR_REGEXP_SOURCE
	/(?:^|\r\n?|\n|\u2028|\u2029)/.source,
	// defaults
	{
		lineNumbers: true,
		styleActiveLine: true,
		matchBrackets: true,
		readOnly: true
	},
	Rexjs.forEach
);