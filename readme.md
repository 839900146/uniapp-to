# 路由跳转方法

对 `uni.redirect`、`uni.reLaunch`、`uni.navigateTo`、`uni.navigateBack` 进行封装

- 支持vue2/vue3
- 对页面栈超出做防护处理
- 简化原生api复杂度

## 用法
```ts
// 1. 通过import导入
import { to } from 'uniapp-to'
// 或 import { $to } from 'uniapp-to'
// 或 import to from 'uniapp-to'

// 2. 在组件实例中使用(vue2)
this.$to
```

## 方法类型
```ts
type to = (url?: string, options?: Partial<{
    /** id，可以是视频号id、小程序AppID */
    id: string
    /** 跳转微信小程序 */
    miniPrograme: boolean
    /** 回到上一个小程序 */
    backPrograme: boolean
    /** 退出小程序 */
    exitPrograme: boolean
    /** 跳转视频号主页 */
    videoIndex: boolean
    /** 等价于redirect */
    replace: boolean,
    /** 回退的页面数量 */
    delta: number,
    /** 等价于reLaunch */
    clear: boolean,
    /** 需要传递的参数 */
    params: Record<any, any>,
    /** 成功函数 */
    success: () => any,
    /** 失败函数 */
    fail: (error: unknown) => any,
}>) => void
```

## 用法示例

1. **直接跳转到某个页面**
```ts
to('/aaa/bbb')
```

2. **回退到上一个页面**
```ts
to()
```

3. **回退到N个页面之前**
```ts
to(null, { delta: 8 })
```

4. **重定向到某个页面**
```ts
to('/aaa/bbb', { replace: true })
```

5. **销毁所有页面并跳转到新页面**
```ts
to('/aaa/bbb', { clear: true })
```

6. **跳转至tabbar页面**
```ts
to('/aaa/bbb', { switch: true })
```

7. **跳转页面并传参**
```ts
to('/aaa/bbb', { params: {a: 1, b: 2, c: 3} })
```

8. **跳转页面并监听成功与失败**
```ts
to('/aaa/bbb', {
    success: () => {},
    fail: () => {}
})
```

9.  **跳转微信小程序**
```ts
// 跳转小程序的pages/Home/Home页面
to('pages/Home/Home', { id: 'appId', miniPrograme: true })

// 跳转小程序的pages/Home/Home页面并传递参数
to('pages/Home/Home', { id: 'appId', miniPrograme: true, params: { a: 1 } })
```

10. **回到上一个小程序**
```ts
// 直接退回上一个小程序
to(null, { backPrograme: true })

// 回到上一个小程序并传递参数
to(null, { backPrograme: true, params: { a: 1 } })
```

11. **退出小程序**
```ts
to(null, { exitPrograme: true })
```


## 注意事项

1. options参数可以组合使用
2. 如果不传递url，则根据第二个参数判断做跳转、退出、退回处理
3. 回退页面时不支持传递 `params` 
4. `clear` 优先级比 `switch` 高，若两者同时写，则默认执行 `clear`
5. `switch` 优先级比 `replace` 高，若两者同时写，则默认执行 `switch`
6. 若达到最大页面栈时，会采用 `replace` 方式继续跳转，好处是页面可以一直跳转下去，坏处是无法退回到上一个页面
7. `退回上一页`、`退出小程序`、`回退上一个小程序`、`跳转小程序`不需要传递`url`参数
8. `跳转小程序`需要传递id


## 事件队列
内置事件队列功能，开发者可以注册对应的事件方法并在任意时间去触发它，使用场景如跨页面通信等

### 注册事件
往事件队列中添加执行方法，添加的方法可以是同步的，也可以是异步的
```ts
import { EventQueue } from 'uniapp-to'

let fn1 = () => {}
// 注册事件 - 方式1 直接传递方法
EventQueue.register(fn1)
// 注册事件 - 方式2 传递一个方法数组
EventQueue.register([fn1])
// 注册事件 - 方式3 传递一个方法对象
EventQueue.register({ fn2: fn1 })
```


### 注册事件
通过调用 `excute` 并传入方法名即可完成调用

**当方法成功调用后，该方法将会被移出事件队列**

```ts
// 执行事件，可以在任意地方执行事件队列中的方法
import { EventQueue } from 'uniapp-to'

// 执行事件fn1
EventQueue.excute('fn1')

// 执行事件fn2
EventQueue.excute('fn2').then(res => console.log(res))

// 执行事件fn2
(async () => {
    // 可以传递参数，excute后续的所有参数，都将传递给事件队列中所执行的方法
    let res = await EventQueue.excute('fn2', 111, 'aaa', {a: 1, b: 2})
    console.log(res)
})()
```
> 执行excute必须传递方法名