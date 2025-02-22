const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 50,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            minLength: 4,
            maxLength: 100,
            trim: true,
        },
        emailId: {
            type: String,
            lowercase: true,
            required: true,
            unique: true,
            trim: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Invalid Email address : " + value);
                }
            },
        },
        password: {
            type: String,
            required: true,
            validate(value) {
                if (!validator.isStrongPassword(value)) {
                    throw new Error("Enter a strong password : " + value);
                }
            },
        },
        age: {
            type: Number,
            min: 18,
            max: 90,
        },
        gender: {
            type: String,
            enum: {
                values: ["male", "female"],
                message: `{VALUE} is not a valid gender type`,
            },
            /*validate(value) {
                if (!["male", "female"].includes(value)) {
                    throw new Error("Gender data is not valid");
                }
            },*/
        },
        photoUrl: {
            type: String,
            default: "https://geographyandyou.com/images/user-profile.png",
            validate(value) {
                if (!validator.isURL(value)) {
                    throw new Error("Invalid Photo URL : " + value);
                }
            },
        },
        about: {
            type: String,
            default: "This is a default description about the user",
            minLength: 5,
        },
        skills: {
            type: [String],
        },
    },
    {
        timestamps: true,
    }
);

userSchema.index({ firstName: 1, lastName: 1 });

userSchema.methods.getJWT = async function () {
    const user = this;
    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
    return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
    const user = this;
    const passwordHash = user.password;
    const isPasswordValid = await bcrypt.compare(
        passwordInputByUser,
        passwordHash
    );
    return isPasswordValid;
};

module.exports = mongoose.model("User", userSchema);
