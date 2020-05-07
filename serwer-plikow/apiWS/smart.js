const execSync = require('child_process').execSync;

module.exports = {wykonaj: wykonaj};

function wykonaj(dane, freturn)
{
	if (typeof dane.dysk != "string")
	{
		freturn({blad: "Nie podano nazwy dysku"});
		return;
	}
	if (!dane.dysk.match(/^\/dev\/\w+\d*$/))
	{
		freturn({blad: "Niepoprawna nazwa dysku"});
		return;
	}
	
	let stdout;
	
	try
	{
		stdout = execSync("smartctl -x " + dane.dysk).toString('utf8');
	}
	catch(e)
	{
		freturn(e.stdout.toString('utf8'));
		return;
	}
	
	freturn(stdout);
}
