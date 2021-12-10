require("dotenv").config();
const express = require("express");
const path = require("path");
const bcrypt= require("bcryptjs");
const jwt= require("jsonwebtoken");
const hbs = require("hbs");
const Register = require("./models/registers");
const auth = require("./middleware/auth");
const cookieParser= require("cookie-parser");
require("./db/conn");

const app = express();
const static_path = path.join(__dirname, "../public");
const view_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", view_path);

hbs.registerPartials(partials_path);

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.render("index");
})
app.get("/register", (req, res) => {
    res.render("register");
})
app.post("/register", async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmPassword;

        if (password === cpassword) {
            const registerStudent = new Register({
                userid: req.body.userid,
                email: req.body.email,
                password: password,
                confirmPassword: cpassword
            })
            const token= await registerStudent.generateAuthToken();
            res.cookie("jwt",token,{
                expires: new Date(Date.now()+600000),
                httpOnly:true
            })
            console.log(token);
            const registered = await registerStudent.save();
            res.status(201).render("index");
        } else {
            res.send(`Password are no matching`);
        }
    } catch (err) {
        res.status(400).send(err);
    }
})

app.get("/login", (req, res) => {
    res.render("login");
})
app.post("/login", async(req, res) => {
    try{
        const password = req.body.password;
        const userid = req.body.userid;
        const usersid= await Register.findOne({userid:userid});
        const isMatch= await bcrypt.compare(password,usersid.password);
        const token= await usersid.generateAuthToken();
        res.cookie("jwt",token,{
            expires: new Date(Date.now()+60000),
            httpOnly:true
        })
        console.log(token);
        if(isMatch){
            res.status(201).render("index");
        }else{
            res.send(`information are not matching`);
        }
    }catch(err){
        res.status(400).send(err);
    }
})

app.get("/about", auth, (req, res) => {
    console.log(`The cookie value is ${req.cookies.jwt}`)
    res.render("about");
})

app.get("/logout", auth, async (req, res) => {
    try{
        console.log(req.user);
        req.user.tokens= req.user.tokens.filter((currElement)=>{
            return currElement.token!=req.token;
        })
        // del all tokens from db
        // req.user.tokens=[];
        res.clearCookie("jwt");
        console.log(`logout successfully!`);
        await req.user.save();
        res.render("login");
    }catch(err){
        res.status(500).send(err);
    }
})

app.listen(port, () => {
    console.log(`Connection successful! at port number ${port}`);
})