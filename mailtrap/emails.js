import { mailTrapClient, sender } from "./mailtrap.config.js"
import {
    PASSWORD_RESET_REQUEST_TEMPLATE,
    PASSWORD_RESET_SUCCESS_TEMPLATE,
    VERIFICATION_EMAIL_TEMPLATE
} from "./emailTemplates.js"

export const sendverificationEmail = async (email, verificationToken) => {
    try {
        const recepient = [{ email }]

        const response = await mailTrapClient.send({
            from: sender,
            to: recepient,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace(/{verificationCode}/, verificationToken),
            category: "Email Verification"
        })
        return response
    } catch (error) {
        console.error(`error while sending email: `, error)
        throw new Error(`error while sending email:  ${error}`)
    }
}

export const sendWelcomeEmail = async (name, email) => {
    try {
        const recepient = [{ email }]

        const response = await mailTrapClient.send({
            from: sender,
            to: recepient,
            template_uuid: "5c1b5427-ae71-4a84-830a-cba5e5b3d0b9",
            template_variables: {
                "company_info_name": "x-commerce",
                "name": name,
            }
        })
        return response
    } catch (error) {
        console.error(`error while sending email: `, error)
        throw new Error(`error while sending email:  ${error}`)
    }
}

export const sendPasswordResetEmail = async (email, resetURL) => {
    try {
        const recepient = [{ email }]

        const response = await mailTrapClient.send({
            from: sender,
            to: recepient,
            subject: "Password Reset",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace(/{resetURL}/, resetURL),
            category: "Password Reset"
        })
        return response;
    } catch (error) {
        console.error(`error while sending email: `, error)
        throw new Error(`error while sending email: `, error)
    }
}
export const sendPasswordResetSuccessEmail = async (email, resetURL) => {
    try {
        const recepient = [{ email }]

        const response = await mailTrapClient.send({
            from: sender,
            to: recepient,
            subject: "Password Reset Successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset Success"
        })
        return response;
    } catch (error) {
        console.error(`error while sending email: `, error)
        throw new Error(`error while sending email:  ${error}`)
    }
}
