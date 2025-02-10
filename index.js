const express = require('express');
const mongoose = require('mongoose')
const cors = require("cors")
const fetModel = require('./module/apimobile.js');
const slideModel = require('./module/api_slider.js');
const registerModel = require('./module/newuser.js');
const { body, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const Jwt = require('jsonwebtoken');
const CartItem = require('./module/makeOrder.js');
const watchModel = require('./module/watch.js');
require("dotenv").config

const jwtKey = process.env.SECREAT_KEY ;
const port = process.env.PORT;
require('dotenv').config()






const app = express()
app.use(express.json())
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect(process.env.MONGO_URL)




const storage=multer.diskStorage({
  destination:'./upload/images',
  filename:(req,file,cb)=>{
      return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
})

const upload =multer({storage:storage})

//creating uplode Endpoint for images

app.use('/images',express.static('upload/images'))
// app.post("/upload",upload.single('product'),(req,res)=>{
//   res.json({
//       success:1,
//       Image_url:`http://localhost:${port}/images/${req.file.filename}`,
//       Image_url2:`http://localhost:${port}/images/${req.file.filename}`,
//       Image_url3:`http://localhost:${port}/images/${req.file.filename}`,
//       Image_url4:`http://localhost:${port}/images/${req.file.filename}`,
//       Image_url5:`http://localhost:${port}/images/${req.file.filename}`,
//       Image_url6:`http://localhost:${port}/images/${req.file.filename}`,
//       Image_url7:`http://localhost:${port}/images/${req.file.filename}`,
//   })
// })

app.get('/api_mobile', async (req, res) => {
    try {
        const data = await fetModel.find({});
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
  });

  app.post('/api_mobile', upload.single('image'), async (req, res) => {
    console.log(req.body); // Form fields
    console.log(req.file); // Uploaded file information
  
    try {
      // Add the image file path to the form data
      const formData = {
        ...req.body,
        img: `http://localhost:${3001}/images/${req.file.filename}`
      };
  
      const data = await fetModel.create(formData);
      console.log(data);
      res.json(data);
    } catch (error) {
      console.error('Error saving data:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  


  


  app.get('/watch', async (req, res) => {
    try {
        const data = await watchModel.find({});
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
  });

  app.get('/slider', async (req, res) => {
    try {
        const data = await slideModel.find({});
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
  });

  app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await registerModel.findOne({ email });
      if (user) {
        if (user.password == password) {
           Jwt.sign({user},jwtKey,(err,token)=> {
            if(err){
                res.send({result:"somethin went wrong"})
            }
            // console.log(user,token)
           res.send({user,auth: token})
           } ) 

        } else {
          res.status(400).json("Incorrect Password");
        }
      } else {
        res.status(404).json("User not found");
      }
    } catch (error) {
      console.error(error);
      res.status(500).json("Server Error");
    }
  });
  
  app.post('/register', [
    body('email').isEmail(),
    body('name').isLength({ min: 5 }),
    body('password').isLength({ min: 5 })
  ], async (req, res) => {
    try {
        let cart = {};
        for (let i = 0; i < 300; i++) {
            cart[i] = 0;
        }

        // Add cartData to the request body
        req.body.cartData = cart;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      await registerModel.create(req.body);
      res.status(201).json("Registration successful");
    } catch (error) {
      console.error(error);
      res.status(500).json("Registration failed");
    }
  });
//   creating the middleware to fetch user 
const fetchUser = async (req,res,next)=> {
    const token= req.header('auth-token');
    if(!token){
        res.status(401).send({errors:"please authentication youself"})
    }else{
        try{
            const data = Jwt.verify(token,"e-copp")
            req.user = data.user;
            next();
        }catch (err){
            console.error(err);
            res.status(401).send( {errors : "Please authenticate yourself"} )
        }
    }
}

app.post('/cartData', fetchUser, async (req, res)=>{
    let userData = await registerModel.findOne({_id:req.user._id})
    userData.cartData[req.body.itemId] += 1
    // console.log(userData)
    await registerModel.findOneAndUpdate({_id:req.user._id},{cartData:userData.cartData});
    res.json({ message: 'Item added to cart' });

})

// // creating the endpoint to remove product from cartData
app.post('/removefromcart', fetchUser, async(req, res)=> {
    let userData = await registerModel.findOne({_id:req.user._id})
    if(userData.cartData[req.body.itemId] >0  )
    userData.cartData[req.body.itemId] -= 1
    // console.log(userData)

    await registerModel.findOneAndUpdate({_id:req.user._id},{cartData:userData.cartData});
    res.json({ message: 'Item removed cart' });
}
 )

app.post("/getcart", fetchUser, async (req, res) => {
  try {
    // Find user data
    const userData = await registerModel.findOne({ _id: req.user._id });
    // console.log(registerModel.findOne({ _id: req.user._id }))
    // Access cart data from user data
    const cartItems = userData.cartData;
    //  console.log(userData.cartData)
    // Filter product IDs
    const productIds = Object.keys(cartItems).filter(itemId => cartItems[itemId] > 0);
    // Fetch products based on product IDs from the 'api_mobile' collection
    const products = await fetModel.find({ id: { $in: productIds } });

    // Send products as JSON response
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json("Error fetching cart data");
  }
});

app.post('/checkout', fetchUser, async (req, res) => {
  const { userEmail, cartItems } = req.body;

  try {
    // Create an array to store cart items
    const itemsToAdd = cartItems.map(item => ({
      product: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.img
      // Add other product-related information as needed
    }));

    // Create a new CartItem document
    const newCartItem = new CartItem({
      user: {
        _id: req.user._id,
        email: userEmail
      },
      cartItems: itemsToAdd
    });

    // Save the new cart item to the database
    const savedCartItem = await newCartItem.save();

    res.status(200).json({ message: 'Checkout successful', savedCartItem });
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({ error: 'Error during checkout' });
  }
});


app.post('/clearcart', fetchUser, async (req, res) => {
  try {
    const userData = await registerModel.findOne({ _id: req.user._id });

    // Reset quantity of each item in cartData to zero
    const resetCartData = {};
    for (const itemId in userData.cartData) {
      resetCartData[itemId] = 0;
    }

    // Update cartData in the database
    await registerModel.findOneAndUpdate({ _id: req.user._id }, { cartData: resetCartData });

    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Error clearing cart' });
  }
});

app.get('/order', async (req, res) => {
  try {
      const data = await CartItem.find({});
      res.json(data);
  } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).send('Internal Server Error');
  }
});




 
 
 app.listen(port, () => {
     console.log('Server listening on port 3001');
    });
    
    
    //   app.post('/register',[
    //     body('email').isEmail(),
    //     // password must be at least 5 chars long
    //     body('name',).isLength({ min: 5 }),
    //     body('password', 'Incorrect Password').isLength({ min: 5 })],
    
    //      (req, res) => {
    
    //         const errors = validationResult(req);
    //         if (!errors.isEmpty()) {
    //             return res.status(400).json({ errors: errors.array() });
    //         }
    //     registerModel.create(req.body)
    //     .catch((error)=> console.log(error))
        
    // })
