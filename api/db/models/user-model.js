import mongoose from "mongoose"


const userSchema = new mongoose.Schema({
        age:Number,
        problems:{
            type:[String],
            default:[]
        }

})

const User = mongoose.model("User",userSchema)

export default User;