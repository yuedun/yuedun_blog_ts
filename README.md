# yuedun_ts
使用typescript开发博客，开发环境配置和调试。
## 第一步：基础框架搭建

基础框架使用express4，安装express-generator
> npm install -g express-generator

>  express --view=ejs tsp

利用express生成器快速生成一个express项目结构
```
├─bin
├─public
│  ├─images
│  ├─javascripts
│  └─stylesheets
├─routes
└─views
```

生成的代码是js格式的，为了使用typescript开发，可以将`app.js`和`bin\，routes\，`目录下的js文件改为`.ts`格式，直接修改后的代码也不会有什么问题，因为typescript是javascript
的超集，可以兼容js代码。

## 第二步：配置typescript环境

> tsc --init

在根目录生成默认的tsconfig.json文件，可以根据自身需要进行配置，以下是经过配置的文件
tsconfig.json配置说明：
```javascript
{
    "compilerOptions": {
        "module": "commonjs",//模块化规范
        "target": "es5",//生成js版本
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
配置完tsconfig.json后需要安装Definitely（ts定义文件），以下两种tsd和typings都已成历史，目前可以直接使用npm安装，可以直接跳到第三步。

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

## 第三步：安装Definitely定义文件

> npm install @types/node --save-dev

和普通的npm包区别就是加了`@types/`,在npmjs.com也可以加上@types/搜索相关定义文件。
在命令行中切换到项目根目录下就可以执行`tsc`命令。
第一次执行可能不太顺利，会报一些错误，一般会是类型错误，可以先简单的声明为any类型，这只是用来应急处理的，如果熟悉typescript就设置为对应的类型，这才是使用typescript的正确姿势。一切就绪的话会在`build`目录下生成对应的目录的js文件。如果没有对tsconfig.json进行自定义配置的话会在ts文件同目录下生成js文件。

在命令行执行`tsc`命令并没有加参数，却依然按照`tsconfig.json`配置来执行，说明编译器会从当前目录开始去查找tsconfig.json文件，逐级向上搜索父目录。

# mongoose promise化
由于程序的多次迭代更新，当中使用了原生回调，`async.js`库，`bluebird`库，最终使用`async await`，`async await`的使用还是离不开promise，所以需要结合使用。
首先需要将mongoose查询promise化，其实mongoose本身带有promise库，所以既可以使用回调的方式也可以使用promise的方式。但是最新版本建议使用第三方promise库，否则会在控制台打印出警告信息：
> Mongoose: mpromise (mongoose's default promise library) is deprecated, plug in your own promise library instead: http://mongoosejs.com/docs/promises.html

本程序使用typescript开发，所以主要说明如何在typescript中将mongoose promise化，（原生nodejs方法参考[mongoose promise](http://mongoosejs.com/docs/promises.html)）。


~~使用bluebird的promise方法：在路径`node_modules/@types`下新建`promise-blubird.d.ts`的文件，~~
```
import * as Bluebird from 'bluebird';

declare module 'mongoose' {
  type Promise<T> = Bluebird<T>;
}
```
~~在`@types/mongoose/index.d.ts`中加入`/// <reference types="promise-blubird" />`~~
```
/// <reference types="mongodb" />
/// <reference types="node" />
/// <reference types="promise-blubird" />
```

在连接数据库的配置中将mongoose的`Promise`替换为bluebird
```
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
(<any>mongoose).Promise = Promise;//使用bluebird代替mongoose自身的promise
import * as settings from '../settings';
var mongodbConfig = settings.mongodb;

var host = mongodbConfig.host,
    port = mongodbConfig.port,
    username = mongodbConfig.uid,
    password = mongodbConfig.pwd,
    dbName = mongodbConfig.db,
    url = "mongodb://" + username + ":" + password + "@" + host + ":" + port + "/" + dbName;

```
这样就可以直接使用then形式的写法了。
```JavaScript
Category.findOne({ cateName: req.body.category })
    .then(category => {
        //....
    })
```

# 一个命令行窗口实现同时编译ts和重启node服务
利用`npm scripts`来实现：
```
"scripts": {
    "tsc": "tsc -w",
    "serve": "cd ./build & nodemon ./bin/www.js",
    "start": "parallelshell \"npm run tsc\" \"npm run serve\""
  }
```
前提条件是同时安装了`typescript`，`nodemon`，`parallelshell`，其中`concurrently`也可以实现和`parallelshell`一样的功能。
开启一个shell窗口，执行命令`npm start`即可.

# debug模块的使用方法
```
var debug =require("debug")("yuedun:www");
```
参数是什么(模块名)就会输出哪个模块的内容，如果Debug('http')就会输出http模块中的debug输出。设置DEBUG=*会输出所有模块的内容，所以最好加一个前缀来输出指定部分内容，比如自定义模块就传参`yuedun:www`冒号后面为文件名就会输出该文件下的debug

# 自动添加createdAt和updatedAt字段
```javascript
import {Document, model, Model, Schema} from 'mongoose';

export var TestSchema: Schema = new Schema({
    title: String,
}, {timestamps: true});

export interface ITest extends Document {
    title: string;
    createdAt: Date;
    updatedAt: Date
}
var TestModel: Model<ITest> = model<ITest>('Test', TestSchema);

export default TestModel;
```
设置`{timestamps: true}`即可