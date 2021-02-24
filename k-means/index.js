class KMeans {

    groups = [];
    dots = [];
    clusterNumber = 0; // K
    entriesNumber = 0; // N

    deviation_cluster = document.getElementById("deviation_cluster").value;
    average_x = 0;
    average_y = 0;
    flag = false;
    WIDTH = 0;
    HEIGHT = 0;
    svg = null;
    lineg;
    dotg;
    centerg;

    constructor(circleNumber, clusterNumber){
        this.initArea();
        this.init(circleNumber, clusterNumber);
        this.draw();
    }

    initArea(){
        const that = this;
        this.flag = false;
        this.WIDTH = d3.select("#kmeans")[0][0].clientWidth;
        this.HEIGHT = Math.max(300, this.WIDTH * .6);
        this.svg = d3.select("#kmeans svg")
            .attr('width', this.WIDTH)
            .attr('height', this.HEIGHT)
            .style('padding', '10px')
            .style('background', 'black')
            .style('cursor', 'pointer')
            .on('click', function() {
                d3.event.preventDefault();
                that.step();
            });

        this.lineg = this.svg.append('g');
        this.dotg = this.svg.append('g');
        this.centerg = this.svg.append('g');
    }

    init(circleNumber, clusterNumber) {
        this.clusterNumber = circleNumber;
        this.entriesNumber = clusterNumber;

        this.initGroups();
        this.initDots();
        this.normalizationDots();
        this.normalizationGroups();
    }

    initGroups(){
        this.groups = [];
        for (let i = 0; i < this.clusterNumber; i++) {
            let g = {
                id: 'group_'+i,
                dots: [],
                color: 'hsl(' + (i * 360 / this.clusterNumber) + ',100%,50%)',
                center: {
                    x: Math.random() * this.WIDTH,
                    y: Math.random() * this.HEIGHT
                },
                init: {
                    center: {}
                }
            };
            g.init.center = {
                x: g.center.x,
                y: g.center.y
            };
            this.groups.push(g);

        }
        console.log('groups: ', this.groups);
    }

    initDots(){
        this.dots = [];
        this.flag = false;
        for (let i = 0; i < this.entriesNumber; i++) {
            let dot ={
                x: Math.random() * this.WIDTH,
                y: Math.random() * this.HEIGHT,
                group: undefined
            };
            dot.init = {
                x: dot.x,
                y: dot.y,
                group: dot.group
            };
            this.average_x+=dot.x;
            this.average_y+=dot.y;
            this.dots.push(dot);
        }
        this.average_x /= this.dots.length;
        this.average_y /= this.dots.length;
        console.log('dots: ', this.dots);
    }

    normalizationGroups(){
        for(let i =0;i< this.groups.length;i++) {
            this.groups[i].normalization_x = (this.groups[i].center.x-this.average_x)/this.deviation_cluster;
            this.groups[i].normalization_y = (this.groups[i].center.y-this.average_y)/this.deviation_cluster;
        }
    }

    normalizationDots(){
        for(let i =0;i< this.dots.length;i++) {
            this.dots[i].normalization_x = (this.dots[i].x-this.average_x)/this.deviation_cluster;
            this.dots[i].normalization_y = (this.dots[i].y-this.average_y)/this.deviation_cluster;
        }
    }

    step() {
        if (this.flag) {
            this.moveCenter();
        } else {
            this.updateGroups();
        }
        this.draw();
        this.flag = !this.flag;
    }

    draw() {
        this.drawCircles();

        if (this.dots[0].group) {
            //lines array from dots to centers
            this.drawLines();
        } else {
            this.lineg.selectAll('line').remove();
        }

        let c = this.centerg.selectAll('path').data(this.groups);
        let updateCenters = function(centers) {
            centers
                .attr('transform', function(d) { return "translate(" + d.center.x + "," + d.center.y + ") rotate(45)";})
                .attr('fill', function(d,i) { return d.color; })
                .attr('stroke', '#aabbcc');
        };
        c.exit().remove();
        updateCenters(c.enter()
            .append('path')
            .attr('d', d3.svg.symbol().type('cross'))
            .attr('stroke', '#aabbcc'));
        updateCenters(c
            .transition()
            .duration(500));
    }

    drawCircles(){
        let circles = this.dotg.selectAll('circle').data(this.dots);
        circles.enter().append('circle');
        circles.exit().remove();
        circles
            .transition()
            .duration(1000)
            .attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; })
            .attr('fill', function(d) { return d.group ? d.group.color : '#ffffff'; })
            .attr('r', 10);
    }

    drawLines(){
        let l = this.lineg.selectAll('line').data(this.dots);
        let updateLine = function(lines) {

            lines
                .attr('x1', function(d) { return d.x; })
                .attr('y1', function(d) { return d.y; })
                .attr('x2', function(d) { return d.group.center.x; })
                .attr('y2', function(d) { return d.group.center.y; })
                .attr('stroke', function(d) { return d.group.color; });
        };
        (l.enter().append('line'));
        updateLine(l.transition().duration(500));
        l.exit().remove();
    }

    moveCenter() {
        let finished = false;

        this.groups.forEach(function(group, i) {

            finished = true;

            if (group.dots.length == 0) return;

            // get center of gravity
            let x = 0, y = 0;
            group.dots.forEach(function(dot) {
                x += dot.x;
                y += dot.y;
            });

            let oldPos = {x: group.center.x, y: group.center.y};

            group.center = {
                x: x / group.dots.length,
                y: y / group.dots.length
            };
            let newPos = {x: group.center.x, y: group.center.y};

            if (oldPos.x !== newPos.x || oldPos.y !== newPos.y) finished = false;
        });
        this.normalizationGroups();
        if (finished){
            console.log('Algorithm is finished');
            console.log('groups', this.groups);
            console.log('dots', this.dots);
        }
    }

    updateGroups() {
        const that = this;
        this.groups.forEach(function(g) { g.dots = []; });
        this.dots.forEach(function(dot) {
            // find the nearest group
            let min = Infinity;
            let groupN={};
            groupN.dots=[];
            that.groups.forEach(function(g) {
                let d = Math.pow(g.normalization_x - dot.normalization_x, 2) + Math.pow(g.normalization_y - dot.normalization_y, 2);
                if (d < min) {
                    min = d;
                    groupN = g;
                }
            });
            // update group
            groupN.dots.push(dot);
            dot.group = groupN;
        });
    }
}

function start(){
    let count_dots = document.getElementById('count_dots').value;
    let count_cluster = document.getElementById('count_cluster').value;
    let block  =document.getElementById('block');
    block.innerHTML = "";
    let kmeansInstance = new KMeans(count_cluster, count_dots);
}




