Vue.component('table-fields-panel', {
    template: `
        <div>
            <b-form-select class="mb-2" v-model="selected" :options="options" :select-size="10" size="sm"></b-form-select>

            <div v-if="selected">
                <div class="mb-3">
                    <b-button size="sm" @click="moveFieldUp()" class="mr-1" :enabled="selected && this.fields_data.indexOf(this.selected) > 0">
                        <b-icon-arrow-up></b-icon-arrow-up>
                    </b-button>    

                     <b-button size="sm" @click="moveFieldDown()" class="mr-1" :enabled="selected && this.fields_data.indexOf(this.selected) < this.fields_data.length">
                        <b-icon-arrow-down></b-icon-arrow-down>
                    </b-button>    
                   
                     <b-button size="sm" @click="deleteField()" class="mr-1" :enabled="selected">
                        <b-icon-trash></b-icon-trash>
                    </b-button>    
                    
                    <b-button size="sm" @click="addField()" class="text-right">
                        <b-icon-plus-circle></b-icon-plus-circle> new field
                    </b-button>
                   
                </div>

                <b-form-group label="Key" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-input v-model="selected.key" size="sm" />
                </b-form-group>
  
                <b-form-group label="Label" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-input v-model="selected.label" size="sm" />
                </b-form-group>
    
                <b-form-group label="Formatter (value)" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-textarea v-model="selected.formatterExpression" size="sm" />
                </b-form-group>
    
                <b-form-group label="Sortable" label-cols="6" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-checkbox v-model="selected.sortable" switch size="sm" class="mt-1" />
                </b-form-group>
    
                <b-form-group label="Sort direction" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-select v-model="selected.sortDirection" :options="['asc', 'desc']" size="sm" />
                </b-form-group>
                
                <b-form-group label="Variant" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-select v-model="selected.variant" :options="['default', 'active', 'success', 'info', 'warning', 'danger']" size="sm" />
                </b-form-group>
    
                <b-form-group label="Class" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-input v-model="selected.class" size="sm" />
                </b-form-group>
    
                <b-form-group label="stickyColumn" label-cols="6" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-checkbox v-model="selected.stickyColumn" switch size="sm" class="mt-1" />
                </b-form-group>

                <b-form-group label="hidden" label-cols="6" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-checkbox v-model="selected.hidden" switch size="sm" class="mt-1" />
                </b-form-group>

            </div>                              
            <div v-else>
                <b-button size="sm" @click="addField()" class="text-right">
                    <b-icon-plus-circle></b-icon-plus-circle> new field
                </b-button>                      
            </div>            
        </div>                   
        `,
    props: ['fields'],
    data: () => {
        return {
            fields_data: [],
            options: [],
            selected: undefined
        }
    },
    watch: {
        'selected.formatterExpression': {
            handler: function(formatterExpression) {
                if (this.selected) {
                    if (formatterExpression && formatterExpression !== '') {
                        this.selected.formatter = function (value, key, item) {
                            try {
                                return eval(formatterExpression);
                            } catch (e) {
                                return '#error in formatter#';
                            }
                        }
                    } else {
                        this.selected.formatter = undefined;
                    }
                }
            },
            deep: false,
            immediate: true
        },
        selected: {
            handler: function() {
                this.fillOptions();
            },
            deep: true,
            immediate: true
        }
    },
    mounted: function() {
        this.fields_data = this.fields;
        this.fillOptions();
    },
    methods: {
        addField() {
            let newField = {
                key: 'newField',
                label: 'New Field'
            };
            this.fields_data.push(newField);
            this.selected = newField;
            this.fillOptions();
        },
        deleteField() {
            const index = this.fields_data.indexOf(this.selected);
            if (index > -1) {
                this.fields_data.splice(index, 1);
            }
            this.selected = undefined;
        },
        moveFieldUp() {
            const index = this.fields_data.indexOf(this.selected);
            if (index > 0) {
                Tools.arrayMove(this.fields_data, index, index - 1);
                this.fillOptions();
            }
        },
        moveFieldDown() {
            const index = this.fields_data.indexOf(this.selected);
            if (index > -1) {
                Tools.arrayMove(this.fields_data, index, index + 1);
                this.fillOptions();
            }
        },
        fillOptions() {
            if (!this.fields_data) {
                this.options = undefined;
            } else {
                this.options = this.fields_data.map(f => {
                    return {
                        value: f,
                        text: f.label ? `${f.key} (${f.label})` : f.key
                    }
                });
            }
        }
    }
});
