define([
	"jquery",
	"underscore",
	"backbone",
	"d3",
	"views/Timeline.View",
	"views/Graph.View",
	"visualizations/Graph.Visualization",
	"visualizations/Label.Visualization",
	"text!templates/Commit.Template.html"
], function(
	$,
	_,
	Backbone,
	d3,
	TimelineView,
	GraphView,
	GraphVisualization,
	LabelVisualization,
	CommitTemplate
) {
	return Backbone.View.extend({
		initialize: function() {
			this.timeline = d3.select('svg.timeline');
			this.graph = d3.select('svg.graph');

			this.timelineView = new TimelineView({
				el: this.timeline.node()
			});
			this.graphView = new GraphView({
				el: this.graph.node()
			})

			// this.graphVisualization = new GraphVisualization();
			this.labelVisualization = new LabelVisualization();

			$('.submitUser').click(_.bind(this.getUser, this));
			$('.inputUser').keydown(_.bind(this.keydown, this));
			$('.search').click(_.bind(this.search, this));

			this.showSomething(['timelineWrapper', 'summary', 'weekWrapper']);
			this.users = $.parseJSON(localStorage['users'])
			this.repos = $.parseJSON(localStorage['repos'])
			this.commits = $.parseJSON(localStorage['commits'])
			this.render();
			
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

			$.get('users/' + user, function() {
				that.pollUser(user);
			});

		},
		pollUser: function(user) {
			var that = this;

			setTimeout(function() {
				$.ajax({
					url: '/users/' + user + '/status',
					method: 'GET',
				}).success(function(response){
					if (response.users) {
						that.users = response.users;
						that.repos = response.repos;
						that.commits = response.commits;

						that.render();
					} else {
						that.pollUser(user);
					}
				})
			}, 1000);
		},
		render: function() {
			this.timelineView.processData(this.users, this.repos, this.commits);
			this.timelineView.render();

			this.contributorsAndRepos = this.timelineView.contributorsAndRepos;
			this.contributorScale = this.timelineView.contributorScale;

			this.graphView.processData(this.contributorsAndRepos, this.timelineView.commits);
			this.graphView.render();

			this.commitsByWeek = _.chain(this.timelineView.lineData)
				.flatten().sortBy(function(commit) {return commit.x})
				.groupBy(function(commit) {return commit.x}).values().value();

			// 	this.showSomething(['timelineWrapper', 'summary', 'weekWrapper']);
			// 	this.enableSomething(['inputUser', 'submitUser']);


			this.renderBackground();
			this.renderTimelineLabels();

			this.lastIndex = 0;
			this.lastPos = 0;
			this.windowScroll();
			this.scrollLabel();

			var windowScroll = _.debounce(_.bind(this.windowScroll, this), 0);
			$('.leftPanel').scroll(windowScroll);
			$('.leftPanel').scroll(_.bind(this.scrollLabel, this));

			// } else {
			// 	// give "sorry you don't really have contributors for your top repos *sadface*" error message
			// }
		},
		// draw the background here bc i'm too lazy to put it in another file
		renderBackground: function() {
			var that = this,
				backgrounds = {},
				owner,
				background;
			_.each(this.contributorsAndRepos, function(repo) {
				owner = repo.split('/')[0];
				if (!backgrounds[owner]) {
					background = that.timeline.append('rect')
						.classed('background', true)
						.attr('x', 0)
						.attr('y', that.contributorScale(owner) - app.contributorPadding / 2)
						.attr('width', $('.timeline').width() + 500)
						.attr('height', app.contributorPadding)
						.attr('stroke', app.d3Colors(owner))
						.attr('stroke-opacity', .2)
						.attr('fill', app.d3Colors(owner))
						.attr('fill-opacity', .02);
					backgrounds[owner] = background
				} else {
					background = backgrounds[owner];
					background.attr('height', parseInt(background.attr('height')) + app.contributorPadding);
				}
			});

			// $('.timeline').width(this.sortedRepos.length * app.contributorPadding + app.padding.left + app.padding.right);
		},
		renderTimelineLabels: function() {
			var that = this;
			this.timelineLabels = this.timeline.append('g');
			this.timelineLabels.selectAll('.label')
				.data(_.map(this.contributorsAndRepos, function(repo, i) {
					var ownerRepo = repo.split('/');
					return {
						owner: ownerRepo[0], 
						repo: ownerRepo[1],
						x: 15,
						y: that.contributorScale(repo),
						text: ownerRepo[0] + (ownerRepo[1] ? '/' + ownerRepo[1] : '')
					}
				})).enter().append('g')
				.classed('label', true)
				.call(this.labelVisualization)
				.call(this.labelVisualization.position);
		},
		windowScroll: function() {
			if (!this.commitsByWeek) return;

			var left = $('.leftPanel').scrollLeft() + app.padding.left,
				commits = this.commitsByWeek[this.lastIndex], 
				node, link,
				that = this;
			if (this.lastPos < left) {
				// if it's scrolling down
				while (true) {
					// if there are no more commits, return
					if (!this.commitsByWeek[this.lastIndex]) {
						this.lastIndex -= 1;
						break;
					}

					if (this.commitsByWeek[this.lastIndex][0].x > left) {
						break;
					} else {
						commits = this.commitsByWeek[this.lastIndex];
						this.graphView.moreCommits(commits);
						this.lastIndex += 1;
					}
				}
			} else if (this.lastPos > left) {
				while (true) {
					if (!this.commitsByWeek[this.lastIndex]) {
						this.lastIndex += 1;
						break;
					}
					
					if (this.commitsByWeek[this.lastIndex][0].x < left) {
						break;
					} else {
						commits = this.commitsByWeek[this.lastIndex];
						this.graphView.lessCommits(commits);
						this.lastIndex -= 1;
					}
				}
			}

			this.graphView.updateScroll(commits);
			this.timelineView.updateScroll(commits);

			$('.week').text(app.formatTime(commits[0].dateObj));
			$('.commitData').html(_.template(CommitTemplate, {commits: commits}));
			$('.commitChevron').click(_.bind(this.toggleCommitSHA, this));

			this.lastPos = left;
		},
		scrollLabel: function() {
			if (!this.timelineLabels) return;
			this.timelineLabels.attr('transform', 'translate(' + $('.leftPanel').scrollLeft() + ',0)');
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