const jwt = require("jsonwebtoken");

const secretKey = "Siddhesh$Nimap$SecretKey";

function setUser(email) {
    return jwt.sign({email},secretKey);
};

function getUser(token) {
    if(!token) return;
    return jwt.verify(user, secretKey);
}


module.exports = { setUser, getUser };