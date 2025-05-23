const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const ConnectionRequestModel = require("../models/connectionRequest");

const getSecretRoomId = (userId, targetUserId) => {
    return crypto
        .createHash("sha256")
        .update([userId, targetUserId].sort().join("$"))
        .digest("hex");
};

const initializeSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: "http://localhost:1119",
        },
    });

    io.on("connection", (socket) => {
        socket.on(
            "joinChat",
            ({
                userFirstName,
                userLastName,
                userProfilePic,
                userId,
                targetUserId,
            }) => {
                const roomId = getSecretRoomId(userId, targetUserId);
                console.log(userFirstName + " joined Room : " + roomId);
                socket.join(roomId);
            }
        );

        socket.on(
            "sendMessage",
            async ({
                userFirstName,
                userLastName,
                userProfilePic,
                userId,
                targetUserId,
                text,
            }) => {
                // Save messages to the database
                try {
                    const roomId = getSecretRoomId(userId, targetUserId);
                    console.log(userFirstName + " " + text);

                    // TODO: Check if userId & targetUserId are friends

                    /*
                    ConnectionRequestModel.findOne(
                        {
                            fromUserId: userId,
                            toUserId: targetUserId,
                            status: "accepted",
                        },
                        {
                            fromUserId: targetUserId,
                            toUserId: userId,
                            status: "accepted",
                        }
                    );
                    */

                    let chat = await Chat.findOne({
                        participants: { $all: [userId, targetUserId] },
                    });

                    if (!chat) {
                        chat = new Chat({
                            participants: [userId, targetUserId],
                            messages: [],
                        });
                    }

                    chat.messages.push({
                        senderId: userId,
                        text,
                    });

                    await chat.save();
                    io.to(roomId).emit("messageReceived", {
                        userFirstName,
                        userLastName,
                        userProfilePic,
                        text,
                    });
                } catch (err) {
                    console.log(err);
                }
            }
        );

        socket.on("disconnect", () => {});
    });
};

module.exports = initializeSocket;
