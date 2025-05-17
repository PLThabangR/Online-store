
import Product from "../model/Product.js";

export const createProduct =async(req,res)=>{


}

export const getAllProduct =async(req,res)=>{

    try {
        //Find all products {} geteverything
        const products = await Product.find({});

        if(!products){
            return res.status(404).json({message:"No products found"})
        }
//json response
        return res.status(200).json({products})
    } catch (error) {
        //error message
        return res.status(500).json({message:"Internal server error"})
    }

}