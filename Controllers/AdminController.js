import generateToken from "../Helper/generateToken.js";
import User from "../Models/User.js";


export const login = {
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
                return res.status(404).send({error: "User Not Found"});
            }

            if (_user.isDeleted) {
                return res.status(404).send({error: "User is Deleted"});
            }

            if (!_user.isActive) {
                return res.status(404).send({error: "User is Not Active"});
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
                accessToken: token,
                user: _user
            });

        }
        catch (e) {
            console.log("🚀 ~ controller: ~ AuthController :", e)
            return res.status(400).send({error: "Login Failed Internal Server Error"});
        }
    }
}


export const getAllUsers = {
    validator: async (req, res, next) => {
        const { page, limit } = req.query;
        if (!page || !limit) {
            return res.status(400).send({error: "Please enter all fields"});
        }
        next();
    },
    controller: async (req, res) => {
        const { page, limit, search, isActive, isDeleted } = req.query;
        const skip = (page - 1) * limit;
        const criteria = {
            isDeleted: false,
            isActive: true
        }
        if (search) {
            criteria.name = { $regex: search, $options: 'i' };
            criteria.email = { $regex: search, $options: 'i' };
            criteria.phoneNumber = { $regex: search, $options: 'i' };
            criteria.lastName = { $regex: search, $options: 'i' };
        }
        if (isActive) {
            criteria.isActive = isActive;
        }
        if (isDeleted) {
            criteria.isDeleted = isDeleted;
        }
        const users = await User.find(criteria).skip(skip).limit(limit).sort(sort).lean();
        return res.status(200).send({users});
    }
}