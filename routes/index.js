const express = require('express');
let router = express.Router();
const connection = require('../config/db.js');

const base62 = require('../lib/base62.js');
const normalizeUrl = require('../lib/normalize.js');

const HOST_NAME = 'https://localhost:3000/r'

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* CREATE short url */
router.post('/shorten', function(req, res, next) {

  // Takes care of the URI cleanup
  let originalUrl = normalizeUrl(originalUrl,{normalizeHttps: true});

  // Insert the url to DB
  const insertQuery = 'INSERT INTO `url_list` (url) SELECT * FROM (SELECT ?) AS tmp WHERE NOT EXISTS (SELECT `id` FROM `url_list` WHERE `url` = ?) LIMIT 1;'
  connection.query(insertQuery , [originalUrl, originalUrl], function (error, results, fields) {
    if(error){
      res.send({
        'status' : 'request unsuccessful'
      })
    }

    // GET THE ID
    const getIdQuery = 'SELECT `id` FROM `url_list` WHERE `url` = ?'
    connection.query(getIdQuery , [originalUrl], function (error, results, fields) {
      if(error){
        res.send({
          'status' : 'request unsuccessful'
        })
      }

      // converting this id to base 62
      const url_id = results[0].id;
      const shortenedUrl = base62.encode(url_id);

      // INSERT the short URL
      const insertEncodeQuery = 'INSERT INTO `short_url` (url, parent_id) SELECT * FROM (SELECT ? as col1, ? as col2) AS tmp WHERE NOT EXISTS (SELECT `url` FROM `short_url` WHERE `url` = ?) LIMIT 1;'
      connection.query(insertEncodeQuery , [shortenedUrl, url_id, shortenedUrl], function (error, results, fields) {
        if(error){
          res.send({
            'status' : 'request unsuccessful'
          })
        }
        res.send({
          'url' : HOST_NAME + '/' + shortenedUrl
        })
      });
    });
  });
});

/* REDIRECT */
router.get('/r/:shortUrl', function(req, res, next) {
  const findParentQuery = 'SELECT `url` FROM `url_list` WHERE `id` IN (SELECT `parent_id` FROM `short_url` WHERE `url` = ?)'
  connection.query(findParentQuery , [req.params.shortUrl], function (error, results, fields) {
    if(error){
      res.send({
        'status' : 'request unsuccessful'
      })
    }
    if(!results){
      res.send({
        'status' : 'Error: Invalid URL'
      })
    }
    const parentUrl = results[0].url;
    res.redirect(302, parentUrl);
  });
});

/* GET ALL SHORT URLS */
router.get('/allShortUrls', function(req, res, next) {
  const findAllUrls = 'SELECT `url` FROM `short_url`'
  connection.query(findAllUrls, function (error, results, fields) {
    if(error){
      res.send({
        'status' : 'request unsuccessful'
      })
    }
    let url_list = [];
    results.forEach(function(entry) {
        url_list.push(HOST_NAME + '/' + entry.url)
    });
    res.send({
      'short_url_list' : url_list
    })
  });
});

/* FETCH ORIGINAL URL */
router.post('/fetch', function(req, res, next) {

  // Ensuring URLS are of required format
  const bodyArr = req.body.shortUrl.split( '/' ).reverse();
  if (bodyArr[1] != 'r' || bodyArr[2] != 'localhost:3000'){
    res.send({
      'status' : 'Error: Invalid URL'
    })
  }
  const shortUrl = bodyArr[0];

  // Finding the parent URL
  const findParentQuery = 'SELECT `url` FROM `url_list` WHERE `id` IN (SELECT `parent_id` FROM `short_url` WHERE `url` = ?)'
  connection.query(findParentQuery , [shortUrl], function (error, results, fields) {
    if(error){
      res.send({
        'status' : 'request unsuccessful'
      })
    }
    // entry doesn't exist
    if(!results){
      res.send({
        'status' : 'Error: Invalid URL'
      })
    }
    const parentUrl = results[0].url;
    res.send({
      'original_url' : parentUrl
    })
  });
});

/* DELETE URLs */
router.post('/delete', function(req, res, next) {
  let url_list = []
  req.body.shortUrls.forEach(function(entry) {
    const bodyArr = entry.split( '/' ).reverse();
    // Ensuring URLS are of required format
    if (bodyArr[1] != 'r' || bodyArr[2] != 'localhost:3000'){
      continue;
    }
    url_list.push(bodyArr[0]);
  });
  const findParentQuery = 'DELETE FROM `short_url` WHERE `url` IN ?'
  connection.query(findParentQuery , [[url_list]], function (error, results, fields) {
    if(error){
      res.send({
        'status' : 'request unsuccessful'
      })
    }
    res.send({
      'status' : 'success'
    })
  });
});

module.exports = router;
