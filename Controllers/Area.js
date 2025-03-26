const Area = require("../Models/Area.js");

const getArea = {
    controller: async (req, res, next) => {
        const { skip = 0, limit = 10, searchTerm, pincode } = req.query;
        try {
            const criteria = {
                isDeleted: false,
            }
            if (searchTerm?.length > 0) {
                criteria.$or = [
                    { area: { $regex: searchTerm, $options: "i" } }
                ];
            }
            if (pincode && pincode?.length > 0) {
                if (!criteria.$or) {
                    criteria.$or = [];
                }
                criteria.$or.push({ pincode: { $regex: pincode, $options: "i" } });
            }
            const areaArray = await Area.find(criteria).lean().limit(limit).skip(skip);
            res.status(200).json({ data: areaArray });
        } catch (error) {
            res.status(500).json({ message: "Internal server error" });
            console.log(error)
        }
    }
}

module.exports = { getArea };