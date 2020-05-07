var c = document.getElementById("canvas");
var ctx = c.getContext("2d");

ctx.lineCap = "round";

var teraz = new Date();

var terazTs = Math.round(teraz.getTime() / 1000);

var dArr = [];

function tekstNaCzasUnix(tekst)
{
	let tekstArr = tekst.match(/(\d\d\d\d)(\d\d)(\d\d)T(\d\d)(\d\d)(\+|\-)(\d\d)/);
	if (tekstArr)
	{
		var d = new Date(tekstArr[1], parseInt(tekstArr[2]) - 1, tekstArr[3], tekstArr[4], tekstArr[5], 0, 0);
		
		var terazTs = Math.round(d.getTime() / 1000);
		
// 		if (tekstArr[6] = "-")
// 			terazTs += 3600 * parseInt(tekstArr[7]);
// 		else
// 			terazTs -= 3600 * parseInt(tekstArr[7]);
		
		return terazTs;
	}
	else
	{
		return false;
	}
}

$.get("/l/dev/sdd", function(data, status)
{
	dArr.push([data, "#F78C00", "/dev/sdd"]);
	rysujWszystko();
});
$.get("/l/dev/sdc", function(data, status)
{
	dArr.push([data, "#EDED00", "/dev/sdc"]);
	rysujWszystko();
});
$.get("/l/dev/sdb", function(data, status)
{
	dArr.push([data, "#0F6", "/dev/sdb"]);
	rysujWszystko();
});
$.get("/l/dev/sda", function(data, status)
{
	dArr.push([data, "#00B7BA", "/dev/sda"]);
	rysujWszystko();
});

function rysujWszystko()
{
	ctx.clearRect(0, 0, c.width, c.height);
	
	$(".legenda").html("");
	for (i in dArr)
	{
		rysujWykres(dArr[i][0], dArr[i][1], dArr[i][2]);
	}
	
	rysujPodzialke();
}

function rysujWykres(dane, kolor, nazwa)
{
	let tempAktualna;
	let ostCzas;
	
	ctx.strokeStyle = kolor;
	ctx.lineWidth = 2;
	
	let daneArr = dane.split("\n");
	ctx.beginPath();

	for (let i in daneArr)
	{
		let daneTemp = daneArr[i].split("\t");
		
		if (daneTemp[1] != undefined)
		{
			let odsuniecie = ((86400 - (terazTs - tekstNaCzasUnix(daneTemp[0]))) / 86400) * c.width - 60;
			
			if (ostCzas < tekstNaCzasUnix(daneTemp[0]) - 500)
				ctx.moveTo(odsuniecie + 50, c.height - daneTemp[1] * c.height / 100);
			
			ctx.lineTo(odsuniecie + 50, c.height - daneTemp[1] * c.height / 100);
			
			
			ostCzas = tekstNaCzasUnix(daneTemp[0]);
			tempAktualna = daneTemp[1];
		}
		
	}
	
	ctx.stroke();
	
	$(".legenda").append("<tr><td><div style='background: " + kolor + "'></div></td><td><b>" + nazwa + "</b></td><td>" + tempAktualna + "°C</td></tr>");
}

function rysujPodzialke()
{
	ctx.strokeStyle = "#FFF2";
	ctx.fillStyle = "#FFF";
	ctx.beginPath();
	
	ctx.font = "12px sans-serif";
	
	for (let i = 0; i < 10; i++)
	{
		ctx.moveTo(0, c.height - i * c.height / 10);
		ctx.lineTo(c.width, c.height - i * c.height / 10);
		
		ctx.fillText(i * 10 + "°C", 10, c.height - i * c.height / 10 - 5);
	}
	ctx.stroke();
	
	ctx.strokeStyle = "#FF0A";
	ctx.beginPath();
	ctx.moveTo(0, c.height * 0.4);
	ctx.lineTo(c.width, c.height * 0.4);
	ctx.stroke();
	
	ctx.fillStyle = "#FF01";
	ctx.fillRect(0, c.height * 0.3, c.width, c.height / 10);
	
	ctx.strokeStyle = "#F00";
	ctx.beginPath();
	ctx.moveTo(0, c.height * 0.3);
	ctx.lineTo(c.width, c.height * 0.3);
	ctx.stroke();
	
	ctx.fillStyle = "#F002";
	ctx.fillRect(0, 0, c.width, c.height * 0.3 );
}

function zmienRozimar()
{
	c.width  = window.innerWidth;
	c.height = window.innerHeight;
	rysujWszystko();
}

$(window).resize(function()
{
	zmienRozimar();
});

zmienRozimar();
