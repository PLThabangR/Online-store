import mongoose from "mongoose";


export const connectDb =async()=>{
    try{
  const conn=  await mongoose.connect(process.env.MONGO_URL)
  console.log(`mongo db connected: ${conn.connection.host}`)
}catch(error){
    console.log("Error connecting to MONGODB", error.message)
    //this shows failure in connecting
    process.exit(1)
}
}