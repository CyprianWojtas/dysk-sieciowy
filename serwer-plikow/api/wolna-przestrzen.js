const fs = require('fs');
const execSync = require('child_process').execSync;

module.exports =
{
	wykonaj: function ()
	{
		let odpArr = [];

		stdout = execSync("df --output=source,size,used,target").toString('utf8');
		
		let stdoutArr = stdout.split("\n");
		
		for (let i = 1; i < stdoutArr.length; i++)
		{
			let urzadzenie = stdoutArr[i].split(/ +/);
			
			while (urzadzenie[0] == "")
				urzadzenie.shift();
			
			if (urzadzenie.length >= 4)
			{
				if (urzadzenie[0].match(/(^\/dev\/sd|^\/dev\/md)/))
					odpArr.push(
					{
						urzadzenie:  urzadzenie[0],
						punktMontowania: urzadzenie[3],
						rozmiar: urzadzenie[1],
						zajete:  urzadzenie[2]
					});
			}
		}
		return odpArr;
	}
};
