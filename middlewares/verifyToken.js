import { matchedData, validationResult } from "express-validator"
import jwt from "jsonwebtoken"

export const verifyToken = (req, res, next) => {
    try {
        const result = validationResult(req);
        if (!result.isEmpty()) return res.status(400).json({
            success: false,
            message: "un authorized, no token provided"
        })
        const { authenticationToken } = matchedData(req)

        const parsedToken = jwt.verify(authenticationToken, process.env.JWT_SECRET)

        if (!parsedToken) return res.status(400).json({
            success: false,
            message: "Inavlid token"
        })

        req.userId = parsedToken.userId;
        next()
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "server error"
        })
    }
}