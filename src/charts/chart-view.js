/*
 * d.Lite - low-code platform for local-first Web/Mobile development
 * Copyright (C) 2021-2023 CINCHEO
 *                         https://www.cincheo.com
 *                         renaud.pawlak@cincheo.com
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

const chartMixin = {
    name: "chartMixin",
    watch: {
        'viewModel': {
            handler: function () {
                this.buildChart();
            },
            deep: true
        },
        'value': {
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
    methods: {
        backgroundOpacityHex() {
            if (this.viewModel.backgroundOpacity) {
                const opacity = this.$eval(this.viewModel.backgroundOpacity);
                return Number((opacity * 255 / 100) | 0).toString(16).padStart(2, '0');
            } else {
                return '';
            }
        },
        findClosestDataset(x, y) {
            for (let i = 0; i < this.chart.data.datasets.length; i++) {
                if (Math.abs(y - this.chart.data.datasets[i].data[x])
                    < 0.05 * (this.chart.scales.y.max - this.chart.scales.y.min)
                ) {
                    return i;
                }
            }
            return undefined;
        },
        allowResponsive() {
            let allowResponsive = !!this.viewModel.fillHeight;
            if (allowResponsive) {
                allowResponsive = components.findPathToRoot(this.viewModel.cid)
                    .map(cid => components.getComponentModel(cid))
                    .every(viewModel => viewModel.fillHeight);
            }
            return allowResponsive;
        },
        applyCommonOptions(chartOptions) {
            let seriesProp = 'seriesList';
            if (this.viewModel.type === 'TimeSeriesChartView') {
                seriesProp = 'timeSeriesList';
            }

            if (this.viewModel['seriesProp'] === undefined || this.viewModel['seriesProp'].length === 0) {
                if (!chartOptions.data.labels) {
                    let labels = this.$eval(this.viewModel.labels);
                    if (labels && !Array.isArray(labels)) {
                        labels = labels.split(',');
                    }
                    chartOptions.data.labels = labels;
                }

                const colorProps = ['backgroundColor', 'borderColor'];

                colorProps.forEach(colorProp => {
                    if (this.viewModel[colorProp + 's']) {
                        let color = this.$eval(this.viewModel[colorProp + 's']);
                        if (chartOptions.data.datasets.length === 1) {
                            if (colorProp === 'backgroundColor' && this.$eval(this.viewModel.backgroundOpacity)) {
                                color = $tools.colorNameToHex(color) + this.backgroundOpacityHex();
                            }
                            chartOptions.data.datasets[0][colorProp] = color;
                        } else {
                            for (let i = 0; i < chartOptions.data.datasets.length; i++) {
                                if (chartOptions.data.datasets[i]) {
                                    let c = Array.isArray(color) ? color[i] : color;
                                    if (colorProp === 'backgroundColor' && this.$eval(this.viewModel.backgroundOpacity)) {
                                        c = $tools.colorNameToHex(c) + this.backgroundOpacityHex();
                                    }
                                    chartOptions.data.datasets[i][colorProp] = c;
                                }
                            }
                        }
                    }
                });
            }

            if (this.viewModel.hideLegend) {
                chartOptions.options.plugins = chartOptions.options.plugins || {};
                chartOptions.options.plugins.legend = chartOptions.options.plugins.legend || {};
                chartOptions.options.plugins.legend.display = !this.$eval(this.viewModel.hideLegend);
            }

            if (this.viewModel.optionsAdapter) {
                eval(this.viewModel.optionsAdapter);
            }

            if (this.$eval(this.viewModel.invertAxes)) {
                chartOptions.options.indexAxis = 'y';
            }

            if (this.viewModel.minY) {
                if (this.viewModel.suggestedMinY) {
                    chartOptions.options.scales.y.suggestedMin = this.$evalCode(this.viewModel.minY);
                } else {
                    chartOptions.options.scales.y.min = this.$evalCode(this.viewModel.minY);
                }
            }
            if (this.viewModel.maxY) {
                if (this.viewModel.suggestedMaxY) {
                    chartOptions.options.scales.y.suggestedMax = this.$evalCode(this.viewModel.maxY);
                } else {
                    chartOptions.options.scales.y.max = this.$evalCode(this.viewModel.maxY);
                }
            }

            if (this.viewModel.hideGridX) {
                chartOptions.options.scales.x.grid = {display: false};
            }

            if (this.viewModel.hideGridY) {
                chartOptions.options.scales.y.grid = {display: false};
            }

            if (this.viewModel.interactiveEdits) {
                chartOptions.options.events = ['drag', 'mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'];
                chartOptions.options.onHover = (e) => {
                    if (e.type === 'mousemove') {
                        if (e.native.buttons === 1) {
                            const canvasPosition = Chart.helpers.getRelativePosition(e, this.chart);
                            this._dataX = this.chart.scales.x.getValueForPixel(canvasPosition.x);
                            this._dataY = this.chart.scales.y.getValueForPixel(canvasPosition.y);
                            console.info('scaley', this.chart.scales.y);
                            if (this._draggedDataset === undefined) {
                                this._draggedDataset = this.findClosestDataset(this._dataX, this._dataY);
                            }

                            if (this._draggedDataset !== undefined) {
                                this.chart.data.datasets[this._draggedDataset].data[this._dataX] = this._dataY;
                                this.chart.update();
                            }
                        }
                    }
                };
                chartOptions.options.onClick = (e) => {
                    if (this._draggedDataset !== undefined) {
                        const field = Object.keys(this.value[this._dataX])[this._draggedDataset + 1];
                        this.value[this._dataX][field] = this._dataY;
                        this._draggedDataset = undefined;
                    }
                };
            }

        }
    }
}

Vue.component('chart-view', {
    extends: editableComponent,
    mixins: [chartMixin],
    template: `
        <div :id="cid" :class="componentClass()" :style="'position: relative; '+$eval(viewModel.style)">
            <component-badge v-if="edit" :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <canvas :id="'chart-' + cid + '-' + _uid" v-on="boundEventHandlers({'click': onClick})"></canvas>
        </div>
    `,
    data: function () {
        return {
            chart: undefined
        }
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
                if (this.value && this.value.length > 0) {
                    return Object.keys(this.value[0]).length - 1;
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
            const build = () => {
                if (this.value == null) {
                    return;
                }
                console.info("building chart...");
                try {

                    if (!this.viewModel.chartType) {
                        this.viewModel.chartType = 'line';
                    }

                    let chartType = this.$eval(this.viewModel.chartType);

                    Chart.defaults.borderColor = ide.isDarkMode() ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                    Chart.defaults.color = ide.isDarkMode() ? '#eee' : '#666';
                    if (this.chart) {
                        this.chart.destroy();
                        this.chart = undefined;
                        this.$forceUpdate();
                    }
                    let ctx = document.getElementById('chart-' + this.cid + '-' + this._uid).getContext('2d');
                    let labels = this.$eval(this.viewModel.labels);
                    let type = 'INVALID';
                    if (labels && !Array.isArray(labels)) {
                        labels = labels.split(',');
                    }
                    let subObjectKeys;
                    let firstSeriesKeyIndex = 0;
                    if (this.value) {
                        if (Array.isArray(this.value) && this.value.length > 0) {
                            let labelKey = Object.keys(this.value[0])[firstSeriesKeyIndex++];

                            while (chartType === 'scatter' && typeof this.value[0][labelKey] === 'string') {
                                labelKey = Object.keys(this.value[0])[firstSeriesKeyIndex++];
                            }

                            if (!labels) {
                                labels = this.value.map(d => d[labelKey]);
                            }
                            type = 'AUTO_SERIES';
                        } else {
                            type = 'AUTO_OBJECT';
                            if (this.value.datasets) {
                                type = 'CHART_JS';
                            } else {
                                for (const label of Object.keys(this.value)) {
                                    if (typeof this.value[label] === 'object') {
                                        type = 'AUTO_OBJECT_MULTIPLE';
                                        if (subObjectKeys) {
                                            if (JSON.stringify(subObjectKeys) !== JSON.stringify(Object.keys(this.value[label]))) {
                                                type = 'INVALID';
                                                break;
                                            }
                                        }
                                        subObjectKeys = Object.keys(this.value[label]);
                                    } else {
                                        if (type === 'AUTO_OBJECT_MULTIPLE') {
                                            type = 'INVALID';
                                            break;
                                        }
                                    }
                                }
                                if (!labels) {
                                    switch (type) {
                                        case 'AUTO_OBJECT_MULTIPLE':
                                            labels = subObjectKeys;
                                            break;
                                        case 'AUTO_OBJECT':
                                            labels = Object.keys(this.value);
                                    }
                                }
                            }
                        }
                    }

                    if (this.viewModel.seriesList && this.viewModel.seriesList.length > 0) {
                        type = 'USER_DEFINED_SERIES';
                    }

                    if (type === 'INVALID') {
                        console.error('invalid chart data / labels', labels, this.value);
                        return;
                    }

                    let datasets = [];
                    if (type === 'USER_DEFINED_SERIES') {
                        for (let series of this.viewModel.seriesList) {
                            if (Array.isArray(this.value)) {
                                datasets.push({
                                    label: this.$eval(series.label),
                                    data: this.value ? this.value.map(d => d[series.key]) : undefined,
                                    backgroundColor: series.backgroundColor + this.backgroundOpacityHex(),
                                    borderColor: series.borderColor,
                                    borderWidth: series.borderWidth,
                                    tension: series.tension,
                                    fill: series.fill
                                });
                            } else {
                                datasets.push({
                                    label: this.$eval(series.label),
                                    data: this.value[series.key],
                                    backgroundColor: series.backgroundColor + this.backgroundOpacityHex(),
                                    borderColor: series.borderColor,
                                    borderWidth: series.borderWidth,
                                    tension: series.tension,
                                    fill: series.fill
                                });
                            }
                        }
                    } else {
                        // default initialisation (when series are not user-defined)
                        if (this.value) {
                            let data = this.value;
                            switch (type) {
                                case 'AUTO_OBJECT':
                                    data = Object.keys(this.value).map(key => ({key: key, value: data[key]}));
                                    break;
                                case 'AUTO_OBJECT_MULTIPLE':
                                    data = subObjectKeys.map(key => {
                                        let value = {key: key};
                                        for (const k of Object.keys(this.value)) {
                                            value[k] = this.value[k][key];
                                        }
                                        return value;
                                    });
                                    break;
                            }
                            if (Array.isArray(data) && data.length > 0) {
                                let keys = Object.keys(data[0]);
                                for (let i = firstSeriesKeyIndex; i < keys.length; i++) {
                                    if (isNaN(data[0][keys[i]])) {
                                        continue;
                                    }
                                    datasets.push({
                                        label: keys[i],
                                        data: data ? data.map(d => d[keys[i]]) : undefined,
                                        backgroundColor: this.isCategorical() ?
                                            $tools.range(0, data.length).map(i => $tools.defaultColor(i, this.$eval(this.viewModel.backgroundOpacity))) :
                                            $tools.defaultColor(i - 1, this.$eval(this.viewModel.backgroundOpacity)),
                                        borderColor: this.isCategorical() ?
                                            $tools.range(0, data.length).map(i => $tools.defaultColor(i)) :
                                            $tools.defaultColor(i - 1),
                                        borderWidth: 2,
                                        fill: this.$eval(this.viewModel.backgroundOpacity) ? true : false,
                                        tension: this.$eval(this.viewModel.cubicInterpolation, null)
                                    });
                                }
                            }
                        }

                    }

                    let data = type === 'CHART_JS' ? $tools.cloneData(this.value) : {
                        labels: labels,
                        datasets: datasets
                    };

                    let chartOptions = {
                        type: chartType,
                        data: data,
                        options: {
                            responsive: this.allowResponsive(),
                            maintainAspectRatio: !!this.$eval(this.viewModel.aspectRatio, null),
                            aspectRatio: this.viewModel.aspectRatio ? this.$eval(this.viewModel.aspectRatio) : 2,
                            onResize: function (chart, size) {
                                console.info("resize", chart, size);
                            },
                            plugins: {
                                title: {
                                    display: this.$eval(this.viewModel.title, false),
                                    text: this.$eval(this.viewModel.title, null),
                                    fontColor: Chart.defaults.color,
                                }
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
                                    //type:       "time",
                                    time: {
                                        //format: timeFormat,
                                        tooltipFormat: 'll'
                                    },
                                    stacked: this.$eval(this.viewModel.stacked),
                                    scaleLabel: {
                                        display: true,
                                        //labelString: 'Date',
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
                                        display: true,
                                        labelString: 'value',
                                        fontColor: Chart.defaults.color
                                    }
                                }
                            }
                        }
                    };

                    switch (chartOptions.type) {
                        case 'radar':
                        case 'pie':
                        case 'doughnut':
                        case 'polarArea':
                            delete chartOptions.options.legend;
                            delete chartOptions.options.scales;
                    }

                    this.applyCommonOptions(chartOptions);

                    this.chart = new Chart(ctx, ((options) => {
                        if (!this.$eval(this.viewModel.animation)) {
                            options.options.animation = false;
                        }
                        return options;
                    })(chartOptions));
                    this.chart.resize();
                } catch (e) {
                    console.error("error building chart", e);
                }
            };
            if (this.isVisibleInPage()) {
                build();
            } else {
                $tools.setTimeoutWithRetry(() => {
                    if (this.isVisibleInPage()) {
                        build();
                        return true;
                    } else {
                        return false;
                    }
                }, 3, 300);
            }

        },
        propNames() {
            return [
                "cid",
                "backgroundOpacity",
                "fillHeight",
                "aspectRatio",
                "dataSource",
                "dataType",
                "field",
                "title",
                "chartType",
                "stacked",
                "invertAxes",
                "minY",
                "suggestedMinY",
                "maxY",
                "suggestedMaxY",
                "labels",
                "hideLegend",
                "hideGridX",
                "hideGridY",
                "backgroundColors",
                "borderColors",
                "cubicInterpolation",
                "interactiveEdits",
                "seriesList",
                "eventHandlers",
                "optionsAdapter"
            ];
        },
        customPropDescriptors() {
            return {
                optionsAdapter: {
                    label: 'Chart.js options extra initialization',
                    type: 'code/javascript',
                    category: '...',
                    editable: true,
                    literalOnly: true,
                    description: "Some JavaScript code for custom initialization of the chart.js options - for example: chartOptions.options.scales.x.ticks = { ... }",
                    docLink: 'https://www.chartjs.org/docs/latest/'
                },
                hideLegend: {
                    type: 'checkbox',
                    description: 'Hide the chart legend'
                },
                hideGridX: {
                    label: 'Hide grid (x axis)',
                    type: 'checkbox'
                },
                hideGridY: {
                    label: 'Hide grid (y axis)',
                    type: 'checkbox'
                },
                interactiveEdits: {
                    type: 'checkbox',
                    description: 'The use can edit the data by dragging the dots'
                },
                backgroundOpacity: {
                    type: 'range',
                    min: 0,
                    max: 100,
                    defaultValue: 100,
                    category: 'style'
                },
                minY: {
                    label: 'Min (y axis)',
                    type: 'code/javascript'
                },
                suggestedMinY: {
                    label: 'Suggested min',
                    type: 'checkbox',
                    literalOnly: true,
                    hidden: viewModel => !viewModel.minY,
                    description: 'If checked, the given min value can be overridden by the actual min value in the data'
                },
                maxY: {
                    label: 'Max (y axis)',
                    type: 'code/javascript'
                },
                suggestedMaxY: {
                    label: 'Suggested max',
                    type: 'checkbox',
                    literalOnly: true,
                    hidden: viewModel => !viewModel.maxY,
                    description: 'If checked, the given max value can be overridden by the actual max value in the data'
                },
                aspectRatio: {
                    type: 'range',
                    min: 0.1,
                    max: 10,
                    step: 0.1,
                    category: 'style'
                },
                invertAxes: {
                    type: 'checkbox'
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
                    options: ["line", "bar", "radar", "doughnut", "pie", "polarArea", "bubble", "scatter"]
                },
                animation: {
                    type: 'checkbox',
                    editable: true
                },
                seriesList: {
                    type: 'custom',
                    category: 'series',
                    label: 'Series',
                    editable: true,
                    editor: 'time-series-panel'
                },
                labels: {
                    type: 'text',
                    hidden: viewModel => viewModel.seriesList && viewModel.seriesList.length > 0,
                    description: 'An array of string labels or a comma-separated list of string values'
                },
                backgroundColors: {
                    type: 'text',
                    label: 'Background color(s)',
                    hidden: viewModel => viewModel.seriesList && viewModel.seriesList.length > 0,
                    description: 'A color or an array of colors'
                },
                borderColors: {
                    type: 'text',
                    label: 'Border color(s)',
                    hidden: viewModel => viewModel.seriesList && viewModel.seriesList.length > 0,
                    description: 'A color or an array of colors'
                },
                cubicInterpolation: {
                    type: 'range',
                    min: 0,
                    max: 1,
                    step: 0.1,
                    hidden: viewModel => viewModel.seriesList && viewModel.seriesList.length > 0,
                },
                stacked: {
                    type: 'checkbox',
                    editable: true
                },
                dataType: {
                    type: 'select',
                    options: viewModel => components.allowedDataTypes(viewModel.type),
                    category: 'data',
                    description: 'The data type that can be selected from the options'
                }
            }
        }

    }
});
