const execSync = require('child_process').execSync;
const passwdLinux = require("passwd-linux");
const fs = require('fs');
const ncp = require('ncp').ncp;

// Limit przenoszonych naraz plików
ncp.limit = 16;

module.exports.wykonaj = wykonaj;

let freturn;
let wykonane = 0;

function doKomendy(sciezka)
{
	return decodeURIComponent(sciezka).replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;");
}

function wykonaj (dane, freturnL, sesja)
{
	freturn = freturnL;
	
	let blad = false;
	if
	(
		dane.login != undefined &&
		dane.haslo != undefined &&
		dane.dane.login != undefined &&
		dane.dane.wyswietlanaNazwa != undefined &&
		dane.dane.pokoj != undefined &&
		dane.dane.telefon != undefined &&
		dane.dane.telefonStac != undefined &&
		dane.dane.inne != undefined &&
		dane.dane.obraz != undefined
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
							dodajUzytkownika(dane);
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
	else
	{
		freturn({blad: "Nie podano wymaganych zmiennych"});
	}
}

function uzytkownkIstnieje(login, funkcja)
{
	fs.readFile('/etc/passwd', "utf8", (err, data) =>
	{
		let uzytkownicy = data.split("\n");
		for (i in uzytkownicy)
		{
			let uzytkownik = uzytkownicy[i].split(":");
			
			if (uzytkownik[5] != undefined)
			if(uzytkownik[5].startsWith("/media/nas"))
			{
				if (uzytkownik[0] == login)
				{
					funkcja(true);
					return;
				}
			}
		}
		funkcja(false);
	});
}

function dodajUzytkownika(dane)
{
	if ((dane.dane.wyswietlanaNazwa + dane.dane.pokoj + dane.dane.telefon + dane.dane.telefonStac + dane.dane.inne).match(/[:,]/))
	{
		freturn({blad: "Wartości nie mogą zawierać znaków „:” i „,”!"});
		return;
	}
	if (!dane.dane.login.match(/^[a-z][a-z0-9_-]*$/) || dane.dane.login.length >= 32)
	{
		freturn({blad: "Nazwa użytkownika jest niepoprawna!"});
		return;
	}
	
	uzytkownkIstnieje(dane.dane.login, intnieje =>
	{
		if (intnieje)
		{
			freturn({blad: "Użytkownik już istnieje!"});
			return;
		}
		else
		{
			// Dodawanie użytkownika
			execSync(`useradd -d "/media/nas" ` + dane.dane.login);
			passwdLinux.changePassword(dane.dane.login, dane.dane.haslo, function (err, response)
			{
				if (err)
				{
					console.log(err);
				}
				else
				{
					if (!response)
					{
						freturn({blad: "Błąd podczas ustawiania hasła"});
					}
					else
					{
						// Dodawanie do SAMBY
						execSync(`(echo "` + doKomendy(dane.dane.haslo) + `"; echo "` + doKomendy(dane.dane.haslo) + `") | smbpasswd -a -s ` + dane.dane.login);

						// Kopiowanie zdjęcia
						fs.copyFile('/opt/serwer-plikow/html/img/avatary/' + dane.dane.obraz + '.png', '/media/nas/.system/avatary/' + dane.dane.login + '.png', blad =>
						{
							if (blad) throw blad;
						});

						// Ustawianie informacji
						dane.dane.wyswietlanaNazwa = dane.dane.wyswietlanaNazwa.replace(/\"/gm, '\\"');
						dane.dane.pokoj            = dane.dane.pokoj           .replace(/\"/gm, '\\"');
						dane.dane.telefon          = dane.dane.telefon         .replace(/\"/gm, '\\"');
						dane.dane.telefonStac      = dane.dane.telefonStac     .replace(/\"/gm, '\\"');
						dane.dane.inne             = dane.dane.inne            .replace(/\"/gm, '\\"');
						
						execSync('chfn -f "' + dane.dane.wyswietlanaNazwa + '" -h "' + dane.dane.telefonStac + '" -o "' + dane.dane.inne + '" -r "' + dane.dane.pokoj + '" -w "' + dane.dane.telefon + '" ' + dane.dane.login);

						// Tworzenie katalogu użytkownika
						let lokalizacjaProfilu = dane.dane.wyswietlanaNazwa;

						let pliki = fs.readdirSync("/media/nas");

						if (pliki.includes(lokalizacjaProfilu))
						{
							let i = 1;
							
							while (pliki.includes(lokalizacjaProfilu + " (" + i + ")"))
								i++;
							
							lokalizacjaProfilu = lokalizacjaProfilu + " (" + i + ")";
						}

						ncp("/media/nas/.system/domyslny-profil", "/media/nas/" + lokalizacjaProfilu, blad =>
						{
							if (blad) throw blad;

							try
							{
								let lokalizacjeProfili = JSON.parse(fs.readFileSync('/opt/serwer-plikow/lokalizacje-profili.json'));
								lokalizacjeProfili[dane.dane.login] = "nas/" + lokalizacjaProfilu;

								fs.writeFileSync('/opt/serwer-plikow/lokalizacje-profili.json', JSON.stringify(lokalizacjeProfili));
							}
							catch (e)
							{
								freturn({blad: "Błąd odczytu pliku konfiguracyjnego!"});
								console.log("Nie można odczytać pliku lokalizacji profili!");
								console.log(e);
								return;
							}

							execSync(`chmod 700 -R "/media/nas/` + doKomendy(lokalizacjaProfilu) + `"`);
							execSync(`chown ` + dane.dane.login + `:` + dane.dane.login + ` -R "/media/nas/` + doKomendy(lokalizacjaProfilu) + `"`);

							// DO ZROBIENIA: DODAWANIE DO SAMBY

							freturn({odp: "Dodano użytkownika"});
						});
					}
				}
			}, 6);
		}
	});
}