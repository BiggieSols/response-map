$(function() {

  constructMap();
  window.mapBuilder = new MapBuilder();
  mapBuilder.initFirstCircle()
            .initAjaxRequest()
            // .parseLayerPoints(dataPoints)
            // .enterData()
            // .createMapDots()

  setInterval(mapBuilder.initAjaxRequest.bind(mapBuilder), 60000)


  function constructMap() {
    var USLatLng = [39.50, -98.35]

    var map = L.map('map', {
      center: USLatLng,
      zoom: 4
    });

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'biggiesols.522814c9',
        accessToken: 'pk.eyJ1IjoiYmlnZ2llc29scyIsImEiOiJkNzA2MGYxZjI2ZDBjMzIzMTkzYjNmYzM5Y2YzZGQ5MSJ9.MBd4d0CgFV48vRDn0HzeQQ'
    }).addTo(map);



    window.map = map;

    window.USCoords = map.latLngToLayerPoint(USLatLng);
  }

  var data = [];



  function MapBuilder() {
    this.lastMin = this.lastMax = 0;

    this.initAjaxRequest = function() {
      var self = this;
      $.ajax({
        method: "GET", 
        url: "https://www.periscopedata.com/api/ziprecruiter/chart/csv/31c9d728-227d-83b5-2811-1e53e4af1a5c/14901", 
        success: function(res) {
          window.res = res.split("\n")
                          .slice(1, -1)
                          .map(function(str) { 
                            return str.split(",").map(function(str) {
                              return parseFloat(str);
                            })
                          })
                          .filter(function(arr) {
                            return(arr[0] < self.lastMin || arr[0] > self.lastMax);
                          })

          // console.log("lastMin: " + self.lastMin);
          // console.log("lastMax: " + self.lastMax);            
          if(window.res.length) {
            self.lastMax = _.first(window.res)[0];
            self.lastMin = _.last(window.res)[0];
            self.parseLayerPoints(window.res.map(function(arr) { 
              return arr.slice(1);
            })).enterData().createMapDots();
          }
        }
          // window.mapBuilder.parseLayerPoints(window.res.map(function(arr) { return arr.slice(1); }))
          //           .enterData()
          //           .createMapDots()
      })
      return this;
    }

    this.parseLayerPoints = function(dataPoints) {
      this.layerPoints = _.map(dataPoints, function(p) { 
        return _.extend({
          latLng: p
        }, map.latLngToLayerPoint(p)) 
      })
      return this;
    }
    // console.log(dataPoints);

    this.initFirstCircle = function() {
      var circle = L.circle([0, 0], 400, {
          color: 'tomato',
          fillColor: '#f03',
          fillOpacity: 0,
          weight: 0,
          className: 'first-circle'
      }).addTo(map);
      return this;
    }

    this.enterData = function() {
      d3.select('svg')
        .selectAll('dummySelector')
        .data(this.layerPoints)
        .enter()
        .append('circle')
        .attr({class: 'circle-123'});
      return this; 
    }

    this.createMapDots = function() {
      d3.selectAll('.circle-123')
        .attr({
          class: 'circle',
          fill: function(d) {
            return "#95B9C7"
            // return 'tomato';
            var letters = '0123456789ABCDEF'.split('');
            var color = '#';
            for (var i = 0; i < 6; i++ ) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
          },
          // stroke: '#f5f5f5',
          opacity: 0.6,
          r: 0.00001,
          opacity: 0.5,
        })
        .attr('lat', function(d) {
          return d.latLng[0];
        })
        .attr('lng', function(d) {
          return d.latLng[1]
        })
        .attr('cx', function(d) {
          return d.x
        })
        .attr('cy', function(d, i) {
          return d.y
        })
        .transition()
        .duration(function() { 
          return 2000 * Math.random();
         })
        .delay(function(d, i) { return (i * 70) /* * Math.random(); */ })
        // .ease('elastic')
        .attr({
          'stroke-width': 3,
          r: 30,
        })
        .transition()
        .ease('elastic')
        .duration(2000)
        .attr({
          'stroke-width': 0,
          opacity: 0.8,
          r: 8
        })
        .remove()

      // d3.selectAll('circle').on('click', function() {
      //   console.log(this);
      // })
      return this;
    }

  }

  



  window.placeMarkers = function() {
    d3.selectAll('circle')
      .attr('cx', function(p) {
        var layerPoint = map.latLngToLayerPoint(p.latLng);
        return layerPoint.x;
      })
      .attr('cy', function(p) {
        var layerPoint = map.latLngToLayerPoint(p.latLng);
        return layerPoint.y;
      })
  }

  map.on('zoomend', placeMarkers);

});
