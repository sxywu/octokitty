define([
	"jquery",
	"underscore",
	"backbone",
	"d3",
	"visualizations/Line.Visualization",
	"visualizations/Circle.Visualization",
	"visualizations/Graph.Visualization",
	"visualizations/Label.Visualization",
	"text!templates/Commit.Template.html"
], function(
	$,
	_,
	Backbone,
	d3,
	LineVisualization,
	CircleVisualization,
	GraphVisualization,
	LabelVisualization,
	CommitTemplate
) {
	return Backbone.View.extend({
		initialize: function() {
			this.timeline = d3.select('svg.timeline');
			this.graph = d3.select('svg.graph');
			this.graphVisualization = new GraphVisualization();
			this.lineVisualization = new LineVisualization();
			this.circleVisualization = new CircleVisualization();
			this.labelVisualization = new LabelVisualization();

			$('.submitUser').click(_.bind(this.getUser, this));
			$('.inputUser').keydown(_.bind(this.keydown, this));
			$('.search').click(_.bind(this.search, this));

			var windowScroll = _.debounce(_.bind(this.windowScroll, this), 0);
			$(window).scroll(windowScroll);
			$(window).scroll(_.bind(this.scrollLabel, this));
		},
		search: function() {
			if ($('.inputUser').hasClass('hide')) {
				this.showSomething('inputUser');
			} else {
				this.showSomething('weekWrapper');
			}
		},
		keydown: function(e) {
			var key = e.which || e.keyCode,
				KEYCODE_ENTER = 13,
				KEYCODE_ESC = 27;

			if (key === KEYCODE_ENTER) {
				this.getUser();
				$('.inputUser').blur();
			} else if (key === KEYCODE_ESC) {
				$('.inputUser').blur();
			}
		},
		toggleCommitSHA: function(e) {
			var $chevron = $(e.target),
				$commitSHA = $chevron.siblings('.commitSHA');

			$chevron.toggleClass('glyphicon-chevron-right');
			$chevron.toggleClass('glyphicon-chevron-down');
			$commitSHA.toggleClass('hide');
		},
		getUser: function() {
			var user = $('.inputUser').val(),
				that = this;
			this.repos = [];
			this.contributors = [];

			$('.submitUser').blur();

			if (!this.data || (this.data && !this.data['user:' + user])) this.data = {};
			this.showSomething(['loading', 'popularity']);
			this.disableSomething(['inputUser', 'submitUser']);
			$('.progress-bar').css('width', '10%');

			$.get('users/' + user, function(response) {
				that.users = response.users;
				that.repos = response.repos;
				that.contributors = _.chain(response.commits)
					.flatten()
					.groupBy(function(commit) {return commit.author})
					.value();

				that.render();
			});

		},
		render: function() {
			debugger
			if (_.values(this.contributors).length) {
				// update loading indicator
				$('.progress-bar').css('width', '75%');

				this.formatData();
				this.calculateTimeline();
				this.calculateGraph();

				$('.progress-bar').css('width', '100%');
				this.showSomething(['timelineWrapper', 'summary', 'weekWrapper']);
				this.enableSomething(['inputUser', 'submitUser']);

				// empty everything bc i'm lazy
				$(this.timeline.node()).empty();
				$(this.graph.node()).empty();

				this.graphVisualization.nodes(_.values(this.nodes)).links(_.values(this.links));
				this.graph.call(this.graphVisualization);

				this.renderBackground();

				// contributor lines
				this.timeline.selectAll('path')
					.data(_.values(this.contributors))
					.enter().append('path')
					.call(this.lineVisualization);

				// commit circles
				this.timeline.selectAll('circle')
					.data(this.commits)
					.enter().append('circle')
					.call(this.circleVisualization);
				this.commitCircles = d3.selectAll('.commit')[0];

				this.renderTimelineLabels();


				this.lastIndex = 0;
				this.lastPos = 0;
				this.windowScroll();
				this.scrollLabel();

			} else {
				// give "sorry you don't really have contributors for your top repos *sadface*" error message
			}
		},
		formatData: function() {
			var that = this,
				processedCommits,
				interval = d3.time.week;
			this.commits = [];
			// post processing: flatten the contributors' commit array, then sort them by date
			_.each(this.contributors, function(commits, contributor) {
				processedCommits = {};
				_.chain(commits)
					.flatten()
					.each(function(commit) {
						// round date to the nearest week
						var date = interval(new Date(commit.date.split('T')[0]));
						var identifier = date + ':' + commit.owner + '/' + commit.repo;
						if (processedCommits[identifier]) {
							processedCommits[identifier].times.push({
								date: new Date(commit.date),
								url: commit.url,
								sha: commit.sha});
						} else {
							commit.times = [{
								date: new Date(commit.date),
								url: commit.url,
								sha: commit.sha}];
							commit.date = date.toISOString();
							delete commit.url;
							delete commit.sha;
							processedCommits[identifier] = commit;
						}
					});
				processedCommits = _.sortBy(processedCommits, function(commit) {
					that.commits.push(commit);
					commit.dateObj = new Date(commit.date);
					return commit.dateObj;
				});
				that.contributors[contributor] = processedCommits;
			});

			// sort this.commits
			this.commits = _.sortBy(this.commits, function(commit) {return commit.dateObj});
		},
		/*
		calculate the positions of each commit, where x-axis is contributor
		and y-axis is time.  may flip the axis later on.
		*/
		calculateTimeline: function() {
			// first need scale for time
			var minDate = _.first(this.commits).dateObj,
				maxDate = _.last(this.commits).dateObj,
				svgHeight = $('.timeline').height(),
				timeScale = this.timeScale = d3.scale.linear().domain([minDate, maxDate])
					.range([app.padding.top, svgHeight - app.padding.bottom]);


			// set up scale for contributors, sorted by their repos for the x-axis
			var repos = [],
				contributorObj,
				// reposByContributor,
				that = this;
			_.each(this.contributors, function(commits, contributor) {
				contributorObj = {
					owner: contributor,
					repos: []
				}
				_.each(that.repos, function(repo) {
					if (repo.owner === contributor) {
						contributorObj.repos.push(repo);
					}
				});
				repos.push(contributorObj);
			});
			var popularitySum,
				matchedRepo;
			this.sortedRepos = [];
			_.chain(repos).sortBy(function(contributorObj) {
				popularitySum = 0;
				contributorObj.repos = _.sortBy(contributorObj.repos, function(repo) {
					popularitySum += repo.watches + repo.stars + repo.forks;
					return -repo.watches + repo.stars + repo.forks;
				});
				return -popularitySum;
			}).each(function(contributorObj) {
				that.sortedRepos.push(contributorObj.owner);
				_.each(contributorObj.repos, function(repo) {
					that.sortedRepos.push(repo.owner + '/' + repo.name);
				})
			});
			var range = _.chain(this.sortedRepos.length).range()
					.map(function(i) {return i * app.contributorPadding + app.padding.left}).value(),
				repoScale = this.repoScale = d3.scale.ordinal().domain(this.sortedRepos).range(range);

			// finally, a scale for the size of each circle
			var allTimes = _.map(this.commits, function(commit) {return commit.times.length}),
				minTime = _.min(allTimes, function(time) {return time}),
				maxTime = _.max(allTimes, function(time) {return time}),
				commitScale = d3.scale.linear().domain([minTime, maxTime]).range([3, 9]);
			// set the x and y position of each commit.
			// this is what we've been leading up to ladies and gents
			_.each(this.contributors, function(commits, contributor) {
				_.each(commits, function(commit) {
					commit.authorX = repoScale(commit.author);
					commit.x = repoScale(commit.owner + '/' + commit.repo);
					commit.y = timeScale(commit.dateObj);
					commit.radius = commitScale(commit.times.length);
				})
			});
		},
		calculateGraph: function() {
			this.nodes = {};
			this.links = {};
			var source, target,
				owner, repo,
				that = this;
			_.each(this.sortedRepos, function(ownerRepo) {
				owner = ownerRepo.split('/')[0];
				repo = ownerRepo.split('/')[1];
				that.nodes[ownerRepo] = {
					owner: owner,
					repo: repo,
					show: 0,
					total: 0
				}
			});
			_.each(this.repos, function(repo) {
				// contributor is the source, repo is the target
				target = that.nodes[repo.owner + '/' + repo.name];
				_.each(repo.contributors, function(contributor) {
					source = that.nodes[contributor];
					that.links[contributor + ',' + repo.owner + '/' + repo.name] = {
						source: source,
						target: target,
						weight: 0,
						width: 0,
						total: 0
					};
				});
			});

			_.each(this.commits, function(commit) {
				that.nodes[commit.author].total += 1;
				that.nodes[commit.owner + '/' + commit.repo].total += 1;
				that.links[commit.author + ',' + commit.owner + '/' + commit.repo].total += 1;
			});
			var maxWeight = _.max(this.links, function(link) {return link.total}).total;
			this.linkScale = d3.scale.linear().domain([1, maxWeight]).range([1, 8]);

			this.commitsByWeek = _.chain(this.commits).groupBy(function(commit) {return commit.y}).values().value();

		},
		// draw the background here bc i'm too lazy to put it in another file
		renderBackground: function() {
			var that = this,
				backgrounds = {},
				owner,
				background;
			_.each(this.sortedRepos, function(repo) {
				owner = repo.split('/')[0];
				if (!backgrounds[owner]) {
					background = that.timeline.append('rect')
						.classed('background', true)
						.attr('x', that.repoScale(owner) - app.contributorPadding / 2)
						.attr('y', 0)
						.attr('width', app.contributorPadding)
						.attr('height', $('.timeline').height() + 500)
						.attr('stroke', app.d3Colors(owner))
						.attr('stroke-opacity', .2)
						.attr('fill', app.d3Colors(owner))
						.attr('fill-opacity', .02);
					backgrounds[owner] = background
				} else {
					background = backgrounds[owner];
					background.attr('width', parseInt(background.attr('width')) + app.contributorPadding);
				}
			});

			$('.timeline').width(this.sortedRepos.length * app.contributorPadding + app.padding.left + app.padding.right);
		},
		renderTimelineLabels: function() {
			var that = this;
			this.timelineLabels = this.timeline.append('g');
			this.timelineLabels.selectAll('.label')
				.data(_.map(this.sortedRepos, function(repo, i) {
					var ownerRepo = repo.split('/');
					return {
						owner: ownerRepo[0], 
						repo: ownerRepo[1],
						x: that.repoScale(repo),
						y: 15,
						rotate: -90,
						text: ownerRepo[0] + (ownerRepo[1] ? '/' + ownerRepo[1] : '')
					}
				})).enter().append('g')
				.classed('label', true)
				.call(this.labelVisualization)
				.call(this.labelVisualization.position);
		},
		windowScroll: function() {
			if (!this.commitsByWeek) return;

			var top = $(window).scrollTop() + $(window).height() / 3,
				commits = this.commitsByWeek[this.lastIndex], 
				node, link,
				that = this;
			if (this.lastPos < top) {
				// if it's scrolling down
				while (true) {
					// if there are no more commits, return
					if (!this.commitsByWeek[this.lastIndex]) {
						this.lastIndex -= 1;
						break;
					}

					if (this.commitsByWeek[this.lastIndex][0].y > top) {
						break;
					} else {
						commits = this.commitsByWeek[this.lastIndex];
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
						this.lastIndex += 1;
					}
				}
			} else if (this.lastPos > top) {
				while (true) {
					if (!this.commitsByWeek[this.lastIndex]) {
						this.lastIndex += 1;
						break;
					}
					
					if (this.commitsByWeek[this.lastIndex][0].y < top) {
						break;
					} else {
						commits = this.commitsByWeek[this.lastIndex];
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
						this.lastIndex -= 1;
					}
				}
			}

			this.circleVisualization.highlight(commits);
			this.graphVisualization.showLabels(commits);
			this.graphVisualization.update();
			$('.week').text(app.formatTime(commits[0].dateObj));
			$('.commitData').html(_.template(CommitTemplate, {commits: commits}));
			$('.commitChevron').click(_.bind(this.toggleCommitSHA, this));

			this.lastPos = top;
		},
		scrollLabel: function() {
			if (!this.timelineLabels) return;
			this.timelineLabels.attr('transform', 'translate(0,' + $(window).scrollTop() + ')');
		},
		showSomething: function(somethings) {
			somethings = !_.isArray(somethings) ? [somethings] : somethings;
			_.each(somethings, function(something) {
				$('.' + something).siblings().addClass('hide');
				$('.' + something).removeClass('hide');
			});
		},
		disableSomething: function(somethings) {
			somethings = !_.isArray(somethings) ? [somethings] : somethings;
			_.each(somethings, function(something) {
				$('.' + something).attr('disabled', true);
			});
		},
		enableSomething: function(somethings) {
			somethings = !_.isArray(somethings) ? [somethings] : somethings;
			_.each(somethings, function(something) {
				$('.' + something).attr('disabled', false);
			});
		}
	});
})