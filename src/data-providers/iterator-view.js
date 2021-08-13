Vue.component('iterator-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle(true)">
            <component-icon v-if="edit" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <div :class="$eval(viewModel.class)" :style="$eval(viewModel.style)">
                <component-view v-for="(item, index) in currentPageItems" :key="index" :cid="viewModel.body ? viewModel.body.cid : undefined" keyInParent="body" :iteratorIndex="currentPageFirstIndex() + index" :inSelection="isEditable()" />
                <component-view v-if="edit && (!Array.isArray(value) || value.length == 0)" :cid="viewModel.body ? viewModel.body.cid : undefined" keyInParent="body" :inSelection="isEditable()" :iteratorIndex="0" />
            </div>
        </div>
    `,
    data: function () {
        return {
            currentPage: 1,
            currentPageItems: []
        }
    },
    watch: {
        currentPage: function () {
            this.updatePageItems();
            this.$emit("@page-changed", this.currentPage);
        },
        'viewModel.perPage': function () {
            this.updatePageItems();
        },
        value: function () {
            this.updatePageItems();
        }
    },
    methods: {
        currentPageFirstIndex() {
            const perPage = this.$eval(this.viewModel.perPage);
            if (!perPage || perPage === '0' || perPage === '') {
                return 0;
            } else {
                return (this.currentPage - 1) * perPage;
            }
        },
        updatePageItems() {
            const perPage = this.$eval(this.viewModel.perPage);
            console.log('updating page items');
            if (this.value === undefined) {
                this.currentPageItems = [];
                return;
            } else {
                if (!perPage || perPage === '0' || perPage === '') {
                    this.currentPageItems = this.value;
                } else {
                    this.currentPageItems = this.value.slice((this.currentPage - 1) * perPage, this.currentPage * perPage);
                }
            }
        },
        customEventNames() {
            return ["@page-changed"];
        },
        propNames() {
            return ["cid", "class", "style", "dataSource", "field", "body", "perPage", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                body: {
                    type: 'ref',
                    editable: true
                }
            }
        }

    }
});


