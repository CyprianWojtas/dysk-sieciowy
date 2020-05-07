const execSync = require('child_process').execSync;
const passwdLinux = require("passwd-linux");
const fs = require('fs');

module.exports = {wykonaj: wykonaj};

function wykonaj(dane, freturn, sesja)
{
	if
	(
		dane.login != undefined &&
		dane.haslo != undefined &&
		dane.dane.plik != undefined &&
		dane.dane.zawartosc != undefined
	)
	{
		passwdLinux.checkPassword(dane.login, dane.haslo, function (err, response)
		{
			if (err)
			{
				console.log(err);
				freturn({blad: "Błąd logowania!"});
			}
			else
			{
				if (response)
				{
					try
					{
						let grupy = execSync("groups " + dane.login).toString('utf8');
						
						grupy = grupy.substring(0, grupy.length - 1).split(": ")[1].split(" ");
						
						if(grupy.includes("administrator"))
						{
							administrator(dane.dane, sesja, freturn);
						}
						else
						{
							freturn({blad: "Brak uprawnień!"});
						}
					}
					catch (e)
					{
						console.log(e);
						freturn({blad: "Błąd wykonywania kodu"});
					}
				}
				else
				{
					freturn({blad: "Nieprawidłowe hasło!"});
				}
			}
		});
	}
}

function administrator(dane, sesja, freturn)
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
	else
	{
		let folder =  dane.plik.split("/");
		folder.pop();
		folder = folder.join("/");
		
		if (!fs.existsSync("/media/" + folder))
		{
			freturn({blad: "Brak dostępu!"});
			console.log("/media/" + folder);
			return;
		}
		else
		{
			try
			{
				execSync("touch \"/media/" + dane.plik.replace(/"/gm, "\\\"") + "\"");
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
