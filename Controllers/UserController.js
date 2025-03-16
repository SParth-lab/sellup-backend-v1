const User = require("../Models/User.js"); // Adjusted import path
const generateToken = require("../Helper/generateToken.js");
const { UserVerificationTemplate, generateOTP, createEmailAndSend } = require("../Helper/Email.js");
const client = require('../Helper/Redis.js')


const createUser = {
    validator: async (req, res, next) => {
        const { name, lastName, email, phoneNumber, address, area, city, state, zipCode, password } = req.body;
        if (!name || !lastName || !email || !phoneNumber || !address || !area || !city || !state || !zipCode || !password) {
            return res.status(400).send({error: "Please Fill all the Fields"});
        }
        next();
    },
    controller: async (req, res) => {
        try {
            const { name, lastName, email, phoneNumber, address, area, city, state, country, zipCode, password } = req.body;
            const fullAddress = {
                address,
                area,
                city,
                state,
                country,
                zipCode
            }
            let criteria = {}
            if (email) {
                criteria.email = email;
            }
            if (phoneNumber) {
                criteria.phoneNumber = phoneNumber;
            }
            const user = await User.findOne(criteria).select({ email: 1, phoneNumber: 1, isDeleted: 1, isActive: 1 }).lean();
            if (user?.email === email || user?.phoneNumber === phoneNumber) {
                return res.status(400).send({error: "User Already Exists"});
            }
            // Encrypt the password before saving
            const passwordHashResult = await User.generatePasswordHash(password);
            const { hash } = passwordHashResult || {};
            const payload = {
                name,
                lastName,
                email,
                phoneNumber,
                address,
                area,
                city,
                state,
                country,
                zipCode,
                password: hash,
                fullAddress
            }

            // Create a new user instance
            const newUser = new User(payload);
            // Save the user to the database
            const savedUser = await newUser.save();


            return res.status(200).send({
                "message": "Account Creation Successful",
                user: savedUser
            });
        }
        catch (e) {
            console.log(e);
            if (e.keyValue?.username) {
                return res.status(400).send({error: "Username Already Exists"});
            }
            else if (e.keyValue?.email) {
                return res.status(400).send({error: "Email Address Already Exists"});
            }
            else if (e.keyValue?.phoneNumber) {
                return res.status(400).send({error: "Mobile Number Already Exists"});
            }
            else {
                return res.status(400).send({error: "Registration Failed"}  );
            }
        }
    }
}

const login = {
    validator: async (req, res, next) => {
        const { email, phoneNumber, password } = req.body;
        if ((!email || !phoneNumber) && !password) {
            return res.status(400).send({error: "Please Fill email or phoneNumber and password"});
        }
        next();
    },
    controller: async (req, res) => {
        try {
            const { email, phoneNumber, password } = req.body;
            const criteria = {
                isDeleted: false,
                isActive: true
            }
            if (email) {
                criteria.email = email;
            }
            if (phoneNumber) {
                criteria.phoneNumber = phoneNumber;
            }
            const _user = await User.findOne(criteria).lean();

            if (!_user) {
                return res.status(401).send({error: "User Not Found"});
            }

            if (_user.isDeleted) {
                return res.status(401).send({error: "User is Deleted"});
            }

            if (!_user.isActive) {
                return res.status(401).send({error: "User is Not Active"});
            }

            // Compare passwords
            const passwordCompareResult = await User.comparePassword(password, _user.password);
            const { result, err } = passwordCompareResult || {};
            if (err) {
                return res.status(400).send({error: "Invalid password"});
            }

                // Generate JWT token
            const token = await generateToken(_user);

            return res.status(200).json({
                "success": true,
                token: token,
                userInfo: _user
            });

        }
        catch (e) {
            console.log("🚀 ~ controller: ~ AuthController :", e)
            return res.status(400).send({error: "Login Failed Internal Server Error"});
        }
    }
}

const changePassword = {
    validator: async (req, res, next) => {
        const { newPassword } = req.body;
        if (!newPassword) {
            return res.status(400).send({error: "Please enter new password"});
        }
        next();
    },
    controller: async (req, res) => {
        const { newPassword } = req.body;
        const { _id: userId } = req.user;
        const passwordHashResult = await User.generatePasswordHash(newPassword);
        const { hash } = passwordHashResult || {};
        const updatedUser = await User.findByIdAndUpdate(userId, {password: hash}, {new: true});
        return res.status(200).send({message: "Password Changed Successfully", user: updatedUser});
    }
}

const editUser = {
    controller: async (req, res) => {
        try {
            const {  name, lastName, email, phoneNumber, address, area, city, state, country, zipCode, avatar } = req.body;
            const { _id: userId } = req.user;
            const updateFields = {
                $set: {
                    name,
                    lastName,
                    email,
                    phoneNumber,
                    address,
                    area,
                    city,
                    state,
                    country,
                    zipCode,
                    avatar
                }
            };
            if (address || area || city || state || country || zipCode) {
                const fullAddress = {
                    address,
                    area,
                    city,
                    state,
                    country,
                    zipCode
                }
                Object.keys(fullAddress).forEach(key => fullAddress[key] === undefined && delete fullAddress[key]);
                updateFields.$set.fullAddress = fullAddress;
            }
            Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);


            const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {new: true});
            return res.status(200).send({message: "User updated successfully", user: updatedUser});
        } catch (error) {
            console.log("🚀 ~ editUser --- controller: ~ error:", error)
            return res.status(400).send({error: error.message || "Internal server error"});
        }
    }
}


const SendUserVerificationEmail = {
    validator: async (req, res, next) => {
        const { email } = req.body;
        if (!email) {
            return res.status(400).send({error: "Please enter email"});
        }
        next();
    },
    controller: async (req, res) => {
        const { email } = req.body;
        const user = await User.findOne({email}).lean();

        if (!user) {
            return res.status(400).send({error: "User not found"});
        }
        if (user.isEmailVerified) {
            return res.status(400).send({error: "User email already verified"});
        }
        // send email verification
        const otp = generateOTP();
        const emailTemplate = UserVerificationTemplate(user.name, user.lastName, otp);
        const subject = "User Verification Email";
        try {
            await createEmailAndSend(email, subject, emailTemplate, otp);
            // here delete all old otp from redis
            return res.status(200).json({ message: "OTP sent successfully" });
        } catch (error) {
            return res.status(500).json({ message: "Email failed to send", error });
        }
    }
}


const verifyUserEmail = {
    validator: async (req, res, next) => {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).send({error: "Please enter email and otp"});
        }
        next();
    },
    controller: async (req, res) => {
        const { email, otp } = req.body;
        const user = await User.findOne({email}).lean();
        if (!user) {
            return res.status(400).send({error: "User not found"});
        }
        if (user.isEmailVerified) {
            return res.status(400).send({error: "User email already verified"});
        }
        const storedOTP = await client.get(email);
        if (storedOTP+"" !== otp+"") {
            return res.status(400).send({error: "Invalid OTP"});
        }
        const updatedUser = await User.findByIdAndUpdate(user._id, {isEmailVerified: true}, {new: true});
        return res.status(200).send({message: "User email verified successfully", user: updatedUser});
    }
}

module.exports = { createUser, login, changePassword, editUser, SendUserVerificationEmail, verifyUserEmail };