/* Use this to test out your function. */
window.onload = function() {
 	change_color("pl", "#386cb0");	// Poland.
 	change_color("ba", "#f0027f");	// Bosnia and Herzegovina.
 	change_color("at", "#bf5b17");	// Austria.
 	change_color("nl", "#666666");	// Netherlands.
}

/* 
 * change_color takes a path ID and a color (hex value) and changes that
 * path's fill color. 
 */
function change_color(id, color) {
	try {
		var element = document.getElementById(id);	// Can be a <g> element (with children), or a single <path> element.
		element.style.fill = color;
		fill_children(element, color);	// Fill the child elements.
	}
	catch (e) {
		console.log("Error: " + e + "; id: " + id);
	};
};

/*
 * fill_children takes an element (a <g> element, or a single <path> element)
 * and a color (hex value), and, if the element has <path> elements or <g> 
 * elements as children, changes those element's fill color. Furthermore,
 * if the child is a <g> element, this function is recursively called.
 */
function fill_children(element, color) {
	var children = element.childNodes;
	for(var i = 0; i < children.length; i++) {
		var child = children[i];
		// Continue if the child is not an element.
		if(child.nodeType != 1) {
			continue;
		} else {
			// If the child is a <path> element, change that path's fill 
			// color.
			if(child.nodeName == "path") {
				child.style.fill = color;
			}
			// If the child is a <g> element, change that element's fill color 
			// and recursively call this function (recursive step).
			else if(child.nodeName == "g") {
				child.style.fill = color;
				fill_children(child, color);
			}
			else {
				continue;
			};
		};
	};
};
