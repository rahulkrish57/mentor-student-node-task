require('dotenv').config()
const express = require('express');
const mongodb = require("mongodb");
const cors = require("cors");

const userAuth = require("./userAuth");

const port = process.env.port || 3000;
const app = express();

const mongoClient = mongodb.MongoClient;
const objectID = mongodb.ObjectId;
const dbUrl =  process.env.DB_URL;
app.use(express.json());
app.use(cors());
app.use("/auth", userAuth);

app.get("/", async (req, res) => {
  try {
    let client = await mongoClient.connect(dbUrl)
    let db = client.db('school_task')
    let mentorData= await db.collection('mentor').find().toArray()
    let studentData = await db.collection('student').find().toArray()
    
    if (mentorData.length > 0 || studentData > 0) res.status(200).json({mentorData, studentData});
    else res.status(404).json({message: "No data found"})
    client.close();
  } catch (error) {
    console.log(error.message)
      res.status(500).json({message: "Internal server error"})
  }
})

// display mentor list
app.get("/mentor", async (req, res) => {
  try {
    let client = await mongoClient.connect(dbUrl)
    let db = client.db('school_task')
    let mentorData = await db.collection('mentor').find().toArray()
    console.log(mentorData)
    if (mentorData.length > 0) res.status(200).json({mentorData});
    else res.status(404).json({message: "No data found"})
    client.close();
  } catch (error) {
    console.log(error.message)
      res.status(500).json({message: "Internal server error"})
  }
})


app.get("/student", async (req, res) => {
  try {
    let client = await mongoClient.connect(dbUrl)
    let db = client.db('school_task')
    let studentData = await db.collection('student').find().toArray()
    console.log(res);
    if (studentData.length > 0) res.status(200).json(studentData)
    else res.status(404).json({message: "No data found"})
    client.close();
  } catch (error) {
    console.log(error.message)
      res.status(500).json({message: "Internal server error"})
  }
}) 

app.post("/mentor", async (req, res) => {
  try {
    let client = await mongoClient.connect(dbUrl)
    let db = client.db('school_task')
    
    await db.collection('mentor').insertOne(req.body)
    res.status(200).json({message: "Data Created"})
    client.close();
  } catch (error) {
    console.log(error.message)
    res.status(500).json({message: "Internal server error"})
}
})

app.post("/student", async (req, res) => {
  try {
    let client = await mongoClient.connect(dbUrl)
    let db = client.db('school_task')
    // let client = await mongoClient.connect(dbUrl).db('films');
    await db.collection('student').insertOne(req.body)
    res.status(200).json({message: "Data Created"})
    client.close();
  } catch (error) {
    console.log(error.message)
    res.status(500).json({message: "Internal server error"})
}
})

app.put("/student-assign/:id", async (req, res) => {
  try{
    let client = await mongoClient.connect(dbUrl)
    let db = client.db('school_task')
    let mentorData = await db.collection('mentor').find().toArray();
    let mentorData_1 = await db.collection('mentor').findOne({_id: objectID(req.params.id)})
    
    let studArr = mentorData_1.Students
    console.log(studArr)
    //let studArr = mentorData_1.Students;
   // console.log(mentorData_1.Students)
    if(mentorData_1){
      let newStudBody = req.body;
      let updateData = 
        {
          id: newStudBody.id,
          name: newStudBody.name,
          Mentor: mentorData_1.name
        }
        //console.log(updateData)
    
    let mentStudentArr = []
    
    mentorData.forEach(element => { mentStudentArr.push(element.Students)});
    var merged = [].concat.apply([], mentStudentArr);
    console.log(mentStudentArr)
    //console.log(merged)
    //console.log(merged.includes(updateData.id))
    if(merged.includes(updateData.id)) {
      res.status(200).json({message:"Student already assigned with mentor"})
      console.log("exists")
    } else {  
      console.log(studArr.push(updateData.id))
     db.collection('mentor').findOneAndUpdate({_id: objectID(req.params.id)}, {$push: { Students: updateData.id }})
     res.status(200).json({message: `Student Assigned to ${mentorData_1.name}`}) 
    }
  
  } client.close();
  }catch(error) {
    console.log(error.message)
    res.status(500).json({message: "Internal server error"})
  }
}) 

app.listen(port, () => console.log("Your app runs with" + port));

