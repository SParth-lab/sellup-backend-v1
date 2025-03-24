const Product = require("../Models/Product.js");
const { updateProductLimit } = require("../Helper/product.js");
const Review = require("../Models/Review.js");
const CategoryModel = require("../Models/Category.js");

const createProduct = {
    validator: async (req, res, next) => {
        const { title, description, price, category, location, images, compressedImages } = req.body;
        if (!title || !description || !price || !category || !location || !images || !compressedImages) {
            return res.status(400).send({ error: "Please Fill all the fields" });
        }
        next();
    },
    controller: async (req, res) => {
        const { title, description, price, category, subCategory, location, images, compressedImages, categoryId } = req.body;
        const { _id: userId } = req.user;
        if (images.length > 5) {
            return res.status(400).send({ error: "Maximum 5 images allowed" });
        }
        let categoryData = {
            category: category?.toLowerCase(),
            subCategory: subCategory?.toLowerCase(),
            categoryId: categoryId
        };

        if (!categoryId) {
            let categoryData = {
                name: category.toLowerCase(),
                description: 'Other Category',
                colorCode: "#000000",
                image: images[0],
                isOtherCategory: true
            }
            if (subCategory) categoryData.subCategories = [subCategory.toLowerCase()];
            const _category = await CategoryModel.create(categoryData);
            if (!_category) {
                return res.status(400).send({ error: "Category not created" });
            } else {
                categoryData.categoryId = _category?._id;
                _category.subCategories?.length > 0 && (categoryData.subCategory = _category.subCategories[0]);
                categoryData.category = _category.category;
            }
        } else {
            const category = await CategoryModel.findById(categoryId);
            if (!category) {
                return res.status(400).send({ error: "Category not found" });
            }
        }
        // Create a new product
        const product = await Product.create({
            title,
            description,
            price,
            category: categoryData.category,
            subCategory: categoryData.subCategory,
            location,
            images,
            compressedImages,
            categoryId: categoryData.categoryId,
            userId: userId, // User ID from the JWT payload
        });
        await product.save();
        await updateProductLimit(userId, true, res);
        await product.populate('userId', { name: 1, lastName: 1, email: 1, phoneNumber: 1, profileImage: 1, fullAddress: 1, productCount: 1, productLimit: 1 });
        return res.status(200).send({ message: "Product Created Successfully", product });
    }

}

const getProducts = {
    validator: async (req, res, next) => {
        next();
    },
    controller: async (req, res) => {

        let { category, subCategory, location, area, search, minPrice, maxPrice, userId, productId, limit = 20, skip = 0, categoryId } = req.query;
        limit = parseInt(limit);
        skip = parseInt(skip);
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
        if (categoryId) criteria.categoryId = categoryId;

        // Fetch products with pagination and sorting by price
        const products = await Product.find(criteria)
            .sort({ price: 1 })
            .populate('userId', { name: 1, lastName: 1, email: 1, phoneNumber: 1, fullAddress: 1, productCount: 1, productLimit: 1,avatar: 1 }).lean().limit(limit).skip(skip);
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

const editProduct = {
    validator: async (req, res, next) => {
        const { productId } = req.query;
        if (!productId) {
            return res.status(400).send({ error: "Please provide product id" });
        }
        next();
    },
    controller: async (req, res) => {
        const {productId} = req.query;
        const {title, description, price, location, images, compressedImages} = req.body;
        try {
            let editedProduct = {};
            if (title) editedProduct.title = title;
            if (description) editedProduct.description = description;
            if (price) editedProduct.price = price;
            if (location) editedProduct.location = location;
            if (images) editedProduct.images = images;
            if (compressedImages) editedProduct.compressedImages = compressedImages;

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

const deleteProduct = {
    validator: async (req, res, next) => {
        const {productId} = req.query;
        if (!productId) {
            return res.status(400).send({ error: "Please provide product id" });
        }
        next();
    },
    controller: async (req, res) => {
        const {productId } = req.query;  
        const {_id: userId} = req.user;
        let product = await Product.findByIdAndUpdate(productId, {isDelete: true, userId: userId}, {new: true});
        await updateProductLimit(userId, false, res);
        return res.status(200).send({message: "Product deleted successfully", product});
    }
}

module.exports = { createProduct, getProducts, editProduct, deleteProduct };