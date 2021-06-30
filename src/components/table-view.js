Vue.component('table-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.class">
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <b-pagination v-if="$eval(viewModel.pagination)"
              v-model="currentPage"
              :total-rows="rows"
              :per-page="$eval(viewModel.perPage)"
            ></b-pagination>            
            <b-table 
                @row-selected="onRowSelected"            
                @filtered="onFiltered"
                :striped="$eval(viewModel.striped)" 
                :small="$eval(viewModel.small)"
                :hover="viewModel.hover" 
                :filter="$eval(viewModel.filter, null)"
                :filter-included-fields="$eval(viewModel.filterIncludedFields, null)"
                :filter-excluded-fields="$eval(viewModel.filterExcludedFields, null)"
                :stacked="viewModel.stacked === 'always' ? true : (viewModel.stacked === 'never' ? false : viewModel.stacked)"
                :per-page="$eval(viewModel.perPage)"
                :current-page="currentPage"
                selectable
                :fields="viewModel.fields"
                :select-mode="viewModel.selectMode" 
                :items="dataModel">
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
                "dataSource",
                "class",
                "selectMode",
                "selectable",
                "filter",
                "filterIncludedFields",
                "filterExcludedFields",
                "pagination",
                "perPage",
                "small",
                "stacked",
                "striped",
                "hover",
                "fields",
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
                    type: 'custom',
                    editor: 'table-fields-panel'
                },
                perPage: {
                    type: 'text',
                    editable: true,
                    description: 'Number of items per page'
                },
                stacked: {
                    type: 'select',
                    editable: true,
                    options: ["always", "sm", "dm", "lg", "xl", "never"]
                }
            }
        }

    }
});
