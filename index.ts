export type TOptions = {
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
    fail: (error: unknown) => any
}

export const to = (url?: string, options?: Partial<TOptions>) => {

    const success = options?.success || function() {}
    const fail = options?.fail || function() {}

    // 不传递url则认为是回退
    if (!url) {
        uni.navigateBack({ delta: options?.delta || 1, success, fail })
        return
    }

    // 处理路径传参
    if(url && options?.params) {
        let arr = [] as string[]
        for (const key in options.params) {
            if (Object.prototype.hasOwnProperty.call(options.params, key)) {
                arr.push(`${key}=${options.params[key]}`)
            }
        }
        if(arr.length > 0) url += `?${arr.join('&')}`
    }

    // 等价于reLaunch
    if (options?.clear && url) {
        uni.reLaunch({ url, success, fail })
        return
    }

    // 采用replace方式
    if (options?.replace && url) {
        uni.redirectTo({ url, success, fail })
        return
    }

    // #ifdef MP-WEIXIN || MP-TOUTIAO
    // 判断当前页面栈是否已满
    let pages = getCurrentPages()

    if(pages.length >= 10) {
        uni.redirectTo({ url, success, fail })
    } else {
        uni.navigateTo({ url, events: options?.events || {}, success, fail })
    }
    // #endif

    // #ifdef H5
    uni.navigateTo({ url, events: options?.events || {}, success, fail })
    // #endif
}