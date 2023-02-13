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

let draggedComponent = {value: {}};
let userActionNamesMap = new Map();
let userStatelessActionNamesMap = new Map();

let editableComponent = {
    data: () => {
        return {
            viewModel: {},
            dataModel: undefined,
            edit: ide.editMode,
            selected: ide.selectedComponentId && (ide.selectedComponentId === this.cid),
            targeted: ide.targetedComponentId && (ide.targetedComponentId === this.cid),
            hovered: false,
            dataSourceComponent: undefined,
            dataSourceError: false,
            dataMapper: (dataModel) => dataModel,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            contentWidth: document.getElementById('content').getBoundingClientRect().width,
            contentHeight: document.getElementById('content').getBoundingClientRect().height,
            timestamp: Date.now(),
            beforeDataChange: undefined
        }
    },
    props: {
        'cid': String,
        'iteratorIndex': Number,
        'inSelection': Boolean
    },
    computed: {
        publicId: function() {
            return components.publicId(this.viewModel);
        },
        value: {
            get: function () {
                if (this.viewModel && this.viewModel.field) {
                    // TODO: initialize with default value?
                    return this.dataModel ? this.dataModel[this.viewModel.field] : undefined;
                } else {
                    if (this.dataModel === undefined && this.viewModel.defaultValue !== undefined) {
                        this.$set(this, "dataModel", this.injectId(this.$eval(this.viewModel.defaultValue)));
                    }
                    return this.dataModel;
                }
            },
            set: function (value) {
                if (this.viewModel.dataMapper) {
                    console.error(`cannot set value directly for '${this.cid}' because it defines a data mapper`);
                    return;
                }
                if (this.viewModel && this.viewModel.field) {
                    if (!this.dataModel) {
                        return;
                    }
                    $set(this.dataModel, this.viewModel.field, this.injectId(value));
                } else {
                    $set(this, 'dataModel', this.injectId(value));
                }
            }
        },
        screenOrientation: function () {
            return this.screenWidth / this.screenHeight >= 1 ? 'landscape' : 'portrait'
        },
        config: function () {
            return $d('navbar');
        }
    },
    created: function () {
        this.$eventHub.$on('edit', (event) => {
            this.edit = event;
            setTimeout(() => {
                const rect = document.getElementById('content').getBoundingClientRect();
                this.contentWidth = rect.width;
                this.contentHeight = rect.height;
            }, 100);
        });
        this.$eventHub.$on('component-updated', (cid) => {
            if (this.viewModel && cid === this.viewModel.cid) {
                this.viewModel = components.getComponentModel(cid);
                for (let child of components.getDirectChildren(this.viewModel)) {
                    this.$eventHub.$emit('component-updated', child.cid);
                }
            }
        });

        this.$eventHub.$on('component-selected', (cid) => {
            this.selected = cid && (cid === this.viewModel.cid);
        });
        // this.$eventHub.$on('component-hovered', (cid, hovered) => {
        //     this.hovered = (cid && (cid === this.viewModel.cid)) && hovered;
        // });
        this.$eventHub.$on('component-targeted', (cid) => {
            this.targeted = cid && (cid === this.viewModel.cid);
        });
        this.$eventHub.$on('screen-resized', (cid) => {
            this.screenWidth = window.innerWidth;
            this.screenHeight = window.innerHeight;
            setTimeout(() => {
                const rect = document.getElementById('content').getBoundingClientRect();
                this.contentWidth = rect.width;
                this.contentHeight = rect.height;
            }, 100);
        });
    },
    mounted: function () {
        this.getModel();
        if (this.viewModel.init) {
            try {
                this.clearUserActionNamesMap();
                this.clearUserStatelessActionNamesMap();
                eval('(() => { ' + this.viewModel.init + ' })()');
            } catch (e) {
                this.$emit('error', 'error in init - ' + e.message);
            }
        }
        this.$emit("@init", this);
        if (this.viewModel.mapper) {
            this.setMapper();
            this.update();
        }
        if (this.viewModel && this.viewModel.observeIntersections && this.$eval(this.viewModel.revealAnimation, null)) {
            this.getContainer().hiddenBeforeAnimate = true;
        }

    },
    updated: function () {
        if (this.viewModel && this.viewModel.cid) {
            ide.updateHoverOverlay(ide.hoveredComponentId);
            ide.updateSelectionOverlay(ide.selectedComponentId);
        }
    },
    watch: {
        cid: function () {
            this.getModel();
        },
        'viewModel.dataSource': {
            handler: function (newValue, oldValue) {
                this.dataSourceError = false;
                if (this.boundComponentListener) {
                    // deps: uninstalling bound components listeners
                    this.$eventHub.$off('data-model-changed', this.boundComponentListener);
                }
                this.boundComponents = undefined;
                this.update();
            },
            immediate: true
        },
        'dataMapper': {
            handler: function () {
                this.update();
            },
            immediate: true
        },
        'viewModel.mapper': {
            handler: function () {
                this.setMapper();
                this.update();
            },
            immediate: true
        },
        'iteratorIndex': {
            handler: function () {
                this.update();
            }
        },
        'viewModel.field': {
            handler: function () {
                this.update();
                this.$eventHub.$emit('data-model-changed', this.cid);
            },
            immediate: true
        },
        'viewModel.dataType': {
            handler: function (newValue) {
                if (!this.viewModel.dataSource) {
                    if (newValue === 'array' && '={}' === this.viewModel.defaultValue) {
                        this.$set(this.viewModel, "defaultValue", '=[]');
                        this.reset();
                    } else if (newValue === 'object' && '=[]' === this.viewModel.defaultValue) {
                        this.$set(this.viewModel, "defaultValue", '={}');
                        this.reset();
                    }
                }
            }
        },
        'viewModel.init': {
            handler: function () {
                if (this.viewModel.init) {
                    try {
                        this.clearUserActionNamesMap();
                        this.clearUserStatelessActionNamesMap();
                        eval('(() => { ' + this.viewModel.init + ' })()');
                    } catch (e) {
                        this.$emit('error', 'error in init - ' + e.message);
                    }
                }
            }
        },
        dataModel: {
            handler: function (value) {
                this.$emit("@data-model-changed", value);
                this.$eventHub.$emit("data-model-changed", this.cid, this);
                this.injectId(value);
                this.clearComponentError();
                // TODO: make sure that it is not useful, because it clearly leads to deadlocks in some case
                // if (this.dataSourceComponent &&
                //     this.iteratorIndex === undefined &&
                //     this.viewModel.mapper === undefined &&
                //     this.dataSourceComponent.dataModel !== value
                // ) {
                //     console.info('CHANGE', this.cid, this.dataSourceComponent.cid, value, this.dataSourceComponent.dataModel);
                //     // changed raw model model => reflecting to source;
                //     this.dataSourceComponent.dataModel = value;
                // }
            },
            immediate: true,
            deep: true
        },
        'viewModel.observeIntersections': {
            handler: function () {
                if (this.$el && this.viewModel) {
                    if (this.viewModel.observeIntersections) {
                        this.$intersectionObserver.observe(this.$el);
                    } else {
                        this.$intersectionObserver.unobserve(this.$el);
                    }
                }
            },
            immediate: true
        },
        'viewModel.publicName': {
            handler: function () {
                if (this.$el && this.viewModel) {
                    if (this.viewModel.publicName) {
                        this.$anchorIntersectionObserver.observe(this.$el);
                    } else {
                        this.$anchorIntersectionObserver.unobserve(this.$el);
                    }
                }
            },
            immediate: true
        },
        'viewModel.hidden': function() {
            if (this.getContainer()) {
                this.getContainer().hidden = undefined;
            }
        },
        viewModel: {
            handler: function () {
                this.clearComponentError();
            },
            //immediate: true,
            deep: true
        },
    },
    beforeDestroy() {
        this.unregisterEventHandlers();
        if (this.unwatchSourceDataModel) {
            this.unwatchSourceDataModel();
        }
    },
    methods: {
        componentError(message, prop, e) {
            console.error('[COMPONENT ERROR '+this.cid+']', message, e);
            this.$emit('error', message, prop);
        },
        clearComponentError() {
            this.$emit('error');
        },
        clearUserActionNamesMap() {
            const actionNames = userActionNamesMap.get(this.viewModel.cid);
            if (actionNames) {
                actionNames.forEach(actionName => delete this[actionName.value]);
            }
            userActionNamesMap.delete(this.viewModel.cid);
        },
        clearUserStatelessActionNamesMap() {
            const actionNames = userStatelessActionNamesMap.get(this.viewModel.cid);
            if (actionNames) {
                actionNames.forEach(actionName => delete this[actionName.value]);
            }
            userStatelessActionNamesMap.delete(this.viewModel.cid);
        },
        removeMetadata(target) {
            if (Array.isArray(target)) {
                return target.map(data => this.removeMetadata(data));
            } else if (typeof target === 'object') {
                const {$sharedBy, $shareMode, ...rest } = target;
                return rest;
            } else {
                return target;
            }
        },
        // contextual lookup
        $c(elementOrComponentId) {
            if (elementOrComponentId == null) {
                return undefined;
            }
            if (elementOrComponentId instanceof Element) {
                while(elementOrComponentId && !elementOrComponentId['__vue__']) {
                    elementOrComponentId = elementOrComponentId.parentElement;
                }
                return elementOrComponentId['__vue__'];
            } else {
                if (elementOrComponentId && elementOrComponentId.viewModel) {
                    return elementOrComponentId;
                }
                // lookup in parents
                let parentWithinScope = this.findParent(viewModel => viewModel.cid === elementOrComponentId);
                if (parentWithinScope) {
                    return parentWithinScope;
                }
                // lookup in iterator scopes
                parentWithinScope = this.findParent('IteratorView', true);
                while (parentWithinScope) {
                    const contextualElement = parentWithinScope.$el.querySelector('#' + elementOrComponentId);
                    if (contextualElement) {
                        return this.$c(contextualElement);
                    } else {
                        parentWithinScope = parentWithinScope.findParent('IteratorView');
                        parentWithinScope = parentWithinScope.findParent('IteratorView', true);
                    }
                }
                // default (global lookup)
                let element = document.getElementById(elementOrComponentId);
                return this.$c(element);
            }
        },
        // contextual lookup
        $d(componentOrComponentId, optionalValue) {
            if (!componentOrComponentId) {
                return undefined;
            }
            let view = typeof componentOrComponentId === 'string' ? this.$c(componentOrComponentId) : componentOrComponentId;
            if (!view) {
                return optionalValue;
            } else {
                let value = view.value;
                if (value === undefined && optionalValue !== undefined) {
                    return optionalValue;
                } else {
                    return value;
                }
            }
        },
        moment() {
            return moment(...arguments);
        },
        componentClass() {
            const componentClass = this.$eval(this.viewModel.class, '')
            return 'h-100 w-100' + (componentClass ? ' ' + componentClass : '');
        },
        getThis() {
            return this;
        },
        components() {
            return components;
        },
        getParentIds() {
            if (this.viewModel != null && this.viewModel.cid != null) {
                if (this.getParent() != null && this.getParent().getParentIds) {
                    let ids = this.getParent().getParentIds();
                    ids.push(this.viewModel.cid);
                    return ids;
                } else {
                    return [this.viewModel.cid];
                }
            } else {
                return [];
            }
        },
        getComponentName() {
            if (this.cid != null) {
                return this.cid;
            } else {
                return this.$options.name;
            }
        },
        getContainer() {
            return this.$parent;
        },
        registerEventHandlers() {
            if (this.viewModel != null && this.viewModel.cid) {
                let eventHandlers = this.viewModel['eventHandlers'];
                if (!Array.isArray(eventHandlers)) {
                    eventHandlers = [];
                }
                this.registeredEventHandlers = [];
                for (let event of eventHandlers) {
                    let global = event['global'];
                    this.registeredEventHandlers.push({global: global, name: event.name});
                    (global ? this.$eventHub : this).$on(event.name, (...args) => {
                        setTimeout(() => {
                            this.applyActions(event, Tools.arrayConcat([{
                                targetId: '$self',
                                name: 'eval',
                                argument: 'console.debug("apply actions", this.cid, event.name)'
                            }], event['actions']), args);
                        })
                    });
                }
            }
        },
        applyActions(event, actions, args) {
            let condition = true;
            if (actions.length === 0) {
                return;
            } else {
                let action = actions[0];
                let result = Promise.resolve(true);
                try {
                    let target = this;
                    //components.getView(action['targetId'] === '$self' || action['targetId'] === '$parent' || action['targetId'] === 'undefined' ? this.viewModel.cid : action['targetId']);
                    if (action['targetId'] !== undefined) {
                        switch (action['targetId']) {
                            case '$parent':
                                target = this.getParent();
                                break;
                            case '$tools':
                                target = $tools;
                                break;
                            case '$collab':
                                target = $collab;
                                break;
                            case '$self':
                                break;
                            default:
                                target = this.$c(action['targetId']);
                        }
                    }
                    let value = args.length > 0 ? args[0] : undefined;
                    let now = Tools.now;
                    let date = Tools.date;
                    let datetime = Tools.datetime;
                    let time = Tools.time;
                    let config = this.config;
                    let $d = this.$d;
                    let $c = this.$c;
                    if (action['condition'] && action['condition'] !== 'undefined') {
                        let self = this;
                        let parent = this.getParent();
                        let iteratorIndex = this.getIteratorIndex();
                        let conditionExpr = action['condition'];
                        condition = eval(conditionExpr);
                    }
                    if (condition) {
                        let actionName = action['name'];
                        let self = this;
                        let parent = this.getParent();
                        let iteratorIndex = this.getIteratorIndex();
                        let expr = `target.${actionName}(${action['argument']})`;
                        result = eval(expr);
                    }
                } catch (error) {
                    $tools.toast($c('navbar'), 'Error in event action',
                        "Action '" + action['name'] + "' of component '" + this.cid + "' (args: "+$tools.truncate(JSON.stringify(args), 400)+") says: " + error.message, 'danger');
                    console.error('error in event action', event.name, action, args, error);
                    this.$emit('error', 'error in event action: ' + event.name + ', ' + action + ' (args: '+JSON.stringify(args)+') - ' + error.message);
                }
                if (!condition && action['stopIfConditionIsFalse']) {
                    return;
                }
                Promise.resolve(result).then(() => {
                    this.applyActions(event, actions.slice(1), args);
                });
            }
        },
        unregisterEventHandlers() {
            if (this.viewModel != null && this.viewModel.cid) {
                if (this.registeredEventHandlers) {
                    for (let eventHandler of this.registeredEventHandlers) {
                        (eventHandler.global ? this.$eventHub : this).$off(eventHandler.name);
                    }
                }
            }
        },
        iterate(dataModel) {
            if (dataModel && this.iteratorIndex !== undefined) {
                if (Array.isArray(dataModel)) {
                    return dataModel[this.iteratorIndex];
                } else {
                    console.error("data model is not an array, cannot get model for index", this.cid, this.iteratorIndex, this);
                    return dataModel;
                }
            } else {
                return dataModel;
            }
        },
        forceRender(child) {
            console.info('force render', this.cid, this.iteratorIndex);
            this.update();
            this.$forceUpdate();
            this.timestamp = Date.now();
            // recursive update (see the agenda example where it is useful)
            this.$children.forEach(c => {
                if (c.$refs['component']) {
                    if (!(c.$refs['component'].viewModel.type === 'ApplicationView' || c.$refs['component'].viewModel.type === 'EmbedView')) {
                        c.$refs['component'].forceRender(true);
                    }
                }
            });
            if (!child) {
                this.$eventHub.$emit('screen-resized');
            }
        },
        update() {
            if (this.viewModel.dataSource && this.viewModel.dataSource === '$parent') {
                const parent = this.getParent();
                if (parent && parent.value) {
                    if (this.dataModel !== parent.value) {
                        this.dataModel = this.iterate(this.dataMapper(parent.value));
                    }
                }
                if (this.unwatchSourceDataModel) {
                    this.unwatchSourceDataModel();
                }
                if (parent) {
                    this.unwatchSourceDataModel = this.$watch(this.getParentExpression() + '.value', () => {
                        this.dataModel = this.iterate(this.dataMapper(parent.value));
                    });
                }
            } else if (this.viewModel.dataSource && this.viewModel.dataSource === '$object') {
                this.dataModel = this.dataMapper({});
            } else if (this.viewModel.dataSource && this.viewModel.dataSource === '$array') {
                this.dataModel = this.dataMapper([]);
            } else if (this.viewModel.dataSource && this.viewModel.dataSource !== '') {
                if (this.viewModel.dataSource.startsWith('=')) {
                    try {
                        if (this.boundComponents === undefined) {
                            // register to bound components updates (using events rather than watchers in the case of formulas)
                            this.boundComponentExpressions = this.extractDependentComponentExpressions(this.viewModel.dataSource);
                            if (this.boundComponentExpressions == null) {
                                this.boundComponentExpressions = [];
                            }
                            if (this.boundComponentExpressions.length > 0) {
                                // deps: installing bound components listeners
                                this.boundComponentListener = (cid, component) => {
                                    if (this.boundComponents === undefined) {
                                        try {
                                            this.boundComponents = this.boundComponentExpressions.map(e => this.$eval('=$c(' + e + ')', undefined, true));
                                        } catch (error) {
                                            // swallow
                                        }
                                    }
                                    if (this.boundComponents && this.boundComponents.indexOf(component) > -1) {
                                        // deps: notified for bound component model change (target, source)
                                        let value = this.$eval(this.viewModel.dataSource);
                                        this.dataModel = this.iterate(this.dataMapper(value));
                                    }
                                };
                                this.$eventHub.$on('data-model-changed', this.boundComponentListener);
                            }
                        }
                        let value = this.$eval(this.viewModel.dataSource);
                        this.dataModel = this.iterate(this.dataMapper(value));
                    } catch (e) {
                        console.error("data source formula failed - " + this.viewModel.cid, this.viewModel.dataSource, e);
                        this.$emit('error', 'data source formula failed - ' + e.message);
                    }
                } else {
                    this.dataSourceComponent = this.$c(this.viewModel.dataSource);
                    if (!this.dataSourceComponent && !this.dataSourceError) {
                        Tools.setTimeoutWithRetry((retriesLeft) => {
                            this.dataSourceComponent = this.$c(this.viewModel.dataSource);
                            if (this.dataSourceComponent) {
                                this.dataSourceError = false;
                                this.update();
                            } else {
                                if (retriesLeft === 0) {
                                    this.dataSourceError = true;
                                    console.error(this.cid + " cannot find data source component " + this.viewModel.dataSource);
                                }
                            }
                            return this.dataSourceComponent !== undefined;
                        }, 3, 500);
                    }
                    if (!this.dataSourceComponent) {
                        return;
                    }
                    this.dataModel = this.iterate(this.dataMapper(this.dataSourceComponent.value));
                    if (this.unwatchSourceDataModel) {
                        this.unwatchSourceDataModel();
                    }
                    this.unwatchSourceDataModel = this.$watch('dataSourceComponent.dataModel', (newValue, oldValue) => {
                        this.dataModel = this.iterate(this.dataMapper(this.dataSourceComponent.value));
                    });
                }
            }
            if (this.value === undefined && this.viewModel.defaultValue !== undefined) {
                try {
                    this.value = this.$eval(this.viewModel.defaultValue);
                } catch (e) {
                    console.error(this.cid + ' - field initialization failed (default value error) - ' + e.message)
                    this.$emit('error', 'field initialization failed (default value error) - ' + e.message);
                }
            }
        },
        extractDependentComponentExpressions(formula) {
            if (typeof formula !== 'string') {
                return [];
            }
            let cursor = 0;
            let inData = false;
            let parenCount = 0;
            let expressions = [];
            let expression;
            while (cursor < formula.length) {
                switch (formula[cursor]) {
                    case '$':
                        if ((formula[cursor + 1] === 'd' || formula[cursor + 1] === 'c') && formula[cursor + 2] === '(') {
                            parenCount = 0;
                            cursor += 2;
                            inData = true;
                            expression = '';
                            break;
                        }
                    case '(':
                        if (inData) {
                            expression += formula[cursor];
                            parenCount++;
                        }
                        cursor++;
                        break;
                    case ')':
                        if (inData) {
                            expression += formula[cursor];
                            parenCount--;
                            if (parenCount === 0) {
                                inData = false;
                                expressions.push(expression);
                            }
                        }
                        cursor++;
                        break;
                    default:
                        if (inData) {
                            expression += formula[cursor];
                        }
                        cursor++;
                }
            }
            return expressions;
            //return formula.match(/\$d\([^)]+\)/g)?.map(s=>s.slice(3,-1));
        },
        async clear() {
            if (this.beforeDataChange) await this.beforeDataChange();
            if (this.viewModel.dataType === 'array') {
                this.value = [];
            } else if (this.viewModel.dataType === 'string') {
                this.value = '';
            } else if (this.viewModel.dataType === 'object') {
                this.value = {};
            } else {
                this.value = undefined;
            }
        },
        async reset() {
            if (this.beforeDataChange) await this.beforeDataChange();
            this.value = undefined;
            this.update();
        },
        cloneAndCleanData(data) {
            if (!data) {
                return data;
            }
            return this.removeMetadata(Tools.cloneData(data));
        },
        // object functions, only if dataModel is an object
        async setFieldData(fieldName, data) {
            if (this.beforeDataChange) await this.beforeDataChange();
            if (this.dataModel == null) {
                this.$set(this, 'dataModel', {});
            }
            if (typeof this.dataModel === 'object') {
                let d = typeof data === 'object' ? this.cloneAndCleanData(data) : data;
                this.$set(this.dataModel, fieldName, d);
                //this.$emit("@add-data", { data: d });
            }
        },
        async addCollectionData(collectionName, data) {
            if (this.beforeDataChange) await this.beforeDataChange();
            if (this.dataModel == null) {
                this.$set(this, 'dataModel', {});
            }
            if (typeof this.dataModel === 'object') {
                let d = typeof data === 'object' ? this.cloneAndCleanData(data) : data;
                if (!Array.isArray(this.dataModel[collectionName])) {
                    this.$set(this.dataModel, collectionName, []);
                }
                this.dataModel[collectionName].push(d);
                //this.$emit("@add-data", { data: d });
            }
        },
        async removeCollectionData(collectionName, data) {
            if (typeof this.dataModel === 'object') {
                if (this.beforeDataChange) await this.beforeDataChange();
                if (!Array.isArray(this.dataModel[collectionName])) {
                    this.$set(this.dataModel, collectionName, []);
                } else {
                    let index = -1;
                    if (data.id === undefined) {
                        index = this.dataModel[collectionName].indexOf(data);
                    } else {
                        index = this.dataModel[collectionName].findIndex(d => d.id === data.id);
                    }
                    if (index > -1) {
                        this.dataModel[collectionName].splice(index, 1);
                    }
                }
                //this.$emit("@add-data", { data: d });
            }
        },
        injectId(data) {
            if (data != null && this.viewModel.autoIds) {
                if (Array.isArray(data)) {
                    data.forEach(d => {
                        this.injectId(d);
                    });
                } else {
                    if (!data.id) {
                        data.id = $tools.uuid();
                    }
                }
            }
            return data;
        },
        // end of object functions
        // array functions, only if dataModel is an array
        containsData(data) {
            if (Array.isArray(this.value)) {
                if (data.id === undefined) {
                    return this.value.includes(data);
                } else {
                    return !!this.value.find(d => d.id === data.id);
                }
            }
        },
        async addData(data) {
            if (Array.isArray(this.value)) {
                if (this.containsData(data)) {
                    return this.replaceData(data);
                }
                if (this.beforeDataChange) await this.beforeDataChange();
                let d = this.cloneAndCleanData(data);
                this.injectId(d);
                this.value.push(d);
                this.$emit("@add-data", {data: d});
            }
            // TODO: report sound error if not array
        },
        async toggleData(data) {
            if (Array.isArray(this.value)) {
                if (this.containsData(data)) {
                    return this.removeData(data);
                } else {
                    return this.addData(data);
                }
            }
        },
        async replaceData(data) {
            if (Array.isArray(this.value)) {
                if (data.id === undefined) {
                    return this.replaceDataAt(data, this.value.indexOf(data));
                } else {
                    return this.replaceDataAt(data, this.value.findIndex(d => d.id === data.id));
                }
            }
        },
        async removeData(data) {
            if (Array.isArray(this.value)) {
                if (data.id === undefined) {
                    return this.removeDataAt(this.value.indexOf(data));
                } else {
                    return this.removeDataAt(this.value.findIndex(d => d.id === data.id));
                }
            }
        },
        async insertDataAt(data, index) {
            if (index === undefined || index === -1) {
                throw new Error('invalid index ' + index);
            }
            if (Array.isArray(this.value)) {
                let d = this.cloneAndCleanData(data);
                this.injectId(d);
                this.value.splice(index, 0, d);
                this.$emit("@insert-data-at", {data: d, index: index});
            }
        },
        async replaceDataAt(data, index) {
            if (index === undefined || index === -1) {
                throw new Error('invalid index ' + index);
            }
            if (Array.isArray(this.value)) {
                if (this.beforeDataChange) await this.beforeDataChange();
                let d = this.cloneAndCleanData(data);
                this.injectId(d);
                this.value.splice(index, 1, d);
                this.$emit("@replace-data-at", {data: d, index: index});
            }
        },
        async removeDataAt(index) {
            if (index === undefined || index === -1) {
                throw new Error('invalid index ' + index);
            }
            if (Array.isArray(this.value)) {
                if (this.beforeDataChange) await this.beforeDataChange();
                this.value.splice(index, 1);
                this.$emit("@remove-data-at", {index: index});
            }
        },
        async concatArray(array) {
            if (this.value === undefined) {
                this.value = [];
            }
            if (Array.isArray(this.value)) {
                if (this.beforeDataChange) await this.beforeDataChange();
                let a = this.cloneAndCleanData(array);
                this.injectId(a);
                this.value.push(...a);
                this.$emit("@concat-array", {data: a});
            }
        },
        async insertArrayAt(array, index) {
            if (Array.isArray(this.value)) {
                if (this.beforeDataChange) await this.beforeDataChange();
                let a = this.cloneAndCleanData(array);
                this.value.splice(index, 0, ...a);
                this.$emit("@insert-array-at", {data: a, index: index});
            }
        },
        async moveDataFromTo(from, to) {
            if (from === undefined || from === -1) {
                throw new Error('invalid from index ' + from);
            }
            if (to === undefined || to === -1) {
                throw new Error('invalid from index ' + from);
            }
            if (Array.isArray(this.value)) {
                if (this.beforeDataChange) await this.beforeDataChange();
                this.value.splice(to, 0, this.value.splice(from, 1)[0]);
                this.$emit("@remove-data-from-to", {from: from, to: to});
            }
        },
        // end of array functions
        getModel() {
            if (this.viewModel && this.viewModel.cid === this['cid']) {
                return this.viewModel;
            }
            this.unregisterEventHandlers();
            this.viewModel = components.getComponentModel(this['cid']);
            this.registerEventHandlers();
        },
        setDataModel(dataModel) {
            this.dataModel = dataModel;
        },
        getDataModel() {
            return this.dataModel;
        },
        setData(dataModel) {
            this.value = this.cloneAndCleanData(dataModel);
        },
        setMapper() {
            this.$emit('error', undefined);
            if (this.viewModel.mapper) {
                const mapper = this.$evalCode(this.viewModel.mapper, null);
                this.dataMapper = (dataModel) => {
                    try {
                        if (dataModel === undefined) {
                            return undefined;
                        }
                        let result = undefined;
                        if (typeof mapper === 'function') {
                            result = mapper(dataModel);
                        } else {
                            let source = dataModel;
                            result = eval(this.viewModel.mapper.startsWith('=') ? this.viewModel.mapper.slice(1) : this.viewModel.mapper);
                        }
                        this.$emit('error', undefined);
                        return result;
                    } catch (e) {
                        console.error("error in mapper", e);
                        this.$emit('error', 'error in mapper - ' + e.message);
                        return undefined;
                    }
                };
            } else {
                this.dataMapper = d => d;
            }
        },
        getViewModel() {
            return this.viewModel;
        },
        componentSelected: function () {
            if (this.selected) {
                ide.setTargetMode();
            } else {
                this.selected = true;
                ide.selectComponent(this.viewModel.cid);
                //this.$eventHub.$emit('component-selected', this.viewModel.cid);
            }
        },
        show: function (data) {
            this.getContainer().hidden = false;
            if (data) {
                this.$nextTick(() => this.setData(data));
            }
            this.$nextTick(() => {
                document.getElementById(this.cid).scrollIntoView({block: "center"});
            }, 200);
        },
        hide: function () {
            this.getContainer().hidden = true;
        },
        setVisible: function (visible, data) {
            if (visible) {
                this.show(data);
            } else {
                this.hide();
            }
        },
        toggleVisible: function (data) {
            if (this.isVisible()) {
                this.hide();
            } else {
                this.show(data);
            }
        },
        isVisibleInPage() {
            return this.$el.offsetParent !== null;
        },
        isVisible: function () {
            if (this.getContainer().hiddenBeforeAnimate) {
                return false;
            }
            if (this.getContainer().hidden !== undefined) {
                return !this.getContainer().hidden;
            }
            return !this.$eval(this.viewModel.hidden, null);
        },
        isHovered: function () {
            return !!this.hovered;
        },
        async synchronize() {
            return ide.synchronize();
        },
        sendApplicationResult(value) {
            window.parent.postMessage({
                applicationName: applicationModel.name,
                type: 'APPLICATION_RESULT',
                value: value
            }, '*');
        },
        animate(animation, duration, delay, hideAfterAnimation) {
            this.$parent.animate(animation, duration, delay, hideAfterAnimation);
        },
        statelessActionNames: function (viewModel) {
            let statelessActionNames = [
                {value: 'isVisible', text: 'isVisible()'},
                {value: 'getIteratorIndex', text: 'getIteratorIndex()'},
                {value: 'findParent', text: 'findParent([matcher])'},
                {value: 'getParent', text: 'getParent()'},
                {value: 'previous', text: 'previous()'},
                {value: 'next', text: 'next()'}
            ];
            if (viewModel && (viewModel.dataType === 'array' || viewModel.dataType == null)) {
                statelessActionNames.push({text: " --- Array stateless actions ---", disabled: true});
                statelessActionNames.push(...[
                    {value: 'containsData', text: 'containsData(data)'}
                ]);
            }
            const customStatelessActionNames = [];
            if (components.getComponentOptions(viewModel.cid).methods.customStatelessActionNames) {
                customStatelessActionNames.push(...components.getComponentOptions(viewModel.cid).methods.customStatelessActionNames(viewModel));
            }
            if (userStatelessActionNamesMap.get(viewModel.cid)) {
                customStatelessActionNames.push(...userStatelessActionNamesMap.get(viewModel.cid));
            }
            if (customStatelessActionNames.length > 0) {
                statelessActionNames.push({text: " --- Custom stateless actions ---", disabled: true});
                statelessActionNames.push(...customStatelessActionNames);
            }

            return statelessActionNames;
        },
        downloadAsPDF: function (options) {
            $tools.loadScript(basePath + 'assets/ext/html2canvas.js', () => {
                $tools.loadScript(basePath + 'assets/ext/jspdf.umd@2.5.1.min.js', () => {
                    window.jsPDF = window.jspdf.jsPDF;

                    const doc = new jsPDF();

                    doc.html(document.getElementById(this.cid), {
                        callback: function(doc) {
                            // Save the PDF
                            doc.save(options.filename ? options.filename : this.cid + '.pdf');
                        },
                        x: 15,
                        y: 15,
                        width: 170, //target width in the PDF document
                        windowWidth: 650 //window width in CSS pixels
                    });
                })
            })
        },
        _define(map, name, action) {
            let actionNames = map.get(this.viewModel.cid);
            if (!actionNames) {
                actionNames = [];
                map.set(this.viewModel.cid, actionNames);
            }
            const actionNameIndex = actionNames.findIndex(actionName => actionName.value === name);
            if (this[name] && actionNameIndex === -1) {
                console.error(`cannot define action '${name}' because it is a core function`);
                this.$emit('error', `cannot define action '${name}' because it is a core function`);
                return;
            }
            this[name] = action;
            const actionName = {
                value: name,
                text: name + '(' + $tools.functionParams(action).join(',') + ')'
            };
            if (actionNameIndex === - 1) {
                actionNames.push(actionName);
            } else {
                actionNames.splice(actionNameIndex, 1, actionName);
            }
            this.$eventHub.$emit('actions-updated', this.cid, actionName);

        },
        define(name, action) {
            this._define(
                userStatelessActionNamesMap,
                name, action
            );
        },
        define_action(name, action) {
            this._define(
                userActionNamesMap,
                name, action
            );
        },
        actionNames: function (viewModel) {
            let actionNames = [
                {value: 'eval', text: 'eval(...expression)'},
                {value: 'setVisible', text: 'setVisible(visible, [data])'},
                {value: 'toggleVisible', text: 'toggleVisible([data])'},
                {value: 'show', text: 'show([data])'},
                {value: 'hide', text: 'hide()'},
                {value: 'animate', text: 'animate(animation, duration=1000, delay=0)'},
                {value: 'emit', text: 'emit(event, ...args)'},
                {value: 'update', text: 'update()'},
                {value: 'clear', text: 'clear()'},
                {value: 'reset', text: 'reset()'},
                {value: 'forceRender', text: 'forceRender()'},
                {value: 'setData', text: 'setData(data)'},
                {value: 'sendApplicationResult', text: 'sendApplicationResult(value)'},
                {value: "downloadAsPDF", text: "downloadAsPDF(options)"}
            ];
            const customActionNames = [];
            if (components.getComponentOptions(viewModel.cid).methods.customActionNames) {
                customActionNames.push(...components.getComponentOptions(viewModel.cid).methods.customActionNames(viewModel));
            }
            if (userActionNamesMap.get(viewModel.cid)) {
                customActionNames.push(...userActionNamesMap.get(viewModel.cid));
            }
            if (customActionNames.length > 0) {
                actionNames.push({text: " --- Custom actions ---", disabled: true});
                actionNames.push(...customActionNames);
            }
            if (viewModel.dataType === 'array' || viewModel.dataType == null) {
                actionNames.push({text: " --- Array data model actions ---", disabled: true});
                actionNames.push(...[
                    {value: 'addData', text: 'addData(data)'},
                    {value: 'removeData', text: 'removeData(data)'},
                    {value: 'toggleData', text: 'toggleData(data)'},
                    {value: 'replaceData', text: 'replaceData(data)'},
                    {value: 'replaceDataAt', text: 'replaceDataAt(data, index)'},
                    {value: 'insertDataAt', text: 'insertDataAt(data, index)'},
                    {value: 'removeDataAt', text: 'removeDataAt(index)'},
                    {value: 'concatArray', text: 'concatArray(array)'},
                    {value: 'insertArrayAt', text: 'insertArrayAt(array, index)'},
                    {value: 'moveDataFromTo', text: 'moveDataFromTo(fromIndex, toIndex)'}
                ]);
            }
            if (viewModel.dataType === 'object' || viewModel.dataType == null) {
                actionNames.push({text: " --- Object data model actions ---", disabled: true});
                actionNames.push(...[
                    {value: 'setFieldData', text: 'setFieldData(fieldName, data)'},
                    {value: 'addCollectionData', text: 'addCollectionData(collectionName, data)'},
                    {value: 'removeCollectionData', text: 'removeCollectionData(collectionName, data)'}
                ]);
            }
            return actionNames;
        },
        callableFunctions: function (viewModel) {
            let callableFunctions = this.actionNames(viewModel);
            callableFunctions.push({value: 'isVisible', text: 'isVisible()'}, {
                value: 'isHovered',
                text: 'isHovered()'
            });
            return callableFunctions;
        },
        eventNames: function (viewModel) {
            let eventNames = ["@init", "@click", "@hover", "@data-model-changed"];
            if (viewModel.draggable) {
                Array.prototype.push.apply(eventNames, ['@dragstart']);
            }
            if (viewModel.dropTarget) {
                Array.prototype.push.apply(eventNames, ['@drop']);
            }
            if (viewModel.resizeDirections) {
                Array.prototype.push.apply(eventNames, ['@resize']);
            }
            if (viewModel.observeIntersections) {
                Array.prototype.push.apply(eventNames, ['@intersect']);
            }
            if (Array.isArray(this.value)) {
                Array.prototype.push.apply(eventNames, ['@add-data', '@replace-data-at', '@insert-data-at', '@remove-data-at', '@concat-array', '@insert-array-at', '@move-data-from-to']);
            }
            if (components.getComponentOptions(viewModel.cid).methods.customEventNames) {
                eventNames.push(...components.getComponentOptions(viewModel.cid).methods.customEventNames(viewModel));
            }
            return eventNames;
        },
        boundEventHandlers(events) {
            if (events === undefined) {
                events = {};
            }
            if (this.$eval(this.viewModel.draggable, false)) {
                events.dragstart = this.onDragStart;
            }
            if (this.$eval(this.viewModel.dropTarget, false)) {
                events.dragover = this.onDragOver;
                events.dragenter = this.onDragEnter;
                events.dragleave = this.onDragLeave;
                events.drop = this.onDrop;
            }
            return events;
        },
        onClick: function (value) {
            this.$emit("@click", value);
        },
        onHover(hover) {
            this.hovered = hover;
            this.$emit("@hover", hover);
            // Vue.prototype.$eventHub.$emit('component-hovered', this.cid, hover);
        },
        onDragStart: function (event) {
            if (!this.$eval(this.viewModel.draggable, false)) {
                return;
            }
            if (!event.dataTransfer.getData('cid')) {
                event.dataTransfer.dropEffect = 'move';
                event.dataTransfer.effectAllowed = 'all';
                event.dataTransfer.setData('cid', this.viewModel.cid);
                event.dataTransfer.setData('value', JSON.stringify(this.value));
                draggedComponent = this;
                draggedComponent.dragOffsetX = event.offsetX;
                draggedComponent.dragOffsetY = event.offsetY;
                this.$emit("@dragstart", draggedComponent, event);
            }
        },
        onDragEnter: function (event) {
            if (draggedComponent === this) {
                return;
            }
            if (!this.$eval(this.viewModel.dropTarget, false)) {
                return false;
            }
            if (!this.$eval(this.viewModel.checkCanDrop, false)) {
                return false;
            }
            event.preventDefault();
            this.$emit("@dragenter", draggedComponent, event);
        },
        onDragLeave: function (event) {
            if (draggedComponent === this) {
                return;
            }
            this.$emit("@dragleave", draggedComponent, event);
        },
        onDragOver: function (event) {
            if (draggedComponent === this) {
                return;
            }
            if (!this.$eval(this.viewModel.dropTarget, false)) {
                return false;
            }
            if (!this.$eval(this.viewModel.checkCanDrop, false)) {
                return false;
            }
            event.preventDefault();
            this.$emit("@dragover", draggedComponent, event);
        },
        onDrop: function (event) {
            if (draggedComponent === this) {
                return;
            }
            if (!this.$eval(this.viewModel.dropTarget, false)) {
                return false;
            }
            if (!this.$eval(this.viewModel.checkCanDrop, false)) {
                return false;
            }
            this.$emit("@drop", draggedComponent, event);
        },
        eval: function (expression) {
            // does nothing
        },
        redirect(ui, page) {
            ide.load(ui, page);
        },
        emit: function (eventName, argument) {
            this.$eventHub.$emit(eventName, argument);
        },
        isEditable() {
            return this.edit && (this.targeted || this.inSelection);
        },
        getIteratorIndex: function () {
            if (this.iteratorIndex === undefined) {
                if (this.getParent() && this.getParent().getIteratorIndex) {
                    return this.getParent().getIteratorIndex();
                }
            } else {
                return this.iteratorIndex;
            }
        },
        getParent: function () {
            let parent = this.$parent;
            while (!(!parent || (!!parent.timestamp && parent.viewModel))) {
                parent = parent.$parent;
            }
            return parent;
        },
        getParentExpression: function () {
            let parent = this.$parent;
            let parentExpression = '$parent';
            while (!(!parent || (!!parent.timestamp && parent.viewModel))) {
                parent = parent.$parent;
                parentExpression += '.$parent';
            }
            return parentExpression;
        },
        findParent: function (viewModelTypeMatcher, returnPreviewMatch) {
            let parent = this.$parent.$parent;
            let previous = this;
            if (viewModelTypeMatcher) {
                if (typeof viewModelTypeMatcher === 'string') {
                    const type = viewModelTypeMatcher;
                    viewModelTypeMatcher = viewModel => viewModel.type === type;
                }
                while (!(!parent || (!!parent.timestamp && parent.viewModel && viewModelTypeMatcher(parent.viewModel)))) {
                    if (parent.timestamp && parent.viewModel) {
                        previous = parent;
                    }
                    parent = parent.$parent;
                }
            }
            return returnPreviewMatch ? (parent ? previous : undefined) : parent;
        },
        previous: function () {
            const parentModel = this.getParent()?.viewModel;
            if (parentModel?.type === 'ContainerView') {
                const index = parentModel.components.map(c => c.cid).indexOf(this.viewModel.cid);
                if (index > 0) {
                    return $c(parentModel.components[index - 1].cid);
                }
            }
            return undefined;
        },
        next: function () {
            const parentModel = this.getParent()?.viewModel;
            if (parentModel?.type === 'ContainerView') {
                const index = parentModel.components.map(c => c.cid).indexOf(this.viewModel.cid);
                if (index < parentModel.components.length - 1) {
                    return $c(parentModel.components[index + 1].cid);
                }
            }
            return undefined;
        },
        $evalToType: function (type, value, valueOnError) {
            let result = this.$eval(value, valueOnError);
            if (typeof result === type) {
                return result;
            } else {
                return undefined;
            }
        },
        $evalCode: function (code, valueOnError) {
            if (code === undefined) {
                return undefined;
            } else {
                return this.$eval(code.startsWith('=') ? code : '=' + code, valueOnError);
            }
        },
        $evalWithDefault: function (value, defaultValue) {
            let result = this.$eval(value, defaultValue);
            if (result === undefined) {
                result = defaultValue;
            }
            return result;
        },
        $eval: function (value, valueOnError, errorIfUndefined) {
            try {
                // no formula shortcut
                if (typeof value === 'boolean' || (typeof value === 'string' && !value.startsWith('='))) {
                    return value;
                }

                let $c = this.$c;
                let $d = this.$d;
                let dataModel = this.dataModel;
                let viewModel = this.viewModel;
                let iteratorIndex = this.getIteratorIndex();
                //let source = viewModel.dataSource ? $d(viewModel.dataSource) : undefined;
                let $eval = this.$eval;
                let result = undefined;
                let now = Tools.now;
                let date = Tools.date;
                let datetime = Tools.datetime;
                let time = Tools.time;
                let parent = this.getParent();
                let args = this.args;
                let config = this.config;
                let screenWidth = this.screenWidth;
                let screenHeight = this.screenHeight;

                if (typeof value === 'function') {
                    result = value();
                } else if (typeof value === 'string' && value.startsWith("=")) {
                    if (value.substring(1).trim() === '') {
                        throw new Error(`Empty expression - cid: ${this.viewModel?.cid}`);
                    }
                    try {
                        result = eval('(' + value.substring(1) + ')');
                    } catch (e) {
                        result = eval('(() => {' + value.substring(1) + '})()');
                    }
                } else if (typeof value === 'string' && value.startsWith("function()")) {
                    let body = value.slice(value.indexOf("{") + 1, value.lastIndexOf("}"));
                    result = eval(body);
                } else {
                    return value;
                }
                if (result === undefined && errorIfUndefined) {
                    throw new Error(`Expression '${value.substring(0, Math.min(100, value.length))+(value.length > 100?' (...)':'')}' evaluates to 'undefined'`);
                } else {
                    return result;
                }
            } catch (e) {
                const prop = value ? Object.entries(this.viewModel).find(e => e[1] === value) : undefined;
                this.componentError(e.message + ' in expression [' + value + ']', prop ? prop[0] : undefined, e);
                if (valueOnError !== undefined) {
                    if (valueOnError === null) {
                        return undefined;
                    } else {
                        return valueOnError;
                    }
                } else {
                    // const prop = value ? Object.entries(this.viewModel).find(e => e[1] === value)[0] : undefined;
                    // this.componentError('error evaluating: ' + value, prop);
                    //console.error(`error evaluating ${this.cid} ${prop}`, value);
                    throw e;
                }
            }
        }

    }
};

