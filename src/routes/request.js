const express = require("express");
const requestRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const sendEmail = require("../aws/sendEmail");

//
requestRouter.post("/sendConnectionRequest", userAuth, async (req, res) => {
    const user = req.user;

    res.send(
        user.firstName +
            " " +
            user.lastName +
            " send the connection request...!!"
    );
});

//
requestRouter.post(
    "/request/send/:status/:toUserId",
    userAuth,
    async (req, res) => {
        try {
            const fromUserId = req.user._id;
            const toUserId = req.params.toUserId;
            const status = req.params.status;
            const allowedStatus = ["ignored", "interested"];

            if (!allowedStatus.includes(status)) {
                return res.status(400).json({
                    message: "Invalid Status Type : " + status,
                });
            }

            const toUser = await User.findById(toUserId);
            if (!toUser) {
                return res.status(404).json({ message: "User is not found.!" });
            }

            const existingConnectionRequest = await ConnectionRequest.findOne({
                $or: [
                    { fromUserId, toUserId },
                    { fromUserId: toUserId, toUserId: fromUserId },
                ],
            });

            if (existingConnectionRequest) {
                return res.status(400).send({
                    message: "Connection Request Already Exists..!!!!",
                });
            }

            const connectionRequest = new ConnectionRequest({
                fromUserId,
                toUserId,
                status,
            });

            const data = await connectionRequest.save();

            const emailRes = await sendEmail.run(
                "A new friend request from " + req.user.firstName,
                req.user.firstName + " is " + status + " in " + toUser.firstName
            );

            res.json({
                message:
                    req.user.firstName +
                    " " +
                    req.user.lastName +
                    " is " +
                    status +
                    " in " +
                    toUser.firstName +
                    " " +
                    toUser.lastName,
                data,
            });
        } catch (err) {
            res.status(400).send("ERROR in Sending Request : " + err.message);
        }
    }
);

//
requestRouter.post(
    "/request/review/:status/:requestId",
    userAuth,
    async (req, res) => {
        try {
            const loggedInUser = req.user;
            const { status, requestId } = req.params;
            const allowedStatus = ["accepted", "rejected"];
            if (!allowedStatus.includes(status)) {
                return res
                    .status(400)
                    .json({ message: "Status not allowed.!!!!" });
            }
            const connectionRequest = await ConnectionRequest.findOne({
                _id: requestId,
                toUserId: loggedInUser._id,
                status: "interested",
            });

            if (!connectionRequest) {
                return res
                    .status(404)
                    .json({ message: "Connection request is not found" });
            }
            connectionRequest.status = status;
            const data = await connectionRequest.save();
            res.status(200).json({
                message: "Connection Request :" + status,
                data,
            });
        } catch (err) {
            res.status(400).send("ERROR in Reviewing Requets : " + err.message);
        }
    }
);

module.exports = requestRouter;
