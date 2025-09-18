import mongoose from 'mongoose';
export const connectDB = async (url) => {
    try{
        const con =await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected ${con.connection.host}`);
    }catch(error){
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}
