var httppp = require('./httppp.js')

httppp.session('imdb')

httppp.get({url: 'http://www.imdb.com/name/nm1297015/', cb : function(body) {
  console.log("Emma Stone's profile loaded")
}})


httppp.run()