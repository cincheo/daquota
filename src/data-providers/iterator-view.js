Vue.component('iterator-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()">
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
                <component-view v-for="(item, index) in dataModel" :cid="viewModel.body ? viewModel.body.cid : undefined" keyInParent="body" :iteratorIndex="index" />
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


