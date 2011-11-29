HTTPpp
=======

What is it ?
------------
HTTPpp is a wrapper on top of node's http client module. It is meant to be easy to use and to bring cool features such as cookies sessions with stacked queries and JSDOM with parsor HTML5. 


Examples
--------

    var httppp = require('httppp')
    httppp.session({name:'example.com', stacked: true, jdom: true})
    
    httppp.post('/login', {login: 'dude', password: '123456'}, cb)
    httppp.get('/', [{}], cb)
    
    // {url: , data: , cb: , session: }
    httppp.post({url: '/login', data: {login: 'dude', password: '123456'} cb: cb})
    httppp.get({url: '/',data: {}, cb: cb})
    
    httppp.run('name', [cb])