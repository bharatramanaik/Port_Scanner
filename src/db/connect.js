const mongoose=require("mongoose");
mongoose.set('strictQuery',true);
mongoose.connect('mongodb+srv://bharatrn:veda@portscan.rsqmdjd.mongodb.net/?retryWrites=true&w=majority',{
}).then(()=>{
    console.log("connected");
}).catch(()=>{
    console.log("not connected");
})

// mongodb+srv://bharatrn:veda@portscan.rsqmdjd.mongodb.net/?retryWrites=true&w=majority