import {app} from "./app";
import connectDb from "./utils/db"

require("dotenv").config();

//create server
app.listen(process.env.PORT, () => {
    console.log("Server connected");
    connectDb()
})