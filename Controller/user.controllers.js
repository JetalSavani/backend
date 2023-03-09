const userSchema = require("../Models/user.model");
const userRoleSchema = require("../Models/userRole.model");
const messages = require("../utils/messages.json");
const enums = require("../utils/enums.json");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const EventEmitter = require('events')
const { mailService } = require("../utils/mail-service")
const otpGenerator = require('otp-generator')
const event = new EventEmitter()

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
			await userSchema.create(create);
			return res
				.status(enums.HTTP_CODE.OK)
				.json({ success: true, message: messages.SIGNUP_SUCCESS });
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
				.json({ success: true, message: messages.LOGIN_SUCCESS, token, user: userData });
		} catch (error) {
			return res
				.status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
				.json({ success: false, message: error.message });
		}
	},
	updateUser: async (req, res) => {
		const user = req.user;
		const { name, phone, address, city, state, pincode, country } = req.body

		try {
			const findUser = await userSchema.findById({ _id: user._id });
			if (!findUser) {
				return res
					.status(enums.HTTP_CODE.BAD_REQUEST)
					.json({ success: false, message: messages.USER_NOT_FOUND });
			}
			const obj4update = {
				$set: {
					name: name || findUser.name,
					phone: phone || findUser.phone,
					address: address || findUser.address,
					city: city || findUser.city,
					state: state || findUser.state,
					pincode: pincode || findUser.pincode,
					country: country || findUser.country
				}
			}
			const updateUser = await userSchema.findByIdAndUpdate(
				{ _id: user._id },
				req.body,
				{ new: true }
			)
			console.log("updateUser", updateUser)
			return res
				.status(enums.HTTP_CODE.OK)
				.json({ success: true, message: messages.UPDATE_SUCCESSFULLY, user: updateUser });
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
			await userSchema.findByIdAndUpdate(
				{ _id: id },
				{ isActive: false },
				{ new: true }
			)
			return res
				.status(enums.HTTP_CODE.OK)
				.json({ success: true, message: messages.DELETE_SUCCESS });

		} catch (error) {
			return res
				.status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
				.json({ success: false, message: error.message });
		}
	},
	forgotPassword: async (req, res) => {
		const { email } = req.body
		try {

			const findUser = await userSchema.findOne({ email: email });
			if (!findUser) {
				return res
					.status(enums.HTTP_CODE.BAD_REQUEST)
					.json({ success: false, message: messages.USER_NOT_FOUND });
			}
			const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
			await userSchema.findByIdAndUpdate(
				{ _id: findUser._id },
				{ $set: { otp: otp } },
				{ new: true }
			)
			const maildata = {
				to: email,
				subject: "Animalll | Forgot your password",
				otp: otp
			}

			mailService(maildata)
			event.emit('OTP expire', findUser)
			return res
				.status(enums.HTTP_CODE.OK)
				.json({ success: true, message: messages.EMAIL_SEND });
		} catch (error) {
			return res
				.status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
				.json({ success: false, message: error.message });
		}
	},
	verifyOTP: async (req, res) => {
		const { otp, email } = req.body

		try {
			const findUser = await userSchema.findOne({ email: email })
			if (!findUser) {
				return res
					.status(enums.HTTP_CODE.BAD_REQUEST)
					.json({ success: false, message: messages.USER_NOT_FOUND });
			}

			if (otp !== findUser.otp) {
				return res
					.status(enums.HTTP_CODE.BAD_REQUEST)
					.json({ success: false, message: messages.OTP_NOT_MATCH });
			}

			return res
				.status(enums.HTTP_CODE.OK)
				.json({ success: true, message: messages.OTP_MATCH });
		} catch (error) {
			return res
				.status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
				.json({ success: false, message: error.message });
		}
	},
	verifyPassword: async (req, res) => {
		const { password, email } = req.body

		try {
			const findUser = await userSchema.findOne({ email: email })
			if (!findUser) {
				return res
					.status(enums.HTTP_CODE.BAD_REQUEST)
					.json({ success: false, message: messages.USER_NOT_FOUND });
			}

			const salt = await bcrypt.genSalt(10);
			const new_pwd = password;
			const hash = await bcrypt.hash(new_pwd, salt);

			await userSchema.findByIdAndUpdate(
				{ _id: findUser._id },
				{ $set: { password: hash } },
				{ new: true }
			)
			return res
				.status(enums.HTTP_CODE.OK)
				.json({ success: true, message: messages.PASSWORD_CHANGE });
		} catch (error) {
			return res
				.status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
				.json({ success: false, message: error.message });
		}
	},
	addRole: async (req, res) => {

		const { role } = req.body

		try {

			await userRoleSchema.create({ role: role })
			return res
				.status(enums.HTTP_CODE.OK)
				.json({ success: true, message: messages.ROLE_ADDED });
		} catch (error) {
			return res
				.status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
				.json({ success: false, message: error.message });
		}
	},
	changePassword: async (req, res) => {
		const { email, oldPassword, newPassword } = req.body

		try {
			const findUser = await userSchema.findOne({ email: email })
			if (!findUser) {
				return res
					.status(enums.HTTP_CODE.BAD_REQUEST)
					.json({ success: false, message: messages.USER_NOT_FOUND });
			}

			const nPassword = findUser.password
			const isMatch = await bcrypt.compare(oldPassword, nPassword);
			if (!isMatch) {
				return res
					.status(enums.HTTP_CODE.BAD_REQUEST)
					.json({ success: false, message: messages.OLD_PASSWORD_WRONG });
			}

			const salt = await bcrypt.genSalt(10);
			const new_pwd = newPassword;
			const hash = await bcrypt.hash(new_pwd, salt);
			await userSchema.findByIdAndUpdate(
				{ _id: findUser._id },
				{ $set: { password: hash } },
				{ new: true }
			)

			return res
				.status(enums.HTTP_CODE.OK)
				.json({ success: true, message: messages.PASSWORD_CHANGE });

		} catch (error) {
			return res
				.status(enums.HTTP_CODE.INTERNAL_SERVER_ERROR)
				.json({ success: false, message: error.message });
		}
	}
};

event.on('OTP expire', (user) => {
	setTimeout(async () => {
		await userSchema.findByIdAndUpdate(
			{ _id: user._id },
			{ $set: { otp: null } },
			{ new: true }
		)
	}, 60000)
})
