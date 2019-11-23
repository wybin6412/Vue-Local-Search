﻿
<img src="https://github.com/anjoy8/Blog.Admin/blob/master/src/assets/logoall.png" width="350"  />

      
      
      
一个基于 Vue.js 的系统项目



## 给个星星! ⭐️
如果你喜欢这个项目或者它帮助你, 请给 Star~（辛苦星咯）

*********************************************************
### 项目下载后，首先安装依赖包
```
npm install
```

### 安装成功后，运行即可
```
npm run serve // 请不要把 再一直用 dev 命令了
```
然后你就可以直接访问 http://localhost:6688


## Tips：



```
如果你想换一个端口，可以直接修改根目录下的 vue.config.js 文件

  devServer: {
    port: 2364, // 当前 admin 项目的端口号
    https: false,

而且也要代理下后端的接口地址，如果你使用 proxy 来实现跨域的话（如果用 CORS 跨域，这里就不用配置了）：

    proxy: {
      // 配置多个代理
      "/api": {
        target: "http://localhost:8081",//这里改成你自己的后端api端口地址，记得每次修改，都需要重新build

```

### 如果要部署，先执行bulid
```
npm run build
```




*****************************************************

******************************

## 安装

安装包依赖
```
npm install
```

## 运行
运行开发环境
```js
npm run serve
```

**本地访问http://localhost:2364**
```
可以在根目录的 vue.config.js 中修改端口：

  "devServer": {
     "host": "127.0.0.1",
     "port": "2364"//端口号
  },
  
  
```


## 编译
build for production and launch server
```js
npm run build
```








