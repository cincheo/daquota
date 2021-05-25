Vue.component('time-series-chart-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.class">
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <canvas :id="'chart-' + cid" style="min-height: 15em"></canvas>
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
        window.addEventListener('resize', () => {
            if (this.chart) {
                this.chart.resize();
            }
        });
        this.$eventHub.$on('edit', (event) => {
            setTimeout(() => {
                if (this.chart) {
                    this.chart.resize();
                }
            }, 100);
        });
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
                        label: timeSeries.label,
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
                            aspectRatio: this.viewModel.aspectRatio ? this.viewModel.aspectRatio : 2,
                            onResize: function(chart, size) {
                                console.info("resize", chart, size);
                            },
                            title:      {
                                display: this.$eval(this.viewModel.title),
                                text:    this.$eval(this.viewModel.title)
                            },
                            scales:     {
                                xAxes: [{
                                    type:       "time",
                                    time:       {
                                        //format: timeFormat,
                                        tooltipFormat: 'll'
                                    },
                                    scaleLabel: {
                                        display:     true,
                                        labelString: 'Date'
                                    }
                                }],
                                yAxes: [{
                                    stacked: this.$eval(this.viewModel.stacked),
                                    scaleLabel: {
                                        display:     true,
                                        labelString: 'value'
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
            return ["cid", "dataSource", "class", "title", "chartType", "stacked", "animation", "aspectRatio", "timeSeriesList", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
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
