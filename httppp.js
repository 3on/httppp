var http = require('http')
var https = require('https')
var url = require('url')
var querystring = require('querystring')
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

function jsDOM (html, callback) {
  jsdom.env({
       html: html
      ,scripts: ['./jquery-1.7.1.min.js']
      },
      function(error, window) {
        if (error)
          console.log('JsDOM Error:', error)

        callback(window)
      }
    )
}

function jsDOMwithHTML5 (html, callback) {
  console.log('Not yet implemented !')
}

function runQuery (query, session) {
    var q = cutUrl(query.url);
    q.headers = query.headers || [];
    q.method = query.method;

    if (session) {
      // FIXME: Cookies, specific headers, w/e...
    }
    
    if (query.method == 'POST') {
      query.body = querystring.stringify(query.data)
      q.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      q.headers['Content-Length'] = query.body.length
    }
    
    var req = (q.ssl === true) ? https.request(q) : http.request(q)
    
    req.on('response', function(res) {
        query.response = res;
        query.resData = '';
        res.on('data', function(d) {
          // FIXME:  Data needs to be buffered for non string data like .torrent Doh !
            query.resData += d;
        });
        
        res.on('end', function() {
          // FIXME: End of buffering
          console.log(res.statusCode, res.headers.location)
          
          // FIXME: 302 redirection res.location INFINITE REDIRECTION TO FIX
          // res.headers.location
          if (session && session.followRedirection && res.statusCode == 302) {
            query.url = res.headers.location
            runQuery(query, session)
          }
          
          // FIXME: process header -> process cookies
          // res.headers
          
          // FIXME: filter pre parsor for lame html errors
          // FIXME: call callback or jsDom
          if (session && session.jsdom) {
            if (session.html5)
              jsDOMwithHTML5(query.resData, query.cb)
            else
              jsDOM(query.resData, query.cb)
          }
          else {
            query.cb(query.resData)
          }
        })
    })
    
    req.on('error', function(e) {
        console.error('Could not complete query: ' + e.message);
    });
    
    // write body (for POST and PUT? queries)
    if (query.body) {
        req.write(query.body);
    }
    
    // if we don't end, it will never gonna give you up
    req.end();
}

function stackQuery (argument, sId) {
  var sess = sessions[sId];
  sess.queries ? sess.queries.push(argument) : sess.queries = [argument];
}

exports.session = function(opt) {
  var n = {name: uniq(), stacked: true, jsdom: false, html5: false, followRedirection: true,  queries: [], cookies: []}
  
  if (opt) {
    if ( _.isString(opt) )
      n.name = opt
    else {
      n.name = opt.name || uniq()
      n.stacked = opt.stacked || true
      n.jsdom = opt.jsdom || false
      n.html5 = opt.html5 || false
      n.followRedirection = opt.followRedirection || true
    }
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
    var sId = (name) ? getSessionIdByName(name) : getLastSessionId();
    if (sId == -1) {
      console.log('Session not found')
      return
    }
    _.each(sessions[sId].queries, function(q) {
        runQuery(q, sessions[sId]);
    });
}