import path        from 'path'
// import helmet      from 'helmet'
// import crossdomain from "helmet-crossdomain"
// import netjet      from 'netjet'
// import compression from 'compression'
// import rateLimit   from "express-rate-limit"
import swaggerUi   from 'swagger-ui-express'
// import bodyParser  from 'body-parser'
import swaggerAutogen from 'swagger-autogen';
import fs from 'fs'

async function genSwaggerDocs() {
  try {
    // console.log('current dir:', process.cwd())
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
  const allowCrossDomain = function(req, res, next) {
    res.writeHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.writeHeader("Access-Control-Allow-Headers", "origin, content-type, accept, authorization");
    res.writeHeader("Access-Control-Max-Age", "3600");

    const origin = req.getHeader('origin')
    if (whitelist.includes(origin) !== -1) {
      res.writeHeader("Access-Control-Allow-Origin", origin);
    }

    next()
  }

  // try {
  //   await genSwaggerDocs()
  //   const swaggerFile = JSON.parse(fs.readFileSync('./swagger-output.json'));
  //   app.use('/docs', swaggerUi.serve)
  //   app.get('/docs', swaggerUi.setup(swaggerFile));
  // } catch(e) {
  //   console.log("swagger docs generation error", e)
  // }


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

  // // Force https in production
  // if (app.get('env') === 'production') {
  //   app.use(function(req, res, next) {
  //     var protocol = req.get('x-forwarded-proto');
  //     protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
  //   });
  // }


  // server.applyMiddleware({ app, path: '/gql' });

  return app
}

