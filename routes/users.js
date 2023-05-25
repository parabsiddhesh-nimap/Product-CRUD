var express = require('express');
var router = express.Router();
const db = require('../models/index');
const {userSingUp, 
    handleUserLogin,
    passwordValidity,
    createUser,
    getUser,
    auth,
    handleUpload,
    unblockUserAcc,
    blockAccount
} = require("../middleware/userMiddleware");
const multer  = require('multer');
//for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        return cb(null,`${Date.now()}-${file.originalname}` )
    }
})
const upload = multer({ storage: storage })

router.post('/signup', userSingUp,passwordValidity,createUser);

router.post('/login', handleUserLogin,blockAccount);

router.get('/user/', auth,getUser); 

router.post('/upload', auth,handleUpload, (req,res) => {
// router.post('/upload', auth,upload.single('avatar'), (req,res) => {
    try{ 
        console.log(req.userData)
        res.status(200).json({success:"Upload successful"})
    }catch(err){
        console.log(err);
        res.status(500).json({ error:err.message });
    }
});

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

router.post('/unblock', unblockUserAcc)


module.exports = router;
