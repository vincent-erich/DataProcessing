/* use this to test out your function */
window.onload = function() {
 	changeColor("pl", "#386cb0");	// Poland
 	changeColor("ba", "#f0027f");	// Bosnia and Herzegovina
 	changeColor("at", "#bf5b17");	// Austria
 	changeColor("bg", "#666666");	// Bulgaria
}

/* changeColor takes a path ID and a color (hex value)
   and changes that path's fill color */
// function changeColor(id, color) {
// 	var path = document.getElementById(id);
// 	path.style.fill = color;  
// }

/* changeColor takes a path ID and a color (hex value)
   and changes that path's fill color */
function changeColor(id, color) {
	try {
		var element = document.getElementById(id);
		element.style.fill = color;
		fill_children(element, color);
	}
	catch (err) {
		console.log("Error: " + err + "; id: " + id);
	};
};

function fill_children(element, color) {
	var children = element.childNodes;
	for(var i = 0; i < children.length; i++) {
		var child = children[i];
		if(child.nodeType != 1) {
			continue;
		} else {
			if(child.nodeName == "path") {
				child.style.fill = color;
			}
			else if(child.nodeName == "g") {
				fill_children(child, color);
			}
			else {
				continue;
			};
		};
	};
};