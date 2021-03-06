网上有很多言论，说 DOM 是十分耗性能的，而我们在此需要纠正与声明的是，渲染 DOM 的确耗性能，但是使用 JavaScript 操作 DOM，在注意一些事项的前提下，那么性能还是非常可观。因为在之前，Rexjs 改版过 5次，而前两次是用 DOM 进行语法分析的，当然也测试过**百万级别**的 DOM 操作，得出的皆是上述的结论。

1. **操作 DOM**：如果元素节点**十分庞大**且**存在文档上下文中**，先将其移除或隐藏，再进行操作，最后添加或显示回文档。关于这一点，原因是在操作 DOM 时候，如果**存在于文档上下文中**，可能会导致多次浏览器对页面的重绘，导致性能的消耗。

2. **遍历DOM**：专业且快速的方法是使用`TreeWalker`，如：
```js
document.createTreeWalker(node);
```

3. **查询 DOM**：首先，尽量**小范围**、**在指定节点上面**去查，不要什么都用`document.querySelector(selector)`，`document`是根，查询的是全文档。其次，选择器也要精准，能用`div > p`就别用`div p`等等。

4. **textContent 与 innerHTML**：在讲这个问题之前，我们必须先来了解一下**文档结构**的问题，因为很多同学可能不知道，而这也不是基础，很多学校老师都不清楚，逻辑也稍显复杂，我们觉得有必要科普一下：什么是节点、什么是元素、两者的关系是什么？HTML 元素又是什么？

	4.1. **什么是节点**：当你打开 Chrome 调试工具时，你在`Elements`工具栏中所看到的一切都是节点，其中包括`<!DOCTYPE html>`、**任何标签**、**任何文本（包括注释）**、**甚至是标签属性（id、class 等等）**，他们统统都是**节点**。当点击在任何节点上面时，再看看`Properties`工具栏中，均出现了`Node`，说明，他们都是继承至节点。节点拥有**改变文档结构**的能力，如：增 - `appendChild`、删 - `removeChild`、改 - `replaceChild`、插 - `insertBefore`等方法，此类方法都是属于操作文档结构的方法。

	4.2. **什么是文本节点**：文本节点是最小的节点，不能包含其他节点，仅供文本。所以**文本节点没有子节点**，子节点个数永远为`0`。	文本节点可以通过`appendChild`方法添加至父元素。文本节点拥有对文本进行处理的能力，如：`replaceWholeText`、`spliteText`等。文本节点继承至`CharacterData`，而`CharacterData`却继承至`Node`。

	4.3. **什么是元素**：它表示文档中的元素，元素可拥有**属性节点**、**文本节点**以及**其他元素**。元素拥有**对文档结构进行查询**的能力，如：`getElementsByTagName`、`getElementsByClassName`、`querySelectorAll`等等;元素还拥有**对自身属性进行操作**的能力，如：`setAttribute`、`getAttribute`等。此外，元素也是节点，因为元素继承至节点，拥有节点所有的能力，即对文档的增删改插。

	4.3. **什么是 HTML 元素**：`HTML`元素 是**HTML 文档**特有的组成重要部分。与元素节点不同的是，**HTML 元素**拥有很多**特定的**、**用于表示的**或**用于显示的**属性，如：`id`、`class`、`height`、`width`、`style`等。元素**没有大小**，**没有轮廓**，**没有样式**。而**HTML 元素**不一样，它就是为显示而诞生的，所以它拥有**大小**、**轮廓**、**样式**等外观，可以让你直接在浏览器里看的一清二楚（`XML`里面的都是元素节点，所以`XML`是用于数据传输用的，看不到外观，而`HTML`是显示用的，可以看到外观）。

科普已经结束，如果大家在百度知道上发现了一篇[类似的文章](https://zhidao.baidu.com/question/1638403487781119820)，不要怀疑是抄袭的，因为那篇文章是几年前我在百度知道上回答的。

接下来，我们回归正传，说说`textContent`与`innerHTML`，`textContent`是用于节点文本的设置，它不仅不用你去转义`<`、`>`等等字符，更不用像`innerHTML`那样去解析内容并生成，所以，在能纯文本设置的情况下，使用`textContent`性能会更高。

温馨提示：`<br />`等一些其他闭合元素也可以设置`textContent`，只是不会在页面显示，但是值会一直保留，使你可以在特殊需要的时候可以说：**“哥”来展示下高端操作**。比如编辑器里的插入换行，只要插入`<br />`，再将`textContent`设置为`\n`，最后直接在编辑器元素上，直接使用`textContent`就能获取到包括换行符`\n`的文本了。