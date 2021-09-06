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
        }
    },
    methods: {
        update() {
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
        },
        propNames() {
            return ["cid", "key", "sharedBy", "defaultValue", "eventHandlers"];
        },
        customActionNames() {
            return ["rename"];
        },
        clear() {
            localStorage.removeItem(this.computedKey);
        },
        rename(newName) {
            localStorage.setItem(newName, JSON.stringify(this.dataModel));
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
                defaultValue: {
                    type: 'text',
                    editable: true,
                    description: 'The default value of the data model when the data does not exist yet in the local storage or when its value is not valid'
                }
            }
        }

    }
});


