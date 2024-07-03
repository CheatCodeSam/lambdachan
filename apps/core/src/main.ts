import express, { json } from "express"
import { boardRouter } from "./feature/board"
import { postRouter } from "./feature/post"
import { threadRouter } from "./feature/thread"
import { mediaRouter } from "./feature/media"

const app = express()

app.use(json())

app.use("/board", boardRouter)
app.use("/post", postRouter)
app.use("/thread", threadRouter)
app.use("/media", mediaRouter)
app.set("trust proxy", true)

app.listen(8080, async () => {
    console.log("Server started on http://localhost:8080")
})
