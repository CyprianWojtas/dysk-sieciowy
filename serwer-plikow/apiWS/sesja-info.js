const fs = require("fs");

module.exports = { wykonaj: wykonaj };

function wykonaj (dane, freturn, sesja)
{
	let passwd = fs.readFileSync("/etc/passwd").toString('utf8');
	
	//console.log(passwd);
		
	passwd = passwd.split("\n");
	
	let i = 0;
	
	while (!passwd[i].startsWith(sesja.uzytkownik))
	{
		i++;
		if (i >= passwd.length)
		{
			passwd[i] = "";
			break;
		}
	}
	
	passwd = passwd[i].split(":")[4].split(",");
	
	let info =
	{
		wyswietlanaNazwa: passwd[0],
		pokoj: passwd[1],
		telefon: passwd[2],
		telefonDomowy: passwd[3],
		inne: passwd[4]
	};
	
	freturn({sesja: sesja, info: info});
}
