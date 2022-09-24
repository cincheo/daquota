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

Vue.component('text-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :data-timestamp="timestamp">
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
            return '<' + this.$evalWithDefault(this.viewModel.tag, 'div')
                + (this.viewModel.class ? ' class="' + this.$eval(this.viewModel.class, '') + '"' : '')
                + (this.viewModel.style ? ' style="' + this.$eval(this.viewModel.style, '') + '"' : '')
                + '>'
                + text
                + '</' + this.$evalWithDefault(this.viewModel.tag, 'div') + '>';
        },
        propNames() {
            return [
                "cid",
                "dataSource",
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
                    description: 'The wrapping element being used - default is "Block"',
                    options: [
                        { value: "div", text: "Block" },
                        { value: "p", text: "Paragraph" },
                        { value: "h1", text: "Heading 1" },
                        { value: "h2", text: "Heading 2" },
                        { value: "h3", text: "Heading 3" },
                        { value: "h4", text: "Heading 4" },
                        { value: "h5", text: "Heading 5" },
                        { value: "h6", text: "Heading 6" },
                        { value: "b", text: "Bold" },
                        { value: "i", text: "Italic" },
                        { value: "u", text: "Underline" },
                        { value: "del", text: "Line-trough" }
                    ]
                },
                text: {
                    label: 'Text or HTML code (overrides the data model)',
                    type: 'code/html',
                    editable: true,
                    rows: 6,
                    maxRows: 30
                }

            }
        }

    }
});


