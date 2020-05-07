$.getJSON("/uzytkownicy", function(json)
{
	json.sort(function (a, b) {return a.wyswietlanaNazwa.localeCompare(b.wyswietlanaNazwa); });
	
	for (i in json)
	{
		let uzytkownik = $("<div class='uzytkownik' data-login='" + json[i].login + "'><img src='/avatary/" + json[i].login + ".png' alt=''><span>" + json[i].wyswietlanaNazwa + "</span></div>").click(wybierzKlik);
		
		let poleHaslo   = $("<input type='password' name='haslo' placeholder='Hasło' class='haslo'>");
		let poleZaloguj = $("<input type='submit' value='➜'>");
		
		poleZaloguj.click(function ()
		{
			$(this.previousElementSibling).prop("disabled", true);
			zaloguj(this.parentElement.dataset.login, this.previousElementSibling.value);
		});
		
		poleHaslo.on("keyup", function(e)
		{
			if (e.keyCode === 13)
			{
				e.preventDefault();
				poleZaloguj.click();
			}
		});
		
		uzytkownik.append(poleHaslo);
		uzytkownik.append(poleZaloguj);
		
		$(".uzytkownicy").append(uzytkownik);
		
		
		$(uzytkownik).find("img").on('dragstart', e => { e.preventDefault(); });
	}
});
function wybierzKlik()
{
	if(!$(this).hasClass("wybrany"))
	{
		$(".uzytkownik").removeClass("wybrany");
		$(this).addClass("wybrany");
		$(this).find(".haslo").val("");
		$(this).find(".haslo").focus();
	}
}

function zaloguj(login, haslo)
{
	$.post("/zaloguj", {login: login, haslo: haslo}, function(odp)
	{
		
		if(odp.zalogowano)
		{
			$(".ekranWczytywania").fadeIn(500);
			
			setTimeout(() => { location.reload(); }, 500);
		}
		else
		{
			$(".haslo").prop("disabled", false);
		}
	});
}

$('img').on('dragstart', e => { e.preventDefault(); });

$(".ekranWczytywania").fadeOut(500);
