
const mongoose = require("mongoose");
var AutoIncrement = require("mongoose-sequence")(mongoose);

const catagorySchema = mongoose.Schema({
  c_id: {
    type: Number,
  },
  c_name: { 
    type: String },
});

catagorySchema.plugin(AutoIncrement, { inc_field: "c_id" });

module.exports = mongoose.model("catagories", catagorySchema);