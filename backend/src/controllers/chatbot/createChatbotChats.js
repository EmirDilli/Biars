const {Class, Section, Semester, ClassSemester, Student, Instructor, TA, User} = require("../../schemas/index");
const Chatbot = require("./chatbotClass");
const ChatbotChats = require("./chatbotChatClass");



async function createChatbotChats(userId, usersCourseList){
    let promises = usersCourseList.map(async (courseName) => {
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
        return await ChatbotChats.createNewChatbotChat(chatbotId, userId);
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
    
    return chatbotNames;
}

module.exports.createChatbotChats = async () => {
    let userIdArray = await User.find({});
    userIdArray = userIdArray.map((user) => {
        return user._id;
    });
    let relatedChatbotArrays = await Promise.all(userIdArray.map(async (userId) => {
        return await getRelatedChatbots(userId);
    }));
    
    await Promise.all(relatedChatbotArrays.map(async (chatbotArr, index) => {
        return await createChatbotChats(userIdArray[index], chatbotArr);
    }));

}