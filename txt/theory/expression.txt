#### Expression
表达式，是由数字、变量、运算符等以能求得结果的组合。一个表达式，可能包含一个或多个子表达式，它是语句与标签的沟通桥梁。

#### 常见的表达式
函数表达式、标识符表达式、一元表达式、二元表达式、三元表达式、小括号分组表达式等等。

#### 继承关系
继承于`Rexjs.SyntaxElement`。

#### 静态属性
`STATE_NONE`：**Number** - 无状态。

`STATE_EXPRESSION_END`：**Number** - 表达式结束状态，表示当前表达式是一个完整的表达式。

`STATE_STATEMENT_ENDABLE`：**Number** - 语句可结束状态，“继承”至`STATE_EXPRESSION_END`。表示当前语句已经是一个完整语句，就算没有明确的语句分隔符（如分号），后面也可以接其他语句。一般由换行符进行设定，出现该状态的情况下，理应满足`ASI`机制。

`STATE_STATEMENT_END`：**Number** - 语句结束状态，“继承”至`STATE_STATEMENT_ENDABLE`。表示当前语句已经是一个完整语句，就算不换行，后面也可以接其他语句，一般由分号进行设定。当开始编译，进行语句连接时，应该在两语句之间加语句连接符，如分号等。

`STATE_STATEMENT_ENDED`：**Number** - 语句已结束状态，“继承”至`STATE_STATEMENT_END`。表示当前语句已经是一个完整语句，就算不换行，后面也可以接其他语句，一般直接在表达式中以只读形式设置。当开始编译，进行语句连接时，不需要再加语句连接符，如分号等。

#### 属性
`context`：**Rexjs.Context** - 标签在语法文件中所匹配的上下文。

`default`：**Boolean** - 获取是否为默认表达式，只读。

`empty`：**Boolean** - 获取是否为空表达式，只读。

`state`：**Number** - 表达式状态。

#### 方法
`compileTo`：**undefined** - 提取并编译表达式文本内容，即需要将高版本语法转换为低版本语法，一般编译条件由其他表达式的`extractTo`或`compileTo`方法内部确定，并且需要主动调用。

`extractTo`：**undefined** - 提取表达式文本内容，此方法也可以编译表达式，但一般编译条件是由该方法内部确定，是默认的、自动的提取方式。

#### Rexjs 源码片段
```js
this.Expression = function(parseInt){
	/**
	 * 表达式
	 * @param {Context} context - 语法标签上下文
	 */
	function Expression(context){
		SyntaxElement.call(this);
		
		this.context = context;
	};
	Expression = new Rexjs(Expression, SyntaxElement);
	
	Expression.static({
		// 无状态
		STATE_NONE: parseInt(0, 2),
		// 表达式结束状态
		STATE_EXPRESSION_END: parseInt(10, 2),
		// 语句可结束状态
		STATE_STATEMENT_ENDABLE: parseInt(110, 2),
		// 语句结束状态，当开始编译，进行语句连接时，应该在两语句之间加语句连接符，如分号等
		STATE_STATEMENT_END: parseInt(1110, 2),
		// 语句已结束状态，当开始编译，进行语句连接时，不需要再加语句连接符，如分号等
		STATE_STATEMENT_ENDED: parseInt(11110, 2)
	});
	
	Expression.props({
		/**
		 * 提取并编译表达式文本内容
		 * @param {ContentBuilder} contentBuilder - 内容生成器
		 * @param {ContentBuilder} _anotherBuilder - 另一个内容生成器，一般用于副内容的生成或记录
		 */
		compileTo: function(contentBuilder, _anotherBuilder){
			this.extractTo(contentBuilder, _anotherBuilder);
		},
		context: null,
		/**
		 * 获取是否为默认表达式
		 */
		get default(){
			return false;
		},
		/**
		 * 获取是否为空表达式
		 */
		get empty(){
			return false;
		},
		/**
		 * 提取表达式文本内容
		 * @param {ContentBuilder} contentBuilder - 内容生成器
		 */
		extractTo: function(contentBuilder){
			contentBuilder.appendContext(this.context);
		},
		state: Expression.STATE_NONE
	});
	
	return Expression;
}(
	parseInt
);
```