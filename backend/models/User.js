const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePhoto: { type: String, default: null },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
  refreshToken: { type: String, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model("User", UserSchema);
