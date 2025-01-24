import JWT from 'jsonwebtoken';
import User from "../Models/User.js";
import dotenv from 'dotenv';

dotenv.config();

const VerifyToken = async (req, res, next) => {
    try {
        // const token = req.headers.cookie.split("=")[1];
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).send({error:"Unauthorized User"})
          }
        const token = authHeader.split(' ')[1];
        
        if (token) {
            // const token = authHeader.split(" ")[1];
            const verified = JWT.verify(token, process.env.JWT_SEC_KEY);
            // console.log(verified)
            const currUser = await User.findOne({
                _id: verified._id
            }).select({isActive:1, isDeleted:1, role:1, email:1, name:1, lastName:1, phoneNumber:1}).lean();


            if (!currUser) {
                return res.status(401).send({error: "User Not Found"});
            }

            if (currUser.isDeleted) {
                return res.status(401).send({error: "User is Deleted"});
            }

            if (!currUser.isActive) {
                return res.status(401).send({error: "User is Not Active"});
            }

            req.token = token;
            req.user = currUser;

            next();

        } else {
            return res.status(401).send({error:"Please Login to Perform This"})
        }
    } catch (err) {
        res.status(401).send({error:"Unauthorized User"});
    }
}

export default VerifyToken;