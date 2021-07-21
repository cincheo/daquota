Vue.component('pdf-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.layoutClass">
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
           <iframe
              :key="'iframe-' + viewModel.page"
              :src="$eval(viewModel.documentPath) + '#page=' + $eval(viewModel.page)"
              :class="$eval(viewModel.class)"
              style="min-height: 60rem"
            />
        </div>
    `,
    methods: {
        propNames() {
            return ["cid", "layoutClass", "class", "documentPath", "page", "disabled", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                disabled: {
                    type: 'checkbox',
                    editable: true
                }
            }
        }

    }
});


