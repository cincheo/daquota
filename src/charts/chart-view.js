Vue.component('chart-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.class">
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <canvas :id="'chart-' + cid"></canvas>
        </div>
    `,
    props: ['width', 'height'],
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
                let chart = Chart.getChart('chart-' + this.viewModel.cid);
                if (chart) {
                    chart.destroy();
                }
                let ctx = document.getElementById('chart-' + this.viewModel.cid).getContext('2d');
                new Chart(ctx, {
                    type: this.viewModel.chartType,
                    data: {
                        labels: this.$eval(this.viewModel.labels, null),
                        datasets: [{
                            label: this.$eval(this.viewModel.label, null),
                            data: this.$eval(this.viewModel.defaultData),
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
                        JSON.parse(JSON.stringify(this.viewModel.options))
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
