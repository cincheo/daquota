Vue.component('component-panel', {
    template: `
        <div>
            <p v-if="!viewModel">
                Please select a component to edit its properties
            </p>
            <p v-else>
                <b-card>
                
                    <template #header>
                        <h5>Component properties</h5>
                        <component-icon :type="viewModel.type"></component-icon> {{ viewModel.cid }}
                        <b-button class="float-right" v-on:click="detachComponent()" size="sm"><b-icon-trash></b-icon-trash></b-button>
                    </template> 
                    
                    <b-button v-b-toggle.data-model-editor class="float-right" size="sm" variant="link">Data model</b-button>
                    <b-collapse id="data-model-editor" style="clear: both">
                        <data-editor-panel :dataModel="dataModel" :eval="viewModel" size="sm" panelClass="mb-1" rows="15" @update-data="updateDataModel"></data-editor-panel>
                    </b-collapse>

                    <b-button v-b-toggle.view-model-editor class="float-right" size="sm" variant="link">View model</b-button>
                    <b-collapse id="view-model-editor" style="clear: both">
                        <data-editor-panel :dataModel="viewModel" size="sm" panelClass="mb-1" rows="15" disabled></data-editor-panel>
                    </b-collapse>
                    
                    <div v-for="prop of propDescriptors">
                        <b-form-group v-if="prop.type === 'text'" :label="prop.label" :label-for="prop.name + '_input'" 
                            :eval="evalPropState(prop)"
                            :state="prop.state" 
                            :invalid-feedback="prop.invalidFeedback"
                            :valid-feedback="prop.validFeedback" 
                            label-size="sm" label-class="mb-0" class="mb-1"
                            :description="prop.description">
                            <b-form-input :id="prop.name + '_input'" size="sm"  
                                v-model="viewModel[prop.name]" type="text" :disabled="!getPropFieldValue(prop, 'editable')" :state="prop.state" @input="evalPropState(prop)"></b-form-input>
                        </b-form-group>
    
                        <b-form-group v-if="prop.type === 'textarea'" :label="prop.label" :label-for="prop.name + '_input'" 
                            :eval="evalPropState(prop)"
                            :state="prop.state"
                            :invalid-feedback="prop.invalidFeedback" 
                            :valid-feedback="prop.validFeedback" 
                            label-size="sm" label-class="mb-0" class="mb-1"
                            :description="prop.description">
                            <b-form-textarea :id="prop.name + '_input'" size="sm" 
                                v-model="viewModel[prop.name]" :state="prop.state" :disabled="!getPropFieldValue(prop, 'editable')" @input="evalPropState(prop)"></b-form-textarea>
                        </b-form-group>
    
                        <div v-if="prop.type === 'data'" >
                            <data-editor-panel :id="prop.name + '_input'" v-if="prop.type === 'data'" :label="prop.label" size="sm" label-class="mb-0" panel-class="mb-1" :rows="prop.rows" 
                                :dataModel="viewModel[prop.name]" :disabled="!getPropFieldValue(prop, 'editable')" @update-data="viewModel[prop.name] = $event"></data-editor-panel>
                        </div>
                        
                        <b-form-group v-if="prop.type === 'ref' && !Array.isArray(viewModel[prop.name])" :label="prop.label" :label-for="prop.name + '_input'" label-size="sm" label-class="mb-0" class="mb-1">
                            <b-form-select :id="prop.name + '_input'" size="sm" 
                                v-model="viewModel[prop.name].cid" :disabled="!getPropFieldValue(prop, 'editable')" :options="componentIds ? getSelectableComponentIds(prop) : []"></b-form-select>
                        </b-form-group>
    
                        <b-form-group v-if="prop.type === 'ref' && Array.isArray(viewModel[prop.name])" :label="prop.label" :label-for="prop.name + '_input'" label-size="sm" label-class="mb-0" class="mb-1">
                            <b-list-group :id="prop.name + '_input'" size="sm"> 
                                <b-list-group-item v-for="(item, index) in viewModel[prop.name]" size="sm">
                                     <b-form-select v-model="item.cid" class="mb-1" :disabled="!getPropFieldValue(prop, 'editable')" :options="componentIds ? getSelectableComponentIds(prop) : []"></b-form-select>                                
                                     
                                    <b-button v-if="index > 0" size="sm" @click="moveArrayPropUp(viewModel[prop.name], item)" class="mr-1">
                                        <b-icon-arrow-up></b-icon-arrow-up>
                                    </b-button>    
                
                                     <b-button v-if="index < viewModel[prop.name].length - 1" size="sm" @click="moveArrayPropDown(viewModel[prop.name], item)" class="mr-1">
                                        <b-icon-arrow-down></b-icon-arrow-down>
                                    </b-button>    
                                   
                                     <b-button size="sm" @click="deleteArrayProp(viewModel[prop.name], item)" class="mr-1">
                                        <b-icon-trash></b-icon-trash>
                                    </b-button>    
                                     
                                </b-list-group-item>
                            </b-list-group>
                            <b-button size="sm" @click="addToArrayProp(prop)" class="text-right mt-1">
                                <b-icon-plus-circle></b-icon-plus-circle>
                            </b-button>                      
                        </b-form-group>
    
                        <b-form-group v-if="prop.type === 'checkbox'" 
                            :label="prop.label" 
                            :label-for="prop.name + '_input'" 
                            label-size="sm" label-cols="6" label-class="mb-0" class="mb-1"
                            :description="prop.description">
                            <b-form-checkbox :id="prop.name + '_input'" size="sm" class="mt-1"
                                v-model="viewModel[prop.name]" switch :disabled="!getPropFieldValue(prop, 'editable')"></b-form-checkbox>
                        </b-form-group>
    
                        <b-form-group v-if="prop.type === 'select'" 
                            :state="prop.state" 
                            :label="prop.label" 
                            :label-for="prop.name + '_input'" label-size="sm" label-class="mb-0" class="mb-1"
                            :description="prop.description">
                            <b-form-select :id="prop.name + '_input'" size="sm"
                                v-model="viewModel[prop.name]" :disabled="!getPropFieldValue(prop, 'editable')" :options="getPropFieldValue(prop, 'options')"></b-form-select>
                        </b-form-group>
                            
                        <b-form-group v-if="prop.type === 'autoComplete'" :label="prop.label" :label-for="prop.name + '_input'" 
                            :state="prop.state" 
                            :invalid-feedback="prop.invalidFeedback" 
                            :valid-feedback="prop.validFeedback" 
                            label-size="sm" label-class="mb-0" class="mb-1"
                            :description="prop.description">
                            <b-form-input :id="prop.name + '_input'" size="sm"
                                v-model="viewModel[prop.name]" :disabled="!getPropFieldValue(prop, 'editable')" :state="prop.state" :list="prop.name + '_input_options'" @input="evalPropState(prop)"></b-form-input>
                            <b-form-datalist :id="prop.name + '_input_options'" :options="prop.options"></b-form-datalist>                            
                        </b-form-group>
                            
                        <b-form-group v-if="prop.type === 'table'" :label="prop.label" :label-for="prop.name + '_input'" label-size="sm" label-class="mb-0" class="mb-1">
                        
                            <b-table :id="prop.name + '_input'" hover
                                :stacked="prop.stacked ? 'stacked' : ''" 
                                :items="viewModel[prop.name]" 
                                small
                                :fields="fieldsForTable(prop)" @row-selected="">
                                <template v-slot:cell()="{ item, field: { key } }">
                                    <b-form-input v-model="item[key]" />
                                </template>
                                <template #cell(actions)="data">
                                    <b-button size="sm" @click="deleteFromArrayProp(prop, data.item)" class="mr-1">
                                        <b-icon-trash></b-icon-trash>
                                    </b-button>                      
                                </template>
                            </b-table>
                            <b-button size="sm" @click="addToArrayProp(prop)" class="text-right">
                                <b-icon-plus-circle></b-icon-plus-circle>
                            </b-button>                      
                        </b-form-group>
    
                        <b-form-group v-if="prop.type === 'custom' && prop.editor === 'events-panel'" :label="prop.label" :label-for="prop.name + '_input'" label-size="sm" label-class="mb-0" class="mb-1">
                            <events-panel 
                                :viewModel="viewModel[prop.name]" :prop="prop" :selectedComponentModel="viewModel">
                            </events-panel>
                        </b-form-group>
    
                        <b-form-group v-if="prop.type === 'custom' && prop.editor === 'table-fields-panel'" :label="prop.label" :label-for="prop.name + '_input'" label-size="sm" label-class="mb-0" class="mb-1">
                            <table-fields-panel 
                                :fields="viewModel[prop.name]">
                            </table-fields-panel>
                        </b-form-group>

                         <b-form-group v-if="prop.type === 'custom' && prop.editor === 'time-series-panel'" :label="prop.label" :label-for="prop.name + '_input'" label-size="sm" label-class="mb-0" class="mb-1">
                            <time-series-panel 
                                :timeSeriesList="viewModel[prop.name]">
                            </time-series-panel>
                        </b-form-group>
   
                        <b-form-group v-if="prop.type === 'map'" :label="prop.label" :label-for="prop.name + '_input'" label-size="sm" label-class="mb-0" class="mb-1">
                            <b-card v-for="value, key in viewModel[prop.name]">
                                <template #header>
                                    <b-badge variant="secondary">{{ key }}</b-badge>
                                    <b-button class="float-right" v-on:click="" size="sm"><b-icon-trash></b-icon-trash></b-button>
                                </template>                        
                                <b-table hover
                                    stacked
                                    :items="[value]">
                                    <template v-slot:cell()="{ item, field: { key } }">
                                        <b-form-input v-model="item[key]" />
                                    </template>
                                </b-table>
                            </b-card>
                            <b-button size="sm" @click="addToMapProp(prop)" class="text-right">
                                <b-icon-plus-circle></b-icon-plus-circle>
                            </b-button>                      
                    
                        </b-form-group>
                    </div>
                </b-card>
            </p>
        </div>                   
        `,
    created: function () {
        this.$eventHub.$on('data-model-changed', (cid) => {
            if (this.viewModel && cid && this.viewModel.cid === cid) {
                this.dataModel = $d(this.viewModel.cid);
            }
        });
        this.$eventHub.$on('component-selected', (cid) => {
            this.initComponent(cid);
        });
    },
    mounted: function() {
        if (ide.selectedComponentId) {
            this.initComponent(ide.selectedComponentId);
        }
    },
    data: () => {
        return {
            //selectedComponent: undefined,
            viewModel: undefined,
            dataModel: undefined,
            propDescriptors: undefined,
            // reactivePropHandlers: [],
            componentIds: components.getComponentIds()
        }
    },
    methods: {
        initComponent(cid) {
            if (this.viewModel && cid && this.viewModel.cid === cid) {
                return;
            }
            this.viewModel = components.getComponentModel(cid);
            this.dataModel = $d(this.viewModel.cid);

            // this.reactivePropHandlers = [];
            this.propDescriptors = components.propDescriptors(this.viewModel);
            console.info("component-selected", this.viewModel, this.propDescriptors);
            // for (let prop of this.propDescriptors) {
            //     switch (prop.type) {
            //         case 'select':
            //             if (typeof prop.options === 'function') {
            //                 let handler = prop.options;
            //                 prop.options = handler(this.viewModel);
            //                 this.reactivePropHandlers.push({prop: prop.name, field: 'options', handler: handler});
            //                 // this.unwatchList.push(this.$watch(
            //                 //     'this.selectedComponent.model',
            //                 //     f,
            //                 //     {deep: true}));
            //             }
            //             break;
            //     }
            // }
        },
        evalPropState(prop) {
            try {
                if (this.viewModel[prop.name] && this.viewModel[prop.name].startsWith('=')) {
                    try {
                        let result = $c(this.viewModel.cid).$eval(this.viewModel[prop.name]);
                        prop.state = true;
                        if (result === undefined) {
                            prop.validFeedback = 'undefined';
                        } else if (typeof result === 'function') {
                            let str = result.toString();
                            prop.validFeedback = str.substring(0, str.indexOf("{"));
                        } else {
                            prop.validFeedback = Tools.truncate(JSON.stringify(result), 100);
                        }
                    } catch (e) {
                        prop.state = false;
                        prop.invalidFeedback = e.message;
                    }
                } else {
                    prop.state = null;
                    prop.invalidFeedback = undefined;
                }
            } catch (e) {
                console.error('error evaluating state for ' + prop.name, e);
            }
        },
        getPropFieldValue(prop, fieldName) {
            if (typeof prop[fieldName] === 'function') {
                try {
                    let result = prop[fieldName](this.viewModel);
                    prop.state = true;
                    return result;
                } catch (e) {
                    prop.state = false;
                }
            } else {
                return prop[fieldName];
            }
        },
        updateDataModel(data) {
            $c(this.viewModel.cid).dataModel = data;
            //$d(this.viewModel.cid, data);
        },
        // getDataModel() {
        //     return JSON.stringify($d(this.viewModel.cid), null, 2);
        // },
        // updateDataModel() {
        //     components.getView(this.viewModel.cid).dataModel = JSON.parse(this.dataModel);
        // },
        detachComponent() {

            // TODO: first change component models only, then detach

            const containerView = components.getContainerView(this.viewModel.cid);
            console.info("deleting", containerView.cid, this.selectedComponent)
            let parentComponentModel = components.getComponentModel(containerView.$parent.cid)
            let keyInParent = containerView.keyInParent;
            if (Array.isArray(parentComponentModel[keyInParent])) {
                if (containerView.indexInKey === undefined) {
                    throw new Error("undefined index for array key");
                }
                parentComponentModel[keyInParent].splice(containerView.indexInKey, 1);
            } else {
                parentComponentModel[keyInParent] = undefined;
            }
        },
        deleteComponent() {
            const containerView = components.getContainerView(this.viewModel.cid);
            if (containerView != null) {
                this.detachComponent();
            }
            components.deleteComponentModel(this.selectedComponent.cid);
            this.selectedComponent = undefined;
        },
        addToMapProp(prop) {
            let item = {};
            this.formData[prop.name].push(item);
        },
        deleteFromArrayProp(prop, item) {
            this.selectedComponent.viewModel[prop.name].splice(this.viewModel[prop.name].indexOf(item), 1);
        },
        addToArrayProp(prop) {
            let item = {};
            this.viewModel[prop.name].push(item);
        },
        deleteArrayProp(array, item) {
            const index = array.indexOf(item);
            if (index > -1) {
                array.splice(index, 1);
            }
        },
        moveArrayPropUp(array, item) {
            const index = array.indexOf(item);
            if (index > 0) {
                Tools.arrayMove(array, index, index - 1);
            }
        },
        moveArrayPropDown(array, item) {
            const index = array.indexOf(item);
            if (index > -1) {
                Tools.arrayMove(array, index, index + 1);
            }
        },
        fieldsForTable(prop) {
            if (prop.onModified) {
                let watch = this.$watch('viewModel.' + prop.name, (newValue, oldValue) => {
                    prop.onModified(this.viewModel[prop.name]);
                }, {deep: true});
            }
            if (prop.fields) {
                return prop.fields;
            } else {
                let fields = Object.keys(this.viewModel[prop.name][0]).map(k => {
                    return {key: k}
                });
                fields.push({key: 'actions'});
                return fields;
            }
        },
        getSelectableComponentIds(prop) {
            let selectedComponent = components.getView(this.viewModel.cid);
            if (!selectedComponent) {
                return [];
            }
            let parentIds = selectedComponent.getParentIds();
            return this.componentIds.filter(id => parentIds.indexOf(id) === -1);
        },
    }
});
