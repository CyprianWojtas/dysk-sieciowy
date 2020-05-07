const app = require('express')();
const session = require('express-session');
const sharedsession = require("express-socket.io-session");
const bodyParser = require('body-parser');
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const mime = require('mime-types');
const execSync = require('child_process').execSync;
const filepreview = require('filepreview');
const passwdLinux = require("passwd-linux");
const isBinaryFile = require("isbinaryfile");
const dostep = require("./js/dostep");

let konfiguracja;

try
{
	konfiguracja = JSON.parse(fs.readFileSync('./konfiguracja.json'));
}
catch (e)
{
	wypisz("Nie można odczytać pliku konfiguracyjnego!");
	wypisz(e);
	return;
}

sesja = session
({
	secret: 'jakiś sekretny kod',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: konfiguracja.szyfrowanePolaczenie }
});

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(sesja);

let serwerHTTP = http.createServer(app);
let serwerHTTPS = https.createServer(
{
	cert: fs.readFileSync('ssl/certyfikat.pem').toString(),
	key: fs.readFileSync('ssl/klucz.pem').toString()
}, app);

const io  = require('socket.io')(serwerHTTP);
const ios = require('socket.io')(serwerHTTPS);

io .use(sharedsession(sesja,  { autoSave: true }));
ios.use(sharedsession(sesja,  { autoSave: true }));

app.all('*', serwer);


serwerHTTP.listen(8080);
serwerHTTPS.listen(8443);

io.sockets.on('connection', websocket);
ios.sockets.on('connection', websocket);

let podpieteUSB = [];
let linkiUSB = {};


function rozs(plik)
{
	return plik.split('.').pop().toLowerCase();
}

fs.readdir("/media/usb", (err, files) =>
{
	for (i in files)
	{
		fs.unlinkSync('/media/usb/' + files[i]);
		wypisz("Usunięto stare łącze: " + files[i]);
	}
});


function websocket(socket)
{
	let podpieteUSBOstatnio = [];
	setInterval(() =>
	{
		if (podpieteUSB.toString() != podpieteUSBOstatnio.toString())
		{
			socket.emit("usb", podpieteUSB);
			podpieteUSBOstatnio = podpieteUSB;
		}
	}, 1000);
	socket.emit("usb", podpieteUSB);

	socket.on("api", function(funkcja)
	{
		try
		{
			let api = require("./apiWS/" + funkcja.plik);
			
			let odp = api.wykonaj(funkcja.dane, function(odp, koniec = true)
			{
				socket.emit("api", {plik: funkcja.plik, dane: funkcja.dane, id: funkcja.id, koniec: koniec, odp: odp});
			}, socket.handshake.session);
		}
		catch (e)
		{
			wypisz("=== Błąd w funkcji: " + funkcja.plik + " ===");
			wypisz(e);
			wypisz("============================================");
			socket.emit("api", {plik: funkcja.plik, blad: e});
		}
	});
}

function serwer(req, res)
{
	if (req.session.zalogowano)
	{
		stronaZalogowano(req, res);
	}
	else
	{
		stronaLogowanie(req, res);
		
		req.session.zalogowano = false;
	}
}

function stronaLogowanie(req, res)
{
	var q = url.parse(req.url, true);
	
	if (q.pathname == "/")
	{
		wyslij("html-logowanie/index.html", req, res);
	}
	else if (q.pathname == "/zaloguj")
	{
		res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8', 'server': "NodeJS"});
		
		if(req.body.login != undefined && req.body.haslo != undefined)
		{
			wypisz("Logowanie użytkownika " + req.body.login + "...");
			passwdLinux.checkPassword(req.body.login, req.body.haslo, function (err, response)
			{
				if (err)
				{
					wypisz("Błąd wykonywania kodu");
					wypisz(err);
					return res.end(JSON.stringify({zalogowano: false, blad: "Błąd wykonywania kodu"}));
				}
				else
				{
					if (response)
					{
						try
						{
							let stdout = execSync("groups " + req.body.login).toString('utf8');
							
							stdout = stdout.substring(0, stdout.length - 1).split(": ")[1].split(" ");
							
							let profile = JSON.parse(fs.readFileSync("./lokalizacje-profili.json"));
							
							req.session.zalogowano = true;
							req.session.uzytkownik = req.body.login;
							req.session.dom        = profile[req.body.login];
							req.session.grupy      = stdout;
							
							wypisz("Zalogowano");
							return res.end(JSON.stringify({zalogowano: true}));
						}
						catch (e)
						{
							wypisz("Błąd wykonywania kodu");
							wypisz(e);
							
							req.session.zalogowano = false;
							
							return res.end(JSON.stringify({zalogowano: false, blad: "Błąd wykonywania kodu"}));
						}
						
					}
					else
					{
						wypisz("Niepoprawne hasło");
						return res.end(JSON.stringify({zalogowano: false, blad: "Niepoprawne hasło"}));
					}
				}
			});
		}
		else
		{
			res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8', 'server': "NodeJS"});
			return res.end(JSON.stringify({zalogowano: false, blad: "Nie podano wymaganych zmiennych"}));
		}
	}
	else if (q.pathname == "/uzytkownicy")
	{
		let regex = /^([a-z0-9]+):x:\d+:\d+:([^,\n]+).*:\/media\/nas:.*$/gm;
		
		let uzytkownicy = fs.readFileSync("/etc/passwd");
		
		let uzytkownicyArr = [];
		let m;

		while ((m = regex.exec(uzytkownicy)) !== null)
		{
			if (m.index === regex.lastIndex)
			{
				regex.lastIndex++;
			}

			uzytkownicyArr.push(
			{
				login: m[1],
				wyswietlanaNazwa: m[2]
			});
		}
		
		res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8', 'server': "NodeJS"});
		return res.end(JSON.stringify(uzytkownicyArr));
	}
	else
		wyslij("html-logowanie" + decodeURI(q.pathname), req, res);
}

