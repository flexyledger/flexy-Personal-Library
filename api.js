/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, client) {
        client.db("glitch").collection("personal-library").find({},{_id: 1, title: 1, commentcount: 1}).toArray((err, result) => {
          if(err) {res.status(400); res.send("Error occured, please try again");}
          else res.send(result);
          client.close();
        });
      });
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(function (req, res){
      var title = req.body.title;
      if(!title) {res.status(400);res.send("Missing title"); return}
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, client) {
        client.db("glitch").collection("personal-library").insertOne({title, commentcount: 0, comments: []}, (err, result) => {
          if(err) {res.status(400); res.send("Error occured, please try again");}
          else {
            let obj = {_id: result.ops[0]._id, title: title};
            res.send(obj);
          }
          client.close();
        });
      });
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, client) {
        client.db("glitch").collection("personal-library").deleteMany({}, (err, result) => {
          if(err) {res.status(400); res.send("Error occured, please try again");}
          else res.send("Complete delete successful");
          client.close();
        });
      });
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
    
      try {let id = ObjectId(bookid);}
      catch(err) {res.status(400); res.send("Book not found"); return}
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, client) {
        client.db("glitch").collection("personal-library").find({_id: ObjectId(bookid)}).toArray((err, result) => {
          if(err) {res.status(400); res.send("Error occured, please try again");}
          else res.send(result[0]);          
          client.close(); 
        }); 
      });
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
    
      try {let id = ObjectId(bookid);}
      catch(err) {res.status(400); res.send("Book not found"); return}
    
      var comment = req.body.comment;
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, client) {
        client.db("glitch").collection("personal-library").findOneAndUpdate({_id: ObjectId(bookid)}, {$push: {comments: comment}, $inc: {commentcount: 1}}, {returnOriginal: false}, (err, result) => {
          if(err) {res.status(400); res.send("Error occured, please try again");}
          else res.send(result.value);          
          client.close();
        });
      });
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
    
      try {let id = ObjectId(bookid);}
      catch(err) {res.status(400); res.send("Book not found"); return}
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, client) {
        client.db("glitch").collection("personal-library").deleteOne({_id: ObjectId(bookid)}, (err, result) => {
          if(err) {res.status(400); res.send("Error occured, please try again");}
          else res.send("delete successful");
          client.close();
        });
      });
      //if successful response will be 'delete successful'
    });
  
};
