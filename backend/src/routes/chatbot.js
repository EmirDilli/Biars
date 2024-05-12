/* 


{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "relatedChatbot"
    }
  ]
}


*/



const { Router } = require("express");
const { isAuth } = require("../utils/isAuth");
const dotenv = require("dotenv");
const Chatbot = require("../controllers/chatbot/chatbotClass.js");
const ChatbotChats = require("../controllers/chatbot/chatbotChatClass.js");
const { User, Student, TA, Instructor, Semester, Class, ClassSemester, Section} = require("../schemas/index.js");

const multer = require('multer');
const fs = require('fs');
const path = require('path');

const OpenAI = require("openai");
const { dirname, join } = require('path');
const { fileURLToPath } = require('url');

const DocumentController = require("../controllers/chatbot/documentController.js");
dotenv.config();
let openai = new OpenAI({apiKey: process.env.OPENAI});
const router = Router();


async function createChatbots(courseList){
    let newChatbotArray = [];
    for(let i = 0; i < courseList.length; i++){
        newChatbotArray.push(new Chatbot(courseList[i], 0));
        newChatbotArray.push(new Chatbot(courseList[i], 1));
    }
    let promises = newChatbotArray.map((cb) => {
        return Chatbot.createNewChatbot(cb);
    });
    return Promise.all(promises).then(() => {
        return true;
    });
    
}

async function createChatbotChats(userId, usersCourseList){
    let promises = usersCourseList.map(async (course) => {
        let chatbotId = await Chatbot.getChatbotId(course, 0);
        let chatbotId2 = await Chatbot.getChatbotId(course, 1);
        await ChatbotChats.createNewChatbotChat(chatbotId, userId);
        return ChatbotChats.createNewChatbotChat(chatbotId2, userId);
    });
    Promise.all(promises).then(() => {
        return true;
    });

}

async function getUserType(userId){ // returns "student", "ta", "instructor" or "admin" 
    let student = await Student.findOne({userId: userId});
    if(!student){
        let ta = await TA.findOne({userId: userId});
        if(!ta){
            let instructor = await Instructor.findOne({userId: userId});
            if(!instructor){
                return "admin";
            }
            return "instructor";
        }
        return "ta";
    }
    return "student";
}

async function getRelatedChatbots(userId){ 
    let type = await getUserType(userId);
    let currentSemesterId = await Semester.findOne({status: "active"});
    currentSemesterId = currentSemesterId._id;
    let courseCodes;
    //console.log(type);

    if(type == "student"){
        let classSectionList = await Student.findOne({userId: userId});
        classSectionList = classSectionList.classes;
        let classSemesterList = await Promise.all(classSectionList.map(async (classSectionId) => {
            return await Section.findById(classSectionId); // Assuming Section.findById returns a promise
        }));
        classSemesterList = classSemesterList.map((sem) => {
            return sem.classSemester;
        });
        let classSemesters = await Promise.all(classSemesterList.map(async (classSemId) => {
            return await ClassSemester.findById(classSemId); // Assuming ClassSemester.findById returns a promise
        }));
        let classIds = [];
        for(let i = 0; i < classSemesters.length; i++){
             
            if(classSemesters[i].semester.equals(currentSemesterId)){
                classIds.push(classSemesters[i].class);
            }
        }

        let classes = await Promise.all(classIds.map(async (cId) => {
            return await Class.findById(cId); 
        }));
        courseCodes = classes.map((cls) => {
            return cls.code;
        });


    }
    else if(type == "ta"){
        
        let taId = await TA.findOne({userId: userId});
        taId = taId._id;
       
        //let classSemesters = await ClassSemester.find({semester: currentSemesterId, tas: {$in: [taId]}});
        let classSemesters = await ClassSemester.find({semester: currentSemesterId});

        let classIds = [];
        for(let i = 0; i < classSemesters.length; i++){
            
            if(classSemesters[i].semester.equals(currentSemesterId)){
                classIds.push(classSemesters[i].class);
            }
        }


        let classes = await Promise.all(classIds.map(async (cId) => {
         
            return await Class.findById(cId); // Assuming Class.findById returns a promise
        }));
        courseCodes = classes.map((cls) => {
            return cls.code;
        });

        
    }
    else if(type == "instructor"){
        let instructorId = await Instructor.findOne({userId: userId});
        instructorId = instructorId._id;
        let classSemesters = await ClassSemester.find({semester: currentSemesterId, instructors: {$in: [instructorId]}});
        let classIds = [];
        for(let i = 0; i < classSemesters.length; i++){
            
            if(classSemesters[i].semester.equals(currentSemesterId)){
                classIds.push(classSemesters[i].class);
            }
        }

        let classes = await Promise.all(classIds.map(async (cId) => {
        
            return await Class.findById(cId); // Assuming Class.findById returns a promise
        }));
        courseCodes = classes.map((cls) => {
            return cls.code;
        });
    }
    else{
        let classSemesters = await ClassSemester.find({semester: currentSemesterId});
        let classIds = [];
        for(let i = 0; i < classSemesters.length; i++){
            
            if(classSemesters[i].semester.equals(currentSemesterId)){
                classIds.push(classSemesters[i].class);
            }
        }

        let classes = await Promise.all(classIds.map(async (cId) => {
            //console.log(cId);
            return await Class.findById(cId); // Assuming Class.findById returns a promise
        }));
        courseCodes = classes.map((cls) => {
            return cls.code;
        });
    }
    let chatbotNames = [];
    for(let i = 0; i < courseCodes.length; i++){
        chatbotNames.push(courseCodes[i] + " - Virtual Tutor");
        chatbotNames.push(courseCodes[i] + " - Course Chatbot");
    }
    //return ["CS 101 - Virtual Tutor", "CS 101 - Course Chatbot", "CS 223 - Virtual Tutor", "CS 223 - Course Chatbot", "CS 319 - Virtual Tutor", "CS 319 - Course Chatbot", "EEE 485 - Virtual Tutor", "EEE 485 - Course Chatbot"];
    return chatbotNames;
}



