#### SyntaxTags
语法标签列表，伪数组，用于存放`SyntaxTag`，并可以根据其优先级进行排序。

#### 继承关系
继承于`Rexjs.List`。

#### 常用的 SyntaxTags
`Rexjs.ExpressionTags`：表达式标签列表，其关联的正则，主要匹配的标签依据是：标签类别为`SyntaxClass.CLASS_EXPRESSION`、标签类型为`SyntaxType.TYPE_MATCHABLE`。

`Rexjs.ExpressionContextTags`：表达式上下文标签列表，其关联的正则，主要匹配的标签依据是：标签类别为`SyntaxClass.CLASS_EXPRESSION_CONTEXT`与`SyntaxClass.CLASS_STATEMENT_BEGIN`、标签类型为`SyntaxType.TYPE_MISTAKABLE`。

`Rexjs.StatementTags`：语句标签列表，其关联的正则，主要匹配的标签依据是：标签类别为`SyntaxClass.CLASS_STATEMENT_BEGIN`、标签类型为`SyntaxType.TYPE_MATCHABLE`。

`Rexjs.IllegalTags`：非法标签列表，其关联的正则，主要匹配的标签依据是：标签类别为**所有类别**、标签类型为`SyntaxType.TYPE_ILLEGAL`。

#### 属性
`entrance`：**Boolean** - 是否为入口标签列表，即解析时首次使用的那一个标签列表。

`regexp`：**RegExp** - 将所有标签正则合并之后的正则表达式。注：该正则理应包含解析语言的所有语法（标识符、关键字、运算符等等）。

#### 方法
`delegate`：**undefined** - 将一系列标签类托管给当前标签列表来实例化，并进行注册。

`filter`：**Boolean** - 标签过滤处理，返回`true`，则过滤该标签。

`ready`：**undefined** - 将所有标签准备就绪，即排序和初始化正则表达式，ps：这是个耗性能的方法。

`register`：**undefined** - 注册添加语法标签，与 push 方法不同的是，register 会进过滤器，而 push 不会

#### Rexjs 源码片段
```js
this.SyntaxTags = function(List, getSortedValue, distinct){
	/**
	 * 语法标签列表
	 */
	function SyntaxTags(){
		List.call(this);
	};
	SyntaxTags = new Rexjs(SyntaxTags, List);

	SyntaxTags.props({
		/**
		 * 将一系列标签类托管给当前标签列表来实例化，并进行注册
		 * @param {Array} list - 一系列标签类
		 * @param {Number} _type - 所有标签初始化的标签类型
		 */
		delegate: function(list, _type){
			// 注册标签
			this.register.apply(
				this,
				// 映射标签
				list.map(function(SyntaxTag){
					// 实例化标签
					return new SyntaxTag(_type);
				})
			);
		},
		entrance: false,
		/**
		 * 标签过滤处理
		 * @param {SyntaxTag} tag - 语法标签
		 */
		filter: function(tag){
			return false;
		},
		/**
		 * 将所有标签准备就绪，即排序和初始化正则表达式，ps：这是个耗性能的方法
		 */
		ready: function(){
			var copy = this.slice(0);

			// 对标签进行排序
			this.sort(function(tag1, tag2){
				return (
					getSortedValue(copy, tag1, tag2, "matchable", true) ||
					getSortedValue(copy, tag1, tag2, "mistakable", true) ||
					getSortedValue(copy, tag1, tag2, "illegal", false) ||
					getSortedValue(copy, tag1, tag2, "unexpected", false, true)
				);
			});
			
			// 初始化正则表达式
			this.regexp = new RegExp(
				// 去重并获取 source
				distinct(this),
				// 必须为全局匹配，否则正则的 lastIndex 无效
				"g"
			);
		},
		regexp: /[^\S\s]/g,
		/**
		 * 注册添加语法标签，与 push 方法不同的是，register 会进过滤器，而 push 不会
		 * @param {SyntaxTag, SyntaxTags} _rest - 需要添加的 语法标签 或 语法标签列表
		 */
		register: function(_rest){
			forEach(
				arguments,
				function(obj){
					// 如果对象也是一个标签列表
					if(obj instanceof SyntaxTags){
						// 再次调用注册方法
						this.register.apply(this, obj);
						return;
					}

					// 检查是否应该过滤该标签
					if(this.filter(obj)){
						return;
					}
					
					// 添加标签
					this.push(obj);
				},
				this,
				true
			);
		}
	});

	return SyntaxTags;
}(
	this.List,
	// getSortedValue
	function(copy, tag1, tag2, property, value, _bothNot){
		var type1 = tag1.type, type2 = tag2.type;

		switch(value){
			// 如果第一个类型属性值为 value
			case type1[property]:
				// 如果第二个类型属性值不为 value
				if(type2[property] !== value){
					// 将第一个标签插入到第二个标签前面
					return -1;
				}

				// 两个类型属性值都是 value
				break;

			// 如果第二个类型属性值为 value，而第一个类型属性值不为 value
			case type2[property]:
				// 将第二个标签插入到第一个标签前面
				return 1;

			// 两个类型属性值都不为 value
			default:
				// 如果在都不为 value 的情况下，还需要继续对比
				if(_bothNot){
					break;
				}

				// 进行下一个属性的比较
				return 0;
		}

		// 如果 tag1 的排序更大
		if(tag1.order - tag2.order > 0){
			// 将 tag1 插入到 tag2 前面
			return -1;
		}
		
		// 如果 tag2 的排序更大
		if(tag1.order - tag2.order < 0){
			// 将 tag2 插入到 tag1 前面
			return 1;
		}
		
		// 默认，即，order 相同，则不改变排序。ps：在某些浏览器的 sort 中，不能使用 0，0 会使 tag1 排到 tag2 前面
		return copy.indexOf(tag1) - copy.indexOf(tag2);
	},
	// distinct
	function(tags){
		var sources = [];
		
		tags.splice(
				0
			)
			.forEach(
				function(tag){
					var regexp = tag.regexp;
					
					// 如果没有提供正则，则说明不需要匹配，作为未捕获的标签
					if(regexp === null){
						tags[-1] = tag;
						return;
					}
					
					var source = regexp.source;
					
					// 如果已经存在
					if(this(source)){
						return;
					}
					
					// 添加正则源字符串
					sources.push(
						"(?:" + source + ")()"
					);
					
					// 添加标签
					tags.push(tag);
				},
				function(source){
					// 检测是否有重复标签
					return !tags.every(function(tag){
						return tag.regexp.source !== source;
					});
				}
			);
			
		return sources.join("|")
	}
);
```