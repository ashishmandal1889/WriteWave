import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      default: null,
      index: true
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate likes per user per article
likeSchema.index(
  { user: 1, article: 1 },
  { unique: true, partialFilterExpression: { article: { $type: 'objectId' } } }
);

// Prevent duplicate likes per user per comment
likeSchema.index(
  { user: 1, comment: 1 },
  { unique: true, partialFilterExpression: { comment: { $type: 'objectId' } } }
);

export const Like = mongoose.model('Like', likeSchema);
export default Like;
