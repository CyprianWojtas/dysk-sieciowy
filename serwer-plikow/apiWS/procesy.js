const psList = require('ps-list');

module.exports =
{
	wykonaj: function (dane, freturn)
	{
		(async () =>
		{
			freturn(await psList());
		})();
	}
}
