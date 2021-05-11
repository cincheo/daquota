Vue.component('component-icon', {
    template: `
         <b-img :src="getSrc()" :style="'width:1.5em;' + filter()"></b-img>
    `,
    props: ["type"],
    methods: {
        getSrc() {
            return ide.getComponentIcon(this.type);
        },
        filter() {
            return ide.isDarkMode() ? 'filter: invert(1)' : '';
        }
    }
});
