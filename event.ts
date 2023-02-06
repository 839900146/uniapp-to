import { TEventHandle } from "./index.d"

export const EventQueue = {
    queue: new Map<any, TEventHandle>(),
    /** 注册事件方法 */
    register: (cbs: TEventHandle | TEventHandle[] | Record<string, TEventHandle>) => {
        if (typeof cbs === 'function') {
            let name = cbs.name || `__no_name__${Date.now()}_${EventQueue.queue.size}__`
            EventQueue.queue.set(name, cbs)
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
    excute: async (name?: string, ...args: any[]) => {
        if(name) {
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
        } else {
            // 执行所有匿名函数
            let applys: any[] = []
            for (const [name, cb] of EventQueue.queue.entries()) {
                if(name?.startsWith?.('__no_name__')) {
                    applys.push(new Promise((resolve) => {
                        let v = cb.apply(null, args)
                        resolve(v)
                        EventQueue.queue.delete(name)
                    }))
                }
            }
            return Promise.all(applys)
        }
    }
}