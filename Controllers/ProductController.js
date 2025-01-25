import Product from "../Models/Product.js";
import { updateProductLimit } from "../Helper/product.js";
import Review from "../Models/Review.js";

export const createProduct = {
    validator: async (req, res, next) => {
        const { title, description, price, category, subCategory, location, images } = req.body;
        if (!title || !description || !price || !category || !subCategory || !location || !images) {
            return res.status(400).send({ error: "Please Fill all the fields" });
        }
        next();
    },
    controller: async (req, res) => {
        const { title, description, price, category, subCategory, location, images } = req.body;
        const { _id: userId } = req.user;
        if (images.length > 5) {
            return res.status(400).send({ error: "Maximum 5 images allowed" });
        }
        // Create a new product
        const product = await Product.create({
            title,
            description,
            price,
            category: category.toLowerCase(),
            subCategory: subCategory.toLowerCase(),
            location,
            images,
            userId: userId, // User ID from the JWT payload
        });
        await product.save();
        await updateProductLimit(userId, true, res);
        await product.populate('userId', { name: 1, lastName: 1, email: 1, phoneNumber: 1, profileImage: 1, fullAddress: 1, productCount: 1, productLimit: 1 });
        return res.status(200).send({ message: "Product Created Successfully", product });
    }

}

export const getProducts = {
    validator: async (req, res, next) => {
        next();
    },
    controller: async (req, res) => {

        const { category, subCategory, location, area, search, minPrice, maxPrice, userId, productId } = req.query;
        const { _id } = req.user;
        const criteria = {
            isDelete: false,
        };
        // Add filters to the query object
        if (category) criteria.category = category?.toLowerCase();
        if (subCategory) criteria.subCategory = subCategory?.toLowerCase();
        if (search) criteria.title = { $regex: search, $options: 'i' };
        if (location) criteria['location.city'] = { $regex: location, $options: 'i' };
        if (area) criteria['location.area'] = { $regex: area, $options: 'i' };
        if (minPrice !== undefined) criteria.price = { ...criteria.price, $gte: parseFloat(minPrice) };
        if (maxPrice !== undefined) criteria.price = { ...criteria.price, $lte: parseFloat(maxPrice) };
        if (userId) criteria.userId = userId;
        if (productId) criteria._id = productId;

        // Fetch products with pagination and sorting by price
        const products = await Product.find(criteria)
            .sort({ price: 1 })
            .populate('userId', { name: 1, lastName: 1, email: 1, phoneNumber: 1, fullAddress: 1, productCount: 1, productLimit: 1,avatar: 1 }).lean();
        if (productId) {
            const reviews = await Review.find({productId: productId, isDelete: false})
                .populate('userId', { name: 1, lastName: 1,avatar: 1 })
                .lean();
            const product = products.find(product => product._id + "" === productId);
            product.reviews = reviews || [];
            return res.status(200).send({ message: "Product Fetched Successfully", product });
        }
        return res.status(200).send({ message: "Products Fetched Successfully", products });
    }
}

export const editProduct = {
    validator: async (req, res, next) => {
        const { productId } = req.query;
        if (!productId) {
            return res.status(400).send({ error: "Please provide product id" });
        }
        next();
    },
    controller: async (req, res) => {
        const {productId} = req.query;
        const {title, description, price, location, images} = req.body;
        try {
            let editedProduct = {};
            if (title) editedProduct.title = title;
            if (description) editedProduct.description = description;
            if (price) editedProduct.price = price;
            if (location) editedProduct.location = location;
            if (images) editedProduct.images = images;

            const product = await Product.findByIdAndUpdate(productId, editedProduct, { new: true });
            if (!product) {
                return res.status(404).send({ error: "Product not found" });
            }
            return res.status(200).send({ message: "Product updated successfully", product });
        } catch (error) {
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }
}

export const deleteProduct = {
    validator: async (req, res, next) => {
        const {productId} = req.query;
        if (!productId) {
            return res.status(400).send({ error: "Please provide product id" });
        }
        next();
    },
    controller: async (req, res) => {
        const {productId, isHardDelete} = req.query;  
        const {_id: userId} = req.user;
        let product = [];
        if (isHardDelete === 'true' || isHardDelete === true) {
            product = await Product.findByIdAndDelete(productId);
        } else {
            product = await Product.findByIdAndUpdate(productId, {isDelete: true, userId: userId}, {new: true});
        }
        await updateProductLimit(userId, false, res);
        return res.status(200).send({message: "Product deleted successfully", product});
    }
}