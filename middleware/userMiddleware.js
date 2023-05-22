const db = require('../models/index');
const {setUser} = require('../service/auth');
const jwt = require("jsonwebtoken");


//Middleware
const authenticateUser = async (req,res,next) => {
    try{

        const token = req.headers;
        console.log("_________",token);
        const { email, password } = req.body;
        let id = req.params.id;
        let user =  await db.user.findOne({ where: { email: email } });
        //getUser()
        if(!user) return res.status(404).json({error: 'User not found'}); 
        req.user = user;
        next();   
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
}

const auth=async (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1]
    const decodedData=jwt.decode(token)
    req.userData=decodedData
    next();
    }


const getUser = async (req,res) => {
    console.log(req.userData)
    const email = req.userData.email
    let user =  await db.user.findOne({ where: { email } });
    if(!user) return res.status(404).json({error: 'User not found'});
    res.send(user) 
    
}

const userSingUp = async(req,res,next) => {
    try{
        const { name, email, password, phone } = req.body;
        let phoneLength = String(phone).length;
        const user = await db.user.findOne({ where: { email: email } });
        const checkPhoneno = await db.user.findOne({ where: { phone: phone } });
        if(user) return res.status(400).json({error: 'User already exists'});
        if(checkPhoneno) return res.status(400).json({error: 'Phone Number Already registered'});
        if(phoneLength !== 10) res.status(400).json({error: `Phone Number 10 characters. You Entered ${phoneLength}`});
        else next();
    }catch(e){
        console.log(e);
        res.status(500).json({error: 'Internal server error'});
    }
};

const handleUserLogin = async(req,res,next) => {
    const { email, password } = req.body;
    console.log(email,password);
    const user = await db.user.findOne({ where: { email: email } });
    if(!user) return res.status(404).json({error: 'User not found'});
    if(user.password!== password) return res.status(400).json({error: 'Invalid password'});
    const token = setUser(email);

    res.status(200).json(token);
    next();
};

const passwordValidity = async (req,res,next) => {
    try{
        const { password } = req.body;
        let errors = [];
        // var passw =  /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        if (password.length < 8) {
            errors.push("Your password must be at least 8 characters"); 
        }
        if (password.search(/^(?=.*[A-Z]).*$/) < 0) {
            errors.push("Your password must contain at least one capital letter.");
        }
        if (password.search(/[0-9]/) < 0) {
            errors.push("Your password must contain at least one digit."); 
        }
        if (password.search( /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).*$/) < 0) {
            errors.push("Your password must contain at least one special character."); 
        }
        if (errors.length > 0) {
            res.status(400).json({errors});
        }
        else next();
    }catch(e){
        console.log(e);
        res.status(500).json({error: 'Internal server error'});
    }
};

const createUser = async (req, res) => {
        const { name, email, password, phone } = req.body;
        const newUser = await db.user.create({ name, email, password, phone });
        // req.body.data = newUser;
        res.status(201).json(newUser);
};

module.exports = 
{
    authenticateUser,   
    userSingUp, 
    passwordValidity,
    createUser,
    handleUserLogin,
    getUser,
    auth
};