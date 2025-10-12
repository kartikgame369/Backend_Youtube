import mongoose,{Schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
        // one who is subscribing
    },
    channel:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
        // one who subscriber is subscribing 
    }
},{timestamps:true})


export const Subscription = mongoose.model("Subscription",subscriptionSchema)