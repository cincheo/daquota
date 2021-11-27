Vue.component('time-series-chart-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="$eval(viewModel.class)">
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <canvas :id="'chart-' + cid" :style="'min-height: 15em;' + $eval(viewModel.style)"></canvas>
        </div>
    `,
    data: function() {
        return {
            chart: undefined
        }
    },
    watch: {
        'viewModel': {
            handler: function () {
                this.buildChart();
            },
            deep: true
        },
        'dataModel': {
            handler: function () {
                this.updateChart();
            },
            deep: true
        }
    },
    created() {
        this.$eventHub.$on('screen-resized', () => {
            if (this.chart) {
                this.chart.resize();
            }
            this.buildChart();
        });
        this.$eventHub.$on('edit', (event) => {
            setTimeout(() => {
                if (this.chart) {
                    this.chart.resize();
                }
                this.buildChart();
                // if (this.chart) {
                //     this.chart.resize();
                // }
                // this.update();
            }, 100);
        });
        this.$eventHub.$on('style-changed', () => this.buildChart());
    },
    mounted() {
        this.buildChart();
    },
    methods: {
        updateChart() {
            console.info("updating chart...");
            if (!this.chart) {
                this.buildChart();
            } else {
                for (let i = 0; i < this.viewModel.timeSeriesList.length; i ++) {
                    let timeSeries = this.viewModel.timeSeriesList[i];
                    this.chart.config.data.datasets[i].data = this.dataModel ? this.dataModel.map(d => { return { x: d.x, y: d[timeSeries.key] } } ) : undefined;
                }
                this.chart.update();
            }
        },
        buildChart() {
            console.info("building chart...");
            try {

                Chart.defaults.borderColor = ide.isDarkMode() ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                Chart.defaults.color = ide.isDarkMode() ? '#eee' : '#666';
                console.info("chart color: " + Chart.defaults.borderColor);
                //let chart = Chart.getChart('chart-' + this.viewModel.cid);
                // if (chart) {
                //     chart.destroy();
                // }
                this.width = document.getElementById(this.cid).getBoundingClientRect().width;
                this.height = document.getElementById(this.cid).getBoundingClientRect().height;
                if (this.chart) {
                    this.chart.destroy();
                    this.chart = undefined;
                    this.$forceUpdate();
                }
                let ctx = document.getElementById('chart-' + this.viewModel.cid).getContext('2d');
                let datasets = [];
                for (let timeSeries of this.viewModel.timeSeriesList) {
                    datasets.push({
                        label: this.$eval(timeSeries.label),
                        data: this.dataModel ? this.dataModel.map(d => { return { x: d.x, y: d[timeSeries.key] } } ) : undefined,
                        backgroundColor: timeSeries.backgroundColor,
                        borderColor: timeSeries.borderColor,
                        borderWidth: timeSeries.borderWidth
                    });
                }
                this.chart = new Chart(ctx, ((options) => {
                    if (!this.viewModel.animation) {
                        options.options.animation = false;
                    }
                    console.info("chart conf", options);
                    return options;
                })({
                    type: this.viewModel.chartType,
                    data: {
                        //labels: [data[0].x, data[data.length - 1].x], // this.$eval(this.viewModel.labels, null),
                        datasets: datasets
                    },
                    options:
                        {
                            responsive: false,
                            maintainAspectRatio: true,
                            aspectRatio: this.viewModel.aspectRatio ? this.$eval(this.viewModel.aspectRatio) : 2,
                            onResize: function(chart, size) {
                                console.info("resize", chart, size);
                            },
                            title:      {
                                display: this.$eval(this.viewModel.title),
                                text:    this.$eval(this.viewModel.title),
                                fontColor: Chart.defaults.color,
                            },
                            legend: {
                                labels: {
                                    fontColor: Chart.defaults.color
                                    //fontSize: 18
                                }
                            },
                            scales:     {
                                xAxes: [{
                                    gridLines: {
                                        color: Chart.defaults.borderColor
                                    },
                                    ticks: {
                                        fontColor: Chart.defaults.color
                                    },
                                    type:       "time",
                                    time:       {
                                        //format: timeFormat,
                                        tooltipFormat: 'll'
                                    },
                                    scaleLabel: {
                                        display:     true,
                                        labelString: 'Date',
                                        fontColor: Chart.defaults.color
                                    }
                                }],
                                yAxes: [{
                                    gridLines: {
                                        color: Chart.defaults.borderColor
                                    },
                                    ticks: {
                                        fontColor: Chart.defaults.color
                                    },
                                    stacked: this.$eval(this.viewModel.stacked),
                                    scaleLabel: {
                                        display:     true,
                                        labelString: 'value',
                                        fontColor: Chart.defaults.color
                                    }
                                }]
                            }
                        }
//                        JSON.parse(JSON.stringify(this.viewModel.options))
                }));
                this.chart.resize();
            } catch (e) {
                console.error("error building chart", e);
            }
        },
        propNames() {
            return ["cid", "aspectRatio", "dataSource", "title", "chartType", "stacked", "timeSeriesList", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                aspectRatio: {
                    type: 'number',
                    min: 0.1,
                    max: 10,
                    step: 0.1,
                    category: 'style'
                },
                chartType: {
                    type: 'select',
                    editable: true,
                    options: ["line", "bar", "scatter"]
                },
                animation: {
                    type: 'checkbox',
                    editable: true
                },
                timeSeriesList: {
                    type: 'custom',
                    label: 'Time series',
                    editable: true,
                    editor: 'time-series-panel'
                },
                stacked: {
                    type: 'checkbox',
                    editable: true
                }
            }
        }

    }
});
