const express=require('express');
const app=express();
const port=8000;
const mongoose=require('mongoose');
const User=require("./models/user.js");
const passport=require('passport');
const Localstrategy=require('passport-local');
const session=require('express-session');
const flash=require('connect-flash');

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static("public"));
app.set("view engine","ejs");

const sessioncode={
      secret:"mysecretsession",
      resave:false,
      saveuninitialiized:true,
};

mongoose.connect('mongodb://127.0.0.1:27017/test')
  .then((res) => console.log('Connected!')
);
app.use(session(sessioncode));
 app.use(flash());
app.use((req,res,next)=>{
   res.locals.success=req.flash("success");
   res.locals.signuperr=req.flash("signuperr");
   res.locals.notfound=req.flash("notfound");
   res.locals.err=req.flash("err");
   next();
});


 app.use(passport.initialize());
 app.use(passport.session());
 
 passport.use(new Localstrategy(User.authenticate()));
 passport.serializeUser(User.serializeUser());
 passport.deserializeUser(User.deserializeUser());

 app.get("/login",(req,res)=>{
    res.render("login.ejs");
 });
 
 app.post("/login",
 passport.authenticate('local',{failureRedirect:"/login",failureFlash:true,})
 ,(req,res)=>{
   try{
      res.send("This is your page!");
   }
   catch(err){
      req.flash("notfound",err.message);
   }
   
 })

 app.get("/signup",(req,res)=>{
    res.render("sign.ejs");
 });
 app.post("/signup",async(req,res)=>{
   try{
      let {email,username,password}=req.body;
      const newuser=new User(
         {
         email:email,
         username:username,
         });
       const newdata=await User.register(newuser,password);
       req.flash("success","Successfully rgister!");
       console.log(newdata);
       res.redirect("/signup");
   }
   catch(err){
     req.flash("signuperr",err.message);
     res.redirect("/signup");
   }
   

 })

 // store fake data in database
//  app.get("/demo",async(req,res)=>{
//    const fakeUser=new User({
//     email:"fake@gmail.com",
//     username:"@fake14" 
//    });
//   const newUser=await User.register(fakeUser,"fake1425");
//   console.log(newUser);
//   res.send("woriking");
//  });

app.listen(port,()=>{
    console.log(`Listening the port${port}`);
})