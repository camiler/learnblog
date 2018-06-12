/**
 * 到index1为止，在理想返回的情况下，基本上可以满足了，但是如果。。。前一个then有各种各样的返回，有抛错等一系列的问题，就没法处理了。
 *
 * 由此，官方(https://promisesaplus.com/)给了统一的解决方案：定义一个函数（resolvePromise）来判断和处理这些情况。
 *
 * 参考文档：https://juejin.im/post/5ab20c58f265da23a228fe0f
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
    // 变化一开始：对入参判断  如果 then里面成功和失败 不传 ， 那么默认返回一个函数
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (value) => {return value};
    onRejected = typeof onRejected === 'function' ? onRejected : (err) => {throw err};
    // 变化一结束

    let promise2; //要返回的promise
    if (this.status === 'resolved') {
      promise2 = new MyPromise((resolve, reject) => {
        try {
          let x = onFulfilled(this.value); // 用来接收上一次then的返回值， 对于上一次then的返回值我们确保不了它的类型，可能错误，可是是个promise，可能是个字符串， 或者什么都没返回
          // 正常情况
          // resolve(x);
          // 写个统一的方法 来处理x
          resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      })
    }

    if (this.status === 'rejected') {
      promise2 = new MyPromise((resolve, reject) => {
        try {
          let x = onRejected(this.reason);
          // resolve(x);
          resolvePromise(promise2, x, resolve, reject);
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
            // resolve(x);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });

        this.onRejectedCallbacks.push(() => {
          try {
            let x = onRejected(this.reason);
            // resolve(x);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });

      })
    }

    return promise2;
  }
}

/**
 * 统一处理 第一次then之后的各种情况 ： 返回值各种格式错误异常等
 * @param primise2
 * @param x
 * @param resolve
 * @param reject
 */
function resolvePromise(primise2, x, resolve, reject) {
  if (primise2 === x) {
    // 上一次then返回的就是这个promise本身
    return reject(new TypeError('循环引用了'));
  }

  let called;  // 记录 是否调用过resolve 或者 reject， 防止在then中出现既调用resolve，又调用了reject的情况，忽略后一个调用
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    // 上一次then返回的是 对象或者函数时
    try {
      let then = x.then;
      if (typeof then === 'function') {
        // x 是promise了
        let param1 = function (y) {
          if (called) return;
          called = true;
          resolvePromise(primise2, y, resolve, reject); // y 可能还是和现在x 一样，递归调用，直到返回一个普通值 resolve
        };
        let param2 = function (err) {
          if (called) return;
          called = true;
          reject(err);
        }
        then.call(x, param1, param2); // 这里 在例子执行时就是：x.then(param1('p2'), param2)
      } else {
        // x 不是promise 也存在 直接resolve
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    // 是一个普通值
    resolve(x);
  }
}