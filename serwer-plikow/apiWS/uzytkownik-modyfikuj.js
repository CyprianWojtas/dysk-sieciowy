const execSync = require('child_process').execSync;
const passwdLinux = require("passwd-linux");
const fs = require('fs');

module.exports.wykonaj = wykonaj;

let freturn;
let wykonane = 0;

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
		dane.dane.inne != undefined
	)
	{
		if ((dane.dane.wyswietlanaNazwa + dane.dane.pokoj + dane.dane.telefon + dane.dane.telefonStac + dane.dane.inne).match(/[:,]/))
		{
			freturn({blad: "Wartości nie mogą zawierać znaków „:” i „,”!"});
			return;
		}
		
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
						
						let admin = grupy.includes("administrator");
						
						if (!admin && (dane.login != dane.dane.login || dane.dane.administrator))
						{
							freturn({blad: "Brak uprawnień!"});
						}
						else
						{
							dane.dane.wyswietlanaNazwa = dane.dane.wyswietlanaNazwa.replace(/\\/gm, '\\\\').replace(/\"/gm, '\\"');
							dane.dane.pokoj            = dane.dane.pokoj           .replace(/\\/gm, '\\\\').replace(/\"/gm, '\\"');
							dane.dane.telefon          = dane.dane.telefon         .replace(/\\/gm, '\\\\').replace(/\"/gm, '\\"');
							dane.dane.telefonStac      = dane.dane.telefonStac     .replace(/\\/gm, '\\\\').replace(/\"/gm, '\\"');
							dane.dane.inne             = dane.dane.inne            .replace(/\\/gm, '\\\\').replace(/\"/gm, '\\"');
							
							execSync('chfn -f "' + dane.dane.wyswietlanaNazwa + '" -h "' + dane.dane.telefonStac + '" -o "' + dane.dane.inne + '" -r "' + dane.dane.pokoj + '" -w "' + dane.dane.telefon + '" ' + dane.dane.login);
							wykonano();
							
							if (dane.dane.haslo != "")
							{
								if (dane.login == dane.dane.login && dane.haslo != dane.dane.haslo)
									zmienHaslo(dane.login, dane.dane.haslo, freturn);
								else
								{
									if (dane.login != dane.dane.login)
									{
										passwdLinux.checkPassword(dane.dane.login, dane.dane.haslo, function (err, response)
										{
											if (err)
											{
												console.log(err);
												freturn({blad: "Błąd logowania!"});
											}
											else
											{
												if (!response)
												{
													zmienHaslo(dane.dane.login, dane.dane.haslo, freturn);
												}
												else
													wykonano();
											}
										});
									}
								}
							}
							else
								wykonano();
							
							if (admin)
							{
								uzytkownkIstnieje(dane.dane.login, intnieje =>
								{
									if (intnieje)
									{
										let grupy = execSync("groups " + dane.dane.login).toString('utf8');
										grupy = grupy.substring(0, grupy.length - 1).split(": ")[1].split(" ");
										
										admin = grupy.includes("administrator");
										
										if (admin && !dane.dane.administrator)
											execSync("deluser "  + dane.dane.login + " administrator");
										else if (!admin && dane.dane.administrator)
											execSync("usermod -a -G administrator " + dane.dane.login);
										
										wykonano();
									}
									else
									{
										freturn({blad: "Użytkownik nie istnieje!"});
									}
								});
							}
							else
								wykonano();
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
					freturn({blad: "Niepoprawne hasło!"});
				}
			}
		});
	}
	else
	{
		freturn({blad: "Nie podano wymaganych zmiennych"});
	}
}

function zmienHaslo(login, haslo, freturn)
{
	passwdLinux.changePassword(login, haslo, function (err, response)
	{
		if (err)
		{
			console.log(err);
		}
		else
		{
			if (response)
			{
				wykonano();
			}
			else
			{
				freturn({blad: "Błąd podczas zmiany hasła"});
			}
		}
	}, 6);
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

let zwrocono = false;
function wykonano()
{
	wykonane++;
	
	if (wykonane >= 3 && !zwrocono)
	{
		freturn({odp: "Wykonano pomyślnie!"});
		zwrocono = true;
	}
}
