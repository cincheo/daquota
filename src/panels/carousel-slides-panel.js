Vue.component('carousel-slides-panel', {
    template: `
        <div v-if="slides">
        
            <b-form-select class="mb-2" v-model="selectedSlide" :options="slidesOptions" :select-size="6" size="sm"></b-form-select>
            
            <div v-if="selectedSlide">
                <div class="mb-3">
                    <b-button size="sm" @click="moveSlideUp()" class="mr-1" :enabled="selectedSlide && slides.indexOf(selectedSlide) > 0">
                        <b-icon-arrow-up></b-icon-arrow-up>
                    </b-button>    

                     <b-button size="sm" @click="moveSlideDown()" class="mr-1" :enabled="selectedSlide && slides.indexOf(selectedSlide) < slides.length">
                        <b-icon-arrow-down></b-icon-arrow-down>
                    </b-button>    
                     <b-button size="sm" @click="deleteSlide()" class="mr-1" :enabled="selectedSlide">
                        <b-icon-trash></b-icon-trash>
                    </b-button>    
                    
                    <b-button size="sm" @click="addSlide" class="text-right">
                        <b-icon-plus-circle></b-icon-plus-circle>
                    </b-button>
                   
                </div>

                 <b-form-group label="Caption" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-input v-model="selectedSlide.captionHtml" size="sm"></b-form-input>
                </b-form-group>

                 <b-form-group label="Text" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-input v-model="selectedSlide.textHtml" size="sm"></b-form-input>
                </b-form-group>

                <b-form-group label="No image" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-checkbox v-model="selectedSlide.imgBlank" size="sm" switch></b-form-checkbox>
                </b-form-group>

                <b-form-group v-if="selectedSlide.imgBlank" label="Blank page color" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-input v-model="selectedSlide.imgBlankColor" size="sm" disabled></b-form-input>
                </b-form-group>

                <b-form-group v-if="!selectedSlide.imgBlank" label="Image URL" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-input v-model="selectedSlide.imgSrc" size="sm"></b-form-input>
                </b-form-group>

                 <b-form-group label="Background" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-input v-model="selectedSlide.background" size="sm"></b-form-input>
                </b-form-group>

            </div>                              
            <div v-else>
                <b-button size="sm" @click="addSlide" class="text-right">
                    <b-icon-plus-circle></b-icon-plus-circle> new slide
                </b-button>                      
            </div>            
    
        </div>                   
        `,
    props: ['slides'],
    data: () => {
        return {
            slidesOptions: [],
            selectedSlide: undefined
        }
    },
    mounted: function() {
        this.fillSlidesOptions();
        if (this.slides.length > 0) {
            $set(this, 'selectedSlide', this.slides[0]);
        }
    },
    watch: {
        slides: {
            handler: function () {
                if (this.slides) {
                    this.fillSlidesOptions();
                }
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        addSlide() {
            let slide = {
                caption: 'Slide ' + (this.slides.length + 1)
            };
            this.slides.push(slide);
            this.fillSlidesOptions();
            $set(this, 'selectedSlide', slide);
        },
        deleteSlide() {
            const index = this.slides.indexOf(this.selectedSlide);
            if (index > -1) {
                this.slides.splice(index, 1);
                this.selectedSlide = undefined;
            }
        },
        moveSlideUp() {
            const index = this.slides.indexOf(this.selectedSlide);
            if (index > 0) {
                Tools.arrayMove(this.slides, index, index - 1);
                Tools.arrayMove(this.slidesOptions, index, index - 1);
            }
        },
        moveSlideDown() {
            const index = this.slides.indexOf(this.selectedSlide);
            if (index > -1) {
                Tools.arrayMove(this.slides, index, index + 1);
                Tools.arrayMove(this.slidesOptions, index, index + 1);
            }
        },
        fillSlidesOptions() {
            let selected = this.selectedSlide;
            this.selectedSlide = undefined;
            if (!this.slides) {
                this.slidesOptions = undefined;
            } else {
                this.slidesOptions = this.slides.map((slide, i) => {
                    return {
                        value: slide,
                        text: "slide #" + i
                    }
                });
            }
            $set(this, 'selectedSlide', selected);
        }
    }
});
