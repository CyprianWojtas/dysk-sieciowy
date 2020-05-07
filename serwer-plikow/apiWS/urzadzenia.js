const execSync = require('child_process').execSync;

module.exports = {wykonaj: podpiete};

function podpiete(dane, freturn)
{
	stdout = JSON.parse(execSync("findmnt -J -o TARGET,SOURCE,FSTYPE,UUID,LABEL").toString('utf8'));

	let odpArr = [];
	
	for (i in stdout.filesystems[0].children)
	{
		if (stdout.filesystems[0].children[i].target.startsWith("/media"))
		{
			odpArr.push(
			{
				uuid:            stdout.filesystems[0].children[i].uuid,
				punktMontowania: stdout.filesystems[0].children[i].target,
				naped:           stdout.filesystems[0].children[i].source,
				systemPlikow:    stdout.filesystems[0].children[i].fstype,
				nazwa:           stdout.filesystems[0].children[i].label,
				miejsce:         -1,
				zajete:          -1
			});
		}
	}

	stdout = execSync("df --output=source,size,used").toString('utf8');

	stdoutArr = stdout.split("\n");
		
	for (let i = 1; i < stdoutArr.length; i++)
	{
		let urzadzenie = stdoutArr[i].split(/ +/);
		
		while (urzadzenie[0] == "")
			urzadzenie.shift();
		
		if (urzadzenie.length >= 3)
		{
			let j = odpArr.findIndex(urz =>
			{
				return urz.naped == urzadzenie[0];
			});
			
			if (urzadzenie[0].match(/(^\/dev\/sd|^\/dev\/md)/) && j != -1)
			{
				odpArr[j].miejsce = parseInt(urzadzenie[1]);
				odpArr[j].zajete  = parseInt(urzadzenie[2]);
			}
		}
	}
	
	freturn(odpArr);
}
