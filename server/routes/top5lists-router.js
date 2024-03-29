const auth = require('../auth')
const express = require('express')
const Top5ListController = require('../controllers/top5list-controller')
const CommunityListController = require('../controllers/communitylist-controller')
const UserController = require('../controllers/user-controller')
const router = express.Router()

router.post('/top5list', Top5ListController.createTop5List)
router.put('/top5list/:id', Top5ListController.updateTop5List)
router.delete('/top5list/:id', Top5ListController.deleteTop5List)
router.get('/top5list/:id', Top5ListController.getTop5ListById)
router.get('/top5lists', Top5ListController.getTop5Lists)

router.post('/communitylist', CommunityListController.createCommunityList)
router.put('/communitylist/:id', CommunityListController.updateCommunityList)
router.delete('/communitylist/:id', CommunityListController.deleteCommunityList)
router.get('/communitylist/:id', CommunityListController.getCommunityListById)
router.get('/communitylists', CommunityListController.getCommunityLists)

router.post('/login', UserController.loginUser)
router.post('/register', UserController.registerUser)
router.get('/loggedIn', UserController.getLoggedIn)
router.get('/logout', UserController.logoutUser)
module.exports = router