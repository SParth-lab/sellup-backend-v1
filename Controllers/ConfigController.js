const Config = require("../Models/Config.js");
const Category = require("../Models/Category.js");

const addOrUpdateConfig = {
    validator: async (req, res, next) => {
        const { googleAdsUnitId, isAdEnable } = req.body;
        if (!googleAdsUnitId || isAdEnable === undefined) {
            return res.status(400).send({ error: "Google Ads Unit ID and isAdEnable are required" });
        }
        next();
    },
    controller: async (req, res) => {
        try {
            const { googleAdsUnitId, isAdEnable } = req.body;
            
            // Check if config already exists (we only want one config document)
            let config = await Config.findOne({ isDeleted: false });
            
            if (config) {
                // Update existing config
                config.googleAdsUnitId = googleAdsUnitId;
                config.isActive = true;
                if (isAdEnable !== undefined) {
                    config.isAdEnable = isAdEnable;
                }
                await config.save();
                
                return res.status(200).send({ 
                    message: "Config updated successfully", 
                    config 
                });
            } else {
                // Create new config
                config = await Config.create({
                    googleAdsUnitId,
                    isActive: true,
                    isAdEnable: isAdEnable ?? true
                });

                return res.status(201).send({ 
                    message: "Config created successfully", 
                    config 
                });
            }
        } catch (error) {
            console.error('Error creating/updating config:', error);
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }
};

const removeConfig = {
    validator: async (req, res, next) => {
        next();
    },
    controller: async (req, res) => {
        try {
            // Find and soft delete the config
            const config = await Config.findOneAndUpdate(
                { isDeleted: false }, 
                { isDeleted: true, isActive: false }, 
                { new: true }
            );

            if (!config) {
                return res.status(404).send({ error: "Config not found" });
            }

            return res.status(200).send({ 
                message: "Config removed successfully", 
                config 
            });
        } catch (error) {
            console.error('Error removing config:', error);
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }
};

const getConfig = {
    validator: async (req, res, next) => {
        next();
    },
    controller: async (req, res) => {
        try {
            // Get active config
            const config = await Config.findOne({ 
                isDeleted: false, 
                isActive: true 
            }).lean();

            if (!config) {
                return res.status(200).send({ 
                    message: "No config found", 
                    config: null 
                });
            }

            return res.status(200).send({ 
                message: "Config fetched successfully", 
                config 
            });
        } catch (error) {
            console.error('Error fetching config:', error);
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }
};

const updateConfigStatus = {
    validator: async (req, res, next) => {
        const { isActive } = req.body;
        if (isActive === undefined) {
            return res.status(400).send({ error: "isActive status is required" });
        }
        next();
    },
    controller: async (req, res) => {
        try {
            const { isActive } = req.body;
            
            const config = await Config.findOneAndUpdate(
                { isDeleted: false }, 
                { isActive }, 
                { new: true }
            );

            if (!config) {
                return res.status(404).send({ error: "Config not found" });
            }

            return res.status(200).send({ 
                message: "Config status updated successfully", 
                config 
            });
        } catch (error) {
            console.error('Error updating config status:', error);
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }
};

const setCategoryOrder = {
    validator: async (req, res, next) => {
        const { categoryOrder } = req.body;
        if (!categoryOrder || !Array.isArray(categoryOrder)) {
            return res.status(400).send({ error: "categoryOrder array is required" });
        }
        
        // Validate each category order object
        for (let item of categoryOrder) {
            if (!item.categoryId || typeof item.sortOrder !== 'number') {
                return res.status(400).send({ error: "Each category order must have categoryId and sortOrder" });
            }
        }
        next();
    },
    controller: async (req, res) => {
        try {
            const { categoryOrder } = req.body;
            
            // Verify all category IDs exist
            const categoryIds = categoryOrder.map(item => item.categoryId);
            const existingCategories = await Category.find({ _id: { $in: categoryIds }, isDelete: false });
            
            if (existingCategories.length !== categoryIds.length) {
                return res.status(400).send({ error: "One or more category IDs are invalid" });
            }
            
            // Get or create config
            let config = await Config.findOne({ isDeleted: false });
            
            if (config) {
                config.categoryOrder = categoryOrder;
                await config.save();
            } else {
                config = await Config.create({ categoryOrder });
            }
            
            return res.status(200).send({ 
                message: "Category order set successfully", 
                categoryOrder: config.categoryOrder 
            });
        } catch (error) {
            console.error('Error setting category order:', error);
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }
};

const getCategoryOrder = {
    validator: async (req, res, next) => {
        next();
    },
    controller: async (req, res) => {
        try {
            const config = await Config.findOne({ 
                isDeleted: false 
            }).populate('categoryOrder.categoryId', 'name description colorCode image isOtherCategory').lean();
            
            const categoryOrder = config?.categoryOrder || [];
            
            return res.status(200).send({ 
                message: "Category order fetched successfully", 
                categoryOrder 
            });
        } catch (error) {
            console.error('Error fetching category order:', error);
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }
};

const updateCategoryOrder = {
    validator: async (req, res, next) => {
        const { categoryId, sortOrder } = req.body;
        if (!categoryId || typeof sortOrder !== 'number') {
            return res.status(400).send({ error: "categoryId and sortOrder are required" });
        }
        next();
    },
    controller: async (req, res) => {
        try {
            const { categoryId, sortOrder } = req.body;
            
            // Verify category exists
            const category = await Category.findOne({ _id: categoryId, isDelete: false });
            if (!category) {
                return res.status(404).send({ error: "Category not found" });
            }
            
            // Get or create config
            let config = await Config.findOne({ isDeleted: false });
            
            if (!config) {
                config = await Config.create({ categoryOrder: [] });
            }
            
            // Find existing category order or add new one
            const existingIndex = config.categoryOrder.findIndex(
                item => item.categoryId.toString() === categoryId
            );
            
            if (existingIndex >= 0) {
                config.categoryOrder[existingIndex].sortOrder = sortOrder;
            } else {
                config.categoryOrder.push({ categoryId, sortOrder });
            }
            
            await config.save();
            
            return res.status(200).send({ 
                message: "Category order updated successfully", 
                categoryOrder: config.categoryOrder 
            });
        } catch (error) {
            console.error('Error updating category order:', error);
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }
};

module.exports = { addOrUpdateConfig, removeConfig, getConfig, updateConfigStatus, setCategoryOrder, getCategoryOrder, updateCategoryOrder };
