const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },

    profilePhoto: {
      type: String,
      required: true, 
    }, 
    // ref: Reference to collection in db
    eventsCreated: [{ type: Schema.Types.ObjectId, ref: "festival" }], 
    favorites: [{type: String }],
  }, 
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const UserModel = model("user", userSchema);

module.exports = UserModel;
