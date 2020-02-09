const Koa = require('koa');
const bodyparser = require('koa-bodyparser');
const parameter = require('koa-parameter');
const error = require('koa-json-error');
const mongoose = require('mongoose');
const app = new Koa();
const routing = require('./routes');
const {connectionStr} = require('./config');
const cors = require('koa-cors');

mongoose.set('useFindAndModify', false);
//连接数据库
mongoose.connect(connectionStr,{ useUnifiedTopology: true, useNewUrlParser: true  } ,()=>console.log('MongoDB连接成功了'));
mongoose.connection.on('error',console.error);

//中间件
// app.use(async (ctx,next)=>{
//    if(ctx.url === '/'){
//       ctx.body = '这是主页';
//    }else if (ctx.url === '/users'){
//      if(ctx.method === 'GET'){
//       ctx.body = '这是用户列表页';
//      }else if(ctx.method === 'POST'){
//       ctx.body = '创建用户';
//      }else{
//         ctx.status = 405;
//      }
//    }else if(ctx.url.match(/\/users\/\w+/)){
//      const userId = ctx.url.match(/\/users\/(\w+)/)[1];
//      ctx.body = `这是用户 ${userId}`;
//    }
//    else{
//       ctx.status = 404;
//    }
//    console.log('访问成功！');
// });

// 跨域设置
// app.use(async (ctx, next)=> {
//     ctx.set('Access-Control-Allow-Origin', '*');
//     ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
//     ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE,PATCH,OPTIONS');
//     if (ctx.method == 'OPTIONS') {
//       ctx.body = 200; 
//     } else {
//       await next();
//     }
//   });
app.use(cors({
    // maxAge:5,//指定本地预检请求的有效期，单位为秒。
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE','PATCH', 'OPTIONS'], //设置所允许的HTTP请求方法
}));

app.use(async (ctx,next)=>{
    try{
     await next();
    }catch(err){
     ctx.status = err.status ||err.statusCode || 500;
     ctx.body = {
         message:err.message,
     }
    }
});
app.use(error({
    postFormat:(e,{stack,...rest})=>process.env.NODE_ENV ==='production'?rest:{stack,...rest}
}));
app.use(bodyparser());
app.use(parameter(app));
routing(app);
app.listen(3000,()=>{console.log('程序启动了，端口：3000')});