const express = require("express")
const router = express.Router()
const subCategoryController = require("../Controller/subcategory.controllers")
const {
    validatation4addsubcategory,
    validatation4updatesubcategory
} = require("../utils/joi.validate")

router.post("/add-subcategory",validatation4addsubcategory, subCategoryController.addsubCategory)
router.get("/get-subcategory", subCategoryController.getsubCategory)
router.put("/update-subcategory", validatation4updatesubcategory, subCategoryController.updatesubCategory)
router.delete("/delete-subcategory", subCategoryController.deletesubCategory)

module.exports = router