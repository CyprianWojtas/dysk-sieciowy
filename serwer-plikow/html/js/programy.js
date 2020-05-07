//Pobieranie listy progrmów
function wczytajListeProgramow()
{
	let programy = [];
	let globalne = false;
	let lokalne  = false;

	api("listuj-pliki", {folder: "/nas/.system/konfig/programy"}, odp =>
	{
		for (i in odp)
		{
			let j = i;

			$.getJSON("/p/nas/.system/konfig/programy/" + odp[j].nazwa, json =>
			{
				if (json.ikona == undefined) json.ikona = "/ikony/mimetypes/scalable/application.svg";
				if (json.nazwa == undefined) json.nazwa = odp[j].nazwa;
				
				programy.push(
				{
					nazwa: json.nazwa,
					sciezka: json.sciezka,
					ikona: json.ikona,
					nazwa: json.nazwa
				});

			}).fail(function( jqxhr, textStatus, error )
			{
				console.error("Błąd wczytywania programu: " + odp[j].nazwa);
			}).always(function()
			{
				if (j == odp.length - 1)
					globalne = true;
				if (lokalne && globalne)
					wypisz();
			});
		}

		if (odp.length == 0)
		{
			globalne = true;
			
			if (lokalne && globalne)
				wypisz();
		}
	});

	api("listuj-pliki", {folder: "~/.konfig/programy"}, odp =>
	{
		for (i in odp)
		{
			let j = i;

			$.getJSON("/p/" + uzytkownik.sesja.dom + "/.konfig/programy/" + odp[j].nazwa, json =>
			{
				if (json.ikona == undefined) json.ikona = "/ikony/mimetypes/scalable/application.svg";
				if (json.nazwa == undefined) json.nazwa = odp[j].nazwa;
				
				programy.push(
				{
					nazwa: json.nazwa,
					sciezka: json.sciezka,
					ikona: json.ikona,
					nazwa: json.nazwa
				});

			}).fail(function( jqxhr, textStatus, error )
			{
				console.error("Błąd wczytywania programu: " + odp[j].nazwa);
			}).always(function()
			{
				if (j == odp.length - 1)
					lokalne = true;
				if (lokalne && globalne)
					wypisz();
			});
		}

		if (odp.length == 0)
		{
			lokalne = true;

			if (lokalne && globalne)
				wypisz();
		}
	});

	function wypisz()
	{
		$(".programyMenu").html("");
		programy.sort(function(a, b)
		{
			return a.nazwa.localeCompare(b.nazwa);
		});

		for (i in programy)
		{
			$(".programyMenu").append(`<div title="` + programy[i].nazwa + `" onclick="program.otworz('` + programy[i].sciezka + `', null, true)"><img src="` + programy[i].ikona + `" alt=""><span>` + programy[i].nazwa + `</span></div>`);
		}
	}
}
