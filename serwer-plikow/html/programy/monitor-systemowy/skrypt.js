let uzytkownicy = {};

function liczbaNaTekst(liczba, zaokr = 20, zeraZaokr = false)
{
	if (zeraZaokr)
		zeraZaokr = zaokr;
	else
		zeraZaokr = 0;
	
	return liczba.toLocaleString(undefined,
	{
		minimumFractionDigits: zeraZaokr,
		maximumFractionDigits: zaokr
	});
}
function sekundyNaCzas(sekundy)
{
	let dni = Math.floor(sekundy / 86400);
	sekundy -= dni * 86400;
	let godziny = Math.floor(sekundy / 3600);
	sekundy -= godziny * 3600;
	let minuty = Math.floor(sekundy / 60);
	sekundy -= minuty * 60;
	
	return dni + ":" + String(godziny).padStart(2, '0') + ":" + String(minuty).padStart(2, '0') + ":" + String(sekundy).padStart(2, '0');
}

function wczytaj()
{
	$.get("/api/system", function(odp, status)
	{
		//console.log(odp);
		$(".z-ram").text(liczbaNaTekst(100 - (odp.ramWolny / odp.ram * 100), 2, true) + "%, " + liczbaNaTekst((odp.ram - odp.ramWolny) / 1048576, 0) + "/" + liczbaNaTekst(odp.ram / 1048576, 0) + " MB");
		
		$(".z-cpu").text
		(
			liczbaNaTekst(odp.cpuUzycie[0] / odp.cpu.length * 100, 2, true) + "% " +
			liczbaNaTekst(odp.cpuUzycie[1] / odp.cpu.length * 100, 2, true) + "% " +
			liczbaNaTekst(odp.cpuUzycie[2] / odp.cpu.length * 100, 2, true) + "%"
		);
		
		$(".czas-odStartu").text(sekundyNaCzas(odp.odStartu));
	});
	
	api("procesy", odp =>
	{
		$("table").html(`<tr><th>Proces</th><th>CPU %</th><th>RAM</th><th>ID procesu</th><th>PPID</th><th>Użytkownik</th></tr>`);
		
		odp.sort(sortuj);
		
		for (i in odp)
		{
			let uzytkownik = odp[i].uid;
			if (uzytkownicy[odp[i].uid] != undefined)
				uzytkownik = uzytkownicy[odp[i].uid].uzytkownik;
			
			$("table").append(`
		<tr title="` + odp[i].cmd + `">
			<td>` + odp[i].name + `</td>
			<td>` + odp[i].cpu + `</td>
			<td>` + odp[i].memory + `</td>
			<td>` + odp[i].pid + `</td>
			<td>` + odp[i].ppid + `</td>
			<td>` + uzytkownik + `</td>
		</tr>
		`);
		}
	});
}
setInterval(wczytaj, 1000);
wczytaj();

let sortujWg = "cpu";
let sortujWgM = true;

function sortuj(a, b)
{
	let comparison = 0;
	if (a[sortujWg] > b[sortujWg])
		comparison = 1;
	else if (a[sortujWg] < b[sortujWg])
		comparison = -1;
	
	if (sortujWgM)
		comparison = - comparison;
	
	return comparison;
}

api("uzytkownicy", odp =>
{
	for (i in odp)
	{
		uzytkownicy[odp[i].idu] = odp[i];
	}
});
