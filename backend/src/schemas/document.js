const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let documentSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    sourceName: {
        type: String,
        required: true
    },
    pageNumber: {
        type: Number,
        required: true
    },
    usageCount: {
        type: Number,
        required: true
    },
    relatedChatbot: {
        type: String,
        required: true
    },
    embedding: {
        type: [Number],
        required: true
    }
    }, {timestamps: true});

    let documentDB = mongoose.model("documentDB", documentSchema);

    module.exports = documentDB;