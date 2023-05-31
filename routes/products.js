var express = require('express');
var router = express.Router();
const db = require('../models/index')
const {auth} = require("../middleware/userMiddleware");

//Middleware
const checkWhetherProductExists = async (req,res,next) => {
    let id = req.params.id;
    let product =  await db.product.findOne({ where: { id: id } });
    if(!product) return res.status(404).json({error: 'Product not found'}); 
    next();   
}

// get all products by user
router.get('/product', auth,async (req, res) => {
    try{
        const {user_id} = req.userData;
        let allProduct =  await db.product.findAll({ where: { user_id: user_id } });
        if(!allProduct.length) return res.status(404).json({error: 'No Products'});
        res.status(200).send(allProduct);
    }catch(err){
        res.status(500).send(err.message);
    }
});

// get specific product for that user
router.get('/product/:id', auth, async (req,res)=>{
    try{
        const {user_id} = req.userData;
        let id = req.params.id;
        let product =  await db.product.findOne({ where: { id , user_id} });
        if(!product) return res.status(404).json({error: 'Product not found'}); 
        res.status(200).send(product);
    }catch(err){
        res.status(500).json({error : err.message});
    }
})

// add new product
router.post('/product', auth,async (req, res) => {
    try{
        let {productname} = req.body;
        const {user_id} = req.userData;
        if (!productname || !user_id) return res.status(500).json({error : "Empty Body"})
        const product =  await db.product.create({productname,user_id});
        if(product.dataValues) return res.status(200).json({success:'Product created successfully'});
        return res.status(400).json({error: 'Product not created'});
    }catch(err){
        res.status(500).send(err.message);
    }
});


//update a product
router.put('/product/:id',checkWhetherProductExists, async (req,res) => {
    try{
        let id = req.params.id;
        if(!id) return res.status(400).json({error: "id missing"});
        await db.product.update({ productname : req.body.productname }, {where: { id : id }});
        res.status(200).json({success:'Product Updated successfully'});
    } catch(err){
        res.status(500).send(err.message);
    }
});

//delete a product
router.delete('/product/:id', async (req,res) => {
    try{
        let id = req.params.id;
        let product =  await db.product.findOne({ where: { id: id } });
        if(!product.dataValues) return res.status(404).json({error: 'No Data to be deleted'});
        db.product.destroy({where: { id: id }})
        res.status(200).json({success:'Product deleted successfully'});
    } catch(err){
        res.status(500).send(err.message);
    }
});


module.exports = router;
