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

Vue.component('tool-button', {
    template: `
        <div>
            <b-button v-show="!isDisabled()" size="sm" :id="'popover-tool-button-'+label.replaceAll(' ', '-')" variant="link">
                <b-img v-if="iconUrl" :src="iconUrl" :style="'width:1rem;' + (darkMode ? 'filter: invert(1)' : '')"/>
                <span v-else class="ml-1">
                    {{label}}
                </span>
            </b-button>
            <b-popover :target="'popover-tool-button-'+label.replaceAll(' ', '-')" 
                ref="popover"
                triggers="hover" 
                placement="bottom" 
                @shown="onShown" 
                @hidden="onHidden"
            >
                <template #title>
                    <div class="d-flex">
                        <div class="flex-grow-1">{{label}}</div>
                        <b-button size="sm" variant="link" class="m-0 p-0 ml-2" @click="$refs['popover'].$emit('close')"><b-icon-x/></b-button>
                    </div>
                </template>
                <div v-for="(p, propIndex) in getPropNames()">
                    <div v-if="getSubLabel(propIndex)" :class="'text-center text-secondary font-weight-light' + (propIndex > 0 ? ' mt-1 border-top border-secondary' : '')" style="font-size: 0.8rem">
                        {{ getSubLabel(propIndex) }}
                    </div>
                    <div v-if="getEditorType(propIndex) === 'variantColors'" class="d-flex flex-row justify-content-left">
                        <div v-for="(choice, i) in getChoicesWithUndefined(propIndex)" 
                            :key="i"
                            :title="choice.value === null ? 'none' : choice.value" 
                            :style="'cursor: pointer; height: 1.1rem; width: 1.1rem; border-radius: 50%; border: solid ' + borderColor(propIndex, choice, i) + ' 2px !important'" 
                            :class="'bg-'+choice.value" 
                            @mouseover="onMouseover(propIndex, i, choice.value)"
                            @mouseleave="onMouseleave(propIndex)"
                            @click="setPropValue(propIndex, choice.value); saveInitialState(propIndex)"
                        >
                            <b-icon-toggle-on v-if="choice.value === null && isDefinedPropValue(propIndex)" class="align-top"/>
                            <b-icon-toggle-off v-if="choice.value === null && !isDefinedPropValue(propIndex)" class="align-top" style="cursor: default"/>
                        </div>
                    </div>
                    <div v-if="getEditorType(propIndex) === 'checkbox'" class="d-flex flex-row">
                        <div  
                            @mouseover="onMouseover(propIndex, i, choice.value)"
                            @mouseleave="onMouseleave(propIndex)"
                            @click="setPropValue(propIndex, choice.value); saveInitialState(propIndex)" 
                        >
                            <b-icon-toggle-on v-if="choice.value === null && isDefinedPropValue(propIndex)" class="p-0 m-0"/>
                            <b-icon-toggle-off v-if="choice.value === null && !isDefinedPropValue(propIndex)" class="p-0 m-0"/>
                        </div>
                    
                        <b-checkbox switch @input="setPropValue(propIndex, $event)"></b-checkbox>
                    </div>
                    <div v-if="getEditorType(propIndex) === undefined" class="d-flex flex-row justify-content-left">
                        <div v-for="(choice, i) in getChoicesWithUndefined(propIndex)" 
                            :key="i" 
                            :title="choice.iconUrl || choice.icon ? choice.value : undefined" 
                            :style="'cursor: pointer; border-radius: 25%; border: solid ' + borderColor(propIndex, choice, i) + ' 2px'" 
                            @mouseover="onMouseover(propIndex, i, choice.value)"
                            @mouseleave="onMouseleave(propIndex)"
                            @click="setPropValue(propIndex, choice.value); saveInitialState(propIndex)" 
                        >
                            <b-icon-toggle-on v-if="choice.value === null && isDefinedPropValue(propIndex)" class="p-0 m-0"/>
                            <b-icon-toggle-off v-if="choice.value === null && !isDefinedPropValue(propIndex)" class="p-0 m-0" style="cursor: default"/>
                            <div v-if="choice.value !== null" :style="'margin-left: 0.2rem;margin-right: 0.2rem;' + (choice.style ? choice.style : '')" :class="choice.class">
                                <b-icon v-if="choice.icon" :icon="choice.icon" style="width:1rem;"/>
                                <b-img v-if="choice.iconUrl" :src="choice.iconUrl" :style="'width:1rem;' + (darkMode ? 'filter: invert(1)' : '')"/>
                                <span v-if="!(choice.icon || choice.iconUrl)" style="white-space: nowrap;">
                                    {{ choice.label !== undefined ? choice.label : (choice.value === '' ? 'default' : choice.value) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </b-popover>
        </div>
    `,
    props: ['darkMode', 'initialState', 'iconUrl', 'label', 'subLabels', 'classProp', 'propNames', 'choices', 'editorTypes', 'incompatibleComponentTypes'],
    editorTypes: undefined,
    classProp: undefined,
    incompatibleComponentTypes: undefined,
    data: function () {
        return {
            hoverPropIndex: undefined,
            hoverValueIndex: undefined
        }
    },
    computed: {
        viewModel: function() {
            return this.initialState?.viewModel;
        }
    },
    methods: {
        onShown() {
            if (!this.viewModel) {
                return;
            }
            for (let propIndex = 0; propIndex < this.getPropNames().length; propIndex++) {
                this.saveInitialState(propIndex);
            }
        },
        onHidden() {
            this.hoverPropIndex = undefined;
            this.hoverValueIndex = undefined;
            for (let propIndex = 0; propIndex < this.getPropNames().length; propIndex++) {
                this.resetPropValue(propIndex);
            }
        },
        borderColor(propIndex, choice, hoverValueIndex) {
            if (choice.value == null) {
                return 'transparent';
            }
            const hovered = propIndex === this.hoverPropIndex && hoverValueIndex === this.hoverValueIndex;
            return this.hasPropValue(propIndex, choice.value) ? 'orange' : (hovered ? (this.darkMode ? 'white' : 'black') : 'transparent');
        },
        getPropChoicesFullValues(propIndex) {
            const propName = this.getPropNames()[propIndex];
            return this.getChoices(propIndex).map(choice =>
                this.classProp ? propName + (choice.value === '' ? '' : '-' + choice.value) : choice.value
            );
        },
        hasPropValue(propIndex, value) {
            const propName = this.getPropNames()[propIndex];
            if (this.classProp) {
                let classes = this.initialState[this.classProp] ? this.initialState[this.classProp].split(' ') : [];
                return classes.includes(propName + (value === '' ? '' : '-' + value));
            } else {
                const values = this.initialState[propName] ? this.initialState[propName] : {};
                const result = Object.entries(values).length > 0 && Object.entries(values).every(e =>
                    this.initialState[propName][e[0]] === value
                );
                return result;
            }
        },
        isDefinedPropValue(propIndex) {
            const propName = this.getPropNames()[propIndex];
            if (this.classProp) {
                const classArray = this.initialState[this.classProp] != null ? this.initialState[this.classProp].split(' ') : [];
                const possibleClassValues = this.getPropChoicesFullValues(propIndex);
                return classArray.filter(c => possibleClassValues.includes(c)).length > 0;
            } else {
                const values = this.initialState[propName] ? this.initialState[propName] : {};
                return Object.entries(values).length > 0 && Object.entries(values).every(e =>
                    this.initialState[propName][e[0]] != null
                );
            }
        },
        isTruePropValue(propIndex) {
            const propName = this.getPropNames()[propIndex];
            const values = this.initialState[propName] ? this.initialState[propName] : {};
            return Object.entries(values).length > 0 && Object.entries(values).every(e =>
                this.initialState[propName][e[0]] === true
            );
        },
        onMouseover(propIndex, hoverValueIndex, value) {
            this.hoverPropIndex = propIndex;
            this.hoverValueIndex = hoverValueIndex;
            ide.commandManager.disableHistory = true;
            try {
                this.setPropValue(propIndex, value);
            } finally {
                ide.commandManager.disableHistory = false;
            }
        },
        onMouseleave(propIndex) {
            this.hoverPropIndex = undefined;
            this.hoverValueIndex = undefined;
            ide.commandManager.disableHistory = true;
            try {
                this.resetPropValue(propIndex);
            } finally {
                ide.commandManager.disableHistory = false;
            }
        },
        getPropNames() {
            return Array.isArray(this.propNames) ? this.propNames : [this.propNames];
        },
        getChoicesWithUndefined(propIndex) {
            const choices = (Array.isArray(this.propNames) ? this.choices[propIndex] : this.choices).slice(0);
            if (!(choices.length === 2 && choices[0].value === false && choices[1].value === true)) {
                choices.unshift({ value: null });
            }
            return choices;
        },
        getChoices(propIndex) {
            return (Array.isArray(this.propNames) ? this.choices[propIndex] : this.choices);
        },
        getEditorType(propIndex) {
            return Array.isArray(this.editorTypes) ? this.editorTypes[propIndex] : this.editorTypes;
        },
        getSubLabel(propIndex) {
            return Array.isArray(this.subLabels) ? this.subLabels[propIndex] : this.subLabels;
        },
        isFormula(value) {
            return value && (typeof value === 'string') && value.startsWith('=');
        },
        saveInitialState(propIndex) {
            const propName = this.getPropNames()[propIndex];
            if (this.classProp) {
                if (this.isFormula(this.viewModel[this.classProp])) {
                    return;
                }
                this.$set(this.initialState, this.classProp, this.viewModel[this.classProp] || null);
            } else {
                let models = components.getChildren(this.viewModel, true);
                models.push(this.viewModel);
                this.$set(this.initialState, propName, {});
                models
                    .filter(m => components.propNames(m).find(p => p === propName))
                    .filter(m => !this.isFormula(m[propName]))
                    .forEach(m => this.$set(this.initialState[propName], m.cid, m[propName] || null));
            }
        },
        setPropValue(propIndex, value) {
            const propName = this.getPropNames()[propIndex];
            if (this.classProp) {
                if (this.isFormula(this.viewModel[this.classProp])) {
                    return;
                }
                let classes = this.viewModel[this.classProp] ? this.viewModel[this.classProp].split(' ') : [];
                const values = this.getChoices(propIndex)
                    .filter(choice => choice.value != null)
                    .map(choice => propName + (choice.value === '' ? '' : '-' + choice.value));
                classes = classes.filter(c => !values.includes(c));
                if (value != null) {
                    classes.push(propName + (value === '' ? '' : '-' + value));
                }
                $set(this.viewModel, this.classProp, classes.join(' '));
            } else {
                let models = components.getChildren(this.viewModel, true);
                models.push(this.viewModel);
                models
                    .filter(m => components.propNames(m).find(p => p === propName))
                    .filter(m => !this.isFormula(m[propName]))
                    .forEach(m => $set(m, propName, value || undefined));
            }
        },
        resetPropValue(propIndex) {
            const propName = this.getPropNames()[propIndex];
            if (this.classProp) {
                if (this.isFormula(this.viewModel[this.classProp])) {
                    return;
                }
                $set(this.viewModel, this.classProp, this.initialState[this.classProp] || undefined);
            } else {
                const values = this.initialState[propName] ? this.initialState[propName] : {};
                Object.entries(values).forEach(e =>
                    $set(components.getComponentModel(e[0]), propName, e[1] || undefined)
                );
            }
        },
        isDisabled() {
            if (!this.viewModel) {
                return true;
            }
            if (this.classProp) {
                return this.isFormula(this.viewModel[this.classProp])
                    || (this.incompatibleComponentTypes && this.incompatibleComponentTypes.includes(this.viewModel.type));
            } else {
                let models = components.getChildren(this.viewModel, true);
                models.push(this.viewModel);
                return !this.getPropNames().every(propName => {
                    return models
                        .filter(m => components.propNames(m).find(p => p === propName))
                        .some(m => !this.isFormula(m[propName]));
                });
            }
        }
    }
});

