const Document = require("./documentClass.js");
const lda = require('lda');
const OpenAI = require("openai");
const documentDB = require("../../schemas/document.js");


class DocumentController{
    
    constructor(){
        
    }

    static getTopicVector(text1, text2, wordCount){
        let docs = [text1, text2];
        let wordProbsMatrix = lda(docs, 2, wordCount);
        //console.log(wordProbsMatrix);
        let topicVectors = [ [0, 0], [0, 0]];
        for(let i = 0; i < 2; i++){
            for(let j = 0; j < 2; j++){
                
                let cleanedText = docs[i].replace(/[^\w\s]/g, '').toLowerCase();
                let words = cleanedText.split(/\s+/);
                let totalProbability = words.reduce((sum, word) => {
                    let wordProb = wordProbsMatrix[j].find(w => w.term === word);
                  
                    return sum + (wordProb ? wordProb.probability : 0);
                }, 0);
                topicVectors[i][j] = totalProbability;
            }
        }
        let firstSum = Math.sqrt(topicVectors[0][0] ** 2 + topicVectors[0][1] ** 2);
        let secondSum = Math.sqrt(topicVectors[1][0] ** 2 + topicVectors[1][1] ** 2);
        topicVectors[0][0] = topicVectors[0][0] / firstSum;
        topicVectors[0][1] = topicVectors[0][1] / firstSum;
        topicVectors[1][0] = topicVectors[1][0] / secondSum;
        topicVectors[1][1] = topicVectors[1][1] / secondSum;
        return topicVectors;
    }

    static calculateCosineSimilarity(topicVec){
        let dotProduct = (topicVec[0][0] * topicVec[1][0]) + (topicVec[0][1] * topicVec[1][1]);
        let len1 = Math.sqrt(topicVec[0][0] ** 2 + topicVec[0][1] ** 2);
        let len2 = Math.sqrt(topicVec[1][0] ** 2 + topicVec[1][1] ** 2);
        return dotProduct / (len1 * len2);
    }

    static topicSplit(docs, maxNumberOfUnites, sourceName, relatedChatbot){
        let length = docs.length;
        let docArray = [];
        for(let i = 0; i < length - maxNumberOfUnites; i++){
            let docText = docs[i].pageContent;
            let pageNumber = docs[i].metadata.loc.pageNumber;
            for(let j = i; j < i + maxNumberOfUnites; j++){
                if(j == (i + maxNumberOfUnites - 1)){
                    i = j + 1;
                }
                let text1 = docs[j].pageContent;
                if((j + 1) >= length){
                    break;
                }
                let text2 = docs[j + 1].pageContent; // problem
                let topicVec = this.getTopicVector(text1, text2, 5);
                let sim = this.calculateCosineSimilarity(topicVec);
                
                if(sim >= 0.9){
                    docText = docText + " " + text2;
                    
                }
                else{
                    i = j;
                    break;
                }
            }
            let document = new Document(docText, sourceName, pageNumber, relatedChatbot);
            docArray.push(document);
        }
        return docArray;
    }

    static async getEmbeddingVectors(docs, openai){
        let arr = [];
        for(let i = 0; i < docs.length; i++){
            arr.push(docs[i].text);
        }

        let embeddings = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: arr,
            encoding_format: "float",
        }); 

        for(let i = 0; i < docs.length; i++){
            docs[i].embedding = embeddings.data[i].embedding;
        }
    }

    static async getMostUsedChunks(chatbotId, noOfChunks, offset){
        let docs = await documentDB.find({ relatedChatbot: chatbotId })
        .sort({ usageCount: -1 }) 
        .skip(offset) 
        .limit(noOfChunks); 
        
        let array = docs.map((doc) => {
            return {text: doc.text, sourceName: doc.sourceName, pageNumber: doc.pageNumber, usageCount: doc.usageCount};
        });
        return array;
        
    }


}

module.exports = DocumentController;