const Banner = require("../Models/Banner.js");
const Product = require("../Models/Product.js");
const User = require("../Models/User.js");

const addBanner = {
    validator: async (req, res, next) => {
        const { mobileImage, webImage, userId, productId } = req.body;
        if (!mobileImage || !webImage || !userId || !productId) {
            return res.status(400).send({ error: "Please Fill all the fields (mobileImage, webImage, userId, productId)" });
        }
        next();
    },
    controller: async (req, res) => {
        try {
            const { mobileImage, webImage, userId, productId } = req.body;
            
            // Verify user exists
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).send({ error: "User not found" });
            }
            
            // Verify product exists
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).send({ error: "Product not found" });
            }

            // Create new banner
            const banner = await Banner.create({
                mobileImage,
                webImage,
                userId,
                productId
            });

            await banner.populate('userId', { name: 1, lastName: 1, email: 1, phoneNumber: 1 });
            await banner.populate('productId', { title: 1, price: 1, discountPrice: 1, images: 1 });

            return res.status(201).send({ 
                message: "Banner created successfully", 
                banner 
            });
        } catch (error) {
            console.error('Error creating banner:', error);
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }
};

const editBanner = {
    validator: async (req, res, next) => {
        const { bannerId } = req.params;
        if (!bannerId) {
            return res.status(400).send({ error: "Banner ID is required" });
        }
        next();
    },
    controller: async (req, res) => {
        try {
            const { bannerId } = req.params;
            const { mobileImage, webImage, userId, productId, isActive } = req.body;

            // Find the banner
            const banner = await Banner.findById(bannerId);
            if (!banner) {
                return res.status(404).send({ error: "Banner not found" });
            }

            // Update banner fields
            if (mobileImage) banner.mobileImage = mobileImage;
            if (webImage) banner.webImage = webImage;
            if (userId) {
                // Verify user exists
                const user = await User.findById(userId);
                if (!user) {
                    return res.status(404).send({ error: "User not found" });
                }
                banner.userId = userId;
            }
            if (productId) {
                // Verify product exists
                const product = await Product.findById(productId);
                if (!product) {
                    return res.status(404).send({ error: "Product not found" });
                }
                banner.productId = productId;
            }
            if (isActive !== undefined) banner.isActive = isActive;

            await banner.save();
            await banner.populate('userId', { name: 1, lastName: 1, email: 1, phoneNumber: 1 });
            await banner.populate('productId', { title: 1, price: 1, discountPrice: 1, images: 1 });

            return res.status(200).send({ 
                message: "Banner updated successfully", 
                banner 
            });
        } catch (error) {
            console.error('Error updating banner:', error);
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }
};

const getBanners = {
    validator: async (req, res, next) => {
        next();
    },
    controller: async (req, res) => {
        try {
            let { limit = 20, skip = 0, isActive, userId, productId } = req.query;
            limit = parseInt(limit);
            skip = parseInt(skip);

            const criteria = {
                isDeleted: false,
            };

            // Add filters
            if (isActive !== undefined) criteria.isActive = isActive === 'true';
            if (userId) criteria.userId = userId;
            if (productId) criteria.productId = productId;

            // Fetch banners with pagination
            const banners = await Banner.find(criteria)
                .populate('userId', { name: 1, lastName: 1, email: 1, phoneNumber: 1 })
                .populate('productId', { title: 1, price: 1, discountPrice: 1, images: 1, category: 1 })
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip)
                .lean();

            const totalBanners = await Banner.countDocuments(criteria);

            return res.status(200).send({ 
                message: "Banners fetched successfully", 
                banners,
                total: totalBanners,
                page: Math.floor(skip / limit) + 1,
                totalPages: Math.ceil(totalBanners / limit)
            });
        } catch (error) {
            console.error('Error fetching banners:', error);
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }
};

const deleteBanner = {
    validator: async (req, res, next) => {
        const { bannerId } = req.params;
        if (!bannerId) {
            return res.status(400).send({ error: "Banner ID is required" });
        }
        next();
    },
    controller: async (req, res) => {
        try {
            const { bannerId } = req.params;

            const banner = await Banner.findByIdAndUpdate(
                bannerId, 
                { isDeleted: true }, 
                { new: true }
            );

            if (!banner) {
                return res.status(404).send({ error: "Banner not found" });
            }

            return res.status(200).send({ 
                message: "Banner deleted successfully", 
                banner 
            });
        } catch (error) {
            console.error('Error deleting banner:', error);
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }
};

module.exports = { addBanner, editBanner, getBanners, deleteBanner };
