import { parse } from 'regexparam';

export default class Router {
  constructor() {
    this.routes = [];

    this.all = this.add.bind(this, '');
    this.get = this.add.bind(this, 'get');
    this.head = this.add.bind(this, 'head');
    this.patch = this.add.bind(this, 'patch');
    this.options = this.add.bind(this, 'options');
    this.connect = this.add.bind(this, 'connect');
    this.delete = this.add.bind(this, 'delete');
    this.trace = this.add.bind(this, 'trace');
    this.post = this.add.bind(this, 'post');
    this.put = this.add.bind(this, 'put');
    this.ws = this.add.bind(this, 'ws');
  }

  use(route, ...fns) {
    let handlers = [].concat.apply([], fns);
    let { keys, pattern } = parse(route, true);
    this.routes.push({ keys, pattern, method:'', handlers });
    return this;
  }

  add(method, route, ...fns) {
    let { keys, pattern } = parse(route);
    let handlers = [].concat.apply([], fns);
    this.routes.push({ keys, pattern, method, handlers });
    return this;
  }

  find(method, url) {
    // console.log("FIND:", method, url, this.routes)
    let isHEAD=(method === 'head');
    let i=0, j=0, k
    let handlers=[]
    for (; i < this.routes.length; i++) {
      const route = this.routes[i];
      // console.log("ROUTE:", route)
      if (route.method.length === 0 || route.method === method || isHEAD && route.method === 'get') {
        if (route.keys === false) {
          matches = route.pattern.exec(url);
          if (matches === null) continue;
          if (matches.groups !== void 0) for (k in matches.groups) params[k]=matches.groups[k];
          route.handlers.length > 1 ? (handlers=handlers.concat(route.handlers)) : handlers.push(route.handlers[0]);
        } else if (route.keys.length > 0) {
          matches = route.pattern.exec(url);
          if (matches === null) continue;
          route.handlers.length > 1 ? (handlers=handlers.concat(route.handlers)) : handlers.push(route.handlers[0]);
        } else if (route.pattern.test(url)) {
          route.handlers.length > 1 ? (handlers=handlers.concat(route.handlers)) : handlers.push(route.handlers[0]);
        }
      } // else not a match
    }

    return { handlers };
  }
}
