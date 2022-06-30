import http from 'http'
import uws from 'uWebSockets.js'
import Router from './router.js'

function lead(x) {
  return x.charCodeAt(0) === 47 ? x : ('/' + x)
}

function value(x) {
  let y = x.indexOf('/', 1)
  return y > 1 ? x.substring(0, y) : x
}

function mutate(str, req) {
  req.url = req.url.substring(str.length) || '/'
  req.path = req.path.substring(str.length) || '/'
}

function onError(err, req, res, next) {
  let code = (res.statusCode = err.code || err.status || 500)
  if (typeof err === 'string' || Buffer.isBuffer(err)) res.end(err)
  else res.end(err.message || http.STATUS_CODES[code])
}

function readJson(res, cb, err) {
  /* Register error cb */
  res.onAborted(err);
}

// Polka based server
export default class uExpress extends Router {
  constructor(opts={}) {
    super(opts)
    this.apps = {}
    this.wares = []
    this.bwares = {}
    // this.parse = parser
    this.server = opts.server || uws.App({})
    this.ws = this.server.ws
    this.handler = this.handler.bind(this)
    this.onError = opts.onError || onError // catch-all handler
    this.onNoMatch = opts.onNoMatch || this.onError.bind(null, { code:404 })
  }

  add(method, pattern, ...fns) {
    let base = lead(value(pattern))
    if (this.apps[base] !== void 0) throw new Error(`Cannot mount ".${method.toLowerCase()}('${lead(pattern)}')" because a Server application at ".use('${base}')" already exists! You should move this handler into your server application instead.`)
    return super.add(method, pattern, ...fns)
  }

  use(base, ...fns) {
    if (typeof base === 'function') {
      this.wares = this.wares.concat(base, fns)
    } else if (base === '/') {
      this.wares = this.wares.concat(fns)
    } else {
      base = lead(base)
      fns.forEach(fn => {
        if (fn instanceof uExpress) {
          this.apps[base] = fn
        } else {
          let arr = this.bwares[base] || []
          arr.length > 0 || arr.push((r, _, nxt) => (mutate(base, r),nxt()))
          this.bwares[base] = arr.concat(fn)
        }
      })
    }
    return this // chainable
  }

  listen() {
    // (this.server = this.server || uws.App({})).any(this.handler)
    this.server.any('/*', this.handler)
    this.ws = this.server.ws
    this.server.listen.apply(this.server, arguments)
    return this
  }

  sendType(data='', code='200 OK', headers={}) {
    let res = this
    const TYPE = 'content-type';
    const OSTREAM = 'application/octet-stream';

    let k, obj={};
    for (k in headers) {
      obj[k.toLowerCase()] = headers[k];
    }

    let type = obj[TYPE]

    if (!!data && typeof data.pipe === 'function') {
      res.setHeader(TYPE, type || OSTREAM);
      return data.pipe(res);
    }

    // console.log("DATA:", data, code, typeof data)
    if (data instanceof Buffer) {
      type = type || OSTREAM; // prefer given
    } else if (typeof data === 'object' || typeof data === 'array') {
      // console.log("JSON:", data)

      data = JSON.stringify(data);
      type = 'application/json;charset=utf-8';
    } else {
      data = data || http.STATUS_CODES[code];
    }

    obj[TYPE] = type || 'text/plain';
    obj['content-length'] = Buffer.byteLength(Buffer.from(data))

    // console.log("RES:", code, data, typeof data)
    res.writeStatus(code);
    res.end(data);
  }

  handler(res, req) {
    console.log("HANDLER")
    res.send = this.sendType

    res.onAborted((e) => {
      console.log("ABORTED:", e)
    });


    const parseJson = (ab, isLast) => {
      let buffer;
      return new Promise((resolve, reject) => {
        let chunk = Buffer.from(ab);
        if (isLast) {
          if (buffer) {
            resolve(JSON.parse(Buffer.concat([buffer, chunk])));
          } else {
            resolve(JSON.parse(chunk));
          }
        } else {
          if (buffer) {
            buffer = Buffer.concat([buffer, chunk]);
          } else {
            buffer = Buffer.concat([chunk]);
          }
        }
      })
    }

    res.onData(await parseJson);

    if (method !== 'trace' &&
        req.getHeader('content-type') === 'application/json') {
      // const json = readJson(res, obj => {
      //   console.log('ojb:', obj)
      // })
    }
    // console.log("ORIGIN:", req.getHeader('origin'),query, url, params)

    // info = info || this.parse(req)
    const query  = req.getQuery()
    const url    = req.getUrl()
    const params = req.getParameter()
    const method = req.getMethod()


    let fns=[], arr=this.wares, obj=this.find(method, url)
    req.originalUrl = req.originalUrl || req.url
    let base = value(req.path = url)
    if (this.bwares[base] !== void 0) {
      arr = arr.concat(this.bwares[base])
    }
    if (obj) {
      fns = obj.handlers
      req.params = params
    } else if (this.apps[base] !== void 0) {
      mutate(base, req)
      fns.push(this.apps[base].handler.bind(null, req, res, info))
    }
    fns.push(this.onNoMatch)
    // Grab addl values from `info`
    req.search = ''
    req.query = query
    // console.log("PARSED QUERY:", req.query, fns)
    // Exit if only a single function
    let i=0, len=arr.length, num=fns.length
    if (len === i && num === 1) return fns[0](req, res)
    // // Otherwise loop thru all middlware
    let next = err => err ? this.onError(err, req, res, next) : loop()
    let loop = _ => res.finished || (i < len) && arr[i++](req, res, next)
    arr = arr.concat(fns)
    len += num
    loop() // init
  }
}


