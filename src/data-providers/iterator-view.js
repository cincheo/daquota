Vue.component('iterator-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()">
            <component-icon v-if="isEditable()" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
                <component-view v-for="(item, index) in dataModel" :key="index" :cid="viewModel.body ? viewModel.body.cid : undefined" keyInParent="body" :iteratorIndex="index" :inSelection="isEditable()" />
                <component-view v-if="edit && (!Array.isArray(dataModel) || dataModel.length == 0)" :cid="viewModel.body ? viewModel.body.cid : undefined" keyInParent="body" :inSelection="isEditable()" :iteratorIndex="0" />
            </b-card>
        </div>
    `,
    methods: {
        propNames() {
            return ["cid", "dataSource", "class", "body", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                body: {
                    type: 'ref',
                    editable: true
                }
            }
        }

    }
});


