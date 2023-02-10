/*
 * d.Lite - low-code platform for local-first Web/Mobile development
 * Copyright (C) 2021-2023 CINCHEO
 *                         https://www.cincheo.com
 *                         renaud.pawlak@cincheo.com
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

Vue.component('card-view', {
    extends: editableComponent,
    template: `
        <div :id="cid"
            :class="viewModel.fillHeight ? 'h-100' : ''"
            :draggable="$eval(viewModel.draggable, false) ? true : false" 
        >
            <b-card 
                no-body
                :img-src="$eval(viewModel.imgSrc, '')" 
                :img-alt="$eval(viewModel.imgAlt, '')" 
                :img-top="$eval(viewModel.imgPosition, undefined) === 'top'" 
                :img-end="$eval(viewModel.imgPosition, undefined) === 'end'" 
                :img-left="$eval(viewModel.imgPosition, undefined) === 'left'" 
                :img-right="$eval(viewModel.imgPosition, undefined) === 'right'" 
                :img-bottom="$eval(viewModel.imgPosition, undefined) === 'bottom'" 
                :img-start="$eval(viewModel.imgPosition, undefined) === 'start'" 
                :img-width="$eval(viewModel.imgWidth, undefined)"
                :bg-variant="$eval(viewModel.bgVariant, undefined)"
                :border-variant="$eval(viewModel.borderVariant, undefined)"
                :text-variant="$eval(viewModel.textVariant, undefined)"
                :body-bg-variant="$eval(viewModel.bodyBgVariant, undefined)"
                :body-border-variant="$eval(viewModel.bodyBorderVariant, undefined)"
                :body-text-variant="$eval(viewModel.bodyTextVariant, undefined)"
                :footer-bg-variant="$eval(viewModel.footerBgVariant, undefined)"
                :footer-border-variant="$eval(viewModel.footerBorderVariant, undefined)"
                :footer-text-variant="$eval(viewModel.footerTextVariant, undefined)"
                :header-class="$eval(viewModel.headerClass, undefined)"
                :footer-class="$eval(viewModel.footerClass, undefined)"
                :body-class="$eval(viewModel.bodyClass, undefined)"
                :class="componentClass()"
                :style="$eval(viewModel.style)"
                v-on="boundEventHandlers({'click': onClick})"
            >

                <b-card-header v-if="viewModel.headerEnabled || viewModel.collapsable">
                    <div v-if="viewModel.collapsable" class="d-flex flex-row align-items-center" style="gap: 1rem">
                        <b-icon 
                            :icon="visible ? (viewModel.visibleIcon ? $eval(viewModel.visibleIcon, 'chevron-down') : 'chevron-down') : (viewModel.hiddenIcon ? $eval(viewModel.hiddenIcon, 'chevron-right') : 'chevron-right')" 
                            @click="visible = !visible" style="cursor: pointer"/>
                        <component-view :cid="viewModel.header ? viewModel.header.cid : undefined" keyInParent="header" :inSelection="isEditable()" />
                    </div>
                    <component-view v-else :cid="viewModel.header ? viewModel.header.cid : undefined" keyInParent="header" :inSelection="isEditable()" />
                </b-card-header>                

                
                <b-collapse v-if="viewModel.collapsable" v-model="visible">        
                    <b-card-body>
                        <b-card-title v-if="viewModel.title">{{$eval(viewModel.title, '')}}</b-card-title>
                        <b-card-sub-title v-if="viewModel.subTitle" class="mb-2">{{$eval(viewModel.subTitle, '')}}</b-card-sub-title>
                        <b-card-text v-if="viewModel.text">
                          {{ $eval(viewModel.text) }}
                        </b-card-text>
                             
                        <component-view v-if="edit || viewModel.body && viewModel.body.cid" ref="content" :cid="viewModel.body ? viewModel.body.cid : undefined" keyInParent="body" :inSelection="isEditable()" />
        
                        <b-card-footer v-if="viewModel.footerEnabled">
                            <component-view :cid="viewModel.footer ? viewModel.footer.cid : undefined" keyInParent="footer" :inSelection="isEditable()"/>
                        </b-card-footer>                

                    </b-card-body>
                </b-collapse>                               
                <b-card-body v-else>
                    <b-card-title v-if="viewModel.title">{{$eval(viewModel.title, '')}}</b-card-title>
                    <b-card-sub-title v-if="viewModel.subTitle" class="mb-2">{{$eval(viewModel.subTitle, '')}}</b-card-sub-title>
                    <b-card-text v-if="viewModel.text">
                      {{ $eval(viewModel.text) }}
                    </b-card-text>     
                    <component-view v-if="edit || viewModel.body && viewModel.body.cid" :cid="viewModel.body ? viewModel.body.cid : undefined" keyInParent="body" :inSelection="isEditable()" />
    
                    <b-card-footer v-if="viewModel.footerEnabled">
                        <component-view :cid="viewModel.footer ? viewModel.footer.cid : undefined" keyInParent="footer" :inSelection="isEditable()" />
                    </b-card-footer>                

                </b-card-body>
                
            </b-card>
        </div>
    `,
    data: function () {
        return {
            visible: true
        };
    },
    mounted: function () {
        this.visible = !this.viewModel?.initiallyCollapsed;
    },
    watch: {
        'visible' : function () {
            this.$eventHub.$emit('screen-resized');
        }
    },
    methods: {
        propNames() {
            return [
                "cid",
                "dataSource",
                "field",
                "fillHeight",
                "title",
                "subTitle",
                "imgSrc",
                "imgPosition",
                "imgWidth",
                "text",
                "headerEnabled",
                "footerEnabled",
                "collapsable",
                "visibleIcon",
                "hiddenIcon",
                "initiallyCollapsed",
                "bgVariant",
                "borderVariant",
                "textVariant",
                "bodyBgVariant",
                "bodyBorderVariant",
                "bodyTextVariant",
                "bodyClass",
                "headerBgVariant",
                "headerBorderVariant",
                "headerTextVariant",
                "headerClass",
                "footerBgVariant",
                "footerBorderVariant",
                "footerTextVariant",
                "footerClass",
                "eventHandlers"
            ];
        },
        customPropDescriptors() {
            return {
                fillHeight: {
                    type: 'checkbox',
                    description: "Stretch vertically to fill the parent component height",
                    literalOnly: true
                },
                collapsable: {
                    type: 'checkbox',
                    literalOnly: true
                },
                initiallyCollapsed: {
                    type: 'checkbox',
                    literalOnly: true,
                    hidden: viewModel => !viewModel.collapsable
                },
                visibleIcon: {
                    type: 'icon',
                    editable: true,
                    hidden: viewModel => !viewModel.collapsable
                },
                hiddenIcon: {
                    type: 'icon',
                    editable: true,
                    hidden: viewModel => !viewModel.collapsable
                },
                imgPosition: {
                    type: 'select',
                    editable: true,
                    label: 'Image position',
                    options: [
                        'top', 'bottom', 'left', 'right', 'start', 'end'
                    ]
                },
                imgSrc: {
                    editable: true,
                    type: 'text',
                    label: "Image URL"
                },
                imgWidth: {
                    editable: true,
                    label: "Image width"
                },
                text: {
                    type: 'textarea',
                    editable: true
                },
                headerEnabled: {
                    type: 'checkbox',
                    label: 'Header',
                    literalOnly: true
                },
                footerEnabled: {
                    type: 'checkbox',
                    label: 'Footer',
                    literalOnly: true
                },
                headerClass: {
                    type: 'text',
                    category: 'style',
                    hidden: viewModel => !viewModel.headerEnabled
                },
                headerBgVariant: {
                    type: 'select',
                    category: 'style',
                    options: variants,
                    hidden: viewModel => !viewModel.headerEnabled
                },
                headerBorderVariant: {
                    type: 'select',
                    category: 'style',
                    options: variants,
                    hidden: viewModel => !viewModel.headerEnabled
                },
                headerTextVariant: {
                    type: 'select',
                    category: 'style',
                    options: variants,
                    hidden: viewModel => !viewModel.headerEnabled
                },
                footerClass: {
                    type: 'text',
                    category: 'style',
                    hidden: viewModel => !viewModel.footerEnabled
                },
                footerBgVariant: {
                    type: 'select',
                    category: 'style',
                    options: variants,
                    hidden: viewModel => !viewModel.footerEnabled
                },
                footerBorderVariant: {
                    type: 'select',
                    category: 'style',
                    options: variants,
                    hidden: viewModel => !viewModel.footerEnabled
                },
                footerTextVariant: {
                    type: 'select',
                    category: 'style',
                    options: variants,
                    hidden: viewModel => !viewModel.footerEnabled
                },
                textVariant: {
                    type: 'select',
                    category: 'style',
                    options: variants
                },
                bgVariant: {
                    type: 'select',
                    category: 'style',
                    options: variants
                },
                borderVariant: {
                    type: 'select',
                    category: 'style',
                    options: variants
                },
                bodyClass: {
                    type: 'text',
                    category: 'style'
                },
                bodyBgVariant: {
                    type: 'select',
                    category: 'style',
                    options: variants
                },
                bodyBorderVariant: {
                    type: 'select',
                    category: 'style',
                    options: variants
                },
                bodyTextVariant: {
                    type: 'select',
                    category: 'style',
                    options: variants
                }
            }
        }

    }
});