function stronaZalogowano(req, res)
{
	var q = url.parse(req.url, true);
	
	if (q.pathname == "/")
		wyslij("html/index.html", req, res);
	else if (q.pathname.substring(0, 3) == "/p/")
	{
		if (dostep.odczyt(decodeURI("/media" + decodeURIComponent(q.pathname.substring(2))), req.session))
			wyslij(decodeURI("/media" + decodeURIComponent(q.pathname.substring(2))), req, res);
		else
		{
			res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8', 'server': "NodeJS"});
			return res.end(JSON.stringify({blad: "Brak dostępu do pliku!"}));
		}
	}
// 	else if (q.pathname.substring(0, 3) == "/r/")
// 	{
// 		res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
// 		return res.end(JSON.stringify(zajete(decodeURI(q.pathname.substring(3)))));
// 	}
	else if (q.pathname.substring(0, 5) == "/api/")
	{
		try
		{
			let api = require("./api/" + decodeURI(q.pathname.substring(5)));
			
			let odp = api.wykonaj(req.query, function(odp, typ = "application/json; charset=utf-8")
			{
				res.writeHead(200, {'Content-Type': typ, 'server': "NodeJS"});
				return res.end(odp);
			}, req.session);
		}
		catch (e)
		{
			wypisz("=== Błąd w API: " + decodeURI(q.pathname.substring(5)) + " ===");
			wypisz(e);
			wypisz("========================================");
			res.writeHead(200, {'Content-Type': "application/json; charset=utf-8", 'server': "NodeJS"});
			return res.end(JSON.stringify({blad: e}));
		}
		
		// try
		// {
		// 	let api = require("./api/" + decodeURI(q.pathname.substring(5)));
			
		// 	let odp = api.wykonaj();
			
			
		// }
		// catch (e)
		// {
		// 	//wypisz(e);
			
		// 	res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
		// 	return res.end(JSON.stringify(e));
		// }
	}
	else if (q.pathname == "/wyloguj")
	{
		req.session.zalogowano = false;
		req.session.uzytkownik = null;
		req.session.grupy      = null;

		res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8', 'server': "NodeJS"});
		return res.end(JSON.stringify({wylogowano: true}));
	}
	else
		wyslij("html" + decodeURI(q.pathname), req, res);
}
function wyslij (plik, req, res, typMime)
{
	plik = plik.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;");
	
	var q = url.parse(req.url, true);
	
	fs.readFile(plik, function(err, data)
	{
		if (err)
		{
			if (q.pathname.substring(0, 7) == "/ikony/")
			{
				fs.readFile("html/ikony/mimetypes/scalable/application-default.svg", function(err2, data2)
				{
					if (err2)
					{
						res.writeHead(404, {'Content-Type': 'text/html', 'server': "NodeJS"});
						return res.end("404 Not Found");
					}
					else
					{
						var typ2 = mime.lookup("html/ikony/mimetypes/scalable/application-default.svg");
						
						if (typ2)
							res.writeHead(200, {'Content-Type': typ2, 'server': "NodeJS"});
						else
						{
							if (!isBinaryFile.isBinaryFileSync("html/ikony/mimetypes/scalable/application-default.svg"))
								res.writeHead(200, {'Content-Type': 'text/plain', 'server': "NodeJS"});
							else
								res.writeHead(200, {'server': "NodeJS"});
						}
						
						res.write(data2);
						return res.end();
					}
				});
			}
			else
			{
				res.writeHead(404, {'Content-Type': 'text/html', 'server': "NodeJS"});
				return res.end("404 Not Found");
			}
		}
		else
		{
			if (typMime == null)
			{
				var typ = mime.lookup(plik);
				if (typ)
					res.writeHead(200, {'Content-Type': typ, 'server': "NodeJS"});
				else
				{
					if (!isBinaryFile.isBinaryFileSync(plik))
						res.writeHead(200, {'Content-Type': 'text/plain', 'server': "NodeJS"});
					else
						res.writeHead(200, {'server': "NodeJS"});
				}
			}
			else
			{
				if (typMime)
					res.writeHead(200, {'Content-Type': typMime, 'server': "NodeJS"});
				else
				{
					if (!isBinaryFile.isBinaryFileSync(plik))
						res.writeHead(200, {'Content-Type': 'text/plain', 'server': "NodeJS"});
					else
						res.writeHead(200, {'server': "NodeJS"});
				}
			}
			
			res.write(data);
			return res.end();
		}
	});
}


