// Generated by CoffeeScript 1.8.0
(function() {
  
  var BubbleChart, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  BubbleChart = (function() {
    function BubbleChart(container, data, config) {
      this.hide_details = __bind(this.hide_details, this);
      this.show_details = __bind(this.show_details, this);
      this.move_towards_year = __bind(this.move_towards_year, this);
      this.display_by_group = __bind(this.display_by_group, this);
      this.start = __bind(this.start, this);
      this.render = __bind(this.render, this);
      this.create_nodes = __bind(this.create_nodes, this);
      
      var max_amount;
      this.container = container;
      this.data = data;
      this.width = config.width;
      this.height = config.height;
      this.tooltip = CustomTooltip("startup_funding_tooltip", 210);
      
      this.center = {
        x: this.width / 2 ,
        y: this.height / 2
      };
      
      this.off_screen = {
        x: this.width + 300,
        y: this.height / 2
      };
      
      this.layout_gravity = -0.01;
      this.damper = 0.1;
      this.vis = null;
      this.nodes = [];
      this.force = null;
      this.circles = null;
      this.selected = false;
      this.investorSelected = false;
      this.currentSelection = null;
      
      this.colorRange = d3.scale.linear()
        .domain(config.colorRange.domain)
        .range(config.colorRange.range)
        
      
      max_amount = d3.max(this.data, function(d) {
        return parseInt(d.amount);
      });

      
      
      this.radius_scale = d3.scale.pow().exponent(0.5).domain([0, max_amount]).range([4, 60]);
      this.create_nodes();
      this.render();
    }

    
    BubbleChart.prototype.create_nodes = function() {
      var self = this;
      
      this.data.forEach(function(d) {
          var node;
          if(parseInt(d.amount) <= 0) {
            return;
          } 
          
          node = {
            id: d.id,
            radius: self.radius_scale(parseInt(d.amount)),
            value: d.amount,
            name: d.name,
            org: d.vc_list,
            group: d.stage,
            year: d.year,
            x: Math.random() * 900,
            y: Math.random() * 800
          };
          

          return self.nodes.push(node);
      });

      return this.nodes.sort(function(a, b) {
        return b.value - a.value;
      });
    };


    BubbleChart.prototype.render = function() {
      var self = this;
      
      this.vis = d3.select(this.container).append("svg").attr("width", "100%").attr("height", this.height).attr("id", "svg_vis");
      
      this.vis.on("click", function() { 
        //self.selected = false;  
      });

      this.circles = this.vis.selectAll("circle").data(this.nodes, function(d) {
        return d.id;
      });
      
      this.circles.enter()
      .append("circle")
      .each(function (d) {
        var strokeColor = d3.rgb(self.colorRange(d.org.length)).darker(),
            fillColor = self.colorRange(d.org.length);
        
        d3.select(this).attr({
          r: 0,
          "fill": fillColor,
          "fill-opacity": 0.8,
          "stroke-width": 1,
          "stroke": strokeColor,
          "id": "bubble_" + d.id,
          "class": "bubble"

        });  

        

      })
      .on("mouseover", function(d, i) {
        if(!self.selected) {
          showBubbleDetails(self, this, d)
        }  
      })
      .on("mouseout", function(d, i) {
        if(!self.selected) {
          hideBubbleDetails(self, this, d)  
        }
      })
      .on("click", function(d, i) {
        if(!self.selected) {
          self.currentSelection = this;
          self.selected = true;
          var counter = 0
          
          d.org.forEach(function(name){
            counter = counter + 1;
            d3.select("text#vc-title-" + counter).text(name);  
            return true;
          });

          d3.selectAll(".bubble")
            .attr({ 
              "fill-opacity": 0.2,
            });
          d3.select(this).attr({ 
            "fill-opacity": 0.8,
          });

        } else {
          self.selected = false;
          d3.selectAll(".bubble").each(function(data){
            d3.select(this).attr({ 
              "fill-opacity": 0.8,
            });
          });
          
          self.hide_details(d, i, self.currentSelection);
          return self.show_details(d, i, this);
        }

      });
      
      // Total investment
      this.vis.append("text")
        .attr("x", 20)
        .attr("y",500)
        .text("$0")
        .attr("class","system-font sum")
        .attr("id", "money")
        .attr("fill", "black");  

      // Total investment
      this.vis.append("text")
        .attr("x", 900)
        .attr("y",500)
        .text("$0")
        .attr("class","system-font sum")
        .attr("id", "quantity")
        .attr("fill", "black"); 

      return this.circles.transition().duration(2000).attr("r", function(d) {
        return d.radius;
      });
    
    };
    
    function showBubbleDetails(inst, elem, data) {
      var counter = 0
      
      data.org.forEach(function(name){
        counter = counter + 1;
        d3.select("text#vc-title-" + counter).text(name);  
        return true;
      });

      d3.select(elem).attr("fill-opacity", 0.8);

      return inst.show_details(data, 1, elem);
      
    }

    function hideBubbleDetails(inst, elem, data) {
      // TODO: mark previuosly on hover elem
      d3.selectAll(".vc-lable__text")
        .each(function(data){
            d3.select(this).text("");
        });
      
      return inst.hide_details(data, 1, elem);
    }
        
    BubbleChart.prototype.charge = function(d) {
      return -Math.pow(d.radius, 2.0) / 7 ;
    };

    BubbleChart.prototype.start = function() {
      return this.force = d3.layout.force().nodes(this.nodes).size([this.width, this.height]);
    };

    BubbleChart.prototype.display_by_group = function(list) {
      var self = this;
      
      var dic =  { 
        "seed": ["Angel Round", "Seed Round"],
        "series-a": ["Series A"],
        "series-b": ["Series B", "Series C"],
        "series-d": ["Series D", "Series E", "Series F", "Series G"],
        "private": ["Private Equity"]
      }
      
      var group = [];
      
      list.forEach(function (item) {
        group = group.concat(dic[item]);
        return group;
      });

      this.force.gravity(this.layout_gravity)
        .charge(this.charge)
        .friction(0.9)
        .on("tick", function(e) {
          return self.circles
            .each(self.move_towards_target(
                e.alpha,
                function(d) { 
                  
                  
                  if(group.indexOf(d.group) >= 0){
                    return self.center;   
                  } else {
                    return self.off_screen;  
                  }
                  
                })
            )
            .attr("cx", function(d) {
              return d.x;
            })
            .attr("cy", function(d) {
              return d.y;
            });
      });

      var sum = 0;
      var count = 0;
      this.nodes.forEach( function (d) {
        
        if(group.indexOf(d.group) >= 0){
          count = count + 1;
          sum = sum + parseInt(d.value);
        } 
      });
      
      d3.select("#money").text('$' + addScale(sum));
      d3.select("#quantity").text('#' + addCommas(count));
      return this.force.start();

    };

    BubbleChart.prototype.move_towards_target = function(alpha, target) {
      var self = this;
      
      return function(d) {
          d.x = d.x + (target(d).x - d.x) * (self.damper + 0.02) * alpha * 1.1;
          return d.y = d.y + (target(d).y - d.y) * (self.damper + 0.02) * alpha * 1.1;
      };
      
    };

    BubbleChart.prototype.show_details = function(data, i, element) {
      
      var content1, content2;
      d3.select(element).attr("stroke", "black");
      content1 = data.name;
      content2 = data.group + ", $" + (addScale(data.value));
      
      d3.select("text#company-title-2").text(content2); 
      return d3.select("text#company-title-1").text(content1);  
      
    };

    BubbleChart.prototype.hide_details = function(data, i, element) {
      d3.select(element).attr("stroke", (function(_this) {
        return function(d) {
          return d3.rgb(_this.colorRange(d.org.length)).darker();
        };
      })(this));
      return this.tooltip.hideTooltip();
    };

    BubbleChart.prototype.lables_placeholder = function(json) {

      var self = this;

      // Holdes the data
      var data = json;
      var startPointY = 50;
      
      function drawTitle(vis, x, y, text) {
      
        // Title
        vis.append("text")
          .attr("x", x)
          .attr("y",y)
          .text(text)
          .attr("class","title system-font")
          .attr("fill", "black"); 
      }
       
      function companySelector(element) {
        var content = element.textContent;
        var counter = 1;
        if(!self.investorSelected) {
          self.investorSelected = true;
          d3.selectAll("circle")
            .each(function(data) {
              
              if(data.org.indexOf(content) >= 0){
                counter = counter + 1;
                d3.select(this).attr({
                  "fill-opacity": 1,
                  fill: self.fill_color(d.org.length)
                });
                self.show_details(data, counter, this);
              }
            });
        } else {
          
          self.investorSelected = false;
          d3.selectAll("circle")
            .each(function(data) {
              
              if(data.org.indexOf(content) >= 0){
                d3.select(this).attr({
                  "fill-opacity": 0.2,
                  fill: self.fill_color(d.org.length)
                });

              }
            });
        }  
      } 

      function generatelablesContainer(vis, data, css, itemId, x, y, clickExecutor) {
        
        var lablesContainer = vis
                        .selectAll("g." + css)
                        .data(data, function(d) {
                          return d.id;
                        })
                        .enter().append("g")
                        .attr("class",css);
        
        var currentY = y + 10,
            counter = 0;
        
        /*lablesContainer.append("title")
            .text(function(d) { return d.name; });*/

        
        lablesContainer.append("text")
            .attr("x", x)
            .each(function (d){
                counter = counter + 1;
                title_class_pos = "odd";
                if( counter % 2  == 0) {
                  title_class_pos = "even";
                }
                var tempY = currentY;
                currentY= currentY + 32;
                
                d3.select(this).attr({
                    y: currentY,
                    "class":  css + "__text" + " " + title_class_pos,
                    id: itemId + counter
                }).text("");    
            })
            .on("click", function(d, i){
              
              if(clickExecutor !== 'undefined') {
                clickExecutor(this);  
              }
            });  
      }

      drawTitle(this.vis, 20, startPointY, "INVESTORS:");
      drawTitle(this.vis, 795, startPointY, "COMPANY:");
      generatelablesContainer(this.vis, data, "vc-lable","vc-title-", 25, startPointY);
      generatelablesContainer(this.vis, [{ id: 1},{ id:2 }], "company-lable","company-title-", 800, startPointY);
      
    }
    
    return BubbleChart;

  })();
  
  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  

  $(function() {
    var chart, render_vis, render_lbl;
    var active_groups = ["seed", "series-a", "series-b", "series-d", "private"];
    var inactive_groups = [];
    chart = null;
    
    
    

    render_vis = function (data) {
      config = { 
        width: 1040,
        height: 600,
        colorRange: {
          domain: [2, 4, 6, 8, 10],
          //range: ["#143642", "#558C8C", "#F7941D", "#A8201A"]
          range: ["#6CD4FF", "#143642", "#BF4E30", "#A8201A", "#DB2A20"]
          //range: ["#88A8A8", "#163E4C", "#AF6F2a", ]
        }
      };
      chart = new BubbleChart("#viz", data, config);
      
      chart.start();
      return chart.display_by_group(active_groups);
    };

    render_lable = function(json) {
      return chart.lables_placeholder(json);
    }
    root.display_group = (function(_this) {
      return function(list) {
        return chart.display_by_group(list);
      };
    })(this);
    
    root.toggle_view = (function(_this) {
      return function(view_type) {
        var active_pos = active_groups.indexOf(view_type)
        
        if (active_pos >= 0) {
          inactive_groups.push(view_type);
          active_groups.splice(active_pos, 1);
        } else {
          inactive_groups.splice(inactive_groups.indexOf(view_type), 1);
          active_groups.push(view_type);  
        }

        return root.display_group(active_groups);
        
      };
    })(this);

    // Render visualisation
    //var v = d3.csv("data/test.csv", render_vis);
    var v = d3.json("data/funding.json", function(data) {

      render_vis(data);
      // Render label
      d3.json("data/labels.json", function(data) {
        render_lable(data);
      });

    });
    
    


    return v;
  });

}).call(this);
