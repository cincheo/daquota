Vue.component('text-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.layoutClass" :data-timestamp="timestamp">
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-badge v-if="isEditable() && viewModel.field" variant="info">{{ viewModel.field }}</b-badge>
            <div 
                v-on="boundEventHandlers({'click': onClick})"
                :draggable="$eval(viewModel.draggable, false) ? true : false" 
                v-html="generateHtml()"
            ></div>
        </div>
    `,
    methods: {
        generateHtml() {
            let text = '';
            if (this.viewModel.text) {
                text = this.$eval(this.viewModel.text, '#invalid text#');
            } else {
                text = this.value
                if (typeof text !== 'string') {
                    if (text === undefined) {
                        text = '#undefined#';
                    } else {
                        text = '#invalid data#';
                    }
                }
            }
            return '<' + this.$eval(this.viewModel.tag, 'p')
                + (this.viewModel.class ? ' class="' + this.$eval(this.viewModel.class, '') + '"' : '')
                + (this.viewModel.style ? ' style="' + this.$eval(this.viewModel.style, '') + '"' : '')
                + '>'
                + text
                + '</' + this.$eval(this.viewModel.tag, 'p') + '>';
        },
        propNames() {
            return [
                "cid",
                "layoutClass", "class", "style", "dataSource",
                "field",
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
                    label: 'Text (overrides the data model)',
                    type: 'textarea',
                    editable: true,
                    rows: 6
                }

            }
        }

    }
});


