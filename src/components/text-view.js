Vue.component('text-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.layoutClass">
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <b-badge v-if="edit && viewModel.field" variant="info">{{ viewModel.field }}</b-badge>
            <span :class="viewModel.class" v-html="generateHtml()"></span>
        </div>
    `,
    methods: {
        generateHtml() {
            return '<' + this.$eval(this.viewModel.tag, 'p') + (this.viewModel.class ? ' class=' + this.viewModel.class : '') + '>'
                + this.$eval(this.viewModel.text, '')
                + '</' + this.$eval(this.viewModel.tag, 'p') + '>';
        },
        propNames() {
            return [
                "cid",
                "layoutClass", "class", "dataSource",
                "tag",
                "text",
                "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                tag: {
                    type: 'select',
                    label: 'Type',
                    editable: true,
                    options: [
                        "p", "h1", "h2", "h3", "h4", "h5", "h6", "b", "i", "del", "div", "span"
                    ]
                },
                text: {
                    type: 'textarea',
                    editable: true
                }

            }
        }

    }
});


