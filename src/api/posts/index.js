const Router = require('koa-router');
const postsCtrl = require('./posts.ctrl');

const posts = new Router();

posts.post('/', postsCtrl.allowedCors, postsCtrl.checkLogin, postsCtrl.write);
posts.get('/', postsCtrl.allowedCors, postsCtrl.list);
posts.get('/search/:keyword', postsCtrl.allowedCors, postsCtrl.list);
posts.get('/:id', postsCtrl.allowedCors, postsCtrl.checkObjectId, postsCtrl.read);
posts.delete('/:id', postsCtrl.allowedCors, postsCtrl.checkLogin,postsCtrl.checkObjectId, postsCtrl.delete);
posts.patch('/:id', postsCtrl.allowedCors, postsCtrl.checkObjectId, postsCtrl.revise);
module.exports = posts;