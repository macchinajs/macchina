import path        from 'path'
import express     from 'express'
import helmet      from 'helmet'
import crossdomain from "helmet-crossdomain"
import netjet      from 'netjet'
import compression from 'compression'
import cors        from "cors"
import rateLimit   from "express-rate-limit"
import swaggerUi   from 'swagger-ui-express'
import swaggerAutogen from 'swagger-autogen';
import fs from 'fs'

function initHelmetHeaders(app) {
  // Use helmet to secure Express headers
  app.use(helmet.xssFilter());
  app.use(helmet.noSniff());
  app.use(helmet.frameguard());
  app.use(helmet.ieNoOpen());
  app.use(crossdomain());
  app.use(helmet.hidePoweredBy());
}

const allowCrossDomain = function(req, res, next) {
    // res.header('Access-Control-Allow-Origin', 'https://myproject-front.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

async function genSwaggerDocs() {
  try {
    console.log('current dir:', process.cwd())
    const doc = {
      info: {
        title: 'Swagger API'
      }
    };

    const outputFile = './swagger-output.json';
    const endpointsFiles = ['./.macchina/router.js'];

    await swaggerAutogen()(outputFile, endpointsFiles, doc)
  } catch(error) {
    console.log("genSwaggerDocs error:", error)
  }
}

export const middleware = async (app, services, whitelist) => {
  const corsOptions = {
    origin: function(origin, callback){
      let originIsWhitelisted = whitelist.indexOf(origin) !== -1;
      callback(null, originIsWhitelisted);
    },
    credentials: true
  };

  app.use(netjet())
  app.use(cors(corsOptions))
  // app.options('*', cors());
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(express.static('./static'))
  app.use(compression())
  // app.use(pino())

  try {
    await genSwaggerDocs()
    const swaggerFile = JSON.parse(fs.readFileSync('./swagger-output.json'));
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
  } catch(e) {
    console.log("swagger docs generation error", e)
  }

  // server.applyMiddleware({ app });

  // Rate limit per function
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: {errors: [{username: 'Too many attempts.'}]},
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);

  initHelmetHeaders(app)

  // Force https in production
  if (app.get('env') === 'production') {
    app.use(function(req, res, next) {
      var protocol = req.get('x-forwarded-proto');
      protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
    });
  }

  app.use(allowCrossDomain)

  for (let service of services) {
    service(app)
  }

  // Force https in production
  if (app.get('env') === 'production') {
    app.use(function(req, res, next) {
      var protocol = req.get('x-forwarded-proto');
      protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
    });
  }


  // server.applyMiddleware({ app, path: '/gql' });

  return app
}

