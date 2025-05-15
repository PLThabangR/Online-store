import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import User from "../model/User.js";

export const signup = async(req,res)=>{
//destructure data from body
const { name, email, password } = req.body;

try {

    //check if user has filled all the required values
    if(!name || !email || !password){
        return res.status(404).json({ message: "Fill all required fields" });
    }
    
//check if user exist 
const existingUser = await User.findOne({ name });
		if (existingUser) {
			return res.status(400).json({ message: "Name is already taken" });
		}

        //Check if email follows correct email pattern
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ message: "Invalid email format" });
		}

        //check if email is taken or not
        const existingEmail = await User.findOne({ email });
		if (existingEmail) {
			return res.status(400).json({ message: "Email is already taken" });
		}

        //Password must be greater than 6
        if (password.length < 6) {
			return res.status(400).json({ message: "Password must be at least 6 characters long" });
		}

        //Hash user paswword
        const salt = await bcrypt.genSalt(10)
        const hashedPassword= await bcrypt.hash(password,salt)

        //Create new user
        const newUser = new User({
			name,
			email,
			password: hashedPassword
		});
        //Save use to the db
        await newUser.save();
        //give resopnse to the request
      if(newUser){
          res.status(201).json({
            _id: newUser._id,
            name:newUser.name,
            email: newUser.email,
            password:newUser.password,
            message:"User created succesfully"
        })
      }else{
          res.status(400).json({ message: "Invalid user data" });
      }

} catch (error) {
    res.status(400).json({ message: "Internal server error" });
}
}

export const login = async(req,res)=>{
res.send("Login")
    

}

export const logout =async (req,res)=>{
res.send("Logout")
    
//JD5UFXXNFOcoxf8F
}
