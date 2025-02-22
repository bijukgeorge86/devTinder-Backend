const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
    try {
        //Read the token from the req cookies
        const { token } = req.cookies;
        //console.log(token + " Token inside");

        if (!token) {
            //throw new Error("Token is not Valid.!!!");
            return res.status(401).send("Please login.!");
        }
        //Validate the token
        console.log(process.env.JWT_SECRET);

        //const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);
        const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);
        console.log(decodedObj + " => Decoded");

        const { _id } = decodedObj;
        console.log(_id + " => _id");
        //Find the user
        const user = await User.findById(_id);
        console.log(user + " => user");
        //console.log("User Auth => " + user);

        if (!user) {
            throw new Error("User not found");
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(400).send("ERROR JWT : " + err.message);
    }
};

module.exports = {
    userAuth,
};
