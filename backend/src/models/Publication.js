import mongoose from 'mongoose';

const publicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Publication name is required'],
      trim: true,
      maxlength: [100, 'Publication name cannot exceed 100 characters']
    },
    slug: {
      type: String,
      required: [true, 'Publication slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
    },
    description: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
      maxlength: [280, 'Description cannot exceed 280 characters']
    },
    about: {
      type: String,
      trim: true,
      default: ''
    },
    logoUrl: {
      type: String,
      trim: true,
      default: ''
    },
    coverImageUrl: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'General'
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    subscriberCount: {
      type: Number,
      default: 0
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const Publication = mongoose.model('Publication', publicationSchema);
export default Publication;
