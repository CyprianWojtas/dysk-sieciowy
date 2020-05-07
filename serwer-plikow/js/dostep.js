const execSync = require('child_process').execSync;

module.exports = {odczyt: odczyt, zapis: zapis};

function odczyt(plik, sesja)
{
	let stdout;
	
	try
	{
		stdout = execSync("sudo -u " + sesja.uzytkownik + " stat -c%A,%U,%G \"" + plik.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;") + "\"").toString('utf8');
	}
	catch (e)
	{
		return false;
	}
	stdout = stdout.split("\n")[0];
	
	stdout = stdout.split(",");
	
	if (stdout[0].substr(7, 1) == "r")
		return true;
	else if (stdout[0].substr(4, 1) == "r" && sesja.grupy.indexOf(stdout[2]) != -1)
		return true;
	else if (stdout[0].substr(1, 1) == "r" && sesja.uzytkownik == stdout[1])
		return true;
	
	return false;
}

function zapis(plik, sesja)
{
	let stdout;
	
	try
	{
		stdout = execSync("sudo -u " + sesja.uzytkownik + " stat -c%A,%U,%G \"" + plik.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;") + "\"").toString('utf8');
	}
	catch (e)
	{
		return false;
	}
	stdout = stdout.split("\n")[0];
	
	stdout = stdout.split(",");
	
	if (stdout[0].substr(8, 1) == "w")
		return true;
	else if (stdout[0].substr(5, 1) == "w" && sesja.grupy.indexOf(stdout[2]) != -1)
		return true;
	else if (stdout[0].substr(2, 1) == "w" && sesja.uzytkownik == stdout[1])
		return true;
	
	return false;
}
