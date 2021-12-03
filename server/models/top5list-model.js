const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Top5ListSchema = new Schema(
    {
        name: { type: String, required: true },
        items: { type: [String], required: true },
        ownerUsername: {type: String, required: true},
        published: {type: Boolean, required: true},
        publishDate: {type: Date, required: false},
        views: {type: Number, required: true},
        ratings: {type: Map, required: true},
        comments: {type: [{String, String}], required: true}

    },
    { timestamps: true },
)

module.exports = mongoose.model('Top5List', Top5ListSchema)
