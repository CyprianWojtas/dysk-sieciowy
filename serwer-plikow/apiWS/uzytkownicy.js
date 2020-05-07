const fs = require('fs');
const execSync = require('child_process').execSync;

module.exports =
{
	wykonaj: function (dane, freturn)
	{
		fs.readFile('/etc/passwd', "utf8", (err, data) =>
		{
			let uzytkownicy = data.split("\n");
			let odp = [];
			
			for (i in uzytkownicy)
			{
				let uzytkownik = uzytkownicy[i].split(":");
				
				if (uzytkownik[5] != undefined)
				if(uzytkownik[5].startsWith("/media/nas"))
				{
					let info = uzytkownik[4].split(",");

					let grupy = execSync("groups " + uzytkownik[0]).toString('utf8');
							
					grupy = grupy.substring(0, grupy.length - 1).split(": ")[1].split(" ");
					
					odp.push(
					{
						login: uzytkownik[0],
						grupy: grupy,
						idu:   uzytkownik[2],
						idg:   uzytkownik[3],
						info:
						{
							nazwa:       info[0],
							pokoj:       info[1],
							telefon:     info[2],
							telefonStac: info[3],
							inne:        info[4]
						}
					});
				}
			}

			odp.sort(function(a, b)
			{
				if (a.info.nazwa == "")
					a.info.nazwa = a.login;
				if (b.info.nazwa == "")
					b.info.nazwa = b.login;
				
				return a.info.nazwa.localeCompare(b.info.nazwa);
			});

			freturn(odp);
		});
	}
}
