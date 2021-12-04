Vue.component('component-properties-panel', {
    template: `
        <div>

            <div v-if="category === 'data'">
                <data-editor-panel :dataModel="dataModel" :eval="viewModel" size="sm" panelClass="mb-1" max-rows="15" @update-data="updateDataModel" :readOnly="true"></data-editor-panel>
                <div class="text-right">
                    <b-button size="sm" variant="secondary" @click="resetData"><b-icon-arrow-repeat class="mr-1"></b-icon-arrow-repeat>Reset data</b-button>
                </div>
            </div>

            <div v-if="category === 'main'">
                <b-button v-b-toggle.view-model-editor class="float-right" size="sm" variant="link">View model</b-button>
                <b-collapse id="view-model-editor" style="clear: both">
                    <data-editor-panel :dataModel="viewModel" size="sm" panelClass="mb-1" rows="15" :readOnly="true"></data-editor-panel>
                </b-collapse>
            </div>
                    
            <div v-for="prop of propDescriptors.filter(p => p.category === category && p.name !== 'cid')" :key="prop.name">
            
                <lazy-component-property-editor :prop="prop" :viewModel="viewModel" :tmpViewModel="createTmpModel(prop)" :formulaButtonVariant="formulaButtonVariant"></lazy-component-property-editor>
            
                <div v-if="prop.type === 'icon' && !isFormulaMode(prop)"> 
                    <b-form-group :label="prop.label" :label-for="prop.name + '_input'" 
                        :eval="evalPropState(prop)"
                        :state="prop.state" 
                        :invalid-feedback="prop.invalidFeedback"
                        :valid-feedback="prop.validFeedback" 
                        label-size="sm" label-class="mb-0" class="mb-1"
                        :description="prop.description">
                        <b-input-group>
                            <b-form-input :id="prop.name + '_input'" size="sm"  
                                v-model="viewModel[prop.name]" type="text" :disabled="!getPropFieldValue(prop, 'editable')" :state="prop.state" @input="onTypeIn(prop)"></b-form-input>
                            <b-input-group-append>                                
                              <b-button variant="info" size="sm" @click="openIconChooser(prop)"><b-icon-pencil></b-icon-pencil></b-button>
<!--                              <b-button v-if="isFormulaMode(prop)" :variant="formulaButtonVariant" size="sm" @click="setFormulaMode(prop, false)"><em><del>f(x)</del></em></b-button>-->
                            </b-input-group-append>                                    
                        </b-input-group>
                    </b-form-group>
                </div>

                 <div v-if="(prop.type === 'number' || prop.type === 'range') && !isFormulaMode(prop)"> 
                    <b-form-group :label="prop.label" :label-for="prop.name + '_input'" 
                        label-size="sm" label-class="mb-0" class="mb-1"
                        :description="prop.description">
                        <b-input-group>
                            <b-form-input :id="prop.name + '_input'" size="sm"  
                                v-model="viewModel[prop.name]" :type="prop.type" 
                                :disabled="!getPropFieldValue(prop, 'editable')"
                                :min="getPropFieldValue(prop, 'min')"
                                :max="getPropFieldValue(prop, 'max')"
                                :step="getPropFieldValue(prop, 'step')"
                                :value="getPropFieldValue(prop, 'defaultValue')"
                            ></b-form-input>
                            <b-input-group-append>   
                              <b-button v-if="prop.docLink" variant="info" target="_blank" :href="prop.docLink" size="sm">?</b-button>
                              <b-button v-if="!prop.literalOnly" :variant="formulaButtonVariant" size="sm" @click="setFormulaMode(prop, true)"><em>f(x)</em></b-button>
                            </b-input-group-append>                                    
                        </b-input-group>
                    </b-form-group>
                </div>
   
                <div v-if="prop.type === 'data' && !isFormulaMode(prop)" >
                    <data-editor-panel :id="prop.name + '_input'" v-if="prop.type === 'data'" :label="prop.label" size="sm" label-class="mb-0" panel-class="mb-1" :rows="prop.rows" :max-rows="prop.maxRows"
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
                    <div class="d-flex align-items-start">
                        <b-form-group 
                            :label="prop.label" 
                            :label-for="prop.name + '_input'" 
                            label-size="sm" label-cols="6" label-class="mb-0" class="mb-1 flex-grow-1"
                            :description="prop.description">
                            <b-form-checkbox :id="prop.name + '_input'" size="sm" class="mt-1 cols-2"
                                v-model="viewModel[prop.name]" switch :disabled="!getPropFieldValue(prop, 'editable')"></b-form-checkbox>
                        </b-form-group>
                        <b-button :variant="formulaButtonVariant" size="sm" :disabled="prop.literalOnly" :style="'visibility: '+(prop.literalOnly ? 'hidden' : 'visible')"
                            @click="setFormulaMode(prop, true)"><em>f(x)</em></b-button>
                    </div>
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
            componentIds: components.getComponentIds(),
            //tmpViewModel: this.viewModel ? JSON.parse(JSON.stringify(this.viewModel)) : undefined
        }
    },
    // mounted: function() {
    //     this.tmpViewModel = this.viewModel ? JSON.parse(JSON.stringify(this.viewModel)) : undefined;
    // },
    methods: {
        openIconChooser(prop) {
            Vue.prototype.$eventHub.$emit('icon-chooser', this.viewModel, prop);
        },
        createTmpModel(prop) {
            let tmpModel = {};
            tmpModel[prop.name] = this.viewModel[prop.name];
            return tmpModel;
        },
        resetData() {
            $c(this.viewModel.cid).dataModel = undefined;
        },
        isFormulaMode(prop) {
            return typeof this.viewModel[prop.name] === 'string' && this.viewModel[prop.name].startsWith('=');
            // return ((prop.type === 'checkbox' || prop.type === 'number' || prop.type === 'range') && typeof this.viewModel[prop.name] === 'string')
            //     || (prop.type === 'select' && typeof this.viewModel[prop.name] === 'string' && this.viewModel[prop.name].startsWith('='));
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
                        this.$set(this.viewModel, prop.name, "='" + (this.viewModel[prop.name] ? this.viewModel[prop.name] : '') + "'");
                        break;
                }
            } else {
                console.info("unsetFormulaMode", this.viewModel[prop.name]);
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
                console.info("=>", this.viewModel[prop.name]);
            }
            Vue.nextTick(() => {
                console.info('editor - emit set-formula-mode', prop.name, formulaMode);
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
            console.info("evalPropState", prop);
            try {
                if (this.viewModel[prop.name] && (typeof this.viewModel[prop.name] === 'string') && this.viewModel[prop.name].startsWith('=')) {
                    try {
                        let result = $c(this.viewModel.cid).$eval(this.viewModel[prop.name]);
                        console.info("eval", prop);
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

// ===========================================================================================================
// EDITOR
// ===========================================================================================================

class JavascriptCompleter {

    constructor(viewModel, dataModel, showActions) {
        this.showActions = showActions;
        this.dataModel = dataModel;
        this.viewModel = viewModel;
    }

    //splitRegex: /[^a-zA-Z_0-9\$\-\u00C0-\u1FFF\u2C00-\uD7FF\w]/,
    splitRegex = /[^a-zA-Z_0-9\$\-\u00C0-\u1FFF\u2C00-\uD7FF\w'"`\.]/;

    getWordIndex(doc, pos) {
        var textBefore = doc.getTextRange(ace.Range.fromPoints({row: 0, column: 0}, pos));
        return textBefore.split(javascriptCompleter.splitRegex).length - 1;
    }

    isQuote(expression) {
        return expression === "'" || expression === '"' || expression === '`';
    }

    getEndQuote(expression) {
        if (["'", '"', '`'].indexOf(expression.substring(expression.length - 1)) > -1) {
            return expression.substring(expression.length - 1);
        } else {
            return undefined;
        }
    }

    getStartQuote(expression) {
        if (["'", '"', '`'].indexOf(expression.substring(0, 1)) > -1) {
            return expression.substring(0, 1);
        } else {
            return undefined;
        }
    }

    isInString(expressions, index) {
        let openedQuote = undefined;
        for (let i = 0; i <= index; i++) {
            if (this.isQuote(expressions[i])) {
                if (!openedQuote) {
                    openedQuote = expressions[i];
                } else if (openedQuote === expressions[i]) {
                    openedQuote = undefined;
                }
            } else {
                let startQuote = this.getStartQuote(expressions[i]);
                if (startQuote) {
                    if (!openedQuote) {
                        openedQuote = startQuote;
                    } else if (openedQuote === startQuote) {
                        openedQuote = undefined;
                    }
                }
                let endQuote = this.getEndQuote(expressions[i]);
                if (endQuote) {
                    if (!openedQuote) {
                        openedQuote = endQuote;
                    } else if (openedQuote === endQuote) {
                        openedQuote = undefined;
                    }
                }
            }
        }
        return !!openedQuote;
    }

    isEndOfExpression(expressions, index) {
        if (index < 1) {
            return true;
        } else {
            if (["'", '"', '`'].indexOf(expressions[index].substring(expressions[index].length - 1)) > -1) {
                return true;
            }

        }
    }

    getCompletions(editor, session, pos, prefix, callback) {
        try {
            let textBefore = session.getTextRange(ace.Range.fromPoints({row: pos.row, column: 0}, pos));
            let expressionsBefore = textBefore.split(this.splitRegex);

            console.info("editor autocomplete (expressionsBefore)", expressionsBefore);

            let i = expressionsBefore.length - 1;

            let wordList = [];

            if (this.isInString(expressionsBefore, i)) {
                console.info('editor is in string');
                if (expressionsBefore[i - 1] === '$d' || expressionsBefore[i - 1] === '$c' || expressionsBefore[i - 1] === '$v') {
                    wordList = components.getComponentIds().map(cid => ({
                        value: cid,
                        text: cid,
                        meta: 'component'
                    }));
                }
            } else {

                let currentExpressionSplit = expressionsBefore[i].split(".");

                console.info("editor autocomplete (currentExpressionSlit)", currentExpressionSplit);

                if (currentExpressionSplit.length === 1) {
                    wordList = [
                        {
                            value: "$collab",
                            text: "$collab",
                            meta: "static"
                        },
                        {
                            value: "$tools",
                            text: "$tools",
                            meta: "static"
                        },
                        {
                            value: "this",
                            text: "this",
                            meta: "component"
                        },
                        {
                            value: "$d",
                            text: "$d(identifier)",
                            meta: "function"
                        },
                        {
                            value: "$c",
                            text: "$c(identifier)",
                            meta: "function"
                        },
                        {
                            value: "$v",
                            text: "$v(identifier)",
                            meta: "function"
                        },
                        {
                            value: "SM",
                            text: "SM",
                            meta: "constant"
                        },
                        {
                            value: "MD",
                            text: "MD",
                            meta: "constant"
                        },
                        {
                            value: "L",
                            text: "L",
                            meta: "constant"
                        },
                        {
                            value: "XL",
                            text: "XL",
                            meta: "constant"
                        }
                    ];
                }

                if (currentExpressionSplit.length === 2) {
                    switch (currentExpressionSplit[0]) {
                        case 'this':
                            wordList = ["dataModel", "viewModel", "screenWidth", "screenHeight"];
                            if (this.showActions) {
                                wordList.push(...$c(this.viewModel.cid).actionNames())
                            }
                            break;
                        case '$tools':
                            wordList = $tools.FUNCTION_DESCRIPTORS;
                            break;
                        case '$collab':
                            wordList = $collab.FUNCTION_DESCRIPTORS;
                            break;
                        case '':

                            if (i >= 2) {
                                switch (expressionsBefore[i - 2]) {
                                    case '$c':
                                        wordList = ["dataModel", "viewModel", "screenWidth", "screenHeight"];
                                    case '$v':
                                    case '$d':
                                        let target = undefined;
                                        try {
                                            let cid = $c(this.viewModel.cid).$eval("=" + expressionsBefore[i - 1]);
                                            console.info('editor - cid', cid);
                                            switch (expressionsBefore[i - 2]) {
                                                case '$c':
                                                    target = $c(cid);
                                                    if (this.showActions) {
                                                        wordList.push(...target.actionNames())
                                                    }
                                                    break;
                                                case '$d':
                                                    target = $d(cid);
                                                    wordList.push(...Object.keys(target));
                                                    break;
                                                case '$v':
                                                    target = $v(cid);
                                                    wordList.push(...Object.keys(target));
                                                    break;
                                            }
                                        } catch (e) {
                                            console.error('editor', e);
                                        }
                                        break;
                                }

                            }


                            break;
                    }
                }

                if (currentExpressionSplit.length === 3) {
                    switch (currentExpressionSplit[0]) {
                        case 'this':
                            switch (currentExpressionSplit[1]) {
                                case 'dataModel':
                                    if (this.dataModel) {
                                        wordList.push(...Object.keys(this.dataModel));
                                    }
                                    break;
                                case 'viewModel':
                                    wordList.push(...Object.keys(this.viewModel));
                                    break;
                            }
                            break;
                    }
                }

            }

            console.info("editor autocomplete word list", wordList);

            callback(null, wordList.filter(word => typeof word === 'string' || word.value).map(word => {
                if (typeof word === 'string') {
                    return {
                        caption: word,
                        value: word,
                        meta: "static"
                    }
                } else {
                    return {
                        caption: word.text,
                        value: word.value,
                        meta: word.meta ? word.meta : "function",
                        completer: {
                            insertMatch: (editor, data) => {
                                console.log("editor insert match data", data.value);
                                try {
                                    let pos = editor.getCursorPosition();
                                    let textBefore = editor.getSession().getTextRange(ace.Range.fromPoints({
                                        row: pos.row,
                                        column: 0
                                    }, pos));
                                    let expressionsBefore = textBefore.split(this.splitRegex);
                                    let currentExpressionSplit = expressionsBefore[expressionsBefore.length - 1].split(".");
                                    let beginning = currentExpressionSplit[currentExpressionSplit.length - 1];
                                    if (this.getStartQuote(beginning)) {
                                        beginning = beginning.substring(1);
                                    }
                                    console.log("editor cursor pos", pos, beginning);
                                    editor.insert(data.value.substring(beginning.length));
                                    if (data.meta === 'function') {
                                        editor.insert("()");
                                        pos = editor.getCursorPosition();
                                        console.log("editor cursor pos before moving", pos);
                                        //editor.gotoLine(1, 2);
                                        editor.gotoLine(pos.row + 1, pos.column - 1);
                                    }
                                } catch (e) {
                                    console.error("editor insert match error", e);
                                }
                            }
                        }
                    };
                }
            }));


        } catch (e) {
            console.error("editor error", e);
        }


    }

}

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
                    :description="prop.description">
                    <b-input-group>
                        <b-form-input :id="prop.name + '_input'" size="sm"  
                            v-model="tmpViewModel[prop.name]" type="text" :disabled="!getPropFieldValue(prop, 'editable')" :state="prop.state" @input="onTypeIn(prop)"></b-form-input>
                        <b-input-group-append>                                
                          <b-button v-if="prop.docLink" variant="info" target="_blank" :href="prop.docLink" size="sm">?</b-button>
                          <b-button v-if="!prop.literalOnly" :variant="formulaButtonVariant" size="sm" @click="setFormulaMode(prop, true)"><em>f(x)</em></b-button>
                        </b-input-group-append>                                    
                    </b-input-group>
                </b-form-group>
            </div>

            <b-form-group v-if="prop.type === 'textarea' || isCodeEditor() || isFormulaMode(prop)" :label="prop.label" :label-for="prop.name + '_input'" 
                :eval="evalPropState(prop)"
                :state="prop.state"
                :invalid-feedback="prop.invalidFeedback" 
                :valid-feedback="prop.validFeedback" 
                label-size="sm" label-class="mb-0" class="mb-1"
                :description="prop.description">
                <b-input-group>
                    <b-form-textarea v-if="!editor" :id="prop.name + '_input'" size="sm" 
                        :rows="prop.rows ? prop.rows : 1"
                        :max-rows="prop.maxRows ? prop.maxRows : 10" 
                        v-model="tmpViewModel[prop.name]" :state="prop.state" 
                        :disabled="!getPropFieldValue(prop, 'editable')" 
                        @input="onTypeIn(prop)"
                    >
                    </b-form-textarea>
                    <div v-else :id="prop.name + '_input'" style="flex-grow: 1; top: 0; right: 0; bottom: 0; left: 0;">
                    </div>
                    <b-input-group-append>                                
                      <b-button v-if="prop.docLink" variant="info" target="_blank" :href="prop.docLink" size="sm">?</b-button>
                      <b-button v-if="!isFormulaMode(prop) && !prop.literalOnly" :variant="formulaButtonVariant" size="sm" @click="setFormulaMode(prop, true)"><em>f(x)</em></b-button>
                      <b-button v-if="isFormulaMode(prop)" :variant="formulaButtonVariant" size="sm" @click="setFormulaMode(prop, false)"><em><del>f(x)</del></em></b-button>
                    </b-input-group-append>                                    
                </b-input-group>
            </b-form-group>
            
            <b-button v-if="prop.manualApply" size="sm" variant="secondary" class="float-right" @click="apply(prop)">Apply {{prop.label}}</b-button>
            
        </div>
    `,
    props: ['prop', 'viewModel', 'tmpViewModel', 'formulaButtonVariant'],
    data: function () {
        return {
            editor: false
        }
    },
    created() {
        console.info("editor - register set-formula-mode", this.prop?.name);
        this._handler = (prop, formulaMode) => {
            if (prop.name === this.prop.name) {
                console.info("editor - on set-formula-mode", prop.name, formulaMode);
                this.initEditor(true);
            }
        };
        this.$eventHub.$on('set-formula-mode', this._handler);
    },
    mounted() {
        console.log('lazy editor build');
        this.initEditor();
    },
    beforeDestroy() {
        if (this._handler) {
            console.info("editor - unregister set-formula-mode", this.prop?.name);
            this.$eventHub.$off('set-formula-mode', this._handler);
            this._handler = undefined;
        }
    },
    methods: {
        isCodeEditor() {
            return this.prop?.type && this.prop.type.startsWith('code/');
        },
        initEditor(focus) {
            if (this._editor) {
                try {
                    this._editor.destroy();
                } catch (e) {
                    console.error('editor', e);
                }
            }
            if (this.isFormulaMode(this.prop) || this.isCodeEditor()) {
                console.log('buidling editor', this.viewModel, this.tmpViewModel, document.getElementById(this.prop.name + '_input'));
                console.error("editor trace");

                this.editor = true;
                let lang = this.isFormulaMode(this.prop) ? 'javascript' : this.prop.type.split('/')[1];

                Vue.nextTick(() => {
                    this._editor = ace.edit(document.getElementById(this.prop.name + '_input'), {
                        mode: "ace/mode/"+lang,
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
                    this._editor.renderer.setScrollMargin(10, 10);
                    // this._editor.setTheme("ace/theme/monokai");
                    //this._editor.session.setMode("ace/mode/javascript");

                    if (this.isFormulaMode(this.prop)) {
                        this._editor.session.setValue(this.tmpViewModel[this.prop.name].slice(1));
                    } else {
                        this._editor.session.setValue(this.tmpViewModel[this.prop.name] ? this.tmpViewModel[this.prop.name] : '');
                    }
                    console.log('editor built', this._editor.getValue());
                    this._editor.on('change', () => {
                        if (this.isFormulaMode(this.prop)) {
                            $set(this.tmpViewModel, this.prop.name, '=' + this._editor.getValue());
                        } else {
                            $set(this.tmpViewModel, this.prop.name, this._editor.getValue());
                        }
                        this.onTypeIn(this.prop);
                    });

                    console.info('editor completers', this._editor.completers);

                    if (lang === 'javascript') {
                        this._editor.completers = [new JavascriptCompleter(this.viewModel, this.dataModel)];
                    }
                    if (focus) {
                        this._editor.focus();
                    }
                });
            } else {
                this.editor = false;
            }
        },
        apply(prop) {
            let enableFormulaMode = !this.isFormulaMode(prop) && this.tmpViewModel[prop.name].startsWith('=');
            $set(this.viewModel, prop.name, this.tmpViewModel[prop.name]);
            if (enableFormulaMode) {
                Vue.nextTick(() => this.$eventHub.$emit('set-formula-mode', prop, true));
            }
            this.evalPropState(prop);
        },
        onTypeIn(prop) {
            if (prop.manualApply) {
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