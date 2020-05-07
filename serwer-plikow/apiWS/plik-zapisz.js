const execSync = require('child_process').execSync;
const fs = require('fs');

module.exports = {wykonaj: wykonaj};

function dostep(plik, sesja)
{
	let stdout;
	
	try
	{
		stdout = execSync("sudo -u " + sesja.uzytkownik + " stat -c%A,%U,%G \"" + plik.replace(/"/gm, "\\\"") + "\"").toString('utf8');
	}
	catch (e)
	{
		return false;
	}
	stdout = stdout.split("\n")[0];
	
	stdout = stdout.split(",");
	
	let dostep = false;
	
	if (stdout[0].substr(8, 1) == "w")
		dostep = true;
	else if (stdout[0].substr(5, 1) == "w" && sesja.grupy.indexOf(stdout[2]) != -1)
		dostep = true;
	else if (stdout[0].substr(2, 1) == "w" && sesja.uzytkownik == stdout[1])
		dostep = true;
	
	return dostep;
}

function wykonaj(dane, freturn, sesja)
{
	if (dane.plik.startsWith("~/"))
		dane.plik =  sesja.dom + dane.plik.substr(1);
	
	if (dane.plik == undefined || dane.zawartosc == undefined)
	{
		freturn({blad: "Nie podano wymaganych zmiennych!"});
		return;
	}
	if (typeof dane.zawartosc != "string")
	{
		freturn({blad: "Niepoprawny typ danych!"});
		return;
	}
	
	if (fs.existsSync("/media/" + dane.plik))
	{
		if (!dostep("/media/" + dane.plik, sesja))
		{
			freturn({blad: "Brak dostępu!"});
			return;
		}
		else
		{
			if(!dane.nadpisz)
			{
				freturn({blad: "Plik już istnieje!"});
				return;
			}
			else
			{
				zapisz(dane.plik, dane.zawartosc, freturn);
			}
		}
	}
	else
	{
		let folder =  dane.plik.split("/");
		folder.pop();
		folder = folder.join("/");
		
		if (!fs.existsSync("/media/" + folder))
		{
			freturn({blad: "Brak dostępu!"});
			return;
		}
		else
		{
			if (!dostep("/media/" + folder, sesja))
			{
				freturn({blad: "Brak dostępu!"});
				return;
			}
			else
			{
				try
				{
					execSync("sudo -u " + sesja.uzytkownik + " touch \"/media/" + dane.plik.replace(/"/gm, "\\\"") + "\"");
				}
				catch (e)
				{
					freturn({blad: "Błąd tworzenia pliku!"});
					return;
				}
				zapisz(dane.plik, dane.zawartosc, freturn);
			}
		}
		
	}
}

function zapisz(plik, zawartosc, freturn)
{
	fs.writeFile("/media/" + plik, zawartosc, (err) =>
	{
		if (err)
		{
			freturn({blad: "Błąd zapisu!"});
			return;
		}
		
		freturn(true);
	});
}
