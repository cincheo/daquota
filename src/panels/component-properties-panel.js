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

Vue.component('component-properties-panel', {
    template: `
        <div>

            <div v-if="category === 'data'">
                <data-editor-panel ref="data-model-editor" :dataModel="dataModel" :viewModel="viewModel" size="sm" panelClass="mb-1" 
                    rows="3" max-rows="15" :readOnly="viewModel.dataSource"/>
                <div class="text-right">
                    <b-button size="sm" variant="secondary" @click="refreshData">
                        <b-icon-arrow-repeat class="mr-1"/>Refresh</b-button>
                    <b-button v-if="!viewModel.dataSource" size="sm" variant="warning" @click="resetData">
                        <b-icon-backspace class="mr-1"/>Reset</b-button>
                    <b-button v-if="!viewModel.dataSource" size="sm" variant="primary" 
                        @click="updateDataModel($refs['data-model-editor'].getDataModel())"><b-icon-check2 class="mr-1"/>Apply</b-button>
                    <b-button v-if="!viewModel.dataSource" size="sm" variant="primary" :disabled="!dataModel" 
                        @click="magicWand"><b-icon icon="stars" class="mr-1"/></b-button>
                </div>
            </div>

            <div v-if="category === 'main'">
                <b-button v-b-toggle.view-model-editor class="w-100 text-right" size="sm" variant="link">View model</b-button>
                <b-collapse id="view-model-editor" style="clear: both">
                    <data-editor-panel :dataModel="viewModel" size="sm" panelClass="mb-1" rows="15" :readOnly="true"/>
                </b-collapse>
            </div>
                    
            <div v-for="prop of propDescriptors.filter(p => p.category === category && p.name !== 'cid')" :key="prop.name">
            
                <div v-if="!getPropFieldValue(prop, 'hidden')">
            
                    <lazy-component-property-editor 
                        :prop="prop" 
                        :viewModel="viewModel" 
                        :tmpViewModel="createTmpModel(prop)" 
                        :formulaButtonVariant="formulaButtonVariant"
                    />
                    
                     <div v-if="(prop.type === 'number' || prop.type === 'range') && !isFormulaMode(prop)"> 
                        <b-form-group :label="prop.label" :label-for="prop.name + '_input'" 
                            label-size="sm" label-class="mb-0" class="mb-1"
                            :description="prop.description">
                            <b-input-group>
                                <b-input-group-prepend v-if="prop.docLink">
                                  <b-button v-if="prop.docLink" variant="info" target="_blank" :href="prop.docLink" size="sm">?</b-button>
                                </b-input-group-prepend>                        
                                <b-form-input :id="prop.name + '_input'" size="sm"  
                                    v-model="viewModel[prop.name]" :type="prop.type" 
                                    :disabled="!getPropFieldValue(prop, 'editable')"
                                    :min="getPropFieldValue(prop, 'min')"
                                    :max="getPropFieldValue(prop, 'max')"
                                    :step="getPropFieldValue(prop, 'step')"
                                    :placeholder="getPropFieldValue(prop, 'placeholder')"
                                    :value="getPropFieldValue(prop, 'defaultValue')"
                                />
                                <b-input-group-append v-if="(!prop.mandatory && viewModel[prop.name] !== undefined) || !prop.literalOnly">   
                                  <b-button v-if="!prop.mandatory && viewModel[prop.name] !== undefined" size="sm" variant="danger" @click="$set(viewModel, prop.name, undefined)">x</b-button>
                                  <b-button v-if="!prop.literalOnly" :variant="formulaButtonVariant" size="sm" @click="setFormulaMode(prop, true)"><em>f(x)</em></b-button>
                                </b-input-group-append>                                    
                            </b-input-group>
                        </b-form-group>
                    </div>
       
                    <div v-if="prop.type === 'data' && !isFormulaMode(prop)" >
                        <data-editor-panel :id="prop.name + '_input'" v-if="prop.type === 'data'" :label="prop.label" 
                            size="sm" label-class="mb-0" panel-class="mb-1" :rows="prop.rows" :max-rows="prop.maxRows"
                            :dataModel="viewModel[prop.name]" :disabled="!getPropFieldValue(prop, 'editable')" @update-data="viewModel[prop.name] = $event"
                        />
                    </div>
                    
                    <b-form-group v-if="prop.type === 'ref' && !Array.isArray(viewModel[prop.name])" :label="prop.label" :label-for="prop.name + '_input'" label-size="sm" label-class="mb-0" class="mb-1">
                        <b-form-select :id="prop.name + '_input'" size="sm" 
                            v-model="viewModel[prop.name].cid" :disabled="!getPropFieldValue(prop, 'editable')" 
                            :options="componentIds ? getSelectableComponentIds(prop) : []"
                        />
                    </b-form-group>
    
                    <b-form-group v-if="prop.type === 'ref' && Array.isArray(viewModel[prop.name])" :label="prop.label" :label-for="prop.name + '_input'" label-size="sm" label-class="mb-0" class="mb-1">
                        <b-list-group :id="prop.name + '_input'" size="sm"> 
                            <b-list-group-item v-for="(item, index) in viewModel[prop.name]" :key="item.cid" size="sm" class="p-1">
                                
                                <div class="d-flex flex-nowrap">
                                    <b-input v-if="prop.editorMode==='tabs'" size="sm" v-model="item.title"></b-input>
                                    <b-form-select v-else v-model="item.cid" size="sm" class="mb-1" :disabled="!getPropFieldValue(prop, 'editable')" :options="componentIds ? getSelectableComponentIds(prop) : []"></b-form-select>                                
                                     
                                    <b-button v-if="index > 0" size="sm" @click="moveArrayPropUp(viewModel[prop.name], item)" class="ml-1">
                                        <b-icon-arrow-up></b-icon-arrow-up>
                                    </b-button>    
                
                                     <b-button v-if="index < viewModel[prop.name].length - 1" size="sm" @click="moveArrayPropDown(viewModel[prop.name], item)" class="ml-1">
                                        <b-icon-arrow-down></b-icon-arrow-down>
                                    </b-button>    
                                   
                                     <b-button size="sm" @click="deleteArrayProp(viewModel[prop.name], item)" class="ml-1" variant="danger">
                                        <b-icon-trash></b-icon-trash>
                                    </b-button>    
                                </div>
                                                                 
                            </b-list-group-item>
                        </b-list-group>
                        <b-button size="sm" @click="addToArrayProp(prop)" class="text-right mt-1">
                            <b-icon-plus-circle/>
                        </b-button>                      
                    </b-form-group>
    
                    <div v-if="prop.type === 'checkbox' && !isFormulaMode(prop)">
                        <div class="d-flex align-items-start">
                            <b-form-group 
                                label-size="sm" label-cols="4" label-class="mb-0" 
                                class="mb-1 flex-grow-1"
                                :description="prop.description"
                            >
                                <template #label>
                                    <span>{{ prop.label }} <b-button v-if="prop.docLink" variant="outline-info" target="_blank" :href="prop.docLink" size="sm" pill>?</b-button></span>
                                </template>
                                <b-form-checkbox :id="prop.name + '_input'" size="sm" class="mt-1 cols-2"
                                    v-model="viewModel[prop.name]" switch :disabled="!getPropFieldValue(prop, 'editable')"
                                />
                            </b-form-group>
                            <b-button :variant="formulaButtonVariant" size="sm" :disabled="prop.literalOnly" 
                                :style="'visibility: '+(prop.literalOnly ? 'hidden' : 'visible')"
                                @click="setFormulaMode(prop, true)"><em>f(x)</em>
                            </b-button>
                        </div>
                    </div>
    
                    <b-form-group v-if="prop.type === 'select' && !isFormulaMode(prop)" 
                        :state="prop.state" 
                        :label="prop.label" 
                        :label-for="prop.name + '_input'" label-size="sm" label-class="mb-0" class="mb-1"
                        :description="prop.description">
                        <b-input-group>
                            <b-input-group-prepend v-if="prop.docLink">
                              <b-button v-if="prop.docLink" variant="info" target="_blank" :href="prop.docLink" size="sm">?</b-button>
                            </b-input-group-prepend>                        
                            <b-form-select :id="prop.name + '_input'" size="sm"
                                v-model="viewModel[prop.name]" :disabled="!getPropFieldValue(prop, 'editable')" :options="getPropFieldValue(prop, 'options')"></b-form-select>
                            <b-input-group-append v-if="(!prop.mandatory && viewModel[prop.name] !== undefined) || !prop.literalOnly">
                              <b-button v-if="!prop.mandatory && viewModel[prop.name] !== undefined" size="sm" variant="danger" @click="$set(viewModel, prop.name, undefined)">x</b-button>
                              <b-button v-if="!prop.literalOnly" :variant="formulaButtonVariant" size="sm" @click="setFormulaMode(prop, true)"><em>f(x)</em></b-button>
                            </b-input-group-append>                        
                        </b-input-group>
                    </b-form-group>
                        
                    <b-form-group v-if="prop.type === 'autoComplete' && !isFormulaMode(prop)" :label="prop.label" :label-for="prop.name + '_input'" 
                        :state="prop.state" 
                        :invalid-feedback="prop.invalidFeedback" 
                        :valid-feedback="prop.validFeedback" 
                        label-size="sm" label-class="mb-0" class="mb-1"
                        :description="prop.description">
                        <b-form-input :id="prop.name + '_input'" size="sm"
                            v-model="viewModel[prop.name]" :disabled="!getPropFieldValue(prop, 'editable')" :state="prop.state" 
                            :list="prop.name + '_input_options'" @input="evalPropState(prop)"
                        />
                        <b-form-datalist :id="prop.name + '_input_options'" :options="prop.options"/>                            
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
                            <b-icon-plus-circle/>
                        </b-button>                      
                    </b-form-group>
    
                    <b-form-group v-if="prop.type === 'custom' && prop.editor === 'events-panel'" :label="prop.label" :label-for="prop.name + '_input'" label-size="sm" label-class="mb-0" class="mb-1">
                        <events-panel :viewModel="viewModel[prop.name]" :prop="prop" :selectedComponentModel="viewModel"/>
                    </b-form-group>
    
                    <b-form-group v-if="prop.type === 'custom' && prop.editor === 'nav-items-panel'" :label="prop.label" :label-for="prop.name + '_input'" label-size="sm" label-class="mb-0" class="mb-1">
                        <nav-items-panel :viewModel="viewModel[prop.name]" :prop="prop" :selectedComponentModel="viewModel"/>
                    </b-form-group>
    
                    <b-form-group v-if="prop.type === 'custom' && prop.editor === 'table-fields-panel'" :label="prop.label" :label-for="prop.name + '_input'" label-size="sm" label-class="mb-0" class="mb-1">
                        <table-fields-panel :fields="viewModel[prop.name]"/>
                    </b-form-group>
    
                     <b-form-group v-if="prop.type === 'custom' && prop.editor === 'time-series-panel'" :label="prop.label" :label-for="prop.name + '_input'" label-size="sm" label-class="mb-0" class="mb-1">
                        <time-series-panel :timeSeriesList="viewModel[prop.name]" :viewModel="viewModel"/>
                    </b-form-group>
    
                    <b-form-group v-if="prop.type === 'custom' && prop.editor === 'carousel-slides-panel'" :label="prop.label" :label-for="prop.name + '_input'" label-size="sm" label-class="mb-0" class="mb-1">
                        <carousel-slides-panel :slides="viewModel[prop.name]"/>
                    </b-form-group>
    
                    <b-form-group v-if="prop.type === 'map'" :label="prop.label" :label-for="prop.name + '_input'" label-size="sm" label-class="mb-0" class="mb-1">
                        <b-card v-for="value, key in viewModel[prop.name]" :key="key">
                            <template #header>
                                <b-badge variant="secondary">{{ key }}</b-badge>
                                <b-button class="float-right" v-on:click="" size="sm" variant="danger"><b-icon-trash/></b-button>
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
                            <b-icon-plus-circle/>
                        </b-button>                      
                
                    </b-form-group>
                </div>
                
            </div>
        </div>                   
        `,
    props: ['category', 'dataModel', 'viewModel', 'propDescriptors', 'formulaButtonVariant'],
    data: () => {
        return {
            componentIds: components.getComponentIds(),
        }
    },
    methods: {
        magicWand() {
            ide.magicWand(this.dataModel, this.viewModel.cid, true);
        },
        openIconChooser(prop) {
            Vue.prototype.$eventHub.$emit('icon-chooser', this.viewModel, prop.name);
        },
        createTmpModel(prop) {
            let tmpModel = {};
            $set(tmpModel, prop.name, this.viewModel[prop.name]);
            return tmpModel;
        },
        resetData() {
            $c(this.viewModel.cid).reset();
        },
        refreshData() {
            $c(this.viewModel.cid).update();
        },
        isFormulaMode(prop) {
            return typeof this.viewModel[prop.name] === 'string' && this.viewModel[prop.name].startsWith('=');
        },
        setFormulaMode(prop, formulaMode) {
            if (formulaMode) {
                switch (prop.type) {
                    case 'checkbox':
                        this.$set(this.viewModel, prop.name, '=' + (this.viewModel[prop.name] ? 'true' : 'false'));
                        break;
                    case 'range':
                    case 'number':
                        this.$set(this.viewModel, prop.name, "=" + (this.viewModel[prop.name] !== undefined ? this.viewModel[prop.name] : 0));
                        break;
                    default:
                        this.$set(this.viewModel, prop.name, "=`" + (this.viewModel[prop.name] ? this.viewModel[prop.name] : '') + "`");
                        break;
                }
            } else {
                switch (prop.type) {
                    case 'checkbox':
                        try {
                            this.$set(this.viewModel, prop.name, $c(this.viewModel.cid).$eval(this.viewModel[prop.name], false));
                        } catch (e) {
                            this.$set(this.viewModel, prop.name, false);
                        }
                        break;
                    case 'range':
                    case 'number':
                        try {
                            this.$set(this.viewModel, prop.name, $c(this.viewModel.cid).$eval(this.viewModel[prop.name], undefined));
                        } catch (e) {
                            this.$set(this.viewModel, prop.name, undefined);
                        }
                        break;
                    default:
                        try {
                            this.$set(this.viewModel, prop.name, $c(this.viewModel.cid).$eval(this.viewModel[prop.name], undefined));
                        } catch (e) {
                            this.$set(this.viewModel, prop.name, undefined);
                        }
                        break;
                }
            }
            Vue.nextTick(() => {
                this.$eventHub.$emit('set-formula-mode', prop, formulaMode)
            });
        },
        actualType(prop) {
            if (prop.actualType) {
                return prop.actualType;
            } else {
                switch (prop.type) {
                    case 'checkbox':
                        return 'boolean';
                    case 'number':
                    case 'range':
                        return 'number';
                    default:
                        return undefined;
                }
            }
        },
        evalPropState(prop) {
            try {
                if ($c(this.viewModel.cid) && this.viewModel[prop.name] && (typeof this.viewModel[prop.name] === 'string') &&
                    (this.viewModel[prop.name].startsWith('=') || this.isCodeEditor())
                ) {
                    try {
                        let result = $c(this.viewModel.cid).$evalCode(this.viewModel[prop.name]);
                        let expectedType = this.actualType(prop);
                        if (result !== undefined && expectedType !== undefined && (Array.isArray(expectedType) ? expectedType.indexOf(typeof result) > -1 : expectedType !== typeof result)) {
                            prop.state = false;
                            prop.invalidFeedback = `Expected '${expectedType}' but got '${typeof result}'`;
                        } else {
                            prop.state = true;
                            if (result === undefined) {
                                prop.validFeedback = 'undefined';
                            } else if (typeof result === 'function') {
                                let str = result.toString();
                                prop.validFeedback = str.substring(0, str.indexOf("{"));
                            } else {
                                prop.validFeedback = Tools.truncate(JSON.stringify(result), 100);
                            }
                        }
                    } catch (e) {
                        console.warn('error evaluating state for ' + this.viewModel.cid + '.' + prop.name, e);
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
            if (prop.editorMode === 'tabs') {
                item = components.createComponentModel('ContainerView');
                item.title = '(no title ' + this.viewModel[prop.name].length + ')';
                item.dataSource = this.viewModel.cid;
                components.registerComponentModel(item);
            }
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

Vue.component('lazy-component-property-editor', {
    extends: Vue.component('component-properties-panel'),
    template: `
        <div>
        
            <div v-if="prop.type === 'text' && !isFormulaMode(prop)"> 
                <b-form-group :label="prop.label" :label-for="prop.name + '_input'" 
                    :eval="evalPropState(prop)"
                    :state="prop.state" 
                    :invalid-feedback="prop.invalidFeedback"
                    :valid-feedback="prop.validFeedback" 
                    label-size="sm" label-class="mb-0" class="mb-1"
                    :description="prop.description"
                >
                    <b-input-group>
                        <b-input-group-prepend v-if="prop.docLink">
                          <b-button v-if="prop.docLink" variant="info" target="_blank" :href="prop.docLink" size="sm">?</b-button>
                        </b-input-group-prepend>                        
                        <b-form-input size="sm"  
                            :placeholder="prop.placeholder"
                            v-model="tmpViewModel[prop.name]" type="text" :disabled="!getPropFieldValue(prop, 'editable')" 
                            :state="prop.state" @input="onTypeIn(prop)"
                        />
                        <b-input-group-append>                    
                          <b-button v-if="!prop.mandatory && viewModel[prop.name] !== undefined" size="sm" variant="danger" @click="$set(viewModel, prop.name, undefined)">x</b-button>
                          <b-button v-if="!prop.literalOnly" :variant="formulaButtonVariant" size="sm" @click="setFormulaMode(prop, true)"><em>f(x)</em></b-button>
                        </b-input-group-append>                                    
                    </b-input-group>
                </b-form-group>
            </div>
            
            <b-form-group v-if="prop.type === 'textarea' && !isFormulaMode(prop)" :label="prop.label" :label-for="prop.name + '_input'" 
                :eval="evalPropState(prop)"
                :state="prop.state"
                :invalid-feedback="prop.invalidFeedback" 
                :valid-feedback="prop.validFeedback" 
                label-size="sm" label-class="mb-0" class="mb-1"
                :description="prop.description">
                <b-input-group>
                    <b-input-group-prepend v-if="prop.docLink">
                      <b-button v-if="prop.docLink" variant="info" target="_blank" :href="prop.docLink" size="sm">?</b-button>
                    </b-input-group-prepend>                        
                    <b-form-textarea size="sm" 
                        :rows="prop.rows ? prop.rows : 1"
                        :max-rows="prop.maxRows ? prop.maxRows : 10" 
                        v-model="tmpViewModel[prop.name]" :state="prop.state" 
                        :disabled="!getPropFieldValue(prop, 'editable')" 
                        @input="onTypeIn(prop)"
                    >
                    </b-form-textarea>
                    <b-input-group-append>                                
                      <b-button v-if="!prop.mandatory && viewModel[prop.name] !== undefined" size="sm" variant="danger" @click="$set(viewModel, prop.name, undefined)">x</b-button>
                      <b-button v-if="!isFormulaMode(prop) && !prop.literalOnly" :variant="formulaButtonVariant" size="sm" @click="setFormulaMode(prop, true)"><em>f(x)</em></b-button>
                      <b-button v-if="isFormulaMode(prop)" :variant="formulaButtonVariant" size="sm" @click="setFormulaMode(prop, false)"><em><del>f(x)</del></em></b-button>
                    </b-input-group-append>                                    
                </b-input-group>
            </b-form-group>
            
            <b-form-group v-if="prop.type === 'icon' && !isFormulaMode(prop)" :label="prop.label" :label-for="prop.name + '_input'" 
                :eval="evalPropState(prop)"
                :state="prop.state" 
                :invalid-feedback="prop.invalidFeedback"
                :valid-feedback="prop.validFeedback" 
                label-size="sm" label-class="mb-0" class="mb-1"
                :description="prop.description">
                <b-input-group>
                    <b-form-input :id="prop.name + '_input'" size="sm"  
                        v-model="tmpViewModel[prop.name]" type="text" :disabled="!getPropFieldValue(prop, 'editable')" :state="prop.state"
                        @input="onTypeIn(prop)"
                    />
                    <b-input-group-append>                                
                        <b-button variant="info" size="sm" @click="openIconChooser(prop)"><b-icon-pencil></b-icon-pencil></b-button>
                        <b-button v-if="!prop.literalOnly" :variant="formulaButtonVariant" size="sm" @click="setFormulaMode(prop, true)"><em>f(x)</em></b-button>
                    </b-input-group-append>                                    
                </b-input-group>
            </b-form-group>
            
            <b-form-group v-if="isCodeEditor() || isFormulaMode(prop)" :label="prop.label" :label-for="prop.name + '_input'" 
                :eval="evalPropState(prop)"
                :state="prop.state"
                :invalid-feedback="prop.invalidFeedback" 
                :valid-feedback="prop.validFeedback" 
                label-size="sm" label-class="mb-0" class="mb-1"
                :description="prop.description">
                <b-input-group>
                    <b-input-group-prepend v-if="prop.docLink">
                      <b-button v-if="prop.docLink" variant="info" target="_blank" :href="prop.docLink" size="sm">?</b-button>
                    </b-input-group-prepend>                        
                    <div :ref="prop.name + '__editor'" @click="focusEditor" style="flex-grow: 1; top: 0; right: 0; bottom: 0; left: 0;">
                    </div>
                    <b-input-group-append>                                
                      <b-button v-if="prop.type === 'icon'" variant="info" size="sm" @click="openIconChooser(prop)"><b-icon-pencil></b-icon-pencil></b-button>
                      <b-button v-if="!isFormulaMode(prop) && !prop.literalOnly" :variant="formulaButtonVariant" size="sm" @click="setFormulaMode(prop, true)"><em>f(x)</em></b-button>
                      <b-button v-if="isFormulaMode(prop)" :variant="formulaButtonVariant" size="sm" @click="setFormulaMode(prop, false)"><em><del>f(x)</del></em></b-button>
                    </b-input-group-append>                                    
                </b-input-group>
            </b-form-group>
            
            <div v-if="prop.manualApply && edited" class="text-right">
                <b-button size="sm" variant="warning" @click="apply(prop)"><b-icon-check class="mr-2"/>Apply {{prop.label}}</b-button>
            </div>
            
        </div>
    `,
    props: ['prop', 'viewModel', 'tmpViewModel', 'formulaButtonVariant'],
    data: function () {
        return {
            editor: false,
            edited: false
        }
    },
    watch: {
        'viewModel.dataSource': function () {
            if (this.prop.name === 'dataSource' && this.isFormulaMode(this.prop)) {
                if (this._editor) {
                    if (this.viewModel.dataSource.slice(1) !== this._editor.getValue()) {
                        this._editor.setValue(this.viewModel.dataSource.slice(1), 1);
                    }
                } else {
                    this.initEditor();
                }
            }
        },
        'viewModel.defaultValue': function () {
            if (this.prop.name === 'defaultValue' && this.isFormulaMode(this.prop)) {
                if (this._editor) {
                    if (this.viewModel.defaultValue.slice(1) !== this._editor.getValue()) {
                        this._editor.setValue(this.viewModel.defaultValue.slice(1), 1);
                    }
                } else {
                    this.initEditor();
                }
            }
        }
    },
    mounted() {
        this.initEditor();
        // events
        this._setFormulaModeHandler = (prop, formulaMode) => {
            if (prop.name === this.prop.name) {
                this.initEditor(true);
            }
        };
        this._componentSelectedHandler = (cid) => {
            if (cid !== this.viewModel.cid) {
                if (this.edited) {
                    if (confirm(`Property "${this.prop.label}" has been modified. Do you want to apply the changes?`)) {
                        $set(this.viewModel, this.prop.name, this.tmpViewModel[this.prop.name]);
                    }
                    this.edited = false;
                }
            }
            this.editor = false;
            Vue.nextTick(() => {
                if (cid === this.viewModel.cid) {
                    this.initEditor();
                }
            });
        };
        this.$eventHub.$on('set-formula-mode', this._setFormulaModeHandler);
        this.$eventHub.$on('component-selected', this._componentSelectedHandler);

    },
    beforeDestroy() {
        if (this.edited) {
            if (confirm(`Property "${this.prop.label}" has been modified. Do you want to apply the changes?`)) {
                $set(this.viewModel, this.prop.name, this.tmpViewModel[this.prop.name]);
            }
            this.edited = false;
        }
        if (this._setFormulaModeHandler) {
            this.$eventHub.$off('set-formula-mode', this._setFormulaModeHandler);
            this._setFormulaModeHandler = undefined;
        }
        if (this._componentSelectedHandler) {
            this.$eventHub.$off('component-selected', this._componentSelectedHandler);
            this._componentSelectedHandler = undefined;
        }
    },
    methods: {
        isCodeEditor() {
            return this.prop?.type && this.prop.type.startsWith('code/');
        },
        focusEditor() {
            console.info('focus');
            if (this._editor) {
                this._editor.focus();
            }
        },
        initEditor(focus) {
            if (this.isFormulaMode(this.prop) || this.isCodeEditor()) {

                this.editor = true;
                let lang = this.isFormulaMode(this.prop) ? 'javascript' : this.prop.type.split('/')[1];

                if (this._editor) {
                    try {
                        this._editor.destroy();
                    } catch (e) {
                        console.error('editor', e);
                    }
                }

                Vue.nextTick(() => {
                    try {
                        let target = this.$refs[this.prop.name + '__editor'];
                        if (!target || target.tagName != 'DIV') {
                            console.log('cannot build editor on target', this.prop.name, target);
                            return;
                        }
                        this._editor = ace.edit(target, {
                            mode: "ace/mode/" + lang,
                            selectionStyle: "text"
                        });
                        this._editor.setOptions({
                            autoScrollEditorIntoView: true,
                            copyWithEmptySelection: true,
                            enableBasicAutocompletion: true,
                            enableSnippets: false,
                            enableLiveAutocompletion: true,
                            showLineNumbers: false,
                            minLines: this.prop.rows ? this.prop.rows : (this.prop.type === 'textarea' ? 3 : 1),
                            maxLines: this.prop.maxRows ? this.prop.maxRows : 10
                        });
                        this._editor.renderer.setScrollMargin(5, 18);
                        // this._editor.setTheme("ace/theme/monokai");
                        //this._editor.session.setMode("ace/mode/javascript");

                        if (this.isFormulaMode(this.prop)) {
                            if (!this.tmpViewModel[this.prop.name]) {
                                console.warn("editor tmpViewModel not defined", this.prop.name, this.prop);
                                $set(this.tmpViewModel, this.prop.name, this.viewModel[this.prop.name]);
                            }
                            this._editor.session.setValue(this.tmpViewModel[this.prop.name].slice(1));
                        } else {
                            this._editor.session.setValue(this.tmpViewModel[this.prop.name] ? this.tmpViewModel[this.prop.name] : '');
                        }
                        this._editor.on('change', () => {
                            if (this.isFormulaMode(this.prop)) {
                                $set(this.tmpViewModel, this.prop.name, '=' + this._editor.getValue());
                            } else {
                                $set(this.tmpViewModel, this.prop.name, this._editor.getValue());
                            }
                            this.onTypeIn(this.prop);
                        });

                        if (lang === 'javascript') {
                            this._editor.session.$worker.send("changeOptions", [{asi: true}]);
                            this._editor.completers = [new JavascriptCompleter(this.viewModel, this.dataModel)];
                        }
                        if (focus) {
                            this._editor.focus();
                        }
                    } catch (e) {
                        console.error('error building editor', e);
                        this.editor = false;
                    }
                });
            } else {
                this.editor = false;
            }
        },
        apply(prop) {
            let enableFormulaMode = !this.isFormulaMode(prop) && this.tmpViewModel[prop.name].startsWith('=');
            $set(this.viewModel, prop.name, this.tmpViewModel[prop.name]);
            this.edited = false;
            if (enableFormulaMode) {
                Vue.nextTick(() => this.$eventHub.$emit('set-formula-mode', prop, true));
            }
            this.evalPropState(prop);
        },
        onTypeIn(prop) {
            if (prop.manualApply) {
                this.edited = (this.viewModel[prop.name] !== this.tmpViewModel[prop.name] && !(!this.viewModel[prop.name] && !this.tmpViewModel[prop.name]));
                return;
            }
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            this.timeout = setTimeout(() => {
                this.timeout = undefined;
                this.apply(prop);
            }, 200);
        }
    }
});