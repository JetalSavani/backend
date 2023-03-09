const express = require("express")
const router = express.Router()
const categoryController = require("../Controller/category.controllers")
const {
    validatation4addcategory,
    validatation4updatecategory
} = require("../utils/joi.validate")

router.post("/add-category",validatation4addcategory, categoryController.addCategory)
router.get("/get-category", categoryController.getCategory)
router.put("/update-category", validatation4updatecategory, categoryController.updateCategory)
router.delete("/delete-category", categoryController.deleteCategory)

module.exports = router