// Imports
///////////////////////////////////////////////////////////////////////////////
import dayjs from "dayjs"
import chalk from "chalk"
import dotenv from 'dotenv'
import serverlessExpress from "@vendia/serverless-express"

import connectToDB from "./db/mongo.js"
import createApp from "./express.js"

// Vars
///////////////////////////////////////////////////////////////////////////////
dotenv.config()

// funcs
///////////////////////////////////////////////////////////////////////////////
export function makeHandler(router, services, options) {
  return async function startApp(...args) {
    console.log("\n")
    console.log(
      chalk.bold(
        `---------------------[ Server starting at ${dayjs().format(
          "YYYY-MM-DD HH:mm:ss.SSS"
        )} ]---------------------------`
      )
    )

    // Create express app and connect to db
    let connection = connectToDB()
    let app = createApp(router, services, options)
    connection = await connection

    app = serverlessExpress({app})
    // app = middy(app).use(cors())
    console.log("Connected!")

    return app(...args)
  }
}
