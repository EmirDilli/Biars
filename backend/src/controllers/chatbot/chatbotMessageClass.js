class ChatbotMessage{
    text;
    sentBy; // 0 for user, 1 for chatbot

    constructor(text, sentBy){
        this.text = text;
        this.sentBy = sentBy;
    }

    set text(newText){
        this.text = newText;
    }

    set sentBy(newSentBy){
        this.sentBy = newSentBy;
    }

    get text(){
        return this.text;
    }

    get  sentBy(){
        return this.sentBy;
    }
};

module.exports = ChatbotMessage;