#### TagClass
标签性质定位的类别，其中包括“无”、“表达式”、“表达式上下文”、“语句”、“语句起始”以及“语句结束”。

#### 继承关系
继承于`Rexjs.TagData`。

#### 静态属性
`CLASS_EXPRESSION`：**Number** - 表达式标签类别，“继承”至`CLASS_STATEMENT_BEGIN`，因为每一个表达式都可以作为语句的开始。

`CLASS_EXPRESSION_CONTEXT`：**Number** - 表达式上下文标签类别。

`CLASS_NONE`：**Number** - 无类别。

`CLASS_STATEMENT`：**Number** - 语句标签类别，一般不直接设置，而是用于判断“继承”关系。

`CLASS_STATEMENT_BEGIN`：**Number** - 语句起始标签类别，“继承”至`CLASS_STATEMENT`。

`CLASS_STATEMENT_END`：**Number** - 语句结束标签类别，“继承”至`CLASS_STATEMENT`。

#### 属性
`expression`：**Booelan** - 是否为表达式标签类别。

`expressionContext`：**Booelan** - 是否为表达式上下文标签类别。

`statement`：**Booelan** - 是否为语句标签类别。

`statementBegin`：**Booelan** - 是否为语句起始标签类别。

`statementEnd`：**Booelan** - 是否为语句结束标签类别。

#### Rexjs 源码片段
```js
this.TagClass = function(CLASS_NONE, CLASS_STATEMENT, CLASS_STATEMENT_BEGIN, CLASS_STATEMENT_END, CLASS_EXPRESSION, CLASS_EXPRESSION_CONTEXT){
	/**
	 * 标签性质定位的类别
	 * @param {Number} value - 标签类别
	 */
	function TagClass(value){
		TagData.call(this, value);

		this.expression = (value & CLASS_EXPRESSION) === CLASS_EXPRESSION;
		this.expressionContext = (value & CLASS_EXPRESSION_CONTEXT) === CLASS_EXPRESSION_CONTEXT;
		this.statement = (value & CLASS_STATEMENT) === CLASS_STATEMENT;
		this.statementBegin = (value & CLASS_STATEMENT_BEGIN) === CLASS_STATEMENT_BEGIN;
		this.statementEnd = (value & CLASS_STATEMENT_END) === CLASS_STATEMENT_END;
	};
	TagClass = new Rexjs(TagClass, TagData);

	TagClass.static({
		// 表达式标签类别
		CLASS_EXPRESSION: CLASS_EXPRESSION,
		// 表达式上下文标签类别
		CLASS_EXPRESSION_CONTEXT: CLASS_EXPRESSION_CONTEXT,
		// 无标签分类
		CLASS_NONE: CLASS_NONE,
		// 语句标签类别
		CLASS_STATEMENT: CLASS_STATEMENT,
		// 语句起始标签类别
		CLASS_STATEMENT_BEGIN: CLASS_STATEMENT_BEGIN,
		// 语句结束标签类别
		CLASS_STATEMENT_END: CLASS_STATEMENT_END
	});

	TagClass.props({
		expression: false,
		expressionContext: false,
		statement: false,
		statementBegin: false,
		statementEnd: false
	});

	return TagClass;
}(
	// CLASS_NONE
	parseInt(0, 2),
	// CLASS_STATEMENT
	parseInt(10, 2),
	// CLASS_STATEMENT_BEGIN
	parseInt(110, 2),
	// CLASS_STATEMENT_END
	parseInt(1010, 2),
	// CLASS_EXPRESSION
	parseInt(10110, 2),
	// CLASS_EXPRESSION_CONTEXT
	parseInt(100000, 2)
);
```