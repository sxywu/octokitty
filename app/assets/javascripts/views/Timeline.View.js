define([
	"jquery",
	"underscore",
	"backbone",
	"d3",
	"visualizations/Line.Visualization",
	"visualizations/Circle.Visualization"
], function(
	$,
	_,
	Backbone,
	d3,
	LineVisualization,
	CircleVisualization
) {
	return Backbone.View.extend({
		initialize: function() {
			this.lineVisualization = new LineVisualization();
			this.circleVisualization = new CircleVisualization();
		},
		render: function() {

		},
		processData: function(users, repos, commits) {
			this.contributors = _.chain(repos)
					.pluck('contributors')
					.flatten().unique().value();
			this.reposByContributors = {};

			var that = this;
			_.each(this.contributors, function(contributor) {
				that.reposByContributors[contributor] = {
					username: contributor
				};
				that.reposByContributors[contributor].repos = _.filter(repos, function(repo) {
					return repo.owner === contributor;
				});
				that.reposByContributors[contributor].popularity = _.reduce(that.reposByContributors[contributor].repos, 
					function(memo, repo) {
						return memo + repo.forks + repo.stars + repo.watches;
					}, 0);
			});

			this.contributors = _.sortBy(this.contributors, function(contributor) {
				return -that.reposByContributors[contributor].popularity;
			});

			this.calculateLines();
		},
		calculateLines: function() {
			debugger
		}
	});
});