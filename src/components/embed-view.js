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

Vue.component('embed-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.layoutClass">
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
           <b-embed
              :type="$eval(viewModel.embedType, null)"
              :tag="$eval(viewModel.tag, null)"
              :aspect="$eval(viewModel.aspect, null)"
              :src="src()"
              allowfullscreen
              :class="$eval(viewModel.class, null)"
              :style="$eval(viewModel.style, null)"
              :draggable="$eval(viewModel.draggable, false) ? true : false" 
              v-on="boundEventHandlers({'click': onClick})"
           />
        </div>
    `,
    methods: {
        src() {
            let url = undefined;
            if (this.viewModel.src) {
                url = this.$eval(this.viewModel.src, '#error#');
                if (typeof url !== 'string') {
                    url = this.value;
                }
            } else {
                url = this.value;
            }
            if (typeof url !== 'string') {
                url = '#error#';
            }
            console.info('RETURNING URL', url);
            return url;
        },
        propNames() {
            return ["cid", "embedType", "tag", "aspect", "src"];
        },
        customPropDescriptors() {
            return {
                src: {
                    label: 'URL (overrides the data model)',
                    type: 'text',
                    editable: true,
                    description: 'A URL or formula evaluating to a URL that will override the data model (if not defined, the data model is expected to contain an URL)'
                },
                embedType: {
                    type: 'select',
                    editable: true,
                    options: ['iframe', 'video', 'embed', 'object']
                },
                tag: {
                    type: 'text',
                    editable: true,
                    description: 'Sets the outer element tag which the responsive embed is wrapped in (default is div) to enforce the responsive aspect ratio. '
                },
                aspect: {
                    type: 'select',
                    editable: true,
                    options: ['21by9', '16by9', '4by3', '1by1'],
                    description: 'The aspect ratio of the responsive embed'
                }
            }
        }

    }
});


