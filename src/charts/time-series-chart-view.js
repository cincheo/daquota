/*
 * d.Lite - low-code platform for local-first Web/Mobile development
 * Copyright (C) 2022 CINCHEO
 *                    https://www.cincheo.com
 *                    renaud.pawlak@cincheo.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

Vue.component('time-series-chart-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :class="$eval(viewModel.class)" :style="componentBorderStyle() + 'position: relative; '+$eval(viewModel.style)">
            <component-badge v-if="edit" :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
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
                if (this.viewModel.timeSeriesList) {
                    for (let i = 0; i < this.viewModel.timeSeriesList.length; i++) {
                        let timeSeries = this.viewModel.timeSeriesList[i];
                        this.chart.config.data.datasets[i].data = this.dataModel ? this.dataModel.map(d => {
                            return {x: d.x, y: d[timeSeries.key]}
                        }) : undefined;
                    }
                    this.chart.update();
                } else {
                    this.buildChart();
                }
            }
        },
        buildChart() {
            console.info("building chart...");
            try {

                if (!this.viewModel.chartType) {
                    this.viewModel.chartType = 'line';
                }

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

                let type = 'INVALID';
                if (this.dataModel) {
                    if (Array.isArray(this.dataModel) && this.dataModel.length > 0) {
                        type = 'AUTO_SERIES';
                    }
                }

                if (this.viewModel.timeSeriesList && this.viewModel.timeSeriesList.length > 0) {
                    type = 'USER_DEFINED_SERIES';
                }

                if (type === "USER_DEFINED_SERIES") {
                    for (let timeSeries of this.viewModel.timeSeriesList) {
                        datasets.push({
                            label: this.$eval(timeSeries.label),
                            data: this.dataModel ? this.dataModel.map(d => {
                                return {x: d.x, y: d[timeSeries.key]}
                            }) : undefined,
                            backgroundColor: timeSeries.backgroundColor,
                            borderColor: timeSeries.borderColor,
                            borderWidth: timeSeries.borderWidth
                        });
                    }
                } else {
                    let data = this.dataModel;
                    if (Array.isArray(data) && data.length > 0) {
                        let keys = Object.keys(data[0]);
                        console.info("build chart", keys);
                        if (!moment(data[0][keys[0]]).isValid()) {
                            console.error("In time series, first data in objects should be a valid date/time");
                        } else {
                            for (let i = 1; i < keys.length; i++) {
                                console.info("build chart - val", data[0][keys[i]], data.map(d => d[keys[i]]));
                                if (isNaN(data[0][keys[i]])) {
                                    continue;
                                }
                                datasets.push({
                                    label: keys[i],
                                    data: data ? data.map(d => ({x: d[keys[0]], y: d[keys[i]]})) : undefined,
                                    backgroundColor:
                                        $tools.defaultColor(i - 1, this.$eval(this.viewModel.backgroundOpacity)),
                                    borderColor:
                                        $tools.defaultColor(i - 1),
                                    borderWidth: 2
                                });
                            }
                        }
                    }
                }

                this.chart = new Chart(ctx, ((options) => {
                    if (!this.viewModel.animation) {
                        options.options.animation = false;
                    }
                    console.info("chart conf", JSON.stringify(options, null, 2));
                    return options;
                })({
                    type: this.viewModel.chartType,
                    data: {
                        //labels: [data[0].x, data[data.length - 1].x], // this.$eval(this.viewModel.labels, null),
                        datasets: datasets
                    },
                    options:
                        {
                            responsive: !!this.viewModel.fillHeight,
                            maintainAspectRatio: !!this.$eval(this.viewModel.aspectRatio, null),
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
                            scales: {
                                x: {
                                    gridLines: {
                                        color: Chart.defaults.borderColor
                                    },
                                    ticks: {
                                        fontColor: Chart.defaults.color
                                    },
                                    type: "time",
                                    time: {
                                        unit: this.$eval(this.viewModel.unit),
                                        //format: timeFormat,
                                        tooltipFormat: 'll'
                                    },
                                    scaleLabel: {
                                        display:     true,
                                        labelString: 'Date',
                                        fontColor: Chart.defaults.color
                                    }
                                },
                                y: {
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
                                }
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
            return [
                "cid",
                "fillHeight",
                "aspectRatio",
                "dataSource",
                "title",
                "chartType",
                "unit",
                "stacked",
                "timeSeriesList",
                "eventHandlers"
            ];
        },
        customPropDescriptors() {
            return {
                aspectRatio: {
                    type: 'range',
                    min: 0.1,
                    max: 10,
                    step: 0.1,
                    category: 'style'
                },
                fillHeight: {
                    type: 'checkbox',
                    description: "Stretch vertically to fill the parent component height",
                    literalOnly: true,
                    category: 'style'
                },
                chartType: {
                    type: 'select',
                    editable: true,
                    options: ["line", "bar", "scatter"]
                },
                unit: {
                    type: 'select',
                    editable: true,
                    options: [
                        'millisecond',
                        'second',
                        'minute',
                        'hour',
                        'day',
                        'week',
                        'month',
                        'quarter',
                        'year'
                    ]
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
