## 移动端js手势事件汇总

按响应的先后顺序
1. touchstart   event.touches[0]   
2. touchmove    event.changedTouches[0]   
3. touchend     event.changedTouches[0]   
4. click

---------------
ios额外提供的手势操作
1. gesturestart
2. gesturechange
3. gestureend

可能会用event中的scale和rotation属性