Vue.component('table-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.class"
            :draggable="$eval(viewModel.draggable, false) ? true : false"
            v-on="boundEventHandlers({'click': onClick})"
        >
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-pagination v-if="$eval(viewModel.pagination, false)"
              v-model="currentPage"
              :total-rows="rows"
              :per-page="$eval(viewModel.perPage, null)"
            ></b-pagination>            
            <b-table 
                :style="$eval(viewModel.style, null)"
                @row-selected="onRowSelected"
                @filtered="onFiltered"
                :striped="$eval(viewModel.striped)" 
                :small="$eval(viewModel.small)"
                :hover="$eval(viewModel.hover, false)" 
                :filter="$eval(viewModel.filter, null)"
                :filter-included-fields="$eval(viewModel.filterIncludedFields, null)"
                :filter-excluded-fields="$eval(viewModel.filterExcludedFields, null)"
                :stacked="viewModel.stacked === 'always' ? true : (viewModel.stacked === 'never' ? false : viewModel.stacked)"
                :per-page="$eval(viewModel.perPage, null)"
                :current-page="currentPage"
                selectable
                :fields="viewModel.fields"
                :select-mode="$eval(viewModel.selectMode, null)" 
                :items="dataModel">
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
            return this.dataModel.length;
        }
    },
    watch: {
        'viewModel': {
            handler: function() {
                this.updateFormatters();
            }
        }
    },
    mounted() {
        this.updateFormatters();
    },
    methods: {
        defaultRender(data) {
            if (this.viewModel.defaultCellRenderer) {
                this.args = [data];
                return this.$eval(this.viewModel.defaultCellRenderer, data.value);
            } else {
                return data.value;
            }
        },
        updateFormatters() {
            if (!this.viewModel.fields) {
                return;
            }
            for (let field of this.viewModel.fields) {
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
        onRowSelected(items) {
            if (this.viewModel.selectable) {
                console.info("on row selected", items);
                this.selectedItem = items[0];
                this.$emit('@item-selected', items[0]);
            }
        },
        onFiltered(items) {
            console.info("on table filtered", items);
            this.$emit('@filtered', items);
        },
        customEventNames() {
            return ["@item-selected", "@filtered"];
        },
        propNames() {
            return [
                "cid",
                "fields",
                "class",
                "dataSource",
                "selectMode",
                "selectable",
                "defaultCellRenderer",
                "filter",
                "filterIncludedFields",
                "filterExcludedFields",
                "pagination",
                "perPage",
                "small",
                "stacked",
                "striped",
                "hover",
                "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                selectMode: {
                    type: 'select',
                    editable: true,
                    options: ["single", "multi", "range"]
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
                    type: 'textarea',
                    editable: true,
                    docLink: 'https://bootstrap-vue.org/docs/components/table#custom-data-rendering',
                    description: 'An expression returning the HTML to be rendered in table cells ("args[0]" being the currently rendered cell data object, as defined in the b-table component)'
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
                    category: 'style'
                },
                striped: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style'
                },
                small: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style'
                },
                hover: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style'
                }
            }
        }

    }
});
