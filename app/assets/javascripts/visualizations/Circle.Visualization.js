define([
	"underscore",
	"d3"
], function(
	_,
	d3
) {
	var circle;
	var Circle = function(selection) {
		circle = selection
			.classed('commit', true)
			.attr('cx', function(d) {return d.x})
			.attr('cy', function(d) {return d.y})
			.attr('r', function(d) {return d.radius})
			.attr('fill', '#fff')
			.attr('stroke', function(d) {return app.d3Colors(d.author)});
	}

	Circle.highlight = function(data) {
		circle
			.attr('r', function(d) {return d.radius})
			.attr('fill', '#fff');
		circle.filter(function(d) {return d.y === data[0].y})
			.attr('r', 5)
			.attr('fill', function(d) {return app.d3Colors(d.author)});

	}

	return function() {
		return Circle;
	}
})