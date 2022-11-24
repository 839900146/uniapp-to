# 路由跳转方法

对 `uni.redirect`、`uni.reLaunch`、`uni.navigateTo`、`uni.navigateBack` 进行封装

- 支持vue2/vue3
- 对页面栈超出做防护处理
- 简化原生api复杂度

## 用法
```ts
// 1. 通过import导入
import { to } from 'uniapp-to'

// 2. 在组件实例中使用(vue2)
this.$to
```

## 方法类型
```ts
type to = (url?: string, options?: Partial<{
    /** 等价于redirect */
    replace: boolean,
    /** 回退的页面数量 */
    delta: number,
    /** 等价于reLaunch */
    clear: boolean,
    /** 事件列表 */
    events: Record<any, any>,
    /** 需要传递的参数 */
    params: Record<any, any>,
    /** 成功函数 */
    success: () => any,
    /** 失败函数 */
    fail: (error: unknown) => any,
}>) => void
```

## 用法示例

1. 直接跳转到某个页面
```ts
to('/aaa/bbb')
```

2. 回退到上一个页面
```ts
to()
```

3. 回退到N个页面之前
```ts
to(null, { delta: 8 })
```

4. 重定向到某个页面
```ts
to('/aaa/bbb', { replace: true })
```

5. 销毁所有页面并跳转到新页面
```ts
to('/aaa/bbb', { clear: true })
```

6. 跳转页面并传参
```ts
to('/aaa/bbb', { params: {a: 1, b: 2, c: 3} })
```

7. 设置事件监听对象并跳转页面
```ts
to('/aaa/bbb', {
    events: {
        test: (res) => {
            console.log(res)
        }
    }
})
```

8. 跳转页面并监听成功与失败
```ts
to('/aaa/bbb', {
    success: () => {},
    fail: () => {}
})
```

## 注意事项

1. options参数可以组合使用
2. 如果不传递url，则为回退页面
3. 回退页面时不支持传递 `params` 
4. `clear` 优先级比 `replace` 高，若两者同时写，则默认执行 `clear`
5. 若达到最大页面栈时，会采用 `replace` 方式继续跳转，好处是页面可以一直跳转下去，坏处是无法退回到上一个页面