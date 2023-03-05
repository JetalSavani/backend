const express = require("express")
const router = express.Router()
const userController = require("../Controller/user.controllers")
const {
    validatation4signup,
    validatation4login,
    validatation4update,
    validatation4forgot
} = require("../utils/joi.validate")

router.post("/create-user", validatation4signup, userController.createUser)
router.post("/login", validatation4login, userController.userLogin)
router.put("/update-user", validatation4update, userController.updateUser)
router.get("/get-all-user", userController.getAlluser)
router.delete("/delete-user", userController.deleteUser)
router.post("/forgot-password", validatation4forgot, userController.forgotPassword)
module.exports = router