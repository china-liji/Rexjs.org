#### ContentBuilder
内容生成器，主要是用于解析时，拼接源码或解析后的代码。

#### 属性
`result`：**String** - 内容生成结果。

#### 方法
`appendContext`：**undefined** - 追加内容上下文。

`appendSpace`：**undefined** - 追加空格。

`appendString`：**undefined** - 追加内容。

`complete`：**String** - 完成生成，返回结果。

`newline`：**undefined** - 追加新行。

#### Rexjs 源码片段
```js
this.ContentBuilder = function(){
	/**
	 * 内容生成器
	 */
	function ContentBuilder(){};
	ContentBuilder = new Rexjs(ContentBuilder);
	
	ContentBuilder.props({
		/**
		 * 追加内容上下文
		 * @param {Context} context - 标签内容上下文
		 */
		appendContext: function(context){
			// 交给标签来处理内容
			context.tag.extractTo(this, context.content);
		},
		/**
		 * 追加空格
		 */
		appendSpace: function(){
			this.appendString(" ");
		},
		/**
		 * 追加内容
		 * @param {String} content - 数据内容
		 */
		appendString: function(content){
			this.result += content;
		},
		/**
		 * 完成生成，返回结果
		 */
		complete: function(){
			return this.result;
		},
		/**
		 * 追加新行
		 */
		newline: function(){
			this.appendString("\n");
		},
		result: ""
	});
	
	return ContentBuilder;
}();
```