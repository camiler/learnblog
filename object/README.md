# 理解JS中的对象属性

对象：无序属性的集合，属性可以包含基本值，对象或者函数。

### 属性
ES标准中定义了两种属性类型：   
1、数据属性   
* [[Configurable]]: 能否通过delete进行属性的删除，能否修改属性的特性，能否修改为访问器属性   
* [[Enumerable]]: 能否通过for-in循环返回属性   
* [[Writable]]: 能否修改属性值
* [[Value]]: 数据值，读写属性值时，都是从这里读写   
以上属性默认值均为true，它们的定义，需要通过Object.defineProperty()进行定义：
```
(function(){
  var person = {
    name: 'camiler'
  }

  Object.defineProperty(person, 'age', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: 24
  })

  console.log(person.age); //24

  person.age = 25;
  console.log(person.age); //24

  delete person.age;
  console.log(person.age); //24

  for(var v in person){
    console.log(v); // "name"
  }
})();
```
以上，如果在严格模式（"use strict";）中，person.age=25时，就会报错typeError。   

2、访问器属性   
[[getter]]和[[setter]]，关于这对属性，[之前有一篇文章](https://github.com/camiler/learnblog/wiki/%5B%5Bget%5D%5D%E3%80%81%5B%5Bput%5D%5D%E4%BB%A5%E5%8F%8Agetter%EF%BC%8Csetter)。  

### 定义多个属性   
```
(function(){
  var person = {
    name: 'camiler'
  }

  Object.defineProperties(person, {
    _friend: {
      value: ['ban']
    },
    age: {
      value: 25,
      configurable: false,
    },
    friend: {
      set: function(f){
        this._friend.push(f);
      },
      get: function(){
        return this._friend;
      }
    }
  });
  person.friend = 'Liu';
  console.log(person.friend); //["ban", "Liu"]
  person.friend = 'Divid';
  console.log(person.friend); //["ban", "Liu", "Divid"]
  
  delete(person.age);
  console.log(person.age); //25

})();
```












