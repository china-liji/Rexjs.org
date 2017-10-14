函数是`JavaScript`的基本类型之一，其用途非常广，在`ES6`出现以前，它可以代表类、方法、回调等等，无处不在。

1. **函数生成**：
```js
new Function(code);
```
在这主要指的是以上方式生成函数，像这样，会有一个特殊阶段，即对`code`的解析与编译，这是一个较耗性能的点，而`eval(code)`也是一样。

2. **函数引用**：在`ES6`出现以前，很多人模拟类`ClassA`时候，都在是构造函数内来定义类的方法，如：
```js
function ClassA(){
	this.setValue = function(value){
		this.value = value;
	};
};
```
那么大家看下下面这个判断：
```js
new ClassA().setValue === new ClassA().setValue;
```
它会成立吗？答案是肯定不会成立的，因为每次都是一个新的方法，但起到的作用却是一模一样的，还要消耗更多的性能，去创建、销毁这个方法函数，所以原型链在这方面的优势就体现出来了，如：
```js
function ClassA(){};

ClassA.prototype.setValue = function(value){
	this.value = value;
};
```
所以，函数能唯一，则尽量不要重复生成。
同理，在类似这样这样的例子中：
```js
function fn(arr){
	arr.forEach(function(item){
		item.i++;
	});
};
```
我们应该把`forEach`方法的回调函数给提取到`fn`函数主体的外层去，如：
```js
var increment = function(item){
	item.i++;
};

function fn(arr){
	arr.forEach(increment);
};
```
总之，保持唯一性这一点，能很好的提升性能，而这一点，对于**数组**、**对象**等引用类型数据也都是通用的。

3. **call 与 apply**：`call`比`apply`的性能更高。因为`apply`是使用的**数组**，如果参数不是数组，底层代码可能会**转换数据类型**，导致性能消耗。所以，比起：
```js
function a(){
	b.apply(this, arguments);
};
```
更建议使用：
```js
function a(x, y, z){
	b.call(this, x, y, z);
};
```