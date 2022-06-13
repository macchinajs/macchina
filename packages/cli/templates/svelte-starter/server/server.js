import startApp from './handler.js'
import mongoose from 'mongoose'

if (process.env.NODE_ENV == 'development') {
  const app = await startApp(mongoose, true)
} else {
  const app = await startApp(mongoose, false)
}
