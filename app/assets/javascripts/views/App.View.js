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
				'https://api.github.com/repos/mbostock/d3/commits?author=mbostock&per_page=100',
				after
			);
		},
		getEndpoint: function(name, url, callback) {
			var that = this,
				data = [];
			if (!localStorage[name]) {
				this.hitEndpoint(url, data);
		    } else {
		        this[name] = $.parseJSON(localStorage[name]);
		        callback();
		    }
		},
		hitEndpoint: function(url, data) {
			var that = this;
			$.ajax({
	        	url: url, 
	        	success: function(response, status, request) {
		            data.push(response);
		            url = request.getAllResponseHeaders().match(/Link: <(.*?)>; rel="next"/);

		            if (url || data.length < 5) {
		            	url = url[1];
		            	that.hitEndpoint(url, data);
		            } else {
		            	that[name] = _.flatten(data);
				        localStorage[name] = JSON.stringify(that[name]);
				        callback();
		            }
		        }
		    });
		},
		
		render: function() {
			debugger
		}
	});
})