let lokalizacja = "";

function getJSON (url, callback)
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
function createElementFromHTML(htmlString)
{
	var div = document.createElement('div');
	div.innerHTML = htmlString.trim();

	// Change this to div.childNodes to support multiple top-level nodes
	return div.firstChild; 
}
function hslaToRgba(h, s, l, a)
{
    var r, g, b;

    if(s == 0)
	{
        r = g = b = l; // achromatic
    }
    else
	{
        var hue2rgb = function hue2rgb(p, q, t)
		{
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return "rgba(" + Math.round(r * 255) + ", " + Math.round(g * 255) + ", " + Math.round(b * 255) + ", " + a + ")";
}


function rozmiarDoStr(rozmiar)
{
	var rozmiarStr = "";
	
	if (rozmiar > 1024)
		rozmiarStr = (rozmiar / 1024).toFixed(2).replace(".", ",") + " MB";
	if (rozmiar > 1048576)
		rozmiarStr = (rozmiar / 1048576).toFixed(2).replace(".", ",") + " GB";
	if (rozmiar > 1073741824)
		rozmiarStr = (rozmiar / 1073741824).toFixed(2).replace(".", ",") + " TB";
	if (rozmiar > 1099511627776)
		rozmiarStr = (rozmiar / 1099511627776).toFixed(2).replace(".", ",") + " PB";
	return rozmiarStr;
}

function wczytajLokalizacje ()
{
	getJSON ("/r/" + lokalizacja, function (json)
	{
		document.getElementById("rozmiar").innerHTML = "";
		console.log(json);
		
		json.zawartosc.sort(function (a, b)
		{
			return (b.rozmiar - a.rozmiar);
		});
		
		//document.getElementById("rozmiar").appendChild(createElementFromHTML("<div style='width: 100%'>" + lokalizacja + " - " + rozmiarDoStr(json.rozmiar) + "</div>"));
		
		var wykresNazwy = [];
		var wykresWartosci = [];
		var wykresKolory = [];
		var wykresKoloryWypelnienie = [];
		
		for (i in json.zawartosc)
		{
			let rozmiarStr = rozmiarDoStr(json.zawartosc[i].rozmiar);
			

			wykresNazwy.push(json.zawartosc[i].folder);
			wykresWartosci.push(json.zawartosc[i].rozmiar);
			
			var kolorH = Math.random();
			
			wykresKolory.push(hslaToRgba(kolorH, 1, 0.5, 1));
			wykresKoloryWypelnienie.push(hslaToRgba(kolorH, 1, 0.5, 0.25));
			
			/*szerokosc = json.zawartosc[i].rozmiar / json.rozmiar;
			if (json.zawartosc[i].dostep)
				document.getElementById("rozmiar").appendChild(createElementFromHTML("<div style='background: hsl(" + (Math.random() * 360) + ", 100%, 50%); width: " + (szerokosc * 100) + "%; cursor: pointer' onClick='przejdzDo(\"" + json.zawartosc[i].folder + "\")'>" + json.zawartosc[i].folder + " - " + rozmiarStr + "</div>"));
			else
				document.getElementById("rozmiar").appendChild(createElementFromHTML("<div style='background: hsl(" + (Math.random() * 360) + ", 100%, 50%); width: " + (szerokosc * 100) + "%'>" + json.zawartosc[i].folder + " - " + rozmiarStr + "</div>"));*/
		}
		
		stworzWykres(wykresNazwy, wykresWartosci, wykresKolory, wykresKoloryWypelnienie);
	});
}

function przejdzDo(folder)
{
	lokalizacja = folder;
	wczytajLokalizacje();
}

wczytajLokalizacje();

function stworzWykres(nazwy, wartosci, kolory, koloryWypelnienie)
{
	var ctx = document.getElementById("canvas");
	var wykres = new Chart(ctx, {
		type: 'doughnut',
		data: {
			labels: nazwy,
			datasets: [{
				label: ' kB',
				data: wartosci,
				backgroundColor: koloryWypelnienie,
				borderColor: kolory,
				borderWidth: 1
			}]
		}
	});
}
