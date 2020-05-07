let uzytkownicy = [];
let uzytkownik;
let nowyUzytkownik = false;

function wczytaj()
{
	api("uzytkownicy", odp =>
	{
		uzytkownicy = odp;

		for (i in odp)
		{
			if (odp[i].info.nazwa == "")
				odp[i].info.nazwa = odp[i].login;
			
			let j = i;
			
			let profil = $("<div title='" + odp[j].info.nazwa + "' class='uzytkownik' onclick='wybierz(" + i + ")'><img src='/avatary/" + odp[j].login + ".png' alt=''><span>" + odp[j].info.nazwa + "</span></div>");

			obrazZaladuj("/avatary/" + odp[j].login + ".png", zaladowano =>
			{
				if (!zaladowano)
					$(profil).find("img").attr("src", "/img/avatar.png");
			});

			$(".uzytkownicy-lista").append(profil);

			if (odp[j].login == uzytkownik.sesja.uzytkownik)
				wybierz(j);
		}
	});
}
function wybierz(id)
{
	nowyUzytkownik = false;
	$(".uzytkownik").removeClass("wybrany");
	$($(".uzytkownik")[id]).addClass("wybrany");

	$(".ustawienia img").attr("src", "/avatary/" + uzytkownicy[id].login + ".png");

	$(".ustawienia .pole-nazwa")           .val(uzytkownicy[id].login);
	$(".ustawienia .pole-nazwa")           .prop('disabled', true);
	$(".ustawienia .pole-wyswietlanaNazwa").val(uzytkownicy[id].info.nazwa);
	$(".ustawienia .pole-administrator")   .prop("checked", uzytkownicy[id].grupy.includes("administrator"));
	$(".ustawienia .pole-pokoj")           .val(uzytkownicy[id].info.pokoj);
	$(".ustawienia .pole-telefon")         .val(uzytkownicy[id].info.telefon);
	$(".ustawienia .pole-telefonStac")     .val(uzytkownicy[id].info.telefonStac);
	$(".ustawienia .pole-inne")            .val(uzytkownicy[id].info.inne);

	obrazZaladuj("/avatary/" + uzytkownicy[id].login + ".png", zaladowano =>
	{
		if (!zaladowano)
			$(".ustawienia img").attr("src", "/img/avatar.png");
	});
}
function nowy()
{
	nowyUzytkownik = true;
	$(".uzytkownik").removeClass("wybrany");
	$(".uzytkownik.nowy").addClass("wybrany");

	$(".ustawienia .pole-nazwa")           .val("");
	$(".ustawienia .pole-nazwa")           .prop('disabled', false);
	$(".ustawienia .pole-wyswietlanaNazwa").val("");
	$(".ustawienia .pole-administrator")   .prop("checked", false);
	$(".ustawienia .pole-pokoj")           .val("");
	$(".ustawienia .pole-telefon")         .val("");
	$(".ustawienia .pole-telefonStac")     .val("");
	$(".ustawienia .pole-inne")            .val("");

	$.getJSON("/img/avatary/avatary.json", odp =>
	{
		$(".ustawienia img").attr("src", "/img/avatary/" + odp[Math.floor(Math.random() * odp.length)]);
	});
}

function zapisz()
{
	if (nowyUzytkownik)
	{
		if ($(".pole-haslo").val() == "" || ($(".pole-haslo").val() == $(".pole-haslo2").val()))
		{
			let obraz = $(".ustawienia img").attr("src").substr(13);
			obraz = obraz.substr(0, obraz.length - 4);

			program.otworz("/programy/okna-dialogowe/uprawinienia-administratora/index.html",
			{
				api: "uzytkownik-nowy",
				dane:
				{
					login:            $(".pole-nazwa").val(),
					wyswietlanaNazwa: $(".pole-wyswietlanaNazwa").val(),
					administrator:    $(".pole-administrator").prop("checked"),
					haslo:            $(".pole-haslo").val(),
					pokoj:            $(".pole-pokoj").val(),
					telefon:          $(".pole-telefon").val(),
					telefonStac:      $(".pole-telefonStac").val(),
					inne:             $(".pole-inne").val(),
					obraz:            obraz
				},
				opis: "Wymagane jest uwierzytelnienie, aby dodać użytkownika"
			},
			{
				rx: 450,
				ry: 225,
				zmienialnyRozmiar: false
			});
		}
	}
	else
	{
		if ($(".pole-haslo").val() == "" || ($(".pole-haslo").val() == $(".pole-haslo2").val()))
		{
			program.otworz("/programy/okna-dialogowe/uprawinienia-administratora/index.html",
			{
				api: "uzytkownik-modyfikuj",
				dane:
				{
					login:            $(".pole-nazwa").val(),
					wyswietlanaNazwa: $(".pole-wyswietlanaNazwa").val(),
					administrator:    $(".pole-administrator").prop("checked"),
					haslo:            $(".pole-haslo").val(),
					pokoj:            $(".pole-pokoj").val(),
					telefon:          $(".pole-telefon").val(),
					telefonStac:      $(".pole-telefonStac").val(),
					inne:             $(".pole-inne").val()
				},
				opis: "Wymagane jest uwierzytelnienie, aby zmienić dane użytkownika"
			},
			{
				rx: 450,
				ry: 225,
				zmienialnyRozmiar: false
			});
		}
	}
}

$(".pole-haslo")[0].onchange = e =>
{
	if(e.target.value == "")
	{
		$(".pole-haslo2").parent().parent().addClass("ukryty");
		$(".pole-haslo2").val("");
	}
	else
		$(".pole-haslo2").parent().parent().removeClass("ukryty");
};

$(".pole-haslo")[0].onkeyup = $(".pole-haslo")[0].onchange;

api("sesja-info", odp =>
{
	uzytkownik = odp;
	wczytaj();
});