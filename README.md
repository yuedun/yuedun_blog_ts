# yuedun_ts
使用typescript开发博客，简单的作为联系typescript项目

tsconfig.json配置说明：
```javascript
{
    "compilerOptions": {
        "module": "commonjs",//模块化规范
        "target": "es5",//生成js
        "noImplicitAny": true,//
        "noImplicitReturns": true,//函数没有返回值提示
        "noFallthroughCasesInSwitch": true,//switch没有break提示
        "removeComments": true,//输出文件移除注释
        "noEmitOnError": true,//ts文件错误时不生成js
        "rootDir": "./",//需要编译的根目录
        "outDir": "./build",//编译文件输出目录
        "sourceMap": ture//是否生成.map文件，用于ts debug调试
    },
    "include": [
        "*/**/*.ts"
    ],
    "exclude": [
        //默认排除了node_modules
    ]    
}
```
使用include，exclude代替下面
```
"filesGlob": [
        "*/**/*.ts",
        "!node_modules/**",
        "!typings/**"
    ]
```

> tsd

包管理已弃用，使用typings包管理
> npm install typings -g

> typings init

初始化typings.json文件
typings相关文档[https://github.com/typings/typings](https://github.com/typings/typings)
常用typings命令：
> typings search --name react

根据名称搜索模块

> typings install debug --save

> typings install dt~node --global --save
保存模块，一般第三方模块使用第二条命令

目录结构说明：
./src为typescript源文件目录
./build为编译出来的js文件
运行方法：
运行pm2 start ./build/bin/www.js --watch 即可

或者可以使用VScode更方便的开发，已经配置好编译文件和启动文件，ctrl+shift+b启动编译，并监听文件变化自动编译，F5启动服务

> 由于未找到生成的代码，已忽略断点（是否是源映射问题？）