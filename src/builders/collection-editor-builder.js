Vue.component('collection-editor-builder', {
    template: `
        <b-modal id="collection-editor-builder" ref="collection-editor-builder" title="Build collection editor" @ok="build">

            <b-form-group label="Kind" label-size="sm" label-class="mb-0" class="mb-1">
                <b-form-select v-model="kind" :options="['local storage', 'API']" size="sm"></b-form-select>

            </b-form-group>
            <div v-if="kind == 'local storage'">
                
                <b-form-group label="Key" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-input v-model="key" size="sm"></b-form-input>
                </b-form-group>

                 <b-form-group label="Model" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-select v-model="model" :options="getModels()" size="sm"></b-form-select>
                </b-form-group>
               
                <b-form-group label="Component class" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-select v-model="className" :options="selectableClassesForModel()" size="sm"></b-form-select>
                </b-form-group>

                <b-form-group label="Allow create instance" label-size="sm" label-cols="8" label-class="mb-0 mt-0" class="mb-1">
                    <b-form-checkbox v-model="createInstance" size="sm" switch class="float-right"></b-form-checkbox>
                </b-form-group>
                <b-form-group label="Allow update instance" label-size="sm" label-cols="8" label-class="mb-0 mt-0" class="mb-1">
                    <b-form-checkbox v-model="updateInstance" size="sm" switch class="float-right"></b-form-checkbox>
                </b-form-group>
                <b-form-group label="Allow delete instance" label-size="sm" label-cols="8" label-class="mb-0 mt-0" class="mb-1">
                    <b-form-checkbox v-model="deleteInstance" size="sm" switch class="float-right"></b-form-checkbox>
                </b-form-group>
                <b-form-group label="Split views for large screens" label-size="sm" label-cols="8" label-class="mb-0 mt-0" class="mb-1">
                    <b-form-checkbox v-model="split" size="sm" switch class="float-right"></b-form-checkbox>
                </b-form-group>
                            
            </div>

            <div v-if="kind == 'API'">
            
                <b-form-group label="Collection access point class" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-select v-model="className" :options="selectableClasses()" size="sm" @change="updateClasses"></b-form-select>
                </b-form-group>
                <b-form-group label="Collection getter" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-select v-model="methodName" :options="selectableMethods(className)" size="sm" @change="fillFields"></b-form-select>
                </b-form-group>
                <div v-if="instanceType">Instance class {{ instanceType.name }} fields:</div>
                <b-form-textarea
                    v-if="instanceType"
                    disabled
                    id="textarea"
                    v-model="fields"
                    rows="3"
                    size="sm" 
                    max-rows="6"></b-form-textarea>
                
                <b-card class="mt-2" body-class="p-1">
                    <b-form-group label="Allow create instance" label-size="sm" label-cols="8" label-class="mb-0 mt-0" class="mb-1">
                        <b-form-checkbox v-model="createInstance" size="sm" switch class="float-right"></b-form-checkbox>
                    </b-form-group>
                    <b-form-group label="Instance creation class" label-size="sm" label-class="mb-0" class="mb-1">
                        <b-form-select v-model="createClassName" :options="selectableClasses()" size="sm" :disabled="!createInstance"></b-form-select>
                    </b-form-group>
                    <b-form-group label="Instance creation method" label-size="sm" label-class="mb-0" class="mb-1">
                        <b-form-select v-model="createMethodName" :options="selectableMethods(createClassName)" size="sm" :disabled="!createInstance"></b-form-select>
                    </b-form-group>
                </b-card>
                
                <b-card class="mt-2" body-class="p-1">
                    <b-form-group label="Allow update instance" label-size="sm" label-cols="8" label-class="mb-0 mt-0" class="mb-1">
                        <b-form-checkbox v-model="updateInstance" size="sm" switch class="float-right"></b-form-checkbox>
                    </b-form-group>
                    <b-form-group label="Instance update class" label-size="sm" label-class="mb-0" class="mb-1">
                        <b-form-select v-model="updateClassName" :options="selectableClasses()" size="sm" :disabled="!updateInstance"></b-form-select>
                    </b-form-group>
                    <b-form-group label="Instance update method" label-size="sm" label-class="mb-0" class="mb-1">
                        <b-form-select v-model="updateMethodName" :options="selectableMethods(updateClassName)" size="sm" :disabled="!updateInstance"></b-form-select>
                    </b-form-group>
                </b-card>
                
                <b-card class="mt-2" body-class="p-1">
                    <b-form-group label="Allow delete instance" label-size="sm" label-cols="8" label-class="mb-0 mt-0" class="mb-1">
                        <b-form-checkbox v-model="deleteInstance" size="sm" switch class="float-right"></b-form-checkbox>
                    </b-form-group>
                    <b-form-group label="Instance delete class" label-size="sm" label-class="mb-0" class="mb-1">
                        <b-form-select v-model="deleteClassName" :options="selectableClasses()" size="sm" :disabled="!deleteInstance"></b-form-select>
                    </b-form-group>
                    <b-form-group label="Instance delete method" label-size="sm" label-class="mb-0" class="mb-1">
                        <b-form-select v-model="deleteMethodName" :options="selectableMethods(deleteClassName)" size="sm" :disabled="!deleteInstance"></b-form-select>
                    </b-form-group>
                </b-card>
            
            </div>
                
        </b-modal>
    `,
    data: function () {
        return {
            kind: 'local storage',
            key: undefined,
            model: undefined,
            className: undefined,
            methodName: undefined,
            instanceType: undefined,
            fields: [],
            createInstance: false,
            createClassName: undefined,
            createMethodName: undefined,
            updateInstance: false,
            updateClassName: undefined,
            updateMethodName: undefined,
            deleteInstance: false,
            deleteClassName: undefined,
            deleteMethodName: undefined,
            split: false

        }
    },
    methods: {
        getModels() {
            return Tools.arrayConcat([''], JSON.parse(localStorage.getItem('dlite.models')).map(m => m.name));
        },
        updateClasses() {
            this.createClassName = this.className;
            this.updateClassName = this.className;
            this.deleteClassName = this.className;
        },
        fillFields() {
            let method = ide.getDomainModel().classDescriptors[this.className]['methodDescriptors'][this.methodName];
            let returnedClassName = method['componentType'];
            if (!returnedClassName) {
                this.notACollection = true;
                return;
            }
            this.instanceType = ide.getDomainModel().classDescriptors[returnedClassName];
            this.fields = ide.getDomainModel().classDescriptors[returnedClassName].fieldDescriptors;
        },
        selectableClasses() {
            return Tools.arrayConcat(ide.getDomainModel().repositories, ide.getDomainModel().services);
        },
        selectableClassesForModel() {
            if (this.model) {
                this.loadedClasses = JSON.parse(localStorage.getItem('dlite.models.' + this.model))
                    .filter(c => c.type.toUpperCase() === 'ENTITY' || c.type.toUpperCase() === 'DTO');
                return this.loadedClasses.map(c => c.name);
            } else {
                return [];
            }
        },
        selectableMethods(className) {
            return className ? ide.getDomainModel().classDescriptors[className]['methods'] : [];
        },
        createConnector(container, kind, className, methodName) {
            let connector = components.createComponentModel("ApplicationConnector");
            connector.kind = ide.getDomainModel().classDescriptors[className].kind;
            connector.className = className;
            connector.methodName = methodName;
            components.registerComponentModel(connector);
            container.components.push(connector);
            return connector;
        },
        fillTableFields(tableView, instanceType) {
            if (this.kind === 'local storage') {
                for (let prop of instanceType.fields) {
                    tableView.fields.push({
                        key: prop.name,
                        label: Tools.camelToLabelText(prop.name)
                    });
                }
            } else {
                for (let propName of instanceType.fields) {
                    //let prop = instanceType.fieldDescriptors[propName];
                    tableView.fields.push({
                        key: propName,
                        label: Tools.camelToLabelText(propName)
                    });
                }
            }
            return tableView;
        },
        build() {
            if (this.kind === 'local storage') {
                this.buildForLocalStorage();
            }
            if (this.kind === 'API') {
                this.buildForAPI();
            }
        },
        buildForLocalStorage() {
            this.instanceType = this.loadedClasses.find(c => c.name === this.className);

            if (!this.instanceType) {
                return;
            }
            console.info("building collection editor", this.instanceType);

            let container = components.createComponentModel("ContainerView");

            let collectionConnector = components.createComponentModel("LocalStorageConnector");
            collectionConnector.key = this.key;
            collectionConnector.defaultValue = '=[]';
            components.registerComponentModel(collectionConnector);
            container.components.push(collectionConnector);

            let split = undefined;
            if (this.split) {
                split = components.createComponentModel("ContainerView");
                split.class = "=this.screenWidth <= 800 ? 'p-0' : ''";
                split.direction = "row";
            }

            let tableContainer = components.createComponentModel("ContainerView");
            tableContainer.class = "=this.screenWidth <= 800 ? 'p-0' : ''";
            tableContainer.layoutClass = "flex-grow-1";
            let table = components.createComponentModel("TableView");
            this.fillTableFields(table, this.instanceType);
            table.dataSource = collectionConnector.cid;

            let updateButton = undefined;
            if (split) {
                let updateInstanceContainer = components.buildInstanceForm(this.instanceType);
                updateInstanceContainer.hidden = "=this.screenWidth <= 800";
                updateInstanceContainer.layoutClass = "flex-grow-1";
                if (this.updateInstance) {
                    updateButton = components.createComponentModel("ButtonView");
                    updateButton.block = true;
                    updateButton.variant = 'primary';
                    updateButton.label = "Update " + Tools.camelToLabelText(Tools.toSimpleName(this.instanceType.name), true);
                    components.registerComponentModel(updateButton);
                    updateInstanceContainer.components.push(updateButton);
                }

                components.registerComponentModel(updateInstanceContainer);

                table.eventHandlers.push(
                    {
                        global: false,
                        name: '@item-selected',
                        actions: [
                            {
                                targetId: updateInstanceContainer.cid,
                                name: 'setData',
                                description: 'Update instance form',
                                condition: 'value',
                                argument: 'value'
                            }
                        ]
                    }
                );
            }

            components.registerComponentModel(table);
            tableContainer.components.push(table);

            if (updateButton) {
                updateButton.eventHandlers[0].actions[0] = {
                    targetId: collectionConnector.cid,
                    name: 'replaceDataAt',
                    description: 'Update collection',
                    condition: `$c('${table.cid}').selectedItem`,
                    argument: `$d(parent), $d('${table.cid}').indexOf($c('${table.cid}').selectedItem)`
                }
            }

            // UPDATE DIALOG (for mobile or !split)

            let updateDialog = components.createComponentModel("DialogView");
            updateDialog.title = "Update " + Tools.camelToLabelText(Tools.toSimpleName(this.instanceType.name), true);
            let updateInstanceDialogContainer = components.buildInstanceForm(this.instanceType);
            updateInstanceDialogContainer.dataSource = '$object';
            let doUpdateButton = undefined;
            if (this.updateInstance) {
                doUpdateButton = components.createComponentModel("ButtonView");
                doUpdateButton.block = true;
                doUpdateButton.variant = 'primary';
                doUpdateButton.label = "Update " + Tools.camelToLabelText(Tools.toSimpleName(this.instanceType.name), true);
                doUpdateButton.eventHandlers[0].actions.push({
                    targetId: collectionConnector.cid,
                    name: 'replaceDataAt',
                    description: 'Update collection content',
                    condition: `$c('${table.cid}').selectedItem`,
                    argument: `$d(parent), $d('${table.cid}').indexOf($c('${table.cid}').selectedItem)`
                });
                components.registerComponentModel(doUpdateButton);
                updateInstanceDialogContainer.components.push(doUpdateButton);
            }
            components.registerComponentModel(updateInstanceDialogContainer);
            updateDialog.content = updateInstanceDialogContainer;
            components.registerComponentModel(updateDialog);

            if (doUpdateButton) {
                doUpdateButton.eventHandlers[0].actions.push({
                    targetId: updateDialog.cid,
                    name: 'hide',
                    description: 'Close dialog'
                });
            }

            let openButton = components.createComponentModel("ButtonView");
            openButton.block = true;
            if (split) {
                openButton.hidden = "=this.screenWidth > 800";
            }
            openButton.disabled = `=!$c('${table.cid}').selectedItem`;
            openButton.label = "Open " + Tools.camelToLabelText(Tools.toSimpleName(this.instanceType.name), true);
            openButton.eventHandlers[0].actions[0] = {
                targetId: updateDialog.cid,
                name: 'show',
                description: 'Open update dialog',
            };
            openButton.eventHandlers[0].actions.push(
                {
                    targetId: updateInstanceDialogContainer.cid,
                    name: 'setData',
                    argument: `$c('${table.cid}').selectedItem`,
                    description: 'Fill dialog container'
                }
            );
            components.registerComponentModel(openButton);
            tableContainer.components.push(openButton);

            // END OF UPDATE DIALOG

            let createDialog = undefined;
            if (this.createInstance) {
                createDialog = components.createComponentModel("DialogView");
                createDialog.title = "Create " + Tools.camelToLabelText(Tools.toSimpleName(this.instanceType.name), true);
                let createInstanceContainer = components.buildInstanceForm(this.instanceType);
                createInstanceContainer.dataSource = '$object';
                let doCreateButton = components.createComponentModel("ButtonView");
                doCreateButton.block = true;
                doCreateButton.variant = 'primary';
                doCreateButton.label = "Create " + Tools.camelToLabelText(Tools.toSimpleName(this.instanceType.name), true);
                doCreateButton.eventHandlers[0].actions[0] = {
                    targetId: collectionConnector.cid,
                    name: 'eval',
                    description: 'Add ID if not exist',
                    condition: '!parent.dataModel.id',
                    argument: 'parent.dataModel.id = Tools.uuid()'
                }
                doCreateButton.eventHandlers[0].actions.push({
                    targetId: collectionConnector.cid,
                    name: 'addData',
                    description: 'Update collection content',
                    argument: '$d(parent)'
                });

                components.registerComponentModel(doCreateButton);
                createInstanceContainer.components.push(doCreateButton);
                components.registerComponentModel(createInstanceContainer);
                createDialog.content = createInstanceContainer;
                components.registerComponentModel(createDialog);

                doCreateButton.eventHandlers[0].actions.push({
                    targetId: createDialog.cid,
                    name: 'hide',
                    description: 'Close dialog'
                });

                let createButton = components.createComponentModel("ButtonView");
                createButton.block = true;
                createButton.variant = 'primary';
                createButton.label = "Create " + Tools.camelToLabelText(Tools.toSimpleName(this.instanceType.name), true);
                createButton.eventHandlers[0].actions[0] = {
                    targetId: createDialog.cid,
                    name: 'show',
                    description: 'Open create dialog',
                }
                components.registerComponentModel(createButton);
                tableContainer.components.push(createButton);
            }

            if (this.deleteInstance) {
                let deleteButton = components.createComponentModel("ButtonView");
                deleteButton.block = true;
                deleteButton.variant = 'danger';
                deleteButton.label = "Delete " + Tools.camelToLabelText(Tools.toSimpleName(this.instanceType.name), true);
                deleteButton.disabled = `=!$c('${table.cid}').selectedItem`;
                deleteButton.eventHandlers[0].actions[0] = {
                    targetId: collectionConnector.cid,
                    name: 'removeDataAt',
                    description: 'Delete from collection',
                    condition: `$c('${table.cid}').selectedItem`,
                    argument: `$d(target).findIndex(data => data.id === $c('${table.cid}').selectedItem.id)`
                }
                // deleteButton.eventHandlers[0].actions.push({
                //     targetId: collectionConnector.cid,
                //     name: 'update',
                //     description: 'Update table content'
                // });

                components.registerComponentModel(deleteButton);
                tableContainer.components.push(deleteButton);
            }

            components.registerComponentModel(tableContainer);

            if (split) {
                split.components.push(tableContainer);
                split.components.push(updateInstanceContainer);
                components.registerComponentModel(split);
                container.components.push(split);
            } else {
                container.components.push(tableContainer);
            }

            container.components.push(updateDialog);

            if (createDialog) {
                container.components.push(createDialog);
            }

            components.registerComponentModel(container);
            components.setChild(ide.getTargetLocation(), container);
            ide.selectComponent(container.cid);
            this.$refs['collection-editor-builder'].hide();

        },
        buildForAPI() {
            if (!this.instanceType) {
                return;
            }
            console.info("building collection editor", this.className);

            let container = components.createComponentModel("ContainerView");

            let collectionConnector = this.createConnector(container, ide.getDomainModel().classDescriptors[this.className].kind, this.className, this.methodName);
            let createConnector = this.createConnector(container, ide.getDomainModel().classDescriptors[this.createClassName].kind, this.createClassName, this.createMethodName);
            let updateConnector = this.createConnector(container, ide.getDomainModel().classDescriptors[this.updateClassName].kind, this.updateClassName, this.updateMethodName);
            let deleteConnector = this.createConnector(container, ide.getDomainModel().classDescriptors[this.deleteClassName].kind, this.deleteClassName, this.deleteMethodName);

            let split = components.createComponentModel("SplitView");

            let tableContainer = components.createComponentModel("ContainerView");
            let table = components.createComponentModel("TableView");
            components.fillTableFields(table, this.instanceType);
            table.dataSource = collectionConnector.cid;

            let updateInstanceContainer = components.buildInstanceForm(this.instanceType);
            if (this.updateInstance) {
                let updateButton = components.createComponentModel("ButtonView");
                updateButton.label = "Update " + Tools.camelToLabelText(Tools.toSimpleName(this.instanceType.name), true);
                updateButton.eventHandlers[0].actions[0] = {
                    targetId: updateConnector.cid,
                    name: 'invoke',
                    description: 'Invoke update connector',
                    argument: '$d(parent)'
                }
                components.registerComponentModel(updateButton);
                updateInstanceContainer.components.push(updateButton);
            }

            components.registerComponentModel(updateInstanceContainer);

            table.eventHandlers.push(
                {
                    global: false,
                    name: '@item-selected',
                    actions: [{
                        targetId: updateInstanceContainer.cid,
                        name: 'eval',
                        description: 'Update instance form',
                        argument: 'target.dataModel = value'
                    }]
                }
            );

            components.registerComponentModel(table);
            tableContainer.components.push(table);

            let createDialog = undefined;
            if (this.createInstance) {
                createDialog = components.createComponentModel("DialogView");
                createDialog.title = "Create " + Tools.camelToLabelText(Tools.toSimpleName(this.instanceType.name), true);
                let createInstanceContainer = components.buildInstanceForm(this.instanceType);
                createInstanceContainer.dataSource = '$object';
                let doCreateButton = components.createComponentModel("ButtonView");
                doCreateButton.label = "Create " + Tools.camelToLabelText(Tools.toSimpleName(this.instanceType.name), true);
                doCreateButton.eventHandlers[0].actions[0] = {
                    targetId: createConnector.cid,
                    name: 'invoke',
                    description: 'Invoke create connector',
                    argument: '$d(parent)'
                }
                doCreateButton.eventHandlers[0].actions.push({
                    targetId: collectionConnector.cid,
                    name: 'update',
                    description: 'Update table content'
                });

                components.registerComponentModel(doCreateButton);
                createInstanceContainer.components.push(doCreateButton);
                components.registerComponentModel(createInstanceContainer);
                createDialog.content = createInstanceContainer;
                components.registerComponentModel(createDialog);

                doCreateButton.eventHandlers[0].actions.push({
                    targetId: createDialog.cid,
                    name: 'hide',
                    description: 'Close dialog'
                });

                let createButton = components.createComponentModel("ButtonView");
                createButton.label = "Create " + Tools.camelToLabelText(Tools.toSimpleName(this.instanceType.name), true);
                createButton.eventHandlers[0].actions[0] = {
                    targetId: createDialog.cid,
                    name: 'show',
                    description: 'Open create dialog',
                }
                components.registerComponentModel(createButton);
                tableContainer.components.push(createButton);
            }

            if (this.deleteInstance) {
                let deleteButton = components.createComponentModel("ButtonView");
                deleteButton.label = "Delete " + Tools.camelToLabelText(Tools.toSimpleName(this.instanceType.name), true);
                deleteButton.eventHandlers[0].actions[0] = {
                    targetId: deleteConnector.cid,
                    name: 'invoke',
                    description: 'Invoke delete connector',
                    argument: `$c('${table.cid}').selectedItem`
                }
                deleteButton.eventHandlers[0].actions.push({
                    targetId: collectionConnector.cid,
                    name: 'update',
                    description: 'Update table content'
                });

                components.registerComponentModel(deleteButton);
                tableContainer.components.push(deleteButton);
            }

            components.registerComponentModel(tableContainer);

            split.primaryComponent = tableContainer;
            split.secondaryComponent = updateInstanceContainer;

            components.registerComponentModel(split);

            container.components.push(split);

            if (createDialog) {
                container.components.push(createDialog);
            }

            components.registerComponentModel(container);
            components.setChild(ide.getTargetLocation(), container);
            ide.selectComponent(container.cid);
            this.$refs['collection-editor-builder'].hide();

        }
    }
});


