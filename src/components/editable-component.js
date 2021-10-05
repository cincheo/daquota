let draggedComponent = {value: {}};

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
            get: function () {
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
            eval('(() => { ' + this.viewModel.init + ' })()');
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
                            this.value = v;
                        } else {
                            if (v === '') {
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
        },
        'viewModel.observeIntersections': {
            handler: function () {
                if (this.$el && this.viewModel) {
                    if (this.viewModel.observeIntersections) {
                        console.info('observe intersections', this.cid, this.$el);
                        this.$intersectionObserver.observe(this.$el);
                    } else {
                        console.info('unobserve intersections', this.cid, this.$el);
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
                        console.info('observe anchor intersections', this.cid, this.$el);
                        this.$anchorIntersectionObserver.observe(this.$el);
                    } else {
                        console.info('unobserve anchor intersections', this.cid, this.$el);
                        this.$anchorIntersectionObserver.unobserve(this.$el);
                    }
                }
            },
            immediate: true
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
        getContainer() {
            return this.$parent;
        },
        registerEventHandlers() {
            if (this.viewModel != null && this.viewModel.cid) {
                let eventHandlers = this.viewModel['eventHandlers'];
                if (!Array.isArray(eventHandlers)) {
                    eventHandlers = [];
                }
                for (let event of eventHandlers) {
                    let global = event['global'];
                    (global ? this.$eventHub : this).$on(event.name, (...args) => {
                        console.debug("apply actions", this.cid, global, event.name, event['actions'], args);
                        // this.applyActions(event['actions'], args);
                        setTimeout(() => {
                            this.applyActions(Tools.arrayConcat([{
                                targetId: '$self',
                                name: 'eval',
                                argument: 'console.info("starting apply actions")'
                            }], event['actions']), args);
                        })
                    });
                }
            }
        },
        applyActions(actions, args) {
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
                                target = components.getView(action['targetId']);
                        }
                    }
                    let value = args.length > 0 ? args[0] : undefined;
                    let condition = true;
                    let now = Tools.now;
                    let date = Tools.date;
                    let datetime = Tools.datetime;
                    let time = Tools.time;
                    let config = this.config;
                    if (action['condition']) {
                        let self = this;
                        let parent = this.getParent();
                        let iteratorIndex = this.getIteratorIndex();
                        let conditionExpr = action['condition'];
                        console.debug("eval condition", conditionExpr);
                        condition = eval(conditionExpr);
                    }
                    if (condition) {
                        let actionName = action['name'];
                        let self = this;
                        let parent = this.getParent();
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
                    this.applyActions(actions.slice(1), args);
                });
            }
        },
        unregisterEventHandlers() {
            if (this.viewModel != null && this.viewModel.cid) {
                let eventHandlers = this.viewModel['eventHandlers'];
                for (let event of eventHandlers) {
                    let global = event['global'];
                    (global ? this.$eventHub : this).$off(event['name']);
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
            this.update();
            this.timestamp = Date.now();
            this.$children.forEach(c => {
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
                            this.dataSourceComponent = $c(this.viewModel.dataSource);
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
            }
            if (typeof this.dataModel === 'string') {
                this.dataModel = '';
            }
            if (typeof this.dataModel === 'object') {
                this.dataModel = {};
            } else {
                this.dataModel = undefined;
            }
        },
        reset() {
            this.dataModel = undefined;
            this.update();
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
        removeCollectionData(collectionName, data) {
            if (typeof this.dataModel === 'object') {
                if (!Array.isArray(this.dataModel[collectionName])) {
                    this.$set(this.dataModel, collectionName, []);
                } else {
                    let index = this.dataModel[collectionName].indexOf(data);
                    if (index > -1) {
                        this.dataModel[collectionName].splice(index, 1);
                    }
                }
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
                this.$emit("@add-data", {data: d});
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
                this.$emit("@insert-data-at", {data: d, index: index});
            }
        },
        replaceDataAt(data, index) {
            if (index === undefined || index === -1) {
                throw new Error('invalid index ' + index);
            }
            if (Array.isArray(this.value)) {
                let d = Tools.cloneData(data);
                this.value.splice(index, 1, d);
                this.$emit("@replace-data-at", {data: d, index: index});
            }
        },
        removeDataAt(index) {
            if (index === undefined || index === -1) {
                throw new Error('invalid index ' + index);
            }
            if (Array.isArray(this.value)) {
                this.value.splice(index, 1);
                this.$emit("@remove-data-at", {index: index});
            }
        },
        concatArray(array) {
            if (Array.isArray(this.value)) {
                let a = Tools.cloneData(array);
                this.value.push(...a);
                this.$emit("@concat-array", {data: a});
            }
        },
        insertArrayAt(array, index) {
            if (Array.isArray(this.value)) {
                let a = Tools.cloneData(array);
                this.value.splice(index, 0, ...a);
                this.$emit("@insert-array-at", {data: a, index: index});
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
        show: function () {
            this.viewModel.hidden = false;
        },
        hide: function () {
            this.viewModel.hidden = true;
        },
        isVisible: function () {
            return !(this.viewModel.hidden || this.getContainer().hiddenBeforeAnimate);
        },
        isHovered: function() {
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
        actionNames: function () {
            let actionsNames = ['eval', 'show', 'hide', 'animate', 'emit', 'update', 'clear', 'reset', 'forceRender', 'setData', 'sendApplicationResult'];
            if (this.customActionNames) {
                Array.prototype.push.apply(actionsNames, this.customActionNames());
            }
            if (Array.isArray(this.value) || this.value == null) {
                Array.prototype.push.apply(actionsNames, ['addData', 'removeData', 'replaceData', 'replaceDataAt', 'insertDataAt', 'removeDataAt', 'concatArray', 'insertArrayAt', 'moveDataFromTo']);
            } else {
                if (typeof this.value === 'object' && this.dataModel !== null) {
                    Array.prototype.push.apply(actionsNames, ['setFieldData', 'addCollectionData', 'removeCollectionData']);
                }
            }
            return actionsNames;
        },
        callableFunctions: function() {
            let callableFunctions = this.actionNames();
            callableFunctions.push('isVisible', 'isHovered');
            return callableFunctions;
        },
        eventNames: function () {
            let eventNames = ["@init", "@click", "@hover", "@data-model-changed"];
            if (!this.viewModel || this.viewModel.draggable) {
                Array.prototype.push.apply(eventNames, ['@dragstart']);
            }
            if (!this.viewModel || this.viewModel.dropTarget) {
                Array.prototype.push.apply(eventNames, ['@drop']);
            }
            if (!this.viewModel || this.viewModel.resizeDirections) {
                Array.prototype.push.apply(eventNames, ['@resize']);
            }
            if (!this.viewModel || this.viewModel.observeIntersections) {
                Array.prototype.push.apply(eventNames, ['@intersect']);
            }
            if (Array.isArray(this.value)) {
                Array.prototype.push.apply(eventNames, ['@add-data', '@replace-data-at', '@insert-data-at', '@remove-data-at', '@concat-array', '@insert-array-at', '@move-data-from-to']);
            }
            if (this.customEventNames) {
                Array.prototype.push.apply(eventNames, this.customEventNames());
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
            Vue.prototype.$eventHub.$emit('component-hovered', this.cid, hover);
        },
        onDragStart: function (event) {
            console.info('onDragStart', this);
            if (!this.$eval(this.viewModel.draggable, false)) {
                return;
            }
            if (!event.dataTransfer.getData('cid')) {
                console.error('on start drag', this.viewModel.cid, this);
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
                console.info('skip', this.viewModel.cid);
                return;
            }
            if (!this.$eval(this.viewModel.dropTarget, false)) {
                return false;
            }
            if (!this.$eval(this.viewModel.checkCanDrop, false)) {
                console.info("false checkcandro - dragenter", this.viewModel.checkCanDrop, draggedComponent.cid, this.cid, draggedComponent, this);
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
                console.info('skip', this.viewModel.cid);
                return;
            }
            if (!this.$eval(this.viewModel.dropTarget, false)) {
                return false;
            }
            if (!this.$eval(this.viewModel.checkCanDrop, false)) {
                console.info("false checkcandro - dragover", this.viewModel.checkCanDrop, draggedComponent, this);
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
        componentBorderStyle: function (force) {
            if (!this.edit) {
                return '';
            }
            if (this.isEditable()) {
                if (this.targeted) {
                    return `box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19) !important; border: solid orange 2px !important`;
                }
                if (this.selected) {
                    return `box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19) !important; border: solid ${ide.isDarkMode() ? 'white' : 'red'} 2px !important`;
                }
            } else {
                if (this.edit && force) {
                    return `border: dotted ${ide.isDarkMode() ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} 1px`;
                }
            }
        },
        getIteratorIndex: function () {
            if (this.iteratorIndex === undefined) {
                if (this.$parent.$parent && this.$parent.$parent.getIteratorIndex) {
                    return this.$parent.$parent.getIteratorIndex();
                }
            } else {
                return this.iteratorIndex;
            }
        },
        getParent: function () {
            return this.$parent.$parent;
        },
        $eval: function (value, valueOnError) {
            try {
                // no formula shortcut
                if (typeof value === 'boolean' || (typeof value === 'string' && !value.startsWith('='))) {
                    return value;
                }

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
                let config = this.config;
                let screenWidth = this.screenWidth;
                let screenHeight = this.screenHeight;

                if (typeof value === 'function') {
                    result = value();
                } else if (typeof value === 'string' && value.startsWith("=")) {
                    if (value.substring(1).trim() === '') {
                        throw new Error("Empty expression");
                    }
                    result = eval('(' + value.substring(1) + ')');
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

