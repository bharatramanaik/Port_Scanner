const {text}=require("express");
const mongoose=require("mongoose");
const usschema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    confirmpassword:{
        type:String,
        required:true
    }
},{timeseries:true})

const Reguser=new mongoose.model("Reguser",usschema);

module.exports=Reguser;