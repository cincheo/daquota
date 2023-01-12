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

Vue.component('container-view', {
    extends: editableComponent,
    mixins: [formGroupMixin],
    template: `
         <div :id="cid" class="w-100 h-100"
                :draggable="$eval(viewModel.draggable, false) ? true : false" 
                v-on="boundEventHandlers({'click': onClick})"
                :style="edit && cid === 'shared' ? 'background-color: #80808040;' : ''"
         >
            <b-form v-if="viewModel.form"
                @submit="onSubmit" @reset="onReset" :novalidate="!viewModel.nativeValidation"
            >
                <div
                    :style="containerStyle()"
                    :class="containerClass()"             
                >
                    <component-view v-for="(component, index) in viewModel.components" :key="component.cid" :cid="component.cid" keyInParent="components" :indexInKey="index" :inSelection="isEditable()" />
                    <!-- empty container to allow adding of components in edit mode -->
                    <component-view v-if="edit" cid="undefined" keyInParent="components" :indexInKey="viewModel.components ? viewModel.components.length : 0" :inSelection="isEditable()" />
                </div>
            </b-form>
            <div v-else
                :style="containerStyle()"
                :class="containerClass()"             
            >
                <component-view v-for="(component, index) in viewModel.components" :key="component.cid" :cid="component.cid" keyInParent="components" :indexInKey="index" :inSelection="isEditable()" />
                <!-- empty container to allow adding of components in edit mode -->
                <component-view v-if="edit" cid="undefined" keyInParent="components" :indexInKey="viewModel.components ? viewModel.components.length : 0" :inSelection="isEditable()" />
            </div>
            
        </div>
    `,
    watch: {
        'viewModel.form': {
            handler: function() {
                this.$nextTick(() => {
                    if (this.viewModel.form) {
                        this.hideState();
                    } else {
                        this.showState();
                    }
                });
                this.check();
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
        check() {
            this.$emit('error');
            if (this.viewModel.form && components.getChildren(this.viewModel)
                .filter(v => v.type === 'ButtonView' && v.buttonType === 'submit').length === 0)
            {
                this.$emit('error', 'This form does not contain any submit button');
            }
        },
        displayedIconType() {
            if (this.viewModel.form) {
                return 'InstanceFormBuilder';
            }  else {
                return this.viewModel.type;
            }
        },
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
            if (this.viewModel.backgroundImage) {
                style += '; background-image: ' + this.$eval(this.viewModel.backgroundImage);
                style += '; background-size: ' + this.$evalWithDefault(this.viewModel.backgroundSize, 'cover');
                style += '; background-position: ' + this.$evalWithDefault(this.viewModel.backgroundPosition, 'center');
            }
            if (this.viewModel.style) {
                style += '; ' + this.$eval(this.viewModel.style, '');
            }
            return style;
        },
        containerClass() {
            let containerClass = this.componentClass();
            if (this.viewModel.fillHeight) {
                containerClass += ' overflow-auto';
            }
            let containerLayoutClass = '';
            switch(this.viewModel.layoutKind) {
                case 'fluid':
                    containerLayoutClass = ' container-fluid';
                    break;
                case 'fixed-width':
                    containerLayoutClass = ' container';
                    break;
                case 'container':
                case 'container-fluid':
                case 'container-sm':
                case 'container-md':
                case 'container-lg':
                case 'container-xl':
                    containerLayoutClass = ' ' + this.viewModel.layoutKind;
                    break;
            }
            containerClass += containerLayoutClass;
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
        customStatelessActionNames(viewModel) {
            if (viewModel.form) {
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
                "dataType",
                "field",
                "form",
                "showStateOnInput",
                "nativeValidation",
                "fillHeight",
                "layoutKind",
                "direction",
                "wrap",
                "rowGap",
                "columnGap",
                "justify",
                "alignItems",
                "alignContent",
                "scrollable",
                "backgroundImage",
                "backgroundSize",
                "backgroundPosition",
                "eventHandlers"
            ];
        },
        customPropDescriptors() {
            return {
                components: {
                    type: 'ref'
                },
                backgroundSize: {
                    type: 'select',
                    hidden: viewModel => !viewModel.backgroundImage,
                    options: ['auto', 'cover', 'contain', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'],
                    description: 'A size for the background image (default is cover)'
                },
                backgroundPosition: {
                    type: 'select',
                    hidden: viewModel => !viewModel.backgroundImage,
                    options: ['top', 'bottom', 'left', 'right', 'center', '10%', '25%', '50%', '75%', '90%'],
                    description: 'Sets the initial position of the background image (default is center)'
                },
                backgroundImage: {
                    type: 'text',
                    placeholder: "url('https://...')",
                    description: 'An image to be used for the background of this container. Can be a css gradient, e.g.: linear-gradient(red, blue 10%)'
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
                layoutKind: {
                    label: 'Layout kind',
                    type: 'select',
                    options: ['no-padding', 'container', 'container-sm', 'container-md', 'container-lg', 'container-xl', 'container-fluid'],
                    literalOnly: true,
                    docLink: 'https://getbootstrap.com/docs/4.6/layout/overview/#containers',
                    description: "Default is 'no-padding' - other values correspond to the boostrap classes (see the doc)",
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
                dataType: {
                    type: 'select',
                    options: viewModel => components.allowedDataTypes(viewModel.type),
                    category: 'data',
                    description: 'The data type that can be selected from the options'
                },
                index: 0
            };
        }
    }
});
