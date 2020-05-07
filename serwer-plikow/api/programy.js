const fs = require('fs');

module.exports =
{
	wykonaj: function ()
	{
		let odpArr = [];

		odpArr = fs.readdirSync("html/programy/");
		
		return odpArr;
	}
};
