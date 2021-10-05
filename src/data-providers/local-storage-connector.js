Vue.component('local-storage-connector', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()">
            <component-icon v-if="isEditable()" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-badge v-if="isEditable() && viewModel.key" variant="info">{{ viewModel.key }}</b-badge>                
            <b-button v-if="isEditable()" v-b-toggle="'data-model-' + viewModel.cid" class="float-right p-0 m-0" size="sm" variant="link">Data model</b-button>
            <b-collapse v-if="isEditable()" :id="'data-model-' + viewModel.cid" style="clear: both">
                <b-form-textarea
                    v-model="dataModel"
                    rows="1"
                    size="sm" 
                    max-rows="10"></b-form-textarea>
            </b-collapse>
        </div>
    `,
    created: function () {
        this.$eventHub.$on('synchronized', (pullResult) => {
            console.info('local storage update for synchronization', pullResult);
            if (pullResult.keys.length > 0) {
                this.update();
            }
        });
    },
    mounted: function () {
        this.update();
    },
    data: function() {
        return {
            unwatchDataModel: undefined
        }
    },
    computed: {
        computedKey: function() {
            let sharedBy = this.$eval(this.viewModel.sharedBy, undefined);
            if (sharedBy) {
                return this.$eval(this.viewModel.key) + '-$-' + sharedBy;
            } else {
                return this.$eval(this.viewModel.key);
            }
        }
    },
    watch: {
        computedKey: {
            handler: function () {
                this.update();
            },
            immediate: true
        },
        remote: {
            handler: async function () {
                if (this.$eval(this.viewModel.remote, false)) {
                    await ide.synchronize();
                    localStorage.removeItem(this.computedKey);
                    this.dataModel = [];
                }
                this.update();
            },
            immediate: true
        }
    },
    methods: {
        async update() {
            if (this.$eval(this.viewModel.remote, false)) {
                if (this.unwatchDataModel) {
                    this.unwatchDataModel();
                }
                let result = await ide.sync.applyActions(this.computedKey, []);
                if (result.data) {
                    this.dataModel = result.data;
                } else {
                    console.error('failed to apply actions to remote data', result);
                }
            } else {
                try {
                    this.dataModel = JSON.parse(localStorage.getItem(this.computedKey));
                } catch (e) {
                    this.dataModel = null;
                }
                if (this.dataModel == null) {
                    this.dataModel = this.$eval(this.viewModel.defaultValue, {});
                }
                if (this.unwatchDataModel) {
                    this.unwatchDataModel();
                }
                this.unwatchDataModel = this.$watch('dataModel', (newValue, oldValue) => {
                    console.info("local storage update", JSON.stringify(this.dataModel, undefined, 2));
                    localStorage.setItem(this.computedKey, JSON.stringify(this.dataModel));
                }, {
                    deep: true
                });
            }
        },
        async applyAction(action) {
            let result = await ide.sync.applyActions(this.computedKey, [action]);
            if (result.data) {
                this.dataModel = result.data;
            } else {
                console.error('failed to apply actions to remote data', result);
            }
        },
        // =======
        async addData(data) {
            if (this.$eval(this.viewModel.remote, false)) {
                await this.applyAction({ type: 'ADD', item: data });
            } else {
                editableComponent.methods.addData.call(this, data);
            }
        },
        async replaceData(data) {
            if (this.$eval(this.viewModel.remote, false)) {
                await this.applyAction({ type: 'REPLACE', item: data });
            } else {
                editableComponent.methods.replaceData.call(this, data);
            }
        },
        async removeData(data) {
            if (this.$eval(this.viewModel.remote, false)) {
                await this.applyAction({ type: 'REMOVE', item: data });
            } else {
                editableComponent.methods.removeData.call(this, data);
            }
        },
        async insertDataAt(data, index) {
            if (this.$eval(this.viewModel.remote, false)) {
                await this.applyAction({ type: 'INSERT_AT', item: data, index: index });
            } else {
                editableComponent.methods.insertDataAt.call(this, data, index);
            }
        },
        async replaceDataAt(data, index) {
            if (this.$eval(this.viewModel.remote, false)) {
                await this.applyAction({ type: 'REPLACE_AT', item: data, index: index });
            } else {
                editableComponent.methods.replaceDataAt.call(this, data, index);
            }
        },
        async removeDataAt(index) {
            if (this.$eval(this.viewModel.remote, false)) {
                await this.applyAction({ type: 'REMOVE_AT', item: {}, index: index });
            } else {
                editableComponent.methods.removeDataAt.call(this, index);
            }
        },
        async concatArray(array) {
            if (this.$eval(this.viewModel.remote, false)) {
                await this.applyAction({ type: 'CONCAT_ARRAY', item: array });
            } else {
                editableComponent.methods.concatArray.call(this, array);
            }
        },
        async insertArrayAt(array, index) {
            if (this.$eval(this.viewModel.remote, false)) {
                await this.applyAction({ type: 'INSERT_ARRAY_AT', item: array, index: index });
            } else {
                editableComponent.methods.insertArrayAt.call(this, array, index);
            }
        },
        async moveDataFromTo(from, to) {
            if (this.$eval(this.viewModel.remote, false)) {
                await this.applyAction({ type: 'MOVE_FROM_TO', item: {}, from: from, to: to });
            } else {
                editableComponent.methods.moveDataFromTo.call(this, from, to);
            }
        },
        // =========
        propNames() {
            return ["cid", "key", "sharedBy", "remote", "defaultValue", "eventHandlers"];
        },
        customActionNames() {
            return ["rename"];
        },
        async clear() {
            if (this.$eval(this.viewModel.remote, false)) {
                await this.applyAction({ type: 'CLEAR', item: {} });
            } else {
                localStorage.removeItem(this.computedKey);
            }
        },
        rename(newName) {
            if (this.$eval(this.viewModel.remote, false)) {
                throw new Error('unsupported operation for remote data');
            } else {
                localStorage.setItem(newName, JSON.stringify(this.dataModel));
            }
        },
        customPropDescriptors() {
            return {
                key: {
                    type: 'text',
                    editable: true,
                    description: 'A string representing key used to store the data in the local storage'
                },
                sharedBy: {
                    type: 'text',
                    editable: true,
                    description: 'A user ID - the given user must share the key with you to have access'
                },
                remote: {
                    type: 'checkbox',
                    editable: true,
                    description: 'If set, the storage is only remote (on the server) and no data is stored locally in the browser - the user must be authenticated'
                },
                defaultValue: {
                    type: 'text',
                    editable: true,
                    description: 'The default value of the data model when the data does not exist yet in the local storage or when its value is not valid'
                }
            }
        }

    }
});


