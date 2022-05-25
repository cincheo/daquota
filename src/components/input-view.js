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

Vue.component('input-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.layoutClass" 
            :draggable="$eval(viewModel.draggable, false) ? true : false"
            v-on="boundEventHandlers()"
        >
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-badge v-if="isEditable() && viewModel.field" variant="info">{{ viewModel.field }}</b-badge>                
            <b-form-group :label="$eval(viewModel.label, null)" :label-for="'input_' + viewModel.cid" 
                :label-cols="labelCols()"
                :label-class="$eval(viewModel.labelClass, null)"
                :label-size="$eval(viewModel.size, null)"
                :description="$eval(viewModel.description, null)" 
                :state="$eval(viewModel.state ? viewModel.state : undefined, null)"
                :invalid-feedback="$eval(viewModel.invalidFeedback, null)"
                :valid-feedback="$eval(viewModel.validFeedback, null)"
                :style="$eval(viewModel.style, null)"
                :class="$eval(viewModel.class, null)"
            >
                <b-form-input v-model="formattedValue" 
                    :type="$eval(viewModel.inputType, null) === 'formatted-number' ? 'text' : $eval(viewModel.inputType, null)" 
                    :number="$eval(viewModel.inputType, null) === 'number' ? true : false"
                    :min="$eval(viewModel.min, null)"
                    :max="$eval(viewModel.max, null)"
                    :step="$eval(viewModel.step, null)"
                    :size="$eval(viewModel.size, null)"
                    :state="$eval(viewModel.state ? viewModel.state : undefined, null)"
                    :placeholder="$eval(viewModel.placeholder, null)"
                    :disabled="$eval(viewModel.disabled, false)" 
                    :required="$eval(viewModel.required, false)"
                    @blur="onBlur" @change="onChange" @input="onInput" @update="onUpdate"
                    @focus="onFocus"
                ></b-form-input>
            </b-form-group>
        </div>
    `,
    data: function () {
        return {
            inputActive: false
        }
    },
    computed: {
        formattedValue: {
            get: function () {
                if (!this.inputActive && this.viewModel.inputType === 'formatted-number' && this.viewModel.numberStyle) {
                    const options = {
                        style: this.$eval(this.viewModel.numberStyle, null),
                        //style: this.$eval(this.viewModel.unitDisplay, null),
                    };
                    switch (options.style) {
                        case 'decimal':
                            if (this.$eval(this.viewModel.notation, null)) {
                                options.notation = this.$eval(this.viewModel.notation, null);
                            }
                            break;
                        case 'currency':
                            if (this.$eval(this.viewModel.currency, null)) {
                                options.currency = this.$eval(this.viewModel.currency, null);
                            } else {
                                options.currency = 'USD';
                            }
                            if (this.$eval(this.viewModel.currencyDisplay, null)) {
                                options.currencyDisplay = this.$eval(this.viewModel.currencyDisplay, null);
                            }
                            break;
                        case 'unit':
                            if (this.$eval(this.viewModel.unit, null)) {
                                options.unit = this.$eval(this.viewModel.unit, null);
                            }
                            if (this.$eval(this.viewModel.unitDisplay, null)) {
                                options.unitDisplay = this.$eval(this.viewModel.unitDisplay, null);
                            }
                            break;
                        case 'percent':
                            break;
                    }
                    options.minimumSignificantDigits = this.$eval(this.viewModel.minimumSignificantDigits, null);
                    options.maximumSignificantDigits = this.$eval(this.viewModel.maximumSignificantDigits, null);
                    options.minimumFractionDigits = this.$eval(this.viewModel.minimumFractionDigits, null);
                    options.maximumFractionDigits = this.$eval(this.viewModel.maximumFractionDigits, null);
                    options.minimumIntegerDigits = this.$eval(this.viewModel.minimumIntegerDigits, null);
                    options.accounting = this.$eval(this.viewModel.accounting, null);
                    options.signDisplay = this.$eval(this.viewModel.signDisplay, null);
                    options.useGrouping = this.$eval(this.viewModel.useGrouping, null);
                    options.roundingMode = this.$eval(this.viewModel.roundingMode, null);

                    return Number(this.value).toLocaleString(this.$eval(this.viewModel.locale, null), options);
                } else {
                    return this.value;
                }
            },
            set: function (modifiedValue) {
                this.value = modifiedValue;
            }
        }
    },
    mounted() {
        if (this.edit && Object.keys(ide.locales).length < 10) {
            $tools.loadScript("assets/lib/i18n.js", () => {
                console.info("i18n loaded");
            });
        }
    },
    methods: {
        labelCols() {
            let cols = undefined;
            if (this.$eval(this.viewModel.horizontalLayout, false)) {
                cols = 'auto';
                if (this.viewModel.labelCols) {
                    cols = this.$eval(this.viewModel.labelCols, 'auto');
                    if (cols == 0) {
                        cols = 'auto';
                    }
                }
            }
            return cols;
        },
        customEventNames() {
            return ["@blur", "@change", "@input", "@update"];
        },
        onBlur(value) {
            this.inputActive = false;
            this.$emit("@blur", value);
        },
        onFocus(value) {
            this.inputActive = true;
            this.$emit("@focus", value);
        },
        onChange(value) {
            this.$emit("@change", value);
        },
        onInput(value) {
            this.$emit("@input", value);
        },
        onUpdate(value) {
            this.$emit("@update", value);
        },
        clear() {
            if (this.viewModel.field && this.dataModel) {
                this.dataModel[this.viewModel.field] = undefined;
            } else {
                this.dataModel = undefined;
            }
        },
        propNames() {
            return [
                "cid",
                "horizontalLayout",
                "labelCols",
                "labelClass",
                "dataSource",
                "field",
                "inputType",
                "label",
                "description",
                "size",
                "disabled",
                "min",
                "max",
                "step",
                "placeholder",
                "required",
                "state",
                "numberStyle",
                "locale",
                "currency",
                "currencyDisplay",
                "unit",
                "unitDisplay",
                "minimumFractionDigits",
                "maximumFractionDigits",
                "minimumIntegerDigits",
                "minimumSignificantDigits",
                "maximumSignificantDigits",
                "roundingMode",
                "accounting",
                "notation",
                "signDisplay",
                "useGrouping",
                "invalidFeedback",
                "validFeedback",
                "eventHandlers"
            ];
        },
        customPropDescriptors() {
            return {
                inputType: {
                    type: 'select',
                    label: 'Type',
                    editable: true,
                    literalOnly: true,
                    options: [
                        "text", "password", "email", "number", "formatted-number", "url", "tel", "search", "date", "datetime-local", "month", "week", "time", "range", "color"
                    ]
                },
                disabled: {
                    type: 'checkbox',
                    editable: true
                },
                required: {
                    type: 'checkbox',
                    editable: true
                },
                placeholder: {
                    type: 'text',
                    hidden: viewModel => (['range', 'date', 'datetime-local', 'color'].indexOf(viewModel.inputType) !== -1)
                },
                min: {
                    type: 'number',
                    hidden: viewModel => (['range', 'number'].indexOf(viewModel.inputType) === -1)
                },
                max: {
                    type: 'number',
                    hidden: viewModel => (['range', 'number'].indexOf(viewModel.inputType) === -1)
                },
                step: {
                    type: 'number',
                    hidden: viewModel => (['range', 'number'].indexOf(viewModel.inputType) === -1)
                },
                horizontalLayout: {
                    type: 'checkbox',
                    label: 'Horizontal layout',
                    editable: true,
                    category: 'style'
                },
                labelCols: {
                    label: 'Label width',
                    type: 'range',
                    min: 0,
                    max: 11,
                    step: 1,
                    category: 'style',
                    hidden: viewModel => !viewModel.horizontalLayout,
                    description: 'Number of columns for the label when horizontal layout'
                },
                labelClass: {
                    label: 'Label class',
                    type: 'text',
                    category: 'style',
                    description: 'Class(es) (space-separated) applying to the label'
                },
                size: {
                    type: 'select',
                    editable: true,
                    options: ['md', 'sm', 'lg']
                },
                state: {
                    type: 'text',
                    actualType: 'boolean',
                    editable: true,
                    label: "Validation state"
                },
                numberStyle: {
                    type: 'select',
                    category: 'formatting',
                    literalOnly: true,
                    defaultValue: 'decimal',
                    hidden: viewModel => viewModel.inputType !== 'formatted-number',
                    options: [
                        {value: "decimal", text: '"decimal" for plain number formatting'},
                        {value: "currency", text: '"currency" for currency formatting'},
                        {value: "percent", text: '"percent" for percent formatting'},
                        {value: "unit", text: '"unit" for unit formatting'}
                    ]
                },
                locale: {
                    type: 'select',
                    category: 'formatting',
                    hidden: viewModel => viewModel.inputType !== 'formatted-number',
                    //defaultValue: window.language || window.languages[0],
                    options:
                        $tools.arrayConcat(
                            [{text: '', value: undefined}],
                            Object.keys(ide.locales).map(key => ({
                                text: key.replaceAll('_', '-') + ' (' + ide.locales[key] + ')',
                                value: key.replaceAll('_', '-')
                            }))
                        )
                },
                currency: {
                    type: 'select',
                    category: 'formatting',
                    hidden: viewModel => viewModel.inputType !== 'formatted-number' || viewModel.numberStyle !== 'currency',
                    options:
                        $tools.arrayConcat(
                            [''],
                            Intl.supportedValuesOf('currency').map(currency => ({
                                text: currency + ' (' + ide.currencies.find(c => c.cc === currency)?.name + ')',
                                value: currency
                            }))
                        )

                },
                currencyDisplay: {
                    type: 'select',
                    category: 'formatting',
                    hidden: viewModel => viewModel.inputType !== 'formatted-number' || viewModel.numberStyle !== 'currency',
                    options: [
                        {
                            value: "symbol",
                            text: '"symbol" to use a localized currency symbol such as €, this is the default value'
                        },
                        {
                            value: "narrowSymbol",
                            text: '"narrowSymbol" to use a narrow format symbol ("$100" rather than "US$100")'
                        },
                        {value: "code", text: '"code" to use the ISO currency code'},
                        {value: "name", text: '"name" to use a localized currency name such as "dollar"'}
                    ]
                },
                accounting: {
                    type: 'checkbox',
                    category: 'formatting',
                    hidden: viewModel => viewModel.inputType !== 'formatted-number',
                    description: 'In many locales, accounting format means to wrap the number with parentheses instead of appending a minus sign. Check this to enable this formatting.'
                },
                notation: {
                    type: 'select',
                    category: 'formatting',
                    hidden: viewModel => viewModel.inputType !== 'formatted-number' || viewModel.numberStyle !== 'decimal',
                    options: [
                        {value: "standard", text: '"standard" - plain number formatting'},
                        {value: "scientific", text: '"scientific" - order-of-magnitude for formatted number'},
                        {value: "engineering", text: '"engineering" - exponent of ten when divisible by three'},
                        {
                            value: "compact",
                            text: '"compact" - string representing exponent; defaults to using the "short" form'
                        }
                    ]
                },
                signDisplay: {
                    type: 'select',
                    category: 'formatting',
                    hidden: viewModel => viewModel.inputType !== 'formatted-number',
                    options: [
                        {value: "always", text: '"always" always display sign'},
                        {value: "auto", text: '"auto" sign display for negative numbers only'},
                        {
                            value: "exceptZero",
                            text: '"exceptZero" sign display for positive and negative numbers, but not zero'
                        },
                        {
                            value: "negative",
                            text: '"negative" sign display for negative numbers only, excluding negative zero.'
                        },
                        {value: "never", text: '"never" never display sign'}
                    ]
                },
                unit: {
                    type: 'select',
                    category: 'formatting',
                    hidden: viewModel => viewModel.inputType !== 'formatted-number' || viewModel.numberStyle !== 'unit',
                    options: Intl.supportedValuesOf('unit')
                },
                unitDisplay: {
                    type: 'select',
                    category: 'formatting',
                    hidden: viewModel => viewModel.inputType !== 'formatted-number' || viewModel.numberStyle !== 'unit',
                    options: [
                        {value: "long", text: '"long" (e.g., 16 litres)'},
                        {value: "short", text: '"short" (e.g., 16 l)'},
                        {value: "narrow", text: '"narrow" (e.g., 16l)'}
                    ]
                },
                useGrouping: {
                    type: 'select',
                    category: 'formatting',
                    hidden: viewModel => viewModel.inputType !== 'formatted-number',
                    options: [
                        {
                            value: "always",
                            text: '"always": display grouping separators even if the locale prefers otherwise'
                        },
                        {
                            value: "auto",
                            text: '"auto": display grouping separators based on the locale preference, which may also be dependent on the currency'
                        },
                        {value: "false", text: '"false": do not display grouping separators'},
                        {
                            value: "min2",
                            text: '"min2": display grouping separators when there are at least 2 digits in a group'
                        }
                    ]
                },
                roundingMode: {
                    type: 'select',
                    category: 'formatting',
                    hidden: viewModel => viewModel.inputType !== 'formatted-number',
                    options: [
                        {value: "ceil", text: '"ceil": toward +∞'},
                        {value: "floor", text: '"floor": toward -∞'},
                        {value: "expand", text: '"expand": away from 0'},
                        {value: "trunc", text: '"trunc": toward 0'},
                        {value: "halfCeil", text: '"halfCeil": ties toward +∞'},
                        {value: "halfFloor", text: '"halfFloor": ties toward -∞'},
                        {value: "halfExpand", text: '"halfExpand": ties away from 0'},
                        {value: "halfTrunc", text: '"halfTrunc": ties toward 0'},
                        {value: "halfEven", text: '"halfEven": ties toward the value with even cardinality'}
                    ]
                },
                minimumIntegerDigits: {
                    type: 'number',
                    category: 'formatting',
                    description: 'The minimum number of integer digits to use. Possible values are from 1 to 21; the default is 1.',
                    min: 1,
                    max: 21,
                    hidden: viewModel => viewModel.inputType !== 'formatted-number'
                },
                minimumFractionDigits: {
                    type: 'number',
                    category: 'formatting',
                    description: 'The minimum number of fraction digits to use. Possible values are from 0 to 20; the default for plain number and percent formatting is 0; the default for currency formatting is the number of minor unit digits provided by the ISO 4217 currency code list (2 if the list doesn\'t provide that information).',
                    min: 0,
                    max: 20,
                    hidden: viewModel => viewModel.inputType !== 'formatted-number'
                },
                maximumFractionDigits: {
                    type: 'number',
                    category: 'formatting',
                    description: 'The maximum number of fraction digits to use. Possible values are from 0 to 20; the default for plain number formatting is the larger of minimumFractionDigits and 3; the default for currency formatting is the larger of minimumFractionDigits and the number of minor unit digits provided by the ISO 4217 currency code list (2 if the list doesn\'t provide that information); the default for percent formatting is the larger of minimumFractionDigits and 0.',
                    min: 0,
                    max: 20,
                    hidden: viewModel => viewModel.inputType !== 'formatted-number'
                },
                minimumSignificantDigits: {
                    type: 'number',
                    category: 'formatting',
                    description: 'The minimum number of significant digits to use. Possible values are from 1 to 21; the default is 1.',
                    min: 1,
                    max: 21,
                    hidden: viewModel => viewModel.inputType !== 'formatted-number'
                },
                maximumSignificantDigits: {
                    type: 'number',
                    category: 'formatting',
                    description: 'The maximum number of significant digits to use. Possible values are from 1 to 21; the default is 21.',
                    min: 1,
                    max: 21,
                    hidden: viewModel => viewModel.inputType !== 'formatted-number'
                }
            }
        }

    }
});


