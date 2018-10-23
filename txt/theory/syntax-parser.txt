#### SyntaxParser
语法解析器，是整个语法解析最核心的部分，操作着最主要的解析逻辑，如：标签匹配、捕获异常、访问标签等等。

#### 属性
`details`：**Rexjs.SyntaxError** - 语法错误详细信息，默认值`null`。

`file`：**Rexjs.File** - 所解析的文件信息。

`position`：**Rexjs.Position** - 所解析的代码位置信息。

`regexp`：**Rexjs.SyntaxRegExp** - 解析时所依赖的语法正则。

`statements`：**Rexjs.Statements** - 解析时所关联的主语句块，即全局语句块。

`tagsMap`：**Rexjs.TagsMap** - 解析时所依赖的标签列表映射。

#### 方法
`build`：**String** - 将解析后的语法生成字符串，并返回。

`error`：**undefined** - 抛出错误，该方法中会使用`throw`，所以该方法应作为当前流程的最后一步使用。

`parse`：**undefined** - 开始解析语法文件。

#### Rexjs 源码片段
```js
this.SyntaxParser = function(SyntaxRegExp, SyntaxError, Position, Context, ContentBuilder, toTryCatch){
	/**
	 * 语法解析器
	 */
	function SyntaxParser(){
		this.regexp = new SyntaxRegExp();
	};
	SyntaxParser = new Rexjs(SyntaxParser);
	
	SyntaxParser.props({
		/**
		 * 将解析后的语法生成字符串，并返回
		 * @param {ContentBuilder} _contentBuilder - 内容生成器
		 */
		build: function(_contentBuilder){
			var contentBuilder = _contentBuilder || new ContentBuilder();
			
			this.statements.extractTo(contentBuilder);
			return contentBuilder.complete();
		},
		details: null,
		/**
		 * 报错
		 * @param {Context, Expression} info - 出错信息
		 * @param {String} _description - 错误描述
		 * @param {Boolean} _reference - 是否是引用错误
		 */
		error: function(info, _description, _reference){
			var error = new SyntaxError(this.file, info, _description, _reference);

			// 中断匹配，结束解析
			this.regexp.break();

			// 记录错误详情
			this.details = error;
			// 报错
			throw error.message;
		},
		file: null,
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
		},
		position: null,
		regexp: null,
		statements: null,
		tagsMap: null
	});
	
	return SyntaxParser;
}(
	this.SyntaxRegExp,
	this.SyntaxError,
	this.Position,
	this.Context,
	this.ContentBuilder,
	// toTryCatch
	function(parser, context, tag, statements){
		var statement = statements.statement;

		// 如果表达式存在
		outerBlock:
		if(statement.expression){
			var tagClass = tag.class, tagType = tag.type, mistakable = tagType.mistakable;

			// 如果标签是可能被误解的而且是语句标签 或 标签是合法的非误解标签
			if(mistakable ? tagClass.statement : !tagType.illegal){
				for(;;){
					// 获取 catch 所返回的标签
					var t = statement.catch(parser, context);

					// 如果标签存在
					if(t){
						// 返回该标签
						return t;
					}

					// 获取当前语句
					var s = (statements = parser.statements).statement;

					// 如果等于当前语句
					if(statement === s){
						// 获取 target
						s = statement.target;

						// 如果 target 存在
						if(s){
							// 跳出当前语句
							statement.out();
						}
						// 如果 target 不存在
						else {
							// 中断循环
							break;
						}
					}

					// 记录当前语句
					statement = s;
				}

				// 如果是被误解的
				if(mistakable){
					// 如果是语句结束标签
					if(tagClass.statementEnd){
						// 返回标签
						return tag;
					}

					// 如果表达式可以结束
					if((statements.statement.expression.state & STATE_STATEMENT_ENDABLE) === STATE_STATEMENT_ENDABLE){
						// 创建新语句
						statements.newStatement();
						// 返回标签
						return tag;
					}
				}

				// 跳出外层语句块
				break outerBlock;
			}

			// 如果是可误解的，且不是语句标签（上面的判断保证了一定不是语句标签）
			if(mistakable){
				// 如果语句存在
				while(statement){
					// 获取 try 所返回的标签
					var t = statement.try(parser, context);

					// 如果标签存在
					if(t){
						// 返回该标签
						return t;
					}

					// 获取当前语句
					var s = parser.statements.statement;

					// 如果等于当前语句，说明没有跳出语句
					if(statement === s){
						// 中断循环
						break;
					}

					// 记录语句
					statement = s;
				}

				// 返回标签
				return tag;
			}
		}

		// 报错
		parser.error(context);
		return null;
	}
);

}.call(
	this,
	this.Expression,
	this.ListExpression,
	this.LeftHandSideExpression,
	this.Expression.STATE_STATEMENT_ENDABLE
);
```