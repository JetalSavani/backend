const productSchema = require("../Models/product.model")
const categorySchema = require("../Models/catagory.model")
const orderSchema = require("../Models/order.model")
const enums = require("../utils/enums.json")
const messages = require("../utils/messages.json")
const ObjectId = require("mongoose").Types.ObjectId
const Stripe = require("stripe")
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
require("dotenv").config()

module.exports = {

	addProduct: async (req, res) => {
		try {
			const category = await categorySchema.findById({ _id: req.body.categoryId })
			if (!category) {
				return res
					.status(enums.HTTP_CODE.BAD_REQUEST)
					.json({ success: false, message: messages.CATEGORY_NOT_FOUND });
			}
			const create = await productSchema.create({ ...req.body, vendorId: req.user._id })
			return res
				.status(enums.HTTP_CODE.OK)
				.json({ success: true, message: messages.PRODUCT_ADDED, create });
		} catch (error) {
			return res
				.status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
				.json({ success: false, message: error.message });
		}
	},
	getProduct: async (req, res) => {
		const role = req.user.role.role
		let criteria = {}
		if (role === "superAdmin") {
			if (req.query.status == 'Rejected') {
				criteria = { status: "Rejected" }
			} else if (req.query.status == 'Approved') {
				criteria = { status: "Approved" }
			} else {
				criteria = { status: "Pending" }
			}
		} else if (role === "vendor") {
			if (req.query.id) {
				if (req.query.status == 'Rejected') {
					criteria = { status: "Rejected" }
				} else if (req.query.status == 'Approved') {
					criteria = { status: "Approved" }
				} else {
					criteria = { status: "Pending" }
				}
				criteria = { ...criteria, vendorId: new ObjectId(req.query.id) }
			} else {
				criteria = { isPurchase: false, status: "Approved", vendorId: { $ne: req.user._id } }
			}
		} else if (role === "user") {
			criteria = { isPurchase: false, status: "Approved", vendorId: { $ne: req.user._id } }
		}
		try {
			const getProduct = await productSchema.aggregate([
				{
					$match: criteria
				},
				{
					$lookup: {
						from: "category",
						localField: "categoryId",
						foreignField: "_id",
						as: "categoryId",
					},
				},
				{
					$unwind: {
						path: "$categoryId",
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$lookup: {
						from: "user",
						localField: "vendorId",
						foreignField: "_id",
						as: "vendorId",
					},
				},
				{
					$unwind: {
						path: "$vendorId",
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$sort: {
						createdAt: -1,
					},
				},
			])
			return res
				.status(enums.HTTP_CODE.OK)
				.json({ success: true, product: getProduct });
		} catch (error) {
			return res
				.status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
				.json({ success: false, message: error.message });
		}
	},
	updateProduct: async (req, res) => {
		try {
			const product = await productSchema.findByIdAndUpdate(
				req.query.id,
				req.body,
				{ new: true }
			)
			return res
				.status(enums.HTTP_CODE.OK)
				.json({ success: true, product });
		} catch (error) {
			return res
				.status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
				.json({ success: false, message: error.message });
		}
	},
	deleteProduct: async (req, res) => {
		try {
			const product = await productSchema.findByIdAndDelete(req.query.id)
			return res
				.status(enums.HTTP_CODE.OK)
				.json({ success: true, product });
		} catch (error) {
			return res
				.status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
				.json({ success: false, message: error.message });
		}
	},
	updateProductStatus: async (req, res) => {
		const { id, status } = req.query
		const product = await productSchema.findById(id)
		if (!product) {
			return res
				.status(enums.HTTP_CODE.BAD_REQUEST)
				.json({ success: false, message: messages.PRODUCT_NOT_FOUND });
		}
		try {
			const updateProductStatus = await productSchema.findByIdAndUpdate(
				id,
				{ $set: { status: status } },
				{ new: true }
			)
			return res
				.status(enums.HTTP_CODE.OK)
				.json({ success: true, product: updateProductStatus });
		} catch (error) {
			return res
				.status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
				.json({ success: false, message: error.message });
		}
	},
	buyProduct: async (req, res) => {
		console.log(req.body)
		try {
			const session = await stripe.checkout.sessions.create({
				line_items: [
					{
						price_data: {
							currency: 'inr',
							product_data: {
								name: req.body.name,
								images: [req.body.image],
							},
							unit_amount: req.body.price * 100,
						},
						quantity: req.body.quntity,
					},
				],
				mode: 'payment',
				success_url: `http://localhost:3000/checkoutSuccess?id=${req.body.id}`,
				cancel_url: 'http://localhost:3000/Addtocart',
			});
			return res
				.status(enums.HTTP_CODE.OK)
				.json({ success: true, data: session.url });
		} catch (error) {
			console.log(error)
			return res
				.status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
				.json({ success: false, message: error.message });
		}
	},
	orderSuccess: async (req, res) => {
		try {
			const product = await productSchema.findByIdAndUpdate(
				req.query.id,
				{ $set: { isPurchase: true } },
				{ new: true }
			)
			const order = await orderSchema.findOne({ productId: req.query.id })
			if (!order) {
				await orderSchema.create({
					vendorId: product.vendorId,
					userId: req.user._id,
					productId: product._id
				})
			}
			return res
				.status(enums.HTTP_CODE.OK)
				.json({ success: true, message: messages.SUCCESS });
		} catch (error) {
			return res
				.status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
				.json({ success: false, message: error.message });
		}
	},
	getProductCounter: async (req, res) => {
		try {
			const counter = await productSchema.aggregate([
				{
					$match: {
						vendorId: req.user._id
					},
				},
				{
					$group: {
						_id: "$status",
						count: {
							$sum: 1,
						},
					},
				}
			])

			const count = {
				Approved: 0,
				Pending: 0,
				Rejected: 0
			}
			for (i = 0; i < counter.length; i++) {
				if (counter[i]._id === 'Approved') count.Approved = counter[i].count
				else if (counter[i]._id === 'Pending') count.Pending = counter[i].count
				else if (counter[i]._id === 'Rejected') count.Rejected = counter[i].count
			}

			const buyCounter = await orderSchema.find({ isPurchase: true, vendorId: req.user._id }).countDocuments()
			return res
				.status(enums.HTTP_CODE.OK)
				.json({ success: true, statusCounter: count, buyCounter: buyCounter });
		} catch (error) {
			return res
				.status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
				.json({ success: false, message: error.message });
		}
	},
	getProductById: async (req, res) => {
		try {
			const product = await productSchema.findById(req.query.id)
			return res
				.status(enums.HTTP_CODE.OK)
				.json({ success: true, product: product });
		} catch (error) {
			return res
				.status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
				.json({ success: false, message: error.message });
		}
	},
	getUserProduct: async (req, res) => {
		const criteria = { isPurchase: false, status: "Approved" }
		try {
			const getProduct = await productSchema.aggregate([
				{
					$match: criteria
				},
				{
					$lookup: {
						from: "category",
						localField: "categoryId",
						foreignField: "_id",
						as: "categoryId",
					},
				},
				{
					$unwind: {
						path: "$categoryId",
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$lookup: {
						from: "user",
						localField: "vendorId",
						foreignField: "_id",
						as: "vendorId",
					},
				},
				{
					$unwind: {
						path: "$vendorId",
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$sort: {
						createdAt: -1,
					},
				},
			])
			return res
				.status(enums.HTTP_CODE.OK)
				.json({ success: true, product: getProduct });
		} catch (error) {
			return res
				.status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
				.json({ success: false, message: error.message });
		}
	},
	getOrder: async (req, res) => {
        try {
            const role = req.user.role.role
            let criteria = { userId: req.user._id }
            if (role == "superAdmin") criteria = {}
            const getOrder = await orderSchema.aggregate([
                { $match: criteria },
                {
                    $lookup: {
                        from: "product",
                        localField: "productId",
                        foreignField: "_id",
                        as: "productId",
                    },
                },
                {
                    $unwind: {
                        path: "$productId",
                        preserveNullAndEmptyArrays: true,
                    },
                },
				{
                    $lookup: {
                        from: "category",
                        localField: "productId.categoryId",
                        foreignField: "_id",
                        as: "category",
                    },
                },
                {
                    $unwind: {
                        path: "$category",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $lookup: {
                        from: "user",
                        localField: "vendorId",
                        foreignField: "_id",
                        as: "vendorId",
                    },
                },
                {
                    $unwind: {
                        path: "$vendorId",
                        preserveNullAndEmptyArrays: true,
                    },
                }
            ])
            return res
                .status(enums.HTTP_CODE.OK)
                .json({ success: true, message: messages.SUCCESS, getOrder: getOrder });
        } catch (error) {
            return res
                .status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
                .json({ success: false, message: error.message });
        }
    }

}