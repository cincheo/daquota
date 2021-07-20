Vue.component('component-icon', {
    template: `
         <b-img :src="getSrc()" :style="'width:' + (size === 'sm' ? '1rem;' : '1.2rem;') + (darkMode ? 'filter: invert(1)' : '')"></b-img>
    `,
    props: ["type", "size"],
    data: function () {
        return {
            darkMode: ide.isDarkMode()
        }
    },
    created: function () {
        this.$eventHub.$on('style-changed', () => {
            this.darkMode = ide.isDarkMode();
        });
    },
    methods: {
        getSrc() {
            return this.type ? ide.getComponentIcon(this.type) : '';
        }
    }
});
