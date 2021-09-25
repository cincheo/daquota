Vue.component('component-properties-panel', {
    template: `
        <div>

            <div v-if="category === 'data'">
                <data-editor-panel :dataModel="dataModel" :eval="viewModel" size="sm" panelClass="mb-1" rows="15" @update-data="updateDataModel"></data-editor-panel>
                <div class="text-right">
                    <b-button size="sm" variant="secondary" @click="resetData"><b-icon-arrow-repeat class="mr-1"></b-icon-arrow-repeat>Reset data</b-button>
                </div>
            </div>

            <div v-if="category === 'main'">
                <b-button v-b-toggle.view-model-editor class="float-right" size="sm" variant="link">View model</b-button>
                <b-collapse id="view-model-editor" style="clear: both">
                    <data-editor-panel :dataModel="viewModel" size="sm" panelClass="mb-1" rows="15" disabled></data-editor-panel>
                </b-collapse>
            </div>
                    
            <div v-for="prop of propDescriptors.filter(p => p.category === category && p.name !== 'cid')" :key="prop.name">
            
                <div v-if="prop.type === 'text' || isFormulaMode(prop)"> 
                    <b-form-group :label="prop.label" :label-for="prop.name + '_input'" 
                        :eval="evalPropState(prop)"
                        :state="prop.state" 
                        :invalid-feedback="prop.invalidFeedback"
                        :valid-feedback="prop.validFeedback" 
                        label-size="sm" label-class="mb-0" class="mb-1"
                        :description="prop.description">
                        <b-input-group>
                            <b-form-input :id="prop.name + '_input'" size="sm"  
                                v-model="viewModel[prop.name]" type="text" :disabled="!getPropFieldValue(prop, 'editable')" :state="prop.state" @input="evalPropState(prop)"></b-form-input>
                            <b-input-group-append>                                
                              <b-button v-if="prop.docLink" variant="info" target="_blank" :href="prop.docLink" size="sm">?</b-button>
                              <b-button v-if="isFormulaMode(prop)" :variant="formulaButtonVariant" size="sm" @click="setFormulaMode(prop, false)"><em><del>f(x)</del></em></b-button>
                            </b-input-group-append>                                    
                        </b-input-group>
                    </b-form-group>
                </div>

                <b-form-group v-if="prop.type === 'textarea'" :label="prop.label" :label-for="prop.name + '_input'" 
                    :eval="evalPropState(prop)"
                    :state="prop.state"
                    :invalid-feedback="prop.invalidFeedback" 
                    :valid-feedback="prop.validFeedback" 
                    label-size="sm" label-class="mb-0" class="mb-1"
                    :description="prop.description">
                    <b-form-textarea :id="prop.name + '_input'" size="sm" :rows="prop.rows ? prop.rows : 4" 
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
                        <b-list-group-item v-for="(item, index) in viewModel[prop.name]" :key="item.cid" size="sm">
                             <b-form-select v-model="item.cid" size="sm" class="mb-1" :disabled="!getPropFieldValue(prop, 'editable')" :options="componentIds ? getSelectableComponentIds(prop) : []"></b-form-select>                                
                             
                            <b-button v-if="index > 0" size="sm" @click="moveArrayPropUp(viewModel[prop.name], item)" class="mr-1">
                                <b-icon-arrow-up></b-icon-arrow-up>
                            </b-button>    
        
                             <b-button v-if="index < viewModel[prop.name].length - 1" size="sm" @click="moveArrayPropDown(viewModel[prop.name], item)" class="mr-1">
                                <b-icon-arrow-down></b-icon-arrow-down>
                            </b-button>    
                           
                             <b-button size="sm" @click="deleteArrayProp(viewModel[prop.name], item)" class="mr-1" variant="danger">
                                <b-icon-trash></b-icon-trash>
                            </b-button>    
                             
                        </b-list-group-item>
                    </b-list-group>
                    <b-button size="sm" @click="addToArrayProp(prop)" class="text-right mt-1">
                        <b-icon-plus-circle></b-icon-plus-circle>
                    </b-button>                      
                </b-form-group>

                <div v-if="prop.type === 'checkbox' && !isFormulaMode(prop)">
                    <b-button :variant="formulaButtonVariant" class="float-right" size="sm" 
                        @click="setFormulaMode(prop, true)"><em>f(x)</em></b-button>
                    <b-form-group 
                        :label="prop.label" 
                        :label-for="prop.name + '_input'" 
                        label-size="sm" label-cols="6" label-class="mb-0" class="mb-1"
                        :description="prop.description">
                        <b-form-checkbox :id="prop.name + '_input'" size="sm" class="mt-1 cols-2"
                            v-model="viewModel[prop.name]" switch :disabled="!getPropFieldValue(prop, 'editable')"></b-form-checkbox>
                    </b-form-group>
                </div>

                <b-form-group v-if="prop.type === 'select' && !isFormulaMode(prop)" 
                    :state="prop.state" 
                    :label="prop.label" 
                    :label-for="prop.name + '_input'" label-size="sm" label-class="mb-0" class="mb-1"
                    :description="prop.description">
                    <b-input-group>
                        <b-form-select :id="prop.name + '_input'" size="sm"
                            v-model="viewModel[prop.name]" :disabled="!getPropFieldValue(prop, 'editable')" :options="getPropFieldValue(prop, 'options')"></b-form-select>
                        <b-input-group-append>
                          <b-button v-if="prop.docLink" variant="info" target="_blank" :href="prop.docLink" size="sm">?</b-button>
                          <b-button :variant="formulaButtonVariant" size="sm" @click="setFormulaMode(prop, true)"><em>f(x)</em></b-button>
                        </b-input-group-append>                        
                    </b-input-group>
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
                            <b-form-input size="sm" v-model="item[key]" />
                        </template>
                        <template #cell(actions)="data">
                            <b-button size="sm" @click="deleteFromArrayProp(prop, data.item)" class="mr-1" variant="danger">
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

                <b-form-group v-if="prop.type === 'custom' && prop.editor === 'nav-items-panel'" :label="prop.label" :label-for="prop.name + '_input'" label-size="sm" label-class="mb-0" class="mb-1">
                    <nav-items-panel 
                        :viewModel="viewModel[prop.name]" :prop="prop" :selectedComponentModel="viewModel">
                    </nav-items-panel>
                </b-form-group>

                <b-form-group v-if="prop.type === 'custom' && prop.editor === 'table-fields-panel'" :label="prop.label" :label-for="prop.name + '_input'" label-size="sm" label-class="mb-0" class="mb-1">
                    <table-fields-panel 
                        :fields="viewModel[prop.name]">
                    </table-fields-panel>
                </b-form-group>

                 <b-form-group v-if="prop.type === 'custom' && prop.editor === 'time-series-panel'" :label="prop.label" :label-for="prop.name + '_input'" label-size="sm" label-class="mb-0" class="mb-1">
                    <time-series-panel 
                        :timeSeriesList="viewModel[prop.name]" :viewModel="viewModel">
                    </time-series-panel>
                </b-form-group>

                <b-form-group v-if="prop.type === 'custom' && prop.editor === 'carousel-slides-panel'" :label="prop.label" :label-for="prop.name + '_input'" label-size="sm" label-class="mb-0" class="mb-1">
                    <carousel-slides-panel 
                        :slides="viewModel[prop.name]">
                    </carousel-slides-panel>
                </b-form-group>


                <b-form-group v-if="prop.type === 'map'" :label="prop.label" :label-for="prop.name + '_input'" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-card v-for="value, key in viewModel[prop.name]" :key="key">
                        <template #header>
                            <b-badge variant="secondary">{{ key }}</b-badge>
                            <b-button class="float-right" v-on:click="" size="sm" variant="danger"><b-icon-trash></b-icon-trash></b-button>
                        </template>                        
                        <b-table hover
                            stacked
                            :items="[value]">
                            <template v-slot:cell()="{ item, field: { key } }">
                                <b-form-input size="sm" v-model="item[key]" />
                            </template>
                        </b-table>
                    </b-card>
                    <b-button size="sm" @click="addToMapProp(prop)" class="text-right">
                        <b-icon-plus-circle></b-icon-plus-circle>
                    </b-button>                      
            
                </b-form-group>
            </div>
        </div>                   
        `,
    props: ['category', 'dataModel', 'viewModel', 'propDescriptors', 'formulaButtonVariant'],
    data: () => {
        return {
            componentIds: components.getComponentIds()
        }
    },
    methods: {
        resetData() {
            $c(this.viewModel.cid).reset();
        },
        isFormulaMode(prop) {
            return (prop.type === 'checkbox' && typeof this.viewModel[prop.name] === 'string')
                || (prop.type === 'select' && typeof this.viewModel[prop.name] === 'string' && this.viewModel[prop.name].startsWith('='));
        },
        setFormulaMode(prop, formulaMode) {
            if (formulaMode) {
                switch (prop.type) {
                    case 'checkbox':
                        this.$set(this.viewModel, prop.name, '=' + (this.viewModel[prop.name] ? 'true' : 'false'));
                        break;
                    case 'select':
                        this.$set(this.viewModel, prop.name, "='" + (this.viewModel[prop.name] ? this.viewModel[prop.name] : '') + "'");
                        break;
                }
            } else {
                console.info("unsetFormulaMode", this.viewModel[prop.name]);
                switch (prop.type) {
                    case 'checkbox':
                        this.$set(this.viewModel, prop.name, this.selectedComponent ? this.selectedComponent.$eval(this.viewModel[prop.name], false) : false);
                        break;
                    case 'select':
                        this.$set(this.viewModel, prop.name, this.selectedComponent ? this.selectedComponent.$eval(this.viewModel[prop.name], undefined) : undefined);
                        break;
                }
                console.info("=>", this.viewModel[prop.name]);
            }
        },
        evalPropState(prop) {
            try {
                if (this.viewModel[prop.name] && (typeof this.viewModel[prop.name] === 'string') && this.viewModel[prop.name].startsWith('=')) {
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
                return this.viewModel[prop.name].cid ? [this.viewModel[prop.name].cid] : [];
            }
            let parentIds = selectedComponent.getParentIds();
            let result = this.componentIds.filter(id => (parentIds.indexOf(id) === -1 && document.getElementById(id) != null));
            if (this.viewModel[prop.name].cid && result.indexOf(this.viewModel[prop.name].cid) === -1) {
                result.push(this.viewModel[prop.name].cid);
            }
            return result;
        },
    }
});
