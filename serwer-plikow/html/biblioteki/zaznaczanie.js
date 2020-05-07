(function ()
{

let x = 0;
let y = 0;
let zaznaczenie = $("<div style='background: #0A69DC66; border: 1px solid #0A69DC; box-sizing: border-box; position: absolute;'></div>");
let zaznaczanie = false;
let relative = false;
let rodzic;

$(".zaznaczanieObszar").on("mousedown", e =>
{
	x = e.originalEvent.x;
	y = e.originalEvent.y;
	zaznaczenie.css(
	{
		top:  y + "px",
		left: x + "px",
		width: 0,
		height: 0
	});
	
	rodzic = $(e.target);
	
	
	rodzic.append(zaznaczenie);
	zaznaczanie = true;
});

$(document).on("mousemove", e =>
{
	if (zaznaczanie)
	{
		let top,    left,
			height, width;
		
		let px = 0;
		let py = 0;
		
		if (!relative)
		{
			px = rodzic[0].offsetLeft;
			py = rodzic[0].offsetTop;
		}
		
		if (x > e.originalEvent.x)
		{
			left  = e.originalEvent.x;
			width = x - e.originalEvent.x;
		}
		else
		{
			left  = x;
			width = e.originalEvent.x - x;
		}
		
		if (y > e.originalEvent.y)
		{
			top    = e.originalEvent.y;
			height = y - e.originalEvent.y;
		}
		else
		{
			top    = y;
			height = e.originalEvent.y - y;
		}
		
		if (rodzic.height() < top + height)
			height = rodzic.height() - top;
		else if (top < 0)
		{
			top = 0;
			height = y;
		}
		
		if (rodzic.width() < left + width)
			width = rodzic.width() - left;
		else if (left < 0)
		{
			left = 0;
			width = x;
		}
		
		if (!relative)
		{
// 			left += rodzic[0].offsetLeft;
// 			top  += rodzic[0].offsetTop;
// 			
// 			width -=  rodzic[0].offsetLeft;
// 			height -= rodzic[0].offsetTop;
		}
		
		zaznaczenie.css(
		{
			width:  width,
			height: height,
			left: left,
			top: top
		});
	}
});

$(document).on("mouseup", e =>
{
	zaznaczanie = false;
	zaznaczenie.detach();
});

}());
