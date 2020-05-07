alert("Wczytano skrypt");
function uruchom ()
{
	alert("Uruchomiono skrypt");

	let sciezka = "";

	var getJSON = function(url, callback)
	{
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.onload = function()
		{
			var status = xhr.status;
			if (status === 200)
			{
				callback(JSON.parse(xhr.response), null);
			}
			else
			{
				callback(JSON.parse(xhr.response), status);
			}
		};
		xhr.send();
	};
	
	function przejdz (url)
	{
		while(url.substr(0, 1) == "/")
		{
			url = url.substr(1);
		}
		while(url.substr(-1, 1) == "/")
		{
			url = url.substr(0, url.length - 1);
		}
		
		sciezka = url;
		
		alert("Rozpoczęto pobieranie");
		
		getJSON("f/" + encodeURI(sciezka), function (json)
		{
			alert("Zakończonoa pobieranie");
			
			document.getElementById("pliki").innerHTML = "<h1>Zawartość folderu</h1>";
			
			for(i in json.zawartosc)
			{
				document.getElementById("pliki").innerHTML += json.zawartosc[i].n + "<br>";
			}
		});
	}
	przejdz (sciezka);
}
