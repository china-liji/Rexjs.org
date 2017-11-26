#### Statement
语句，一般是由一个主表达式构成。它拥有文档流的特性，主要用于处理该语句内所捕获的异常。

#### 常见的特殊语句
函数声明语句、类声明语句、`var`语句、`if`语句、`for`语句等等。

#### 继承关系
继承于`Rexjs.SyntaxElement`。

#### 静态属性
`FLOW_MAIN`：**Number** - 文档流主流，也是默认流。

`FLOW_BRANCH`：**Number** - 文档流分支流，主要供”继承“关系使用，并无直接使用处。

`FLOW_LINEAR`：**Number** - 文档流线性分支流，“继承”至`FLOW_BRANCH`，主要使用在`if`、`else`、`switch`等线性分支流语句上。

`FLOW_CIRCULAR`：**Number** - 文档流循环分支流，“继承”至`FLOW_BRANCH`，主要使用在`while`、`do while`、`for`等循环分支流语句上。

#### 属性
`expression`：**Rexjs.Expression** - 所绑定的主表达式，当捕获异常时，如果该属性为`null`，则不会进入`try`、`catch`方法的异常处理。

`flow`：**Number** - 文档流，默认值`Rexjs.Statement.FLOW_MAIN`。

`statements`：**Rexjs.Statements** - 该语句所处的语句块。

`target`：**Rexjs.Statement** - 目标语句，适用于子语句记录绑定的主语句，通俗来说就是记录外层语句。

#### 方法
`bindingOf`：**Rexjs.SyntaxTag** - 获取该语句`try`、`catch`方法所需返回的默认绑定标签。

`catch`：**Rexjs.SyntaxTag** - 捕获处理异常。一旦该方法返回标签，则解析器会认为异常被正确处理，并使用该返回标签替代匹配标签继续解析；如果该方法未返回标签，那么会自动跳出该语句，进入目标语句（更外一层语句）的`catch`方法，即`this.target.catch`，如果目标语句不存在，则会报语法错误。

`extractTo`：**undefined** - 提取文本内容。

`out`：**Rexjs.Expression** - 跳出该语句，其中会将该语句所绑定的表达式状态，设置到目标语句所绑定的表达式状态上，并返回目标语句所绑定的表达式。

`tagOf`：**Rexjs.SyntaxTag** - 获取该语句`try`、`catch`方法中所需使用到的标签，一般是指向实例化该语句的标签。

`try`：**Rexjs.SyntaxTag** - 尝试处理异常。一旦该方法返回标签，则解析器会认为异常被正确处理，并使用该返回标签替代匹配标签继续解析；但，如果该方法并未返回标签，且没有跳出当前语句，则会报语法错误；如果在该方法中跳出了该语句，那么会进入目标语句（更外一层语句）的`try`方法，即`this.target.try`，如果目标语句不存在，则也会报语法错误。

#### Rexjs 源码片段
```js
this.Statement = function(){
	/**
	 * 语句
	 * @param {Statements} statements - 该语句将要所处的语句块
	 */
	function Statement(statements){
		SyntaxElement.call(this);
		
		this.target = statements.statement;
		this.statements = statements;
	};
	Statement = new Rexjs(Statement, SyntaxElement);

	Statement.static({
		// 文档流主流
		FLOW_MAIN: parseInt(10, 2),
		// 文档流分支流
		FLOW_BRANCH: parseInt(100, 2),
		// 文档流线性分支流
		FLOW_LINEAR: parseInt(1100, 2),
		// 文档流循环分支流
		FLOW_CIRCULAR: parseInt(10100, 2)
	});
	
	Statement.props({
		/**
		 * 获取该语句 try、catch 方法所需返回的默认绑定标签
		 */
		bindingOf: function(){
			return this.tagOf().binding;
		},
		/**
		 * 捕获处理异常
		 * @param {SyntaxParser} parser - 语法解析器
		 * @param {Context} context - 语法标签上下文
		 */
		catch: function(parser, context){
			return null;
		},
		expression: null,
		/**
		 * 提取文本内容
		 * @param {ContentBuilder} contentBuilder - 内容生成器
		 */
		extractTo: function(contentBuilder){
			// 提取表达式内容
			this.expression.extractTo(contentBuilder);
		},
		flow: Statement.FLOW_MAIN,
		/**
		 * 跳出该语句
		 */
		out: function(){
			var target = this.target, expression = target.expression;

			// 记录当前表达式的状态，这里不能用 "|="，因为该状态是覆盖操作
			expression.state = this.expression.state;
			// 恢复语句
			this.statements.statement = target;

			// 返回目标语句的表达式
			return expression;
		},
		statements: null,
		/**
		 * 获取该语句 try、catch 方法中所需使用到的标签，一般是指向实例化该语句的标签
		 */
		tagOf: function(){
			return this.target.expression.context.tag;
		},
		target: null,
		/**
		 * 尝试处理异常
		 * @param {SyntaxParser} parser - 语法解析器
		 * @param {Context} context - 语法标签上下文
		 */
		try: function(parser, context){
			return null;
		}
	});
	
	return Statement;
}();
```