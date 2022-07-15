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

Vue.component('time-series-panel', {
    template: `
        <div>
        
            <b-form-select class="mb-2" v-model="selectedTimeSeries" :options="timeSeriesOptions" :select-size="4" size="sm"></b-form-select>

            <div v-if="selectedTimeSeries">
                <div class="mb-3">
                     <b-button size="sm" @click="deleteTimeSeries()" class="mr-1">
                        <b-icon-trash></b-icon-trash> delete series
                    </b-button>    
                    
                    <b-button size="sm" @click="addTimeSeries()" class="text-right">
                        <b-icon-plus-circle></b-icon-plus-circle> new series
                    </b-button>
                   
                </div>

                 <b-form-group label="Key" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-input v-model="selectedTimeSeries.key" size="sm"></b-form-input>
                </b-form-group>
               
                <b-form-group label="Label" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-input v-model="selectedTimeSeries.label" size="sm"></b-form-input>
                </b-form-group>

                <b-form-group label="Background color" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-input-group>
                        <b-form-input type="color" v-model="selectedTimeSeries.backgroundColor" size="sm"></b-form-input>
                        <b-input-group-append>   
                          <b-button v-if="selectedTimeSeries.backgroundColor !== undefined" size="sm" variant="danger" @click="selectedTimeSeries.backgroundColor = undefined">x</b-button>
                        </b-input-group-append>                                    
                    </b-input-group>
                </b-form-group>

                <b-form-group v-if="viewModel.chartType=='line'" label="Fill" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-input-group>
                        <b-form-select type="color" v-model="selectedTimeSeries.fill" size="sm" :options="['origin', 'start', 'end']"></b-form-select>
                        <b-input-group-append>   
                          <b-button v-if="selectedTimeSeries.fill !== undefined" size="sm" variant="danger" @click="selectedTimeSeries.fill = undefined">x</b-button>
                        </b-input-group-append>                                    
                    </b-input-group>
                </b-form-group>

                <b-form-group label="Border color" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-input-group>
                        <b-form-input type="color" v-model="selectedTimeSeries.borderColor" size="sm"></b-form-input>
                        <b-input-group-append>   
                          <b-button v-if="selectedTimeSeries.borderColor !== undefined" size="sm" variant="danger" @click="selectedTimeSeries.borderColor = undefined">x</b-button>
                        </b-input-group-append>                                    
                    </b-input-group>
                </b-form-group>

                <b-form-group label="Border width" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-input-group>
                        <b-form-input type="range" min="0" max="10" v-model="selectedTimeSeries.borderWidth" size="sm"></b-form-input>
                        <b-input-group-append>   
                          <b-button v-if="selectedTimeSeries.borderWidth !== undefined" size="sm" variant="danger" @click="selectedTimeSeries.borderWidth = undefined">x</b-button>
                        </b-input-group-append>                                    
                    </b-input-group>
                    {{ selectedTimeSeries.borderWidth }}                    
                </b-form-group>
                
                <b-form-group label="Cubic interpolation" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-input-group>
                        <b-form-input type="range" min="0" max="1" step="0.1" v-model="selectedTimeSeries.tension" size="sm"></b-form-input>
                        <b-input-group-append>   
                          <b-button v-if="selectedTimeSeries.tension !== undefined" size="sm" variant="danger" @click="selectedTimeSeries.tension = undefined">x</b-button>
                        </b-input-group-append>                                    
                    </b-input-group>
                    {{ selectedTimeSeries.tension }}
                </b-form-group>

    
            </div>                              
            <div v-else>
                <b-button size="sm" @click="addTimeSeries()" class="text-right">
                    <b-icon-plus-circle></b-icon-plus-circle> new series
                </b-button>                      
            </div>            
        </div>                   
        `,
    props: ['viewModel', 'timeSeriesList'],
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
        },
        viewModel: function() {
            this.data_model = this.timeSeriesList;
        }
    },
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
