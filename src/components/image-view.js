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

Vue.component('image-view', {
    extends: editableComponent,
    template: `
        <div :id="cid">
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-link v-if="isLink()" 
                :href="$eval(viewModel.href, null)"
                :target="$eval(viewModel.openLinkInNewWindow, null) ? '_blank' : undefined"
            >
                <b-img 
                    ref="image"
                    :class="$eval(viewModel.class, null)"
                    :src="src" 
                    :blank="$eval(viewModel.blank, null)" 
                    :blank-color="$eval(viewModel.blankColor, null)" 
                    :block="$eval(viewModel.display, null) === 'block'" 
                    :center="$eval(viewModel.display, null) === 'center'"
                    :fluid="$eval(viewModel.display, null) === 'fluid'"
                    :fluid-grow="$eval(viewModel.display, null) === 'fluid-grow'"
                    :left="$eval(viewModel.display, null) === 'left'"
                    :right="$eval(viewModel.display, null) === 'right'"
                    :height="$eval(viewModel.height, null)"
                    :width="$eval(viewModel.width, null)"
                    :rounded="$eval(viewModel.rounded, null)"
                    :thumbnail="$eval(viewModel.thumbnail, null)"
                    :style="$eval(viewModel.style, '') + ';' + ($eval(viewModel.invertColors, false) ? 'filter: invert(1)' : '')"
                    :draggable="$eval(viewModel.draggable, false) ? true : false" 
                    v-on="boundEventHandlers({'click': onClick})"
                >
                </b-img>
            </b-link>
            <b-img v-else 
                ref="image"
                :class="$eval(viewModel.class, null)"
                :src="src" 
                :blank="$eval(viewModel.blank, null)" 
                :blank-color="$eval(viewModel.blankColor, null)" 
                :block="$eval(viewModel.display, null) === 'block'" 
                :center="$eval(viewModel.display, null) === 'center'"
                :fluid="$eval(viewModel.display, null) === 'fluid'"
                :fluid-grow="$eval(viewModel.display, null) === 'fluid-grow'"
                :left="$eval(viewModel.display, null) === 'left'"
                :right="$eval(viewModel.display, null) === 'right'"
                :height="$eval(viewModel.height, null)"
                :width="$eval(viewModel.width, null)"
                :rounded="$eval(viewModel.rounded, null)"
                :thumbnail="$eval(viewModel.thumbnail, null)"
                :style="$eval(viewModel.style, '') + ';' + ($eval(viewModel.invertColors, false) ? 'filter: invert(1)' : '')"
                :draggable="$eval(viewModel.draggable, false) ? true : false" 
                v-on="boundEventHandlers({'click': onClick})"
            >
            </b-img>
        </div>
    `,
    mounted: function () {
        this.$refs['image'].addEventListener("load", event => {
            // we may want to fire a component event here... but let's wait for a concrete use case...
            let isLoaded = event.target.complete && event.target.naturalHeight !== 0;
            if (isLoaded) {
                console.info("loaded image", event);
                let xhr = new XMLHttpRequest();
                xhr.open('HEAD', this.$refs['image'].src, true);
                xhr.onreadystatechange = function(){
                    if ( xhr.readyState == 4 ) {
                        if ( xhr.status == 200 ) {
                            //console.info('image Size in bytes: ' + xhr.getResponseHeader('Content-Length'));
                            try {
                                ide.monitor('DOWNLOAD', 'IMAGE', Number.parseInt(xhr.getResponseHeader('Content-Length')) / 1000);
                            } catch (e) {
                                console.error('error monitoring data');
                            }
                        } else {
                            console.error('error monitoring data');
                        }
                    }
                };
                xhr.send(null);
            }
            if (isLoaded && ide.editMode) {
                this.$nextTick(() => ide.updateSelectionOverlay(ide.selectedComponentId));
            }

        });
    },
    watch: {
        src: function () {
            if (ide.editMode) {
                setTimeout(() => ide.updateSelectionOverlay(ide.selectedComponentId), 200);
            }
        }
    },
    computed: {
        src: function() {
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
            return url;
        }
    },
    methods: {
        isLink() {
            let href = this.$eval(this.viewModel, null);
            return typeof href === 'string' && href.length > 0;
        },
        propNames() {
            return ["cid", "dataSource", "field", "src", "href", "openLinkInNewWindow", "blank", "blankColor", "display", "width", "height", "rounded", "thumbnail", "invertColors", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                src: {
                    label: 'URL (overrides the data model)',
                    type: 'text',
                    editable: true,
                    description: 'A URL or formula evaluating to a URL that will override the data model (if not defined, the data model is expected to contain an image URL)'
                },
                href: {
                    label: 'Href link (URL)',
                    editable: true,
                    description: 'When defined, wraps this image into a link'
                },
                openLinkInNewWindow: {
                    type: 'checkbox',
                    editable: (viewModel) => !!viewModel.href
                },
                blank: {
                    type: 'checkbox',
                    editable: true
                },
                blankColor: {
                    inputType: 'color',
                    editable: true
                },
                display: {
                    type: 'select',
                    editable: true,
                    options: [
                        'default', 'block', 'center', 'fluid', 'fluid-grow', 'left', 'right'
                    ]
                },
                rounded: {
                    type: 'checkbox',
                    editable: true
                },
                thumbnail: {
                    type: 'checkbox',
                    editable: true
                },
                invertColors: {
                    type: 'checkbox',
                    editable: true
                }
            }
        }

    }
});


