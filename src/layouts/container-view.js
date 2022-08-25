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

Vue.component('container-view', {
    extends: editableComponent,
    mixins: [formGroupMixin],
    template: `
         <div :id="cid" class="w-100 h-100"
                :draggable="$eval(viewModel.draggable, false) ? true : false" 
                v-on="boundEventHandlers({'click': onClick})"
         >
            <b-form v-if="viewModel.form"
                :class="containerClass()"             
                @submit="onSubmit" @reset="onReset" :novalidate="!viewModel.nativeValidation"
            >
                <div 
                    :style="containerStyle()"
                    class="h-100 w-100"
                >
                    <component-view v-for="(component, index) in viewModel.components" :key="component.cid" :cid="component.cid" keyInParent="components" :indexInKey="index" :iteratorIndex="iteratorIndex" :inSelection="isEditable()" />
                    <!-- empty container to allow adding of components in edit mode -->
                    <component-view v-if="edit" cid="undefined" keyInParent="components" :indexInKey="viewModel.components ? viewModel.components.length : 0"  :iteratorIndex="iteratorIndex" :inSelection="isEditable()" />
                </div>
            </b-form>
            <div v-else
                :style="containerStyle()"
                :class="containerClass()"             
            >
                <component-view v-for="(component, index) in viewModel.components" :key="component.cid" :cid="component.cid" keyInParent="components" :indexInKey="index" :iteratorIndex="iteratorIndex" :inSelection="isEditable()" />
                <!-- empty container to allow adding of components in edit mode -->
                <component-view v-if="edit" cid="undefined" keyInParent="components" :indexInKey="viewModel.components ? viewModel.components.length : 0" :iteratorIndex="iteratorIndex" :inSelection="isEditable()" />
            </div>
            
        </div>
    `,
    watch: {
        'viewModel.form': {
            handler: function() {
                this.$nextTick(() => {
                    if (this.viewModel.form) {
                        this.hideState();
                    }
                });
            }
        },
        'viewModel.showStateOnInput': {
            handler: function() {
                this.$nextTick(() => {
                    if (this.viewModel.form || this.viewModel.showStateOnInput) {
                        this.hideState();
                        components.getChildren(this.viewModel)
                            .filter(v => v.type !== 'ContainerView')
                            .map(v => $c(v.cid))
                            .filter(c => c && c.showStateOnInputData !== undefined)
                            .forEach(c => c.showStateOnInputData = this.viewModel.showStateOnInput);
                    }

                });
            }
        }
    },
    methods: {
        onSubmit(event) {
            console.info("on submit...");
            event.preventDefault();
            this.showState();
            if (this.isValid()) {
                console.info("form is valid! submitting...");
                this.$emit('@submit', event);
            }
        },
        onReset(event) {
            event.preventDefault();
            this.hideState();
            this.$emit('@reset', event);
        },
        showState() {
            components.getChildren(this.viewModel)
                .filter(v => v.type !== 'ContainerView')
                .map(v => $c(v.cid))
                .filter(c => c && c.showState)
                .forEach(c => c.showState());
        },
        hideState() {
            components.getChildren(this.viewModel)
                .filter(v => v.type !== 'ContainerView')
                .map(v => $c(v.cid))
                .filter(c => c && c.hideState)
                .forEach(c => c.hideState());
        },
        isValid() {
            return components.getChildren(this.viewModel)
                .filter(v => v.type !== 'ContainerView')
                .map(v => $c(v.cid))
                .filter(c => c && c.isValid)
                .every(c => c.isValid() === undefined || c.isValid());
        },
        containerStyle() {
            let style = 'display: flex; overflow: ' + (this.$eval(this.viewModel.scrollable, false) ? 'auto' : 'visible') + '; flex-direction: ' + (this.$eval(this.viewModel.direction, false) ? this.$eval(this.viewModel.direction) : 'column');
            if (this.viewModel.wrap) {
                style += '; flex-wrap: ' + this.$eval(this.viewModel.wrap, '');
            }
            if (this.viewModel.justify) {
                style += '; justify-content: ' + this.toFlexStyle(this.$eval(this.viewModel.justify, ''));
            }
            if (this.viewModel.alignItems) {
                style += '; align-items: ' + this.toFlexStyle(this.$eval(this.viewModel.alignItems, ''));
            }
            if (this.viewModel.alignContent) {
                style += '; align-content: ' + this.toFlexStyle(this.$eval(this.viewModel.alignContent, ''));
            }
            if (this.viewModel.rowGap) {
                style += '; row-gap: ' + this.$eval(this.viewModel.rowGap, '');
            }
            if (this.viewModel.columnGap) {
                style += '; column-gap: ' + this.$eval(this.viewModel.columnGap, '');
            }
            if (this.viewModel.style) {
                style += '; ' + this.$eval(this.viewModel.style, '');
            }
            return style;
        },
        containerClass() {
            let containerClass = this.componentClass();
            if (!this.viewModel.disableContainerPadding) {
                containerClass += this.viewModel.fixedWidth ? ' container' : ' container-fluid';
            }
            return containerClass;
        },
        toFlexStyle(style) {
            switch (style) {
                case 'end':
                    return 'flex-end';
                case 'start':
                    return 'flex-start';
                default:
                    return style;
            }
        },
        customEventNames(viewModel) {
            return viewModel.form ? ['@submit', '@reset'] : [];
        },
        customStatelessActionNames() {
            if (this.viewModel.form) {
                return [{value:'isValid',text:'isValid()'}];
            } else {
                return [];
            }
        },
        customActionNames(viewModel) {
            if (viewModel.form) {
                return [
                    {value:'showState',text:'showState()'},
                    {value:'hideState',text:'hideState()'}
                ];
            } else {
                return [];
            }
        },
        propNames() {
            return [
                "cid",
                "dataSource",
                "field",
                "form",
                "showStateOnInput",
                "nativeValidation",
                "fillHeight",
                "disableContainerPadding",
                "fluid",
                "direction",
                "wrap",
                "rowGap",
                "columnGap",
                "justify",
                "alignItems",
                "alignContent",
                "scrollable",
                "eventHandlers"
            ];
        },
        customPropDescriptors() {
            return {
                components: {
                    type: 'ref'
                },
                form: {
                    type: 'checkbox',
                    editable: true,
                    literalOnly: true,
                    description: "If enabled, this container acts as a form and reacts on @submit and @reset events",
                    category: 'data'
                },
                showStateOnInput: {
                    type: 'checkbox',
                    editable: true,
                    literalOnly: true,
                    description: "If enabled, all contained controls show their state as soon as the user inputs a new value",
                    category: 'data'
                },
                nativeValidation: {
                    type: 'checkbox',
                    editable: true,
                    hidden: viewModel => !viewModel.form,
                    literalOnly: true,
                    description: "When set, enables browser native HTML5 validation on controls in the form",
                    category: 'data'
                },
                fillHeight: {
                    type: 'checkbox',
                    description: "Stretch vertically to fill the parent component height",
                    literalOnly: true
                },
                disableContainerPadding: {
                    type: 'checkbox',
                    label: 'No padding',
                    literalOnly: true,
                    description: "Disable container padding",
                },
                fixedWidth: {
                    type: 'checkbox',
                    hidden: viewModel => viewModel.disableContainerPadding,
                    literalOnly: true,
                    description: "Enable fixed-width padding (full-width is the default - aka fluid)",
                },
                scrollable: {
                    type: 'checkbox',
                    editable: true
                },
                direction: {
                    type: 'select',
                    options: ['column', 'column-reverse', 'row', 'row-reverse'],
                    docLink: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/#flex-direction'
                },
                wrap: {
                    type: 'select',
                    options: ['nowrap', 'wrap', 'wrap-reverse'],
                    docLink: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/#flex-wrap'
                },
                justify: {
                    type: 'select',
                    options: ['start', 'end', 'center', 'space-between', 'space-around', 'space-evenly'],
                    docLink: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/#justify-content'
                },
                alignItems: {
                    type: 'select',
                    options: ['stretch', 'start', 'end', 'center', 'baseline'],
                    docLink: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/#align-items'
                },
                alignContent: {
                    type: 'select',
                    options: ['normal', 'stretch', 'start', 'end', 'center', 'space-between', 'space-around'],
                    docLink: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/#align-content'
                },
                index: 0
            };
        }
    }
});
