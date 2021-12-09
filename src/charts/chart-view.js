Vue.component('chart-view', {
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
                // TODO: smarter update...
                this.buildChart();
            }
        },
        seriesCount() {
            if (!this.viewModel) {
                return 0;
            }
            if (this.viewModel.seriesList && this.viewModel.seriesList.length > 0) {
                return this.viewModel.seriesList.length;
            } else {
                if (this.dataModel && this.dataModel.length > 0) {
                    return Object.keys(this.dataModel[0]).length - 1;
                }
            }
            return 0;
        },
        isCategorical() {
            if (!this.viewModel) {
                return false;
            }
            switch (this.$eval(this.viewModel.chartType)) {
                case "bar":
                    return this.seriesCount() < 2;
                case "doughnut":
                case "pie":
                case "polarArea":
                    return true;
                default:
                    return false;
            }
        },
        buildChart() {
            console.info("building chart...");
            try {
                Chart.defaults.borderColor = ide.isDarkMode() ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                Chart.defaults.color = ide.isDarkMode() ? '#eee' : '#666';
                console.info("chart color: " + Chart.defaults.borderColor);
                this.width = document.getElementById(this.cid).getBoundingClientRect().width;
                this.height = document.getElementById(this.cid).getBoundingClientRect().height;
                if (this.chart) {
                    this.chart.destroy();
                    this.chart = undefined;
                    this.$forceUpdate();
                }
                let ctx = document.getElementById('chart-' + this.viewModel.cid).getContext('2d');
                let labels = this.$eval(this.viewModel.labels);
                if (labels == null && this.dataModel && this.dataModel.length > 1) {
                    // default initialisation (when labels are not user-defined)
                    // if (this.isCategorical()) {
                    //     labels = undefined;
                    //     // let labelKey = Object.keys(this.dataModel[0])[0];
                    //     // for (let d of this.dataModel) {
                    //     //     labels.push(this.dataModel[labelKey]);
                    //     // }
                    // } else {
                        let labelKey = Object.keys(this.dataModel[0])[0];
                        labels = this.dataModel.map(d => d[labelKey]);
                    // }
                }
                let datasets = [];
                if (this.viewModel.seriesList && this.viewModel.seriesList.length > 0) {
                    for (let series of this.viewModel.seriesList) {
                        datasets.push({
                            label: this.$eval(series.label),
                            data: this.dataModel ? this.dataModel.map(d => d[series.key]) : undefined,
                            backgroundColor: series.backgroundColor,
                            borderColor: series.borderColor,
                            borderWidth: series.borderWidth
                        });
                    }
                } else {
                    // default initialisation (when series are not user-defined)
                    if (this.dataModel && this.dataModel.length > 0) {
                        let keys = Object.keys(this.dataModel[0]);
                        for (let i = 1; i < keys.length; i++) {
                            if (isNaN(this.dataModel[0][keys[i]])) {
                                continue;
                            }
                            datasets.push({
                                label: keys[i],
                                data: this.dataModel ? this.dataModel.map(d => d[keys[i]]) : undefined,
                                backgroundColor: this.isCategorical() ?
                                    $tools.range(0, this.dataModel.length).map(i => $tools.defaultColor(i, this.$eval(this.viewModel.backgroundOpacity))) :
                                    $tools.defaultColor(i-1, this.$eval(this.viewModel.backgroundOpacity)),
                                borderColor: this.isCategorical() ?
                                    $tools.range(0, this.dataModel.length).map(i => $tools.defaultColor(i)) :
                                    $tools.defaultColor(i-1),
                                borderWidth: 2
                            });
                        }
                    }
                }
                let chartOptions = {
                    type: this.$eval(this.viewModel.chartType),
                    data: {
                        labels: labels,
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
                                    //type:       "time",
                                    time:       {
                                        //format: timeFormat,
                                        tooltipFormat: 'll'
                                    },
                                    stacked: this.$eval(this.viewModel.stacked),
                                    scaleLabel: {
                                        display:     true,
                                        //labelString: 'Date',
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
                };
                console.info("chart options", JSON.stringify(chartOptions, null, 2));

                this.chart = new Chart(ctx, ((options) => {
                    if (!this.$eval(this.viewModel.animation)) {
                        options.options.animation = false;
                    }
                    console.info("chart conf", options);
                    return options;
                })(chartOptions));
                this.chart.resize();
            } catch (e) {
                console.error("error building chart", e);
            }
        },
        propNames() {
            return ["cid", "backgroundOpacity", "aspectRatio", "dataSource", "title", "chartType", "stacked", "labels", "seriesList", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                backgroundOpacity: {
                    type: 'range',
                    min: 0,
                    max: 100,
                    defaultValue: 100,
                    category: 'style'
                },
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
                    options: ["line", "bar", "radar", "doughnut", "pie", "polarArea"/*, "bubble", "scatter"*/]
                },
                animation: {
                    type: 'checkbox',
                    editable: true
                },
                seriesList: {
                    type: 'custom',
                    label: 'Series',
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
