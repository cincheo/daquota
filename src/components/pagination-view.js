Vue.component('pagination-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.layoutClass">
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-pagination
                v-model="currentPage"
                :total-rows="dataModel ? dataModel.length : 0"
                :per-page="$eval(viewModel.perPage, null)"
                :type="$eval(viewModel.buttonType, null)" 
                :class="$eval(viewModel.class, null)"
                :style="$eval(viewModel.style, null)"
                :size="$eval(viewModel.size, null)"
                :align="$eval(viewModel.align, null)"
                :limit="$eval(viewModel.limit, null)"
                :pills="$eval(viewModel.pills, null)" 
                :hide-go-to-end-buttons="$eval(viewModel.hideGoToEndButtons, null)" 
                :first-text="$eval(viewModel.firstText, null)"
                :prev-text="$eval(viewModel.prevText, null)"
                :next-text="$eval(viewModel.nextText, null)"
                :last-text="$eval(viewModel.lastText, null)"
                :hide-ellipsis="$eval(viewModel.hideEllipsis, null)" 
                :ellipsis-text="$eval(viewModel.ellipsisText, null)" 
                :disabled="$eval(viewModel.disabled, false)"
                :draggable="$eval(viewModel.draggable, false) ? true : false" 
                v-on="boundEventHandlers()"
                @click="onClick"
                @change="onChange" @input="onInput" @page-click="onPageClick"
             >
            </b-pagination>
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
            return ["cid", "layoutClass", "class", "style", "dataSource", "perPage", "size", "align", "limit", "pills", "hideGoToEndButtons", "firstText", "prevText", "nextText", "lastText", "hideEllipsis", "ellipsisText", "disabled", "eventHandlers"];
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


