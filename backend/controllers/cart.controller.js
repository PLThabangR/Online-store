import express from "express"
import Product from "../model/Product.js"


export const addToCart =async(req,res)=>{
    try{ //Get productId from body instead of params
        const {productId} = req.body;
        //Get user from protcted middlware
        const user = req.user;

       ///Check if user has the existing product item usiing productID
       const existingItem = user.cartItems.find(item => item.id===productId);
       //if user has the existing item increment by 1
        if(existingItem){
            existingItem.quantity+=1
        }else{
            //add the product to the cart if it does not exist
            user.cartItems.push(productId)
        }
        //save the user
        await user.save();
        return res.status(200).json({message:"Product added to cart"});
    }catch(error){
        console.log("Error in addToCart controller",error.message)
        return res.status(500).json({message:"Internal server error"});
    }

}

export const removeAllFromCart =async(req,res)=>{
   //Get the product id of the product we want to delete
   const {productId} = req.body;
   //Get user from protcted middlware it has checked that this user is authenticated
   const user = req.user;
    try {
        //Check if product ID is provided
        if(!productId){
            //Return the cart item as it is
           user.cartItems=[];

        }else{
            //filter out the product from the cart items using filter method
            user.cartItems = user.cartItems.filter(item => item.id !== productId);
        }
        //save the user to the database
        await user.save();
        //return the response
        return res.status(200).json({message:"Product removed from cart"});

    } catch (error) {
        console.log("Error in removeFromCart controller",error.message)
        return res.status(500).json({message:"Internal server error"});
    }
}

export const updateQuantity =async(req,res)=>{
    try {

        const {id:productId} = req.params;
        const {quantity} = req.body;
        const user = req.user;

        if(existingItem){
            //The quantity from user is zero remove the product from the cart
            if(quantity===0){
             user.cartItems = user.cartItems.filter(item => item.id !== productId);
                await user.save();
             return res.status(200).json({message:"Product removed from cart"});
            }
            
               
             //Existing is equla to what user sends
                existingItem.quantity = quantity
                await user.save();
                return res.status(200).json({message:"Product quantity updated"});
            
        }else{
            return res.status(404).json({message:"Product not found"});
        }
    } catch (error) {
        
    }
}

export const getAllProducts =async(req,res)=>{
    try {
        //Find all products from the user cart items
        const products = await Product.find({_id:{$in:req.user.cartItems}});
    //Quantity of each product
        //aadd the quantity of the product
        const cartItem = products.map(product => {
            //get items
             const item = req.user.cartItems.map(item => (cartItems=> cartItems.id===product.id))
             //return  aall the products and add the quantity
            return {...product.toJSON,quantity:item.quantity};
        })
        return res.status(200).json({cartitem});   
        
    } catch (error) {
        //error message
        console.log("Error in getAllProducts controller",error.message)
        return res.status(500).json({message:"Internal server error"})
    }
}