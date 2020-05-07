function zapisz()
{
	console.log({
		plik: $(".plik")[0].value,
		zawartosc: $("textarea")[0].value,
		nadpisz: $(".nadpisz")[0].checked
	});
	
	api("plik-zapisz",
	{
		plik: $(".plik")[0].value,
		zawartosc: $("textarea")[0].value,
		nadpisz: $(".nadpisz")[0].checked
	},
	odp => { console.log(odp); });
}
