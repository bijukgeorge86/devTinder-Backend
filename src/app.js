const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

require("dotenv").config();

require("./helpers/cronjob");

const http = require("http");

app.use(
    cors({
        origin: "http://localhost:1119",
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const initalizeSocket = require("./helpers/socket");
const chatRouter = require("./routes/chat");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);

const server = http.createServer(app);
initalizeSocket(server);

connectDB()
    .then(() => {
        console.log("Database Connection established");
        server.listen(process.env.PORT, () => {
            console.log(
                "Server Successfully listening to " +
                    process.env.PORT +
                    " ... !!!"
            );
        });
    })
    .catch((err) => {
        console.log("Database cannot be connected.!!");
    });
