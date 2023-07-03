const db = require('../models/index');
const { setUser, getUsertoken,secretKey } = require('../service/auth');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const multer  = require('multer');
const nodemailer = require("nodemailer");
const moment = require('moment');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        let fileName = JSON.stringify(req.userData.name).split('"')[1];
        return cb(null,`${fileName}-${Date.now()}-${file.originalname}` )
    }
})
const upload = multer({ storage: storage })


//Middleware
// const authenticateUser = async (req, res, next) => {
//     try {
//         const token = req.headers;
//         console.log("_________", token);
//         const { email, password } = req.body;
//         let id = req.params.id;
//         let user = await db.user.findOne({ where: { email: email } });
//         //getUser()
//         if (!user) return res.status(404).json({ error: 'User not found' });
//         req.user = user;
//         next();
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// }

const auth = async (req, res, next) => {
    try {
        let authHeader = req.headers.authorization;
        const token = authHeader && req.headers.authorization.split(' ')[1];
        if (!token) return res.status(400).json({ error: 'Token Expired' });
        const decodedData = getUsertoken(token);
        req.userData = decodedData
        next();
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
}


const getUser = async (req, res) => {
    console.log(req.userData)
    const email = req.userData.email
    let user = await db.user.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.send(user)

} 

const userSingUp = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;
        let phoneLength = String(phone).length;
        const user = await db.user.findOne({ where: { email: email } });
        const checkPhoneno = await db.user.findOne({ where: { phone: phone } });
        if (user) return res.status(400).json({ error: 'User already exists' });
        if (checkPhoneno) return res.status(400).json({ error: 'Phone Number Already registered' });
        if (phoneLength !== 10) res.status(400).json({ error: `Phone Number 10 characters. You Entered ${phoneLength}` });
        else next();
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const handleUserLogin = async (req, res,next) => {
    try {
        const { email, password } = req.body;
        let newToken = req.headers.authorization;
        const user = await db.user.findOne({ where: { email: email } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        let wrongpasswordcnt = user.dataValues.wrongpasswordcnt;
        let user_id=user.dataValues.id;
        const chkPassword = await bcrypt.compare(password, user.password);
        if (!chkPassword && user) {
            // return res.status(400).json({ error: 'Invalid Password' });
            req.data = user.dataValues;
            next();
        }
        else if (!newToken && chkPassword && wrongpasswordcnt<5) {
            let name = user.dataValues.name;
            token = setUser(user_id,name, email,'2 days');
            let refreshToken = jwt.sign({user_id,name,email},secretKey);
            let addedDate = moment().add(2, 'days').format();  //expiry set to 2 days from login date

            console.log('user.user_id',user_id)

            let chkFortoken = await db.user_token.findOne({ where : {user_id}});
            console.log('chkFortoken',chkFortoken);
            if(chkFortoken){
                db.user_token.update({token,expiry_time : addedDate,is_valid : true},{
                    where : {user_id}
                })
            }else{
                db.user_token.create({user_id:user_id,token,expiry_time : addedDate,is_valid : true})
            }

            resetpassCnt(email)
            res.status(200).json({token,refreshToken});
        } else {
            req.data = user.dataValues;
            next();
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const passwordValidity = async (req, res, next) => {
    try {
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
        if (password.search(/^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).*$/) < 0) {
            errors.push("Your password must contain at least one special character.");
        }
        if (errors.length > 0) {
            res.status(400).json({ errors });
        }
        else next();
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createUser = async (req, res) => {
    let { name, email, password, phone } = req.body;
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    const newUser = await db.user.create({ name, email, password, phone });
    // req.body.data = newUser;
    res.status(201).json(newUser);
};

const blockAccount = async (req, res) => {
    const user = req.data;
    console.log('user !!!',user);
    let count = user.wrongpasswordcnt;
    if (count < 5) {
        count += 1
        console.log('Inside count function ----',count)
        await db.user.update(
            { wrongpasswordcnt :  count},
            { where: { email: user.email } }
          )
        return res.status(400).json({ error: `Invalid password.${ (count > 2) ? `You have ${6-count} attempts left` : `` }` });
    }
    else return res.status(400).json({ error: 'Your Account is Blocked. Reach to Administrator' });
}

const unblockUserAcc = async (req,res) => {
    const { email } = req.body;
    const user = await db.user.findOne({ where: { email: email } });
    if(user){
        await db.user.update(
            { wrongpasswordcnt :  0},
            { where: { email: user.email } }
        )
        res.status(200).json({ message: `Account Unblocked of user ${email}` });
    }
}

const resetpassCnt = async (email) => {
    const user = await db.user.findOne({ where: { email: email } });
    if(user){
        user.dataValues.wrongpasswordcnt = 0;
        await db.user.update(
            { wrongpasswordcnt : 0},
            { where: { email: user.email } }
        )
    }
}
const handleUpload = upload.single('avatar')

const sendEmail = async (req,res) => { 
    let testAccount = await nodemailer.createTestAccount();
    receiverData = req.userData;
    const puncInpunchOut = 'Punch IN';
    console.log(receiverData);

    var transporter = nodemailer.createTransport(({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
            user: 'zoie.dare@ethereal.email', //demo account
            pass: 'wMttaZy7HcD2uB1kdZ'        //demo password
            }
    }));

      var mailOptions = {
        from: 'zoie.dare@ethereal.email',
        to: receiverData.email,
        subject: `${puncInpunchOut} : ${receiverData.name} : ${moment().format('LLLL')}`,
        text: `Login successfull at ${moment().format('LTS')}`,
      }
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
            res.json({info})
          console.log('Email sent: ' + info.response);
        }
      }); 
    
}

module.exports =
{
    userSingUp,
    passwordValidity,
    createUser,
    handleUserLogin,
    getUser,
    auth,
    handleUpload,
    unblockUserAcc,
    blockAccount,
    sendEmail
};

        // //upload photo
        // const storage = multer.diskStorage({
        //     destination: function (req, file, cb) {
        //       cb(null, './uploads')
        //     },
        //     filename: function (req, file, cb) {
        //       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        //       cb(null, file.fieldname + '-' + uniqueSuffix)
        //     }
        //   })
          
        //   const upload = multer({ storage: storage }) console.log hiii my name is siddhesh 