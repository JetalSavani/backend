const userSchema = require("../Models/user.model");
const userRoleSchema = require("../Models/userRole.model");
const messages = require("../utils/messages.json");
const enums = require("../utils/enums.json");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const otpGenerator = require('otp-generator')
require("dotenv").config();

module.exports = {
	createUser: async (req, res) => {
		const { email, name, phone, password } = req.body;
		try {
			const userExists = await userSchema.findOne({ email: email });
			if (userExists) {
				return res
					.status(enums.HTTP_CODE.BAD_REQUEST)
					.json({ success: false, message: messages.EMAIL_EXISTS });
			}
			const salt = await bcrypt.genSalt(10);
			const new_pwd = password;
			const hash = await bcrypt.hash(new_pwd, salt);
			const findRole = await userRoleSchema.findOne({ role: "user" });
			if (!findRole) {
				return res
					.status(enums.HTTP_CODE.BAD_REQUEST)
					.json({ success: false, message: messages.ROLE_NOT_FOUND });
			}
			const create = {
				name: name,
				email: email,
				phone: phone,
				password: hash,
				role: findRole._id,
			};
			const savedUser = await userSchema.create(create);
			const data = {
				id: savedUser._id,
				email: savedUser.email,
			};
			const token = jwt.sign(data, process.env.JWT_SECRET);
			return res
				.status(enums.HTTP_CODE.OK)
				.json({ success: true, message: messages.SIGNUP_SUCCESS, token });
		} catch (error) {
			return res
				.status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
				.json({ success: false, message: error.message });
		}
	},
	userLogin: async (req, res) => {
		const { email, password } = req.body;
		try {
			const userData = await userSchema.findOne({ email: email });
			if (!userData) {
				return res
					.status(enums.HTTP_CODE.OK)
					.json({ success: false, message: messages.USER_NOT_FOUND });
			}
			const userPassword = userData.password;
			const new_pwd = password;
			const isMatch = await bcrypt.compare(new_pwd, userPassword);
			if (!isMatch) {
				return res
					.status(enums.HTTP_CODE.BAD_REQUEST)
					.json({ success: false, message: messages.NOT_MATCH });
			}

			const data = {
				id: userData._id,
				email: userData.email,
			};
			const token = jwt.sign(data, process.env.JWT_SECRET);
			return res
				.status(enums.HTTP_CODE.OK)
				.json({ success: true, message: messages.LOGIN_SUCCESS, token });
		} catch (error) {
			return res
				.status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
				.json({ success: false, message: error.message });
		}
	},
	updateUser: async (req, res) => {
		const { id } = req.query;
		const { name, phone } = req.body

		try {
			const findUser = await userSchema.findById({ _id: id });
			if (!findUser) {
				return res
					.status(enums.HTTP_CODE.BAD_REQUEST)
					.json({ success: false, message: messages.USER_NOT_FOUND });
			}
			const obj4update = {
				$set: {
					name: name || findUser.name,
					phone: phone || findUser.phone
				}
			}
			await userSchema.findByIdAndUpdate(
				{ _id: id },
				obj4update,
				{ new: true }
			)
			return res
				.status(enums.HTTP_CODE.OK)
				.json({ success: true, message: messages.UPDATE_SUCCESSFULLY });
		} catch (error) {
			return res
				.status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
				.json({ success: false, message: error.message });
		}
	},
	getAlluser: async (req, res) => {

		const getUser = await userSchema.find()
		try {
			if (getUser.length > 0) {
				return res
					.status(enums.HTTP_CODE.OK)
					.json({ success: true, user: getUser });
			} else {
				return res
					.status(enums.HTTP_CODE.BAD_REQUEST)
					.json({ success: false, message: messages.USER_NOT_FOUND });
			}
		} catch (error) {
			return res
				.status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
				.json({ success: false, message: error.message });
		}
	},
	deleteUser: async (req, res) => {

		const { id } = req.query;

		try {
			await userSchema.findByIdAndDelete({ _id: id })
			return res
				.status(enums.HTTP_CODE.OK)
				.json({ success: false, message: messages.DELETE_SUCCESS });

		} catch (error) {
			return res
				.status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
				.json({ success: false, message: error.message });
		}
	},
	forgetPassword: async (req, res) => {
		const { email } = req.body
		const otp = otpGenerator.generate(6, { digits: true });
	}
};
