import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const hashPassword = password => bcrypt.hashSync(password, 10)

export const comparePassword = (password, hashedPassword) => bcrypt.compareSync(password, hashedPassword)

export const getVerificationToken = () => Math.floor(100000 + Math.random() * 900000).toString()

export const generateTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.cookie("authenticationToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7
    })

    return token;
}