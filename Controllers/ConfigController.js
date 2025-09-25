const Config = require("../Models/Config.js");

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
                    isActive: true
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

module.exports = { addOrUpdateConfig, removeConfig, getConfig, updateConfigStatus };
