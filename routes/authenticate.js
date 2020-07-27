'use strict';
function ensure(req,res,next){
   if(req.isAuthenticated()){
     return next();
   } else {
     res.redirect('/auth/github')
   }
};

module.exports = ensure;