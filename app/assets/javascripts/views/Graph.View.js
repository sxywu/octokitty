define([
	"jquery",
	"underscore",
	"backbone",
	"d3",
	"visualizations/Graph.Visualization",
	"visualizations/Label.Visualization"
], function(
	$,
	_,
	Backbone,
	d3,
	GraphVisualization,
	LabelVisualization
) {
	return Backbone.View.extend({
		initialize: function() {
			this.d3El = d3.select(this.el);

			this.graphVisualization = new GraphVisualization();
			this.labelVisualization = new LabelVisualization();

			this.linkScale = d3.scale.linear().range([1, 8]);
		},
		processData: function(contributorsAndRepos, commits) {
			this.nodes = {};
			this.links = {};
			var source, target,
				owner, repo,
				that = this;

			_.each(commits, function(commit) {
				// create author node
				if (!that.nodes[commit.author]) {
					that.nodes[commit.author] = {
						owner: commit.author,
						show: 0,
						total: 0
					}
				}
				that.nodes[commit.author].total += 1;

				// create repo node
				if (!that.nodes[commit.owner + '/' + commit.repo]) {
					that.nodes[commit.owner + '/' + commit.repo] = {
						owner: commit.owner,
						repo: commit.repo,
						show: 0,
						total: 0
					}	
				}
				that.nodes[commit.owner + '/' + commit.repo].total += 1;

				// create link
				if (!that.links[commit.author + ',' + commit.owner + '/' + commit.repo]) {
					that.links[commit.author + ',' + commit.owner + '/' + commit.repo] = {
						source: that.nodes[commit.author],
						target: that.nodes[commit.owner + '/' + commit.repo],
						weight: 0,
						width: 0,
						total: 0
					}
				}
				that.links[commit.author + ',' + commit.owner + '/' + commit.repo].total += 1;
			});

			var maxWeight = _.max(this.links, function(link) {return link.total}).total;
			this.linkScale.domain([1, maxWeight]);
		},
		render: function() {
			this.$el.empty();

			this.graphVisualization.nodes(_.values(this.nodes)).links(_.values(this.links));
			this.d3El.call(this.graphVisualization);
		},
		moreCommits: function(commits) {
			var that = this;
			_.each(commits, function(commit) {
				link = that.links[commit.author + ',' + commit.owner + '/' + commit.repo];
				if (link.weight < link.total) {
					link.weight += 1;
					link.width = that.linkScale(link.weight);
				}

				node = that.nodes[commit.author];
				if (node.show < node.total) node.show += 1;

				node = that.nodes[commit.owner + '/' + commit.repo];
				if (node.show < node.total) node.show += 1;

			})
		},
		lessCommits: function(commits) {
			var that = this;
			_.each(commits, function(commit) {
				link = that.links[commit.author + ',' + commit.owner + '/' + commit.repo];
				if (link.weight > 0) {
					link.weight -= 1;
					link.width = that.linkScale(link.weight);
				}

				node = that.nodes[commit.author];
				if (node.show > 0) node.show -= 1;

				node = that.nodes[commit.owner + '/' + commit.repo];
				if (node.show > 0) node.show -= 1;
			});
		},
		updateScroll: function(commits) {
			this.graphVisualization.showLabels(commits);
			this.graphVisualization.update();
		}
	});
});