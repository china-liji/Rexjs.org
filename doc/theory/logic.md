#### 介绍
解析逻辑，主导着整个解析流程。如果要求解析的性能要高、可读性要好、可拓展性要大，完全与解析逻辑息息相关，它就像贯穿整个城市的道路，道路规划的好不好，决定着市容市貌以及到达目的地的时间与便捷。

#### 解析逻辑
与其他解析器最大的、最主要的、最基础的区别，也就是在于正则表达式的应用上。其他解析器，是利用**字符**进行判断，如什么字符后面应该接什么字符；我们不一样，用的是正则，因为正则已经将字符衔接的逻辑问题完美解决了，所以我们觉得没必要再花大篇代码去做重复的事情，这也是`Rexjs`整体文件体积小的主要原因之一。

* **解析逻辑平面示意图**

这是个整体的解析图解，它描述了一个从开始到结束、从主干到分支、再由分支回流主干、最后进入循环的解析生命周期。

```txt
      1. 初始化解析器
      ↓
      2. 编译正则表达式列表
      ↓
      3. 传入代码
      ↓
→  →  4. 正则匹配代码，核对语法上下文，校验语法
      ↓
↑     * → 5.1 匹配不到任何结果，解析结束
      ↓
↑     5.2 得到对应语法标签
      ↓
↑     * →   →   →   →   →
      ↓                  ↓
↑     6.1 如果标签正常     6.2 如果标签异常
      ↓                  ↓
↑                        7. 捕获处理异常，再次校验语法
      ↓                  ↓
↑                        * → 8.1 确认是非法异常，报错，解析结束
      ↓                  ↓
↑                        8.2 纠正异常，得到正确的标签
      ↓                  ↓
↑     *  ←  ←  ←  ←  ←  ←
      ↓
↑     9. 访问标签，即：进入标签访问器，可初始化及设置语句、表达式等相关操作
      ↓
↑     10. 通过标签，得到下一个应该匹配的标签列表映射
      ↓
↑     11. 重置正则，以匹配下一个语法标签
      ↓
←  ←  ←
```

* **解析逻辑源码**

源码文件：`rexjs-syntax.js`，方法摘自于：`Rexjs.SyntaxParser.prototype.parse`.

```js
/**
 * 开始解析
 * @param {File} file - 文件信息
 * @param {SyntaxTagsMap} tagsMap - 标签列表映射
 * @param {Statements} statements - 初始化的语句块
 */
parse: function(file, tagsMap, statements){
	var parser = this, tags = tagsMap.entranceTags, position = this.position = new Position(0, 0);

	// 设置 tagsMap
	this.tagsMap = tagsMap;
	// 记录文件
	this.file = file;
	// 清空错误信息
	this.details = null;
	// 初始化语句块
	this.statements = statements;
	
	// 执行正则
	this.regexp.exec(
		tags.regexp,
		file.source,
		function(content, tagIndex){
			var context, tag = tags[tagIndex];

			// 初始化 context
			context = new Context(
				tag,
				content,
				new Position(
					position.line,
					position.column
				)
			);
			
			// 增加列数
			position.column += content.length;
			
			// 如果标签异常，即不应该被捕获
			if(tag.type.unexpected){
				// 进入异常捕获处理
				context.tag = tag = toTryCatch(parser, context, tag, parser.statements);
			}

			// 获取语句块，以防在 toTryCatch 中被修改过
			statements = parser.statements;
			
			// 访问标签
			tag.visitor(parser, context, statements.statement, statements);

			// 获取下一步需要匹配的标签列表
			tags = tag.require(tagsMap, tags, parser);
			// 返回下一步需要匹配的正则
			return tags.regexp;
		}
	);
}
```

#### 正则应用逻辑

我们先看一下正则与标签列表之间的绑定关系：
1. 每个[**语法标签**](/#!/book/theory/syntax-tag.md)上，都会绑定一个相关**正则**；
2. 每个[**语法标签列表**](/#!/book/theory/syntax-tags.md)上，都会绑定一个解析时刻相关的所有[**语法标签**](/#!/book/theory/syntax-tag.md)；
3. 每个**语法标签列表映射**上，都会绑定整个解析器所相关所有[**语法标签列表**](/#!/book/theory/syntax-tags.md)，也就是说，一个语言，一个解析器，只有一个**语法标签列表映射**；
4. 初始化**语法标签列表映射**时，会对每一个[**语法标签列表**](/#!/book/theory/syntax-tags.md)中的[**语法标签**](/#!/book/theory/syntax-tag.md)进行排序，根据其正则匹配的可能性越大、正确性越高，则越排在集合前面，以提高匹配性能。

经过排序后的标签列表，可以从下面关系图中的`constContextTags`看出，前`7`个的[标签类型](/#!/book/theory/tag-type.md)均还是可匹配的`matchable`，从第`8`个开始则为非捕获的`unexpected`、非法标签`illegal`，即兑现了上面所说：“根据其正则匹配的可能性越大、正确性越高，则越排在集合前面”的逻辑。

![示例图](doc/theory/image/logic.png)