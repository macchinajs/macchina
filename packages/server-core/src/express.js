import express     from 'express'
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
  const app = express()

  await middleware(app, services, whitelist)
  console.log('Express init done.')


  router(app)

  // server.applyMiddleware({ app, path: '/gql' });

  return app
}

export default createApp;

