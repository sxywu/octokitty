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

			this.getUser();

			var windowScroll = _.debounce(_.bind(this.windowScroll, this), 0);
			$(window).scroll(windowScroll);
			$(window).scroll(_.bind(this.scrollLabel, this));
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
			var user = $('.inputUser').val();
			this.repos = [];
			this.contributors = [];

			$('.submitUser').blur();

			user = 'enjalot';

			if (!this.validate(user)) return; // give warning
			if (!this.data || (this.data && !this.data['user:' + user])) this.data = {};
			this.showSomething(['loading', 'popularity']);
			this.disableSomething(['inputUser', 'submitUser']);
			$('.progress-bar').css('width', '10%');
			this.getData(user);
		},
		getData: function(user, end) {
			var that = this,
				name = 'user:' + user,
				url = '/users/' + user + '/repos',
				numRepos = 5,
				numContributors = 5,
				callback = function(data) {
					// update loading indicator
					$('.progress-bar').css('width', '25%');

					that.data[name] = data;

					// after all repos are loaded, and the contributors are calculated for this user
					// go and get the information of everyone in the contributors array
					var allReposLoaded = _.after(Math.min(data.length, numRepos), function() {
						if (!end) {
							var allUsersLoaded = _.after(that.contributors.length, _.bind(that.getCommits, that));
							_.each(that.contributors, function(contributor) {
								that.getData(contributor, allUsersLoaded);
							})
						} else {
							end();
						}
					});
					// sort the repos by "popularity", and then query the endpoint to see
					// if there are any contributors.  If there are, add the repo to the repos array
					_.chain(data).sortBy(function(repo) {
						return -(repo.watches + repo.stars + repo.forks);
					}).first(numRepos).each(function(repo) {
						name = 'repo:' +  repo.name;
						if (that.validate(repo.owner) && that.validate(repo.name)) {
							url = '/repos/' + repo.owner + '/' + repo.name + '/contributors';
							callback = function(data) {
								name = 'repo:' +  repo.name;
								that.data[name] = data;

								var contributors = _.chain(data)
									.filter(function(contributor) {
										return contributor.author !== repo.owner && contributor.contributions > 5;
									}).first(numContributors).map(function(contributor) {
										if (!end && !_.contains(that.contributors, contributor.author)) {
											// make sure contributor isn't already in the array
											that.contributors.push(contributor.author);
										}
										return contributor.author;
									}).value();
								if (contributors.length) {
									contributors.push(repo.owner)
									that.repos.push({
										name: repo.name,
										owner: repo.owner,
										contributors: contributors
									})
								}
								allReposLoaded();
							};

							callback($.parseJSON(localStorage[name]))
							// if (that.data[name]) {
							// 	callback(that.data[name]);
							// } else {
							// 	$.get(url, callback);	
							// }
						} else {
							allReposLoaded();
						}
					});
				};

			callback($.parseJSON(localStorage[name]))
			// if (that.data[name]) {
			// 	callback(that.data[name]);
			// } else {
			// 	$.get(url, callback);	
			// }
		},
		/**
		for each of the contributors in a repo, get only their commits to that repo.
		once we have all the data, call render.
		*/
		getCommits: function() {
			if (this.repos.length) {
				// update loading indicator
				$('.progress-bar').css('width', '50%');

				var numCommits = _.reduce(this.repos, function(memo, repo) {return memo + repo.contributors.length}, 0),
					allCommitsLoaded = _.after(numCommits, _.bind(this.render, this)),
					name,
					url,
					callback,
					that = this;

				this.contributors = {};
				_.each(this.repos, function(repo) {
					_.each(repo.contributors, function(contributor) {
						name = 'commit:' + repo.owner + '/' + repo.name + '/' + contributor;
						if (that.validate(repo.owner) && that.validate(repo.name) && that.validate(contributor)) {
							url = '/repos/' + repo.owner + '/' + repo.name + '/commits/' + contributor;
							callback = function(data) {
								name = 'commit:' + repo.owner + '/' + repo.name + '/' + contributor;
								_.each(data, function(commit) {
									commit.owner = repo.owner;
									commit.repo = repo.name;
								});
								that.data[name] = data;

								if (that.contributors[contributor]) {
									that.contributors[contributor].push(data);
								} else {
									that.contributors[contributor] = data;
								}

								allCommitsLoaded();
							};

							callback($.parseJSON(localStorage[name]))
							// if (that.data[name]) {
							// 	callback(that.data[name]);
							// } else {
							// 	$.get(url, callback);	
							// }
						} else {
							allCommitsLoaded();
						}
					});
				});

			} else {
				// give "sorry you don't really have contributors for your top repos *sadface*" error message
			}
		},
		validate: function(string) {
			return string && _.indexOf(string, ' ') === -1 && _.indexOf(string, '.') === -1;
		},
		render: function() {
			if (_.values(this.contributors).length) {
				// update loading indicator
				$('.progress-bar').css('width', '75%');

				this.formatData();
				this.calculateTimeline();
				this.calculateGraph();

				$('.progress-bar').css('width', '100%');
				this.showSomething(['timelineWrapper', 'summary']);
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
				reposByContributor,
				that = this;
			_.each(this.contributors, function(commits, contributor) {
				reposByContributor = _.filter(that.repos, function(repo) {return repo.owner === contributor});
				if (reposByContributor.length) {
					_.each(reposByContributor, function(repo) {
						repos.push(repo.owner + '/' + repo.name);
					});
				}
				repos.push(contributor);
			});
			repos = this.sortedRepos = _.sortBy(repos, function(repo) {return repo.toLowerCase()});
			var range = _.chain(repos.length).range()
					.map(function(i) {return i * app.contributorPadding + app.padding.left}).value(),
				repoScale = this.repoScale = d3.scale.ordinal().domain(repos).range(range);

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
					show: true
				}
			})
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
				that.links[commit.author + ',' + commit.owner + '/' + commit.repo].total += 1;
			});
			var maxWeight = _.max(this.links, function(link) {return link.total}).total;
			this.linkScale = d3.scale.linear().domain([0, maxWeight]).range([0, 8]);

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
						rotate: -90
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
				link,
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

							console.log(that.lastIndex, commit.author + ',' + commit.owner + '/' + commit.repo, 
								link.weight, link.total)
							// that.nodes[commit.owner + '/' + commit.repo].show = true;
						})
						// commit = this.commits[this.lastIndex];
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

							console.log(that.lastIndex, commit.author + ',' + commit.owner + '/' + commit.repo, 
								link.weight)
						});
						this.lastIndex -= 1;
					}
				}
			}
			this.circleVisualization.highlight(commits);
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