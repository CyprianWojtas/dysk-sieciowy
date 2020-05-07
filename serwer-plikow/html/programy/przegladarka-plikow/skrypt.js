/*

Kategoria

<fieldset>
	<legend>OPIS</legend>
	PLIKI
</fieldset>


*/
let uzytkownik;
let biblioteki;
let malejaco = false;

let historia = [];
let cofniete = [];

var sciezka = parametry.katalog != undefined ? parametry.katalog : "/";
var sciezkaArr = sciezka.split("/");
var doPodgladu = [];

function  tytul (t)
{
	if (t == "")
		t = "/";
	
	document.getElementsByTagName("title")[0].innerHTML = "Przeglądarka plików — " + t;
}

tytul(sciezkaArr[sciezkaArr.length - 1]);

function wypiszPliki (pliki)
{
	for(i in pliki)
	{
		if (pliki[i].nazwa.substr(0, 1) != ".")
		{
			var ikona = "/ikony/places/scalable/folder.svg";
			var zablokowany = "";
			
			if (pliki[i].uprawnienia.substr(0, 1) != "d" && pliki[i].uprawnienia.substr(0, 1) != "l")
				ikona = "/ikony/mimetypes/scalable/unknown.svg";
			
			if (pliki[i].typ)
			{
				var ikonaMime = pliki[i].typ.replace(/\//g, "-");
				ikona = "/ikony/mimetypes/scalable/" + ikonaMime + ".svg";
			}
			
			if (pliki[i].ikona != undefined)
				ikona = pliki[i].ikona;
			
			let dostep = false;
	
			if (pliki[i].uprawnienia.substr(7, 1) == "r")
				dostep = true;
			else if (pliki[i].uprawnienia.substr(4, 1) == "r" && uzytkownik.sesja.grupy.indexOf(pliki[i].grupa) != -1)
				dostep = true;
			else if (pliki[i].uprawnienia.substr(1, 1) == "r" && uzytkownik.sesja.uzytkownik == pliki[i].uzytkownik)
				dostep = true;
			
// 				if (json.info != undefined)
// 					if (json.info[pliki[i].nazwa] != undefined)
// 					{
// 						if (json.info[pliki[i].nazwa].u)
// 							continue;
// 						
// 						if (json.info[pliki[i].nazwa].i != undefined)
// 							ikona = json.info[pliki[i].nazwa].i;
// 					}
			
			if (!dostep)
				zablokowany = "<img src='/ikony/status/scalable/status_lock.svg' alt='' class='blokada'>";
			
			if (pliki[i].url == undefined)
				pliki[i].url = pliki[i].nazwa;
			
			
			if (pliki[i].uprawnienia.substr(0, 1) == "l")
			{
				if (pliki[i].url.startsWith("/media"))
					pliki[i].url = pliki[i].url.substr(6);
			}
				
			let sciezkaPliku = "";
			
			if (pliki[i].url.startsWith("/"))
				sciezkaPliku = pliki[i].url;
			else if (pliki[i].url.startsWith("~/"))
				sciezkaPliku = uzytkownik.sesja.dom + pliki[i].url.substr(1);
			else
				sciezkaPliku = sciezka + "/" + pliki[i].url;
			
			
			if (pliki[i].uprawnienia.substr(0, 1) == "d" || pliki[i].uprawnienia.substr(0, 1) == "l")
			{
				
				var onClick = "";
				if (dostep)
					onClick = "onClick='przejdz(`" + sciezkaPliku.replace(/'/gm, "&apos;") + "`)'";
				
				$(".pliki").append("<div class='ikona' " + onClick + " title='" + pliki[i].nazwa + "'><img src='" + ikona + "' alt=''><div class='nazwa'>" + zablokowany + pliki[i].nazwa + "</div></div>");
			}
			else
			{
				var onClick = "";
				if (dostep)
					onClick = "onClick='otworz(`" + sciezkaPliku.replace(/'/gm, "&apos;") + "`, `" + pliki[i].typ + "`)'";
				
				if (pliki[i].typ == "image/jpeg" || pliki[i].typ == "image/png")
					doPodgladu.push(sciezkaPliku);
					
				$(".pliki").append("<div class='ikona' " + onClick + "  title='" + pliki[i].nazwa.replace(/'/gm, "&apos;") + "' data-plik='" + sciezkaPliku.replace(/'/gm, "&apos;") + "' data-data='" + pliki[i].dataEdycji.replace(/'/gm, "&apos;") + "' data-typ='" + pliki[i].typ + "'><img src='" + ikona + "' alt=''><div class='nazwa'>" + zablokowany + pliki[i].nazwa + "</div></div>");
			}
		}
	}
}

function przejdz (url, zapiszHistorie = true)
{
	sciezka = url;
	doPodgladu = [];
	
	if (url == "Biblioteki")
	{
		
		if (zapiszHistorie)
			historia.push(sciezka);
		
		$(".sciezka").val(sciezka);
		$(".pliki").html("");
		
		wypiszPliki(
		[
			{
				dataEdycji: null,
				grupa: uzytkownik.sesja.uzytkownik,
				iloscPlikow: 0,
				url: "~/Dokumenty",
				nazwa: "Dokumenty",
				rozmiar: 0,
				typ: false,
				uprawnienia: "drwx------",
				uzytkownik: uzytkownik.sesja.uzytkownik,
				ikona: "/ikony/places/scalable/folder-documents.svg"
			},
			{
				dataEdycji: null,
				grupa: uzytkownik.sesja.uzytkownik,
				iloscPlikow: 0,
				url: "~/Obrazy",
				nazwa: "Obrazy",
				rozmiar: 0,
				typ: false,
				uprawnienia: "drwx------",
				uzytkownik: uzytkownik.sesja.uzytkownik,
				ikona: "/ikony/places/scalable/folder-images.svg"
			},
			{
				dataEdycji: null,
				grupa: uzytkownik.sesja.uzytkownik,
				iloscPlikow: 0,
				url: "~/Filmy",
				nazwa: "Filmy",
				rozmiar: 0,
				typ: false,
				uprawnienia: "drwx------",
				uzytkownik: uzytkownik.sesja.uzytkownik,
				ikona: "/ikony/places/scalable/folder-videos.svg"
			},
			{
				dataEdycji: null,
				grupa: uzytkownik.sesja.uzytkownik,
				iloscPlikow: 0,
				url: "~/Muzyka",
				nazwa: "Muzyka",
				rozmiar: 0,
				typ: false,
				uprawnienia: "drwx------",
				uzytkownik: uzytkownik.sesja.uzytkownik,
				ikona: "/ikony/places/scalable/folder-music.svg"
			}
		]);
	}
	else
	{
		if (sciezka.startsWith("~"))
			sciezka = uzytkownik.sesja.dom + sciezka.substr(1);

		while(sciezka.substr(0, 1) == "/")
		{
			sciezka = sciezka.substr(1);
		}
		while(sciezka.substr(-1, 1) == "/")
		{
			sciezka = sciezka.substr(0, sciezka.length - 1);
		}
		
		if (sciezka == "")
			$(".przycisk-wyzej").removeClass("aktywny");
		else
			$(".przycisk-wyzej").addClass("aktywny");
		if (historia.length > 1)
			$(".przycisk-cofnij").addClass("aktywny");
		else
			$(".przycisk-cofnij").removeClass("aktywny");
		
		if (cofniete.length > 0)
			$(".przycisk-powtorz").addClass("aktywny");
		else
			$(".przycisk-powtorz").removeClass("aktywny");
		
		if (zapiszHistorie)
			historia.push(sciezka);
		
		sciezkaArr = sciezka.split("/");
		
		parametry.katalog = url;
		
		window.history.pushState("", "Przeglądarka plików — " + url, "?" + encodeURIComponent(JSON.stringify(parametry)));
		tytul(sciezkaArr[sciezkaArr.length - 1]);
		
		doPodgladu = [];
		
		$(".sciezka").val("/" + sciezka);
		$(".pliki").html("");
		
		api("listuj-pliki",
		{
			folder: "/" + sciezka,
			najpierwKatalogi: true,
			malejaco: malejaco
		}, odp =>
		{
			wypiszPliki(odp);
		});
	}
	
	sciezkaArr = sciezka.split("/");
	tytul(sciezkaArr[sciezkaArr.length - 1]);
}

function wczytajPodglad()
{
	function formatuj(tekst)
	{
		return tekst
			.replace(/&gt;/gm, ">")
			.replace(/&lt;/gm, "<")
			.replace(/&amp;/g, '&')
			.replace(/&quot;/g, '"')
			.replace(/'/gm, "\\\'")
			.replace(/"/gm, '\\\"');
	}

	function pobierzPlik()
	{
		return doPodgladu.shift();
	}
	let plikPodglad = false;

	if (plikPodglad = pobierzPlik())
	{
		let img = new Image();
		img.onload = function()
		{
			$("[data-plik='" + formatuj(plikPodglad) +"']").find("img").attr("src", this.src);
			
			delete this;
			wczytajPodglad();
		};
		img.onerror = function(e)
		{
			console.log(img.src);
			console.log(e);
			delete this;
			
			wczytajPodglad();
		}

		try
		{
			img.src = "/api/miniaturka?" + $.param(
			{
				plik: $("[data-plik='" + formatuj(plikPodglad) +"']")[0].dataset.plik,
				data: $("[data-plik='" + formatuj(plikPodglad) +"']")[0].dataset.data
			});
		}
		catch (e)
		{
			console.log(formatuj(plikPodglad));
			delete img;
			wczytajPodglad();
		}
	}
	else
		setTimeout(wczytajPodglad, 100);
}
wczytajPodglad();
setTimeout(wczytajPodglad, 20);
setTimeout(wczytajPodglad, 40);
setTimeout(wczytajPodglad, 60);
setTimeout(wczytajPodglad, 80);
wczytajPodglad();
setTimeout(wczytajPodglad, 20);
setTimeout(wczytajPodglad, 40);
setTimeout(wczytajPodglad, 60);
setTimeout(wczytajPodglad, 80);

// function wolneMiejsce()
// {
// 	getJSON("/api/wolna-przestrzen", function (json)
// 	{
// 		var i = json.findIndex(function(sub)
// 		{
// 			return sub.punktMontowania == "/media/nas";
// 		});
// 		
// 		$(".przestrzen").html("Zajęte: " + String(Math.round(json[i].zajete / json[i].rozmiar * 1000) / 10).replace(".", ",") + "%");
// 	});
// }
// wolneMiejsce();


$(".sciezka")[0].addEventListener("keyup", function(e)
{
	e.preventDefault();
	if (e.keyCode === 13)
	{
		przejdz(this.value);
	}
});

$(".przycisk-cofnij").click(() =>
{
	if (historia.length > 1)
	{
		cofniete.push(historia.pop());
		
		przejdz(historia[historia.length - 1], false);
	}
});

$(".przycisk-powtorz").click(() =>
{
	if (cofniete.length > 0)
	{
		przejdz(cofniete.pop());
	}
});

$(".przycisk-wyzej").click(() =>
{
	let url = sciezka.split("/");
	if (url.length > 0)
	{
		url.pop();
		url = url.join("/");
		
		if (url != sciezka)
			przejdz(url);
	}
});

api("sesja-info", odp =>
{
	uzytkownik = odp;
	
	$(".zakladka-dom").attr("onclick", "przejdz ('" + uzytkownik.sesja.dom + "');");
	
	przejdz (sciezka);
});
