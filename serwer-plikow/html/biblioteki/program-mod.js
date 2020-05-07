// Pobieranie sesji
import sesja from "/api/sesja";

window.sesja = sesja;

// === API === //
//Czy iframe?
function wIframe()
{
	try
	{
		return window.self !== window.top;
	}
	catch (e)
	{
		return true;
	}
}

window.api = function (plik, ...arg)
{
	setTimeout(() =>
	{
		api(plik, ...arg);
	}, 50);
};

if (wIframe())
{
	window.api = window.top.api;
}
else
{
	$.getScript("/biblioteki/socket.io.js")
	.done(function( script, textStatus )
	{
		if(textStatus != "success")
			alert("Błąd wczytywania API!");
		  
		const socket = io('',
		{
			path: '/socket.io',
			transports: ['websocket'],
			secure: true,
		});
		
		
		let zapytania = {};

		api = function (plik, ...arg)
		{
			if (arg.length < 1)
				return false;
			
			let odpowiedz = arg.pop();
			let dane;
			
			
			if (arg.length >= 1)
				dane = arg.pop();
			
			let id = "";
			
			function generujID()
			{
				id = "";
				let znaki = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

				for (let i = 0; i < 32; i++)
					id += znaki.charAt(Math.floor(Math.random() * znaki.length));
			}
			
			generujID();
			while (zapytania[id] != undefined)
				generujID();
			
			zapytania[id] = odpowiedz;

			socket.emit("api", {plik: plik, dane: dane, id: id});
		}

		//API
		socket.on("api", function (odp)
		{
			if (zapytania[odp.id])
				zapytania[odp.id](odp.odp, odp.dane);
			else
			{
				console.log("Niezdefiniowana funkcja o ID: " + odp.id);
				console.log("Odpowedź:");
				console.log(odp);
			}
			
			if (odp.koniec)
				delete zapytania[odp.id];
		});
	})
	.fail(function(jqxhr, settings, exception)
	{
		alert("Błąd wczytywania skryptu!");
	});
} 

// === Program === //

//Biblioteka jQuery reagująca na zmianę innerHTML
(function($) {
  $.fn.change = function(cb, e) {
    e = e || { subtree:true, childList:true, characterData:true };
    $(this).each(function() {
      function callback(changes) { cb.call(node, changes, this); }
      var node = this;
      (new MutationObserver(callback)).observe(node, e);
    });
  };
})(jQuery);

// Pobieranie argumentów GET
window.parametry = {};
if (location.search.substring(1))
	window.parametry = JSON.parse(decodeURIComponent(location.search.substring(1)));

//wysyłanie do głównego okna tytułu
function wyslijTytul()
{
	if (window.top != window.self)
	{
		window.top.zmienTytul(window.frameElement, $("title")[0].innerHTML);
	}
}
$('title').change(function() { wyslijTytul() });
wyslijTytul();

//wysyłanie do głównego okna ikony
function wyslijIkone()
{
	if (window.top != window.self && $("link[rel=favicon], link[rel=icon]")[0] != undefined)
	{
		let link = $("link[rel=favicon], link[rel=icon]")[0].href;
		
		if (!link.startsWith("/") && !link.startsWith("http"))
		{
			let startLink = location.pathname.split("/");
			
			if (!location.pathname.endsWidth("/"))
				startLink.pop();
			
			link = startLink.join("/") + "/" + link;
		}
		
		window.top.zmienIkone(window.frameElement, link);
	}
}
$('link[rel=favicon]').change(function() { wyslijIkone() });
$('link[rel=icon]').change(function() { wyslijIkone() });
wyslijIkone();

$(document).mousedown(() =>
{
	if (window.top != window.self)
	{
		window.top.naWierzch(window.frameElement.parentElement);
	}
});

//Otwieranie plików
window.otworz = function(url, typ)
{
	while(url.substr(0, 1) == "/")
	{
		url = url.substr(1);
	}
	while(url.substr(-1, 1) == "/")
	{
		url = url.substr(0, url.length - 1);
	}
	
	if
	(
		[
			"image/png",
			"image/gif",
			"image/jpeg",
			"image/svg",
			"image/svg+xml"
		].includes(typ)
	)
	{
		program.otworz("/programy/podglad-obrazow/index.html", {plik: url });
	}
	else if (["application/pdf"].includes(typ))
	{
		program.otworz("/programy/podglad-pdf/index.html", {plik: "/p/" + url });
	}
	else if (["text/html"].includes(typ))
	{
		program.otworz("/p/" + url.replace(/\#/gm, "%23").replace(/\?/gm, "%3F"));
	}
	else if
	(
		typ.match(/^text/) ||
		[
			"application/x-sh",
			"application/x-cplusplus",
			"application/json",
			"application/javascript",
			"application/css",
			"application/x-httpd-php"
		].includes(typ)
	)
	{
		program.otworz("/programy/notatnik/index.html", {plik: "/p/" + url });
	}
	else
	{
		var win = window.open("/p/" + url.replace(/\#/gm, "%23").replace(/\?/gm, "%3F"), '_blank');
		win.focus();
	}
}

window.sciezkaNaURL = function(url)
{
	if (url.startsWith("~/"))
		return encodeURI("/p/" + sesja.dom + url.substr(1)).replace(/\#/gm, "%23").replace(/\?/gm, "%3F").replace(/\&/gm, "%26");
	else if (url === "~")
		return encodeURI("/p/" + sesja.dom).replace(/\#/gm, "%23").replace(/\?/gm, "%3F").replace(/\&/gm, "%26");
	else if (url.startsWith("/"))
		return encodeURI(url).replace(/\#/gm, "%23").replace(/\?/gm, "%3F").replace(/\&/gm, "%26");
	else
	{
		let lokalizacja = location.pathname.split("/");
		lokalizacja.shift();
		lokalizacja.pop();
		return encodeURI("/" + lokalizacja.join("/") + "/" + url).replace(/\#/gm, "%23").replace(/\?/gm, "%3F").replace(/\&/gm, "%26");
	}
}

window.program =
{
	zamknij: function (id = parametry.programId)
	{
		if (wIframe())
		{
			parent.program.zamknij(id);
		}
	},
	otworz: function (program, dane, ustawienia)
	{
		if (wIframe())
			parent.program.otworz(program, dane, ustawienia);
		else
		{
			if (dane != null)
			{
				dane = "?" + encodeURIComponent(JSON.stringify(dane));
			}

			var karta = window.open(program + dane, '_blank');
			karta.focus();
		}
	}
};

$(".pasekOpcji").on("click", ".aktywny", () =>
{
	$(".kategoria .lista").css("display", "none");
	setTimeout(() =>
	{
		$(".kategoria .lista").css("display", "");
	}, 100);
});
