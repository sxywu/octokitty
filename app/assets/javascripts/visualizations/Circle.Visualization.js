define([
	"underscore",
	"d3"
], function(
	_,
	d3
) {

	var gap = 50;

	var Circle = function(selection) {
		selection
			.classed('commit', true)
			.attr('cx', function(d) {return d.x})
			.attr('cy', function(d) {return d.y})
			.attr('r', 2)
			.attr('stroke', function(d) {return app.d3Colors(d.author)});
	}

	return function() {
		return Circle;
	}
})