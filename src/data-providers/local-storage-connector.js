Vue.component('local-storage-connector', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()">
            <component-icon v-if='edit' :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <b-button v-if="edit" v-b-toggle="'data-model-' + viewModel.cid" class="float-right p-0 m-0" size="sm" variant="link">Data model</b-button>
            <b-collapse v-if="edit" :id="'data-model-' + viewModel.cid" style="clear: both">
                <b-form-textarea
                    v-model="dataModel"
                    rows="1"
                    size="sm" 
                    max-rows="10"></b-form-textarea>
            </b-collapse>
        </div>
    `,
    mounted: function () {
        this.update();
    },
    watch: {
        viewModel: {
            handler: function () {
                this.update();
            },
            immediate: true,
            deep: true
        },
        dataModel: {
            handler: function () {
                localStorage.setItem(this.viewModel.key, JSON.stringify(this.dataModel));
            },
            immediate: true,
            recursive: true
        }
    },
    methods: {
        update() {
            try {
                this.dataModel = JSON.parse(localStorage.getItem(this.viewModel.key));
            } catch (e) {
                this.dataModel = this.$eval(this.viewModel.defaultValue, {});
                return;
            }
            if (this.dataModel == null) {
                this.dataModel = this.$eval(this.viewModel.defaultValue, {});
            }
        },
        propNames() {
            return ["cid", "key", "defaultValue", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                key: {
                    type: 'text',
                    editable: true,
                    description: 'A string representing key used to store the data in the local storage.'
                },
                defaultValue: {
                    type: 'text',
                    editable: true,
                    description: 'The default value of the data model when the data does not exist yet in the local storage or when its value is not valid.'
                }
            }
        }

    }
});


