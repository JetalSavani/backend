const productSchema = require("../Models/product.model")
const categorySchema = require("../Models/catagory.model")
const roleSchema = require("../Models/userRole.model")
const paymentSchema = require("../Models/payment.model")
const enums = require("../utils/enums.json")
const messages = require("../utils/messages.json")
const stripe = require("stripe")

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
			criteria = criteria
		} else if (role === "admin") {
			criteria = { vendorId: req.user._id }
		}
		try {
			const getProduct = await productSchema.find().sort({ "createdAt": -1 }).populate("categoryId")
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
	buyProduct: async (req, res) => {
		try {
			let { type, number, exp_month, exp_year, cvc, amount, currency, confirm, payment_method_types,
				description, address, customerName, postal_code, city, state, country } = req.body;

			let paymentmethod = await stripe.paymentMethods.create({
				type: type,
				card: {
					number: number,
					exp_month: exp_month,
					exp_year: exp_year,
					cvc: cvc,
				},
			});

			let paymentIntent = await stripe.paymentIntents.create({
				payment_method: paymentmethod.id,
				amount: amount * 100,
				currency: currency,
				confirm: confirm,
				payment_method_types: payment_method_types || ["card"],
				shipping: {
					name: customerName,
					address: {
						line1: address,
						postal_code: postal_code,
						city: city,
						state: state,
						country: country,
					},

				},
				description: description,
			});

			return res
				.status(enums.HTTP_CODE.OK)
				.json({ success: true, message: messages.PRODUCT_ADDED, paymentIntent });
		} catch (error) {
			console.log("Error in deleteFood: ", error);
			return apiRes.CATCH_ERROR(res, error.message);
		}
	}

}