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

Vue.component('events-panel', {
    template: `
        <div v-if="viewModel">
        
            <b-form-select :disabled="selectedEvent.empty" class="mb-2" 
                v-model="rawSelectedEvent" 
                :options="eventOptions" 
                :select-size="4" size="sm"
            />

            <div class="mb-3">
                 <b-button :disabled="selectedEvent.empty" size="sm" @click="deleteEvent()" class="mr-1">
                    <b-icon-trash></b-icon-trash> delete event
                </b-button>    
                
                <b-button size="sm" @click="addEvent()" class="text-right">
                    <b-icon-plus-circle></b-icon-plus-circle> new event
                </b-button>

                <b-button :disabled="selectedEvent.actions.length === 0" size="sm" @click="copyEvent()" class="text-right">
                    copy
                </b-button>

                <b-button :disabled="!$copiedEvent" size="sm" @click="pasteEvent()" class="text-right">
                    paste
                </b-button>
               
            </div>

            <!-- selected event -->

            <b-form-group label="Global" label-cols="6" label-size="sm" label-class="mb-0" class="mb-1">
                <b-form-checkbox :disabled="selectedEvent.empty" 
                    v-model="selectedEvent.global" 
                    switch size="sm" class="mt-1" 
                    @change="onGlobalChanged" 
                />
            </b-form-group>

            <b-form-datalist id="global-event-list-id" :options="globalEvents()"/>
            
            <b-form-group label="Name" label-size="sm" label-class="mb-0" class="mb-1">
                <b-form-input :disabled="selectedEvent.empty" v-if="selectedEvent.global" 
                    placeholder="enter or select a global event name..." list="global-event-list-id" 
                    v-model="selectedEvent.name" :options="selectableEventNames()" size="sm"
                />
                <b-form-select :disabled="selectedEvent.empty" v-else v-model="selectedEvent.name" 
                    :options="selectableEventNames()" size="sm"
                />
            </b-form-group>

            <b-form-group label="Breakpoint"
                description="If enabled, all conditions and actions of this event will stop in the debugger (browser debugger must be activated)" 
                label-cols="6" label-size="sm" label-class="mb-0" class="mb-1"
            >
                <b-form-checkbox :disabled="selectedEvent.empty" 
                    v-model="eventBreakpoint" 
                    switch size="sm" class="mt-1" 
                />
            </b-form-group>

            <b-form-group label="Actions" label-size="sm" label-class="mb-0" class="mb-1"/>
            
            <b-form-select :disabled="selectedEvent.empty" class="mb-2" 
                v-model="rawSelectedAction" :options="actionOptions" :select-size="4" size="sm"
            />
            
            <div class="mb-3">
                <b-button :disabled="selectedEvent.empty" size="sm" @click="moveActionUp()" class="mr-1" 
                    :enabled="selectedAction && selectedEvent.actions.indexOf(selectedAction) > 0"
                >
                    <b-icon-arrow-up/>
                </b-button>    

                 <b-button :disabled="selectedEvent.empty" size="sm" @click="moveActionDown()" class="mr-1" 
                    :enabled="selectedAction && selectedEvent.actions.indexOf(selectedAction) < selectedEvent.actions.length"
                >
                    <b-icon-arrow-down/>
                </b-button>    
                 <b-button :disabled="selectedEvent.empty" size="sm" @click="deleteAction()" class="mr-1" :enabled="selectedAction">
                    <b-icon-trash/>
                </b-button>    
                
                <b-button :disabled="selectedEvent.empty" size="sm" @click="addAction(selectedEvent)" class="text-right">
                    <b-icon-plus-circle/>
                </b-button>
               
            </div>

            <!-- selected action -->

             <b-form-group label="Description" label-size="sm" label-class="mb-0" class="mb-1">
                <b-form-input :disabled="selectedAction.empty" v-model="selectedAction.description" size="sm"/>
            </b-form-group>
       
            <b-form-group label="Target" label-size="sm" label-class="mb-0" class="mb-1"
                invalid-feedback="Missing component"
                :state="selectableComponents().indexOf(selectedAction.targetId) !== -1"
            >
                <b-input-group v-if="!searchingActionTarget">
                  <b-form-select 
                    :disabled="selectedAction.empty" 
                    v-model="selectedAction.targetId" 
                    :options="selectableComponentsWithAdditional(selectedAction.targetId)" 
                    size="sm"
                  />
                  <b-input-group-append>
                      <b-button :disabled="selectedAction.empty" variant="info" size="sm" @click="searchActionTarget">
                        <b-icon-search/>
                      </b-button>
                  </b-input-group-append>    
                </b-input-group>
                <b-form-input v-if="searchingActionTarget" 
                    ref="searchActionTargetInput" 
                    placeholder="Type in a target..." 
                    v-model="searchActionTargetValue" 
                    list="action-target" 
                    size="sm" 
                    @blur="endSearchActionTarget" 
                    @input="checkEndSearchActionTarget"
                />
                <b-form-datalist id="action-target" :options="selectableComponents()" size="sm"></b-form-datalist>                        
            </b-form-group>

            <b-form-group label="Action" label-size="sm" label-class="mb-0" class="mb-1">
                <b-form-select :disabled="selectedAction.empty" v-model="selectedAction.name" :options="selectableActionNames(selectedAction.targetId, selectedAction.name)" size="sm"/>
            </b-form-group>

<!--            <b-form-group label="Ask for user confirmation" label-size="sm" label-class="mb-0" class="mb-1">-->
<!--                <b-form-checkbox :disabled="selectedAction.empty" switch v-model="selectedAction.confirm" size="sm"/>-->
<!--            </b-form-group>-->

<!--            <b-form-group v-if="selectedAction.confirm" label="Confirmation title" label-size="sm" label-class="mb-0" class="mb-1">-->
<!--                <b-form-input v-model="selectedAction.confirmTitle" size="sm"/>-->
<!--            </b-form-group>-->

<!--            <b-form-group v-if="selectedAction.confirm" label="Confirmation message" label-size="sm" label-class="mb-0" class="mb-1">-->
<!--                <b-form-input v-model="selectedAction.confirmMessage" size="sm"/>-->
<!--            </b-form-group>-->

            <b-form-group label="Argument(s)" label-size="sm" label-class="mb-0" class="mb-1"
                :eval="evalArgumentState()"
                :state="argumentState" 
                :invalid-feedback="argumentInvalidFeedback"
                :valid-feedback="argumentValidFeedback" 
                description="Comma-separated list of valid JavaScript expressions when several arguments are expected. Note that 'target' hold the target component. For instance, $d(target) will access the target's data model."
            >
<!--                <b-form-textarea :disabled="selectedAction.empty" v-model="selectedAction.argument" size="sm" -->
<!--                    :state="argumentState" @input="evalArgumentState()"-->
<!--                ></b-form-textarea>-->
                <code-editor 
                    :disabled="selectedAction.empty" 
                    v-model="selectedAction.argument" 
                    @input="evalArgumentState()"
                    :contextComponent="buildEditorContextComponent(true)"
                    :contextObject="selectedAction"
                />
            </b-form-group>

            <b-form-group label="Condition" label-size="sm" label-class="mb-0" class="mb-1"
                :eval="evalConditionState()"
                :state="conditionState" 
                :invalid-feedback="conditionInvalidFeedback"
                :valid-feedback="conditionValidFeedback" 
            >
                <code-editor 
                    :disabled="selectedAction.empty" 
                    v-model="selectedAction.condition" 
                    @input="evalConditionState()"
                    :contextComponent="buildEditorContextComponent(false)"
                    :contextObject="selectedAction"
                />
            </b-form-group>

            <b-form-group label="Stop here if condition is false"
                description="Do not evaluate the remaining actions if checked (if not checked, the condition only prevents the current action)" 
                label-cols="6" label-size="sm" label-class="mb-0" class="mb-1"
            >
                <b-form-checkbox :disabled="selectedEvent.empty" 
                    v-model="selectedEvent.stopIfConditionIsFalse" 
                    switch size="sm" class="mt-1" 
                />
            </b-form-group>

            <b-form-group label="Action breakpoint"
                description="If enabled, the action will stop in the debugger (browser debugger must be activated)" 
                label-cols="6" label-size="sm" label-class="mb-0" class="mb-1"
            >
                <b-form-checkbox :disabled="selectedEvent.empty" 
                    v-model="actionBreakpoint" 
                    switch size="sm" class="mt-1" 
                />
            </b-form-group>

        </div>                   
        `,
    props: ['viewModel', 'prop', 'selectedComponentModel'],
    data: () => {
        return {
            data_model: undefined,
            eventOptions: [],
            actionOptions: [],
            rawSelectedEvent: undefined,
            rawSelectedAction: undefined,
            conditionState: undefined,
            conditionInvalidFeedback: undefined,
            conditionValidFeedback: undefined,
            argumentState: undefined,
            argumentInvalidFeedback: undefined,
            argumentValidFeedback: undefined,
            searchingActionTarget: false,
            searchActionTargetValue: undefined,
            copiedEvent: window.copiedEvent
        }
    },
    computed: {
        selectedEvent: {
            get: function () {
                return this.rawSelectedEvent ? this.rawSelectedEvent : {empty: true, actions: []};
            },
            set: function (e) {
                this.rawSelectedEvent = e;
            }
        },
        selectedAction: {
            get: function () {
                return this.rawSelectedAction ? this.rawSelectedAction : {empty: true};
            },
            set: function (a) {
                this.rawSelectedAction = a;
            }
        },
        $copiedEvent: {
            get: function() {
                return this.copiedEvent;
            },
            set: function(copiedEvent) {
                this.copiedEvent = window.copiedEvent = copiedEvent;
            }
        },
        eventBreakpoint: {
            get: function() {
                if (this.selectedEvent) {
                    let key = this.selectedComponentModel.cid
                        + '-event-' + this.selectedComponentModel.eventHandlers.indexOf(this.selectedEvent);
                    return _breakpoints.has(key);
                }
            },
            set: function(value) {
                if (this.selectedEvent) {
                    let key = this.selectedComponentModel.cid
                        + '-event-' + this.selectedComponentModel.eventHandlers.indexOf(this.selectedEvent);
                    if (value) {
                        _breakpoints.add(key);
                    } else {
                        _breakpoints.delete(key);
                    }
                }

            }
        },
        actionBreakpoint: {
            get: function() {
                if (this.selectedEvent && this.selectedAction) {
                    let key = this.selectedComponentModel.cid
                        + '-event-' + this.selectedComponentModel.eventHandlers.indexOf(this.selectedEvent)
                        + '-action-' + this.selectedEvent.actions.indexOf(this.selectedAction);
                    return _breakpoints.has(key);
                }
            },
            set: function(value) {
                if (this.selectedEvent && this.selectedAction) {
                    let key = this.selectedComponentModel.cid
                        + '-event-' + this.selectedComponentModel.eventHandlers.indexOf(this.selectedEvent)
                        + '-action-' + this.selectedEvent.actions.indexOf(this.selectedAction);
                    if (value) {
                        _breakpoints.add(key);
                    } else {
                        _breakpoints.delete(key);
                    }
                }

            }
        }
    },
    mounted: function () {
        this.data_model = this.viewModel;
        this.fillEventOptions();
        if (this.data_model.length > 0) {
            this.selectedEvent = this.data_model[0];
            if (this.selectedEvent.actions.length > 0) {
                this.selectedAction = this.selectedEvent.actions[0];
            }
        }
    },
    watch: {
        data_model: {
            handler: function () {
                if (this.data_model) {
                    this.fillEventOptions();
                    let view = components.getView(this.selectedComponentModel.cid);
                    if (view) {
                        view.$options.methods.unregisterEventHandlers.apply(view);
                        view.$options.methods.registerEventHandlers.apply(view);
                    }
                }
            },
            immediate: true,
            deep: true
        },
        selectedEvent: {
            handler: function (oldEvent, newEvent) {
                this.fillActionOptions();
                if (oldEvent !== newEvent && this.selectedEvent.actions.length > 0) {
                    this.selectedAction = this.selectedEvent.actions[0];
                }
            },
            deep: true,
            immediate: true
        },
        viewModel: function () {
            this.data_model = this.viewModel;
            if (this.data_model.length > 0) {
                this.selectedEvent = this.data_model[0];
                if (this.selectedEvent.actions.length > 0) {
                    this.selectedAction = this.selectedEvent.actions[0];
                } else {
                    this.selectedAction = undefined;
                }
            } else {
                this.selectedEvent = undefined;
                this.selectedAction = undefined;
            }
        }
    },
    methods: {
        buildEditorContextComponent(showActions) {
            return {
                target: $c(this.resolveTargetId(this.selectedAction.targetId)),
                targetKeyword: 'target',
                showActions: showActions,
                additionalKeywords: ['args', 'value']
            }
        },
        copyEvent() {
            this.$copiedEvent = JSON.stringify(this.selectedEvent);
        },
        pasteEvent() {
            this.data_model.push(JSON.parse(this.$copiedEvent));
        },
        onGlobalChanged(value) {
            if (value) {
                this.selectedEvent.name = '';
            } else {
                this.selectedEvent.name = '@click';
            }
        },
        globalEvents() {
            return ide.globalEvents;
        },
        searchActionTarget() {
            if (!this.selectedAction) {
                return;
            }
            this.searchActionTargetValue = undefined;
            this.searchingActionTarget = true;
            setTimeout(() => this.$refs['searchActionTargetInput'].focus(), 50);
        },
        endSearchActionTarget() {
            if (!this.selectedAction) {
                return;
            }
            if (this.selectableComponents().indexOf(this.searchActionTargetValue) !== -1) {
                this.selectedAction.targetId = this.searchActionTargetValue;
            }
            this.searchingActionTarget = false;
        },
        checkEndSearchActionTarget() {
            if (!this.selectedAction) {
                return;
            }
            if (this.selectableComponents().indexOf(this.searchActionTargetValue) !== -1
                && this.selectableComponents().filter(c => c.startsWith(this.searchActionTargetValue)).length === 1
            ) {
                this.endSearchActionTarget();
            }
        },
        addEvent() {
            let event = {
                global: false,
                name: '@click',
                actions: [
                    {
                        targetId: '$self',
                        name: 'eval',
                        description: undefined,
                        argument: undefined
                    }
                ]
            };
            this.data_model.push(event);
            setTimeout(() => {
                this.selectedEvent = event;
                this.rawSelectedEvent = this.selectedEvent;
                this.selectedAction = event.actions[0];
                this.rawSelectedAction = this.selectedAction;
            }, 100);
        },
        addAction(event) {
            let action = {
                targetId: '$self',
                name: 'eval',
                description: undefined,
                argument: undefined
            };
            event.actions.push(action);
            this.fillActionOptions();
            this.selectedAction = action;
            this.rawSelectedAction = this.selectedAction;
        },
        deleteEvent() {
            const index = this.data_model.indexOf(this.selectedEvent);
            if (index > -1) {
                this.data_model.splice(index, 1);
                this.selectedEvent = undefined;
            }
        },
        deleteAction() {
            const index = this.selectedEvent.actions.indexOf(this.selectedAction);
            if (index > -1) {
                this.selectedEvent.actions.splice(index, 1);
                this.selectedAction = undefined;
                this.fillActionOptions();
            }
        },
        moveActionUp() {
            const index = this.selectedEvent.actions.indexOf(this.selectedAction);
            if (index > 0) {
                Tools.arrayMove(this.selectedEvent.actions, index, index - 1);
                this.fillActionOptions();
            }
        },
        moveActionDown() {
            const index = this.selectedEvent.actions.indexOf(this.selectedAction);
            if (index > -1) {
                Tools.arrayMove(this.selectedEvent.actions, index, index + 1);
                this.fillActionOptions();
            }
        },
        fillEventOptions() {
            if (!this.data_model) {
                this.eventOptions = undefined;
            } else {
                this.eventOptions = this.data_model.map(event => {
                    return {
                        value: event,
                        text: event.name + ' [' + (event.actions ? event.actions.length : 0) + ' action(s)]'
                    }
                });
            }
        },
        fillActionOptions() {
            if (!this.selectedEvent) {
                this.actionOptions = undefined;
            } else {
                this.actionOptions = this.selectedEvent.actions.map(action => {
                    return {
                        value: action,
                        text: (action.description && action.description !== '' ? '' + action.description + '' : (action.name ? action.targetId + '.' + action.name : '?'))
                    }
                });
            }
        },
        resolveTargetId(cid) {
            if (cid === '$self' || cid === undefined) {
                cid = this.selectedComponentModel.cid;
            }
            if (cid === '$parent') {
                cid = components.findParent(this.selectedComponentModel.cid);
            }
            if (cid === '$tools' || cid === '$collab') {
                return cid;
            }
            if (!components.hasComponent(cid)) {
                return undefined;
            } else {
                return cid;
            }
        },
        selectableActionNames(cid, additionalActionName) {
            let actionNames;
            cid = this.resolveTargetId(cid);
            if (cid === undefined) {
                actionNames = [];
                if (additionalActionName) {
                    actionNames.push({value: additionalActionName, text: additionalActionName});
                }
                return actionNames;
            }
            if (cid === '$tools') {
                actionNames = $tools.arrayConcat([{text: ''}], $tools.FUNCTION_DESCRIPTORS ? $tools.FUNCTION_DESCRIPTORS : generateFunctionDescriptors($tools));
                if (additionalActionName && actionNames.findIndex(action => action.value === additionalActionName) === -1) {
                    actionNames.push({value: additionalActionName, text: additionalActionName});
                }
                return actionNames;
            }
            if (cid === '$collab') {
                actionNames = $tools.arrayConcat([{text: ''}], $collab.FUNCTION_DESCRIPTORS ? $collab.FUNCTION_DESCRIPTORS : generateFunctionDescriptors($collab, true));
                if (additionalActionName && actionNames.findIndex(action => action.value === additionalActionName) === -1) {
                    actionNames.push({value: additionalActionName, text: additionalActionName});
                }
                return actionNames;
            }
            if (cid) {
                actionNames = components.getComponentOptions(cid).methods.actionNames(components.getComponentModel(cid));
            }
            if (additionalActionName && actionNames.findIndex(action => action.value === additionalActionName) === -1) {
                actionNames.push({value: additionalActionName, text: additionalActionName});
            }
            return actionNames;

        },
        selectableEventNames() {
            return editableComponent.methods.eventNames(components.getComponentModel(this.selectedComponentModel.cid));
        },
        selectableComponents() {
            return Tools.arrayConcat(['$self', '$parent', '$tools', '$collab', 'navbar'],
                components.getComponentModels()
                    .filter(viewModel => components.isComponentInActivePage(viewModel.cid) && !components.hasGeneratedId(viewModel))
                    .map(viewModel => viewModel.cid)
                    .sort()
            );
        },
        selectableComponentsWithAdditional(additionalComponent) {
            let components = this.selectableComponents();
            if (additionalComponent) {
                if (components.indexOf(additionalComponent) === -1) {
                    components = components.map(c => ({value: c, text: c}));
                    components.push({value: additionalComponent, text: additionalComponent + ' (missing)'});
                }
            }
            return components;
        },
        evalConditionState() {
            if (!this.selectedAction) {
                return;
            }
            let resultData = this.eval(this.selectedAction.condition);
            this.conditionState = resultData.state;
            this.conditionInvalidFeedback = resultData.invalidFeedback;
            this.conditionValidFeedback = resultData.validFeedback;
        },
        evalArgumentState() {
            if (!this.selectedAction) {
                return;
            }
            let resultData = this.eval(this.selectedAction.argument);
            this.argumentState = resultData.state;
            this.argumentInvalidFeedback = resultData.invalidFeedback;
            this.argumentValidFeedback = resultData.validFeedback;
        },
        fillStubs(stubHolder, original) {
            let __arrayFunction = function () {
                return [];
            };
            for (let key in original) {
                if (!stubHolder[key]) {
                    stubHolder[key] = __arrayFunction;
                }
            }
        },
        eval(expression) {
            let resultData = {};
            if (expression == undefined || expression === '') {
                return resultData;
            }
            let __$c = $c;
            try {
                try {
                    let target = {dataModel: [], viewModel: {}};
                    let iteratorIndex = this.iteratorIndex;
                    this.dataModel = [];
                    // inject available actions to target
                    let __c = __$c(this.selectedComponentModel.cid);
                    if (__c) {
                        for (let actionName of __c.callableFunctions(this.selectedComponentModel)) {
                            target[actionName] = function () {
                            };
                        }
                    }
                    let value = {};
                    let $d = function () {
                        return [];
                    };
                    let $c = function (cid) {
                        let c = {};
                        // inject available actions to returned component
                        let __c = __$c(cid);
                        if (__c) {
                            for (let action of __c.callableFunctions(components.getComponentModel(cid))) {
                                c[action.value] = function () {
                                };
                            }
                        }
                        return c;
                    };
                    let __voidFunction = function () {
                    };
                    let __arrayFunction = function () {
                        return [];
                    };
                    let __stringFunction = function () {
                        return '';
                    };
                    let __boolFunction = function () {
                        return true;
                    };
                    let $v = function () {
                        return {};
                    };
                    let alert = __voidFunction;
                    let confirm = __stringFunction;
                    let prompt = __boolFunction;
                    let now = __voidFunction;
                    let date = __voidFunction;
                    let datetime = __voidFunction;
                    let time = __voidFunction;
                    let Tools = {
                        uuid: __stringFunction,
                        truncate: __stringFunction,
                        camelToLabelText: __stringFunction,
                        download: __voidFunction,
                        arrayToCsv: __voidFunction,
                        upload: __voidFunction,
                        csvToArray: __arrayFunction,
                        addToStoredArray: __voidFunction,
                        getStoredArray: __arrayFunction,
                        setStoredArray: __voidFunction,
                        addToStoredArray: __voidFunction,
                        removeFromStoredArray: __voidFunction,
                        range: __arrayFunction,
                        characterRange: __arrayFunction,
                        dateRange: __arrayFunction,
                        diffBusinessDays: __arrayFunction
                    };
                    let $tools = Tools;
                    this.fillStubs(Tools, __$tools);
                    let CollaborationTools = {
                        // force return types here
                    };
                    let $collab = CollaborationTools;
                    this.fillStubs(CollaborationTools, __$collab);
                    let args = [[], [], [], [], [], [], [], [], [], [], []];

                    let localStorage = {
                        clear: __voidFunction,
                        removeItem: __voidFunction,
                        getItem: __stringFunction,
                        key: __stringFunction,
                        setItem: __voidFunction
                    }

                    let config = {}

                    let result = eval(expression);
                    resultData.state = true;
                    resultData.validFeedback = 'Valid expression';
                } catch (e) {
                    resultData.state = false;
                    resultData.invalidFeedback = e.message;
                }
                return resultData;
            } catch (e) {
                console.error('error evaluating state', e);
            }
        }
    }
});
