import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/Health-ai";

function connectToMongo(){
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("mongoDB connected"))
.catch(err => console.error(" mongoDB not getting conneted:", err));

}

export default connectToMongo;