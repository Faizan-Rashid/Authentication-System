import { matchedData, validationResult } from "express-validator"

import crypto from "node:crypto"
import { User } from "../models/user.model.js"
import {
    comparePassword,
    generateTokenAndSetCookie,
    getVerificationToken,
    hashPassword
} from "../helpers/auth.helpers.js"
import {
    sendPasswordResetSuccessEmail,
    sendPasswordResetEmail,
    sendverificationEmail,
    sendWelcomeEmail
} from "../mailtrap/emails.js"


export const signupController = async (req, res) => {
    try {
        const result = validationResult(req)
        if (!result.isEmpty()) return res.status(400).json({
            success: false,
            message: "Validation Error",
            error: result.array()
        })

        const { name, email, password } = matchedData(req)

        let findUser = await User.findOne({ email })
        if (findUser) return res.status(400).json({
            success: false,
            message: `user with email ${email} already exists`,
        })

        const hashedPassword = hashPassword(password)
        const verificationToken = getVerificationToken()

        findUser = new User({
            name,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 1000 * 60 * 60 * 24
        })
        const savedUser = await findUser.save()

        const token = generateTokenAndSetCookie(res, savedUser._id) // jwt  
        sendverificationEmail(savedUser.email, verificationToken)   // email verification
        return res.status(201).json({
            success: true,
            message: "user created and saved to database successfully",
            token,
            user: {
                ...savedUser, password: Array.from({ length: password.length }, () => {
                    return "*"
                }).join("")
            },
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "error while creating user",
            error,
        })
    }
}

export const verifyEmailController = async (req, res) => {
    try {
        const result = validationResult(req)
        if (!result.isEmpty()) return res.status(400).json({
            success: false,
            message: "Validation Error",
            error: result.array()
        })

        const { verificationToken } = matchedData(req)
        const findUser = await User.findOne({
            verificationToken,
            verificationTokenExpiresAt: { $gt: Date.now() }
        })

        if (!findUser) return res.status(400).json({
            success: false,
            message: "user doesnot exists or verification code is expired"
        })

        findUser.isVerified = true;
        findUser.verificationToken = undefined;
        findUser.verificationTokenExpiresAt = undefined;

        const savedUser = await findUser.save()

        const response = sendWelcomeEmail(savedUser.name, findUser.email)
        res.status(200).json({
            success: true,
            message: "email verified successfully",
            user: {
                ...savedUser,
                password: Array.from({ length: savedUser.password.length }, () => {
                    return "*"
                }).join("")
            },
            response,
        })

    }
    catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Error while email verification",
            error
        })
    }
}

export const loginController = async (req, res) => {
    try {
        const result = validationResult(req)
        if (!result.isEmpty()) return res.status(400).json({
            success: false,
            message: "Validation error",
            error: result.array()
        })
        const { email, password } = matchedData(req);

        const findUser = await User.findOne({ email });
        if (!findUser) return res.status(400).json({
            success: false,
            message: "no such user exists"
        })
        const isPasswordCorrect = comparePassword(password, findUser.password)
        if (!isPasswordCorrect) return res.status(400).json({
            success: false,
            message: "Incorrect password"
        })
        generateTokenAndSetCookie(res, findUser._id)
        findUser.lastlogin = new Date()
        const savedUser = await findUser.save()

        res.status(200).json({
            success: true,
            message: "user login successfull",
            user: {
                ...savedUser, password: Array.from({ length: password.length }, () => {
                    return "*"
                }).join("")
            },
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "error while login user",
            error,
        })
    }
}

export const logoutController = (req, res) => {
    try {
        res.clearCookie("authenticationToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });
        res.status(200).json({ message: "Logout successfully" })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "error while logout user",
            error,
        })
    }
}

export const forgotPasswordController = async (req, res) => {
    try {
        const result = validationResult(req)
        if (!result.isEmpty()) return res.status(400).json({
            success: false,
            message: "Validation error",
            error: result.array()
        })
        const { email } = matchedData(req);

        const findUser = await User.findOne({
            email
        })

        if (!findUser) return res.status(400).json({
            success: false,
            message: "user doesnot exists or verification code is expired"
        })

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000

        findUser.resetPasswordToken = resetToken
        findUser.resetPasswordTokenExpiresAt = resetTokenExpiresAt
        const savedUser = await findUser.save()

        sendPasswordResetEmail(savedUser.email, `${process.env.CLIENT_URL}/api/v1/auth/reset-password/${resetToken}`)

        return res.status(200).json({
            success: true,
            message: "A reset token has been send to your email"
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "error while reset password",
            error,
        })
    }
}

export const resetPasswordController = async (req, res) => {
    try {
        const result = validationResult(req)
        if (!result.isEmpty()) return res.status(400).json({
            success: false,
            message: "Validation error",
            error: result.array()
        })
        const { token, password } = matchedData(req);
        const findUser = await User.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpiresAt: { $gt: Date.now() }
        })

        if (!findUser) return res.status(400).json({
            success: false,
            message: "user doesnot exists or reset token is expired"
        })

        const hashedPassword = hashPassword(password)
        findUser.password = hashedPassword;
        findUser.resetPasswordToken = undefined;
        findUser.resetPasswordTokenExpiresAt = undefined;

        const savedUser = await findUser.save()
        sendPasswordResetSuccessEmail(savedUser.email)

        return res.status(200).json({
            success: true,
            message: "Password reset successful"
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "error while reset password",
            error,
        })
    }
}

export const checkAuthController = async (req, res) => {
    try {
        const findUser = await User.findById(req.userId).select("-password")
        if (!findUser) return res.status(200).json({
            success: true,
            message: "user not found"
        })
        res.status(200).json({
            success: true,
            authorizedUser: findUser
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: true,
            message: "Error while authenticating"
        })
    }
}