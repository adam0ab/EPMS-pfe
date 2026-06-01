import mongoose from "mongoose";

let bucket: InstanceType<typeof mongoose.mongo.GridFSBucket> | null = null;

export function getGridFsBucket() {
  if (!bucket) {
    bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db as never, {
      bucketName: "procedureDocuments",
    });
  }
  return bucket;
}
