const Category = require("../Models/Category.js");


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
            const categories = await Category.find().lean();

        return res.status(200).send({categories});
        } catch (error) {
            console.log("🚀 ~ getCategories --- controller: ~ error:", error)
            return res.status(400).send({error: error.message || "Internal server error"});
        }
    }

}

module.exports = { createCategory, getCategories };