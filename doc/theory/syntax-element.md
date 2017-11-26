#### Rexjs.SyntaxElement
语法元素，是整个解析器内最基本的组成。它是**语法标签**、**表达式**、**语句**、**语句块**的继承对象，即共同父类。

#### 方法
`extractTo`：**undefined** - 提取文本内容。无实际用途，主要是作为缺省值存在，由子类重写该方法以完成实际功能，也可以理解为类似其他语言里的接口。

#### Rexjs 源码片段
```js
this.SyntaxElement = function(){
	/**
	 * 语法元素
	 */
	function SyntaxElement(){};
	SyntaxElement = new Rexjs(SyntaxElement);
	
	SyntaxElement.props({
		/**
		 * 提取文本内容
		 * @param {ContentBuilder} contentBuilder - 内容生成器
		 */
		extractTo: function(){}
	});
	
	return SyntaxElement;
}();
```