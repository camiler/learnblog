## 事件流、事件冒泡流、事件捕获流

> 冒泡流是由IE提出的，所以IE8及其以下的浏览器是基于冒泡的事件流。   
捕获流是由网景提出的，是NetScape Communicator唯一支持的事件流模型，但IE9以上的以及其他浏览器都支持这种模型。

以下脚本均以这段HTML代码为例：   
```
<!DOCTYPE html>
<html lang="en" id="html">
<head>
    <meta charset="UTF-8">
    <title>事件冒泡</title>
</head>
<body id="body">
    <div id="outer">
        <button id="inner">click</button>
    </div>
</body>
</html>
```

### 冒泡bubbling
事件根据DOM层级由下至上的传播，从某个具体的、嵌套最深的节点元素开始接收，逐级向上到不具体的DOM。   

```
|—— Document                5
|———— HTML                  4
|—————— BODY                3
|———————— div #outer        2
|—————————— button #inner   1
```

### 捕获capture
事件根据DOM层级由上至下的传播，从嵌套最浅的节点开始接收，逐级向下到某个最具体的节点DOM。   

```
|—— Document                1
|———— HTML                  2
|—————— BODY                3
|———————— div #outer        4
|—————————— button #inner   5
```

### 事件处理方式

1、HTML   
在html上用onclick = "FunName()"的方式

---------------
2、DOM0级

```
<script type="text/javascript">
    var btn = document.getElementById('inner');

    btn.onclick = function(e){
        console.log(this === e.target);  //true
        alert('dom0');
        btn.onclick = null;  //删除事件处理  第二次点击就不会alert dom0了。
    }
</script>
```
这时的事件处理是在元素的作用域进行。  

---------------- 
3、DOM2级

有3个阶段：   
1、事件捕获阶段   
2、处于目标阶段   
3、事件冒泡阶段   

在冒泡和捕获事件流都支持的浏览器（IE9及其以上以及其他主流浏览器）中，有两个机会可以在目标对象上操作事件。   
而IE8及其以下只支持冒泡类型，所以其事件触发只有一个机会。   

addEventListener、 removeEventListener。接收的最后一个参数是表示在什么阶段调用事件处理。      
true就是在捕获阶段，false就是在冒泡阶段。默认是false。   

```
<script type="text/javascript">
    var btn = document.getElementById('inner'),
        div = document.getElementById('outer'),
        body = document.getElementById('body');

    var hander = function(e){
        
        e = e || window.event;
        var tar = e.target || e.srcElement;  //这两句都是为兼容IE8

        alert(tar.id);  //inner
        alert(this.id); //body
        console.log(e.currentTarget);  //<body>DOM
    }

    body.addEventListener('click', hander, true);
</script>
```
可以看到，这时的this指向的是body所在的作用域。而**e.target获取的总是事件的实际目标**。      
用委托函数hander可以方便进行removeEventListener。   
   
这其中：**currentTarget, srcElement, target, this的区别**也清楚了。   
   
currentTarget：是被监听对象目标；   
target：是事件的实际目标，也就是说不一定和currentTarget一样；   
srcElement: 也是实际目标，只是兼容IE8及其以下的浏览器；   
this：被监听的作用域，和currentTarget是一致的；   
   
上面提到，IE8及其以下不支持DOM2事件流，所以事件处理方法是：attachEvent(), detachEvent()。   
```
<script type="text/javascript">
body.attachEvent('onclick', function(e){
    alert('ie 8 attach');
    console.log(e); //e还是事件的实际目标
    alert(this===window);  //true
});
</script>
```
这里面与DOM0级主要**区别就在于事件处理程序的作用域**。可以看到在这种情况下，this指向的是全局window。而DOM0级中指向的是所在元素的作用域。   
   
|方法|描述 | 兼容IE |
|-----|-------|---------|
|preventDefault()|阻止默认行为|returnValue = false|
|stopPropagation()| 取消进一步的事件捕获或冒泡行为 | cancelBubble = false |

--------------
4、DOM3级
html5新加的，里面包括了很多移动端处理。   
[移动端事件汇总](https://github.com/camiler/learnblog/tree/master/phoneEvent/README.md)