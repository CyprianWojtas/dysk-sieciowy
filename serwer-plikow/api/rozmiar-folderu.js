const fs = require('fs');
const execSync = require('child_process').execSync;

module.exports =
{
	wykonaj: function ()
	{
		let odpArr = [];

		stdout = execSync("df --output=source,size,used,target").toString('utf8');
		
		let stdoutArr = stdout.split("\n");
		
		for (let i = 1; i < stdoutArr.length; i++)
		{
			let urzadzenie = stdoutArr[i].split(/ +/);
			
			while (urzadzenie[0] == "")
				urzadzenie.shift();
			
			if (urzadzenie.length >= 4)
			{
				if (urzadzenie[0].match(/(^\/dev\/sd|^\/dev\/md)/))
					odpArr.push(
					{
						urzadzenie:  urzadzenie[0],
						punktMontowania: urzadzenie[3],
						rozmiar: urzadzenie[1],
						zajete:  urzadzenie[2]
					});
			}
		}
		return odpArr;
	}
};

function zajete(folder)
{
	if (folder.substring(0, 1) != "/")
		folder = "/" + folder;
	
	try
	{
		fs.accessSync("/media/nas" + folder, fs.constants.R_OK);
	}
	catch (err)
	{
		return "Brak dostępu";
	}
	
	stdout = execSync("sudo du --max-depth=1 '/media/nas" + folder + "'").toString('utf8');
	
	let stdoutArr = stdout.split("\n");
	let odpArr = { rozmiar: 0, zawartosc: []};
	
	for (i in stdoutArr)
	{
		let lokalizacjaElement = stdoutArr[i].split("\t");
		
		if (lokalizacjaElement[1] != undefined)
		{
			if (folder == lokalizacjaElement[1].substring(10))
			{
				odpArr.rozmiar = lokalizacjaElement[0];
				continue;
			}
			
			let dostep = true;
			try
			{
				fs.accessSync(lokalizacjaElement[1], fs.constants.R_OK);
			}
			catch (err)
			{
				dostep = false;
			}
			
			odpArr.zawartosc.push(
			{
				folder:  lokalizacjaElement[1].substring(11),
				rozmiar: lokalizacjaElement[0],
				dostep:  dostep
			});
		}
	}
	return odpArr;
}
