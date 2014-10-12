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
			this.contributors = _.chain(commits)
				.pluck('contributors')
				.flatten().value();
			debugger
		}
	});
});