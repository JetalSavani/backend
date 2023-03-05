const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		name: { type: String },
		email: { type: String },
		password: { type: String },
		phone: { type: Number },
		role: { type: mongoose.Schema.Types.ObjectId, ref: "userRole" },
		isActive:{type: Boolean, default: true}
	},
	{
		timestamps: true,
		versionKey: false,
		autoCreate: true,
	}
);

const newUser = new mongoose.model("user", userSchema, "user");
module.exports = newUser;
