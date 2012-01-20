var httppp = require('./httppp.js')

httppp.session('imdb')
httppp.get({url: 'http://www.imdb.com/name/nm1297015/', cb : function(body) {
  console.log("Emma Stone's profile loaded")
}})

// jsDOM test
httppp.session({name: 'imdb2', jsdom: true})
httppp.get({url: 'http://akas.imdb.com/name/nm1297015/', cb : function(window) {
  var roles = window.$('#filmo-head-Actress').next().find('.filmo-row') // <- WTF
  
  console.log("Emma Stone's has playes in " + window.$('.filmo-row').length + " movies")
  
}})

// 302 test
httppp.session('example')
httppp.get({url: 'http://example.com', cb : function(body) {
  console.log(body)
}})

// post test
httppp.session('post')
httppp.post({url: 'http://posttestserver.com/post.php', data: {user:"test", password: "toto"}, cb : function(body) {
  console.log("Data posted", body)
}})


httppp.run('imdb2')