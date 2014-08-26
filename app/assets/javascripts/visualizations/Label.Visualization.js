define([
	"underscore",
	"d3"
], function(
	_,
	d3
) {
	var padding = 5,
		height = 22;
	var Label = function(selection) {
		selection.append('text')
			.attr('x', 0)
			.attr('y', 0)
			.attr('text-anchor', 'middle')
			.attr('dy', '.35em')
			.attr('fill', function(d) {return (d.repo ? app.d3Colors(d.owner) : '#fff')})
			.text(function(d) {
				return d.repo || d.owner;
			}).each(function(d) {
				d.width = this.getBoundingClientRect().width + 2 * padding;
			});

		selection
			.insert('rect', 'text')
			.attr('x', function(d) {return -d.width / 2})
			.attr('y', -height / 2)
			.attr('width', function(d) {return d.width})
			.attr('height', height)
			.attr('fill', function(d) {return (d.repo ? '#fff' : app.d3Colors(d.owner))})
			.attr('stroke', function(d) {return app.d3Colors(d.owner)})
			.attr('stroke-width', 2)
			.attr('rx', '.25em')
			.attr('ry', '.25em');
	}

	Label.position = function(selection) {
		selection.attr('transform', function(d) {
			var x = d.x + (Math.abs(d.rotate) === 90 ? 0 : d.width / 2),
				y = d.y + (Math.abs(d.rotate) === 90 ? d.width / 2 : 0),
				rotate = d.rotate || 0;
			return 'translate(' + x + ',' + y + ')rotate(' + rotate + ')';
		})
	}

	return function() {
		return Label;
	}
})