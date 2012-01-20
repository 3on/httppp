var httppp = require('./httppp.js')

httppp.session('imdb')
httppp.get({url: 'http://www.imdb.com/name/nm1297015/', cb : function(body) {
  console.log("Emma Stone's profile loaded")
}})

httppp.session({name: 'imdb2', jsdom: true})
httppp.get({url: 'http://www.imdb.com/name/nm1297015/', cb : function(window) {
  var nb = window.$('#filmo-head-Actress').next().find('.filmo-row').length
  
  console.log("Emma Stone's has playes in " + nb + " movies")
  
}})





httppp.session('post')
httppp.post({url: 'http://posttestserver.com/post.php', data: {user:"test", password: "toto"}, cb : function(body) {
  console.log("Data posted", body)
}})

httppp.run('imdb2')