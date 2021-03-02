const mongoose = require("mongoose");

const name = {
  firstName: String,
  lastName: String,
};

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name,
  email: { type: String, unique: true },
  password: String,
  user_creation_date: Date,
  isActive: {
    type: Boolean,
    default: false,
  },
  secretToken: String,
});

module.exports = mongoose.model("User", userSchema);