import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

categorySchema.index({ userId: 1, slug: 1 }, { unique: true });

export default mongoose.model("Category", categorySchema);
