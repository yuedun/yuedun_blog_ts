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
        "rootDir": "./",//
        "outDir": "./dist",//
        "sourceMap": false//
    }
}
```