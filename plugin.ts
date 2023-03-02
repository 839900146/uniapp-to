import { TPlugin, TConfig } from "./types/types"

const _plugins: TPlugin[] = []

export const usePlugins = (plugins: TPlugin | TPlugin[]) => {
    if (!Array.isArray(plugins) && typeof plugins === 'function') plugins = [plugins]
    
    plugins.forEach(plugin => {
        if (!_plugins.includes(plugin)) _plugins.push(plugin)
    })
}

export const applyPlugins = async (config: TConfig) => {
    for (const plugin of _plugins) {
        try {
            let flag = await plugin(config)
            if (flag === true) return flag
        } catch (error) {
            console.error('[uniapp-to plugin error]', error)
        }
    }
}