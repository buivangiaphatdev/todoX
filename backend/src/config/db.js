import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_CONNECTIONSTRING
    );

    console.log("Connect DB success!!!");
  } catch (error) {
    console.error("Error connect DB");
    process.exit(1); //exit with error
  }
};
