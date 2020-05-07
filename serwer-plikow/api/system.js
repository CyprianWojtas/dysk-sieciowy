const os = require('os');

module.exports =
{
	wykonaj: function (dane, freturn)
	{
		let odp = {};
		
		odp.cpu       = os.cpus();
		odp.arch      = os.arch();
		odp.ram       = os.totalmem();
		odp.ramWolny  = os.freemem();
		odp.nazwa     = os.hostname();
		odp.cpuUzycie = os.loadavg();
		odp.odStartu  = os.uptime();
		odp.siec      = os.networkInterfaces();

		freturn(JSON.stringify(odp));
	}
}
