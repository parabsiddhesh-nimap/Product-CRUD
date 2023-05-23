var express = require('express');
var router = express.Router();
const db = require('../models/index');
const {userSingUp, handleUserLogin,passwordValidity,createUser,getUser,auth} = require("../middleware/userMiddleware");


router.post('/signup', userSingUp,passwordValidity,createUser);

router.post('/login', handleUserLogin);

router.get('/user/', auth,getUser); 

router.delete('/user/:id', auth, (req,res) => {
    try{
        db.user.destroy({where: { id: req.params.id }});
        res.status(200).json({message: 'User Deleted'});
    }catch(err){
        res.status(500).json({error: err.message});
    }
})


router.get('/userAll', async(req,res) => {
    const user = await db.user.findAll();
    if(!user.length) return res.status(404).json({error: 'No Users'});
    // if(user.password!== password) return res.status(400).json({error: 'Invalid password'});
    res.status(200).json(user)
});


module.exports = router;
