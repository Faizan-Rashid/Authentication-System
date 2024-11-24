import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { configDotenv } from "dotenv"
import { connectDB } from "./db/connectDB.js"
import authRouter from "./routes/auth.routes.js"


const app = express()
configDotenv()
connectDB()

app.use(express.json())
app.use(cors())
app.use(cookieParser())

app.use(`/api/v1/auth`, authRouter)


const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
    console.log(`app listening on port ${PORT}`)
})

/**username -- phaixanraxheed 
 * password -- ViCi1V5pzFQaPjKU
 */