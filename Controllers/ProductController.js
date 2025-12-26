const Product = require("../Models/Product.js");
const { updateProductLimit } = require("../Helper/product.js");
const Review = require("../Models/Review.js");
const CategoryModel = require("../Models/Category.js");
const sendToTopic = require("../MobileAppNotification/sendNotification.js");
const User = require("../Models/User.js");

const createProduct = {
    validator: async (req, res, next) => {
        const { title, description, price, category, location, images, compressedImages, categoryId, rentType } = req.body;
        if (!title || !description || !price || !category || !location || !images || !compressedImages || !categoryId || !rentType ) {
            return res.status(400).send({ error: "Please Fill all the fields" });
        }
        next();
    },
    controller: async (req, res) => {
        const { 
            title, 
            description, 
            price, 
            category, 
            subCategory, 
            location, 
            images, 
            compressedImages, 
            categoryId, 
            rentType, 
            discount, 
            size, 
            fitType, 
            clothColor, 
            material, 
            sleeveLength, 
            neckStyle, 
            patternPrint, 
            customAddress = false, 
            propertyType, 
            squareFootArea, 
            noOfBedrooms, 
            noOfBathrooms, 
            furnishingStatus, 
            ownershipType, 
            amenities, 
            propertyCondition, 
            bodyType, 
            carModel, 
            carYear, 
            transmission, 
            fuelType, 
            mileage, 
            carColor, 
            driveTrain,
            vendorName,
            vendorPhone,
            driver_type
        } = req.body;
        const { _id: userId } = req.user;
        if (images.length > 5) {
            return res.status(400).send({ error: "Maximum 5 images allowed" });
        }

        const _category = await CategoryModel.findOne({_id: categoryId}).lean();
        if (!_category) {
            return res.status(400).send({ error: "Category not found" });
        }

        // let categoryData = {
        //     category: category?.toLowerCase(),
        //     subCategory: subCategory?.toLowerCase(),
        //     categoryId: categoryId
        // };

        // if (!categoryId) {
        //     let categoryData = {
        //         name: category.toLowerCase(),
        //         description: 'Other Category',
        //         colorCode: "#000000",
        //         image: images[0],
        //         isOtherCategory: true
        //     }
        //     if (subCategory) categoryData.subCategories = [subCategory.toLowerCase()];
        //     const _category = await CategoryModel.create(categoryData);
        //     if (!_category) {
        //         return res.status(400).send({ error: "Category not created" });
        //     } else {
        //         categoryData.categoryId = _category?._id;
        //         _category.subCategories?.length > 0 && (categoryData.subCategory = _category.subCategories[0]);
        //         categoryData.category = _category.category;
        //     }
        // } else {
        //     const category = await CategoryModel.findById(categoryId);
        //     if (!category) {
        //         return res.status(400).send({ error: "Category not found" });
        //     }
        // }

        // check here user product limit
        const user = await User.findOne({_id: userId}).select({productLimit:1, productCount:1}).lean();
        if (!user) {
            return res.status(400).send({ error: "User not found" });
        }
        if (user.productCount >= user.productLimit) {
            return res.status(400).send({ error: "You have reached your product limit" });
        }
        // calculate discount price
        let discountPrice = 0;
        if (discount) {
            discountPrice = price - (price * discount / 100);
            if (discountPrice < 0) {
                discountPrice = price;
            }
        } else if (discount == 0) {
            discountPrice = price;
        }

        // Create a new product
        const product = await Product.create({
            title,
            description,
            price,
            category: _category.name,
            subCategory: subCategory ? subCategory.toLowerCase() : _category.subCategories[0],
            location,
            images,
            compressedImages,
            categoryId: _category._id,
            userId: userId, // User ID from the JWT payload
            rentType,
            discount: discount ?? 0,
            discountPrice: discountPrice ?? 0,
            size,
            fitType,
            clothColor,
            material,
            sleeveLength,
            neckStyle,
            patternPrint,
            customAddress,
            propertyType,
            squareFootArea,
            noOfBedrooms,
            noOfBathrooms,
            furnishingStatus,
            ownershipType,
            amenities,
            propertyCondition,
            bodyType,
            carModel,
            carYear,
            transmission,
            fuelType,
            mileage,
            carColor,
            driveTrain,
            vendorName,
            vendorPhone,
            driver_type
        });
        await product.save();
        await updateProductLimit(userId, true, res);
        await product.populate('userId', { name: 1, lastName: 1, email: 1, phoneNumber: 1, profileImage: 1, fullAddress: 1, productCount: 1, productLimit: 1, isCallEnabled: 1, isChatEnabled: 1, latitude: 1, longitude: 1, isAdsEnable: 1 });
        if (product) {
            // send notification to all users
            await sendToTopic({productId: product._id+"", userId: userId+""});
        }
        return res.status(200).send({ message: "Product Created Successfully", product });
    }

}

