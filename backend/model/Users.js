import { mongoose, Types } from "mongoose";


//create schema

const userSchema=new mongoose.Schema({
name:{
    type:String,
    required:[true,"Name is required"]
},
email:{
    type:String,
    required:[true,"Email is required"],
    unique:true,
    lowercase:true,
    trim:true

},
password:{
    type:String,
    required:[true,"Password is required"],
    minlength:[6,"Password must be at least 6 characters long"]
},
cartItems:[
    {
        quantity:{
            type:Number,
            default:1
        },
        product:{
            type:mongoose.Schema.Types.ObjectId, //mongo db id primary key in the User product 
            ref:"Product" //Refrencing the product table
        }
    }
],
role:{
    type:String,
    enum:["customer","admin"],
    default:"customer"
}


},
{
    timestamps:true
})

//Creater a  model
const User = mongoose.model("User",userSchema)
//Export for external usage
export default User;