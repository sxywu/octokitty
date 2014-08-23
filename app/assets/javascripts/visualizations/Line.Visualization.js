define([
	"underscore",
	"d3"
], function(
	_,
	d3
) {

	var gap = 50;

	var Line = function(selection) {
		selection
			.classed('contributor', true)
			.attr('d', drawPath)
			.attr('stroke', function(d) {return app.d3Colors(d[0].author)});
	}

	var drawPath = function(data) {
		var path = [],
			source, subPath, x, y;
		_.each(data, function(target) {
			if (!source) {
				// first point
				path.push(drawStart(target.x, target.y));
			} else if (source.y > target.y - gap) {
				// if they're sufficiently close to each other
				if (source.x === target.x) {
					path.push(drawLine(target.x, target.y));
				} else {
					path.push(drawCurve(source.x, source.y, target.x, target.y));
				}
			} else {
				subPath = [];
				if (source.x !== source.authorX) {
					// if the source repo owner isn't the same as the contributor, move the line back
					subPath.push(drawCurve(source.x, source.y, source.authorX, source.y + gap / 3));
				}

				x = target.x;
				y = target.y;
				if (target.x !== target.authorX) {
					x = target.authorX;
					y = target.y - gap / 3;
				}
				
				subPath.push(drawLine(x, y));

				if (target.x !== target.authorX) {
					subPath.push(drawCurve(x, y, target.x, target.y));
				}

				path.push(subPath);
			}

			source = target;
		});
		return _.flatten(path).join(' ');
	}

	var drawStart = function(x, y) {
		return 'M' + x + ',' + y;
	}

	var drawLine = function(x, y) {
		return 'L' + x + ',' + y;
	}

	var diagonal = d3.svg.diagonal(),
	drawCurve = function(x1, y1, x2, y2) {
		// var midX = (x1 + x2) / 2,
		// 	midY = (y1 + y2) / 2;
		// return 'Q' + x1 + ',' + midY + ' ' + midX + ',' + midY + ' T' + x2 + ',' + y2;
		return diagonal({
			source: {x: x1, y: y1},
			target: {x: x2, y: y2}
		}).replace(/M[0-9\,.]*/gi, '');
	}

	return function() {
		return Line;
	}
})