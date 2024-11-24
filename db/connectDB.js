import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log(`connected to database ${mongoose.connection.host}`)
    } catch (error) {
        console.log(`erorr while connecting to MongoDB: `, error.message)
        process.exit(1) // error is true
    }
}