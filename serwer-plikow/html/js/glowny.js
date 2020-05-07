let maxZI = 1;
let programId = 0;
let programy = {};

function zmienTytul (okno, tytul)
{
	okno.parentElement.firstElementChild.lastElementChild.innerHTML = tytul;
}

function zmienIkone (okno, ikona)
{
	okno.parentElement.firstElementChild.firstElementChild.firstElementChild.src = ikona;
	$(".program-pasek[data-programid=" + okno.parentElement.dataset.programid + "]").find("img").attr("src", ikona);
}

function naWierzch(okno)
{
	$(".programy").children(".program").removeClass("aktywny");
	
	$(okno).addClass("aktywny");
	
	maxZI++;
	$(okno).css("z-index", maxZI);
	$(".menuOkno").css("z-index", maxZI + 10);
	$(".pasekProgramow").css("z-index", maxZI + 20);
}

$(".programy").on("mousedown", ".program", function() { naWierzch(this); });


var program =
{
	zamknij: function (id)
	{
		$(".program[data-programid=" + id + "]").fadeOut();
		$(".program-pasek[data-programid=" + id + "]").fadeOut();
		setTimeout(() =>
		{
			$(".program[data-programid=" + id + "]").remove();
			$(".program-pasek[data-programid=" + id + "]").remove();
		}, 400);
	},
	otworz: function (programUrl, argumenty = {}, parametry)
	{
		$(".menuOkno").removeClass("aktywne");
		
		if (typeof argumenty != "object" || argumenty == null)
			argumenty = {};

		argumenty.programId = programId;
		programId++;

		let arg = "?" + encodeURIComponent(JSON.stringify(argumenty));
		
		if (typeof parametry != "object")
			parametry = {};
		
		if (parametry.zmienialnyRozmiar === undefined)
			parametry.zmienialnyRozmiar = true;
		
		if (parametry.x == undefined)
			parametry.x = 800;
		
		if (parametry.y == undefined)
			parametry.y = 600;
		
		if (parametry.minX == undefined)
			parametry.minX = 140;
		
		if (parametry.minY == undefined)
			parametry.minY = 50;
	
		if (parametry.maxX == undefined)
			parametry.maxX = 0;
		
		if (parametry.maxY == undefined)
			parametry.maxY = 0;
		
		let ikona = $(`<div class="program-pasek" data-programid="` + argumenty.programId + `"><img src="/ikony/mimetypes/scalable/application.svg" alt=""><div class="program-fixed"></div></div>`);
		let iframe = $(`<iframe src="` + programUrl + arg + `"></iframe>`);
		let program = $
		(
		`<div class="program" data-programid="` + argumenty.programId + `" style="position: absolute; display:none">
			<div class="pasek">
				<div class="ikona"><img src="/ikony/mimetypes/scalable/application.svg" alt=""></div>
				<div class="przyciski">
					<i class="icon-window-minimize przycisk-minimalizuj"></i>
					` + (parametry.zmienialnyRozmiar ? `<i class="icon-window-maximize przycisk-pelny-ekran"></i>`: ``) + `
					<i class="icon-cancel przycisk-zamknij"></i>
				</div>
				<div class="nazwa"></div>
			</div>
		</div>`
		);

		iframe.on("load", function()
		{
			let meta = $(this.contentDocument).find("meta");
			
			for (let i = 0; i < meta.length; i++)
			{
				if (meta[i].name)
				if (meta[i].name.match(/^prog-/))
					parametry[meta[i].name.substr(5)] = meta[i].content;
			}

			if (parseInt(parametry.x) > window.innerWidth - 20)
				parametry.x = window.innerWidth - 20;
			if (parseInt(parametry.y) > window.innerHeight - 20)
				parametry.y = window.innerHeight - 20;
			
			let programX = (window.innerWidth  - parseInt(parametry.x)) / 2;
			let programY = (window.innerHeight - parseInt(parametry.y)) / 2;

			program.css(
			{
				top:    programY + "px",
				left:   programX + "px",
				width:  parametry.x + "px",
				height: parametry.y + "px"
			});

			program.draggable
			({
				scroll: false,
				handle: ".pasek",
				containment: ".programyObszar",
				start: function()
				{
					$("iframe").css("pointer-events", "none");
					
					$(this).removeClass("pelny-ekran");
					$(this).find(".przycisk-pelny-ekran").addClass("icon-window-maximize").removeClass("icon-window-restore");
					
					naWierzch(this);
				},
				stop: function()
				{
					$("iframe").css("pointer-events", "");
				}
			});
			if (parametry.zmienialnyRozmiar)
			{
				program.resizable
				({
					minHeight: parametry.minY,
					minWidth:  parametry.minX,
					maxHeight: parametry.maxY,
					maxWidth:  parametry.maxX,
					handles: 'all',
					containment: ".programyObszar",
					start: function()
					{
						$("iframe").css("pointer-events", "none");
					},
					stop: function()
					{
						$("iframe").css("pointer-events", "");
					}
				});
			}
			
			program.find(".ui-resizable-handle").mousedown(() =>
			{
				$("iframe").css("pointer-events", "none");
			});
			
			program.find(".przycisk-pelny-ekran").click(function ()
			{
				$(this.parentElement.parentElement.parentElement).toggleClass("pelny-ekran");
				$(this).toggleClass("icon-window-maximize").toggleClass("icon-window-restore");
			});
			
			program.find(".przycisk-zamknij").click(function ()
			{
				window.program.zamknij(argumenty.programId);
			});
			
			function minimalizuj()
			{
				if ($(this).hasClass("przycisk-minimalizuj"))
				{
					$(this.parentElement.parentElement.parentElement).toggleClass("zminimalizowane");
				}
				else
				{
					let progr = $(".program[data-programid=" + this.dataset.programid + "]");
					if(progr.hasClass("zminimalizowane"))
					{
						progr.toggleClass("zminimalizowane");
						naWierzch(progr[0]);
					}
					else if (progr.hasClass("aktywny"))
					{
						progr.toggleClass("zminimalizowane");
					}
					else
					{
						naWierzch(progr[0]);
					}
				}
			}
			
			program.find(".przycisk-minimalizuj").click(minimalizuj);
			ikona.click(minimalizuj);
			
			function dopasujObszar()
			{
				var pozycja = this.parentElement.getBoundingClientRect();
				
				$(".programyObszar").css(
				{
					"left": -(pozycja.width - 60) + "px",
					"width": "calc(100vw + " + ((pozycja.width - 60) * 2) + "px)",
					"height": "calc(100vh + " + (pozycja.height - 66) + "px)"
				});
			}
			
			program.find(".pasek").hover(dopasujObszar);
			program.find(".ui-resizable-handle").hover(dopasujObszar);
			
			program.find("iframe").focusout(() =>
			{
				console.log("P");
				program.removeClass("aktywny");
			});
			program.find("iframe").focusin(() =>
			{
				console.log("W");
				program.addClass("aktywny");
			});
			
			naWierzch(program);
			
			$(this).focus();
			program.fadeIn();
		});

		$(".pasek-programy").append(ikona);
		program.append(iframe);
		$(".programy").append(program);
	}
};

