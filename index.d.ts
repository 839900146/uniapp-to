import { to } from './index'

export { }

declare module 'vue/types/vue' {
    interface Vue {
        $to: typeof to
    }
}