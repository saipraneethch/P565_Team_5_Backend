//not currently using any of this
//was added for chat authentification but doesn't work with how login/user auth is set up
//may want to implement in the future


// import jwt from 'jsonwebtoken';
// import User from '../models/user.model.js';

// const protectRoute = async (req, res, next) => {
//     try{
//         const token = req.cookies.jwt;
//         if(!token){
//             return res.status(401).json({error: "Unauthorized - no token provided"});
//         }
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         if(!decoded){
//             return res.status(401).json({error: "Unauthorized - token exists but is invalid"});
//         }

//         //doesn't work
//         const user = await User.getUser(decoded._id).select("-password");

//         if(!user){
//             return res.status(401).json({error: "Unauthorized - user not found"});
//         }

//         req.user = user;//currently authenticated/logged in user
//         next();//calls sendMessage
        
//     }catch(error){
        
//         res.status(500).json({error: "Internal server error in protect route"});
//     }

// };

// export default protectRoute;