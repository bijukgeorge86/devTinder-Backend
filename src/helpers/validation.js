const validator = require("validator");

const validateSignUpData = (req) => {
    const { firstName, lastName, emailId, password } = req.body;

    if (!firstName || !lastName) {
        throw new Error("Name is not valid");
    } else if (firstName.length < 3 || firstName.length > 50) {
        throw new Error("FirstName should be 4-50 Characters");
    } else if (!validator.isEmail(emailId)) {
        throw new Error("Email is not valid ");
    } else if (!validator.isStrongPassword(password)) {
        throw new Error("Please enter a strong password");
    }
};

const validateEditProfileData = (req) => {
    const allowedEditFields = [
        "firstName",
        "lastName",
        "photoUrl",
        "age",
        "gender",
        "about",
        "skills",
    ];

    const isEditAllowed = Object.keys(req.body).every((field) =>
        allowedEditFields.includes(field)
    );

    return isEditAllowed;
};

const validateModifyPassword = (req) => {};

module.exports = {
    validateSignUpData,
    validateEditProfileData,
};
