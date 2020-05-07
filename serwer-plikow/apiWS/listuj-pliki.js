const execSync = require('child_process').execSync;
const mime = require('mime-types');
const isBinaryFile = require("isbinaryfile");
const fs = require('fs');

const regexPlik = /^([-ldrwx]{10}) +(\d+) +([a-z0-9._-]+) +([a-z0-9._-]+) +(\d+) +(\d+-\d+-\d+ \d+:\d+:\d+.\d+ [+-]\d+) +"(.+?[^\\])"(?: -> "(.+)")?$/gm;

module.exports = {wykonaj: wykonaj};

function wykonaj(dane, freturn, sesja)
{
	if (dane.folder == undefined)
	{
		freturn({blad: "Nie podano wymaganych zmiennych!"});
		return;
	}
	
	while (dane.folder.substr(dane.folder.length - 1, 1) == "/")
		dane.folder = dane.folder.substr(0, dane.folder.length - 1);
	
	let lokalizajca = dane.folder.replace(/'/gm, "\\'");
	
	if (lokalizajca.startsWith("~/"))
		lokalizajca = sesja.dom + lokalizajca.substr(1);
	
	let stdout;
	let sortowanie = "";
	
	if (dane.malejaco)
		sortowanie += "-r ";
	if (dane.najpierwKatalogi)
		sortowanie += "--group-directories-first ";
	
	switch (dane.sortowanie)
	{
		case "brak":
			sortowanie += "--sort=none";
			break;
		case "rozmiar":
			sortowanie += "--sort=size";
			break;
		case "czas":
			sortowanie += "--sort=time";
			break;
		case "wersja":
			sortowanie += "--sort=version";
			break;
		case "rozszerzenie":
			sortowanie += "--sort=extension";
			break;
	}
	
	try
	{
		stdout = execSync("sudo -u " + sesja.uzytkownik + " ls -bAlc --full-time --quoting-style=c " + sortowanie + " '/media/" + lokalizajca + "'").toString('utf8');
	}
	catch(e)
	{
		if (typeof e.stderr == "object")
			freturn(e.stderr.toString("utf8"));
		return;
	}
	
	let folderInfo = [];
	if (fs.existsSync(dane.folder + "/.info"))
		folderInfo = JSON.parse(fs.readFileSync(dane.folder + "/.info"));
	
	let m;
	let odp = [];

	while ((m = regexPlik.exec(stdout)) !== null)
	{
		if (m.index === regexPlik.lastIndex)
		{
			regexPlik.lastIndex++;
		}
		
		if (m[8] != undefined)
		{
			m[8] = m[8].replace(/\\\\/g, "\\")
		               .replace(/\\n/g,  "\n")
		               .replace(/\\t/g,  "\t")
		               .replace(/\\"/g,  "\"");
		}
		
		m[7] = m[7].replace(/\\\\/g, "\\")
		           .replace(/\\n/g,  "\n")
		           .replace(/\\t/g,  "\t")
		           .replace(/\\"/g,  "\"");
		
		let typ = mime.lookup(lokalizajca + "/" + m[7]);
		
		if (!typ && m[1].startsWith("-"))
		{
			if (!isBinaryFile.isBinaryFileSync("/media/" + lokalizajca + "/" + m[7]))
				typ = 'text/plain';
		}
		
		let czas = m[6].split(/^(.+?) (.+?) ([-+]\d{2})(\d{2})$/);
		
		czas = czas[1] + "T" + czas[2] + czas[3] + ":" + czas[4];
		
		let plik =
		{
			nazwa: m[7],
			uprawnienia: m[1],
			uzytkownik: m[3],
			grupa: m[4],
			rozmiar: m[5],
			dataEdycji: new Date(czas),
			iloscPlikow: m[2],
			typ: typ
		}
		if (m[8] != undefined)
			plik.url = m[8];
		
		if (folderInfo[plik.nazwa] != undefined)
		{
			if (folderInfo[plik.nazwa].i != undefined)
				plik.ikona = folderInfo[plik.nazwa].i;
		}

		odp.push(plik);
	}
	
	freturn(odp);
}
