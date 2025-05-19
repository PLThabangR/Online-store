
import Product from "../model/Product.js";
import { redis } from  "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";

export const createProduct =async(req,res)=>{
try {
    //Get the data from the request
    const { name, description, price, category, image } = req.body;
//Check if user has entered all the required values
if(!name || !description || !price || !category || !image){
    return res.status(400).json({message:"Fill all required fields"})
}   
    //Upload the image to cloudinary 
let cloudinaryImage = await cloudinary.uploader.upload(image);
//get the image url
imageUrl = cloudinaryImage?.secure_url?cloudinaryImage.secure_url:"";


    //Create a new product
    const product = new Product({
        name,
        description,
        price,
        category,
       image:imageUrl //we send the image url to the mongo database
    });

    //Save the product to the database
    await product.save();

    //json response
   return res.status(201).json({product,message:"Product created successfully"});
} catch (error) {
    
}

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

export const getFeaturedProduct =async(req,res)=>{

try {
    //We ant to cache feature product in the redis database
    //get the feature product from the redis database
    //to find product in redis we use the key feature_product
   let featureProduct = await redis.get("feature_product");

   if(!featureProduct){
    //if the feature product is found return it 
    return res.status(200).json(JSON.parse(featureProduct))
   }

   //if the feature product is not found in the redis database fint it in mongodb
   //learn helps to return javascript objects instead of mongodb objects
   featureProduct = await Product.findOne({isFeatured:true}).lean();//lean to get the data in json format good for performance
   
   if(!featureProduct){
    return res.status(404).json({message:"No feature product found"})
   }

   //Store in redis for quict access
   //set the feature product in the redis database
   await redis.set("feature_product",JSON.stringify(featureProduct));
   //json response
   return res.status(200).json(featureProduct)
} catch (error) {
    return res.status(500).json({message:"Internal server error"})
}





}

export const getSingleProduct =async(req,res)=>{}
export const updateProduct =async(req,res)=>{}
export const deleteProduct =async(req,res)=>{
   
    try {
        // Get product from the database by id
       const product= await Product.findById(req.params.id);

        //If product is not found
        if(!product){
            return res.status(404).json({message:"Product not found"})
        }

        if(product.image){
            //Get the ID of the image so we can delete it
            //We are ggeting the image id  thats y we have 0 as index means we want the first element
            const imageID = product.image.split("/").pop().split(".")[0];
           try {
             //Delete the image from cloudinary 
             //the image will be in the products folder
           
            await cloudinary.uploader.destroy(`products/${imageID}`);
              console.log("Deleting image from cloudinary")
           } catch (error) {
                return res.status(500).json({message:"Error Could not delete image from cloudinary "})
           }
        }
        //Delete the product from the database
        await Product.findByIdAndDelete(req.params.id);

        //json response
        return res.status(200).json({message:"Product deleted successfully"});
    } catch (error) {
        //error message
        return res.status(500).json({message:"Internal server error"});
    }
}


export const getRecommendedProduct =async(req,res)=>{
    //We will be using aggregation pipeline to get the recommended products
    //this functions are similiar like the one's in mysql group by , order by and limit
    //Aggregation pipeline is used to perform complex queries on the data
    //Aggregate function consist of  $match, $project, $sort, $limit ,$sample
    try {
        //Get the category of the product
       const products = await Product.aggregate([
        //We will get 3 random products
        {$sample:{size:3}},
        // $project is used to include, exclude, rename, or compute fields in your output documents
        // We  will project the name,description,price,category,image
        {$project:{name:1,description:1,price:1,category:1,image:1}}
       ])
        //json response
       return res.status(200).json({products})
    }catch(error){
        return res.status(500).json({message:"Internal server error"})
    }
}
export const getProductByCatergory =async(req,res)=>{
    //Get the category of the product
 const category = req.params;
try {
    //find all products by category
    const products = await Product.find({category:category});
    //json response
    return res.status(200).json({products})
} catch (error) {
    //error message
    return res.status(500).json({message:"Internal server error"})
}

}

export const ToggleFeaturedProduct=async(req,res)=>{
 //When we toggle the cache we should be able to add the feature product to the redis database or delete it
try {
     
    const product = await Product.findById(req.params.id);
    //If the product is not found
    if(!product){
        return res.status(404).json({message:"Product not found"})
    }
    //Toggle the isFeatured field
    product.isFeatured = !product.isFeatured;
    //Save the product to the database
   const updatedProduct = await product.save();

    //cal function to update function
    await updateFeaturedProductCache();
    //json response
    return res.status(200).json({updatedProduct,message:"Product updated successfully"})

} catch (error) {
    console.log("Error in toggleFeaturedProduct controller",error.message)
    return res.status(500).json({message:"Internal server error"})
}
}

//Update the feature product cache
const updateFeaturedProductCache =async()=>{
    try {   
        //Find the feature product where isFeatured is true
        const featureProducts = await Product.find({isFeatured:true}).lean();
        //update the featured product in the redis database
        await redis.set("feature_product",JSON.stringify(featureProducts));
        awa
    } catch (error) {
        console.log("Error in updateFeaturedProductCache function",error.message)
        return res.status(500).json({message:"Internal server error"})
    }
}