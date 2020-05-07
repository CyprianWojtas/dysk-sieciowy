module.exports = {wykonaj: wykonaj};

function wykonaj (dane, freturn)
{
	freturn(JSON.stringify({api: "Sprawne!", dane: dane}));
}