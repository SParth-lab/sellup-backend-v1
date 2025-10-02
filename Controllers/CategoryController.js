const Category = require("../Models/Category.js");
const Config = require("../Models/Config.js");


const createCategory = {
    validator: async (req, res, next) => {
        const { name, colorCode, image, description } = req.body;
        if (!name || !colorCode || !image || !description) {
            return res.status(400).send({error: "Please enter all fields"});
        }
        next();
    },
    controller: async (req, res, next) => {
        try {
            const { name, colorCode, image, subCategories, description } = req.body;
            const categoryData = {
                name,
            colorCode,
            image,
            description
        }
        if (subCategories) {
            categoryData.subCategories = subCategories.map(subCategory => subCategory.trim().toUpperCase());
        }
        const category = await Category.create(categoryData);
            return res.status(200).send({message: "Category created successfully", category});
        } catch (error) {
            console.log("🚀 ~ createCategory --- controller: ~ error:", error)
            return res.status(400).send({error: error.message || "Internal server error"});
        }
    }
}

const getCategories = {
    controller: async (req, res, next) => {
        try {
            // Get all categories
            const categories = await Category.find({ isDelete: false }).lean();

            // Get category order from config
            const config = await Config.findOne({ isDeleted: false }).lean();
            const categoryOrder = config?.categoryOrder || [];

            // Create a map for quick lookup of sort order
            const sortOrderMap = {};
            categoryOrder.forEach(item => {
                sortOrderMap[item.categoryId.toString()] = item.sortOrder;
            });

            // Sort categories based on config order, then by default order
            const sortedCategories = categories.sort((a, b) => {
                const aOrder = sortOrderMap[a._id.toString()];
                const bOrder = sortOrderMap[b._id.toString()];

                // If both have sort order, sort by sort order
                if (aOrder !== undefined && bOrder !== undefined) {
                    return aOrder - bOrder;
                }
                
                // If only one has sort order, prioritize it
                if (aOrder !== undefined) return -1;
                if (bOrder !== undefined) return 1;
                
                // If neither has sort order, maintain original order or sort by creation date
                return new Date(a.createdAt) - new Date(b.createdAt);
            });

            return res.status(200).send({categories: sortedCategories});
        } catch (error) {
            console.log("🚀 ~ getCategories --- controller: ~ error:", error)
            return res.status(400).send({error: error.message || "Internal server error"});
        }
    }

}

module.exports = { createCategory, getCategories };