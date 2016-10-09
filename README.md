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
        "rootDir": "./src",//
        "outDir": "./build",//
        "sourceMap": false//
    },
    "filesGlob": [
        "*/**/*.ts",
        "!node_modules/**",
        "!typings/**"
    ]
}
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