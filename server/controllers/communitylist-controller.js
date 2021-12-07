const CommunityList = require('../models/communitylist-model');

createCommunityList = (req, res) => {
    const body = req.body;
    console.log(body);
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a Community List',
        })
    }

    const communityList = new CommunityList(body);
    console.log("creating communityList: " + JSON.stringify(communityList));
    if (!communityList) {
        return res.status(400).json({ success: false, error: err })
    }

    communityList
        .save()
        .then(() => {
            return res.status(201).json({
                success: true,
                top5List: communityList,
                message: 'Community List Created!'
            })
        })
        .catch(error => {
            return res.status(400).json({
                error,
                message: 'Community List Not Created!'
            })
        })
}

updateCommunityList = async (req, res) => {
    const body = req.body
    console.log("updateCommunityList: " + JSON.stringify(body));
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a body to update',
        })
    }

    CommunityList.findOne({ _id: req.params.id }, (err, communityList) => {
        console.log("communityList found: " + JSON.stringify(communityList));
        if (err) {
            return res.status(404).json({
                err,
                message: 'Community List not found!',
            })
        }

        communityList.name = body.name;
        communityList.items = body.items;
        communityList.views = body.views;
        communityList.ratings = body.ratings;
        communityList.likes = body.likes;
        communityList.dislikes = body.dislikes;
        communityList.comments = body.comments;
        communityList
            .save()
            .then(() => {
                console.log("SUCCESS!!!");
                return res.status(200).json({
                    success: true,
                    id: communityList._id,
                    message: 'Community List updated!',
                })
            })
            .catch(error => {
                console.log("FAILURE: " + JSON.stringify(error));
                return res.status(404).json({
                    error,
                    message: 'Community List not updated!',
                })
            })
    })
}

deleteCommunityList = async (req, res) => {
    CommunityList.findById({ _id: req.params.id }, (err, communityList) => {
        if (err) {
            return res.status(404).json({
                err,
                message: 'Community List not found!',
            })
        }
        CommunityList.findOneAndDelete({ _id: req.params.id }, () => {
            return res.status(200).json({ success: true, data: communityList })
        }).catch(err => console.log(err))
    })
}

getCommunityListById = async (req, res) => {
    await CommunityList.findById({ _id: req.params.id }, (err, list) => {
        if (err) {
            return res.status(400).json({ success: false, error: err });
        }
        return res.status(200).json({ success: true, communityList: list })
    }).catch(err => console.log(err))
}

getCommunityLists = async (req, res) => {
    await CommunityList.find({}, (err, communityLists) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!communityLists.length) {
            return res
                .status(404)
                .json({ success: false, error: `Community Lists not found` })
        }
        return res.status(200).json({ success: true, data: communityLists })
    }).catch(err => console.log(err))
}

module.exports = {
    createCommunityList,
    updateCommunityList,
    deleteCommunityList,
    getCommunityLists,
    getCommunityListById
}