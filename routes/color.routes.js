const express = require("express")
const router = express.Router()
const colorController = require("../Controller/color.controllers")
const {
    validatation4addcolor
} = require("../utils/joi.validate")

router.post("/add-color", validatation4addcolor, colorController.addcolor)
router.get("/get-color", colorController.getcolor)
router.delete("/delete-color", colorController.deleteColor)

module.exports = router