import { TEventHandle } from "./index.d"

export const EventQueue = {
    queue: new Map<any, TEventHandle>(),
    /** 注册事件方法 */
    register: (cbs: TEventHandle | TEventHandle[] | Record<string, TEventHandle>) => {
        if (typeof cbs === 'function') {
            EventQueue.queue.set(cbs.name, cbs)
        } else if (Array.isArray(cbs)) {
            cbs.forEach(cb => {
                (typeof cb === 'function') && EventQueue.queue.set(cb.name, cb)
            })
        } else if (typeof cbs === 'object' && cbs !== null) {
            Object.keys(cbs).forEach(cbk => {
                EventQueue.queue.set(cbk, cbs[cbk])
            })
        }
    },
    /** 执行事件函数 */
    excute: async (name: string, ...args: any[]) => {
        let cb = EventQueue.queue.get(name)
        if (!cb) return false
        try {
            let res = cb.apply(null, args)
            EventQueue.queue.delete(name)
            return res
        } catch (error) {
            console.error(error)
            return false
        }
    }
}