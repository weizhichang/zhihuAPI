const jwt = require('jsonwebtoken');
const UsersModel = require('../models/users');
const {secret} = require('../config');
class UsersCtl{
    //用户列表查询
    async find(ctx){
        ctx.body = await UsersModel.find();
        console.log('查询用户列表'+new Date());
    };
    async findById(ctx){
       const user = await UsersModel.findById(ctx.params.id);
       if(!user){ctx.throw(404,'用户不存在');}
       ctx.body = user;
     };
     //新建用户
     async create(ctx){
        ctx.verifyParams({
            name:{type:'string',required:true},
            password:{type:'string',required:true},
        });
        //校验用户名唯一性
        const {name} = ctx.request.body;
        const repeatedUser = await UsersModel.findOne({name});
        if(repeatedUser){ctx.throw(409,'用户已经存在！')}
        const user = await new UsersModel(ctx.request.body).save();
        ctx.body =user;
         };
     //用户更新
     async update(ctx,next){
        ctx.verifyParams({
            name:{type:'string',required:false},
            password:{type:'string',required:false},
        });
        try{
            const user = await UsersModel.findByIdAndUpdate(ctx.params.id,ctx.request.body);
            ctx.body = ctx.params; 
        }catch(err){
        ctx.throw(404,err.message,console.log('更新用户失败'));
        }
    await next();
    };
    //删除用户
    async del(ctx,next){
        try{
            const user = await UsersModel.findByIdAndDelete(ctx.params.id,ctx.request.body);
            if(!user){ctx.throw(404,"删除用户失败！")};
            ctx.status = 204;
        }catch(err){
        ctx.throw(404,err.message,"删除用户失败！");
        }
    await next();
     };
     //用户登录
     async login(ctx,next){
        ctx.verifyParams({
            name:{type:'string',required:true},
            password:{type:'string',required:true},
        });
        console.log('用户:"'+ctx.request.body.name+'"登录'+new Date());
        try{
            const user = await  UsersModel.findOne(ctx.request.body);
            const {_id,name} = user;
            const token = jwt.sign({_id,name},secret,{expiresIn:'1d'});
            ctx.body = {token};
        }catch(err){
            ctx.throw(404,err.message,'用户不存在或密码不正确')
        }
        await next(); 
     };
    //验证token
    async auth(ctx,next){
     const{authorization = ''} = ctx.request.header;
     const token = authorization.replace('Bearer ','');
     console.log('token:'+token) ;
       try{
         const user = jwt.verify(token,secret);
         console.log(user);
         ctx.state.user = user;
        }catch(err){
         ctx.throw(401,err.message,console.log('token校验不通过'));
      }
     await next();
    };
}

module.exports = new UsersCtl();