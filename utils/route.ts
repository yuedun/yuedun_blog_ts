import RouteRegister from './route-register'

interface RouteParam {
	path?: string;
	method?: string;
	json?: boolean;//是否返回json数据
}

/**
 * 装饰器
 * @param path 指定路由，不指定时取静态函数名为路由 
 * @param method 请求方法：get,post,put,delete等
 * @param json 返回的数据类型，是否为json数据
 */
export function route({ path, method = "get", json = false }: RouteParam) {
	/**
	 * @target 被装饰对象
	 * @name 被装饰（函数，变量，类）名称
	 */
	return (target: any, name: string) => {
		method = method.toLowerCase();
		target.methods = target.methods || [];
		target.methods.push({
			target,
			name,
			handler: (<any>target)[name],
			path,
			method,
			json
		});
	}
}