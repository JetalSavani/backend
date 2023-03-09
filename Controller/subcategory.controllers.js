const subcategorySchema = require("../Models/subcatagory.model");
const messages = require("../utils/messages.json");
const enums = require("../utils/enums.json");

module.exports = {

    addsubCategory: async (req, res) => {

        const { name, categoryId } = req.body
        try {
            const findsubCategory = await subcategorySchema.findOne({ name: name, categoryId: categoryId })
            if (findsubCategory) {
                return res
                    .status(enums.HTTP_CODE.BAD_REQUEST)
                    .json({ success: false, message: messages.SUBCATEGORY_EXISTS });
            }

            await subcategorySchema.create({ name: name, categoryId: categoryId })
            return res
                .status(enums.HTTP_CODE.OK)
                .json({ success: true, message: messages.SUBCATEGORY_ADDED });
        } catch (error) {
            return res
                .status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
                .json({ success: false, message: error.message });
        }
    },
    getsubCategory: async (req, res) => {

        try {

            const allsubCategory = await subcategorySchema.find()
            if (allsubCategory.length > 0) {
                return res
                    .status(enums.HTTP_CODE.OK)
                    .json({ success: true, subcategory: allsubCategory });
            } else {
                return res
                    .status(enums.HTTP_CODE.BAD_REQUEST)
                    .json({ success: false, message: messages.SUBCATEGORY_NOT_FOUND });
            }

        } catch (error) {
            return res
                .status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
                .json({ success: false, message: error.message });
        }
    },
    updatesubCategory: async (req, res) => {
        const { id } = req.query

        try {

            const { name } = req.body
            const findCategory = await subcategorySchema.findById({ _id: id })
            if (!findCategory) {
                return res
                    .status(enums.HTTP_CODE.BAD_REQUEST)
                    .json({ success: false, message: messages.SUBCATEGORY_NOT_FOUND });
            }
            const obj4update = {
                $set: {
                    name: name
                }
            }
            await subcategorySchema.findByIdAndUpdate(
                { _id: id },
                obj4update,
                { new: true }
            )
            return res
                .status(enums.HTTP_CODE.OK)
                .json({ success: true, message: messages.SUBCATEGORY_UPDATED });
        } catch (error) {
            return res
                .status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
                .json({ success: false, message: error.message });
        }
    },
    deletesubCategory: async (req, res) => {
        const { id } = req.query

        try {
            const findCategory = await subcategorySchema.findById({ _id: id })
            if (!findCategory) {
                return res
                    .status(enums.HTTP_CODE.BAD_REQUEST)
                    .json({ success: false, message: messages.SUBCATEGORY_NOT_FOUND });
            }

            await subcategorySchema.findByIdAndDelete(
                { _id: id },
                { $set: { isActive: false } },
                { new: true }
            )
            return res
                .status(enums.HTTP_CODE.OK)
                .json({ success: true, message: messages.SUBCATEGORY_DELETED });
        } catch (error) {
            return res
                .status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
                .json({ success: false, message: error.message });
        }
    }

}