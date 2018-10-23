#### Statements
语句块，也称语句列表，顾名思义，是由多个语句组成，是一个伪数组。它拥有作用域等特性，主要用于创建及初始化同类型语句。

#### 常见的语句块
全局语句块、块级（大括号）语句块、函数主体语句块等等。

#### 继承关系
继承于`Rexjs.SyntaxElement`。

#### 静态属性
`SCOPE_GLOBAL`：**Number** - 全局作用域，默认作用域。

`SCOPE_BLOCK`：**Number** - 块级作用域，一般用于块级（大括号）语句块。

`SCOPE_CLOSURE`：**Number** - 闭包作用域，一般用于函数主体语句块。

`SCOPE_LAZY`：**Number** - 惰性闭包作用域，“继承”至`SCOPE_CLOSURE`，一般用于特殊的闭包处理使用。如：箭头函数主体闭包，因为箭头函数主体内部不能使用`target`，具有局限性，所以我们将其闭包称之为惰性闭包作用域，即`SCOPE_LAZY`。

#### 属性
`join`：**String** - 语句分隔符，默认值`;`：提取列表中的语句时，用于两两语句拼接时的连接符，类似数组的`[].join(";")`。

`length`：**Number** - 列表长度，默认值`0`，标志着语句的个数。

`min`：**Number** - 提取语句时，默认值`0`，决定从第几个语句开始提取。

`reference`：**String** - 所绑定的引用对象，默认值`this`。

`scope`：**Number** - 作用域，默认值`Rexjs.Statements.SCOPE_GLOBAL`。

`statement`：**Rexjs.Statement** - 当前语句。

`target`：**Rexjs.Statements** - 目标语句块，用于记录外层语句块。

#### 方法
`clear`：**undefined** - 清空语句块。

`extractTo`：**undefined** - 提取文本内容。

`initStatement`：**Rexjs.Statement** - 初始化语句。

`newStatement`：**Rexjs.Statement** - 创建新语句。

`splice`：**Array** - `Array.prototype.splice`。


#### Rexjs 源码片段
```js
this.Statements = function(Statement, STATE_STATEMENT_ENDED, parseInt){
	/**
	 * 语句块
	 * @param {Statements} target - 目标语句块，即上一层语句块
	 */
	function Statements(target){
		SyntaxElement.call(this);
		
		// 记录目标语句块
		this.target = target;

		// 初始化语句
		this.newStatement();
	};
	Statements = new Rexjs(Statements, SyntaxElement);

	Statements.static({
		// 全局作用域
		SCOPE_GLOBAL: parseInt(10, 2),
		// 块级作用域
		SCOPE_BLOCK: parseInt(100, 2),
		// 闭包作用域
		SCOPE_CLOSURE: parseInt(1000, 2),
		// 惰性闭包作用域，一般用于特殊的闭包处理使用
		SCOPE_LAZY: parseInt(11000, 2)
	});
	
	Statements.props({
		/**
		 * 清空语句块
		 */
		clear: function(){
			// 清空当前语句
			this.statement = null;
			
			// 清空列表
			this.splice(0);
		},
		/**
		 * 提取文本内容
		 * @param {ContentBuilder} contentBuilder - 内容生成器
		 */
		extractTo: function(contentBuilder){
			var join = this.join;

			// 遍历所有语句
			for(var i = this.min, j = this.length;i < j;i++){
				var statement = this[i];

				// 提取语句
				statement.extractTo(contentBuilder);

				// 如果表达式状态是 STATE_STATEMENT_ENDED，则说明不需要加语句连接符
				if((statement.expression.state & STATE_STATEMENT_ENDED) === STATE_STATEMENT_ENDED){
					continue;
				}
				
				// 追加语句连接符
				contentBuilder.appendString(join);
			}
		},
		/**
		 * 初始化语句
		 */
		initStatement: function(){
			return new Statement(this);
		},
		join: ";",
		length: 0,
		min: 0,
		/**
		 * 创建新语句
		 */
		newStatement: function(){
			// 先清空当前语句
			this.statement = null;
			return this.statement = this[this.length++] = this.initStatement();
		},
		reference: "this",
		scope: Statements.SCOPE_GLOBAL,
		splice: Array.prototype.splice,
		statement: null,
		target: null
	});
	
	return Statements;
}(
	this.Statement,
	this.Expression.STATE_STATEMENT_ENDED,
	parseInt
);
```