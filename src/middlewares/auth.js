const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
    try {
        //Read the token from the req cookies
        const { token } = req.cookies;
        if (!token) {
            //throw new Error("Token is not Valid.!!!");
            return res.status(401).send("Please login.!");
        }
        //Validate the token
        const decodedObj = await jwt.verify(token, "DEV@tinder$790");
        const { _id } = decodedObj;
        //Find the user
        const user = await User.findById(_id);
        //console.log("User Auth => " + user);

        if (!user) {
            throw new Error("User not found");
        }
        req.user = user;
        next();
    } catch (err) {
        res.status(400).send("ERROR : " + err.message);
    }
};

module.exports = {
    userAuth,
};
