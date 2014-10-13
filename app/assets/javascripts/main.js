require.config({
    baseUrl: "assets/",
    paths: {
        "app": "..",
        "underscore": "underscore",
        "backbone": "backbone",
        "bootstrap": "bootstrap",
        "d3": "d3.v3",
        "d3.tip": "d3.tip",
        "mediator": "mediator"
    },
    shim: {
        "underscore": {
            exports: "_"
        },
        "backbone": {
            deps: ["underscore", "jquery"],
            exports: "Backbone"
        },
        bootstrap: {
            deps: ["jquery"]
        },
        "d3": {
            exports: "d3"
        },
        "d3.tip": {
            deps: ["d3"],
            exports: "d3.tip"
        }
    }
});

require([
    "jquery",
    "underscore",
    "backbone",
    "d3",
    "mediator",
    "views/App.View"
], function(
    $,
    _,
    Backbone,
    d3,
    Mediator,
    AppView
) {
    app = {};
    var height = $(window).height();
    app.padding = {top: 35, bottom: 35, left: 150, right: 150};
    app.contributorPadding = 35;
    app.formatTime = d3.time.format('%B %d, %Y')
    app.d3Colors = d3.scale.category20();

    var appView = new AppView();
});