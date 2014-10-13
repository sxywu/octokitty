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
			this.d3El = d3.select(this.el);

			this.lineVisualization = new LineVisualization();
			this.circleVisualization = new CircleVisualization();

			this.contributorScale = d3.scale.ordinal();
			this.timeScale = d3.scale.linear();
		},
		processData: function(users, repos, commits) {
			this.contributors = _.chain(repos)
					.pluck('contributors')
					.flatten().unique().value();
			this.reposByContributors = {};
			this.commitsByContributors = {};

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

			_.each(commits, function(commit) {
				if (!commit.length) return;
				if (!that.commitsByContributors[commit[0].author]) {
					that.commitsByContributors[commit[0].author] = {}
				}
				that.commitsByContributors[commit[0].author][commit[0].owner + '/' + commit[0].repo] = commit;
			});
			this.calculateLines(commits);
		},
		calculateLines: function() {
			this.calculateY();
			this.calculateX();

			var that = this;
			// finally, let's give them x & y positions
			_.each(this.lineData, function(line) {
				_.each(line, function(commit) {
					commit.x = that.timeScale(commit.dateObj);
					commit.y = that.contributorScale(commit.owner + '/' + commit.repo);
					commit.authorY = that.contributorScale(commit.author);
				});
			});
		},
		calculateY: function() {
			var height = this.$el.height(),
				length = Math.floor(height / app.contributorPadding),
				range = _.chain(length).range()
					.map(function(i) {return i * app.contributorPadding + app.padding.left}).value();
			this.contributorScale.range(range);

			this.contributorsAndRepos = [];

			var i = 0,
				that = this;
			// get y scale domain, by finding the top contributors and repos
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
		},
		calculateX: function() {
			this.timeScale
				.range([0, this.$el.width()]);

			var that = this,
				minDate = new Date(),
				repos, commits;
			this.lineData = [];
			_.each(this.contributors, function(contributor) {
				if (!_.contains(that.contributorsAndRepos, contributor)) return; // wow so not performant
				repos = that.commitsByContributors[contributor];
				commits = [];
				_.each(repos, function(commit, repoName) {
					if (_.contains(that.contributorsAndRepos, repoName)) {
						commits.push(commit)
					}
				});
				commits = _.chain(commits).flatten()
					.sortBy(function(commit) {
						commit.dateObj = new Date(commit.date);
						return commit.dateObj;
					}).value()

				that.lineData.push(commits);
				minDate = (minDate < commits[0].dateObj ? minDate : commits[0].dateObj);
			});

			this.timeScale.domain([minDate, new Date()]); // domain is min date and today
		},
		render: function() {
			this.$el.empty();

			// contributor lines
			this.d3El.selectAll('path')
				.data(this.lineData)
				.enter().append('path')
				.call(this.lineVisualization);	

			this.d3El.selectAll('circle')
				.data(_.flatten(this.lineData))
				.enter().append('circle')
				.call(this.circleVisualization);	
		}
	});
});