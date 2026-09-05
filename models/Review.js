const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book reference is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index — one review per user per book
reviewSchema.index({ book: 1, user: 1 }, { unique: true });

/**
 * Static method: recalculate averageRating and numReviews on the Book
 * document after a review is saved or removed.
 */
reviewSchema.statics.updateBookRating = async function (bookId) {
  const Book = require('./Book');

  const stats = await this.aggregate([
    { $match: { book: bookId } },
    {
      $group: {
        _id: '$book',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Book.findByIdAndUpdate(bookId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].numReviews,
    });
  } else {
    // No reviews left — reset to defaults
    await Book.findByIdAndUpdate(bookId, {
      averageRating: 0,
      numReviews: 0,
    });
  }
};

// Trigger rollup after save
reviewSchema.post('save', function () {
  this.constructor.updateBookRating(this.book);
});

// Trigger rollup after findOneAndDelete / deleteOne
reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) {
    doc.constructor.updateBookRating(doc.book);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
