import mongoose from "mongoose";

const OptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 }, // track votes for this option
});

const QuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: [OptionSchema],
    createdBy: { type: String }, // who created the poll (optional)
    isActive: { type: Boolean, default: true }, // to know if poll is still running
  },
  { timestamps: true }
);

export default mongoose.model("Poll", QuestionSchema);