function podpiete()
{
	stdout = execSync("findmnt -r -o TARGET,SOURCE,FSTYPE,UUID,LABEL,USED,SIZE,USE%").toString('utf8');

	let stdoutArr = stdout.split("\n");
	let odpArr = [];
	
	
	for (i in stdoutArr)
	{
		stdoutArr[i] = stdoutArr[i].split(" ");
		
		for (j in stdoutArr[i])
		{
			stdoutArr[i][j] = stdoutArr[i][j].replace(/\\x20/gm, " ");
		}
		if (stdoutArr[i][0].startsWith("/media/usb"))
		{
			odpArr.push(
			{
				uuid: stdoutArr[i][3],
				sciezka: stdoutArr[i][0],
				naped: stdoutArr[i][1],
				systemPlikow: stdoutArr[i][2],
				nazwa: stdoutArr[i][4],
				miejsce: stdoutArr[i][6],
				zajete: stdoutArr[i][5],
				zajeteProc: stdoutArr[i][7]
			});
		}
	}
	for (i in odpArr)
	{
		if (linkiUSB[odpArr[i].uuid] == undefined)
		{
			let nazwa = odpArr[i].nazwa;
			
			if (nazwa == "")
				nazwa = "Pendrive";
			
			if (fs.existsSync('/media/usb/' + nazwa))
			{
				let j = 2;
				while (fs.existsSync('/media/usb/' + nazwa + " (" + j + ")"))
				{
					j++;
				}
				fs.symlinkSync(odpArr[i].sciezka, '/media/usb/' + nazwa + " (" + j + ")", "dir");
				
				linkiUSB[odpArr[i].uuid] = nazwa + " (" + j + ")";
				
				wypisz("Podpięto: " + nazwa + " (" + j + ")");
			}
			else
			{
				fs.symlinkSync(odpArr[i].sciezka, '/media/usb/' + nazwa, "dir");
				linkiUSB[odpArr[i].uuid] = nazwa;
				wypisz("Podpięto: " + nazwa);
			}
		}
	}
	
	Object.keys(linkiUSB).forEach(function(uuid)
	{
		let istnieje = false;
		for (i in odpArr)
			if (uuid == odpArr[i].uuid)
				istnieje = true;
		if (!istnieje)
		{
			if (fs.existsSync('/media/usb/' + linkiUSB[uuid]))
				fs.unlinkSync('/media/usb/' + linkiUSB[uuid]);
			wypisz("Odpięto: " + linkiUSB[uuid]);
			delete linkiUSB[uuid];
		}
	});
	
	podpieteUSB = odpArr;
}

function zajete(folder)
{
	if (folder.substring(0, 1) != "/")
		folder = "/" + folder;
	
	try
	{
		fs.accessSync("/media/nas" + folder, fs.constants.R_OK);
	}
	catch (err)
	{
		return "Brak dostępu";
	}
	
	stdout = execSync("sudo du --max-depth=1 '/media/nas" + folder + "'").toString('utf8');
	
	let stdoutArr = stdout.split("\n");
	let odpArr = { rozmiar: 0, zawartosc: []};
	
	for (i in stdoutArr)
	{
		let lokalizacjaElement = stdoutArr[i].split("\t");
		
		if (lokalizacjaElement[1] != undefined)
		{
			if (folder == lokalizacjaElement[1].substring(10))
			{
				odpArr.rozmiar = lokalizacjaElement[0];
				continue;
			}
			
			let dostep = true;
			try
			{
				fs.accessSync(lokalizacjaElement[1], fs.constants.R_OK);
			}
			catch (err)
			{
				dostep = false;
			}
			
			odpArr.zawartosc.push(
			{
				folder:  lokalizacjaElement[1].substring(11),
				rozmiar: lokalizacjaElement[0],
				dostep:  dostep
			});
		}
	}
	return odpArr;
}
//Funkcje czasowe

setInterval(() =>
{
	podpiete();
	
}, 1000);


function wypisz(log)
{
	console.log((new Date()).toLocaleString() + " » " + log);
}
