#### SyntaxTag
语法标签，决定着代码匹配的内容、类型、方式以及优先级，并且是表达式与语句关联的重要媒介。

#### 继承关系
继承于`Rexjs.SyntaxElement`。

#### 属性
`$class`：**Number** - 标签“分类”的原始值，重写该属性，可用于标签实例化时计算`class`属性。

`$type`：**Number** - 标签“类型”的原始值，重写该属性，可用于标签实例化时计算`type`属性。

`binding`：**Rexjs.SyntaxTag** - 获取绑定的标签，该标签列表一般是用于语句的 try、catch 的返回值。

`class`：**Rexjs.TagClass** - 标签性质定位的类别。

`order`：**Number** - 标签排序，用于解决多个标签正则对同一段内容的匹配冲突。该属性数值越大，在**标签列表**中的排序越靠前、正则匹配的优先级越高。如：`===`所对应的标签`order`值为`203`，而`==`所对应的标签`order`值为`202`，前者比后者大，所以当代码内容出现`===`时，是不会优先匹配`==`的。

`regexp`：**RegExp** - 标签表达式，用于决定代码匹配的内容。

`throw`：**String** - 当解析该标签遇到无法处理的异常时，所抛出的标志，默认值`"token"`。默认抛出形式为`Unexpected ${tag.throw} ${content}`，如：捕获到错误的小括号，则抛出`Unexpected token (`。

`type`：**Rexjs.TagType** - 标签正则捕获类型。

#### 方法
`extractTo`：**undefined** - 提取文本内容。

`getBoundExpression`：**Rexjs.Expression** - 获取绑定的表达式，一般在子类使用父类逻辑，而不使用父类表达式的情况下使用。

`getBoundStatement`：**Rexjs.Statement** - 获取绑定的语句，一般在子类使用父类逻辑，而不使用父类语句的情况下使用。

`getBoundStatements`：**Rexjs.Statements** - 获取绑定的语句块，一般在子类使用父类逻辑，而不使用父类语句块的情况下使用。

`require`：**Rexjs.SyntaxTags** - 获取此标签接下来所需匹配的标签列表。特殊说明：
1. 该方法，理应不处理任何逻辑。
2. 组合性标签，按照组合形式得到标签列表映射。如：`class ClassName extends SuperClass {...`，这是固定组合，按照顺序得到对应标签列表即可。
3. 非组合性标签，按照**表达式衔接**逻辑得到标签列表映射：“表达式标签” -> “表达式上下文标签” -> “表达式标签” -> “表达式上下文标签” -> ... -> “表达式标签”，最后以“表达式标签”结束语句；如：`a + b / c`，`a`、`b`、`c`为“表达式标签”，`+`、`/`为“表达式上下文标签”。

`visitor`：**undefined** - 标签访问器，可初始化或设置表达式、语句等相关操作。这是一个重要的枢纽，用于关联上下文、表达式、语句、语句块之间的关系。

#### Rexjs 源码片段
```js
this.SyntaxTag = function(SyntaxElement, TagClass, TagType){
	/**
	 * 语法标签
	 * @param {Number} _type - 标签类型
	 */
	function SyntaxTag(_type){
		SyntaxElement.call(this);

		this.type = new TagType(_type || this.$type);
		this.class = new TagClass(this.$class);
	};
	SyntaxTag = new Rexjs(SyntaxTag, SyntaxElement);

	SyntaxTag.props({
		$class: TagClass.CLASS_NONE,
		$type: TagType.TYPE_MATCHABLE,
		/**
		 * 获取绑定的标签，该标签列表一般是用于语句的 try、catch 的返回值
		 */
		get binding(){
			return null;
		},
		class: null,
		/**
		 * 提取文本内容
		 * @param {ContentBuilder} contentBuilder - 内容生成器
		 * @param {String} content - 标签内容
		 */
		extractTo: function(contentBuilder, content){
			// 追加标签内容
			contentBuilder.appendString(content);
		},
		/**
		 * 获取绑定的表达式，一般在子类使用父类逻辑，而不使用父类表达式的情况下使用
		 * @param {Context} context - 相关的语法标签上下文
		 * @param {Statement} statement - 当前语句
		 */
		getBoundExpression: function(){
			return null;
		},
		/**
		 * 获取绑定的语句，一般在子类使用父类逻辑，而不使用父类语句的情况下使用
		 * @param {Statements} statements - 该语句将要所处的语句块
		 */
		getBoundStatement: function(){
			return null;
		},
		/**
		 * 获取绑定的语句块，一般在子类使用父类逻辑，而不使用父类语句块的情况下使用
		 * @param {Statements} statements - 该语句将要所处的语句块
		 */
		getBoundStatements: function(){
			return null;
		},
		order: 0,
		regexp: null,
		/**
		 * 获取此标签接下来所需匹配的标签列表
		 * @param {TagsMap} tagsMap - 标签集合映射
		 * @param {SyntaxTags} currentTags - 之前标签所需匹配的标签列表
		 */
		require: function(tagsMap, currentTags){
			return currentTags;
		},
		throw: "token",
		type: null,
		/**
		 * 标签访问器
		 * @param {SyntaxParser} parser - 语法解析器
		 * @param {Context} context - 标签上下文
		 * @param {Statement} statement - 当前语句
		 * @param {Statements} statements - 当前语句块
		 */
		visitor: function(){}
	});

	return SyntaxTag;
}(
	this.SyntaxElement,
	this.TagClass,
	this.TagType
);
```