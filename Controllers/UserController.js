const User = require("../Models/User.js"); // Adjusted import path
const generateToken = require("../Helper/generateToken.js");


const createUser = {
    validator: async (req, res, next) => {
        const { name, lastName, email, password } = req.body;
        if (!name || !lastName || !email || !password) {
            return res.status(400).send({error: "Please Fill all the Fields"});
        }
        next();
    },
    controller: async (req, res) => {
        try {
            const { name, lastName, email, phoneNumber, address, area, city, state, country, zipCode, password, longitude, latitude } = req.body;
            const fullAddress = {
                address: address || "",
                area: area || "",
                city: city || "",
                state: state || "",
                country: country || "",
                zipCode: zipCode || ""
            }
            let criteria = {}
            if (email) {
                criteria.email = email;
            }
            if (phoneNumber) {
                criteria.phoneNumber = phoneNumber;
            }
            const user = await User.findOne(criteria).select({ email: 1, phoneNumber: 1, isDeleted: 1, isActive: 1 }).lean();
            if (email && user?.email === email) {
                return res.status(400).send({error: "Email Address Already Exists"});
            }
            if (phoneNumber && user?.phoneNumber === phoneNumber) {
                return res.status(400).send({error: "Phone Number Already Exists"});
            }
            // Encrypt the password before saving
            const passwordHashResult = await User.generatePasswordHash(password);
            const { hash } = passwordHashResult || {};
            const payload = {
                name,
                lastName,
                email,
                phoneNumber,
                address: address || "",
                area: area || "",
                city: city || "",
                state: state || "",
                country: country || "",
                zipCode: zipCode || "",
                password: hash,
                fullAddress: fullAddress || {},
                longitude: longitude || 0,
                latitude: latitude || 0
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
            const {  name, lastName, email, phoneNumber, address, area, city, state, country, zipCode, avatar, latitude, longitude } = req.body;
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
                    avatar,
                    longitude,
                    longitude
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

const forgotPassword = {
    validator: async (req, res, next) => {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).send({error: "Please enter email and new password"});
        }
        next();
    },
    controller: async (req, res) => {

        const { email, newPassword } = req.body;
        const user = await User.findOne({email, isDeleted: false, isActive: true}).select({isDeleted: 1, isActive: 1}).lean();
        if (!user) {
            return res.status(400).send({error: "User not found"});
        }
        if (user.isDeleted) {
            return res.status(400).send({error: "User is Deleted"});
        }
        if (!user.isActive) {
            return res.status(400).send({error: "User is Not Active"});
        }

        const passwordHashResult = await User.generatePasswordHash(newPassword);
        const { hash } = passwordHashResult || {};
        const updatedUser = await User.findByIdAndUpdate(user._id, {password: hash}, {new: true});
        return res.status(200).send({message: "Password Forgot Successfully", user: updatedUser});
    }
}


const setUserPreference = {
    validator: async (req, res, next) => {
        const { isChatEnabled, isCallEnabled } = req.body;
        if (isChatEnabled === undefined && isCallEnabled === undefined) {
            return res.status(400).send({ error: "Please enter isChatEnabled or isCallEnabled" });
        }
        next();
    },
    controller: async (req, res) => {
        try {
            const { _id: userId } = req.user;
            const { isChatEnabled, isCallEnabled } = req.body;
            const updateFields = {
                isChatEnabled,
                isCallEnabled
            }
            const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });
            return res.status(200).send({ message: "User preference set successfully", user: updatedUser });
        } catch (error) {
            console.log("🚀 ~ setUserPreference --- controller: ~ error:", error)
            return res.status(400).send({ error: error.message || "Internal server error" });
        }
    }
}
module.exports = { createUser, login, changePassword, editUser, forgotPassword, setUserPreference };