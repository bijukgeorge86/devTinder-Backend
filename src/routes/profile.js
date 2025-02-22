const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../helpers/validation");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    } catch (err) {
        res.status(400).send("ERROR in Profile View : " + err.message);
    }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        if (!validateEditProfileData(req)) {
            throw new Error("Invalid Edit Request");
        }
        const loggedInUser = req.user;

        Object.keys(req.body).forEach(
            (key) => (loggedInUser[key] = req.body[key])
        );

        await loggedInUser.save();
        res.json({
            message: `${
                loggedInUser.firstName + " " + loggedInUser.lastName
            }, your Profile has been updated successfully`,
            data: loggedInUser,
        });
    } catch (err) {
        res.status(400).send("ERROR in Profile Edit : " + err.message);
    }
});

profileRouter.patch("/password", userAuth, async (req, res) => {
    try {
        const { password } = req.body;
    } catch (err) {
        res.status(400).send("Something Went wrong : " + err.message);
    }
});

module.exports = profileRouter;
