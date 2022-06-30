import uExpress from '@macchina/uexpress'
import { middleware } from './http/middleware.js'

const createApp = async (router, services, options) => {
  if (!options) {
    throw Error("NO SERVER OPTIONS SUPPLIED")
  }

  const whitelist = options.whitelist

  if (!whitelist) {
    throw Error("NO SERVER CORS WHITELIST SUPPLIED")
  }

  console.log('Initializing express...')
  const app = new uExpress()

  await middleware(app, services, whitelist)
  router(app)
  console.log('Express init done.')

  // server.applyMiddleware({ app, path: '/gql' });

  return app
}

export default createApp;

