var app = angular.module('app', []);

app.controller('mainCtrl', function ($scope, $http) {
    // Must use a wrapper object, otherwise "activeItem" won't work
    $scope.states = {};
    $scope.states.activeItem = 'VGG16';
    $scope.update = function(item) {
        $scope.states.activeItem = item.title;
        $http.get($scope.states.activeItem + '.json')
            .success(function(data) {
                $scope.flowData = data;
                console.log(data);
            });
    };
    $scope.items = [{
        id: 'VGG16.json',
        title: 'VGG16'
    }, {
        id: 'MobileNet.json',
        title: 'MobileNet'
    }, {
        id: 'resNet.json',
        title: 'resNet'
    }];
    
    $http.get($scope.states.activeItem + '.json')
        .success(function(data) {
            $scope.flowData = data;
            console.log(data);
        });
    


});

app.directive('flowDiagram', function() {
    return {
        restrict: 'EA',
        scope: {
            data: '='
        },
        link: function(scope, element, attrs) {
            scope.$watch("data", function (newVal, oldVal) {
                diagram = newVal;
                console.log(diagram);

                var g = new dagreD3.graphlib.Graph({compound:true})
                  .setGraph({})
                  .setDefaultEdgeLabel(function() { return {}; });
                //g.graph().rankDir = 'LR';

                diagram.nodes.forEach(function(node) { 
                    console.log(node.id);
                    g.setNode(node.id, { label: node.label, class: node.class });
                });

                diagram.nodes.forEach(function(node) { 
                    if(node.parent != '' && node.parent != null){
                        console.log(node.id);
                        console.log(node.parent);
                        g.setParent(node.id, node.parent);
                    }
                });

                diagram.edges.forEach(function(edge) { 
                    g.setEdge(edge.src, edge.dst, { label: edge.label}); 
                });

                // Set some general styles
                g.nodes().forEach(function(v) {
                  var node = g.node(v);
                  node.rx = node.ry = 5;
                });

                // Add some custom colors based on state
        //        g.node('data').style = "fill: #f77";
        //        g.node('prob').style = "fill: #7f7";

                var svg = d3.select("svg"),
                    inner = svg.select("g");

                // Set up zoom support
                var zoom = d3.behavior.zoom().on("zoom", function() {
                      inner.attr("transform", "translate(" + d3.event.translate + ")" +
                                                  "scale(" + d3.event.scale + ")");
                    });
                svg.call(zoom);

                // Create the renderer
                var render = new dagreD3.render();

                // Run the renderer. This is what draws the final graph.
                render(inner, g);

                // Center the graph
                var initialScale = 0.75;
                zoom
                  .translate([(svg.attr("width") - g.graph().width * initialScale) / 2, 20])
                  .scale(initialScale)
                  .event(svg);
                svg.attr('height', g.graph().height * initialScale + 40);
            }, true);
        }
    }
});