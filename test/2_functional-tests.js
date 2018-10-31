/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;

chai.use(chaiHttp);

suite('Functional Tests', function() {


  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      suiteTeardown(function(done) {
        MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, client) {
          client.db("glitch").collection("personal-library").deleteOne({title: "POST TEST"}, (err, result) => {
            client.close();
            done();
          })
        });
      });
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
        .post('/api/books')
        .send({
          title: "POST TEST"
        })
        .end(function(err, res){
          assert.equal(res.status, 200);                    
          assert.equal(res.body.title, 'POST TEST', 'Books title should be correct');
          assert.property(res.body, '_id', 'Books in array should contain _id');
          done();
        });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
        .post('/api/books')
        .send({})
        .end(function(err, res){
          assert.equal(res.status, 400);                    
          assert.equal(res.text, 'Missing title', 'Should respond with error');            
          done();
        });
      });
      
    });

    
    suite('GET /api/books => array of books', function(){     
      suiteSetup(function(done) {
        MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, client) {
          client.db("glitch").collection("personal-library").insertOne({title: "GET BOOKS TEST", commentcount: 0, comments: []}, (err, result) => {
            client.close();
            done();
          })
        });
      });
      
      suiteTeardown(function(done) {
        MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, client) {
          client.db("glitch").collection("personal-library").deleteOne({title: "GET BOOKS TEST"}, (err, result) => {
            client.close();
            done();
          })
        });
      });
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
        .get('/api/books')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'response should be an array');
          assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
          assert.property(res.body[0], 'title', 'Books in array should contain title');
          assert.property(res.body[0], '_id', 'Books in array should contain _id');
          done();
        });
      });      
      
    });
    
    suite('GET /api/books/[id] => book object with [id]', function(){
      const id = "5bb36095353b210f273c4de1";
      
      suiteSetup(function(done) {
        MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, client) {
          client.db("glitch").collection("personal-library").insertOne({_id: ObjectId(id), title: "GET BOOK TEST", commentcount: 0, comments: []}, (err, result) => {
            client.close();
            done();
          })
        });
      });
      
      suiteTeardown(function(done) {
        MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, client) {
          client.db("glitch").collection("personal-library").deleteOne({title: "GET BOOK TEST"}, (err, result) => {
            client.close();
            done();
          })
        });
      });
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
        .get('/api/books/12345')
        .end(function(err, res){
          assert.equal(res.status, 400);          
          assert.equal(res.text, 'Book not found');
          done();
        });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){        
        chai.request(server)
        .get('/api/books/'+id)
        .end(function(err, res){
          assert.equal(res.status, 200);          
          assert.equal(res.body.title, 'GET BOOK TEST', 'Books title should be correct');
          assert.property(res.body, '_id', 'Book should have _id');
          assert.isArray(res.body.comments, 'Comments properrty should be an array');
          done();
        });
      });
      
    });

    
    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      const id = "5bb3609b353b210f273c4de2";
      
      suiteSetup(function(done) {
        MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, client) {
          client.db("glitch").collection("personal-library").insertOne({_id: ObjectId(id), title: "POST COMMENT TEST", commentcount: 0, comments: []}, (err, result) => {
            client.close();
            done();
          })
        });
      });
      
      suiteTeardown(function(done) {
        MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, client) {
          client.db("glitch").collection("personal-library").deleteOne({title: "POST COMMENT TEST"}, (err, result) => {
            client.close();
            done();
          })
        });
      });
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
        .post('/api/books/'+id)
        .send({
          comment: "Test comment"
        })        
        .end(function(err, res){
          assert.equal(res.status, 200);          
          assert.equal(res.body.title, 'POST COMMENT TEST', 'Books title should be correct');
          assert.isArray(res.body.comments, 'Comments properrty should be an array');
          assert.equal(res.body.comments[0], 'Test comment', 'Book should have the posted comment');
          assert.property(res.body, '_id', 'Book should have _id');          
          done();
        });
      });
      
    });

  });

});
