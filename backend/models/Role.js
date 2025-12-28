const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
  name: String,
  permissions: Object
});

module.exports = mongoose.model("Role", RoleSchema);
