import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

//Register user
export const register = async (req, res)=>{

    const {name, email, password} = req.body;

    if(!name || !email || !password){
        return res.json({success: false, message: 'Missing Details'})
    }
    try{
        const existingUser = await userModel.findOne({email})

        if(existingUser){
            return res.json({ success: false, message: 'User already exists'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({name, email, password: hashedPassword});
        await user.save();

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        //Sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to toKenPop',
            text: `Welcome to toKenPop. Your account has been created with email id: ${email}`,
        }

        await transporter.sendMail(mailOptions);

        return res.json({success: true});

    }catch(error){
        res.json({success: false, message: error.message});
    }
}

//Log in user
export const login = async (req, res)=>{
    const {email, password} = req.body;

    if(!email || !password){
        return res.json({success: false, message: 'Email and Password required'});
    }

    try{

        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success: false, message: 'User not registered'});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.json({success: false, message: 'Incorrect Password'});
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({success: true});

    }catch(error){
        res.json({success: false, message: error.message});
    }
}

//Log out user
export const logout = async (req, res)=>{
    try{
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })

        return res.json({success: true, message: 'Logged Out'});

    }catch(error){
        res.json({success: false, message: error.message});
    }
}

//Send verification OTP to user's mail
export const sendVerifyOtp = async (req, res)=>{
    try{

        const {id} = req.body;

        const user = await userModel.findById(id);

        if(user.isAccountVerified){
            return res.json({success: false, message: "Account Already Verified"});
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            text: `Your OTP is ${otp}. Verify your account using this OTP.`,
        }

        await transporter.sendMail(mailOption);

        res.json({success: true, message: 'Verification OTP sent on Email'});

    }catch(error){
        res.json({success: false, message: error.message});
    }
} 

//Verify user
export const verifyEmail = async (req, res)=>{

    const { otp } = req.body;
    const userId = process.env.USER_ID;

    if(!userId || !otp){
        return res.json({success: false, message: 'Missing Details'});
    }

    try{
        const user = await userModel.findById(userId);

        if(!user){
            return res.json({success: false, message: 'User not found'});
        }

        if(user.verifyOtp === '' || user.verifyOtp !== otp){
            return res.json({success: false, message: 'Invalid OTP'});
        }

        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({success: false, message: 'OTP expired'});
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();
        return res.json({success: true, message: 'Email Verified'});

    }catch(error){
        return res.json({success: false, message: error.message});
    }
}

//Check if user is authenticated
export const isAuthenticated = async (req, res)=>{

    try {
        return res.json({succes: true});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

// Send password reset OTP
export const sendResetOtp = async (req, res)=>{
    const {email} = req.body;

    if(!email){
        return json({succes: false, message: 'Email is required'})
    }

    try {
        
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message: 'User not found'});
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Your OTP is ${otp}. Proceed resetting your password using this OTP.`,
        }

        await transporter.sendMail(mailOption);

        return res.json({succes: true, message: 'OTP sent to your email'})

    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

//Reset user password
export const resetPassword = async (req, res)=>{
    const {email, otp, newPassword} = req.body;

    if(!email || !otp || !newPassword){
        return res.json({success: false, message: 'All fiels required'});
    }

    try {
        
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message: 'User not found'});
        }

        if(user.resetOtp === "" || user.resetOtp !== otp){
            return res.json({success: false, message: 'Invalid OTP'});
        }

        if(user.resetOtpExpireAt < Date.now()){
            return res.json({success: false, message: 'OTP expired'});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({success: true, message: 'Password Successfully Updated'});

    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}