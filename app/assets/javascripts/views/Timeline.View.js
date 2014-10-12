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

			this.contributorScale = d3.scale.ordinal();
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
				that.reposByContributors[contributor].repos = _.chain(repos)
					.filter(function(repo) {
						return repo.owner === contributor;
					}).sortBy(function(repo) {
						return -(repo.forks + repo.stars + repo.watches);
					}).value();
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
			var height = $(window).height(),
				length = Math.floor(height / app.contributorPadding),
				range = _.chain(length).range()
					.map(function(i) {return i * app.contributorPadding + app.padding.left}).value();
			this.contributorScale.range(range);

			this.contributorsAndRepos = [];

			var i = 0,
				that = this;
			_.each(this.contributors, function(contributor) {
				if (i >= length) return;

				that.contributorsAndRepos.push(contributor);
				i += 1;
				_.each(that.reposByContributors[contributor].repos, function(repo) {
					if (i >= length) return;
					that.contributorsAndRepos.push(repo.owner + '/' + repo.name);
					i += 1;
				});
			});

			this.contributorScale.domain(this.contributorsAndRepos);
			debugger
		}
	});
});