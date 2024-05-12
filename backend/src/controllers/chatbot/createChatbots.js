const {Class} = require("../../schemas/index");
const Chatbot = require("./chatbotClass");
module.exports.createChatbots = async () => {
    let courseList = await Class.distinct("code");
    
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
};