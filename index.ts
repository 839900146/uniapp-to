export type TOptions = {
    /** 等价于redirect */
    replace: boolean,
    /** 回退的页面数量 */
    delta: number,
    /** 等价于reLaunch */
    clear: boolean,
    /** 等价于switchTab */
    switch: boolean,
    /** 事件列表 */
    events: Record<any, any>,
    /** 需要传递的参数 */
    params: Record<any, any>,
    /** 成功函数 */
    success: () => any,
    /** 失败函数 */
    fail: (error: unknown) => any
}

const parse = (url = '') => {
    let arr = url.split('?')?.pop()?.split('&')?.filter(Boolean)
    let kv = {} as Record<any, unknown>
    if (Array.isArray(arr)) {
        for (let i = 0; i < arr.length; i++) {
            let [k, v] = arr[i].split('=')
            kv[k] = v
        }
    }
    return kv
}

const stringify = (params: Record<any, any>) => {
    let arr = [] as string[]
    for (const key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
            arr.push(`${key}=${params[key]}`)
        }
    }
    return arr.join('&')
}

export const to = (url?: string, options?: Partial<TOptions>) => {

    const success = options?.success || function () { }
    const fail = options?.fail || function () { }

    // 提取路径参数
    let urlParams = parse(url)
    // 合并路径参数
    if(Object.keys(urlParams).length > 0) {
        url = url?.split('?').shift()
        if(options?.params) {
            Object.assign(options.params, urlParams)
        } else if (options) {
            options.params = urlParams
        }
    }

    // 不传递url则认为是回退
    if (!url) {
        if (getCurrentPages().length === 1) {
            to('/', { clear: true })
            return
        }

        uni.navigateBack({ delta: options?.delta || 1, success, fail })
        return
    }

    // 处理路径传参
    if (url && options?.params) {
        let str = stringify(options?.params)
        if (str.length > 0) url += `?${str}`
    }

    // 等价于reLaunch
    if (options?.clear && url) {
        uni.reLaunch({ url, success, fail })
        return
    }

    // 跳转tabbar页
    if (options?.switch && url) {
        uni.switchTab({ url, success, fail })
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

    if (pages.length >= 10) {
        uni.redirectTo({ url, success, fail })
    } else {
        uni.navigateTo({ url, events: options?.events || {}, success, fail })
    }
    // #endif

    // #ifdef H5
    uni.navigateTo({ url, events: options?.events || {}, success, fail })
    // #endif
}