Vue.component('toolbar-panel', {
    template: `
        <b-navbar v-if="show" class="shadow flex-shrink-0 p-0" ref="ide-statusbar" id="ide-toolbar" :variant="darkMode ? 'dark' : 'light'">
            <b-navbar-nav>
                <b-nav-form>
                    <div class="d-flex flex-row align-items-center" style="gap: 0.2rem">

                        <tool-button 
                            label="Background color" 
                            :iconUrl="basePath + 'assets/tool-icons/fill-color.png'" 
                            classProp="class" 
                            propNames="bg" 
                            :incompatibleComponentTypes="['NavbarView']"
                            editorTypes="variantColors" 
                            :choices="variants()"
                            :darkMode="darkMode"
                            :initialState="initialState"
                        />
                        
                        <tool-button 
                            label="Text style" 
                            :iconUrl="basePath + 'assets/tool-icons/text-color.png'" 
                            classProp="class" 
                            :subLabels="['Color', 'Size', 'Weight', 'Kind/decoration']"
                            :propNames="['text', 'fs', 'font-weight', 'text']" 
                            :incompatibleComponentTypes="['NavbarView']"
                            :editorTypes="['variantColors', undefined, undefined, undefined]" 
                            :choices="[variants(), rangeChoices(1, 7), fontWeightChoices(), textKindChoices()]"
                            :darkMode="darkMode"
                            :initialState="initialState"
                        />

                        <tool-button 
                            label="Text alignment" 
                            :iconUrl="basePath + 'assets/tool-icons/align-text-left.png'" 
                            classProp="layoutClass" 
                            propNames="text" 
                            :incompatibleComponentTypes="['NavbarView']"
                            :choices="textAlignChoices()"
                            :darkMode="darkMode"
                            :initialState="initialState"
                        />

                        <tool-button 
                            label="Width" 
                            :iconUrl="basePath + 'assets/tool-icons/width.png'" 
                            :subLabels="['Percent', 'Columns (all screens)', 'Columns (small screens)', 'Columns (medium screens)', 'Columns (large screens)', 'Columns (extra-large screens)']"
                            classProp="layoutClass" 
                            :propNames="['w', 'col', 'col-sm', 'col-md', 'col-lg', 'col-xl']"
                            :choices="[arrayChoices([25, 50, 75, 100]), rangeChoices(1, 13), rangeChoices(1, 13), rangeChoices(1, 13), rangeChoices(1, 13), rangeChoices(1, 13)]"
                            :darkMode="darkMode"
                            :initialState="initialState"
                        />

                        <tool-button 
                            label="Height" 
                            :iconUrl="basePath + 'assets/tool-icons/height.png'" 
                            :subLabels="['Percent']"
                            classProp="layoutClass" 
                            :propNames="['h']"
                            :choices="[arrayChoices([25, 50, 75, 100])]"
                            :darkMode="darkMode"
                            :initialState="initialState"
                        />

                        <tool-button 
                            label="Borders" 
                            :iconUrl="basePath + 'assets/tool-icons/border.png'" 
                            :subLabels="['Additive', 'Substractive', 'Color', 'Width', 'Shape', 'Rounding size', 'Shadows']"
                            classProp="class" 
                            :propNames="['border', 'border', 'border', 'border', 'rounded', 'rounded', 'shadow']"
                            :editorTypes="[undefined, undefined, 'variantColors', undefined, undefined, undefined, undefined]" 
                            :choices="[arrayChoices(['', 'top', 'right', 'bottom', 'left'], 'all'), arrayChoices(['0', 'top-0', 'right-0', 'bottom-0', 'left-0']), variants(), rangeChoices(1, 6), arrayChoices(['', 'circle', 'pill'], 'rounded'), rangeChoices(0, 4), arrayChoices(['', 'none', 'sm', 'lg'], 'regular')]"
                            :darkMode="darkMode"
                            :initialState="initialState"
                        />
                        
                        <tool-button 
                            label="Paddings" 
                            :iconUrl="basePath + 'assets/tool-icons/padding.png'" 
                            :subLabels="['All', 'Vertical', 'Horizontal', 'Top', 'Bottom', 'Left', 'Right']"
                            classProp="class" 
                            :propNames="['p', 'py', 'px', 'pt', 'pb', 'pl', 'pr']"
                            :choices="[rangeChoices(0, 6), rangeChoices(0, 6), rangeChoices(0, 6), rangeChoices(0, 6), rangeChoices(0, 6), rangeChoices(0, 6), rangeChoices(0, 6)]"
                            :darkMode="darkMode"
                            :initialState="initialState"
                        />
                        
                        <tool-button 
                            label="Margins" 
                            :iconUrl="basePath + 'assets/tool-icons/margin.png'" 
                            :subLabels="['All', 'Vertical', 'Horizontal', 'Top', 'Bottom', 'Left', 'Right']"
                            classProp="layoutClass" 
                            :propNames="['m', 'my', 'mx', 'mt', 'mb', 'ml', 'mr']"
                            :choices="[rangeChoices(0, 6), rangeChoices(0, 6), rangeChoices(0, 6), rangeChoices(0, 6), rangeChoices(0, 6), rangeChoices(0, 6), rangeChoices(0, 6)]"
                            :darkMode="darkMode"
                            :initialState="initialState"
                        />

                        <tool-button 
                            label="Size" 
                            :iconUrl="basePath + 'assets/tool-icons/size.png'" 
                            propNames="size" 
                            :choices="sizeChoices()"
                            :darkMode="darkMode"
                            :initialState="initialState"
                        />
                        
                        <tool-button 
                            label="Form layout" 
                            :iconUrl="basePath + 'assets/tool-icons/form.png'" 
                            :subLabels="['Horizontal layout', 'Label width']"
                            :propNames="['horizontalLayout', 'labelCols']" 
                            :editorTypes="[undefined, undefined]" 
                            :choices="[booleanChoices(), rangeChoices(0, 10)]"
                            :darkMode="darkMode"
                            :initialState="initialState"
                        />

<!--                        <tool-button label="Horizontal" :viewModel="viewModel" propNames="horizontalLayout" editorTypes="checkbox"></tool-button>-->
                        
                  </div>
                </b-nav-form>
            </b-navbar-nav>              
        </b-navbar>
    `,
    props: ['show'],
    data: function () {
        return {
            darkMode: ide.isDarkMode(),
            initialState: { viewModel: undefined }
        }
    },
    created() {
        this.$eventHub.$on('style-changed', () => {
            this.darkMode = ide.isDarkMode();
        });
        this.$eventHub.$on('component-selected', () => {
            this.init();
        });
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            for (const prop in this.initialState) {
                if (prop !== 'viewModel') {
                    delete this.initialState[prop];
                }
            }
            if (ide.selectedComponentId) {
                this.initialState.viewModel = components.getComponentModel(ide.selectedComponentId);
            }
        },
        rangeChoices(min, max) {
            return $tools.range(min, max).map(val => ({value: val}));
        },
        arrayChoices(values, defaultLabel) {
            return values.map(value => {
                    if (typeof value !== 'object') {
                        const choice = {value: value};
                        if (value === '') {
                            choice.label = defaultLabel;
                        }
                        return choice;
                    } else {
                        return value;
                    }
                });
        },
        textAlignChoices() {
            return [
                {
                    value: 'left',
                    iconUrl: basePath + 'assets/tool-icons/align-text-left.png'
                },
                {
                    value: 'center',
                    iconUrl: basePath + 'assets/tool-icons/align-text-center.png'
                },
                {
                    value: 'right',
                    iconUrl: basePath + 'assets/tool-icons/align-text-right.png'
                }
            ];
        },
        fontWeightChoices() {
            return [
                {
                    value: 'bold',
                    label: 'T',
                    class: 'font-weight-bold'
                },
                {
                    value: 'bolder',
                    label: 'T',
                    class: 'font-weight-bolder'
                },
                {
                    value: 'normal',
                    label: 'T',
                    class: 'font-weight-normal'
                },
                {
                    value: 'light',
                    label: 'T',
                    class: 'font-weight-light'
                }
            ];
        },
        textKindChoices() {
            return [
                {
                    value: 'lowercase',
                    label: 'abc',
                    class: 'text-lowercase'
                },
                {
                    value: 'uppercase',
                    label: 'abc',
                    class: 'text-uppercase'
                },
                {
                    value: 'capitalize',
                    label: 'abc',
                    class: 'text-capitalize'
                },
                {
                    value: 'monospace',
                    label: 'abc',
                    class: 'text-monospace'
                }
            ];
        },
        booleanChoices() {
            return [
                {
                    value: false,
                    iconUrl: basePath + 'assets/tool-icons/column.png'
                },
                {
                    value: true,
                    iconUrl: basePath + 'assets/tool-icons/row.png'
                }
            ];
        },
        sizeChoices() {
            return [
                {
                    value: 'sm',
                    label: '',
                    class: 'border',
                    style: 'cursor:pointer; width: 0.8rem; height: 0.8rem;'
                },
                {
                    value: 'default',
                    label: '',
                    class: 'border',
                    style: 'cursor:pointer; width: 1rem; height: 1rem;'
                },
                {
                    value: 'lg',
                    label: '',
                    class: 'border',
                    style: 'cursor:pointer; width: 1.2rem; height: 1.2rem;'
                }
            ];
        },
        variants() {
            return variants.map(variant => ({ value: variant }));
        }
    }
});


