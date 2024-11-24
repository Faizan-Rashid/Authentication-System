import { Router } from "express";

import {
    forgotPasswordController,
    resetPasswordController,
    checkAuthController,
    loginController,
    logoutController,
    signupController,
    verifyEmailController
} from "../controllers/auth.controller.js";
import { checkSchema } from "express-validator";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router()

router.get("/check-auth",
    checkSchema({
        authenticationToken: {
            notEmpty: {
                errorMessage: "jwt token no present"
            },
            in: "cookies"
        }
    }),
    verifyToken,
    checkAuthController)

router.post("/signup",
    checkSchema({
        name: {
            isString: {
                errorMessage: "name should be string",
            },
            notEmpty: {
                errorMessage: "name must be provided"
            },
            in: "body"
        },
        email: {
            isString: {
                errorMessage: "email should be string"
            },
            notEmpty: {
                errorMessage: "email must be provided"
            },
            isEmail: {
                errorMessage: "email not in correct format"
            },
            in: "body"
        },
        password: {
            notEmpty: {
                errorMessage: "password is required"
            },
            in: "body"
        },
    }),
    signupController)

router.post("/verify-email",
    checkSchema({
        verificationToken: {
            notEmpty: {
                errorMessage: "Verification token must be provided"
            },
            isLength: {
                options: {
                    min: 6,
                    max: 6
                },
                errorMessage: "code length must be of 6 digigts"
            }
        }
    }),
    verifyEmailController)

router.post("/login",
    checkSchema({
        email: {
            isEmail: {
                errorMessage: "Email is not in correct format"
            },
            notEmpty: {
                errorMessage: "email must be provided"
            }
        },
        password: {
            notEmpty: {
                errorMessage: "Password must be provided"
            }
        }
    }),
    loginController)

router.get("/logout", logoutController)

router.post("/forgot-password",
    checkSchema({
        email: {
            isEmail: {
                errorMessage: "Email is not in correct format"
            },
            notEmpty: {
                errorMessage: "email must be provided"
            }
        },
    }),
    forgotPasswordController)

router.post("/reset-password/:token",
    checkSchema({
        token: {
            notEmpty: {
                errorMessage: "token must be provided"
            },
            in: "params"
        },
        password: {
            notEmpty: {
                errorMessage: "new password must be provided"
            },
            in: "body"
        }
    }),
    resetPasswordController
)
export default router