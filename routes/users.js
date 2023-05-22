var express = require('express');
var router = express.Router();
const db = require('../models/index');
const {authenticateUser,userSingUp, handleUserLogin,passwordValidity,createUser,getUser,auth} = require("../middleware/userMiddleware");


router.get('/user/:userId',auth,getUser)
router.post('/signup', userSingUp,passwordValidity,createUser);

router.get('/login', handleUserLogin);

router.get('/user/', authenticateUser, (req,res) => {
    console.log(req.user)
    res.status(200).json(req.user);
});


router.get('/userAll', async(req,res) => {
    const user = await db.user.findAll();
    if(!user.length) return res.status(404).json({error: 'No Users'});
    // if(user.password!== password) return res.status(400).json({error: 'Invalid password'});
    res.status(200).json(user)
});


module.exports = router;
