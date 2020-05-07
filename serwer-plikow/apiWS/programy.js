const fs = require('fs');

module.exports =
{
	wykonaj: function (dane, freturn, sesja)
	{
		let odpArr = {};

		odpArr.globalne = fs.readdirSync("html/programy/");
		
		let lokalizacje = JSON.parse(fs.readFileSync('./lokalizacje-profili.json'));
		
		odpArr.lokalne = fs.readdirSync("/media/" + lokalizacje[sesja.uzytkownik] + "/.programy");
		
		freturn(odpArr);
	}
};
