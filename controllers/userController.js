var User = require('../models/Users');
var Post = require('../models/Posts');
var Friend = require('../models/Friends');
var Comment = require('../models/Comments');
var async = require('async');


// Get user profile
//  get user details (photo, name, bio)
//  get user posts
//  get user friends
//  get all friends