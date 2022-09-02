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

Vue.component('table-view', {
    extends: editableComponent,
    template: `
        <div :id="cid"
            :draggable="$eval(viewModel.draggable, false) ? true : false"
            v-on="boundEventHandlers({'click': onClick})"
        >
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-pagination v-if="$eval(viewModelExt.pagination, false)"
              v-model="currentPage"
              :total-rows="rows"
              :per-page="$eval(viewModelExt.perPage, null)"
            ></b-pagination>
            <div v-if="viewModel.viewSource !== undefined">
                <b-modal :id="'table-configuration-'+cid" title="Table configuration" size="xl">
                    <component-live-configuration-panel :viewModel="viewModelExt"></component-live-configuration-panel>
                </b-modal>            
            </div>
            <b-table 
                :style="$eval(viewModelExt.style, null)"
                :class="componentClass()"
                @row-selected="onRowSelected"
                @filtered="onFiltered"

                @context-changed="onContextChanged"
                @head-clicked="onHeadClicked"
                @refreshed="onRefreshed"
                @row-clicked="onRowClicked"
                @row-contextmenu="onRowContextmenu"
                @row-dblclicked="onRowDblckicked"
                @row-hovered="onRowHovered"
                @row-middle-clicked="onRowMiddleClicked"
                @row-unhovered="onRowUnhovered"
                @sort-changed="onSortChanged"                
                
                :striped="$eval(viewModelExt.striped)" 
                :small="$eval(viewModelExt.small)"
                :hover="$eval(viewModelExt.hover, false)" 
                :filter-function="$evalCode(viewModelExt.filterFunction, null)"
                :filter="$evalCode(viewModelExt.filter, null)"
                :filter-included-fields="safeArray($eval(viewModelExt.filterIncludedFields, null))"
                :filter-excluded-fields="safeArray($eval(viewModelExt.filterExcludedFields, null))"
                :stacked="viewModelExt.stacked === 'always' ? true : (viewModelExt.stacked === 'never' ? false : viewModelExt.stacked)"
                :per-page="$eval(viewModelExt.perPage, null)"
                :current-page="currentPage"
                :fields="viewModelExt.fields ? viewModelExt.fields.filter(f => !$eval(f.hidden, false)) : undefined"
                :select-mode="$eval(viewModelExt.selectMode, null)" 
                :items="safeDataModel"
                :thead-class="$eval(viewModelExt.hideHeader, null)?'d-none':''"
                :selectable="$eval(viewModelExt.notSelectable, null) ? false : true"
                :outlined="$eval(viewModelExt.outlined, null)"
                :bordered="$eval(viewModelExt.bordered, null)"
                :borderless="$eval(viewModelExt.borderless, null)"
                :dark="$eval(viewModelExt.dark, null)"
                :emptyHtml="$eval(viewModelExt.emptyText, null)"
                :emptyFilteredHtml="$eval(viewModelExt.emptyFilteredText, null)"
                :fixed="$eval(viewModelExt.fixed, null)"
                :responsive="$eval(viewModelExt.responsive, null)"
                :headRowVariant="$eval(viewModelExt.headRowVariant, null)"
                
            >
              <template #cell()="data">
                <span v-html="defaultRender(data)"></span>              
              </template>                
            </b-table>
        </div>
    `,
    data: function() {
        return {
            selectedItem: undefined,
            currentPage: 0
        }
    },
    computed: {
        rows() {
            return this.value?.length;
        },
        viewModelExt: function() {
            if (this.viewModel.viewSource) {
                let source = this.$eval(this.viewModel.viewSource, undefined);
                if (components.hasComponent(source)) {
                    let sourceData = $d(source);
                    if (!sourceData) {
                        // init source component
                        $c(source).setData(this.viewModel);
                        return $d(source);
                    } else {
                        return sourceData;
                    }
                }
            }
            return this.viewModel;
        },
        safeDataModel: function () {
            if (!Array.isArray(this.value)) {
                return [];
            } else {
                if (this.value.length > 0 && (typeof this.value[0] !== 'object')) {
                    return this.value.map(item => ({value: item}));
                }
                return this.value;
            }
        }
    },
    watch: {
        'viewModelExt': {
            handler: function() {
                this.updateFormatters();
            }
        }

    },
    mounted() {
        this.updateFormatters();
    },
    methods: {
        safeArray(object) {
            if (Array.isArray(object)) {
                return object;
            } else if (typeof object === 'string') {
                return [object];
            } else {
                return undefined;
            }
        },
        defaultRender(data) {
            if (this.viewModelExt.defaultCellRenderer) {
                this.args = [data];
                return this.$evalCode(this.viewModelExt.defaultCellRenderer, data.value);
            } else {
                return data.value;
            }
        },
        updateFormatters() {
            if (!this.viewModelExt.fields) {
                return;
            }
            for (let field of this.viewModelExt.fields) {
                if (field.formatterExpression && field.formatterExpression !== '') {
                    field.formatter = function (value, key, item) {
                        try {
                            return eval(field.formatterExpression);
                        } catch (e) {
                            return '#error in formatter#';
                        }
                    }
                }
            }
        },
        customActionNames() {
            return [{value:'showLiveConfigurationDialog',text:'showLiveConfigurationDialog()'}];
        },
        showLiveConfigurationDialog() {
            this.$bvModal.show('table-configuration-'+this.cid);
        },
        onRowSelected(items) {
            if (!this.$eval(this.viewModelExt.notSelectable, null)) {
                console.info("on row selected", items);
                this.selectedItem = items[0];
                this.$emit('@item-selected', items[0]);
            }
        },
        onFiltered(...args) {
            this.$emit('@filtered', ...args);
        },
        onContextChanged(...args) {
            this.$emit('@context-changed', ...args);
        },
        onHeadClicked(...args) {
            this.$emit('@head-clicked', ...args);
        },
        onRefreshed(...args) {
            this.$emit('@refreshed', ...args);
        },
        onRowClicked(...args) {
            this.$emit('@row-clicked', ...args);
        },
        onRowContextmenu(...args) {
            this.$emit('@row-contextmenu', ...args);
        },
        onRowDblckicked(...args) {
            this.$emit('@row-dblclicked', ...args);
        },
        onRowHovered(...args) {
            this.$emit('@row-hovered', ...args);
        },
        onRowMiddleClicked(...args) {
            this.$emit('@row-middle-clicked', ...args);
        },
        onRowUnhovered(...args) {
            this.$emit('@row-unhovered', ...args);
        },
        onSortChanged(...args) {
            this.$emit('@sort-changed', ...args);
        },
        customEventNames() {
            return [
                "@item-selected",
                "@filtered",
                "@context-changed",
                "@head-clicked",
                "@refreshed",
                "@row-clicked",
                "@row-contextmenu",
                "@row-dblclicked",
                "@row-hovered",
                "@row-middle-clicked",
                "@row-unhovered",
                "@sort-changed"
            ];
        },
        propNames() {
            return [
                "cid",
                "fields",
                "dataSource",
                "field",
                "notSelectable",
                "selectMode",
                "defaultCellRenderer",
                "filter",
                "filterFunction",
                "filterIncludedFields",
                "filterExcludedFields",
                "pagination",
                "perPage",
                "small",
                "stacked",
                "striped",

                "outlined",
                "bordered",
                "borderless",
                "dark",
                "emptyText",
                "emptyFilteredText",
                "fixed",
                "responsive",
                "headRowVariant",

                "hideHeader",
                "hover",
                "eventHandlers",
                "viewSource"
            ];
        },
        customPropDescriptors() {
            return {
                viewSource: {
                    type: 'select',
                    editable: true,
                    options: () => Object.values(components.getComponentModels())
                        .filter(model => model.type.endsWith('Connector'))
                        .filter(model => document.getElementById(model.cid))
                        .map(model => model.cid)
                        .sort(),
                    description: 'A data connector component that stores the view model to be used for this table',
                    category: 'data'
                },
                notSelectable: {
                    type: 'checkbox',
                    editable: true,
                    description: "When set, places the table body rows in not selectable mode"
                },
                selectMode: {
                    type: 'select',
                    editable: true,
                    options: ["single", "multi", "range"],
                    description: 'The selectable mode for the table (default: multi).'
                },
                pagination: {
                    label: 'Pagination control',
                    type: 'checkbox',
                    editable: true
                },
                fields: {
                    category: 'fields',
                    type: 'custom',
                    editor: 'table-fields-panel'
                },
                defaultCellRenderer: {
                    type: 'code/javascript',
                    literalOnly: true,
                    editable: true,
                    docLink: 'https://bootstrap-vue.org/docs/components/table#custom-data-rendering',
                    description: 'An expression returning the HTML to be rendered in table cells ("args[0]" being the currently rendered cell data object, as defined in the b-table component)'
                },
                filter: {
                    type: 'code/javascript',
                    literalOnly: true,
                    description: 'Criteria for filtering. Internal filtering supports only string or RegExpr criteria (otherwise, please use a filter function)'
                },
                filterFunction: {
                    type: 'code/javascript',
                    actualType: 'function',
                    literalOnly: true,
                    hidden: viewModel => !viewModel.filter,
                    description: 'A filter function taking (record, filter) arguments, where "record" is the object in the table and "filter" is the value of the "filter" property - Note that the "filter" property must not be null/false in order for this function to be called'
                },
                filterExcludedFields: {
                    editable:true,
                    type: 'text',
                    description: 'Array of top level fields to ignore when filtering the item data'
                },
                filterIncludedFields: {
                    editable:true,
                    type: 'text',
                    description: 'Array of fields to include when filtering. Overrides filter-ignore-fields'
                },
                perPage: {
                    type: 'text',
                    editable: true,
                    description: 'Number of items per page'
                },
                stacked: {
                    type: 'select',
                    editable: true,
                    options: ["always", "sm", "md", "lg", "xl", "never"],
                    category: 'style',
                    description: 'Generate a responsive stacked table. Set to true for an always stacked table, or set it to one of the breakpoints \'sm\', \'md\', \'lg\', or \'xl\' to make the table visually stacked only on screens smaller than the breakpoint.'
                },
                striped: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style',
                    description: 'Applies striping to the tbody rows'
                },
                small: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style',
                    description: 'Renders the table with smaller cell padding'
                },
                hideHeader: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style',
                    description: 'Do not show the table header'
                },
                hover: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style',
                    description: 'Enables hover styling on rows'
                },
                outlined: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style',
                    description: 'Adds an outline border to the table element'
                },
                bordered: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style',
                    description: 'Adds borders to all the cells and headers'
                },
                borderless: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style',
                    description: 'Removes all borders from cells'
                },
                dark: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style',
                    description: 'Places the table in dark mode'
                },
                emptyText: {
                    type: 'code/html',
                    editable: true,
                    literalOnly: true,
                    description: "HTML string to show when the table has no items to show"
                },
                emptyFilteredText: {
                    type: 'code/html',
                    editable: true,
                    literalOnly: true,
                    description: "HTML string to show when the table has no items to show due to filtering"
                },
                fixed: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style',
                    description: 'Makes all columns equal width (fixed layout table). Will speed up rendering for large tables. Column widths can be set via CSS or colgroup'
                },
                responsive: {
                    type: 'select',
                    options: [true, 'sm', 'md', 'lg', 'xl'],
                    editable: true,
                    category: 'style',
                    description: 'Makes the table responsive in width, adding a horizontal scrollbar. Set to true for always responsive or set to one of the breakpoints to switch from responsive to normal: \'sm\', \'md\', \'lg\', \'xl\''
                },
                headRowVariant: {
                    type: 'select',
                    options: ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'light', 'dark'],
                    editable: true,
                    category: 'style',
                    description: 'Apply a Bootstrap theme color variant to the tr element in the thead'
                }
            }
        }

    }
});
