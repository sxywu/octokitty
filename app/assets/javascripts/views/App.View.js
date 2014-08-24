define([
	"jquery",
	"underscore",
	"backbone",
	"d3",
	"visualizations/Line.Visualization",
	"visualizations/Circle.Visualization",
	"visualizations/Graph.Visualization"
], function(
	$,
	_,
	Backbone,
	d3,
	LineVisualization,
	CircleVisualization,
	GraphVisualization
) {
	return Backbone.View.extend({
		initialize: function() {
			this.repos = [];
			this.contributors = [];

			this.timeline = d3.select('svg.timeline');
			this.graph = d3.select('svg.graph');

			// $('.submitUser').click(_.bind(this.getUser, this));
			this.getData('enjalot');

			this.lastIndex = 0;
			this.lastPos = 0;
			var windowScroll = _.throttle(_.bind(this.windowScroll, this), 100);
			$(window).scroll(windowScroll)
		},
		events: {
			'click .submitUser': 'getUser'
		},
		getUser: function() {
			// TODO(swu): validation
			var user = $('.inputUser').val();
			this.repos = [];
			this.contributors = [];

			if (this.hasPeriod(user)) return;
			this.getData(user);
		},
		getData: function(user, end) {
			var that = this,
				name = 'user:' + user,
				url = '/users/' + user + '/repos',
				numRepos = 5,
				numContributors = 5,
				callback = function(data) {
					// save it first
					// that.saveToStorage(name, data);

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
						if (!that.hasPeriod(repo.owner) && !that.hasPeriod(repo.name)) {
							url = '/repos/' + repo.owner + '/' + repo.name + '/contributors';
							callback = function(data) {
								name = 'repo:' +  repo.name;
								// that.saveToStorage(name, data);

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

							// if (localStorage[name]) {
								callback(that.getFromStorage(name));
							// } else {
								// $.get(url, callback);
							// }
						} else {
							allReposLoaded();
						}
					});
				};
			// if (localStorage[name]) {
				callback(this.getFromStorage(name));
			// } else {
				// $.get(url, callback);
			// }
		},
		/**
		for each of the contributors in a repo, get only their commits to that repo.
		once we have all the data, call render.
		*/
		getCommits: function() {
			if (this.repos) {
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
						if (!that.hasPeriod(repo.owner) && !that.hasPeriod(repo.name) && !that.hasPeriod(contributor)) {
							url = '/repos/' + repo.owner + '/' + repo.name + '/commits/' + contributor;
							callback = function(data) {
								name = 'commit:' + repo.owner + '/' + repo.name + '/' + contributor;
								_.each(data, function(commit) {
									commit.owner = repo.owner;
									commit.repo = repo.name;
								});
								// that.saveToStorage(name, data);

								if (that.contributors[contributor]) {
									that.contributors[contributor].push(data);
								} else {
									that.contributors[contributor] = data;
								}

								allCommitsLoaded();
							};

							// if (localStorage[name]) {
								callback(that.getFromStorage(name));
							// } else {
								// $.get(url, callback);
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
		hasPeriod: function(string) {
			// does some mofo have a period in their name/repo name?  well then they don't get included
			return _.indexOf(string, '.') > -1;
		},
		/**
		note(swu): the data is currently being stored to localStorage, but
		we should consider how we may want to save to db
		*/
		saveToStorage: function(name, data) {
			localStorage[name] = JSON.stringify(data);
		},
		getFromStorage: function(name) {
			return $.parseJSON(localStorage[name]);
		},
		render: function() {
			this.formatData();
			this.calculateTimeline();
			this.calculateGraph();

			this.graphVisualization = new GraphVisualization()
				.nodes(this.nodes).links(this.links);
			this.graph.call(this.graphVisualization);

			this.renderBackground();
			// contributor lines
			var lineVisualization = new LineVisualization();
			this.timeline.selectAll('path')
				.data(_.values(this.contributors))
				.enter().append('path')
				.call(lineVisualization);

			// commit circles
			this.circleVisualization = new CircleVisualization();
				// commits = _.chain(this.contributors).values()
				// 	.flatten().value();
			this.timeline.selectAll('circle')
				.data(this.commits)
				.enter().append('circle')
				.call(this.circleVisualization);
			this.commitCircles = d3.selectAll('.commit')[0]; 

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
							processedCommits[identifier].times.push({date: commit.date, url: commit.url});
						} else {
							commit.times = [{date: commit.date, url: commit.url}];
							commit.date = date;
							delete commit.url;
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
			var minDate = _.chain(this.contributors)
					.map(function(commits, contributor) {
						// get first commit of all contributors, since it's already sorted
						return _.first(commits);
					}).min(function(commit) {return commit.dateObj}).value().dateObj,
				maxDate = _.chain(this.contributors)
					.map(function(commits, contributor) {
						return _.last(commits);
					}).max(function(commit) {return commit.dateObj}).value().dateObj,
				svgHeight = $('.timeline').height(),
				timeScale = this.timeScale = d3.scale.linear().domain([minDate, maxDate])
					.range([app.padding.top, svgHeight - app.padding.left]);


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
			this.links = [];
			var source, target,
				owner, repo,
				that = this;
			_.each(this.sortedRepos, function(ownerRepo) {
				owner = ownerRepo.split('/')[0];
				repo = ownerRepo.split('/')[1];
				that.nodes[ownerRepo] = {
					owner: owner,
					repo: repo,
					show: false
				}
			})
			_.each(this.repos, function(repo) {
				// contributor is the source, repo is the target
				target = that.nodes[repo.owner + '/' + repo.name];
				_.each(repo.contributors, function(contributor) {
					source = that.nodes[contributor];
					that.links.push({
						source: source,
						target: target,
						weight: 0
					})
				});
			});
			this.nodes = _.values(this.nodes);
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
		},
		windowScroll: function() {
			if (!this.commits) return;

			var top = $(window).scrollTop() + app.padding.top + $(window).height() / 2,
				commit, link, node;
			if (this.lastPos < top) {
				// if it's scrolling down
				while (true) {
					if (this.commits[this.lastIndex].y > top) {
						break;
					} else {
						commit = this.commits[this.lastIndex];
						node = _.find(this.nodes, function(node) {
							return node.owner === commit.owner && node.repo && commit.repo;
						});
						link = _.find(this.links, function(link) {
							return (link.source.owner === commit.author) && !link.source.repo 
								&& (link.target.owner === commit.owner) && link.target.repo === commit.repo;
						});
						node.show = true;
						link.weight += 1;
						this.lastIndex += 1;
					}
				}
			} else if (this.lastPos > top) {
				while (true) {
					if (this.commits[this.lastIndex].y < top) {
						break;
					} else {
						commit = this.commits[this.lastIndex];
						link = _.find(this.links, function(link) {
							return (link.source.owner === commit.author) && !link.source.repo 
								&& (link.target.owner === commit.owner) && link.target.repo === commit.repo;
						});
						link.weight -= 1;
						this.lastIndex -= 1;
					}
				}
			}
			this.circleVisualization.highlight(this.commits[this.lastIndex]);
			this.graphVisualization.update();

			this.lastPos = top;
		}
	});
})