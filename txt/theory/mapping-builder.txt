#### MappingBuilder
源码映射生成器，用来生成 sourceMap。

#### 继承关系
继承于`Rexjs.SourceBuilder`。

#### 静态属性
`supported`：**Boolean** - 是否支持生成 sourceMap。

#### 属性
`mappings`：**String** - 生成的 sourceMap。

`position`：**Rexjs.MappingPosition** - 源码映射生成器中所记录的位置。

#### 方法
`appendContext`：**undefined** - 追加内容上下文，同时会更新 sourceMap。

`appendMappings`：**undefined** - 追加映射内容。

`appendString`：**undefined** - 追加内容。

`complete`：**String** - 完成生成，返回结果。

`newline`：**undefined** - 追加新行，同时会更新 sourceMap。

#### Rexjs 源码片段
```js
this.MappingBuilder = function(MappingPosition, Base64VLQ, JSON, appendContext, appendString, complete, merge, newline, btoa){
	/**
	 * 源码映射生成器，用来生成 sourceMap
	 * @param {File} file - 生成器相关文件
	 */
	function MappingBuilder(file){
		SourceBuilder.call(this, file);
		
		this.position = new MappingPosition();
	};
	MappingBuilder = new Rexjs(MappingBuilder, SourceBuilder);
	
	MappingBuilder.static({
		supported: !!btoa
	});
	
	MappingBuilder.props({
		/**
		 * 追加内容上下文，同时会更新 sourceMap
		 * @param {Context} context - 标签内容上下文
		 */
		appendContext: function(context){
			var diff, diffVLQ, contextPosition = context.position, builderPosition = this.position,
			
				line = contextPosition.line, column = contextPosition.column;

			// 如果不是空行
			if(builderPosition.generatedLineOffset !== builderPosition.generatedColumnOffset){
				// 追加逗号
				this.appendMappings(",");
			}

			// 追加映射当前信息
			this.appendMappings(
				Base64VLQ.encode(builderPosition.generatedColumnDiff) +
				"A" +
				Base64VLQ.encode(line - builderPosition.line) +
				Base64VLQ.encode(column - builderPosition.column)
			);
			
			// 先要清空一次列的差值
			builderPosition.generatedColumnDiff = 0;

			// 调用父类方法
			appendContext.call(this, context);

			// 获取刚刚上下文所产生的生成列偏移值
			diff = builderPosition.generatedColumnDiff;
			// 获取对应 vlq 编码
			diffVLQ = Base64VLQ.encode(diff);

			/*
				将映射点向右移动等同于 生成列偏移值 的量，并指向原来的位置，
				如：context 所添加的值为 var，
				在此之前，位置是在 var 之前，即 v 的索引位置，
				那么下面的代码，目的是将位置移动到 var 之后，即 r 后面的索引位置，
				而且源代码的位置还是在 var 之前。
			*/
			this.appendMappings("," + diffVLQ + "AAA");
			// 这段代码的目的就是将上面源代码的位置，也移动到 var 之后
			this.appendMappings(",AAA" + diffVLQ);

			// 记录源码的行
			builderPosition.line = line;
			// 记录源码的列
			builderPosition.column = column + diff;
			// 记录列的偏移量
			builderPosition.generatedColumnOffset += diff;
			// 清空列的差值
			builderPosition.generatedColumnDiff = 0;
		},
		/**
		 * 追加映射内容
		 * @param {String} content - 映射内容
		 */
		appendMappings: function(content){
			this.mappings += content;
		},
		/**
		 * 追加内容
		 * @param {String} content - 数据内容
		 */
		appendString: function(content){
			// 计算生成的列差值
			this.position.generatedColumnDiff += content.length;

			// 调用父类方法
			appendString.call(this, content);
		},
		/**
		 * 完成生成，返回结果
		 */
		complete: function(){
			// 如果 btoa 存在，则添加 mappingURL，否则不支持 btao 的环境，应该也不会支持 source map
			if(btoa){
				// 追加新行
				this.newline();
				// 追加 sourceURL
				this.appendString("//# sourceURL=http://rexjs/sources/" + this.file.filename);
				// 追加新行
				this.newline();
				// 追加 mappingURL 头部
				this.appendString("//# sourceMappingURL=data:application/json;base64,");
				
				// 追加 mappingURL 主体
				this.appendString(
					btoa(
						JSON.stringify({
							sources: [ this.file.filename ],
							names: [],
							mappings: this.mappings
						})
					)
				);

				return this.result;
			}

			// 返回结果
			return complete.call(this);
		},
		mappings: "",
		/**
		 * 追加新行，同时会更新 sourceMap
		 */
		newline: function(){
			var position = this.position;
			
			// 给 mappings 添加分号，表示新行的开始
			this.appendMappings(";");
			// 追加换行符
			newline.call(this);
			
			// 设置偏移量
			position.generatedLineOffset = position.generatedColumnOffset += position.generatedColumnDiff;
			// 清空差值
			position.generatedLineDiff = position.generatedColumnDiff = 0;
		},
		position: null
	});
	
	return MappingBuilder;
}(
	this.MappingPosition,
	this.Base64VLQ,
	JSON,
	SourceBuilder.prototype.appendContext,
	SourceBuilder.prototype.appendString,
	SourceBuilder.prototype.complete,
	SourceBuilder.prototype.merge,
	SourceBuilder.prototype.newline,
	typeof btoa === "undefined" ? null : btoa
);
```