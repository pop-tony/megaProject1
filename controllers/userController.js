import userModel from "../models/userModel.js";

export const getUserData = async (req, res)=>{
    try {
        const userId = process.env.USER_ID;

        const user = await userModel.findById(userId);

        if(!user){
            return res.json({success: false, message: 'User not found'});
        }

        res.json({success: true, getUserData: {
                                                name: user.name,
                                                isAccountVerified: user.isAccountVerified
                                            }
        });

    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}