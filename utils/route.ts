import RouteRegister from './route-register'

interface routeParam {
	path: string,
	method?: string
}

/**
 * 新装饰器
 */
export function route({ path, method = "get" }: routeParam) {
	/**
	 * @target 被装饰对象
	 * @name 被装饰（函数，变量，类）名称
	 */
	return (target: any, name: string) => {
		method = method.toLowerCase();
		target.methods = target.methods || [];
		target.methods.push({
			target: target,
			name: name,
			handler: (<any>target)[name],
			path: path,
			method: method
		});
	}
}