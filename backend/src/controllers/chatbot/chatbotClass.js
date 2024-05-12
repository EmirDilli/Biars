const { PDFLoader } = require("langchain/document_loaders/fs/pdf");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const Document = require("./documentClass.js");
const DocumentController = require("./documentController.js");
const documentDB = require("../../schemas/document.js");
const chatbotDB = require("../../schemas/chatbot.js");
const chatbotChatsDB = require("../../schemas/chatbotChat.js");
const mongoose = require("mongoose");
const Mongoose = mongoose.Mongoose; // If you need to specifically require Mongoose class
const ChatbotChats = require("./chatbotChatClass.js");
const ChatbotMessage = require("./chatbotMessageClass.js");


class Chatbot{
    sources;
    countOfSources;
    relatedCourse;
    chatbotType; // 0 for courseChatbot, 1 for virtualTutor


    constructor(relatedCourse, chatbotType){
        this.sources = [];
        this.countOfSources = 0;
        this.relatedCourse = relatedCourse;
        this.chatbotType = chatbotType;
    }

    set sources(newSources){
        this.sources = newSources;
    }

    set countOfSources(newCountOfSources){
        this.countOfSources = newCountOfSources;
    }

    set relatedCourse(newRelatedCourse){
        this.relatedCourse = newRelatedCourse;
    }

    set chatbotType(newChatbotType){
        this.chatbotType = newChatbotType;
    }

    get sources(){
        return this.sources;
    }

    get countOfSources(){
        return this.countOfSources;
    }

    get relatedCourse(){
        return this.relatedCourse;
    }

    get chatbotType(){
        return this.chatbotType;
    }



    static async createNewChatbot(chatbot){
        await chatbotDB.create({
            sources: chatbot.sources,
            countOfSources: chatbot.countOfSources,
            relatedCourse: chatbot.relatedCourse,
            chatbotType: chatbot.chatbotType
        }).then((res) => {
            return res._id;
        }).catch((err) => {
            //console.log("Error: " + err);
            return null;
        });
    }

    static async deleteChatbotWithId(chatbotId){
        //let id = mongoose.Types.ObjectId(chatbotId);
        let deleted = await chatbotDB.findByIdAndDelete(chatbotId);
        if(deleted){
            return true;
        }
        else{
            return false;
        }

    }

    static async getChatbotId(courseCode, chatbotType){ // by course
        return await chatbotDB.findOne({relatedCourse: courseCode, chatbotType: chatbotType}).then((res) => {
            return res._id;
        }).catch((err) => {
          //  console.log("Error: " + err);
            return null;
        });
    } 

    static async sourceExists(chatbotId, sourceName){
        let doc = await chatbotDB.findOne({_id: chatbotId, sources: {$in: [sourceName]}});

        if(doc){
            return true;
        }
        else{
            return false;
        }

    }

