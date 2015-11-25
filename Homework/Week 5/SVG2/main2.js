/* use this to test out your function */
window.onload = function() {
 	changeColor("pl", "#386cb0");	// Poland
 	changeColor("ba", "#f0027f");	// Bosnia and Herzegovina
 	changeColor("at", "#bf5b17");	// Austria
 	changeColor("bg", "#666666");	// Bulgaria
}

/* changeColor takes a path ID and a color (hex value)
   and changes that path's fill color */
function changeColor(id, color) {
	var path = document.getElementById(id);
	path.style.fill = color;  
}