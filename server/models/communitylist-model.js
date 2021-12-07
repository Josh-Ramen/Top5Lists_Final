const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CommunityListSchema = new Schema(
    {
        name: { type: String, required: true },
        items: { type: Array, required: true },
        published: {type: Boolean, required: true},
        publishDate: {type: Date, required: false},
        views: {type: Number, required: true},
        ratings: {type: Map, required: true},
        likes: {type: Number, required: true},
        dislikes: {type: Number, required: true},
        comments: {type: Array, required: true}

    },
    { timestamps: true },
)

module.exports = mongoose.model('CommunityList', CommunityListSchema)
