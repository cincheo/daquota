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


Vue.component('collection-editor-builder', {
    template: `
        <b-modal id="collection-editor-builder" ref="collection-editor-builder" title="Build collection editor" @ok="build" @show="onShow" lazy>

             <b-form-group label="Model" label-size="sm" label-class="mb-0" class="mb-1">
                <b-form-select v-model="modelName" :options="models" size="sm"></b-form-select>
            </b-form-group>
           
            <b-form-group label="Component class" label-size="sm" label-class="mb-0" class="mb-1">
                <b-form-select v-model="className" :options="selectableClassesForModel()" size="sm"></b-form-select>
            </b-form-group>

            <b-form-group label="Storage key" label-size="sm" label-class="mb-0" class="mb-1">
                <b-form-input v-model="key" size="sm"></b-form-input>
            </b-form-group>

            <b-form-group label="Container component type" label-size="sm" label-class="mb-0" class="mb-1">
                <b-form-select v-model="collectionContainerType" :options="['Table', 'Iterator']" size="sm"></b-form-select>
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
            
            <b-form-group v-if="collectionContainerType === 'Table'" label="Split views for large screens" label-size="sm" label-cols="8" label-class="mb-0 mt-0" class="mb-1">
                <b-form-checkbox v-model="split" size="sm" switch class="float-right"></b-form-checkbox>
            </b-form-group>
                
        </b-modal>
    `,
    data: function () {
        return {
            key: undefined,
            modelName: 'default',
            className: undefined,
            methodName: undefined,
            instanceType: undefined,
            createInstance: false,
            updateInstance: false,
            deleteInstance: false,
            split: false,
            collectionContainerType: 'Table',
            models: this.getModels()
        }
    },
    methods: {
        onShow() {
            this.models = this.getModels();
        },
        getModels() {
            return components.getModels()?.map(m => m.name);
        },
        selectableClassesForModel() {
            if (this.modelName) {
                return components.getModelClasses(this.modelName).map(c => c.name);
            } else {
                return [];
            }
        },
        fillTableFields(tableView, instanceType) {
            for (let prop of instanceType.fields) {
                tableView.fields.push({
                    key: prop.name,
                    label: Tools.camelToLabelText(prop.name)
                });
            }
            return tableView;
        },
        build() {
            this.instanceType = components.getModelClasses(this.modelName).find(c => c.name === this.className);

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

            if (this.collectionContainerType === 'Iterator') {

                let collectionComponent = components.buildCollectionForm(
                    this.instanceType, undefined, !this.createInstance, !this.updateInstance, !this.deleteInstance
                );
                collectionComponent.dataSource = collectionConnector.cid;
                components.registerComponentModel(collectionComponent);
                container.components.push(collectionComponent);

            } else {

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
                let updateInstanceContainer = undefined;
                if (split) {
                    updateInstanceContainer = components.buildInstanceForm(this.instanceType);
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
            }

            components.registerComponentModel(container);
            components.setChild(ide.getTargetLocation(), container);
            ide.selectComponent(container.cid);
            this.$refs['collection-editor-builder'].hide();

        }
    }
});


