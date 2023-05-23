const jwt = require("jsonwebtoken");

const secretKey = "Siddhesh$Nimap$SecretKey";

function setUser(name,email,time) {
    return jwt.sign({name,email},secretKey,{expiresIn:time});
};

function getUsertoken(token) {
    if(!token) return;
    return jwt.verify(token, secretKey);
}


module.exports = { setUser, getUsertoken, secretKey };