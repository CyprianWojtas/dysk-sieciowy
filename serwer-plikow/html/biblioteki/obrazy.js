function obrazZaladuj(url, fZwrotna)
{
	img = new Image();
	img.onload = function()
	{
		fZwrotna(true);
		delete this;
	};
	img.onerror = function(e)
	{
		fZwrotna(false, e);
		delete this;
	}
	
	img.src = encodeURI(url).replace(/\#/gm, "%23").replace(/\?/gm, "%3F");
}
