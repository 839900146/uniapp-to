import { EventQueue } from "../event"

export type TEventHandle = (...args: any[]) => void

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

export type TPlugin = (config: TConfig) => boolean | Promise<(config: TConfig) => boolean>

export const excute: typeof EventQueue.excute

export {}