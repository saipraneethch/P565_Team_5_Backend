import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";



export const requireAuth = async (req, res, next) => {

    //verify authentication
    const { authorization } = req.headers

    if (!authorization) {
        return res.status(401).json({ error: 'Authorization token required' })
    }

    const token = authorization.split(' ')[1]


    try {
        const { _id } = jwt.verify(token, process.env.SECRET)

        const user = await userModel.findOne({ _id }).select('_id')
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        req.user = user;
        next();

    } catch (error) {
        console.log(error)
        res.status(401).json({ error: 'Request is not authorized' })
    }

    
}

export default requireAuth;