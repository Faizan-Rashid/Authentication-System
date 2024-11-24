import { MailtrapClient } from "mailtrap";
import { configDotenv } from "dotenv";

configDotenv()

export const mailTrapClient = new MailtrapClient({
    token: process.env.MAILTRAP_TOKEN,
});

export const sender = {
    email: "hello@demomailtrap.com",
    name: "Faizan Rasheed",
};

