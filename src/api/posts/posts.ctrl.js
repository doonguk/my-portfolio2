const Post = require('models/post');
const { ObjectId } = require('mongoose').Types;
const Joi = require('joi');
exports.allowedCors = (ctx,next) => {
    ctx.set( 'Access-Control-Allow-Origin', '*');
    ctx.set( 'Access-Control-Allow-Methods','POST, PUT, GET, OPTIONS');
    ctx.set( 'Access-Control-Allow-Headers', '*');
    ctx.set( 'Access-Control-Mas-Age', '1728000');
    return next();
}

exports.checkLogin = (ctx, next) => {
    if(!ctx.session.logged){
        ctx.status = 401; //unAuthorized;
        return null;
    }
    else{
        return next();
    }
}

exports.checkObjectId = (ctx,next) => {
    const { id } = ctx.params;

    if(!ObjectId.isValid(id)){
        ctx.status = 400;
        return null;
    }
    return next();
}
exports.write = async(ctx) => {
    const schema = Joi.object().keys({
        title : Joi.string().required(),
        body : Joi.string().required(),
        tags : Joi.array().items(Joi.string()).required(),
        category : Joi.string().required()
    });

    const result = Joi.validate(ctx.request.body, schema);
    
    if(result.error){
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const { title, body, tags, category } = ctx.request.body;
    console.log('API POST', category);
    const post = new Post({
        title,body,tags,category
    });

    try{
        await post.save();
        ctx.body = post;
    }catch(e){
        ctx.throw(e,500);
    }
}

exports.list = async(ctx) => {
    const { keyword } = ctx.params;
    const { tag } = ctx.query;
    const query = tag ? {tags : tag } : {};
    const page = parseInt(ctx.query.page || 1,10);
    console.log('API GET');

    if(ctx.request.header.referer === 'http://localhost:3000/blog/category'){
        try{
            const post = await Post.find(query).sort({_id : -1}).exec();
            ctx.body = post;
            return;
        }catch(e){
            ctx.throw(e, 500);
        }
    }
    if(ctx.request.header.referer === 'http://localhost:3000/'){
        try{
            const post = await Post.find(query).sort({_id : -1}).limit(1).lean().exec();
            const limitBodyLenth = (post) => ({
                ...post,
                body : post.body.length < 200 ? post.body : `${post.body.slice(0,200)}...`
            })
            ctx.body = post.map(limitBodyLenth);
            return;
        }catch(e){
            ctx.throw(e, 500);
        }
    }
    if(ctx.request.header.referer === 'http://localhost:3000/search'){
        try{
            console.log('request from Search');
            const post = await Post.find(query).sort({_id : -1}).exec();
            const limitBodyLenth = (post) => ({
                ...post.toJSON(),
                body : post.body.length < 150 ? post.body : `${post.body.slice(0,150)}...`  
            })
            ctx.body = post.map(limitBodyLenth);
            return;
        }catch(e){
            ctx.throw(e,500);
        }
    }
    if(keyword){ //search 한 경우
        const query = {$or :[{title : {$regex : keyword, $options : 'i'}},{body : {$regex : keyword ,$options : 'i'}}] }
        try{
            const post = await Post.find(query)
                                   .sort({_id:-1})
                                   .lean()
                                   .exec();             
            ctx.body = post;
            return;
        }catch(e){
            ctx.throw(e,500);
        }
    }
    try{
        const post = await Post.find(query)
                               .skip((page-1)*2)
                               .sort({_id:-1})
                               .limit(2)
                               .exec();
        const total = await Post.collection.countDocuments(query);
        if(total%2 == 0){ ctx.set('lastPage', total/2 ); }
        else{ ctx.set('lastPage', Math.floor(total/2)+1); }
        //Math.floor : 소수점 이하 버림, Math.ceil : 소수점 이하 올림, Math.round : 소수점이하 반올림
        ctx.body = post;
    }catch(e){
        ctx.throw(e,500);
    }
}


exports.read = async(ctx) => {
    const { id }= ctx.params;
    try{
        console.log('READ API');
        const post = await Post.findOne({_id:id}).exec();
        ctx.body = post;
    }catch(e){
        ctx.throw(e, 500);
    }
}
exports.delete = async(ctx) => {
    const { id } = ctx.params;
    try{
        console.log('API DELETE, ID is ', id);
        await Post.findOneAndDelete({_id : id}).exec();
        ctx.status = 204;
    }catch(e){
        ctx.throw(e,500);
    }
}

exports.revise = async(ctx) => {
    const { id } = ctx.params;
    try{
        const post = await Post.findOneAndUpdate({_id : id}, ctx.request.body ,{ new : true}).exec();
        if(!post){
            ctx.status = 404;
            return;
        }
        ctx.body = post;
    }catch(e){
        ctx.throw(e, 500);
    }
}