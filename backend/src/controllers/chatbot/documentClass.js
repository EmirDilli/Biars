class Document{
    text;
    sourceName;
    pageNumber;
    usageCount;
    relatedChatbot;
    embedding;

    constructor(text, sourceName, pageNumber, relatedChatbot){
        this.text = text;
        this.sourceName = sourceName;
        this.pageNumber = pageNumber;
        this.usageCount = 0;
        this.relatedChatbot = relatedChatbot;
        this.embedding = null;
    }

    set text(newText){
        this.text = newText;
    }

    set sourceName(newSourceName){
        this.sourceName = newSourceName;
    }

    set pageNumber(newPageNumber){
        this.pageNumber = newPageNumber;
    }

    set usageCount(newUsageCount){
        this.usageCount = newUsageCount;
    }

    set relatedChatbot(newRelatedChatbot){
        this.relatedChatbot = newRelatedChatbot;
    }

    set embedding(newEmb){
        this.embedding = newEmb;
    }

    get text(){
        return this.text;
    }

    get sourceName(){
        return this.sourceName;
    }

    get pageNumber(){
        return this.pageNumber;
    }

    get usageCount(){
        return this.usageCount;
    }

    get relatedChatbot(){
        return this.relatedChatbot;
    }

    get embedding(){
        return this.embedding;
    }

    
}

module.exports = Document;