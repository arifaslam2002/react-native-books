import express from 'express';
import cloudinary from '../lib/cloudinary.js';
import protectRoute from '../middleware/auth.js';
import Book from '../models/Book.js';
const router = express.Router();
router.post("/", protectRoute, async (req, res) => {
    try {
        const { title, caption, rating, image } = req.body;
        if (!title || !caption || !rating || !image) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        // Upload image to cloudinary
        const uploadedResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadedResponse.secure_url;
        
        // Create and save to db using your Mongoose model
        const newBook = new Book({  // Use 'new Book()' instead of plain object
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user.id,
        });
        
        await newBook.save();
        res.status(201).json({ message: "Book created successfully", book: newBook });
        
    } catch (error) {
        console.log("Error in creating book:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.get("/",protectRoute,async(req,res)=>{
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;
        const books = await Book.find().sort({createdAt:-1})
        .skip(skip)
        .limit(limit)
        .populate("user","username profileImage")
        const totalBooks = await Book.countDocuments();
        res.send({
            books,
            currentPage:page,
            totalPages:Math.ceil(totalBooks/limit),
            totalBooks,
        });
    } catch (error) {
        console.log("Error in fetching books:", error);
        res.status(500).json({message:"Internal server error"});
    }
});
router.delete("/:id",protectRoute,async(req,res)=>{
    try {
        const book = await Book.findById(req.params.id);
        if(!book){
            return res.status(404).json({message:"Book not found"});
        }
        if(book.user.toString()!==req.user.id){
            return res.status(401).json({message:"Not authorized"});
    }
    if(book.image && book.image.includes("cloudinary")) {
        try {
            const PublicId = book.image.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(PublicId);
        } catch (error) {
            console.log("Error in deleting image from cloudinary:", error);
        }
    }
      await book.deleteOne();
        res.status(200).json({message:"Book deleted successfully"});
    } catch (error) {
        console.log("Error in deleting book:", error);
        res.status(500).json({message:"Internal server error"});
    }
}); 
// recommeded by the user
router.get("/user",protectRoute,async(req,res)=>{ 
    try {
       const books = await Book.find({user:req.user.id}).sort({createdAt:-1}); 
       res.status(200).json({books});
    } catch (error) {
        console.log("Error in fetching user books:", error);
        res.status(500).json({message:"Internal server error"});
    }
});
export default router;