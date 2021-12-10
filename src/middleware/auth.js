const Register = require("../models/registers");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const verifyuser = jwt.verify(token, process.env.SECRET_KEY);
        console.log(verifyuser);

        const user = await Register.findOne({ _id: verifyuser._id });
        console.log(`${user}`);

        req.token = token;
        req.user = user;
        next();
    } catch (err) {
        res.status(401).send(err);
    }
}


module.exports = auth;