const tempDir = join(__dirname, 'Temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir)  // Use Temp directory inside Backend directory
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Post route to handle file upload
router.post('/upload', upload.single('file'), async (req, res) => {
    let file = req.file;
    let sourceName = req.body.sourceName;
    let courseName = req.body.courseName;
    let topic = req.body.topic;

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

   

    await Chatbot.addSourceToChatbot(courseName, file.path, sourceName, openai, topic);

    // Process the file here (e.g., read, modify, etc.)
    // After processing, delete the file
    fs.unlink(file.path, (err) => {
        if (err) {
            console.error("Error deleting the file:", err);
            return res.status(500).send("Error deleting the file");
        }
        res.send('File processed and deleted successfully');
    }); 
});

router.post('/getClasses', async (req, res) => {
    //console.log(req.body.userId);
    
    let userId = req.body.userId
    const classes = await getRelatedChatbots(userId);
    res.json(classes);  // Send the array of classes as JSON
});

router.post('/getSources', async (req, res) => {
    
    const cls = req.body.class; // Access the class from the request body
   
    let sources = await Chatbot.getSourcesOfChatbot(cls);
    // Example: Return an array of strings related to the class
    res.json(sources); // Respond with JSON data
    res.send();
  });

  router.post('/deleteSources', async (req, res) => {
    
    const cls = req.body.class; // Access the class from the request body

    const sourceNameArr = req.body.sourceNames;
    let promises = sourceNameArr.map((srcName) => {
        return Chatbot.removeSourceFromChatbot(cls, srcName);
    })
    Promise.all(promises).then((ress) => {
        
        res.sendStatus(200);
    })

  });

  router.post("/getPastChat", async (req, res) => {
    let userId = req.body.userId;
    let courseName = req.body.courseName;
    let words = courseName.split(" ");
    let course = words[0] + " " + words[1];
    let virtualTutor = courseName.endsWith("Virtual Tutor");
    let chatbotId;
    if(virtualTutor){
        chatbotId = await Chatbot.getChatbotId(course, 1);
    }
    else{
        chatbotId = await Chatbot.getChatbotId(course, 0);
    }
    let chatbotChatId = await ChatbotChats.getRelatedChat(chatbotId, userId);
    let pastMessages = await ChatbotChats.getPastMessages(chatbotChatId);
   
    res.json(pastMessages);
    res.send();
  })

  router.post('/sendQuery', async (req, res) => {
    let query = req.body.query; 
    let userId = req.body.userId;
    let courseName = req.body.courseName;
    let words = courseName.split(" ");
    let course = words[0] + " " + words[1];
    let virtualTutor = courseName.endsWith("Virtual Tutor");
    let chatbotId;
    if(virtualTutor){
        chatbotId = await Chatbot.getChatbotId(course, 1);
    }
    else{
        chatbotId = await Chatbot.getChatbotId(course, 0);
    }

    let chatbotChatId = await ChatbotChats.getRelatedChat(chatbotId, userId);
    await ChatbotChats.addMessageToVisibleArray(chatbotChatId, {text: query, sentBy: 0});
    let chatbotRes = await Chatbot.askQuestion(query, chatbotId, chatbotChatId, openai, 200);
    await ChatbotChats.addMessageToVisibleArray(chatbotChatId, {text: chatbotRes, sentBy: 1});

    res.json(chatbotRes);
    res.send();

  });

  router.post("/deletePastChat", async (req, res) => {
    let userId = req.body.userId;
    let courseName = req.body.courseName;
    let words = courseName.split(" ");
    let course = words[0] + " " + words[1];
    let virtualTutor = courseName.endsWith("Virtual Tutor");
    let chatbotId;
    if(virtualTutor){
        chatbotId = await Chatbot.getChatbotId(course, 1);
    }
    else{
        chatbotId = await Chatbot.getChatbotId(course, 0);
    }

    let chatbotChatId = await ChatbotChats.getRelatedChat(chatbotId, userId);
    
    await ChatbotChats.deletePastChat(chatbotChatId);
    res.status(200);
    res.send();
  });

  router.post("/getChunks", async (req, res) => {
    let courseName = req.body.courseName;
    let noOfChunks = req.body.noOfChunks;
    let offset = req.body.offset;
    let words = courseName.split(" ");
    let course = words[0] + " " + words[1];
    let virtualTutor = courseName.endsWith("Virtual Tutor");
    let chatbotId;
    if(virtualTutor){
        chatbotId = await Chatbot.getChatbotId(course, 1);
    }
    else{
        chatbotId = await Chatbot.getChatbotId(course, 0);
    }

    let chunkArr = await DocumentController.getMostUsedChunks(chatbotId, noOfChunks, offset);
    res.json(chunkArr);
    res.send();
  });

  module.exports = router;