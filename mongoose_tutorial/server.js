import express from "express";
import mongoose from "mongoose";
import merchant_data from "./merchant_data.js";

const app = express();

app.use(express.json());

mongoose.connect('mongodb://localhost:27017/usersdb',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

app.listen(3000, () => {
  console.log("Server is running at port 3000");
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error: "));
    db.once("open", function () {
        console.log("Connected successfully");
});

const TxnSchema = new mongoose.Schema({
    txn_id: Number,
    date_created: Date,
    merchant_id: Number,
    merchant_name: String,
    category_id: Number,
    category_name: String,
    amount: Number,
    user_id: Number
})

const userProfileSchema = new mongoose.Schema({
    user_id         : Number,
    username        : String,

});
const TxnModel = mongoose.model("txnModel", TxnSchema)
const UserProfileModel = mongoose.model("userProfileSchema", userProfileSchema)

app.get('/', async function (req, res) {
    
    let user = new UserProfileModel({
        user_id: 2929292929229,
        username: "SUMIT"
    });
    user.save().then(async (user_man)=>{
        console.log(user_man)
        let txns = [
            {
                txn_id:1,
                date_created:new Date(),
                merchant_id:1,
                merchant_name:"Amazon",
                category_id:2,
                category_name:"Shopping",
                amount:28800,
            },
            {
                txn_id:2,
                date_created:new Date(),
                merchant_id:2,
                merchant_name:"Flipkart",
                category_id:2,
                category_name:"Shopping",
                amount:37100,
            },
            {
                txn_id:3,
                date_created:new Date(),
                merchant_id:3,
                merchant_name:"Swiggy",
                category_id:1,
                category_name:"Food",
                amount: 71000
            }
        ];

        for(let i=0;i<txns.length;i++)
        {
            let txn = new TxnModel({
                txn_id:txns[i].txn_id,
                date_created:txns[i].date_created,
                merchant_id:txns[i].merchant_id,
                merchant_name:txns[i].merchant_name,
                category_id:txns[i].category_id,
                category_name:txns[i].category_name,
                amount: txns[i].amount,
                user_id: user.user_id
            });
            await txn.save();
        }
    
        console.log(user);
    });
    res.send('GET request to homepage')
});

app.get("/insert-bulk", async function(req, res) {
    // console.log(merchant_data);
    for(let user_id=0;user_id<1000000;user_id++)
    {
        let username = `USER${user_id}`;
        console.log(`INSERTING USER${user_id} data ...`);
        let user = new UserProfileModel({
            user_id: user_id,
            username: username
        });

        await user.save();
    
        for(let i=0;i<100;i++)
        {
            let amount = Math.round(10+Math.random()*4990);
            let merchant_index = Math.round(Math.random()*(merchant_data.length-1));
            let merchant = merchant_data[merchant_index];
            let date = new Date(Date.now() - 86400000*i);

            let txn = new TxnModel({
                txn_id:(user_id+100)+i,
                date_created:date,
                merchant_id:merchant_index,
                merchant_name:merchant.name,
                category_id:merchant.category_id,
                category_name:merchant.category_name,
                amount:amount,
                user_id: user.user_id
            });
            await txn.save();
        }
        console.log(`Done`);
    }

    
    res.send("Complete");
});

app.get("/get_sample", function(req, res){
    let date = new Date("2012-10-23");
    res.send(date)
});

app.get("/user/:username/merchantwise/", async function(req, res){
    let user_id = req.params.username;
    let data = null;
    console.log(user_id)
    return TxnModel.aggregate([
        {$match:{"user_id":Number(user_id)}},
        {$match:{"date_created":{$gte: new Date('2022-09-9'),$lte: new Date('2022-09-12')}}},
        {$group:{
            _id:{
              "m_id": "$merchant_id",
              "m_name": "$merchant_name"
            },
            "total_amount": {
              $sum: "$amount"
            }
          }
        }
    ], async (err, ress)=>{
        console.log(ress)
        console.log(err)
        res.send(ress);
    });
});

app.get("/user/:username/categorywise/", async function(req, res){
    let user_id = req.params.username;
    // let data = null;
    return TxnModel.aggregate([
        {$match:{"user_id":Number(user_id)}},
        {$match:{"date_created":{$gte: new Date('2022-09-9'),$lte: new Date('2022-09-12')}}},
        {$group:{
            _id:{
              "c_id": "$category_id",
              "c_name": "$category_name",
            },
            "total_amount": {
              $sum: "$amount"
            }
          }
        }
    ], async (err, ress)=>{
        console.log(ress)
        console.log(err)
        res.send(ress);
    });
    return UserTxnModel.aggregate([
            {$match:{"username":username}},
            // {$unwind:{path:"$transactions"}},
            // {$match:{"transactions.date_created":{$gte: new Date('2022-09-9'),$lte: new Date('2022-09-12')}}},
            // {$group:{
            //     // _id: "$transactions.merchant_id",{
            //     _id:{
            //       "c_id": "$transactions.category_id",
            //       "c_name": "$transactions.category_name",
            //       "m_id": "$transactions.merchant_id",
            //       "m_name": "$transactions.merchant_name"
            //     },
            //     "total_amount": {
            //       $sum: "$transactions.amount"
            //     }
            //   }
            // },
            // {$group:{
            //     _id: {
            //       "category_id":"$_id.c_id"
            //     },
            //     "category_total": {
            //       $sum: "$total_amount"
            //     }
            //   }
            // }
        ], async (err, ress)=>{
        console.log(ress)
        console.log(err)
        res.send(ress);
    });
});