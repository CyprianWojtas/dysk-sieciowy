$(".ikona").click(function()
{
	$.get("podstrony/" + this.dataset.kategoria + ".html", odp =>
	{
		$("main").html(odp);
	});
});