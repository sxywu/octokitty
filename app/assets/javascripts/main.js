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
    app.contributorPadding = 25;

    var appView = new AppView();
});