import dayjs from "dayjs"
import chalk from "chalk"
import dotenv from 'dotenv'
import serverlessExpress from "@vendia/serverless-express"

import connectToDB from "./db/mongo.js"
import createApp from "./src/express.js"
import path from 'path'

const PORT = 4000

try {
  dotenv.config({ path: `.env.${process.env.NODE_ENV}` })
} catch(e) {
  console.log("Dotenv error:", e)
}

export function makeHandler(server, router, services, options) {
  return async function startApp(mongoose, local=false, ...args) {
    console.log("\n")
    console.log(
      chalk.bold(
        `---------------------[ Server starting at ${dayjs().format(
          "YYYY-MM-DD HH:mm:ss.SSS"
        )} ]---------------------------`
      )
    )

    // Create express app and connect to db
    let connection = connectToDB(mongoose)
    connection = await connection
    console.log('Connected to DB')
    let app = await createApp(server, router, services, options)

    if (!local) {
      app = serverlessExpress({app})
      console.log("Connected!")
      return app(...args)
    } else {
      app.listen(PORT, () => {
        console.log(`Example app listening at http://localhost:${PORT}`)
      })
    }
    // app = middy(app).use(cors())
  }
}
