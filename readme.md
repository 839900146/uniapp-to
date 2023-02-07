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
    /** 事件列表 */
    events: Record<string, (...args: any[]) => any | Promise<(...args: any[]) => any>>,
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

12. **事件机制**
```ts
to('/aaa/bbb', {
    events: {
        a: () => {},
        b: async () => {}
    }
})

// 在/aaa/bbb页面
import { excute } from 'uniapp-to'
// 执行事件a
excute('a')
// 执行事件b并传递参数
excute('b', 1, 2, 3)
// 执行同步事件并获取返回值
let res1 = excute('a')
// 执行异步事件并获取返回值
(async () => {
 let res2 = await excute('b', 1, 2, 3)
})()
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


## 插件机制
内置插件实现机制，使用方式如下

### 注册插件
```ts
import { usePlugins, TPlugin } from 'uniapp-to'

// 定义插件
const myPlugin = (config: TPlugin) => {
    console.log('plugin config', config)
    if(config.url.startWith('/aaa')) {
        uni.replace(config.url)
        return true
    }
}

// 注册插件
usePlugins(myPlugin)
```

### 插件类型定义
```ts
type TPlugin = (config: TConfig) => boolean | Promise<(config: TConfig) => boolean>
```

- 如果插件方法执行完毕后有返回值且为 `true`，则将不再执行内置的后续逻辑，也就是说，后续的跳转方法将必须由该插件自身实现