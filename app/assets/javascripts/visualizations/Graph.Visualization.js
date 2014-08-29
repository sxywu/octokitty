define([
	"underscore",
	"d3",
	"visualizations/Label.Visualization",
], function(
	_,
	d3,
	LabelVisualization
) {
	var force = d3.layout.force(),
		width, height,
		nodes, links,
		node, link,
		contributorSize = 12,
		repoSize = 8,
		labelVisualization = new LabelVisualization();

	var Graph = function(selection) {
		width = $('.graph').width();
		height = $('.graph').height();
		force.size([width, height])
			.charge(-300);

		link = selection.selectAll('line')
			.data(links).enter().append('line')
			.call(updateLinks);

		node = selection.selectAll('.node')
			.data(nodes).enter().append('g')
			.classed('node', true);
		node.append('rect');
		node.append('g')
			.datum(function(d) {
				return {
					owner: d.owner, 
					repo: d.repo,
					x: (d.repo ? repoSize : contributorSize) + 5,
					y: 0
				};
			})
			.classed({'label': true, 'hide': true})
			.call(labelVisualization)
			.call(labelVisualization.position);


		node.call(updateNodes)
		

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
		selection.classed('hide', function(d) {return !d.show});

		selection.select('rect')
			.attr('x', function(d) {return -(d.repo ? repoSize : contributorSize) / 2})
			.attr('y', function(d) {return -(d.repo ? repoSize : contributorSize) / 2})
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
			.attr('stroke-width', function(d) {return (d.weight > 0 ? d.width : 0)});
	}

	var position = function() {
		node.attr('transform', function(d) {return 'translate(' + d.x + ',' + d.y + ')'});
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