if (parametry.opis)
	$("h3").text(parametry.opis);

$(".ok").click(() =>
{
	api(parametry.api,
	{
		login: uzytkownik.sesja.uzytkownik,
		haslo: $(".haslo").val(),
		dane: parametry.dane
	}, odp =>
	{
		console.log(odp);

		if (odp.blad)
		{
			$(".blad").text(odp.blad);
			$(".blad").slideDown().delay(2500).slideUp();
		}
		else
		{
			program.otworz("/programy/okna-dialogowe/info/index.html",
			{
				tytul: odp.odp,
				info: odp.odp
			},
			{
				rx: 450,
				ry: 225,
				zmienialnyRozmiar: false
			});

			program.zamknij();
		}
	});
});

$(".anuluj").click(() =>
{
	program.zamknij();
});

let uzytkownik;

api("sesja-info", odp =>
{
	uzytkownik = odp;
});
