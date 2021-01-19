const express = require("express"),
    mongod = require("mongodb").MongoClient,
    multer  = require('multer'),
    fs = require("fs"),
    upload = multer({ dest: 'passports/' }),
    app = express(),
    allowedOrigins = ['https://venmun.com','https://www.venmun.com','http://venmun.com','http://www.venmun.com','http://localhost:3000','http://localhost:3001',
    'https://venmun-247212.appspot.com','http://localhost:5000',undefined]


function MongoClientFunc(callback){
    const uri = 'mongodb://127.0.0.1:27017/fundhill';
    const options = {useNewUrlParser: true,useUnifiedTopology: true }
    mongod.connect(uri,options,(err,db)=>{    
        if(!err){
            callback(db.db('interview'),(err)=>{ 
                err&&console.log('mongoError',err)
            })
        }else{
            console.log(err);
            return
        }
    })
}

app.get("/",(req,res)=>{
    if(allowedOrigins.includes(req.headers.origin)){
        res.setHeader('Access-Control-Allow-Origin',req.headers.origin===undefined?"*":req.headers.origin)
        res.setHeader('Access-Control-Allow-Headers','authorization') 
        res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS, PUT, PATCH, DELETE')
        res.setHeader('Access-Control-Allow-Credentials', true)

    }
    MongoClientFunc((db,cb)=>{
        const records = db.collection("visitors")
        records.find({}).toArray((e,d)=>{
            res.end(JSON.stringify({data:d})) 
        })
    })
})

app.get("/passports/:path",(req,res)=>{
    fs.readFile(req.url.substring(1),(e,f)=>{
        res.setHeader("Content-Type","image/*")
        res.end(f)
    })
})

app.post("/addrecord",upload.single("passport"),(req,res,next)=>{
    if(allowedOrigins.includes(req.headers.origin)){
        res.setHeader('Access-Control-Allow-Origin',req.headers.origin===undefined?"*":req.headers.origin)
        res.setHeader('Access-Control-Allow-Headers','authorization') 
        res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS, PUT, PATCH, DELETE')
        res.setHeader('Access-Control-Allow-Credentials', true)

    }
    MongoClientFunc((db,cb)=>{
        const records = db.collection("visitors")
        records.insertOne({passport:req.file.path,...req.body},(e,d)=>{
            records.find({}).toArray((e,d)=>{
                res.end(JSON.stringify({data:d})) 
            })
        })
    })
})

app.post("/delete",(req,res,next)=>{
    if(allowedOrigins.includes(req.headers.origin)){
        res.setHeader('Access-Control-Allow-Origin',req.headers.origin===undefined?"*":req.headers.origin)
        res.setHeader('Access-Control-Allow-Headers','authorization') 
        res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS, PUT, PATCH, DELETE')
        res.setHeader('Access-Control-Allow-Credentials', true)

    }
    MongoClientFunc((db,cb)=>{
        const records = db.collection("visitors")
        req.on("data",data=>{
            const parseData = JSON.parse(""+data)
            records.findOneAndDelete({_id:records.s.pkFactory.ObjectId(parseData.id)},(e,d)=>{
                if(d.value){
                    records.find({}).toArray((e,d)=>{
                        res.end(JSON.stringify({data:d})) 
                    })
                }else{
                    res.end(JSON.stringify({err:"Visitor not Found"})) 
                }
            })
        })
    })
})

app.post("/update",upload.single("passport"),(req,res,next)=>{
    if(allowedOrigins.includes(req.headers.origin)){
        res.setHeader('Access-Control-Allow-Origin',req.headers.origin===undefined?"*":req.headers.origin)
        res.setHeader('Access-Control-Allow-Headers','authorization') 
        res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS, PUT, PATCH, DELETE')
        res.setHeader('Access-Control-Allow-Credentials', true)

    }
    MongoClientFunc((db,cb)=>{
        const records = db.collection("visitors")
        records.findOneAndUpdate({_id:records.s.pkFactory.ObjectId(req.body.id)},{$set:{...req.body}},(e,d)=>{
            if(d.value){
                records.find({}).toArray((e,d)=>{
                    res.end(JSON.stringify({data:d})) 
                })
            }else{
                res.end(JSON.stringify({err:"Visitor not Found"})) 
            }
        })
    })
})
app.listen("8080",()=>{
    console.log("Serving at port 8080")
})