//Zegar
function zegarOdswierz()
{
	let d = new Date();
	
	$(".zegar").text(d.getHours() + ":" + ("0" + d.getMinutes()).substr(-2));
}
zegarOdswierz();
setInterval(zegarOdswierz, 100);

$(".menu").on("focusout", (e) =>
{
	if
	(
		!$.contains($(".menuOkno")[0], e.originalEvent.explicitOriginalTarget) &&
		$(".menuOkno")[0] != e.originalEvent.explicitOriginalTarget
	)
		$(".menuOkno").removeClass("aktywne");
});
$(".menu").click(function ()
{
	if ($(".menuOkno").hasClass("aktywne"))
		this.blur();
	else
	{
		$(".menuOkno").addClass("aktywne");
		$(".program").removeClass("aktywny");
	}
});

$(".menuOkno").click(function ()
{
	$(".menu").focus();
});

$(".wyloguj").click(function ()
{
	$(".ekranWczytywania").fadeIn(500);
	$.getJSON("/wyloguj", json =>
	{
		if (json.wylogowano)
			setTimeout(() => { location.reload(); }, 500);
	});
});

function zaladujPulpit()
{
	$.getJSON("/p/nas/.system/domyslny-wyglad.json", jsonDom =>
	{
		$.getJSON("/p/" + uzytkownik.sesja.dom + "/.konfig/wyglad.json", jsonWl =>
		{
			//Łączenie objektów
			let json = Object.assign({}, jsonDom, jsonWl);
			
			//Tapeta
			if (json.tapeta.startsWith("~/"))
				json.tapeta = "/p/" + uzytkownik.sesja.dom + json.tapeta.substr(1);
			else if (!json.tapeta.startsWith("/"))
				json.tapeta = "/p/" + json.tapeta;
			
			$("body").css("background-image", "url(" + json.tapeta + ")");
			
			obrazZaladuj(json.tapeta, (zaladowano, blad) =>
			{
				if (!zaladowano)
				{
					console.log("Błąd ładowania tapety!");
					console.log(blad);
				}
				pokazWczytane();
			});
		});
			
	});
}

function pokazWczytane()
{
	$(".ekranWczytywania").fadeOut(500);
}


let uzytkownik;
api("sesja-info", odp =>
{
	uzytkownik = odp;
	$(".menuOkno .menuUzytkownik")   .append ("<img src='/avatary/" + uzytkownik.sesja.uzytkownik + ".png'>");
	$(".menuOkno .menuPrawoProgramy").prepend(`<div title="` + uzytkownik.info.wyswietlanaNazwa + `" onclick="otworzProgram('/programy/przegladarka-plikow/index.html', \`~/\`, true)"><b>` + uzytkownik.info.wyswietlanaNazwa + `</b></div>`);
	wczytajListeProgramow();
	zaladujPulpit();
});
//socket.emit("api", {plik: "sesja-info"});