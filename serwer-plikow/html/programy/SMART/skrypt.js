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

function dodajDysk(odp, dane)
{
	$("ul").append
	(`<li class="tab">
        <input type="radio" name="tabs" checked="checked" id="tab-` + dane.dysk.replace(/\//g, "") + `" />
        <label for="tab-` + dane.dysk.replace(/\//g, "") + `">` + dane.dysk + `</label>
        <div id="tab-content-` + dane.dysk.replace(/\//g, "") + `" class="content">
          <pre>` + odp + `</pre>
        </div>
    </li>`);
}

api("smart", {dysk: "/dev/sda"}, dodajDysk);
api("smart", {dysk: "/dev/sdb"}, dodajDysk);
api("smart", {dysk: "/dev/sdc"}, dodajDysk);
api("smart", {dysk: "/dev/sdd"}, dodajDysk);
