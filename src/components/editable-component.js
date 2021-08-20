let editableComponent = {
    data: () => {
        return {
            viewModel: {},
            dataModel: undefined,
            edit: ide.editMode,
            selected: ide.selectedComponentId && (ide.selectedComponentId === this.cid),
            targeted: ide.targetedComponentId && (ide.targetedComponentId === this.cid),
            // hovered: false,
            dataSourceComponent: undefined,
            dataSourceError: false,
            dataMapper: (dataModel) => dataModel,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            contentWidth: document.getElementById('content').getBoundingClientRect().width,
            contentHeight: document.getElementById('content').getBoundingClientRect().height,
            timestamp: Date.now()
        }
    },
    props: {
        'cid': String,
        'iteratorIndex': Number,
        'inSelection': Boolean
    },
    computed: {
        value: {
            get: function() {
                if (this.viewModel && this.viewModel.field) {
                    // TODO: initialize with default value?
                    return this.dataModel ? this.dataModel[this.viewModel.field] : undefined;
                } else {
                    if (this.dataModel === undefined && this.viewModel.defaultValue !== undefined) {
                        this.dataModel = this.$eval(this.viewModel.defaultValue);
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
                    $set(this.dataModel, this.viewModel.field, value);
                } else {
                    this.dataModel = value;
                }
            }
        },
        screenOrientation: function() {
            return this.screenWidth / this.screenHeight >= 1 ? 'landscape' : 'portrait'
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
        this.$emit("@init", this);
        if (this.viewModel.mapper) {
            this.setMapper();
            this.update();
        }
    },
    updated: function () {
        if (this.viewModel && this.viewModel.cid) {
            ide.updateHoverOverlay(ide.hoveredComponentId);
            ide.updateSelectionOverlay(ide.selectedComponentId);
        }
    },
    watch: {
        cid: function (newVal, oldVal) {
            this.getModel();
        },
        'viewModel.dataSource': {
            handler: function () {
                this.dataSourceError = false;
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
            }
        },
        'viewModel.defaultValue': {
            handler: function (newValue) {
                let v = undefined;
                try {
                    v = this.$eval(newValue);
                    if (v !== undefined) {
                        if (typeof v !== typeof this.value) {
                            console.info("OVERRIDE value 1", v, this.value);
                            this.value = v;
                        } else {
                            if (v === '') {
                                console.info("OVERRIDE value 2", v, this.value);
                                this.value = v;
                            }
                        }
                    }
                } catch (e) {
                }
            }
        },
        dataModel: {
            handler: function (value) {
                this.$emit("@data-model-changed", value);
                this.$eventHub.$emit("data-model-changed", this.cid);
            },
            immediate: true,
            deep: true
        }
    },
    beforeDestroy() {
        this.unregisterEventHandlers();
        if (this.unwatchSourceDataModel) {
            this.unwatchSourceDataModel();
        }
    },
    methods: {
        getThis() {
            return this;
        },
        components() {
            return components;
        },
        getParentIds() {
            if (this.viewModel != null && this.viewModel.cid != null) {
                if (this.$parent.$parent != null && this.$parent.$parent.getParentIds) {
                    let ids = this.$parent.$parent.getParentIds();
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
        registerEventHandlers() {
            if (this.viewModel != null && this.viewModel.cid) {
                let eventHandlers = this.viewModel['eventHandlers'];
                if (!Array.isArray(eventHandlers)) {
                    eventHandlers = [];
                }
                for (let event of eventHandlers) {
                    let global = event['global'];
                    (global?this.$eventHub:this).$on(event.name, (value) => {
                        console.debug("apply actions", global, event.name, event['actions']);
                        this.applyActions(value, event['actions']);
                    });
                }
            }
        },
        applyActions(value, actions) {
            if (actions.length === 0) {
                return;
            } else {
                let action = actions[0];
                let result = Promise.resolve(true);
                try {
                    let target = components.getView(action['targetId'] === '$self' || action['targetId'] === '$parent' || action['targetId'] === 'undefined' ? this.viewModel.cid : action['targetId']);
                    if (action['targetId'] === '$parent') {
                        target = target.$parent.$parent;
                    }
                    let condition = true;
                    let now = Tools.now;
                    let date = Tools.date;
                    let datetime = Tools.datetime;
                    let time = Tools.time;
                    if (action['condition']) {
                        let self = this;
                        let parent = this.$parent.$parent;
                        let iteratorIndex = this.getIteratorIndex();
                        let conditionExpr = action['condition'];
                        console.debug("eval condition", conditionExpr);
                        condition = eval(conditionExpr);
                    }
                    if (condition) {
                        let actionName = action['name'];
                        let self = this;
                        let parent = this.$parent.$parent;
                        console.debug("eval", parent, $d(parent));
                        let iteratorIndex = this.getIteratorIndex();
                        let expr = `target.${actionName}(${action['argument']})`;
                        console.debug("eval", expr);
                        result = eval(expr);
                    }
                } catch (error) {
                    console.error('error in event action', action, error);
                }
                Promise.resolve(result).then(() => {
                    this.applyActions(value, actions.slice(1));
                });
            }
        },
        unregisterEventHandlers() {
            if (this.viewModel != null && this.viewModel.cid) {
                let eventHandlers = this.viewModel['eventHandlers'];
                for (let event of eventHandlers) {
                    let global = event['global'];
                    (global?this.$eventHub:this).$off(event['name']);
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
        forceRender() {
            console.info('forcing update: ' + this.cid);
            this.update();
            this.timestamp = Date.now();
            this.$children.forEach(c => {
                console.info('loop', c);
                if (c.$refs['component']) {
                    c.$refs['component'].update();
                    c.$refs['component'].forceRender();
                }
            });
        },
        update() {
            if (this.viewModel.dataSource && this.viewModel.dataSource === '$parent') {
                if (this.$parent && this.$parent.$parent && this.$parent.$parent.value) {
                    if (this.dataModel !== this.$parent.$parent.value) {
                        this.dataModel = this.iterate(this.dataMapper(this.$parent.$parent.value));
                    }
                }
                if (this.unwatchSourceDataModel) {
                    this.unwatchSourceDataModel();
                }
                this.unwatchSourceDataModel = this.$watch('$parent.$parent.value', (newValue, oldValue) => {
                    this.dataModel = this.iterate(this.dataMapper(this.$parent.$parent.value));
                });
            } else if (this.viewModel.dataSource && this.viewModel.dataSource === '$object') {
                this.dataModel = this.dataMapper({});
            } else if (this.viewModel.dataSource && this.viewModel.dataSource === '$array') {
                this.dataModel = this.dataMapper([]);
            } else if (this.viewModel.dataSource && this.viewModel.dataSource !== '') {
                if (this.viewModel.dataSource.startsWith('=')) {
                    try {
                        let value = this.$eval(this.viewModel.dataSource);
                        this.dataModel = this.iterate(this.dataMapper(value));
                    } catch (e) {
                        console.error("formula update failed", this.viewModel.dataSource, e);
                    }
                } else {
                    this.dataSourceComponent = $c(this.viewModel.dataSource);
                    if (!this.dataSourceComponent && !this.dataSourceError) {
                        Tools.setTimeoutWithRetry((retriesLeft) => {
                            console.warn(this.cid + " cannot find data source component " + this.viewModel.dataSource, this.dataSourceError);
                            this.dataSourceComponent = $c(this.viewModel.dataSource);
                            if (this.dataSourceComponent) {
                                console.warn(this.cid + " found after retry data source component " + this.viewModel.dataSource, this.dataSourceError);
                                this.dataSourceError = false;
                                this.update();
                            } else {
                                if (retriesLeft === 0) {
                                    this.dataSourceError = true;
                                    console.error("RETRY FINAL ERROR");
                                } else {
                                    console.error("NOT FOUND AFTER RETRY");
                                }
                            }
                            return this.dataSourceComponent !== undefined;
                        }, 3, 500);
                    }
                    if (!this.dataSourceComponent) {
                        return;
                    }
                    if (this.dataModel !== this.dataSourceComponent.value) {
                        this.dataModel = this.iterate(this.dataMapper(this.dataSourceComponent.value));
                    }
                    if (this.unwatchSourceDataModel) {
                        this.unwatchSourceDataModel();
                    }
                    this.unwatchSourceDataModel = this.$watch('dataSourceComponent.dataModel', (newValue, oldValue) => {
                        this.dataModel = this.iterate(this.dataMapper(this.dataSourceComponent.value));
                    });
                }
            }
            if (this.value === undefined && this.viewModel.defaultValue !== undefined) {
                console.info("set default value");
                this.value = this.$eval(this.viewModel.defaultValue);
            }
        },
        clear() {
            if (Array.isArray(this.dataModel)) {
                this.dataModel = [];
            } if (typeof this.dataModel === 'string') {
                this.dataModel = '';
            } if (typeof this.dataModel === 'object') {
                this.dataModel = {};
            } else {
                this.dataModel = undefined;
            }
        },
        // object functions, only if dataModel is an object
        setFieldData(fieldName, data) {
            if (typeof this.dataModel === 'object') {
                let d = Tools.cloneData(data);
                this.$set(this.dataModel, fieldName, d);
                //this.$emit("@add-data", { data: d });
            }
        },
        addCollectionData(collectionName, data) {
            if (typeof this.dataModel === 'object') {
                let d = Tools.cloneData(data);
                if (!Array.isArray(this.dataModel[collectionName])) {
                    this.$set(this.dataModel, collectionName, []);
                }
                this.dataModel[collectionName].push(d);
                //this.$emit("@add-data", { data: d });
            }
        },
        // end of object functions
        // array functions, only if dataModel is an array
        addData(data) {
            if (Array.isArray(this.value)) {
                let d = Tools.cloneData(data);
                if (this.value === undefined) {
                    this.value = [];
                }
                this.value.push(d);
                this.$emit("@add-data", { data: d });
            }
        },
        replaceData(data) {
            if (Array.isArray(this.value)) {
                if (data.id === undefined) {
                    this.replaceDataAt(data, this.value.indexOf(data));
                } else {
                    this.replaceDataAt(data, this.value.findIndex(d => d.id === data.id));
                }
            }
        },
        removeData(data) {
            if (Array.isArray(this.value)) {
                if (data.id === undefined) {
                    this.removeDataAt(this.value.indexOf(data));
                } else {
                    this.removeDataAt(this.value.findIndex(d => d.id === data.id));
                }
            }
        },
        insertDataAt(data, index) {
            if (index === undefined || index === -1) {
                throw new Error('invalid index ' + index);
            }
            if (Array.isArray(this.value)) {
                let d = Tools.cloneData(data);
                this.value.splice(index, 0, d);
                this.$emit("@insert-data-at", { data: d, index: index });
            }
        },
        replaceDataAt(data, index) {
            if (index === undefined || index === -1) {
                throw new Error('invalid index ' + index);
            }
            if (Array.isArray(this.value)) {
                let d = Tools.cloneData(data);
                this.value.splice(index, 1, d);
                this.$emit("@replace-data-at", { data: d, index: index });
            }
        },
        removeDataAt(index) {
            if (index === undefined || index === -1) {
                throw new Error('invalid index ' + index);
            }
            if (Array.isArray(this.value)) {
                this.value.splice(index, 1);
                this.$emit("@remove-data-at", { index: index });
            }
        },
        concatArray(array) {
            if (Array.isArray(this.value)) {
                let a = Tools.cloneData(array);
                this.value.push(...a);
                this.$emit("@concat-array", { data: a });
            }
        },
        insertArrayAt(array, index) {
            if (Array.isArray(this.value)) {
                let a = Tools.cloneData(array);
                this.value.splice(index, 0, ...a);
                this.$emit("@insert-array-at", { data: a, index: index });
            }
        },
        moveDataFromTo(from, to) {
            if (from === undefined || from === -1) {
                throw new Error('invalid from index ' + from);
            }
            if (to === undefined || to === -1) {
                throw new Error('invalid from index ' + from);
            }
            if (Array.isArray(this.value)) {
                this.value.splice(to, 0, this.value.splice(from, 1)[0]);
                this.$emit("@remove-data-from-to", { from: from, to: to });
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
            this.value = Tools.cloneData(dataModel);
        },
        setMapper() {
            if (this.viewModel.mapper) {
                this.dataMapper = (dataModel) => {
                    try {
                        if (dataModel === undefined) {
                            return undefined;
                        }
                        let source = dataModel;
                        let result = eval(this.viewModel.mapper.startsWith('=') ? this.viewModel.mapper.slice(1) : this.viewModel.mapper);
                        this.error = undefined;
                        return result;
                    } catch (e) {
                        console.error("error in mapper", e);
                        this.error = e.message;
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
        show: function() {
            this.viewModel.hidden = false;
        },
        hide: function() {
            this.viewModel.hidden = true;
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
        actionNames: function() {
            let actionsNames = ['eval', 'show', 'hide', 'emit', 'update', 'clear', 'forceRender', 'synchronize', 'setData', 'sendApplicationResult', 'redirect'];
            if (this.customActionNames) {
                Array.prototype.push.apply(actionsNames, this.customActionNames());
            }
            if (Array.isArray(this.value) || this.value == null) {
                Array.prototype.push.apply(actionsNames, ['addData', 'removeData', 'replaceData', 'replaceDataAt', 'insertDataAt', 'removeDataAt', 'concatArray', 'insertArrayAt', 'moveDataFromTo']);
            } else {
                if (typeof this.value === 'object' && this.dataModel !== null) {
                    Array.prototype.push.apply(actionsNames, ['setFieldData', 'addCollectionData']);
                }
            }
            return actionsNames;
        },
        eventNames: function() {
            let eventNames = ["@init", "@click", "@data-model-changed"];
            if (Array.isArray(this.value)) {
                Array.prototype.push.apply(eventNames, ['@add-data', '@replace-data-at', '@insert-data-at', '@remove-data-at', '@concat-array', '@insert-array-at', '@move-data-from-to']);
            }
            if (this.customEventNames) {
                Array.prototype.push.apply(eventNames, this.customEventNames());
            }
            return eventNames;
        },
        onClick: function(value) {
            this.$emit("@click", value);
        },
        eval: function(argument) {
            // does nothing
        },
        redirect(ui, page) {
            ide.load(ui, page);
        },
        emit: function(eventName, argument) {
            this.$eventHub.$emit(eventName, argument);
        },
        isEditable() {
            return this.edit && (this.targeted || this.inSelection);
        },
        componentBorderStyle: function (force) {
            if (!this.edit) {
                return '';
            }
            if (this.isEditable()) {
                if(this.targeted) {
                    return `box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19) !important; border: solid orange 2px !important`;
                }
                if(this.selected) {
                    return `box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19) !important; border: solid ${ide.isDarkMode()?'white':'red'} 2px !important`;
                }
            } else {
                if (this.edit && force) {
                    return `border: dotted ${ide.isDarkMode()?'rgba(255,255,255,0.5)':'rgba(0,0,0,0.5)'} 1px`;
                }
            }
            // if (this.hovered) {
            //     return `box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19) !important; border: dotted ${ide.isDarkMode() ? 'white' : 'red'} 2px !important`;
            // }
        },
        getIteratorIndex: function() {
            if (this.iteratorIndex === undefined) {
                if (this.$parent.$parent && this.$parent.$parent.getIteratorIndex) {
                    return this.$parent.$parent.getIteratorIndex();
                }
            } else {
                return this.iteratorIndex;
            }
        },
        getParent: function() {
            return this.$parent.$parent;
        },
        $eval: function(value, valueOnError) {
            try {
                let dataModel = this.dataModel;
                let viewModel = this.viewModel;
                let iteratorIndex = this.getIteratorIndex();
                let source = viewModel.dataSource ? $d(viewModel.dataSource) : undefined;
                let $eval = this.$eval;
                let result = undefined;
                let now = Tools.now;
                let date = Tools.date;
                let datetime = Tools.datetime;
                let time = Tools.time;
                let parent = this.getParent();
                let args = this.args;

                if (typeof value === 'function') {
                    result = value();
                } else if (typeof value === 'string' && value.startsWith("=")) {
                    if (value.substring(1).trim() === '') {
                        throw new Error("Empty expression");
                    }
                    result = eval(value.substring(1));
                } else if (typeof value === 'string' && value.startsWith("function()")) {
                    let body = value.slice(value.indexOf("{") + 1, value.lastIndexOf("}"));
                    result = eval(body);
                } else {
                    return value;
                }
                if (result === undefined) {
                    throw new Error(`Expression '${value}' evaluates to 'undefined'`);
                } else {
                    return result;
                }
            } catch (e) {
                if (valueOnError !== undefined) {
                    if (valueOnError === null) {
                        return undefined;
                    } else {
                        return valueOnError;
                    }
                } else {
                    throw e;
                }
            }
        }

    }
};

