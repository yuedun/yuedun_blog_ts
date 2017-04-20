
import Cover from './cover'

/**
 * 用户界面路由
 */
export function route(config: { path: string, method?: string }) {
  let method = config.method ? config.method : "get";  
  return (target: any, name: string) => {
    Cover.__DecoratedRouters.push([{
      path: config.path,
      method: method
    }, target[name]]);
  }
}

/**
 * admin路由
 */
export function adminRoute(config: { path: string, method: string }) {
  return (target: any, name: string) => {
    Cover.__DecoratedRouters.push([{
      path: "/admin" + config.path,
      method: config.method
    }, target[name]]);
  }
}