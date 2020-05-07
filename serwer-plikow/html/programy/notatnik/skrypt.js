let editor = ace.edit("editor");

let modelist  = ace.require("ace/ext/modelist");

editor.setOptions({scrollPastEnd: 1, wrap: true});

function wczytaj(plik, tylkoOdczyt = false)
{
	let plikNazwa = plik.split("/");
	plikNazwa = plikNazwa.pop();
	plik = sciezkaNaURL(plik);
	$.get(plik, (odp, sukces, typ) =>
	{
		$("title").text("Notatnik — " + plikNazwa);
		
		editor.session.setMode(modelist.getModeForPath(plik).mode);

		editor.session.setValue(odp);

		editor.setReadOnly(tylkoOdczyt);

	}, "text");
}

function nowy()
{
	$("title").text("Notatnik — Nowy plik");
	
	editor.setReadOnly(false);
	editor.session.setValue("");
}

let zawijanie = true;
function zawijajWiersze()
{
	zawijanie = !zawijanie;
	editor.setOptions({wrap: zawijanie});
}

function wczytajKodowania()
{
	let ul;
	for (let i in modelist.modes)
	{
		if (parseInt(i)%25 === 0)
		{
			ul = $("<ul></ul>");
			$(".pasek-podswietlanieKodowania").append(ul);
		}
		
		$(ul).append(`<li class="aktywny" onclick="editor.session.setMode('` + modelist.modes[i].mode + `')">` + modelist.modes[i].caption + "</li>");
	}
}
wczytajKodowania();

function wczytajStyle()
{
	var style =
	[
		"Chrome",
		"Clouds",
		"Crimson Editor",
		"Dawn",
		"Dreamweaver",
		"Eclipse",
		"GitHub",
		"IPlastic",
		"Solarized Light",
		"TextMate",
		"Tomorrow",
		"XCode",
		"Kuroir",
		"KatzenMilch",
		["SQL Server", "sqlserver"],
		"Ambiance",
		"Chaos",
		"Clouds Midnight",
		["Dracula", ""],
		"Cobalt",
		"Gruvbox",
		["Green on Black", "gob"],
		"idle Fingers",
		["krTheme","kr_theme"],
		"Merbivore",
		"Merbivore Soft",
		"Mono Industrial",
		"Monokai",
		"Pastel on dark",
		"Solarized Dark",
		"Terminal",
		"Tomorrow Night",
		"Tomorrow Night Blue",
		"Tomorrow Night Bright",
		["Tomorrow Night 80s", "tomorrow_night_eighties"],
		"Twilight",
		"Vibrant Ink"
	];

	for (let i in style)
	{
		if (parseInt(i)%25 === 0)
		{
			ul = $("<ul></ul>");
			$(".pasek-style").append(ul);
		}

		if (typeof style[i] === "string")
			$(ul).append(`<li class="aktywny" onclick="editor.setTheme('ace/theme/` + style[i].replace(/ /g, "_").toLowerCase() + `')">` + style[i] + "</li>");
		else
			$(ul).append(`<li class="aktywny" onclick="editor.setTheme('ace/theme/` + style[i][1] + `')">` + style[i][0] + "</li>");
	}
}
wczytajStyle();

if (typeof parametry.plik === "string")
{
	wczytaj(parametry.plik, true);
}
