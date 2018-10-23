#### 解析示例
本示例是拿`Rexjs`已支持的**特有**语法 - **疑问赋值表达式**`a ?= b`来做示范。

#### 源码
```js
function Car(options){
	// 如果 options.config.color 的值为 undefined，则不执行赋值操作。
	this.color ?= options.config.color;
};

Car.prototype.color = "red";

// red
console.log(
	new Car({ config: {} }).color
);
```

#### 解析后的代码
```js
function Car(options){
	var $Rexjs_0;

	// 如果 options.config.color 的值为 undefined，则不执行赋值操作。
	(($Rexjs_0 = options.config.color) !== void 0 ? this.color = $Rexjs_0 : $Rexjs_0);
};

Car.prototype.color = "red";

// red
console.log(
	new Car({ config: {} }).color
);
```

#### 解析目的
很多时候，某些参数不会被提供，为避免繁琐的判断，我们提供此简洁的表达式写法。

#### 主体文件代码
取自[question-assignment.js](https://github.com/china-liji/Rexjs/tree/master/source/map/question-assignment.js)。

```js
// 疑问赋值表达式
!function(ShorthandAssignmentTag){

this.QuestionAssignmentExpression = function(BinaryExpression){
	/**
	 * 疑问赋值达式
	 * @param {Context} context - 语法标签上下文
	 * @param {String} variable - 临时变量名
	 */
	function QuestionAssignmentExpression(context, variable){
		BinaryExpression.call(this, context);

		this.variable = variable;
	};
	QuestionAssignmentExpression = new Rexjs(QuestionAssignmentExpression, BinaryExpression);

	QuestionAssignmentExpression.props({
		/**
		 * 提取表达式文本内容
		 * @param {ContentBuilder} contentBuilder - 内容生成器
		 */
		extractTo: function(contentBuilder){
			var variable = this.variable;

			// 追加临时变量赋值操作
			contentBuilder.appendString("((" + variable + "=");
			// 提取右侧表达式，作为临时变量的值
			this.right.extractTo(contentBuilder);
			// 追加三元运算符的判断条件
			contentBuilder.appendString(")!==void 0?");
			// 在三元表达式的成立条件部分，提取左侧表达式
			this.left.extractTo(contentBuilder);
			// 在三元表达式的成立条件部分，给左侧表达式赋值；并在否定条件部分直接返回该临时变量
			contentBuilder.appendString("=" + variable + ":" + variable + ")");
		},
		variable: ""
	});

	return QuestionAssignmentExpression;
}(
	this.BinaryExpression
);

this.QuestionAssignmentTag = function(QuestionAssignmentExpression, visitor){
	/**
	 * 疑问赋值标签
	 * @param {Number} _type - 标签类型
	 */
	function QuestionAssignmentTag(_type){
		ShorthandAssignmentTag.call(this, _type);
	};
	QuestionAssignmentTag = new Rexjs(QuestionAssignmentTag, ShorthandAssignmentTag);

	QuestionAssignmentTag.props({
		/**
		 * 获取绑定的表达式，一般在子类使用父类逻辑，而不使用父类表达式的情况下使用
		 * @param {Context} context - 相关的语法标签上下文
		 * @param {Statement} statement - 当前语句
		 */
		getBoundExpression: function(context, statement){
			return new QuestionAssignmentExpression(
				context,
				// 生成临时变量名
				statement.statements.collections.generate()
			);
		},
		regexp: /\?=/,
		/**
		 * 标签访问器
		 * @param {SyntaxParser} parser - 语法解析器
		 * @param {Context} context - 标签上下文
		 * @param {Statement} statement - 当前语句
		 * @param {Statements} statements - 当前语句块
		 */
		visitor: function(parser, context, statement, statements){
			// 如果需要编译
			if(config.rexjs){
				// 调用父类方法
				visitor.call(this, parser, context, statement, statements);
				return;
			}

			// 报错
			parser.error(context);
		}
	});

	return QuestionAssignmentTag;
}(
	this.QuestionAssignmentExpression,
	ShorthandAssignmentTag.prototype.visitor
);

}.call(
	this,
	this.ShorthandAssignmentTag
);
```

#### 其他代码 - 注册标签
取自[tags-base.js](https://github.com/china-liji/Rexjs/tree/master/source/map/tags-base.js)。

```js
this.ExpressionContextTags = function(list){
	/**
	 * 表达式上下文标签列表
	 */
	function ExpressionContextTags(){
		ECMAScriptTags.call(this);

		this.delegate(list);
	};
	ExpressionContextTags = new Rexjs(ExpressionContextTags, ECMAScriptTags);
	
	...
	...
	
	return ExpressionContextTags;
}(
	// list
	[
		...
		this.QuestionAssignmentTag,
		...
	]
);
```

#### 解析完毕
好了，这个**疑问表达式**的解析看起来是不是非常简单？包括注释加起来总共`100`来行代码，轻轻松松可以让你在代码中可以使用以上`demo`的写法了！