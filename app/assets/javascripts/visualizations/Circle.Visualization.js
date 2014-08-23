define([
	"underscore",
	"d3"
], function(
	_,
	d3
) {
	var Circle = function(selection) {
		selection
			.classed('commit', true)
			.attr('cx', function(d) {return d.x})
			.attr('cy', function(d) {return d.y})
			.attr('r', function(d) {return d.radius})
			.attr('stroke', function(d) {return app.d3Colors(d.author)});
	}

	return function() {
		return Circle;
	}
})