const getProducts = {
    validator: async (req, res, next) => {
        next();
    },
    controller: async (req, res) => {

        let { category, subCategory, location, area, search, minPrice, maxPrice, userId, productId, limit = 20, skip = 0, categoryId, rentType, discount, size, fitType, clothColor, material, sleeveLength, neckStyle, patternPrint, customAddress, propertyType, squareFootArea, noOfBedrooms, noOfBathrooms, furnishingStatus, ownershipType, amenities, propertyCondition, bodyType, carModel, carYear, transmission, fuelType, mileage, carColor, driveTrain } = req.query;
        limit = parseInt(limit);
        skip = parseInt(skip);
        // const { _id } = req.user;
        const criteria = {
            isDelete: false,
        };
        // Add filters to the query object
        if (category) criteria.category = category?.toLowerCase();
        if (subCategory) criteria.subCategory = subCategory?.toLowerCase();
        if (search) criteria.title = { $regex: search, $options: 'i' };
        if (area) criteria['location.area'] = { $regex: area, $options: 'i' };
        if (location) {
            criteria['$or'] = [];
            criteria['$or'].push({ 'location.city': { $regex: location, $options: 'i' } });
            criteria['$or'].push({ 'location.area': { $regex: location, $options: 'i' } });
            criteria['$or'].push({ 'location.address': { $regex: location, $options: 'i' } });
            criteria['$or'].push({ 'location.state': { $regex: location, $options: 'i' } });
            criteria['$or'].push({ 'location.country': { $regex: location, $options: 'i' } });
            criteria['$or'].push({ 'location.zipCode': { $regex: location, $options: 'i' } });
        }
        

        if (minPrice !== undefined && maxPrice !== undefined) {
            criteria.discountPrice = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };
        }
        if (userId) criteria.userId = userId;
        if (productId) criteria._id = productId;
        if (rentType) criteria.rentType = rentType;
        if (discount !== undefined) criteria.discount = { $gte: parseFloat(discount) };
        if (size) criteria.size = size;
        if (fitType) criteria.fitType = fitType;
        if (clothColor) criteria.clothColor = clothColor;
        if (material) criteria.material = material;
        if (sleeveLength) criteria.sleeveLength = sleeveLength;
        if (neckStyle) criteria.neckStyle = neckStyle;
        if (patternPrint) criteria.patternPrint = patternPrint;
        if (customAddress !== undefined) criteria.customAddress = customAddress;
        if (propertyType) criteria.propertyType = propertyType;
        if (squareFootArea) criteria.squareFootArea = squareFootArea;
        if (noOfBedrooms !== undefined) criteria.noOfBedrooms = noOfBedrooms;
        if (noOfBathrooms !== undefined) criteria.noOfBathrooms = noOfBathrooms;
        if (furnishingStatus) criteria.furnishingStatus = furnishingStatus;
        if (ownershipType) criteria.ownershipType = ownershipType;
        if (amenities) criteria.amenities = amenities;
        if (propertyCondition) criteria.propertyCondition = propertyCondition;
        if (bodyType) criteria.bodyType = bodyType;
        if (carModel) criteria.carModel = carModel;
        if (carYear) criteria.carYear = carYear;
        if (transmission) criteria.transmission = transmission;
        if (fuelType) criteria.fuelType = fuelType;
        if (mileage) criteria.mileage = mileage;
        if (carColor) criteria.carColor = carColor;
        if (driveTrain) criteria.driveTrain = driveTrain;
        if (categoryId) criteria.categoryId = categoryId;

        // Fetch products with pagination and sorting by price
        const products = await Product.find(criteria)
            .sort({ price: 1 })
            .populate('userId', { name: 1, lastName: 1, email: 1, phoneNumber: 1, fullAddress: 1, productCount: 1, productLimit: 1,avatar: 1, isCallEnabled: 1, isChatEnabled: 1, latitude: 1, longitude: 1, isAdsEnable: 1 }).lean().limit(limit).skip(skip);
        if (productId) {
            const product = products.find(product => product._id + "" === productId);
            const reviews = await Review.find({productId: productId, isDelete: false})
                .populate('userId', { name: 1, lastName: 1,avatar: 1 })
                .lean();
            if (reviews &&reviews?.length > 0) {
                product.reviews = reviews || [];
            }
            return res.status(200).send({ message: "Product Fetched Successfully", product: product || {} });
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
        const {title, description, price, location, images, compressedImages, rentType, discount=0, size, fitType, clothColor, material, sleeveLength, neckStyle, patternPrint, customAddress=false, propertyType, squareFootArea, noOfBedrooms, noOfBathrooms, furnishingStatus, ownershipType, amenities, propertyCondition, bodyType, carModel, carYear, transmission, fuelType, mileage, carColor, driveTrain, vendorName, vendorPhone, driver_type, inRent} = req.body;
        try {
            let editedProduct = {};
            if (title) editedProduct.title = title;
            if (description) editedProduct.description = description;
            if (price) editedProduct.price = price;
            if (location) editedProduct.location = location;
            if (images) editedProduct.images = images;
            if (compressedImages) editedProduct.compressedImages = compressedImages;
            if (rentType) editedProduct.rentType = rentType;
            if (discount !== undefined) editedProduct.discount = discount ?? 0;
            if (size) editedProduct.size = size;
            if (fitType) editedProduct.fitType = fitType;
            if (clothColor) editedProduct.clothColor = clothColor;
            if (material) editedProduct.material = material;
            if (sleeveLength) editedProduct.sleeveLength = sleeveLength;
            if (neckStyle) editedProduct.neckStyle = neckStyle;
            if (patternPrint) editedProduct.patternPrint = patternPrint;
            if (customAddress !== undefined) editedProduct.customAddress = customAddress;
            if (propertyType) editedProduct.propertyType = propertyType;
            if (squareFootArea) editedProduct.squareFootArea = squareFootArea;
            if (noOfBedrooms !== undefined) editedProduct.noOfBedrooms = noOfBedrooms;
            if (noOfBathrooms !== undefined) editedProduct.noOfBathrooms = noOfBathrooms;
            if (furnishingStatus) editedProduct.furnishingStatus = furnishingStatus;
            if (ownershipType) editedProduct.ownershipType = ownershipType;
            if (amenities) editedProduct.amenities = amenities;
            if (propertyCondition) editedProduct.propertyCondition = propertyCondition;
            if (bodyType) editedProduct.bodyType = bodyType;
            if (carModel) editedProduct.carModel = carModel;
            if (carYear) editedProduct.carYear = carYear;
            if (transmission) editedProduct.transmission = transmission;
            if (fuelType) editedProduct.fuelType = fuelType;
            if (mileage) editedProduct.mileage = mileage;
            if (carColor) editedProduct.carColor = carColor;
            if (driveTrain) editedProduct.driveTrain = driveTrain;
            if (vendorName) editedProduct.vendorName = vendorName;
            if (vendorPhone) editedProduct.vendorPhone = vendorPhone;
            if (driver_type) editedProduct.driver_type = driver_type;
            if (inRent !== undefined) editedProduct.inRent = inRent;

            // calculate discount price
            if (discount) {
                editedProduct.discountPrice = price - (price * discount / 100);
                if (editedProduct.discountPrice < 0) {
                    editedProduct.discountPrice = price;
                }
            } else if (discount === 0) { 
                editedProduct.discountPrice = price;
            }

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

// Add/Edit rented dates - replaces entire array
const updateRentedDates = {
    validator: async (req, res, next) => {
        const { productId, dates } = req.body;
        if (!productId || !dates || !Array.isArray(dates)) {
            return res.status(400).send({ error: "Please provide productId and dates array" });
        }
        next();
    },
    controller: async (req, res) => {
        try {
            const { productId, dates } = req.body;
            const { _id: userId } = req.user;

            // Check if product exists and is not deleted for this user
            const product = await Product.findOne({ 
                _id: productId, 
                userId: userId, 
                isDelete: false 
            });

            if (!product) {
                return res.status(404).send({ error: "Product not found or has been deleted" });
            }

            product.rentedDates = dates;
            await product.save();

            return res.status(200).send({ 
                message: "Rented dates updated successfully", 
                rentedDates: product.rentedDates
            });
        } catch (error) {
            console.error("Error updating rented dates:", error);
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }
};

// Delete all rented dates - makes array empty
const deleteRentedDates = {
    validator: async (req, res, next) => {
        const { productId } = req.query;
        if (!productId) {
            return res.status(400).send({ error: "Please provide productId" });
        }
        next();
    },
    controller: async (req, res) => {
        try {
            const { productId } = req.query;
            const { _id: userId } = req.user;

            // Check if product exists and is not deleted for this user
            const product = await Product.findOne({ 
                _id: productId, 
                userId: userId, 
                isDelete: false 
            });

            if (!product) {
                return res.status(404).send({ error: "Product not found or has been deleted" });
            }

            product.rentedDates = [];
            await product.save();

            return res.status(200).send({ 
                message: "Rented dates cleared successfully",
                rentedDates: product.rentedDates
            });
        } catch (error) {
            console.error("Error deleting rented dates:", error);
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }
};

module.exports = { createProduct, getProducts, editProduct, deleteProduct, updateRentedDates, deleteRentedDates };