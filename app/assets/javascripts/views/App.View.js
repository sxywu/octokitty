define([
	"jquery",
	"underscore",
	"backbone",
	"d3"
], function(
	$,
	_,
	Backbone,
	d3
) {
	return Backbone.View.extend({
		initialize: function() {
			this.repos = [];
			this.contributors = [];
			this.getData('enjalot');
		},
		hitEndpoint: function(url, parse, callback, data) {
			var that = this;
			data = data || [];
			$.ajax({
	        	url: url, 
	        	success: function(response, status, request) {
	        		_.each(response, function(resp) {
	        			data.push(parse(resp));
	        		});
		            url = request.getAllResponseHeaders().match(/<(.*?)>; rel="next"/);

		            if (url) {
		            	url = url[1];
		            	that.hitEndpoint(url, parse, callback, data);
		            } else {
						callback(data);
		            }
		        },
		        error: function(response, status, request) {
		        	debugger
		        }
		    });
		},
		parseRepos: function(repo) {
			return {
				owner: repo.owner.login,
				name: repo.name,
				watches: repo.watchers_count,
				stars: repo.stargazers_count,
				forks: repo.forks_count
			}
		},
		parseContributors: function(contributor) {
			return {
				author: contributor.login,
				contributions: contributor.contributions
			}
		},
		parseCommits: function(commit) {
			return {
				author: commit.author.login,
				date: commit.commit.committer.date,
				url: commit.url
			}
		},
		getData: function(user, end) {
			var that = this,
				name = 'user:' + user,
				url = 'https://api.github.com/users/' + user + '/repos?per_page=100',
				numRepos = 5,
				numContributors = 5,
				callback = function(data) {
					// save it first
					that.saveToStorage(name, data);

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
						url = 'https://api.github.com/repos/' + repo.owner + '/' + repo.name + '/contributors?per_page=100';
						callback = function(data) {
							name = 'repo:' +  repo.name;
							that.saveToStorage(name, data);

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

						if (localStorage[name]) {
							callback(that.getFromStorage(name));
						} else {
							that.hitEndpoint(url, that.parseContributors, callback);
						}
					});
				};
			if (localStorage[name]) {
				callback(this.getFromStorage(name));
			} else {
				this.hitEndpoint(url, this.parseRepos, callback);
			}
		},
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
						url = 'https://api.github.com/repos/' + repo.owner + '/' + repo.name + '/commits?author=' + contributor + '&per_page=100';
						callback = function(data) {
							name = 'commit:' + repo.owner + '/' + repo.name + '/' + contributor;
							_.each(data, function(commit) {
								commit.owner = repo.owner;
								commit.repo = repo.name;
							});
							that.saveToStorage(name, data);

							if (that.contributors[contributor]) {
								that.contributors[contributor].push(data);
							} else {
								that.contributors[contributor] = data;
							}

							allCommitsLoaded();
						};

						if (localStorage[name]) {
							callback(that.getFromStorage(name));
						} else {
							that.hitEndpoint(url, that.parseCommits, callback);
						}

					});
				});

			} else {
				// give "sorry you don't really have contributors for your top repos *sadface*" error message
			}
		},
		saveToStorage: function(name, data) {
			localStorage[name] = JSON.stringify(data);
		},
		getFromStorage: function(name) {
			return $.parseJSON(localStorage[name]);
		},
		render: function() {
			debugger
		}
	});
})