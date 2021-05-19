Vue.component('chart-view', {
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
                this.updateChart();
            },
            deep: true
        }
    },
    mounted() {
        this.buildChart();
    },
    methods: {
        updateChart() {
            if (!this.chart) {
                this.buildChart();
            } else {
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
                if (this.chart) {
                    this.chart = undefined;
                    this.$forceUpdate();
                }
                let ctx = document.getElementById('chart-' + this.viewModel.cid).getContext('2d');
                let data = this.$eval(this.viewModel.defaultData).slice(0, 50);
                //var timeFormat = 'DD/MM/YYYY';
                //console.info("DATA: ", data);
                this.chart = new Chart(ctx, {
                    type: this.viewModel.chartType,
                    data: {
                        //labels: [data[0].x, data[data.length - 1].x], // this.$eval(this.viewModel.labels, null),
                        datasets: [{
                            label: this.$eval(this.viewModel.label, null),
                            data: data,
                            backgroundColor: this.$eval(this.viewModel.backgroundColor, 'white'),
                            borderColor: this.$eval(this.viewModel.borderColor, 'black'),
                            borderWidth: this.$eval(this.viewModel.borderWidth, '1')
                        }]
                    },
                    // {
                    //     "scales": {
                    //         "y": {
                    //             "beginAtZero": true
                    //         }
                    //     }
                    // }
                    options:
                        {
                            responsive: true,
                            title:      {
                                display: true,
                                text:    "Chart.js Time Scale"
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
            return ["cid", "defaultData", "dataSource", "class", "label", "labels", "chartType", "backgroundColor", "borderColor", "borderWidth", "options", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                chartType: {
                    type: 'select',
                    editable: true,
                    options: ["line", "bar", "radar", "doughnut", "pie", "polarArea", "bubble", "scatter"]
                },
                backgroundColor: {
                    type: 'text',
                    editable: true
                },
                borderColor: {
                    type: 'text',
                    editable: true
                },
                borderWidth: {
                    type: 'text',
                    editable: true
                },
                options: {
                    type: 'data',
                    label: 'Options',
                    editable: true
                },
                defaultData: {
                    label: "Data array",
                    type: 'textarea',
                    editable: true
                }
            }
        }

    }
});
