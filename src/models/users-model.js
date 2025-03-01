const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: false },
  hash: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  resetToken: { type: String, required: false, default: undefined },
  tokenExpiry: { type: String, required: false, default: undefined },
  mobile: { type: String, required: false },
  goals: { type: Array, default: [] },
  reminders: { type: Array, default: [] },
  role: {type: Number, default: 0} //0 and 1 
});

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.hash;
  }
});
module.exports = mongoose.model("users", userSchema);