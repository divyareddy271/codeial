const Post = require("../models/PostSchema");
const User = require("../models/UserSchema");
const fs=require("fs");
const path = require("path");
module.exports.users = function(req,res){
    return res.render("users");
}
module.exports.profile  = async function(req,res){
    //async and await
    try {
        let user = await User.findById(req.params.id);
        let post = await Post.find({user : req.params.id});
        return res.render("profile", {
            title : "Profile",
            profile_user : user,
            posts : post,
        })    
    }catch(err){
        console.log(err);
        return res.redirect("/");
    }
    // User.findById(req.params.id,function(err,user){
    // Post.find({user : req.params.id},function(err,post){
    //     return res.render("profile", {
    //         title : "Profile",
    //         profile_user : user,
    //         posts : post,
    //     })
    // })
    // })  
}
//updtae user  profile and converting to async and await
module.exports.update = async function(req,res){
    if(req.user.id == req.params.id) {
        //find user first 
        let user = await User.findById(req.params.id);
        User.uploadavtar(req,res,function(err){
            if(err){
                console.log("error in uploading file",err);
            }
            user.name = req.body.name;
            user.email = req.body.email;
            console.log(req.file);
            
            if(req.file){
                
                if(req.file.mimetype == ("image/jpeg")){
                   if(user.avtar && fs.existsSync(path.join(__dirname,"..",user.avtar))){
                      fs.unlinkSync(path.join(__dirname,"..",user.avtar));
                    }
                    user.avtar = User.avtar_path+"/"+req.file.filename;
                    req.flash("success","Updated profile pics successfully");
                    user.save();
                    
               }
                 else{
                    console.log("cannot upload image");
                    req.flash("error","Cannot upload the file..plz select only image files");
                 }
                return res.redirect("back");
            }
            
            
            return res.redirect("back");
        })
    }
    // if(req.user.id == req.params.id) {
    //     User.findByIdAndUpdate(req.params.id,{
    //         name : req.body.name,
    //         email : req.body.email,
    //     },function(err,user){
    //         return res.redirect("back");
    //     })
    // }
}
module.exports.signup = function(req,res){
    return res.render("Signup",{title : "Sign-up"});
}
module.exports.signin = function(req,res){
    return res.render("Login",{title : "Sign-in"});
}
module.exports.createUser = async function(req,res){
    if(req.body.password != req.body.confirm_password){
        console.log("password mismatch");
        req.flash("error","Password is not matching");
        return res.redirect("back");
    }
    let user = await User.findOne({email:req.body.email});
        if(user){
            console.log("Cannot create the user");
            req.flash("error","Already user exists");
            return res.redirect("back");
        }
        else if(!user){
            let user_create = User.create(req.body);
            req.flash("success","successfully signed up !!");
            return res.redirect('/users/sign-in');
        } 
}
module.exports.createSession = function(req,res){
    req.flash("success","Logged in successfully");
        return res.redirect("/");
}
module.exports.destroysession = function(req,res){
    req.logout(function(err){
        if(err){
            return;
        }
        req.flash("success","Logged out successfully");
        //as we have defined flash in req need to add it in res (middleware - config)
        return res.redirect('/');
    });
    
}

