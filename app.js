const express = require('express');
const bodyParse = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session');
const bodyParser = require('body-parser');
const { Cookie } = require('express-session');
 
var User=require("./Model/User")
var app = express();
app.set('port',3232);

// app.use(bodyParser.urlencoded({
//     extended:true
// }))

app.use(express.urlencoded({
    extended:true
}))

app.use(cookieParser())
app.use(session({
    key: "user_id",
    secret: "RandomSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie:{
        expires:600000
    }
}))

var sessionChecker=(req,res,next)=>{
    if(req.session.user && req.cookies.user_id){
        res.redirect("/dashboard")
    }else{
        next()
    }
}

//------------------------------------------------------------routes
//------------------------------------------------------------login
app.get('/',sessionChecker,(req,res)=>{
    res.redirect("/login")
})
app.route("/login")
.get(sessionChecker,(req,res)=>{
    res.sendFile(__dirname+"/public/login.html")
})
.post((req,res)=>{
    var username=req.body.username,
    password=req.body.password

    try{
        var user=User.findOne({username:username}).exec();
        if(!user){
            res.redirect("/login")
        }
        user.comparePassword(password,(error,match)=>{
            if(!match){
                res.redirect("/login")
            }
        })
        req.session.use=user;
        res.redirect("/dashboard")
    }catch(error){
        console.log(error)
    }
})


 

//------------------------------------------------------------sigup
app.route("/signup")
.get(sessionChecker,(req,res)=>{
    res.sendFile(__dirname+"/public/signup.html")
})
.post((req,res)=>{
    var user=new User({
        username:req.body.username,
        email:req.body.email,
        password:req.body.password
    })
    user.save((err,doc)=>{
        if(err){
            res.redirect("/signup")
        }else{
            req.session.user=doc
            res.redirect("/dashboard")
        }
    })
})
//-----------------------------------------------------------dashboard
app.get("/dashboard",(req,res)=>{
    if(req.session.user && req.cookies.user_id){
        res.sendFile(__dirname+"/public/dashboard.html")
    }
    else{
        res.redirect("/login")
    }
})

app.get("/logout",(req,res)=>{
    if(req.session.user && req.cookies.user_id){
        res.clearCookie("user_id")
        res.redirect("/")
    }else{
        res.redirect("/login")
    }
})

app.use(function(req,res,next){
    res.status(404).send("Sorry can't found the resources")
})


app.route("/dashboard")
.get(sessionChecker,(req,res)=>{
    res.sendFile(__dirname+"/dashboard.html")
})




app.listen(app.get('port'),()=>
    console.log(`Application running on port no: ${app.get('port')}`)
)   