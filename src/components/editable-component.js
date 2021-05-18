let editableComponent = {
    data: () => {
        return {
            viewModel: {},
            dataModel: undefined,
            edit: ide.editMode,
            selected: ide.selectedComponentId && ide.selectedComponentId == this.cid,
            targeted: ide.targetedComponentId && ide.targetedComponentId == this.cid,
            dataSourceComponent: undefined,
            dataMapper: (dataModel) => dataModel
        }
    },
    props: {
        'cid': String
    },
    created: function () {
        this.$eventHub.$on('edit', (event) => {
            console.info("event", event);
            this.edit = event;
        });
        this.$eventHub.$on('component-selected', (cid) => {
            this.selected = cid && (cid === this.viewModel.cid);
        });
        this.$eventHub.$on('component-targeted', (cid) => {
            this.targeted = cid && (cid === this.viewModel.cid);
        });
    },
    mounted: function () {
        this.getModel();
        this.$emit("@init", this);
    },
    watch: {
        cid: function (newVal, oldVal) {
            this.getModel();
        },
        // viewModel: {
        //     handler: function () {
        //         // far too expensive - we should update only on dataSource and specific fields
        //         this.update();
        //     },
        //     deep: true,
        //     immediate: true
        // },
        'viewModel.dataSource': {
            handler: function () {
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
        dataModel: function (value) {
            this.$emit("@data-model-changed", value);
            this.$eventHub.$emit("data-model-changed", this.cid);
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
                console.info("register event handlers for " + this.viewModel.cid);
                let eventHandlers = this.viewModel['eventHandlers'];
                if (!Array.isArray(eventHandlers)) {
                    eventHandlers = [];
                }
                for (let event of eventHandlers) {
                    let global = event['global'];
                    console.info("register", global, event.name, event['actions']);
                    (global?this.$eventHub:this).$on(event.name, (value) => {
                        console.info("apply actions", global, event.name, event['actions']);
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
                let target = components.getView(action['targetId'] === '$self' || action['targetId'] === '$parent' || action['targetId'] === 'undefined' ? this.viewModel.cid : action['targetId']);
                if (action['targetId'] === '$parent') {
                    target = target.$parent.$parent;
                }
                let condition = true;
                if (action['condition']) {
                    let conditionExpr = action['condition'];
                    console.info("eval condition", conditionExpr);
                    condition = eval(conditionExpr);
                }
                let result = true;
                if (condition) {
                    let actionName = action['name'];
                    let self = this;
                    let parent = this.$parent.$parent;
                    let expr = `target.${actionName}(${action['argument']})`;
                    console.info("eval", expr);
                    result = eval(expr);
                }
                Promise.resolve(result).then(() => {
                    this.applyActions(value, actions.slice(1));
                });
            }
        },
        unregisterEventHandlers() {
            if (this.viewModel != null && this.viewModel.cid) {
                console.info("unregister event handlers for " + this.viewModel.cid);
                let eventHandlers = this.viewModel['eventHandlers'];
                for (let event of eventHandlers) {
                    let global = event['global'];
                    console.info("unregister", event['name'], global);
                    (global?this.$eventHub:this).$off(event['name']);
                }
            }
        },
        update() {
            if (this.viewModel.dataSource && this.viewModel.dataSource === '$parent') {
                if (this.$parent && this.$parent.$parent && this.$parent.$parent.dataModel) {
                    if (this.dataModel !== this.$parent.$parent.dataModel) {
                        this.dataModel = this.dataMapper(this.$parent.$parent.dataModel);
                    }
                }
                if (this.unwatchSourceDataModel) {
                    this.unwatchSourceDataModel();
                }
                this.unwatchSourceDataModel = this.$watch('$parent.$parent.dataModel', (newValue, oldValue) => {
                    this.dataModel = this.dataMapper(this.$parent.$parent.dataModel);
                });
            } else if (this.viewModel.dataSource && this.viewModel.dataSource === '$object') {
                this.dataModel = this.dataMapper({});
            } else if (this.viewModel.dataSource && this.viewModel.dataSource === '$array') {
                this.dataModel = this.dataMapper([]);
            } else if (this.viewModel.dataSource && this.viewModel.dataSource !== '') {
                this.dataSourceComponent = $c(this.viewModel.dataSource);
                // let dataModel = $d(this.viewModel.dataSource);
                if (this.dataModel !== this.dataSourceComponent.dataModel) {
                    this.dataModel = this.dataMapper(this.dataSourceComponent.dataModel);
                }
                if (this.unwatchSourceDataModel) {
                    this.unwatchSourceDataModel();
                }
                this.unwatchSourceDataModel = this.$watch('dataSourceComponent.dataModel', (newValue, oldValue) => {
                    this.dataModel = this.dataMapper(this.dataSourceComponent.dataModel);
                });
            } else {
                if (this.dataModel == undefined) {
                    // initialize dataModel?
                }
            }
        },
        getModel() {
            console.info("[" + this.$options.name + "] get viewModel", this['cid']);
            if (this.viewModel && this.viewModel.cid === this['cid']) {
                return this.viewModel;
            }
            this.unregisterEventHandlers();
            this.viewModel = components.getComponentModel(this['cid']);
            this.registerEventHandlers();
            console.info("[" + this.$options.name + "] view viewModel", this.viewModel);
        },
        setDataModel(dataModel) {
            this.dataModel = dataModel;
        },
        getDataModel() {
            return this.dataModel;
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
        actionNames: function() {
            let actionsNames = ['eval', 'emit', 'update', 'redirect'];
            if (this.customActionNames) {
                Array.prototype.push.apply(actionsNames, this.customActionNames());
            }
            return actionsNames;
        },
        eventNames: function() {
            let eventNames = ["@init", "@click", "@data-model-changed"];
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
        componentBorderStyle: function () {
            return this.edit ? (this.selected ? 'box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19); ' : '')
                + 'border: ' + (this.targeted ? 'solid orange 1px !important' : this.selected ? 'solid blue 1px !important' : 'dotted lightgray 1px') + ';' : '';
        },
        $eval: function(value, valueOnError) {
            try {
                let dataModel = this.dataModel;
                let viewModel = this.viewModel;
                let source = viewModel.dataSource ? $d(viewModel.dataSource) : undefined;
                let $eval = this.$eval;
                let result = undefined;
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
                    throw new Error("Expression evaluates to 'undefined'");
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

