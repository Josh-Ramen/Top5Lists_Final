const auth = require('../auth')
const User = require('../models/user-model')
const bcrypt = require('bcryptjs')

loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }
        let existingUser = null;
        if (email.includes("@")) {
            console.log("Logging in with email");
            existingUser = await User.findOne({ email: email });
        } else {
            console.log("Logging in with username");
            existingUser = await User.findOne({ username: email });
        }
        if (!existingUser) {
            return res
                .status(400)
                .json({ errorMessage: "That email or username is not registered." });
        }

        console.log("User exists!")
        // COMPARE THE PASSWORDS
        
        const match = await bcrypt.compare(password, existingUser.passwordHash);

        if (match) {
            // SUCCESS - LOG THE USER IN
            const token = auth.signToken(existingUser);
                res.cookie("token", token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none"
                }).status(200).json({
                    success: true,
                    user: {
                        firstName: existingUser.firstName,
                        lastName: existingUser.lastName,
                        username: existingUser.username
                    }
                }).send();
        } else {
            return res
                    .status(400)
                    .json({ errorMessage: "That is not the correct password." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ errorMessage: "There was a problem with that logout request." }).send();
    }
}

getLoggedIn = async (req, res) => {
    console.log("checking logged in");
    auth.verify(req, res, async function () {
        const loggedInUser = await User.findOne({ _id: req.userId });
        return res.status(200).json({
            loggedIn: true,
            user: {
                firstName: loggedInUser.firstName,
                lastName: loggedInUser.lastName,
                username: loggedInUser.username,
            }
        }).send();
    })
}

registerUser = async (req, res) => {
    try {
        const { firstName, lastName, username, email, password, passwordVerify } = req.body;
        if (!firstName || !lastName || !username || !email || !password || !passwordVerify || username === " ") {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }
        if (password.length < 8) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter a password of at least 8 characters."
                });
        }
        if (password !== passwordVerify) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter the same password twice."
                })
        }
        let existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res
                .status(400)
                .json({
                    success: false,
                    errorMessage: "An account with this email address already exists."
                })
        }
        existingUser = await User.findOne({ username: username });
        if (existingUser) {
            return res
                .status(400)
                .json({
                    success: false,
                    errorMessage: "An account with this username already exists."
                })
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName, lastName, username, email, passwordHash
        });
        const savedUser = await newUser.save();

        // LOGIN THE USER
        const token = auth.signToken(savedUser);

        await res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        }).status(200).json({
            success: true,
            user: {
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                username: savedUser.username
            }
        }).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ errorMessage: "There was a problem with that register request." }).send();
    }
}

logoutUser = async (req, res) => {
    try {
        await res.clearCookie("token").status(200).json({
            success: true
        }).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ errorMessage: "There was a problem with that logout request." }).send();
    }
}

module.exports = {
    loginUser,
    getLoggedIn,
    registerUser,
    logoutUser
}