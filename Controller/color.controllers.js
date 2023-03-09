const colorSchema = require("../Models/color.model")
const messages = require("../utils/messages.json")
const enums = require("../utils/enums.json")

module.exports = {

    addcolor: async (req, res) => {

        const { name, categoryId } = req.body

        try {
            const findColor = await colorSchema.findOne({ name: name, categoryId: categoryId })
            if (findColor) {
                return res
                    .status(enums.HTTP_CODE.BAD_REQUEST)
                    .json({ success: false, message: messages.COLOR_EXISTS });
            }

            await colorSchema.create({ name: name, categoryId: categoryId })
            return res
                .status(enums.HTTP_CODE.OK)
                .json({ success: true, message: messages.COLOR_ADDED });
        } catch (error) {
            return res
                .status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
                .json({ success: false, message: error.message });
        }

    },
    getcolor: async (req, res) => {

        const { categoryId } = req.query
        try {
            const findColor = await colorSchema.find({ categoryId: categoryId }).populate('categoryId')
            if (findColor.length > 0) {
                return res
                    .status(enums.HTTP_CODE.OK)
                    .json({ success: true, color: findColor });
            } else {
                return res
                    .status(enums.HTTP_CODE.BAD_REQUEST)
                    .json({ success: false, message: messages.COLOR_NOT_FOUND });
            }
        } catch (error) {
            return res
                .status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
                .json({ success: false, message: error.message });
        }
    },
    deleteColor: async (req, res) => {
        const { id, categoryId } = req.query
        try {
            const findColor = await colorSchema.findOne({ _id: id, categoryId: categoryId })
            if (!findColor) {
                return res
                    .status(enums.HTTP_CODE.BAD_REQUEST)
                    .json({ success: false, message: messages.COLOR_NOT_FOUND });
            }

            await colorSchema.findOneAndDelete({ _id: id, categoryId: categoryId })
            return res
                .status(enums.HTTP_CODE.OK)
                .json({ success: true, message: messages.DELETE_COLOR });
        } catch (error) {
            return res
                .status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
                .json({ success: false, message: error.message });
        }
    }

}