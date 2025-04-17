import mongoose from "mongoose";

const ResponseSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: [true, "Query is required"],
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
    },
    processedData: {
      type: Object,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    sessionId: {
      type: String,
      required: [true, "Session ID is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Check if the model already exists to prevent overwriting it during hot reloads
const ResponseModel =
  mongoose.models.Response || mongoose.model("Response", ResponseSchema);

export default ResponseModel;
