#### 解析示例
本示例是拿`Rexjs`已支持的**特有**语法 - `try function(){}`来做示范。

#### 备注
以下所阐述的，主要是解析表达式级别的语法，如：`(try fn())`或`!try fn()`；并不是语句级别的语法，如：`try fn()`。语句级别的语法解析，`Rexjs`在`try catch`的解析中做了简单处理，在这并不提及，但原理最后还是转换为了表达式形式的语法。

#### 源码
```js
/**
 * 同步获取数据
 * @param {String} url - 请求地址，必填参数。
 * @param {Object} _params - 请求数据，可选参数。
 * @param {Function} _beforeRequest - 请求数据前的回调函数，可选参数。
 * @param {Function} _afterResponse - 请求数据后的回调函数，可选参数。
 **/
function getDataSync(url, _params, _beforeRequest, _afterResponse){
	// 如果 _beforeRequest 返回 true，那么终止请求
	if(try _beforeRequest(_params)){
		return;
	}

	var data = ...; // 请求数据等

	// 处理数据
	return try _afterResponse(data) || data;
};
```

#### 源码效果
如果`try`的目标存在且是函数，则返回函数返回值，否则返回`undefined`。

#### 解析后等效代码
该代码并非解析后代码，解析后的代码对函数判断进行封装过，这里的代码并没有封装，只是等效展示。

```js
/**
 * 同步获取数据
 * @param {String} url - 请求地址，必填参数。
 * @param {Object} _params - 请求数据，可选参数。
 * @param {Function} _beforeRequest - 请求数据前的回调函数，可选参数。
 * @param {Function} _afterResponse - 请求数据后的回调函数，可选参数。
 **/
function getDataSync(url, _params, _beforeRequest, _afterResponse){
	// 如果 _beforeRequest 是函数且返回 true，那么终止请求
	if(typeof _beforeRequest === "function" ? _beforeRequest(_params) : undefined){
		return;
	}

	var data = ...; // 请求数据、处理数据等

	// 如果 _afterResponse 是函数，返回函数回调值
	return (typeof _afterResponse === "function" ? _afterResponse(data) : undefined) || data;
};
```

#### 解析目的
很多时候，回调函数可以不被提供，但是每次都要判断是否存在，再去执行，很麻烦，所以我们决定，将其大大简化，提供了该表达式的解析。

