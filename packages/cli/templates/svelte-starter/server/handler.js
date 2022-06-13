import setupPassport from './services/passport.js'
import router from './.macchina/router.js'
import {makeHandler} from '@macchina/server-core/index.js'

const macchina_options = {
  whitelist: [
    'https://macchina-svelte-starter.vercel.app',
    'http://macchina-svelte-starter.vercel.app',
    'http://127.0.0.1:3000',
    'http://localhost:3000',
  ]
}

const startApp = makeHandler(router, [setupPassport], macchina_options)

export default startApp

