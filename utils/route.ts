import RouteRegister from './route-register'

interface routeParam {
  path: string,
  method?: string
}
/**
 * 用户界面路由
 */
export function route({ path, method = "get" }: routeParam) {
  return (target: any, name: string) => {
    RouteRegister.__DecoratedRouters.push([{
      path: path,
      method: method
    }, target[name]]);
  }
}

/**
 * admin路由
 */
export function adminRoute({ path, method = "get" }: routeParam) {
  return (target: any, name: string) => {
    RouteRegister.__DecoratedRouters.push([{
      path: "/admin" + path,
      method: method
    }, target[name]]);
  }
}