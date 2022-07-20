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
            <b-button size="sm" @click="" :id="'popover-tool-button-'+label.replaceAll(' ', '-')" :disabled="isDisabled()" variant="secondary">
                <b-img v-if="iconUrl" :src="iconUrl" :style="'width:1rem;' + (darkMode ? 'filter: invert(1)' : '')"/>
                <span v-else class="ml-1">
                    {{label}}
                </span>
            </b-button>
            <b-popover :target="'popover-tool-button-'+label.replaceAll(' ', '-')" triggers="hover" placement="bottom">
                <template #title>{{label}}</template>
                <div v-for="(p, propIndex) in getPropNames()">
                    {{ getSubLabel(propIndex) }}
                    <div v-if="getEditorType(propIndex) === 'variantColors'" class="d-flex flex-row justify-content-center">
                        <div v-for="(value, i) in getChoices(propIndex)" :key="i" style="height: 1rem;width: 1rem" :class="'bg-'+value" @click="setPropValue(propIndex, value)"></div>
                    </div>
                    <div v-if="getEditorType(propIndex) === 'checkbox'" class="d-flex flex-row">
                        <b-checkbox switch @input="setPropValue(propIndex, $event)"></b-checkbox>
                    </div>
                    <div v-if="getEditorType(propIndex) === undefined" class="d-flex flex-row justify-content-center" style="gap: 0.5rem">
                        <div v-for="(choice, i) in getChoices(propIndex)" :key="i" @click="setPropValue(propIndex, choice.value)" :style="choice.style" :class="choice.class">
                            <b-img v-if="choice.iconUrl" :src="choice.iconUrl" :style="'width:1rem;' + (darkMode ? 'filter: invert(1)' : '')"/>
                            <span v-else class="ml-1">
                                {{ choice.label !== undefined ? choice.label : choice.value }}
                            </span>
                        </div>
                    </div>
                </div>
            </b-popover>
        </div>
    `,
    props: ['viewModel', 'iconUrl', 'label', 'subLabels', 'classProp', 'propName', 'choices', 'editorType', 'incompatibleComponentTypes'],
    data: function () {
        return {
            darkMode: ide.isDarkMode()
        }
    },
    created: function () {
        this.$eventHub.$on('style-changed', () => {
            this.darkMode = ide.isDarkMode();
        });
    },
    methods: {
        getPropNames() {
            return Array.isArray(this.propName) ? this.propName : [this.propName];
        },
        getChoices(propIndex) {
            return Array.isArray(this.propName) ? this.choices[propIndex] : this.choices;
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
        setPropValue(propIndex, value) {
            if (this.classProp) {
                if (this.isFormula(this.viewModel[this.classProp])) {
                    return;
                }
                let classes = this.viewModel[this.classProp] ? this.viewModel[this.classProp].split(' ') : [];
                for (const choice of this.choices) {
                    classes = classes.filter(c => !c.startsWith(this.propName + '-' + choice.value));
                }
                classes.push(this.propName + '-' + value);
                $set(this.viewModel, this.classProp, classes.join(' '));
            } else {
                const propName = this.getPropNames()[propIndex];
                let models = components.getChildren(this.viewModel);
                models.push(this.viewModel);
                models.map(m => $c(m.cid))
                    .filter(c => c)
                    .filter(c => c.propNames().find(p => p === propName))
                    .filter(c => !this.isFormula(c.viewModel[propName]))
                    .forEach(c => $set(c.viewModel, propName, value));
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
                    return models.map(m => $c(m.cid))
                        .filter(c => c)
                        .filter(c => c.propNames().find(p => p === propName))
                        .some(c => !this.isFormula(c.viewModel[propName]));
                });
            }
        }
    }
});

Vue.component('toolbar-panel', {
    template: `
        <b-navbar v-if="show" class="shadow flex-shrink-0 p-0" ref="ide-statusbar" id="ide-toolbar" variant="secondary">
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
                            classProp="layoutClass" 
                            propName="bg" 
                            :incompatibleComponentTypes="['NavbarView']"
                            editorType="variantColors" 
                            :choices="variants()"
                        />
                        
                        <tool-button 
                            label="Text color" 
                            :iconUrl="basePath + 'assets/tool-icons/text-color.png'" 
                            :viewModel="viewModel" 
                            classProp="layoutClass" 
                            propName="text" 
                            :incompatibleComponentTypes="['NavbarView']"
                            editorType="variantColors" 
                            :choices="variants()"
                        />

                        <tool-button 
                            label="Text alignment" 
                            :iconUrl="basePath + 'assets/tool-icons/align-text-left.png'" 
                            :viewModel="viewModel" 
                            classProp="layoutClass" 
                            propName="text" 
                            :incompatibleComponentTypes="['NavbarView']"
                            :choices="textAlignChoices()"
                        />
                        
<!--                        <tool-button -->
<!--                            label="Padding" -->
<!--                            :viewModel="viewModel" -->
<!--                            classProp="layoutClass" -->
<!--                            propName="p" -->
<!--                            :choices="rangeChoices(0, 5)"-->
<!--                        />-->
<!--                        -->
<!--                        <tool-button -->
<!--                            label="Margin" -->
<!--                            :viewModel="viewModel" -->
<!--                            classProp="layoutClass" -->
<!--                            propName="m" -->
<!--                            :choices="rangeChoices(0, 5)"-->
<!--                        />-->

                        <tool-button 
                            label="Size" 
                            :iconUrl="basePath + 'assets/tool-icons/size.png'" 
                            :viewModel="viewModel" 
                            propName="size" 
                            :choices="sizeChoices()"
                        />
                        
<!--                        <tool-button label="Variant" :viewModel="viewModel" propName="variant" editorType="variantColors" :choices="variants()"></tool-button>-->

                        
                        <tool-button 
                            label="Form layout" 
                            :iconUrl="basePath + 'assets/tool-icons/form.png'" 
                            :subLabels="['Horizontal layout', 'Label width']"
                            :viewModel="viewModel" 
                            :propName="['horizontalLayout', 'labelCols']" 
                            :editorType="['checkbox', undefined]" 
                            :choices="[undefined, rangeChoices(0, 10)]"
                        />

<!--                        <tool-button label="Horizontal" :viewModel="viewModel" propName="horizontalLayout" editorType="checkbox"></tool-button>-->
<!--                        <tool-button label="Label width" :viewModel="viewModel" propName="labelCols" :choices="rangeChoices(0, 10)"></tool-button>-->
                        
                  </div>
                </b-nav-form>
            </b-navbar-nav>              
        </b-navbar>
    `,
    props: ['show'],
    data: function () {
        return {
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
            console.log("loaded", this.padding, this.margin, this.textVariant, this.backgoundVariant);
        },
        variants() {
            return variants;
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


