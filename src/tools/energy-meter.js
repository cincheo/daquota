/*
 * d.Lite - low-code platform for local-first Web/Mobile development
 * Copyright (C) 2022 CINCHEO
 *                    https://www.cincheo.com
 *                    renaud.pawlak@cincheo.com
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

/**
 * A simple widget to evaluate and monitor the energy load of the page.
 * We assume that the lesser FPS the browser is able to ensure, the more energy is consumed by the page.
 *
 * Credits: mrdoob / http://mrdoob.com/ - code adapted from stats.js
 */

Vue.component('energy-meter', {
    template: `
        <div ref="container">
        </div>
    `,
    props: ["energyMeter", "clickHandler"],
    mounted: function() {
        this.container = document.createElement('div');
        this.container.style.cssText = 'width:80px;opacity:0.9;cursor:pointer';

        this.energyDiv = document.createElement('div');
        this.energyDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#002';
        this.container.appendChild(this.energyDiv);

        this.energyText = document.createElement('div');
        this.energyText.style.cssText = 'color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px'
        this.energyText.innerHTML = 'Energy';
        this.energyDiv.appendChild(this.energyText);

        this.energyGraph = document.createElement('div');
        this.energyGraph.style.cssText = 'position:relative;width:74px;height:5px';
        this.energyDiv.appendChild(this.energyGraph);

        while (this.energyGraph.children.length < 74) {
            let bar = document.createElement('span');
            bar.style.cssText = 'width:1px;height:5px;float:left;background-color:#444'
            this.energyGraph.appendChild(bar);

        }

        this.energyMeter.start();
        this.energyMeter.registerValueHandler(value => {
            this.energyText.textContent = "Energy: "+(value*100).toFixed(0) + '%';
            this.updateGraph(value);
        });

        this.$nextTick(() => {
            this.$refs['container'].appendChild(this.container);
        });
    },
    // unmounted: function() {
    //     this.energyMeter.stop();
    // },
    methods: {
        updateGraph(value) {
            let child = this.energyGraph.appendChild(this.energyGraph.firstChild);
            //child.style.height = value + 'px';
            //child.style.height = '30px';
            child.style.cssText = 'width:1px;height:5px;float:left;background-color: '
                + $tools.colorGradientHex('#FF0000', '#00FF00', value);
            //console.info('update xxx', value);
        }
    }

});

class EnergyMeter {

    constructor() {
        this.startTime = Date.now();
        this.prevTime = this.startTime;
        this.energy = 0;
        this.frames = 0;
        this.valueHandlers = [];
    }

    registerValueHandler(valueHandler) {
        if (!this.valueHandlers.includes(valueHandler)) {
            this.valueHandlers.push(valueHandler);
        }
        return this;
    }

    isRunning() {
        return !!this.runningFunction;
    }

    start() {
        if (this.isRunning()) {
            return this;
        }
        this.runningFunction = () => {
            this.begin();
            this.end();
            if (this.runningFunction) {
                requestAnimationFrame(this.runningFunction);
            }
        }
        requestAnimationFrame(this.runningFunction);
        return this;
    }

    stop() {
        this.runningFunction = undefined;
        return this;
    }

    /**
     * @private
     */
    begin() {
        this.startTime = Date.now();
    }

    /**
     * @private
     */
    end() {

        let time = Date.now();

        this.frames++;

        if (time > this.prevTime + 1000) {

            let fps = Math.round((this.frames * 1000) / (time - this.prevTime));
            this.energy = (60 - Math.min(fps, 60)) / 60;

            this.valueHandlers.forEach(valueHandler => {
                try {
                    valueHandler(this.energy)
                } catch (e) {
                    // ...
                }
            })

            this.prevTime = time;
            this.frames = 0;

        }

        return time;

    }

}

