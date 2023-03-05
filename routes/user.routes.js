const express = require("express")
const router = express.Router()
const userController = require("../Controller/user.controllers")
const {
    validatation4signup,
    validatation4login
} = require("../utils/joi.validate")

router.post("/create-user", validatation4signup, userController.createUser)
router.post("/login", validatation4login, userController.userLogin)
router.put("/update-user", userController.updateUser)
router.get("/get-all-user", userController.getAlluser)
router.delete("/delete-user", userController.deleteUser)
// router.post("/forgot-password", userController.forgetPassword)
module.exports = router