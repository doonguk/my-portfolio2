const Router = require('koa-router');
const authCtrl = require('./authCtrl');
const postCtrl = require('api/posts/posts.ctrl');
const auth = new Router();

auth.post('/login', postCtrl.allowedCors, authCtrl.login);
auth.get('/check', postCtrl.allowedCors, authCtrl.check);
auth.post('/logout', postCtrl.allowedCors, authCtrl.logout);

module.exports = auth;