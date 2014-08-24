define([
	"underscore",
	"d3"
], function(
	_,
	d3
) {
	var force,
		width, height,
		nodes, links,
		node, link,
		contributorSize = 12,
		repoSize = 8;

	var Graph = function(selection) {
		width = $('.graph').width();
		height = $('.graph').height();
		force = d3.layout.force()
			.size([width, height])
			.charge(-300);

		link = selection.selectAll('line')
			.data(links).enter().append('line')
			.call(updateLinks);

		node = selection.selectAll('rect')
			.data(nodes).enter().append('rect')
			.call(updateNodes);

		

		startForce();
	}

	var startForce = function() {
		force.nodes(nodes).links(links);
		force.start();
		_.each(_.range(500), force.tick);
		force.stop();
		position();
	}

	Graph.update = function() {
		node.call(updateNodes);
		link.call(updateLinks);
	}

	var updateNodes = function(selection) {
		selection
			.classed('hidden', function(d) {return !d.show})
			.attr('width', function(d) {return d.repo ? repoSize : contributorSize})
			.attr('height', function(d) {return d.repo ? repoSize : contributorSize})
			.attr('fill', function(d) {return d.repo ? '#fff' : app.d3Colors(d.owner)})
			.attr('stroke', function(d) {return app.d3Colors(d.owner)})
			.attr('stroke-width', 2)
			.attr('rx', function(d) {return d.repo ? repoSize / 4 : contributorSize / 2})
			.attr('ry', function(d) {return d.repo ? repoSize / 4 : contributorSize / 2});
	}

	var updateLinks = function(selection) {
		selection
			.attr('stroke', function(d) {return app.d3Colors(d.source.owner)})
			.attr('stroke-width', function(d) {return d.weight});
	}

	var position = function() {
		node
			.attr('x', function(d) {return d.x - (d.repo ? repoSize : contributorSize) / 2})
			.attr('y', function(d) {return d.y - (d.repo ? repoSize : contributorSize) / 2});
		link
			.attr('x1', function(d) {return d.source.x})
			.attr('y1', function(d) {return d.source.y})
			.attr('x2', function(d) {return d.target.x})
			.attr('y2', function(d) {return d.target.y});
	}

	Graph.nodes = function(val) {
		if (!arguments.length) return nodes;
		nodes = val;
		return Graph;
	}

	Graph.links = function(val) {
		if (!arguments.length) return links;
		links = val;
		return Graph;
	}

	return function() {
		return Graph;
	}
})