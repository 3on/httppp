var http = require('http')
var https = require('https')
var url = require('url')
var _ = require('underscore')
var jsdom = require('jsdom')
var html5 = require('html5')


var sessions = []

function getSessionByName (name) {
    return _.find(sessions, function(e) {
        return (e.name == name)
    });
}

function getSessionIdByName (name) {
  return sessions.indexOf(getSessionByName(name));
}

function cutUrl(str) {
    var urlData = url.parse(str)
    return {
        host : urlData.hostname,
        ssl  : urlData.protocol == 'https:',
        port : urlData.port || (urlData.protocol == 'https:' ? 443 : 80),
        path : urlData.pathname + (urlData.search || '') + (urlData.hash || ''),
        
    };
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
    var q = cutUrl(query.url);
    q.headers = query.headers;
    q.method = query.method;

    if (session) {
        // FIXME: Cookies, specific headers, w/e...
    }
    
    var req = (query.ssl) ? http.request(q) : http.request(q)
    
    req.on('response', function(res) {
        query.response = res;
        query.resData = '';
        res.on('data', function(d) {
          // FIXME:  Data needs to be buffered for non string data like .torrent Doh !
            query.resData += d;
        });
        
        res.on('end', function() {
          // FIXME: End of buffering
          
          // FIXME: process header -> process cookies
          
          // FIXME: call callback or jsDom
          if (session && session.jsdom) {
            // FIXME: jsDOM init
            if (session.html5) {
              // with html5 parsor
            }
          }
          else {
            query.cb(query.resData)
          }
        })
    })
    
    req.on('error', function(e) {
        console.error('Could not complete query: ' + e.message);
    });
    
    if (query.data) {
        req.write(query.data);
    }
    req.end();
}

function stackQuery (argument, sId) {
  var sess = sessions[sId];
  sess.queries ? sess.queries.push(argument) : sess.queries = [argument];
}

exports.session = function(opt) {
  var n = {name: uniq(), stacked: true, jsdom: false, html5: false, queries: [], cookies: []}
  
  if (opt) {
    n.name = opt.name || uniq()
    n.stacked = opt.stacked || true
    n.jsdom = opt.jsdom || false
    n.html5 = opt.html5 || false
  } 

  sessions.push(n)
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

exports.query = function(opt, sessionName) {
  if (sessions.length == 0 || ( opt && (opt.stacked == false)) )
    return runQuery(opt /*, opt */)

  return stackQuery(opt, sessionName ?
      getSessionIdByName(sessionName) : getLastSessionId());
}

exports.run = function(name) {
    var sId = name ? getSessionIdByName(name) : getLastSessionId();
    _.each(sessions[sId].queries, function(q) {
        runQuery(q, sessions[sId]);
    });
}