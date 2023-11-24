const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const chatSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    content: [
      {
        message: { type: String, require: true },
        is_admin: { type: Boolean, require: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