    static async addSource(chatbotId, sourceName, openai, filePath, doTopicSplit){

        let alreadyExists = await this.sourceExists(chatbotId, sourceName);
        if(alreadyExists){
            console.log("Source already exists!");
            return false;
        }
        let loader = new PDFLoader(filePath, {
            parsedItemSeparator: "",
        });
        let langchainDocs = await loader.load();
        let splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 100,
            separators: ["\n\n", "."],
        });
        const splittedDocs = await splitter.splitDocuments(langchainDocs);
        let documents;
        if(doTopicSplit){
            documents = DocumentController.topicSplit(splittedDocs, 3, sourceName, chatbotId);
        }
        else{
            documents = [];
            for(let i = 0; i < splittedDocs.length; i++){
                documents.push(new Document(splittedDocs[i].pageContent, sourceName, splittedDocs[i].metadata.loc.pageNumber, chatbotId));
            } 
        }
        
        let embeddingsDone = await DocumentController.getEmbeddingVectors(documents, openai);
        // look later - embeddingsDone!!!!!!!!
        //console.log(documents[0]);
        await documentDB.insertMany(documents);
        
        //let id = new mongoose.Types.ObjectId(chatbotId);
        await chatbotDB.findByIdAndUpdate(chatbotId, {$push: { sources: sourceName}});
        return true;

    }

    static async getSources(chatbotId){
        let chatbot = await chatbotDB.findById(chatbotId);
        return chatbot.sources;
    }

    static async removeSource(chatbotId, sourceName){
        let alreadyExists = await this.sourceExists(chatbotId, sourceName);
        if(!alreadyExists){
            console.log("Source does not exist!");
            return false;
        }
        //let id = mongoose.Types.ObjectId(chatbotId);
        await chatbotDB.findByIdAndUpdate(chatbotId, {$pull: {sources: sourceName}});

        await documentDB.deleteMany({sourceName: sourceName});

        return true;

    }

    static async removeAllSources(chatbotId){
        //let id = mongoose.Types.ObjectId(chatbotId);
        await chatbotDB.findByIdAndUpdate(chatbotId, {sources: {$set: [] }});
    }

    static async getLastMessages(chatBotChatId, numberOfMessages){
        //let id = mongoose.Types.ObjectId(chatBotChatId);
        let messageArray = await chatbotChatsDB.findById(chatBotChatId, {messageArray: {$slice: (-1 * numberOfMessages)}});
        //console.log("bbbbbbbb");
        //console.log(messageArray);
        return messageArray;
    }

    static async getEmbeddingOfText(text, openai){
        let embedding = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text,
            encoding_format: "float",
        });
        return embedding.data[0].embedding;
    }

    static async askQuestion(query, chatbotId, chatbotChatId, openai, maxNoOfTokens){
        let messageArray = await this.getLastMessages(chatbotChatId, 5);
        messageArray = messageArray.messageArray;
        /* console.log("\n\nHERE: " + messageArray.length);
            console.log(messageArray + "\n\n"); */

        let prompt = "Our past chat is: \n\n";
        for(let i = 0; i < messageArray.length; i++){
            
            if(messageArray[i].sentBy == 0){
                prompt += "User: \n";
            }
            else{
                prompt += "Chatbot: \n";
            }
            prompt += messageArray[i].text + "\n";
        }

        let hydeQuery = "Generate an hypothetical answer for the following questions, your answer will be used as a part of Hyde process(for Retrieval Augmented Generation) so try to use related keywords\n Question: " + query;
        let hydeAns = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{role: "user", content: hydeQuery}]
        });
        hydeAns = hydeAns.choices[0].message.content;
        //console.log("Hyde ans: " + hydeAns);


        let queryEmbedding = await this.getEmbeddingOfText(hydeAns, openai);

        let chatbotIdString = chatbotId.toString();
        //console.log(chatbotIdString + "wdvwdw");
        let dbQuery = [{
            '$vectorSearch': {
              'index': 'vector_index', 
              'path': 'embedding', 
              'queryVector': queryEmbedding, 
              'numCandidates': 50, 
              'limit': 3,
              "filter": {
                relatedChatbot: chatbotIdString
              }
            }
          }]
       
        let result = await documentDB.aggregate(dbQuery);

        let idsOfDocs = result.map(doc => doc._id);
        await documentDB.updateMany({_id: {$in: idsOfDocs}}, {$inc: {usageCount: 1}});

        let textOfDocs = result.map(doc => doc.text);

        query = query + "\nHere are some chunks of texts for you to answer the question above, please use the texts provided and if you don't know the answer(if the answer is not existing in the provided chunks, say I dont know. However, you can do reasonings based on the provided texts.\n";

        for(let i = 0; i < textOfDocs.length; i++){
            query = query + String(i) + ") " + textOfDocs[i] + "\n";
        }
        //console.log(result);
        
        let chatbotUserMsg = new ChatbotMessage(query, 0);
        await ChatbotChats.addMessageToChat(chatbotChatId, chatbotUserMsg);
        let queryToSend = prompt + query; 
        //console.log("Query to send: " + queryToSend);
        let llmResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-0125",
            messages: [{role: "user", content: queryToSend}],
            max_tokens: maxNoOfTokens
        });
        //console.log(llmResponse);
        //console.log("LLM res: " + llmResponse.choices[0].message.content);
        let chatbotMsg = new ChatbotMessage(llmResponse.choices[0].message.content, 1);
        await ChatbotChats.addMessageToChat(chatbotChatId, chatbotMsg);
        return llmResponse.choices[0].message.content;


    }

    static async getMostUsedChunks(chatbotId, noOfChunks){

    }

    static async getSourcesOfChatbot(chatbotName){
        let words = chatbotName.split(" ");
        let course = words[0] + " " + words[1];
        let virtualTutor = chatbotName.endsWith("Virtual Tutor");
        let chatbotId;
        if(virtualTutor){
            chatbotId = await this.getChatbotId(course, 1);
        }
        else{
            chatbotId = await this.getChatbotId(course, 0);
        }
        return await this.getSources(chatbotId);
    }

    static async addSourceToChatbot(courseCode, pdfLoc, sourceName, openai, topic){
        let words = courseCode.split(" ");
        let course = words[0] + " " + words[1];
        let virtualTutor = courseCode.endsWith("Virtual Tutor");
        let chatbotId;
        if(virtualTutor){
            chatbotId = await this.getChatbotId(course, 1);
        }
        else{
            chatbotId = await this.getChatbotId(course, 0);
        }
        //console.log("Chatbot Id: " + chatbotId);
        if(topic == "topicBased"){
           // console.log("TOPIC BASED!");
            return await this.addSource(chatbotId, sourceName, openai, pdfLoc, true);
        }
        else{
           // console.log("NORMAL");
            return await this.addSource(chatbotId, sourceName, openai, pdfLoc, false);
        }
        
    }

    static async removeSourceFromChatbot(courseCode, sourceName){
      
        let words = courseCode.split(" ");
        let course = words[0] + " " + words[1];
        let virtualTutor = courseCode.endsWith("Virtual Tutor");
        let chatbotId;
        if(virtualTutor){
            chatbotId = await this.getChatbotId(course, 1);
        }
        else{
            chatbotId = await this.getChatbotId(course, 0);
        }
        await this.removeSource(chatbotId, sourceName);
        return;
    }
};

module.exports = Chatbot;