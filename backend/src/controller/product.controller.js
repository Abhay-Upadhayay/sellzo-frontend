const productModel = require('../models/product.model');
const imagekit = require('../services/imagekit');

module.exports.createProductController = async (req,res) =>{
    try {
        
        const {title , category , discription, price , forWhom} = req.body;
        const media = req.files;
        let imagesUrl = [];

        if(!title || title.length<1){
            res.status(401).json({message : "Title is required"});
            return;
        }
        if((!price )||price <= -1){
            res.status(401).json({ message: "Price is required" });
            return;
        }
        if(!discription || discription.length<1){
            res.status(401).json({ message: "Discription is required" });
            return;
        }
        if(!category){
            res.status(401).json({ message: "Category is required" });
            return;
        }
        if(!forWhom){
            res.status(401).json({ message: "For field is required" });
            return;
        }


        if(!media || media.length<1){
            res.status(401).json({ message: "Image is required" });
            return;
        }

        for(const img of media){
            const result = await imagekit.upload({
              file: img.buffer,
              fileName: img.originalname,
              isPrivateFile: false,
              isPublished: true,
            });
            imagesUrl.push(result.url);
        };

        await productModel.create({
            author : req.userId,
            title : title,
            price : price,
            discription: discription,
            category : category,
            forWhom : forWhom,
            images : imagesUrl
        })
        
        res.status(201).json({message : "Product created successfully"});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message : "Internal server error" , error : error.message});
    }
}

module.exports.getAllProducts = async (req,res) => {
    try {
        const page = req.query.page;
        const limit = 10;
        const skip = (page-1)*limit;
        const productData = await productModel.find().skip(skip).limit(limit);

        const availableProducts = await productModel.find();
        
        

        if(productData.length < 1){
            return res.status(404).json({message : "No product found"});
        }

        res
          .status(200)
          .json({
            message: "Product data found",
            availableProducts: availableProducts.length,
            productData,
          });

    } catch (error) {
        console.log(error);
        res.status(500).json({message : "Internal server error"});
    }
}