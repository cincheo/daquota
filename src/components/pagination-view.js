Vue.component('pagination-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.layoutClass">
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <b-pagination
                v-model="currentPage"
                :total-rows="dataModel ? dataModel.length : 0"
                :per-page="$eval(viewModel.perPage)"
                :type="viewModel.buttonType" 
                :class="$eval(viewModel.class)"
                :size="$eval(viewModel.size)"
                :align="$eval(viewModel.align)"
                :limit="$eval(viewModel.limit)"
                :pills="$eval(viewModel.pills)" 
                :hide-go-to-end-buttons="$eval(viewModel.hideGoToEndButtons)" 
                :first-text="$eval(viewModel.firstText)"
                :prev-text="$eval(viewModel.prevText)"
                :next-text="$eval(viewModel.nextText)"
                :last-text="$eval(viewModel.lastText)"
                :hide-ellipsis="$eval(viewModel.hideEllipsis)" 
                :ellipsis-text="$eval(viewModel.ellipsisText)" 
                :disabled="$eval(viewModel.disabled, false)"
                 @change="onChange" @input="onInput" @page-click="onPageClick"
                 >
            </b-button>
        </div>
    `,
    data: function() {
        return {
            currentPage: 1
        }
    },
    methods: {
        customEventNames() {
            return ["@change", "@input", "@page-click"];
        },
        onChange(page) {
            this.$emit("@change", page);
        },
        onInput(page) {
            this.$emit("@input", page);
        },
        onPageClick(bvEvent, page) {
            this.$emit("@page-click", bvEvent, page);
        },
        propNames() {
            return ["cid", "layoutClass", "class", "dataSource", "perPage", "size", "align", "limit", "pills", "hideGoToEndButtons", "firstText", "prevText", "nextText", "lastText", "hideEllipsis", "ellipsisText", "disabled", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                perPage: {
                    type: 'text',
                    editable: true,
                    description: "Number of rows per page"
                },
                align: {
                    type: 'select',
                    editable: true,
                    options: [
                        'left', 'center', 'right', 'fill'
                    ]
                },
                size: {
                    type: 'select',
                    editable: true,
                    options: [
                        "default", "sm", "lg"
                    ]
                },
                pills: {
                    type: 'checkbox',
                    editable: true
                },
                hideGoToEndButtons: {
                    type: 'checkbox',
                    editable: true,
                    description: 'Hides the goto first and goto last page buttons'
                },
                hideEllipsis: {
                    type: 'checkbox',
                    editable: true,
                    description: 'Hides the goto first and goto last page buttons'
                },
                firstText: {
                    type: 'text',
                    editable: true,
                    description: "Content to place in the goto first page button. Default value is '«'"
                },
                prevText: {
                    type: 'text',
                    editable: true,
                    description: "Content to place in the goto previous page button. Default value is '‹'"
                },
                nextText: {
                    type: 'text',
                    editable: true,
                    description: "Content to place in the goto next page button. Default value is '›'"
                },
                lastText: {
                    type: 'text',
                    editable: true,
                    description: "Content to place in the goto last page button. Default value is '»'"
                },
                ellipsisText: {
                    type: 'text',
                    editable: true,
                    description: "Content to place in the ellipsis placeholder. Default value is '…'"
                },
                disabled: {
                    type: 'checkbox',
                    editable: true
                }
            }
        }

    }
});


