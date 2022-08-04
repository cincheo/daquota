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
                <template #title>{{label}}</template>
                <div v-for="(p, propIndex) in getPropNames()">
                    {{ getSubLabel(propIndex) }}
                    <div v-if="getEditorType(propIndex) === 'variantColors'" class="d-flex flex-row justify-content-center">
                        <div v-for="(choice, i) in getChoices(propIndex)" 
                            :key="i"
                            :title="choice.value === null ? 'none' : choice.value" 
                            :style="'height: 1rem; width: 1rem; border: solid ' + borderColor(propIndex, i) + ' 2px !important'" 
                            :class="'bg-'+choice.value" 
                            @mouseover="onMouseover(propIndex, i, choice.value)"
                            @mouseleave="onMouseleave(propIndex)"
                            @click="setPropValue(propIndex, choice.value)"
                        >
                            <b-icon-x v-if="choice.value === null" class="p-0 m-0"/>
                        </div>
                    </div>
                    <div v-if="getEditorType(propIndex) === 'checkbox'" class="d-flex flex-row">
                        <b-checkbox switch @input="setPropValue(propIndex, $event)"></b-checkbox>
                    </div>
                    <div v-if="getEditorType(propIndex) === undefined" class="d-flex flex-row justify-content-center">
                        <div v-for="(choice, i) in getChoices(propIndex)" 
                            :key="i" 
                            :title="choice.value" 
                            :style="'border: solid ' + borderColor(propIndex, i) + ' 2px'" 
                            @mouseover="onMouseover(propIndex, i, choice.value)"
                            @mouseleave="onMouseleave(propIndex)"
                            @click="setPropValue(propIndex, choice.value)" 
                        >
                            <b-icon-x v-if="choice.value === null" class="p-0 m-0"/>
                            <div v-else :style="choice.style" :class="choice.class">
                                <b-img v-if="choice.iconUrl" :src="choice.iconUrl" :style="'width:1rem;' + (darkMode ? 'filter: invert(1)' : '')"/>
                                <span v-else class="ml-1">
                                    {{ choice.label !== undefined ? choice.label : choice.value }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </b-popover>
        </div>
    `,
    props: ['darkMode', 'viewModel', 'iconUrl', 'label', 'subLabels', 'classProp', 'propNames', 'choices', 'editorType', 'incompatibleComponentTypes'],
    editorType: undefined,
    classProp: undefined,
    incompatibleComponentTypes: undefined,
    data: function () {
        return {
            hoverPropIndex: undefined,
            hoverValueIndex: undefined
        }
    },
    methods: {
        onShown() {
            this._initialState = {};
        },
        onHidden() {
        },
        borderColor(propIndex, hoverValueIndex) {
            const hovered = propIndex === this.hoverPropIndex && hoverValueIndex === this.hoverValueIndex;
            return hovered ? (this.darkMode ? 'white' : 'black') : 'transparent';
        },
        onMouseover(propIndex, hoverValueIndex, value) {
            this.hoverPropIndex = propIndex;
            this.hoverValueIndex = hoverValueIndex;
            this.setPropValue(propIndex, value, true);
        },
        onMouseleave(propIndex) {
            this.hoverPropIndex = undefined;
            this.hoverValueIndex = undefined;
            this.resetPropValue(propIndex);
        },
        getPropNames() {
            return Array.isArray(this.propNames) ? this.propNames : [this.propNames];
        },
        getChoices(propIndex) {
            const choices = (Array.isArray(this.propNames) ? this.choices[propIndex] : this.choices).slice(0);
            choices.push({ value: null });
            return choices;
        },
        getEditorType(propIndex) {
            return Array.isArray(this.editorType) ? this.editorType[propIndex] : this.editorType;
        },
        getSubLabel(propIndex) {
            return Array.isArray(this.subLabels) ? this.subLabels[propIndex] : this.subLabels;
        },
        isFormula(value) {
            return value && (typeof value === 'string') && value.startsWith('=');
        },
        setPropValue(propIndex, value, saveInitialState) {
            const propName = this.getPropNames()[propIndex];
            if (!saveInitialState) {
                if (this.getPropNames().length === 1) {
                    this.$refs['popover'].$emit('close');
                }
                this._initialState = {};
                saveInitialState = true;
            }
            if (this.classProp) {
                if (this.isFormula(this.viewModel[this.classProp])) {
                    return;
                }
                if (saveInitialState && this._initialState[propName] === undefined) {
                    this._initialState[propName] = this.viewModel[this.classProp];
                }
                let classes = this.viewModel[this.classProp] ? this.viewModel[this.classProp].split(' ') : [];
                const values = this.choices.filter(choice => choice.value != null).map(choice => propName + '-' + choice.value);
                console.info('values', values, this.choices);
                classes = classes.filter(c => !values.includes(c));
                if (value != null) {
                    classes.push(propName + '-' + value);
                }
                $set(this.viewModel, this.classProp, classes.join(' '));
            } else {
                let models = components.getChildren(this.viewModel);
                models.push(this.viewModel);
                if (saveInitialState && this._initialState[propName] === undefined) {
                    this._initialState[propName] = {};
                    models.forEach(m =>
                        this._initialState[propName][m.cid] = value
                    );
                }
                models
                    .filter(m => components.propNames(m).find(p => p === propName))
                    .filter(m => !this.isFormula(m[propName]))
                    .forEach(m => $set(m, propName, value));

            }
        },
        resetPropValue(propIndex) {
            const propName = this.getPropNames()[propIndex];
            console.info('reset', propName);
            console.info('initial', this._initialState[propName]);
            if (this.classProp) {
                if (this.isFormula(this.viewModel[this.classProp])) {
                    return;
                }
                $set(this.viewModel, this.classProp, this._initialState[propName]);
            } else {
                const values = this._initialState[propName];
                Object.entries(values).forEach(e =>
                    $set(components.getComponentModel(e[0]), propName, e[1])
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
                let models = components.getChildren(this.viewModel);
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
                    
<!--                        <b-button size="sm" @click="" id="popover-fill-background">Bg</b-button>-->
<!--                        <b-popover target="popover-fill-background" triggers="hover" placement="bottom">-->
<!--                            <template #title>Fill background</template>-->
<!--                            <div class="d-flex flex-row">-->
<!--                                <div v-for="(variant, i) of variants()" style="height: 1rem;width: 1rem" :class="'bg-'+variant" @click="setBackgroundVariant(variant)"></div>-->
<!--                            </div>-->
<!--                        </b-popover>-->
<!--                        -->
<!--                        <b-button size="sm" @click="" id="popover-text-variant">Fg</b-button>-->
<!--                        <b-popover target="popover-text-variant" triggers="hover" placement="bottom">-->
<!--                            <template #title>Text color</template>-->
<!--                            <div class="d-flex flex-row">-->
<!--                                <div v-for="(variant, i) of variants()" style="height: 1rem;width: 1rem" :class="'bg-'+variant" @click="setTextVariant(variant)"></div>-->
<!--                            </div>-->
<!--                        </b-popover>-->
<!--                        -->
<!--                        <b-button size="sm" @click="" id="popover-padding">Padding</b-button>-->
<!--                        <b-popover target="popover-padding" triggers="hover" placement="bottom">-->
<!--                            <template #title>Padding</template>-->
<!--                            <div class="d-flex flex-row">-->
<!--                                <div v-for="(value, i) of [0,1,2,3,4,5]" style="height: 1rem;width: 1rem" @click="setPadding(value)">{{value}}</div>-->
<!--                            </div>-->
<!--                        </b-popover>-->
<!--                        -->
<!--                        <b-button size="sm" @click="" id="popover-margin">Margin</b-button>-->
<!--                        <b-popover target="popover-margin" triggers="hover" placement="bottom">-->
<!--                            <template #title>Margin</template>-->
<!--                            <div class="d-flex flex-row">-->
<!--                                <div v-for="(value, i) of [0,1,2,3,4,5]" style="height: 1rem;width: 1rem" @click="setMargin(value)">{{value}}</div>-->
<!--                            </div>-->
<!--                        </b-popover>-->

<!--                        <b-button size="sm" @click="" id="popover-paddings">Paddings</b-button>-->
<!--                        <b-popover target="popover-paddings" triggers="hover" placement="bottom">-->
<!--                            <template #title>Paddings</template>-->
<!--                            <div class="d-flex flex-row">-->
<!--                                <div v-for="(value, i) of [0,1,2,3,4,5]" style="height: 1rem;width: 1rem" @click="setComponentPaddings(value)">{{value}}</div>-->
<!--                            </div>-->
<!--                        </b-popover>-->
<!--                        -->
<!--                        <b-button size="sm" @click="" id="popover-margins">Margins</b-button>-->
<!--                        <b-popover target="popover-margins" triggers="hover" placement="bottom">-->
<!--                            <template #title>Margins</template>-->
<!--                            <div class="d-flex flex-row">-->
<!--                                <div v-for="(value, i) of [0,1,2,3,4,5]" style="height: 1rem;width: 1rem" @click="setComponentMargins(value)">{{value}}</div>-->
<!--                            </div>-->
<!--                        </b-popover>-->

                        <tool-button 
                            label="Background color" 
                            :iconUrl="basePath + 'assets/tool-icons/fill-color.png'" 
                            :viewModel="viewModel" 
                            classProp="class" 
                            propNames="bg" 
                            :incompatibleComponentTypes="['NavbarView']"
                            editorType="variantColors" 
                            :choices="variants()"
                            :darkMode="darkMode"
                        />
                        
                        <tool-button 
                            label="Text color" 
                            :iconUrl="basePath + 'assets/tool-icons/text-color.png'" 
                            :viewModel="viewModel" 
                            classProp="layoutClass" 
                            propNames="text" 
                            :incompatibleComponentTypes="['NavbarView']"
                            editorType="variantColors" 
                            :choices="variants()"
                            :darkMode="darkMode"
                        />

                        <tool-button 
                            label="Text alignment" 
                            :iconUrl="basePath + 'assets/tool-icons/align-text-left.png'" 
                            :viewModel="viewModel" 
                            classProp="layoutClass" 
                            propNames="text" 
                            :incompatibleComponentTypes="['NavbarView']"
                            :choices="textAlignChoices()"
                            :darkMode="darkMode"
                        />
                        
                        <tool-button 
                            label="Padding" 
                            :iconUrl="basePath + 'assets/tool-icons/padding.png'" 
                            :viewModel="viewModel" 
                            classProp="class" 
                            propNames="p" 
                            :choices="rangeChoices(0, 5)"
                            :darkMode="darkMode"
                        />
                        
                        <tool-button 
                            label="Margin" 
                            :iconUrl="basePath + 'assets/tool-icons/margin.png'" 
                            :viewModel="viewModel" 
                            classProp="layoutClass" 
                            propNames="m" 
                            :choices="rangeChoices(0, 5)"
                            :darkMode="darkMode"
                        />

                        <tool-button 
                            label="Size" 
                            :iconUrl="basePath + 'assets/tool-icons/size.png'" 
                            :viewModel="viewModel" 
                            propNames="size" 
                            :choices="sizeChoices()"
                            :darkMode="darkMode"
                        />
                        
<!--                        <tool-button label="Variant" :viewModel="viewModel" propNames="variant" editorType="variantColors" :choices="variants()"></tool-button>-->

                        
                        <tool-button 
                            label="Form layout" 
                            :iconUrl="basePath + 'assets/tool-icons/form.png'" 
                            :subLabels="['Horizontal layout', 'Label width']"
                            :viewModel="viewModel" 
                            :propNames="['horizontalLayout', 'labelCols']" 
                            :editorType="['checkbox', undefined]" 
                            :choices="[undefined, rangeChoices(0, 10)]"
                            :darkMode="darkMode"
                        />

<!--                        <tool-button label="Horizontal" :viewModel="viewModel" propNames="horizontalLayout" editorType="checkbox"></tool-button>-->
<!--                        <tool-button label="Label width" :viewModel="viewModel" propNames="labelCols" :choices="rangeChoices(0, 10)"></tool-button>-->
                        
                  </div>
                </b-nav-form>
            </b-navbar-nav>              
        </b-navbar>
    `,
    props: ['show'],
    data: function () {
        return {
            darkMode: ide.isDarkMode(),
            viewModel: undefined,
            backgroundVariant: undefined,
            textVariant: undefined,
            padding: undefined,
            margin: undefined,
            size: undefined,
            variant: undefined
        }
    },
    created() {
        this.$eventHub.$on('style-changed', () => {
            this.darkMode = ide.isDarkMode();
        });
        this.$eventHub.$on('component-selected', (cid) => {
            this.initComponent(cid);
        });
    },
    mounted() {
        this.initComponent(ide.selectedComponentId);
    },
    methods: {
        rangeChoices(min, max) {
            return $tools.range(min, max).map(val => ({value: val}));
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
        sizeChoices() {
            return [
                {
                    value: 'sm',
                    label: '',
                    class: 'border',
                    style: 'cursor:pointer; width: 0.8rem; height: 0.8rem;'
                },
                {
                    value: 'md',
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
        initComponent(cid) {
            if (!cid) {
                this.viewModel = undefined;
                return;
            }
            if (this.viewModel && cid && this.viewModel.cid === cid) {
                return;
            }
            this.padding = undefined;
            this.margin = undefined;
            this.textVariant = undefined;
            this.backgoundVariant = undefined;
            this.size = undefined;
            this.variant = undefined;
            this.viewModel = components.getComponentModel(cid);
            if (!this.viewModel) {
                return;
            }
            let classes = this.viewModel.class ? this.viewModel.class.split(' ') : [];
            for (const c of classes) {
                if (c.startsWith('text-')) {
                    this.textVariant = c.split('-')[1];
                }
                if (c.startsWith('bg-')) {
                    this.backgoundVariant = c.split('-')[1];
                }
            }
            let layoutClasses = this.viewModel.layoutClass ? this.viewModel.layoutClass.split(' ') : [];
            for (const c of layoutClasses) {
                if (c.startsWith('p-')) {
                    this.padding = c.split('-')[1];
                }
                if (c.startsWith('m-')) {
                    this.margin = c.split('-')[1];
                }
            }
            this.size = this.viewModel.size;
            this.variant = this.viewModel.variant;
        },
        variants() {
            return variants.map(variant => ({ value: variant }));
        },
        isFormula(value) {
            return value && value.startsWith('=');
        },
        setBackgroundVariant(variant) {
            if (this.isFormula(this.viewModel.class)) {
                return;
            }
            let classes = this.viewModel.class ? this.viewModel.class.split(' ') : [];
            classes = classes.filter(c => !c.startsWith('bg-'));
            classes.push('bg-' + variant);
            $set(this.viewModel, 'class', classes.join(' '));
        },
        setTextVariant(variant) {
            if (this.isFormula(this.viewModel.class)) {
                return;
            }
            let classes = this.viewModel.class ? this.viewModel.class.split(' ') : [];
            classes = classes.filter(c => !c.startsWith('text-'));
            classes.push('text-' + variant);
            $set(this.viewModel, 'class', classes.join(' '));
        },
        setPadding(value) {
            if (this.isFormula(this.viewModel.layoutClass)) {
                return;
            }
            let classes = this.viewModel.layoutClass ? this.viewModel.layoutClass.split(' ') : [];
            classes = classes.filter(c => !c.startsWith('p-'));
            classes.push('p-' + value);
            $set(this.viewModel, 'layoutClass', classes.join(' '));
        },
        setMargin(value) {
            if (this.isFormula(this.viewModel.layoutClass)) {
                return;
            }
            let classes = this.viewModel.layoutClass ? this.viewModel.layoutClass.split(' ') : [];
            classes = classes.filter(c => !c.startsWith('m-'));
            classes.push('m-' + value);
            $set(this.viewModel, 'layoutClass', classes.join(' '));
        },
        setComponentPaddings(value) {
            let models = components.getChildren(this.viewModel);
            models.push(this.viewModel);
            console.log("setComponentPaddings", models);
            models.map(m => $c(m.cid))
                .filter(c => c)
                .filter(c => c.propNames().find(prop => prop === 'label'))
                .filter(c => !this.isFormula(c.viewModel.class))
                .forEach(c => {
                    let classes = c.viewModel.class ? c.viewModel.class.split(' ') : [];
                    classes = classes.filter(c => !c.startsWith('p-'));
                    classes.push('p-' + value);
                    $set(c.viewModel, 'class', classes.join(' '));
                });
        },
        setComponentMargins(value) {
            let models = components.getChildren(this.viewModel);
            models.push(this.viewModel);
            console.log("setComponentMargins", models);
            models.map(m => $c(m.cid))
                .filter(c => c)
                .filter(c => c.propNames().find(prop => prop === 'label'))
                .filter(c => !this.isFormula(c.viewModel.class))
                .forEach(c => {
                    let classes = c.viewModel.class ? c.viewModel.class.split(' ') : [];
                    classes = classes.filter(c => !c.startsWith('m-'));
                    classes.push('m-' + value);
                    $set(c.viewModel, 'class', classes.join(' '));
                });

        },
        setPropValue(propName, value) {
            let models = components.getChildren(this.viewModel);
            models.push(this.viewModel);
            models.map(m => $c(m.cid))
                .filter(c => c)
                .filter(c => c.propNames().find(p => p === propName))
                .filter(c => !this.isFormula(c.viewModel[propName]))
                .forEach(c => $set(c.viewModel, propName, value));
        },
        hasChildWithProp(propName) {
            let models = components.getChildren(this.viewModel);
            models.push(this.viewModel);
            return models.map(m => $c(m.cid))
                .filter(c => c)
                .filter(c => c.propNames().find(p => p === propName))
                .some(c => !this.isFormula(c.viewModel[propName]));
        }

    }
});


