
import Cover from './cover'

export function route(config: { path: string, method: string }) {
  return (target: any, name: string) => {
    console.log(config.path);
    
      Cover.__DecoratedRouters.push([{
        path: config.path,
        method: config.method
      }, target[name]]); 
  }
}