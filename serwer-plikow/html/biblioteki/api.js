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

function api(plik, ...arg)
{
	setTimeout(() =>
	{
		api(plik, ...arg);
	}, 50);
};

if (wIframe())
{
	api = window.top.api;
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
