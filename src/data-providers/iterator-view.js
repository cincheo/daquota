Vue.component('iterator-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle(true) + ';' + $eval(viewModel.style)" :class="$eval(viewModel.class)">
            <component-icon v-if="edit" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
                <component-view v-for="(item, index) in currentPageItems" :key="index" :cid="viewModel.body ? viewModel.body.cid : undefined" keyInParent="body" :iteratorIndex="currentPageFirstIndex() + index" :inSelection="isEditable()" />
                <component-view v-if="edit && (!Array.isArray(value) || value.length == 0)" :cid="viewModel.body ? viewModel.body.cid : undefined" keyInParent="body" :inSelection="isEditable()" :iteratorIndex="0" />
            </b-card>
        </div>
    `,
    data: function () {
        return {
            currentPage: 1,
            currentPageItems: []
        }
    },
    mounted: function () {
        if (this.viewModel.perPage === undefined) {
            this.viewModel.perPage = 10;
        }
    },
    watch: {
        currentPage: function () {
            this.updatePageItems();
        },
        perPage: function () {
            this.updatePageItems();
        },
        dataModel: function () {
            this.updatePageItems();
        }
    },
    methods: {
        currentPageFirstIndex() {
            return (this.currentPage - 1) * this.$eval(this.viewModel.perPage, 10);
        },
        updatePageItems() {
            const perPage = this.$eval(this.viewModel.perPage, 10);
            console.log('updating page items');
            if (this.value === undefined) {
                this.currentPageItems = [];
                return;
            } else {
                console.log('slice');
                this.currentPageItems = this.value.slice((this.currentPage - 1) * perPage, this.currentPage * perPage);
            }
        },
        propNames() {
            return ["cid", "dataSource", "field", "class", "style", "body", "perPage", "eventHandlers"];
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


