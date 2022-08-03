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

Vue.component('button-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :class="viewModel.layoutClass">
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-button 
                ref="button"
                :href="$eval(viewModel.href, null)"
                :to="$eval(viewModel.to, null)"
                :type="viewModel.buttonType" 
                :variant="$eval(viewModel.variant, null)" 
                :pill="$eval(viewModel.pill, false)" 
                :squared="$eval(viewModel.squared, false)" 
                :disabled="$eval(viewModel.disabled, false)" 
                :block="$eval(viewModel.block, null)"
                :size="$eval(viewModel.size, null)"
                :class="$eval(viewModel.class, null)"
                :style="$eval(viewModel.style, null)"
                :draggable="$eval(viewModel.draggable, false) ? true : false" 
                :target="$eval(viewModel.openLinkInNewWindow, null) ? '_blank' : undefined"
                v-on="boundEventHandlers({'click': onClick})"
            >
                <div v-if="$eval(viewModel.icon, null)"
                    :style="{ display: 'flex', flexDirection: iconPositionMapper[$eval(viewModel.iconPosition, 'left')], justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }">
                    <b-icon :icon="$eval(viewModel.icon)"></b-icon>
                    <div v-if="$eval(viewModel.label, null)">{{ $eval(viewModel.label, '#error#') }}</div>
                </div>
                <div v-else>
                    {{ $eval(viewModel.label, '#error#') }}
                </div>
            </b-button>
        </div>
    `,
    data: function() {
        return {
            iconPositionMapper: {
                'left': 'row',
                'right': 'row-reverse',
                'top': 'column',
                'bottom': 'column-reverse'
            }
        }
    },
    methods: {
        customActionNames() {
            return [
                {value: 'focus', text: 'focus()'}
            ];
        },
        focus() {
            this.$refs['button'].focus()
        },
        propNames() {
            return [
                "cid",
                "dataSource",
                "field",
                "label",
                "icon",
                "iconPosition",
                "href",
                "openLinkInNewWindow",
                "to",
                "buttonType",
                "variant",
                "size",
                "pill",
                "squared",
                "block",
                "disabled",
                "eventHandlers"
            ];
        },
        customPropDescriptors() {
            return {
                buttonType: {
                    type: 'select',
                    label: 'Type',
                    literalOnly: true,
                    editable: true,
                    options: [
                        'button', 'submit', 'reset'
                    ]
                },
                variant: {
                    type: 'select',
                    editable: true,
                    options: [
                        "primary", "secondary", "success", "danger", "warning", "info", "light", "dark",
                        "outline-primary", "outline-secondary", "outline-success", "outline-danger", "outline-warning", "outline-info", "outline-light", "outline-dark",
                        "link"
                    ]
                },
                size: {
                    type: 'select',
                    editable: true,
                    options: ['md', 'sm', 'lg']
                },
                icon: {
                    type: 'icon',
                    editable: true
                },
                iconPosition: {
                    type: 'select',
                    editable: true,
                    options: ['left', 'right', 'top', 'bottom']
                },
                openLinkInNewWindow: {
                    type: 'checkbox',
                    editable: (viewModel) => !!viewModel.href
                },
                pill: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style'
                },
                squared: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style'
                },
                block: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style'
                },
                disabled: {
                    type: 'checkbox',
                    editable: true
                }
            }
        }

    }
});


