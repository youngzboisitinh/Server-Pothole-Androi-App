const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        index: "2dsphere",
      },
    },
    category: {
      type: String,
      enum: ["atm", "restaurant", "park", "hotel", "shop"],
      required: true,
    },
    amenities: [String],
    opening_hours: String,
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    operator: String,
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: String,
    },
    contact: {
      phone: String,
      website: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("place", placeSchema);
