const { ADMIN_PASS : adminPass } = process.env;

exports.login = (ctx) => {
    console.log('LOGIN API');
    const { password } = ctx.request.body;
    if( adminPass === password ){
        ctx.body = {
            success : true
        }
        ctx.session.logged = true;
    }else{
        ctx.body = {
            success : false
        };
        ctx.status = 401; //authorized;
    }
    console.log("LOGIN API : ",new Date(), ctx.session.logged);
}

exports.check = (ctx) => {
    ctx.body = { 
        logged : !!ctx.session.logged
    }
    console.log("LOGIN_CHECK API : ",new Date(), ctx.session.logged);
}

exports.logout = (ctx) => {
    ctx.session = null;
    ctx.status = 204; // No Content;
    console.log('LOGOUT API : ', new Date(), ctx.session);
}