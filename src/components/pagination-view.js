/*
 * d.Lite - low-code platform for local-first Web/Mobile development
 * Copyright (C) 2021-2023 CINCHEO
 *                         https://www.cincheo.com
 *                         renaud.pawlak@cincheo.com
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

const paginationMixin = {
    name: "paginationMixin",
    data: function () {
        return {
            // 1-indexed
            currentPage: 1
        }
    },
    methods: {
        paginationStatelessActionNames() {
            return [
                {value: 'getCurrentPage', text: 'getCurrentPage()'},
                {value: 'getItemsPerPage', text: 'getItemsPerPage()'},
                {value: 'getItemsPerPage', text: 'getPageFirstIndex([page])'},
                {value: 'getItemsPerPage', text: 'getPageLastIndex([page])'}
            ];
        },
        paginationActionNames() {
            return [
                {value: 'setCurrentPage', text: 'setCurrentPage(page)'}
            ];
        },
        getCurrentPage() {
            return this.currentPage;
        },
        getItemsPerPage() {
            return parseInt(this.$eval(this.viewModel.perPage, 0));
        },
        setCurrentPage(page) {
            this.currentPage = page;
        },
        getPageFirstIndex(page) {
            page = page || this.currentPage;
            const perPage = this.getItemsPerPage();
            if (!perPage) {
                return 0;
            } else {
                return (page - 1) * perPage;
            }
        },
        getPageLastIndex(page) {
            const perPage = this.getItemsPerPage();
            if (!perPage) {
                return 0;
            } else {
                return this.getPageFirstIndex(page) + perPage - 1;
            }
        },
        getPageLastFilledIndex(page) {
            const perPage = this.getItemsPerPage();
            const dataLength = this.value ? this.value.length : 0;
            if (!perPage) {
                return dataLength;
            } else {
                return Math.min(this.getPageFirstIndex(page) + perPage - 1, dataLength);
            }
        },
        getItemCount() {
            if (Array.isArray(this.value)) {
                return this.value.length;
            } else if (typeof this.value === 'number') {
                return this.value;
            } else {
                return 0;
            }
        }
    }
}

Vue.component('pagination-view', {
    extends: editableComponent,
    mixins: [paginationMixin],
    template: `
        <div :id="cid">
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-pagination
                v-model="currentPage"
                :total-rows="getItemCount()"
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
    mounted() {
        const initialCurrentPage = this.$eval(this.viewModel.initialPage, null);
        if (initialCurrentPage) {
            this.$nextTick(() => this.setCurrentPage(initialCurrentPage));
        }
    },
    methods: {
        customEventNames() {
            return ["@change", "@input", "@page-click"];
        },
        customStatelessActionNames() {
            return this.paginationStatelessActionNames();
        },
        customActionNames() {
            return this.paginationActionNames();
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
            return [
                "cid",
                "dataSource",
                "perPage",
                "initialPage",
                "size",
                "align",
                "limit",
                "pills",
                "hideGoToEndButtons",
                "firstText",
                "prevText",
                "nextText",
                "lastText",
                "hideEllipsis",
                "ellipsisText",
                "disabled",
                "eventHandlers"
            ];
        },
        customPropDescriptors() {
            return {
                perPage: {
                    type: 'number',
                    editable: true,
                    description: "Number of rows per page"
                },
                initialPage: {
                    type: 'number',
                    editable: true,
                    description: "The initial page when this component is shown the first time (starting at 1)"
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


