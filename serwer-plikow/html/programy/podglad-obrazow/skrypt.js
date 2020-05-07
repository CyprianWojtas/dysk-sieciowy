let obraz = parametry.plik;
let folder = obraz.split("/");
obraz = folder.pop();
folder = folder.join("/");

let obrazyLista = [];
let id = 0;
let obslugiwaneTypy =
[
	"image/png",
	"image/gif",
	"image/jpeg",
	"image/svg",
	"image/svg+xml"
];

function  tytul (t)
{
	if (t == "")
		t = "/";
	
	document.getElementsByTagName("title")[0].innerHTML = "Podgląd — " + t;
}
//Wczytanie obrazu
function wczytajObraz(url)
{
	$(".wczytywanie").text("Wczytywanie obrazu...");
	$(".obraz").addClass("ukryte");
	$(".wczytywanie").removeClass("ukryte");
	
	let t = url.split("/");
	
	while(url.match(/^\//))
		url = url.substr(1);
	
	parametry.plik = "/" + url;
	
	window.history.pushState("", "Podgląd — " + url, "?" + decodeURIComponent(JSON.stringify(parametry)));
	
	tytul(t[t.length - 1]);
	
	$(".obraz").attr("src", "/p" + sciezkaNaURL(parametry.plik));
	obrazZaladuj("/p" + sciezkaNaURL(parametry.plik), (odp, e) =>
	{
		if (odp)
		{
			$(".obraz").removeClass("ukryte");
			$(".wczytywanie").addClass("ukryte");
		}
		else
		{
			console.log(e);
			$(".wczytywanie").text("Błąd wczytywania obrazu.");
		}
	});
}
wczytajObraz(folder + "/" + obraz);

function poprzedni()
{
	if (id > 0)
	{
		id--;

		if (id == 0)
			$(".poprzedni").addClass("nieaktywny");
		else
			$(".nastepny").removeClass("nieaktywny");

		wczytajObraz(folder + "/" + obrazyLista[id].nazwa);
	}
}
function nastepny()
{
	if(id < obrazyLista.length - 1)
	{
		id++;
		
		if (id == obrazyLista.length - 1)
			$(".nastepny").addClass("nieaktywny");
		else
			$(".poprzedni").removeClass("nieaktywny");

		wczytajObraz(folder + "/" + obrazyLista[id].nazwa);
	}
}

api("listuj-pliki", {folder: folder}, odp =>
{
	for (i in odp)
	{
		if (obslugiwaneTypy.includes(odp[i].typ))
		{
			obrazyLista.push(odp[i]);
			
			if (odp[i].nazwa == obraz)
			{
				id = obrazyLista.length - 1;
			}
		}
	}

	if (id != 0)
		$(".poprzedni").removeClass("nieaktywny");

	if(id != obrazyLista.length - 1)
		$(".nastepny").removeClass("nieaktywny");
});

document.onkeydown = klawiatura;

function klawiatura(e)
{

	e = e || window.event;
	
	if (e.code == 'ArrowRight')
	{
		nastepny();
	}
	else if (e.code == 'ArrowLeft')
	{
		poprzedni();
	}

}

function przesunObraz(x, y)
{
	if (maksymalizowane)
	{
		x -= 20;
		y -= 20;
		
		x /= window.innerWidth - 40;
		y /= window.innerHeight - 90;
		
		if (x > 1) x = 1;
		else if (x < 0) x = 0;
		if (y > 1) y = 1;
		else if (y < 0) y = 0;
		
		x *= 100;
		y *= 100;
		
		$(".obraz").css("object-position", x + "% " + y + "%");
	}
	else
	{
		$(".obraz").css("object-position", "center");
	}
}

$(".poprzedni").click(poprzedni);
$(".nastepny") .click(nastepny);

let maksymalizowane = false;
$(".rozmiar").click(e =>
{
	if (maksymalizowane)
	{
		$(".obraz").css("object-fit", "scale-down");
		$(".rozmiar").html("+");
	}
	else
	{
		$(".obraz").css("object-fit", "none");
		$(".rozmiar").html("-");
	}
	
	maksymalizowane = !maksymalizowane;
	przesunObraz(e.originalEvent.clientX, e.originalEvent.clientY);
});

$("body").mousemove(e =>
{
	przesunObraz(e.originalEvent.clientX, e.originalEvent.clientY);
});

document.body.ontouchmove = e =>
{
	przesunObraz(e.touches[0].clientX, e.touches[0].clientY);
};
