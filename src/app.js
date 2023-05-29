const express=require("express");
const session=require("express-session");
const {exec}=require("child_process");
const ejs=require("ejs");
const fs=require("fs");
const flash=require("connect-flash");
const bcrypt=require("bcrypt");
const path=require("path");
const { error } = require("console");
const { report } = require("process");
const app=express();

require("./db/connect");
const Reguser=require("./model/myschema");
const static_path=path.join(__dirname,"../public");
const template_path=path.join(__dirname,"../templates/views");
app.use(express.static(static_path));

app.use(express.json());
// app.use(methover('__method'))
app.use(express.urlencoded({extended:true}));
app.set("view engine",'ejs');
app.set("views",template_path); 
app.use(session({
    secret:'mysecret',
    resave:false,
    saveUninitialized:false
}))
app.use(flash());

app.get('/',(req,res)=>{
    if (req.session.username) {
        res.render("scanner")
        //res.send(`Logged in as ${req.session.username}`);
    } else {
         res.render("home")  
        //res.send(`Logged in as ${req.session.username}`);
    }
})

app.get('/signup',(req,res)=>{
    res.render("signup",{info:req.flash('info')});
})

app.get('/signin',(req,res)=>{
    res.render("signin",{info:req.flash('info')});
})

app.get('/scanner',(req,res)=>{
    res.render("404");
})


app.post('/signup',async(req,res)=>{
   try {
    const email=req.body.email;
    const password=req.body.password;
    const cpassword=req.body.confirmpassword;
    
    const useremail= await Reguser.findOne({email:email});

        if(useremail){
            //res.status(404).send("this user already exists");
            //console.log("this user already exists please sign in");
            req.flash('info','*You already have an account');
            //res.render("signin")
            res.redirect("signup");
            return;
        }

        if(password===cpassword){
            
            const saltrounds=10;
            const plainpass=password;
            const plaincpass=cpassword;

            bcrypt.hash(plainpass,saltrounds,async(err,hash)=>{
                if (err) {
                    console.log(err);
                   
                } else {
                    bcrypt.hash(plaincpass,saltrounds,async(err,hashc)=>{
                        if (err) {
                            console.log(err);
                        } else {
                            const regemp=new Reguser({
                                email:email,
                                password:hash,
                                confirmpassword:hashc
                            })
                
                            const saved=await regemp.save()
                            .then((result)=>{
                                //console.log("saved");
                            })
                            .catch((error)=>{
                
                            })
                
                            res.status(200).redirect("signin");
                        }
                    })
                }
            })


         
            
        }
        else{
            //res.status(404).send("password is not matching")
            req.flash('info','*passwords are not matching')
            res.redirect("signup");
        }
   } catch (error) {
    
   }
})


app.post("/signin",async(req,res)=>{
    const email=req.body.email;
    const password=req.body.password;
    const useremail=await Reguser.findOne({email:email});
    if (useremail) {
        // if (useremail.password===password) {
        //     const username=useremail;
        //     req.session.username=username;
            
        //     res.status(200).render("scanner");
        // } else {
        //     // res.status(404).redirect("signin");
        //     // console.log("Invalid login credentials");
        //     req.flash('info','*Invalid login credentials');
        //     res.redirect("signin");
        // }

        const retpass=useremail.password;
        bcrypt.compare(password,retpass,function(err,result){
            if (err) {
                console.log(err);
            } else if(result===true) {
                const username=useremail;
                req.session.username=username;
                res.status(200).render("scanner");
            } else{
                req.flash('info','*Invalid login credentials');
                res.redirect("signin");
                return;
            }
        })

    } else {
        // console.log("This user doesnot exists");
        // res.status(404).redirect("signin");
        req.flash('info','*This user doesnot exists');
        res.redirect("signin");
        return;
    }
})

app.get('/scan',(req,res)=>{
    const {stype}=req.query;
    //console.log(stype);
    const {target}=req.query;
    const mport=req.query;
    
    //console.log(target);
    exec(`nmap ${stype} ${mport} ${target}`,(error,stdout,stderr)=>{
        if(error){
            console.error(`Error: ${error.message}`);
            res.status(404).send("an error occured,sorry");
            return;
        }
        //console.log(stdout);
        const report=`<pre>${stdout}</pre>`;
        //console.log(report);
        ///const filepath='./views/report.ejs';
        //console.log(filepath);
        //module.exports=report;
        res.send(`<div style="padding-left:3cm">
                    <h1 style="color:#0050da; font-size:2cm">The scan report :-</h1>
                    <h1 style="color:red">${report}</h1><br><br>
                    <form action="/scanner" method="get">
                        <button type="submit">go back</button> 
                    </form>
                </div>`);
        // fs.readFileSync(filepath,'utf-8',(err,data)=>{ 
        //     if(err){
        //         console.log("error in reading");
        //         return;
        //     }else{
             
        //         console.log("data");
        //     }
        //     const mdata=report;
        //     fs.writeFile(filepath,mdata,'utf-8',(err)=>{
        //         if(err){
        //             console.log("error in writing");
        //             return;
        //         }else{
        //             res.render("report");
        //         }
        //     })
        // })
      
    })
})

app.get('/logout',(req,res)=>{
    req.session.destroy();
    //console.log(req.session.username);
    res.redirect("/")
    
})



app.listen(3000,()=>{
    console.log(`server running at http://localhost:3000/`);
})