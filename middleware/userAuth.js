import jwt from "jsonwebtoken";

const userAuth = async (req, res, next)=>{
    const {token} = req.cookies;

    if(!token){
        return res.json({success: false, message: 'Not Authorized. Try Again'});
    }

    try{

        const tokenDecode  = jwt.verify(token, process.env.JWT_SECRET);

        if(tokenDecode.id){
            process.env.USER_ID = tokenDecode.id
        }else{
            return res.json({success: false, message: 'Not Authorized. Try Again'});
        }

        next();

    }catch(error){
        return res.json({success: false, message: error.message});
    }
}

export default userAuth;