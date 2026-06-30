/**
 * Thumbnail Model
 * Defines the structure for video thumbnail documents in MongoDB
 * A thumbnail represents a preview image for a video
 * Collection name: thumbnails
 */

import mongoose from "mongoose";

/**
 * Thumbnail Schema Definition
 * Stores thumbnail information linked to videos and users
 */
const thumbnailSchema = new mongoose.Schema(
  {
    // Reference to the User who owns this thumbnail
    // ObjectId is MongoDB's unique identifier type
    // ref: "Users" creates a relationship to the Users collection
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users", // Foreign key relationship to Users collection
      required: true, // Every thumbnail must belong to a user
    },
    // Name of the video this thumbnail belongs to
    videoName: {
      type: String,
      required: true, // Video name is mandatory
    },
    // Version number of the thumbnail (optional, for tracking updates)
    version: {
      type: String,
    },
    // URL or path to the thumbnail image file
    image: {
      type: String,
      required: true, // Image path is mandatory
    },
    // Indicates whether this is a paid/premium thumbnail
    // Stores "true" or "false" as string
    paid: {
      type: String,
      required: true, // Payment status must be specified
    },
  },
  // Enable automatic createdAt and updatedAt timestamps for tracking
  { timestamps: true },
);

/**
 * Create and export Thumbnail model
 * "Thumbnails" = collection name in MongoDB (automatically lowercased to "thumbnails")
 * Used for CRUD operations on thumbnail documents
 */
const Thumbnail = mongoose.model("Thumbnails", thumbnailSchema);

export default Thumbnail;
