const chatbotChatsDB = require("../../schemas/chatbotChat.js");



class ChatbotChats{
    relatedChatbot;
    messageArray;
    relatedUser;
    visibleMessages;

    constructor(relatedChatbot, relatedUser){
        this.relatedChatbot = relatedChatbot;
        this.messageArray = [];
        this.relatedUser = relatedUser;
        this.visibleMessages = [];
    }

    set relatedChatbot(newRelatedChatbot){
        this.relatedChatbot = newRelatedChatbot;
    }

    set messageArray(newMessageArray){
        this.messageArray = newMessageArray;
    }

    set relatedUser(newRelatedUser){
        this.relatedUser = newRelatedUser;
    }

    set visibleMessages(newVM){
        this.visibleMessages = newVM;
    }

    get relatedChatbot(){
        return this.relatedChatbot;
    }

    get messageArray(){
        return this.messageArray;
    }

    get relatedUser(){
        return this.relatedUser;
    }
    
    get visibleMessages(){
        return this.visibleMessages;
    }


    static async createNewChatbotChat(relatedChatbot, relatedUser){
        let newChat = [new ChatbotChats(relatedChatbot, relatedUser)];
        return chatbotChatsDB.insertMany(newChat).then(res => {
            return res[0]._id;
        });

    }

    static async addMessageToChat(chatbotChatId, chatbotMessage){
        await chatbotChatsDB.findByIdAndUpdate(chatbotChatId, {$push: {messageArray: chatbotMessage}});
    }

    static async getRelatedChat(relatedChatbot, relatedUser){
        return chatbotChatsDB.findOne({relatedChatbot: relatedChatbot, relatedUser: relatedUser}).then((res) => {
            return res._id;
        })
    }

    static async addMessageToVisibleArray(chatbotChatId, chatbotMessage){
        await chatbotChatsDB.findByIdAndUpdate(chatbotChatId, {$push: {visibleMessages: chatbotMessage}});
    }

    static async getPastMessages(chatbotChatId){
        let object = await chatbotChatsDB.findById(chatbotChatId);
        let messageArray = object.visibleMessages;
        return messageArray;
    }

    static async deletePastChat(chatBotChatId){
        await chatbotChatsDB.findByIdAndUpdate(chatBotChatId, {messageArray: [], visibleMessages: []});
        
    }


};

module.exports = ChatbotChats;