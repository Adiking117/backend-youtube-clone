import mongoose,{Schema} from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'


const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true      // mongodb index searching optimized
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String,    // cloudinary url
        required:true,
    },
    coverImage:{
        type:String
    },
    watchHistory: [
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,"PAssword is required"],
    },
    refreshToken:{
        type:String
    }
},{ timestamps:true })

// function takes some time and uses context of the schema
// Arrow function does not know the context
userSchema.pre("save", async function(next){

    if(! this.isModified("password"))
        return next();

    this.password = bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function
(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username:this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.ACCESS_REFRESH_SECRET,
        {
            expiresIn: process.env.ACCESS_REFRESH_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema)