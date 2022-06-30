import dayjs from "dayjs"
import chalk from "chalk"
import dotenv from 'dotenv'
import serverlessExpress from "@vendia/serverless-express"
import cluster from 'node:cluster';
import { cpus } from 'node:os';

import connectToDB from "./db/mongo.js"
import createApp from "./src/express.js"
import path from 'path'

const PORT = 4000
const totalCPUs = cpus().length;

try {
  dotenv.config({ path: `.env.${process.env.NODE_ENV}` })
} catch(e) {
  console.log("Dotenv error:", e)
}

export function makeHandler(server, router, services, options) {
  return async function startApp(mongoose, local=false, ...args) {
    if (process.env.CLUSTER_MODE && cluster.isPrimary) {
      console.log(`Number of CPUs is ${totalCPUs}`);
      console.log(`Master ${process.pid} is running`);

      // Fork workers.
      for (let i = 0; i < totalCPUs; i++) {
        cluster.fork();
      }

      cluster.on("exit", (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
        console.log("Let's fork another worker!");
        cluster.fork();
      });
    } else {
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
      console.log(`Worker ${process.pid} started`);

      if (!local) {
        app = serverlessExpress({app})
        console.log("Connected!")
        return app(...args)
      } else {
        app.listen(PORT, () => {
          console.log(`Example app (pid:${process.pid}) listening at http://localhost:${PORT}`)
        })
      }
    }

    // app = middy(app).use(cors())
  }
}
