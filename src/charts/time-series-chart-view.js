Vue.component('time-series-chart-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.class">
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <canvas :id="'chart-' + cid"></canvas>
        </div>
    `,
    props: ['width', 'height'],
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
                this.buildChart();
            },
            deep: true
        }
    },
    mounted() {
        this.buildChart();
    },
    methods: {
        buildChart() {
            console.info("building chart...");

            try {

                //let chart = Chart.getChart('chart-' + this.viewModel.cid);
                // if (chart) {
                //     chart.destroy();
                // }
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
                this.chart = new Chart(ctx, {
                    type: this.viewModel.chartType,
                    data: {
                        //labels: [data[0].x, data[data.length - 1].x], // this.$eval(this.viewModel.labels, null),
                        datasets: datasets
                    },
                    options:
                        {
                            responsive: true,
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
                });
            } catch (e) {
                console.error("error building chart", e);
            }
        },
        propNames() {
            return ["cid", "dataSource", "class", "title", "chartType", "stacked", "timeSeriesList", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                chartType: {
                    type: 'select',
                    editable: true,
                    options: ["line", "bar", "scatter"]
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
