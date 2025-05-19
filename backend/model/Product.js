import mongoose from "mongoose";


//create product schema
const  productSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name is required"]
    },
    description:{
        type:String,
        required:[true,"Description is required"]
    },
    
    price:{
        type:Number,
        required:[true,"Price is required"]
    },image:{
        type:String,
        required:[true,"Image is required"]
    },category:{
        type:String,
        required:true
    },isFeatured:{
        type:Boolean,
        default:false
    }



},{
    timestamps:true 
})

//cretae the model
const Product = mongoose.model("Product",productSchema);
export default Product