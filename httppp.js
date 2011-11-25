var http = require('http')
var https = require('https')
var url = require('url')
var _ = require('underscore')
var jsdom = require('jsdom')
var html5 = require('html5')


var sessions = []

function getSessionByName (name) {
  return _.(sessions, function(e) { return e.name == name })
}

function getSessionIdByName (name) {
  var id = null
  
  _.each(sessions, function(s, i) {
    if (e.name == name )
     id = i
  })
  
  return id
}

function  getLastSession() {
  if (sessions.length == 0)
    return console.error('No session found')
  
  return sessions[sessions.length - 1]
}

function  getLastSessionId() {
  if (sessions.length == 0)
    return console.error('No session found')
  
  return sessions.length - 1
}

function uniq () {
  return 'Session ' + sessions.length
}

function runQuery (query, session) {
  // body...
}

function stackQuery (argument) {
  // body...
}

exports.session = function(opt) {
  var n = {name: uniq(), stacked: true, jsdom: false, html5: false, queries: [], coockies: []}
  
  if (opt) {
    n.name = opt.name | uniq()
    n.stacked = opt.stacked != undefined | true
    n.jsdom = opt.jsdom != undefined | true
    n.html5 = opt.html5 != undefined | true
  } 
  
  session.push(n)
}
exports.get = function(opt) {
  if (!opt)
    return console.error('GET needs some options get({url:\'example.com\'})')
  
  if (!opt.url)
    return console.error('GET needs an URL get({url:\'example.com\'})')
    
  opt.method = 'GET'
  
  exports.query(opt)
}

exports.post = function(opt) {
  if (!opt)
    return console.error('POST needs some options post({url:\'example.com\'})')
  
  if (!opt.url)
    return console.error('POST needs an URL post({url:\'example.com\'})')
    
  opt.method = 'POST'
  
  exports.query(opt)
}

exports.query = function(opt) {
  
  if (session.length == 0 || ( opt && (opt.stacked == false)) )
    return runQuery(opt, opt)

  return stackQuery(opt)
}

exports.run = function(name) {
  if (name)
    var sId = getSessionIdByName(name)
  else
    var sId = getLastSessionId()
    
  _.each()
}

