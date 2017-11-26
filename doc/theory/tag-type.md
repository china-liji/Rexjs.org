#### TagType
标签正则捕获类型，当正则匹配时候，会依据该类型进行判断，决定是否进入标签访问器或者进入异常处理，详细逻辑请参考`SyntaxParser.prototype.parse`方法。

#### 继承关系
继承于`Rexjs.TagData`。

##### 静态属性
`TYPE_ILLEGAL`：**Number** - 非法标签类型，“继承”至`TYPE_UNEXPECTED`。

`TYPE_NONE`：**Number** - 无标签类型。

`TYPE_MATCHABLE`：**Number** - 可匹配的标签类型。

`TYPE_MISTAKABLE`：**Number** - 可能会无解的标签类型，“继承”至`TYPE_UNEXPECTED`。

`TYPE_UNEXPECTED`：**Number** - 未捕获的标签类型。

##### 属性
`illegal`：**Boolean** - 是否为非法标签类型。

`matchable`：**Boolean** - 是否为可匹配的标签类型。

`mistakable`：**Boolean** - 是否为可能会无解的标签类型。

`unexpected`：**Boolean** - 是否为未捕获的标签类型。

#### Rexjs 源码片段
```js
this.TagType = function(TYPE_NONE, TYPE_MATCHABLE, TYPE_UNEXPECTED, TYPE_MISTAKABLE, TYPE_ILLEGAL){
	/**
	 * 标签正则捕获类型
	 * @param {Number} value - 标签类型
	 */
	function TagType(value){
		TagData.call(this, value);

		this.illegal = (value & TYPE_ILLEGAL) === TYPE_ILLEGAL;
		this.matchable = (value & TYPE_MATCHABLE) === TYPE_MATCHABLE;
		this.mistakable = (value & TYPE_MISTAKABLE) === TYPE_MISTAKABLE;
		this.unexpected = (value & TYPE_UNEXPECTED) === TYPE_UNEXPECTED;
	};
	TagType = new Rexjs(TagType, TagData);

	TagType.static({
		// 非法标签类型
		TYPE_ILLEGAL: TYPE_ILLEGAL,
		// 无标签类型
		TYPE_NONE: TYPE_NONE,
		// 可匹配的标签类型
		TYPE_MATCHABLE: TYPE_MATCHABLE,
		// 可能会无解的标签类型
		TYPE_MISTAKABLE: TYPE_MISTAKABLE,
		// 未捕获的标签类型
		TYPE_UNEXPECTED: TYPE_UNEXPECTED
	});

	TagType.props({
		illegal: false,
		matchable: false,
		mistakable: false,
		unexpected: false
	});

	return TagType;
}(
	// TYPE_NONE
	parseInt(0, 2),
	// TYPE_MATCHABLE
	parseInt(10, 2),
	// TYPE_UNEXPECTED
	parseInt(100, 2),
	// TYPE_MISTAKABLE
	parseInt(1100, 2),
	// TYPE_ILLEGAL
	parseInt(10100, 2)
);
```