const formGroupMixin = {
    name: "formGroupMixin",
    data: function () {
        return {
            showStateData: true,
            showStateOnInputData: false
        }
    },
    computed: {
        $label: function () {
            let label = this.$eval(this.viewModel.label, null);
            if (label && this.$eval(this.viewModel.required, false)) {
                label += " (*)";
            }
            return label;
        },
        $invalidFeedback: function () {
            let feedback = this.$eval(this.viewModel.invalidFeedback, null);
            if (!feedback && this.viewModel.required) {
                feedback = 'Required field value';
            }
            return feedback;
        },
        $state: function () {
            if (!this.showStateData) {
                return undefined;
            }
            return this.isValid();
        },
        $labelCols: function () {
            let cols = undefined;
            if (this.$eval(this.viewModel.horizontalLayout, false)) {
                cols = 'auto';
                if (this.viewModel.labelCols) {
                    cols = this.$eval(this.viewModel.labelCols, 'auto');
                    if (cols == 0) {
                        cols = 'auto';
                    }
                }
            }
            return cols;
        }
    },
    methods: {
        customStatelessActionNames() {
            return [{value: 'isValid', text: 'isValid()'}];
        },
        customActionNames() {
            return [
                {value: 'showState', text: 'showState()'},
                {value: 'hideState', text: 'hideState()'},
                {value: 'focus', text: 'focus()'},
            ];
        },
        focus() {
            this.$refs['input'].focus()
        },
        showState() {
            this.showStateData = true;
        },
        hideState() {
            this.showStateData = false;
        },
        isValid() {
            const state = this.$eval(this.viewModel.state ? this.viewModel.state : undefined, null);
            if (state === undefined) {
                if (this.viewModel.required) {
                    return !(this.value == null || this.value === '');
                }
            }
            return state;
        }
    }
}


