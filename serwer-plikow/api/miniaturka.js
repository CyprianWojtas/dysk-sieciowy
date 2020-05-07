const dostep = require("../js/dostep");
const fs = require('fs');
const mime = require('mime-types');
const execSync = require('child_process').execSync;

module.exports = {wykonaj: wykonaj};

function wykonaj (dane, freturn, sesja)
{
	if (dane.plik == undefined || dane.data == undefined)
	{
		freturn(JSON.stringify({blad: "Nie podano wymaganych zmiennych!"}));
		return;
	}

	
	if (dostep.odczyt("/media/" + dane.plik, sesja))
	{
		let typ = mime.lookup("/media/" + dane.plik);

		if (typ == "image/jpeg" || typ == "image/png")
		{
			if (!fs.existsSync("/media/nas/.system/tmp/podglady/" + dane.plik.replace(/&/gm, "&amp;") + "." + dane.data + ".png"))
			{
				gererujMiniaturke(dane, freturn);
			}
			else
			{
				if (fs.lstatSync("/media/nas/.system/tmp/podglady/" + dane.plik.replace(/&/gm, "&amp;") + "." + dane.data + ".png").isFile())
				{
					fs.readFile("/media/nas/.system/tmp/podglady/" + dane.plik.replace(/&/gm, "&amp;") + "." + dane.data + ".png", function(err, data)
					{
						freturn(data, "image/png");
					});
				}
				else
				{
					if (fs.lstatSync("/media/nas/.system/tmp/podglady/" + dane.plik.replace(/&/gm, "&amp;") + "." + dane.data + ".png").isDirectory())
					{
						usunFolder("/media/nas/.system/tmp/podglady/" + dane.plik.replace(/&/gm, "&amp;") + "." + dane.data + ".png");
					}
					else
					{
						fs.unlink("/media/nas/.system/tmp/podglady/" + dane.plik.replace(/&/gm, "&amp;") + "." + dane.data + ".png");
					}
					gererujMiniaturke(dane, freturn);
				}
			}
		}
		else
		{
			freturn(JSON.stringify({blad: "Niewłaściwy format pliku!"}));
		}
	}
	else
	{
		freturn(JSON.stringify({blad: "Brak dostępu do pliku!"}));
	}
}

function doKomendy(sciezka)
{
	return decodeURIComponent(sciezka).replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;");
}

function gererujMiniaturke(dane, freturn)
{
	let sciezka = (dane.plik + "." + dane.data + ".png").split("/");
	let plik    = sciezka.pop();
	
	let sciezkaSTR = "";
	
	for (i in sciezka)
	{
		sciezkaSTR += sciezka[i] + "/";
		if (!fs.existsSync("/media/nas/.system/tmp/podglady/" + sciezkaSTR.replace(/&/gm, "&amp;")))
			fs.mkdirSync("/media/nas/.system/tmp/podglady/" + sciezkaSTR.replace(/&/gm, "&amp;"));
	}
	
	execSync("convert -auto-orient -thumbnail 80x48 -background none -gravity center -extent 80x48 \""
		+ doKomendy("/media/" + dane.plik) + "\" \""
		+ doKomendy("/media/nas/.system/tmp/podglady/" + dane.plik + "." + dane.data + ".png") + "\"").toString('utf8');
	
	fs.readFile("/media/nas/.system/tmp/podglady/" + dane.plik.replace(/&/gm, "&amp;") + "." + dane.data + ".png", function(err, data)
	{
		freturn(data, "image/png");
	});
}

function usunFolder(path)
{
	if (fs.existsSync(path))
	{
		fs.readdirSync(path).forEach(function(file, index)
		{
			var curPath = path + "/" + file;
			if (fs.lstatSync(curPath).isDirectory())
			{
				usunFolder(curPath);
			}
			else
			{
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
};
