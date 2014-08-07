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
			var after = _.after(1, _.bind(this.render, this));
			this.getEndpoint(
				'commit',
				'https://api.github.com/repos/enjalot/checkin/commits?author=sxywu&per_page=100',
				this.parseCommits,
				after
			);
		},
		getEndpoint: function(name, url, parse, callback) {
			var that = this,
				data = [];
			if (!localStorage[name]) {
				this.hitEndpoint(name, url, data, parse, callback);
		    } else {
		        this[name] = $.parseJSON(localStorage[name]);
				callback();
		    }
		},
		hitEndpoint: function(name, url, data, parse, callback) {
			var that = this;
			$.ajax({
	        	url: url, 
	        	success: function(response, status, request) {
	        		_.each(response, function(resp) {
	        			data.push(parse(resp));
	        		});
		            url = request.getAllResponseHeaders().match(/<(.*?)>; rel="next"/);

		            if (url) {
		            	url = url[1];
		            	that.hitEndpoint(name, url, data, parse, callback);
		            } else {
		            	that[name] = data;
		            	localStorage[name] = JSON.stringify(that[name]);
						callback();
		            }
		        }
		    });
		},
		parseCommits: function(commit) {
			return {
				author: commit.author.login,
				date: commit.commit.committer.date,
				url: commit.url
			}
		},
		render: function() {
			debugger
		}
	});
})