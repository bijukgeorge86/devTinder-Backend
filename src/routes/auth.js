const express = require("express");

const authRouter = express.Router();
const { validateSignUpData } = require("../helpers/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

//Signup API
authRouter.post("/signup", async (req, res) => {
    try {
        // Validation of data
        validateSignUpData(req);
        const {
            firstName,
            lastName,
            emailId,
            password,
            age,
            gender,
            photoUrl,
            about,
            skills,
        } = req.body;
        // Encrypt the password
        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
            age,
            gender,
            photoUrl,
            about,
            skills,
        });
        const savedUser = await user.save();
        const token = await savedUser.getJWT();

        res.cookie("token", token, {
            expires: new Date(Date.now() + 8 * 3600000),
        });

        res.json({ message: "User Added Successfully.!", data: savedUser });
    } catch (err) {
        res.status(400).send("ERROR  : " + err.message);
    }
});

// Login API
authRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;
        //Check if email is valid
        // if(va)
        const user = await User.findOne({ emailId: emailId });
        if (!user) {
            throw new Error("Invalid Credentials...!!!!!");
        }
        const isPasswordValid = await user.validatePassword(password);
        if (isPasswordValid) {
            const token = await user.getJWT();

            res.cookie("token", token, {
                httpOnly: true,
                expires: new Date(Date.now() + 8 * 3600000),
            });
            res.send(user);
        } else {
            throw new Error("Invalid Credentials...!!!!!");
        }
    } catch (err) {
        res.status(400).send("User Login Failed : " + err.message);
    }
});

//Logout API
authRouter.post("/logout", async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
    });
    res.send("Logged Out Successfully..!!!");
});

module.exports = authRouter;
