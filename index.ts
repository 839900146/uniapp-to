// @ts-nocheck
import { EventQueue } from "./event"
import { applyPlugins, usePlugins, TPlugin } from "./plugin"

export type ToOption = Partial<{
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
    /** 事件列表 */
    events: Record<string, (...args: any[]) => any | Promise<(...args: any[]) => any>>,
    /** 需要传递的参数 */
    params: Record<any, any>,
    /** 成功函数 */
    success: () => any,
    /** 失败函数 */
    fail: (error: unknown) => any,
    [propName: string]: any
}>

export type TConfig = {
    url?: string
    params: Record<any, any>
} & ToOption

/** 解析路径参数 */
function parse(url = ''): Record<any, any> {
    if (/\?/.test(url)) {
        let arr = url.split('?')?.pop()?.split('&')?.filter(Boolean)
        let kv = {} as Record<any, unknown>
        if (Array.isArray(arr)) {
            for (let i = 0; i < arr.length; i++) {
                let [k, v] = arr[i].split('=')
                kv[k] = decodeURIComponent(v)
            }
        }
        return kv
    } else {
        return {}
    }
}

/** 生成路径参数 */
function stringify(params: Record<any, any>) {
    let arr = [] as string[]
    for (const key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
            arr.push(`${key}=${encodeURIComponent(params[key])}`)
        }
    }
    return arr.join('&')
}

/** 生成参数配置 */
function createConfig(url?: string, opt?: ToOption): TConfig {
    let success = opt?.success || function () { }
    let fail = opt?.fail || function () { }
    try {
        // 提取路径参数
        let urlParams = parse(url)
        let config = { ...(opt || {}) } as TConfig
        // 合并路径参数
        if (Object.keys(urlParams).length > 0) {
            if (config?.params) {
                Object.assign(config.params, urlParams)
            } else if (config) {
                config.params = urlParams
            } else {
                config = {
                    params: urlParams
                }
            }
        }
        return {
            ...config,
            url: url?.split('?').shift(),
            success,
            fail,
        }
    } catch (error) {
        return {
            params: {},
            success,
            fail,
        }
    }
}

/** 没有传递url的情况 */
function handleNoUrl(config: TConfig) {
    // 退出小程序
    if (config?.exitPrograme) {
        wx.exitMiniProgram(config)
        return
    }

    // 回到首页
    if (getCurrentPages().length === 1) {
        to('/', { clear: true })
        return
    }

    // 退回上一个小程序
    if (config?.backPrograme) {
        wx.navigateBackMiniProgram({
            extraData: config?.params || {},
            ...config
        })
        return
    }

    // 回到上一页
    uni.navigateBack({ ...config, delta: config?.delta || 1 })
    return
}

/** 有传递url的情况 */
function handleHaveUrl(config: TConfig) {
    config.url = `${config.url}?${stringify(config.params)}`
    // 跳转微信小程序
    if (config?.miniPrograme && config?.id) {
        wx.navigateToMiniProgram({
            appId: config.id,
            path: config.url,
            extraData: config?.params || {},
            ...config
        })
        return;
    }

    // 等价于reLaunch
    if (config?.clear) {
        uni.reLaunch(config)
        return
    }

    // 跳转tabbar页
    if (config?.switch) {
        uni.switchTab(config)
        return
    }

    // 采用replace方式
    if (config?.replace) {
        uni.redirectTo(config)
        return
    }

    // #ifdef MP-WEIXIN || MP-TOUTIAO
    // 判断当前页面栈是否已满
    let pages = getCurrentPages()

    if (pages.length >= 10) {
        uni.redirectTo(config)
    } else {
        uni.navigateTo(config)
    }
    // #endif

    // #ifdef H5
    uni.navigateTo(config)
    // #endif
}

/** 主方法 */
export async function to(url?: string, opt?: ToOption) {
    let config = createConfig(url, opt)
    if (config.events) EventQueue.register(config.events)
    if (await applyPlugins(config)) return
    config.url ? handleHaveUrl(config) : handleNoUrl(config)
}

export const $to = to

export default to

export const excute = EventQueue.excute

export { usePlugins, TPlugin }