import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    subscriberEmail: {
      type: String,
      required: [true, 'Subscriber email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
    },
    publication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Publication',
      required: true,
      index: true
    },
    subscriberUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: ['active', 'unsubscribed'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate subscriptions to the same publication
subscriptionSchema.index({ subscriberEmail: 1, publication: 1 }, { unique: true });

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
