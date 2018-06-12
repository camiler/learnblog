/**
 * promise 伪实现
 * 1、内置3个状态：pending，resolved，rejected 只有pending可以转到其他状态
 * 2、prototype上有then方法，then方法的参数分别时 成功和失败的回调函数，并将成功的值及失败的原因传进回调函数
 * 3、解决executor中的异步失效问题：
 *    产生原因：new实例时，executor中的代码会立即执行，但其中的异步会稍后执行，导致then方法执行时，Promise的状态仍然是pending态
 *    解决方案：在pending态时，将onFulfilled和onRejected缓存在一个数组中，等到执行时，再从数组中拿出来依次执行
 * 4、实现异常处理 走reject： 在new Promise的实例中抛出错误，就 try 执行executor，捕获后reject   ---到这里，极简版的promise就实现啦！
 * 5、实现then的链式调用原理：返回一个新的Promise
 */

class MyPromise {
  constructor (executor) {
    this.status = 'pending';
    this.value = undefined; //成功时 传递给成功回调的数据
    this.reason = undefined; //失败时 传递给失败回调的原因

    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.status === 'pending') {
        this.status = 'resolved';
        this.value = value;
        this.onResolvedCallbacks.forEach((fnItem) => {
          fnItem();
        })
      }
    }

    const reject = (reason) => {
      if (this.status === 'pending') {
        this.status = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach((fnItem) => {
          fnItem();
        })
      }
    }

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  then (onFulfilled, onRejected) {
    let promise2; //要返回的promise
    if (this.status === 'resolved') {
      promise2 = new MyPromise((resolve, reject) => {
        try {
          let x = onFulfilled(this.value); // 用来接收上一次then的返回值
          resolve(x);
        } catch (e) {
          reject(e);
        }
      })
    }

    if (this.status === 'rejected') {
      promise2 = new MyPromise((resolve, reject) => {
        try {
          let x = onRejected(this.reason);
          resolve(x);
        } catch (e) {
          reject(e);
        }
      })
    }

    if (this.status === 'pending') {
      promise2 = new MyPromise((resolve, reject) => {
        this.onResolvedCallbacks.push(() => {
          try {
            let x = onFulfilled(this.value); // 用来接收上一次then的返回值
            resolve(x);
          } catch (e) {
            reject(e);
          }
        });

        this.onRejectedCallbacks.push(() => {
          try {
            let x = onRejected(this.reason);
            resolve(x);
          } catch (e) {
            reject(e);
          }
        });

      })
    }

    return promise2;
  }
}