// @ts-nocheck
import { ToOption, TConfig } from "./index.d"
export { EventQueue } from './event'

/** 解析路径参数 */
function parse(url = ''): Record<any, any> {
    if (/\?/.test(url)) {
        let arr = url.split('?')?.pop()?.split('&')?.filter(Boolean)
        let kv = {} as Record<any, unknown>
        if (Array.isArray(arr)) {
            for (let i = 0; i < arr.length; i++) {
                let [k, v] = arr[i].split('=')
                kv[k] = v
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
            arr.push(`${key}=${params[key]}`)
        }
    }
    return arr.join('&')
}

/** 生成参数配置 */
function createConfig(url?: string, opt?: ToOption): TConfig {
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
            url: url?.split('?').shift()
        }
    } catch (error) {
        return {
            params: {}
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
    if (config?.clear && url) {
        uni.reLaunch(config)
        return
    }

    // 跳转tabbar页
    if (config?.switch && url) {
        uni.switchTab(config)
        return
    }

    // 采用replace方式
    if (config?.replace && url) {
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
    config.url ? handleHaveUrl(config) : handleNoUrl(config)
}

export const $to = to

export default to