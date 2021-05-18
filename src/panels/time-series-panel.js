Vue.component('time-series-panel', {
    template: `
        <div>
        
            <b-form-select class="mb-2" v-model="selectedTimeSeries" :options="timeSeriesOptions" :select-size="4" size="sm"></b-form-select>

            <div v-if="selectedTimeSeries">
                <div class="mb-3">
                     <b-button size="sm" @click="deleteTimeSeries()" class="mr-1">
                        <b-icon-trash></b-icon-trash> delete time series
                    </b-button>    
                    
                    <b-button size="sm" @click="addTimeSeries()" class="text-right">
                        <b-icon-plus-circle></b-icon-plus-circle> new time series
                    </b-button>
                   
                </div>

                 <b-form-group label="Key" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-input v-model="selectedTimeSeries.key" size="sm"></b-form-input>
                </b-form-group>
               
                <b-form-group label="Label" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-input v-model="selectedTimeSeries.label" size="sm"></b-form-input>
                </b-form-group>

                <b-form-group label="Background color" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-input type="color" v-model="selectedTimeSeries.backgroundColor" size="sm"></b-form-input>
                </b-form-group>

                <b-form-group label="Border color" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-input type="color" v-model="selectedTimeSeries.borderColor" size="sm"></b-form-input>
                </b-form-group>

                <b-form-group label="Border width" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-input type="range" min="0" max="10" v-model="selectedTimeSeries.borderWidth" size="sm"></b-form-input> {{ selectedTimeSeries.borderWidth }}
                </b-form-group>
    
            </div>                              
            <div v-else>
                <b-button size="sm" @click="addTimeSeries()" class="text-right">
                    <b-icon-plus-circle></b-icon-plus-circle> new time series
                </b-button>                      
            </div>            
        </div>                   
        `,
    props: ['timeSeriesList'],
    data: () => {
        return {
            data_model: undefined,
            timeSeriesOptions: [],
            selectedTimeSeries: undefined
        }
    },
    mounted: function() {
        this.data_model = this.timeSeriesList;
        this.fillTimeSeriesOptions();
    },
    watch: {
        data_model: {
            handler: function () {
                if (this.data_model) {
                    this.fillTimeSeriesOptions();
                }
            },
            immediate: true,
            deep: true
        }
    },
    //     selectedTimeSeries: {
    //         handler: function() {
    //             this.fillActionOptions();
    //         },
    //         deep: true,
    //         immediate: true
    //     },
    //     viewModel: function() {
    //         this.data_model = this.viewModel;
    //         this.selectedEvent = undefined;
    //         this.selectedAction = undefined;
    //     }
    // },
    methods: {
        fillTimeSeriesOptions() {
            if (!this.data_model) {
                this.timeSeriesOptions = undefined;
            } else {
                this.timeSeriesOptions = this.data_model.map(timeSeries => {
                    return {
                        value: timeSeries,
                        text: timeSeries.key
                    }
                });
            }
        },
        addTimeSeries() {
            let timeSeries = {
                key: "key",
                label: 'New time series',
                backgroundColor: undefined,
                borderColor: undefined,
                borderWidth: 1
            };
            this.data_model.push(timeSeries);
            this.selectedTimeSeries = timeSeries;
        },
        deleteTimeSeries() {
            const index = this.data_model.indexOf(this.selectedTimeSeries);
            if (index > -1) {
                this.data_model.splice(index, 1);
                this.selectedTimeSeries = undefined;
            }
        }
    }
});