#### 分步代码
取自[try-function.js](https://github.com/china-liji/Rexjs/tree/master/source/map/try-function.js)。

1. 定义主表达式：该表达式没有做主要的解析功能，原因是在解析代码时，当出现`try`的时候，不能确定是否为`try function`还是`try catch`，所以它是一个过渡性质的表达式，且主要功能是统一语法，即一元表达式。

```js
this.TryFunctionExpression = function(extractTo){
	/**
	 * 尝试执行函数表达式
	 * @param {Context} context - 标签上下文
	 */
	function TryFunctionExpression(context){
		UnaryExpression.call(this, context);
	};
	TryFunctionExpression = new Rexjs(TryFunctionExpression, UnaryExpression);

	TryFunctionExpression.props({
		/**
		 * 提取表达式文本内容
		 * @param {ContentBuilder} contentBuilder - 内容生成器
		 */
		extractTo: function(contentBuilder){
			// 如果需要编译
			if(config.rexjs){
				// 直接提取操作对象
				this.operand.extractTo(contentBuilder);
				return;
			}

			// 调用父类方法
			extractTo.call(this, contentBuilder);
		}
	});

	return TryFunctionExpression;
}(
	UnaryExpression.prototype.extractTo
);
```

2. 定义副表达式：该表达式虽然是副表达式，但主导着解析语法的功能。

```js
this.FunctionConvertorExpression = FunctionConvertorExpression = function(AccessorExpression, extractAccessor){
	/**
	 * 函数转换器表达式
	 * @param {Expression} func - 标签上下文
	 */
	function FunctionConvertorExpression(func){
		Expression.call(this, func.context);

		this.function = func;
	};
	FunctionConvertorExpression = new Rexjs(FunctionConvertorExpression, Expression);

	FunctionConvertorExpression.props({
		called: true,
		function: null,
		/**
		 * 提取表达式文本内容
		 * @param {ContentBuilder} contentBuilder - 内容生成器
		 */
		extractTo: function(contentBuilder){
			var func = this.function;

			// 如果需要编译
			if(config.rexjs){
				// 追加转换方法
				contentBuilder.appendString("(Rexjs.Function.convert(");

				// 如果函数是访问器形式的
				if(func instanceof AccessorExpression){
					// 以访问器形式提取
					extractAccessor(contentBuilder, func, func.property);
				}
				else {
					// 直接提取
					func.extractTo(contentBuilder);
				}

				// 追加转换方法的结束小括号
				contentBuilder.appendString(
					// 如果没有带执行方法的小括号，则加上
					"))" + (this.called ? "" : "()")
				);

				return;
			}

			// 直接提取
			func.extractTo(contentBuilder);
		}
	});

	return FunctionConvertorExpression;
}(
	this.AccessorExpression,
	// extractAccessor
	function(contentBuilder, func, property){
		// 先提取函数所属对象
		func.object.extractTo(contentBuilder);

		// 追加 convert 方法的参数分隔符
		contentBuilder.appendString(",");

		// 如果是匹配组表达式，则说明是中括号 window["a"] 形式的访问器
		if(property instanceof PartnerExpression){
			// 将起始中括号改成小括号
			contentBuilder.appendString("(");
			// 提取括号内部表达式
			property.inner.extractTo(contentBuilder);
			// 将结束中括号改成小括号
			contentBuilder.appendString(")");
			return;
		}

		// 将标识符用双引号包括起来
		contentBuilder.appendString('"');
		// 提取标识符
		contentBuilder.appendContext(property);
		// 将标识符用双引号包括起来
		contentBuilder.appendString('"');
	}
);
```

3. 定义语句：语句的功能，一般都是在捕获异常时，对语法进行验证，确保语法正确性。

```js
this.TryFunctionStatement = function(UnaryStatement, setOperand){
	/**
	 * 尝试执行函数语句
	 * @param {Statements} statements - 该语句将要所处的语句块
	 */
	function TryFunctionStatement(statements){
		UnaryStatement.call(this, statements);
	};
	TryFunctionStatement = new Rexjs(TryFunctionStatement, UnaryStatement);
	
	TryFunctionStatement.props({
		/**
		 * 捕获处理异常
		 * @param {SyntaxParser} parser - 语法解析器
		 * @param {Context} context - 语法标签上下文
		 */
		catch: function(){
			// 设置 operand
			setOperand(this, this.expression);
		},
		/**
		 * 尝试处理异常
		 * @param {SyntaxParser} parser - 语法解析器
		 * @param {Context} context - 语法标签上下文
		 */
		try: function(parser, context){
			var expression = this.expression;

			// 如果一元标签验证该标签为表达式分隔符标签
			if(this.target.expression.context.tag.isSeparator(context, expression)){
				// 设置 operand
				setOperand(this, expression);
			}
		}
	});
	
	return TryFunctionStatement;
}(
	this.UnaryStatement,
	// setOperand
	function(statement, expression){
		// 如果是函数调用表达式
		if(expression instanceof CallExpression){
			// 将函数调用表达式的操作对象设置为 函数转换器表达式
			expression.operand = new FunctionConvertorExpression(expression.operand);
		}
		else {
			// 直接设置表达式为 函数转换器表达式
			expression = new FunctionConvertorExpression(expression);
			// 并告知函数转换器表达式，并没有被手动调用
			expression.called = false;
		}

		// 设置操作对象
		statement.out().operand = expression;
	}
);
```

4. 定义标签：标签的作用，就是定义正则，并在访问时，设置当前表达式和语句，偶尔也会验证一些语法。

```js
this.TryFunctionTag = function(ExecTag, TryFunctionExpression, TryFunctionStatement){
	/**
	 * 尝试执行函数的 try 标签
	 * @param {Number} _type - 标签类型
	 */
	function TryFunctionTag(_type){
		ExecTag.call(this, _type);
	};
	TryFunctionTag = new Rexjs(TryFunctionTag, ExecTag);

	TryFunctionTag.props({
		regexp: /try/,
		/**
		 * 标签访问器
		 * @param {SyntaxParser} parser - 语法解析器
		 * @param {Context} context - 标签上下文
		 * @param {Statement} statement - 当前语句
		 * @param {Statements} statements - 当前语句块
		 */
		visitor: function(parser, context, statement, statements){
			// 设置当前表达式
			statement.expression = new TryFunctionExpression(context);
			// 设置当前语句
			statements.statement = new TryFunctionStatement(statements);
		}
	});

	return TryFunctionTag;
}(
	this.ExecTag,
	this.TryFunctionExpression,
	this.TryFunctionStatement
);
```

#### 其他代码 - 注册标签

1. `Rexjs`内部注册标签
取自[tags-base.js](https://github.com/china-liji/Rexjs/tree/master/source/map/tags-base.js)。

```js
this.ExpressionTags = function(list){
	/**
	 * 表达式标签列表
	 */
	function ExpressionTags(){
		ECMAScriptTags.call(this);
		
		this.delegate(list);
	};
	ExpressionTags = new Rexjs(ExpressionTags, ECMAScriptTags);
	
	...
	...
	
	return ExpressionTags;
}(
	// list
	[
		...,
		this.TryFunctionTag,
		...
	]
);
```

2. `Rexjs`外部注册标签，即以插件形式
非文件引用。

```js
new function(ECMAScriptTagsMap){

this.MyNewExpressionTags = function(ExpressionTags, TryFunctionTag){
	/**
	 * 我的新表达式标签列表
	 */
	function MyNewExpressionTags(){
		ExpressionTags.call(this);
		
		this.register(
			new TryFunctionTag()
		);
	};
	MyNewExpressionTags = new Rexjs(MyNewExpressionTags, ExpressionTags);

	return MyNewExpressionTags;
}(
	Rexjs.ExpressionTags,
	Rexjs.TryFunctionTag
);

// 绑定并代替现有的 expressionTags
ECMAScriptTagsMap.bind("expressionTags", this.MyNewExpressionTags);
}(
	Rexjs.ECMAScriptTagsMap
);
```

#### 解析完毕
好了，看到这里，这个较复杂的解析也已经完毕，已经可以让代码支持以上`demo`的写法了。