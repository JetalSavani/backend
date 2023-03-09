const categorySchema = require("../Models/catagory.model");
const messages = require("../utils/messages.json");
const enums = require("../utils/enums.json");

module.exports = {

    addCategory: async (req, res) => {

        const { name, description } = req.body
        try {
            const findCategory = await categorySchema.findOne({ name: name })
            if (findCategory) {
                return res
                    .status(enums.HTTP_CODE.BAD_REQUEST)
                    .json({ success: false, message: messages.CATEGORY_EXISTS });
            }

            await categorySchema.create({ name: name, description: description })
            return res
                .status(enums.HTTP_CODE.OK)
                .json({ success: true, message: messages.CATEGORY_ADDED });
        } catch (error) {
            return res
                .status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
                .json({ success: false, message: error.message });
        }
    },
    getCategory: async (req, res) => {

        try {

            const allCategory = await categorySchema.find()
            if (allCategory.length > 0) {
                return res
                    .status(enums.HTTP_CODE.OK)
                    .json({ success: true, category: allCategory });
            } else {
                return res
                    .status(enums.HTTP_CODE.BAD_REQUEST)
                    .json({ success: false, message: messages.CATEGORY_NOT_FOUND });
            }

        } catch (error) {
            return res
                .status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
                .json({ success: false, message: error.message });
        }
    },
    updateCategory: async (req, res) => {
        const { id } = req.query

        try {

            const { name, description } = req.body
            const findCategory = await categorySchema.findById({ _id: id })
            if (!findCategory) {
                return res
                    .status(enums.HTTP_CODE.BAD_REQUEST)
                    .json({ success: false, message: messages.CATEGORY_NOT_FOUND });
            }
            const obj4update = {
                $set: {
                    name: name,
                    description: description
                }
            }
            await categorySchema.findByIdAndUpdate(
                { _id: id },
                obj4update,
                { new: true }
            )
            return res
                .status(enums.HTTP_CODE.OK)
                .json({ success: true, message: messages.CATEGORY_UPDATED });
        } catch (error) {
            return res
                .status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
                .json({ success: false, message: error.message });
        }
    },
    deleteCategory: async (req, res) => {
        const { id } = req.query

        try {
            const findCategory = await categorySchema.findById({ _id: id })
            if (!findCategory) {
                return res
                    .status(enums.HTTP_CODE.BAD_REQUEST)
                    .json({ success: false, message: messages.CATEGORY_NOT_FOUND });
            }

            await categorySchema.findByIdAndDelete(
                { _id: id },
                { $set: { isActive: false } },
                { new: true }
            )
            return res
                .status(enums.HTTP_CODE.OK)
                .json({ success: true, message: messages.CATEGORY_DELETED });
        } catch (error) {
            return res
                .status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
                .json({ success: false, message: error.message });
        }
    }

}