const mongoose = require("mongoose");
var AutoIncrement = require("mongoose-sequence")(mongoose);
const colorSchema = mongoose.Schema({
  color_id: {
    type: Number,
  },
  color_name: { type: String },
});
colorSchema.plugin(AutoIncrement, { inc_field: "color_id" });



module.exports = mongoose.model("colors", colorSchema);
