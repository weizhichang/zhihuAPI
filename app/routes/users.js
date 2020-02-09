const jwt = require('jsonwebtoken');
const Router = require('koa-router');
const router = new Router({prefix:'/users'});
const {find,findById,create,update,del,login,auth} = require('../controllers/users')
const {secret} = require('../config');


//获取用户列表
router.get('/',find);
 //新增用户
 router.post('/',create);
 //params路由参数.查询某个用户
 router.get('/:id',findById);
 //更新用户
 router.post('/update/:id',auth,update);
 //删除用户
 router.delete('/:id',auth,del);
 //用户登录
 router.post('/login',login);
module.exports = router;