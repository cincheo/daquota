if (!window.ideVersion) {
    window.ideVersion = "DEVELOPMENT";
}

Vue.prototype.$intersectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        console.info('intersection', entry.target.id);

        if (entry.target.id === '_top') {
            if (entry.isIntersecting) {
                ide.scrollDisabled = true;
                try {
                    ide.router.replace('')
                        .finally(() => {
                            console.info('scroll enabled again');
                            ide.scrollDisabled = false;
                        });
                } catch (e) {
                    console.error(e);
                }
            }
            return;
        }

        let component = $c(entry.target);
        if (component && component.viewModel && component.viewModel.observeIntersections) {
            let revealAnimation = component.$eval(component.viewModel.revealAnimation, null);
            if (revealAnimation) {
                if (entry.isIntersecting) {
                    if (component.getContainer().hiddenBeforeAnimate) {
                        component.animate(
                            revealAnimation,
                            component.$eval(component.viewModel.revealAnimationDuration, null),
                            component.$eval(component.viewModel.revealAnimationDelay, null)
                        );
                    }
                } else {
                    if (component.$eval(component.viewModel.revealAnimationOccurrence, null) === 'always') {
                        component.getContainer().hiddenBeforeAnimate = true;
                    }
                }
            }
            component.$emit('@intersect', entry.isIntersecting);
        }
    });
});

Vue.prototype.$anchorIntersectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        let component = $c(entry.target);
        if (component.viewModel.publicName) {
            console.info('anchor intersects', component.viewModel.publicName, ide.router);
            let navItem = applicationModel.navbar.navigationItems.find(nav => nav.kind === 'Anchor' && nav.anchor === component.viewModel.publicName);
            if (entry.isIntersecting) {
                ide.scrollDisabled = true;
                ide.router.replace('#' + component.viewModel.publicName)
                    .finally(() => {
                        console.info('scroll enabled again');
                        ide.scrollDisabled = false;
                    });
            } else {
            }
        }
    });
}, {
    rootMargin: "-15% 0px -15% 0px"
});

window.onbeforeunload = function() {
    if (!ide.isInFrame() && ide.isFileDirty() && ide.isBrowserDirty()) {
        try {
            console.info("m1", ide.savedFileModel.replaceAll('\n', ''));
            console.info("m2", ide.getApplicationContent().replaceAll('\n', ''));
        } catch (e) {
            console.error(e);
        }
        return "";
    }
}

let versionIndex = 1;

Vue.prototype.$eventHub = new Vue();

let parameters = new URLSearchParams(window.location.search);

let backendProtocol = 'http';

let userInterfaceName = parameters.get('ui');
if (!userInterfaceName) {
    userInterfaceName = 'default';
}

let backend = parameters.get('backend');
if (!backend) {
    backend = 'localhost:8085';
}
let baseUrl = backendProtocol + '://' + backend + '/web-api';

let mapKeys = function (object, mapFn) {
    return Object.keys(object).reduce((result, key) => {
        result[key] = mapFn(key, object[key]);
        return result;
    }, {})
}

window.plugins = {};
let plugins = parameters.get('plugins');
if (plugins) {
    plugins = plugins.split(',');
}
console.info("plugins", plugins);

window.addEventListener('resize', () => {
    Vue.prototype.$eventHub.$emit('screen-resized');
});

setInterval(() => {
    Vue.prototype.$eventHub.$emit('tick', ide.tick++);
}, 1000);

window.addEventListener("message", (event) => {
    switch (event.data.type) {
        case 'SET':
            Tools.setTimeoutWithRetry(() => {
                if ($c(event.data.cid)) {
                    $c(event.data.cid).value = event.data.data;
                    window.parent.postMessage({
                        applicationName: applicationModel.name,
                        type: 'SET_RESULT',
                        cid: event.data.cid
                    }, '*');
                    return true;
                } else {
                    return false;
                }
            }, 10);
            break;
        case 'GET':
            window.parent.postMessage({
                applicationName: applicationModel.name,
                type: 'GET_RESULT',
                cid: event.data.cid,
                value: $c(event.data.cid).value
            }, '*');
            break;
    }

    if (event.data.type === 'APPLICATION_LOADED' && event.data.applicationName === 'models') {
        document.getElementById('models-iframe').contentWindow.postMessage(
            {
                type: 'SET',
                cid: 'select-0',
                data: 'contacts'
            },
            '*'
        );
    }

    if (event.data.type === 'APPLICATION_RESULT' && event.data.applicationName === 'models') {
        console.info("got application result", event.data.value);
    }


}, false);

class IDE {

    icons = [
        'alarm', 'alarm-fill', 'align-bottom', 'align-center', 'align-end', 'align-middle', 'align-start', 'align-top', 'alt', 'app', 'app-indicator', 'archive', 'archive-fill', 'arrow90deg-down', 'arrow90deg-left', 'arrow90deg-right', 'arrow90deg-up', 'arrow-bar-down', 'arrow-bar-left', 'arrow-bar-right', 'arrow-bar-up', 'arrow-clockwise', 'arrow-counterclockwise', 'arrow-down', 'arrow-down-circle', 'arrow-down-circle-fill', 'arrow-down-left', 'arrow-down-left-circle', 'arrow-down-left-circle-fill', 'arrow-down-left-square', 'arrow-down-left-square-fill', 'arrow-down-right', 'arrow-down-right-circle', 'arrow-down-right-circle-fill', 'arrow-down-right-square', 'arrow-down-right-square-fill', 'arrow-down-short', 'arrow-down-square', 'arrow-down-square-fill', 'arrow-down-up', 'arrow-left', 'arrow-left-circle', 'arrow-left-circle-fill', 'arrow-left-right', 'arrow-left-short', 'arrow-left-square', 'arrow-left-square-fill', 'arrow-repeat', 'arrow-return-left', 'arrow-return-right', 'arrow-right', 'arrow-right-circle', 'arrow-right-circle-fill', 'arrow-right-short', 'arrow-right-square', 'arrow-right-square-fill', 'arrow-up', 'arrow-up-circle', 'arrow-up-circle-fill', 'arrow-up-left', 'arrow-up-left-circle', 'arrow-up-left-circle-fill', 'arrow-up-left-square', 'arrow-up-left-square-fill', 'arrow-up-right', 'arrow-up-right-circle', 'arrow-up-right-circle-fill', 'arrow-up-right-square', 'arrow-up-right-square-fill', 'arrow-up-short', 'arrow-up-square', 'arrow-up-square-fill', 'arrows-angle-contract', 'arrows-angle-expand', 'arrows-collapse', 'arrows-expand', 'arrows-fullscreen', 'arrows-move', 'aspect-ratio', 'aspect-ratio-fill', 'asterisk', 'at', 'award', 'award-fill',
        'back', 'backspace', 'backspace-fill', 'backspace-reverse', 'backspace-reverse-fill', 'badge4k', 'badge4k-fill', 'badge8k', 'badge8k-fill', 'badge-ad', 'badge-ad-fill', 'badge-cc', 'badge-cc-fill', 'badge-hd', 'badge-hd-fill', 'badge-tm', 'badge-tm-fill', 'badge-vo', 'badge-vo-fill', 'bag', 'bag-check', 'bag-check-fill', 'bag-dash', 'bag-dash-fill', 'bag-fill', 'bag-plus', 'bag-plus-fill', 'bag-x', 'bag-x-fill', 'bar-chart', 'bar-chart-fill', 'bar-chart-line', 'bar-chart-line-fill', 'bar-chart-steps', 'basket', 'basket2', 'basket2-fill', 'basket3', 'basket3-fill', 'basket-fill', 'battery', 'battery-charging', 'battery-full', 'battery-half', 'bell', 'bell-fill', 'bezier', 'bezier2', 'bicycle', 'binoculars', 'binoculars-fill', 'blank', 'blockquote-left', 'blockquote-right', 'book', 'book-fill', 'book-half', 'bookmark', 'bookmark-check', 'bookmark-check-fill', 'bookmark-dash', 'bookmark-dash-fill', 'bookmark-fill', 'bookmark-heart', 'bookmark-heart-fill', 'bookmark-plus', 'bookmark-plus-fill', 'bookmark-star', 'bookmark-star-fill', 'bookmark-x', 'bookmark-x-fill', 'bookmarks', 'bookmarks-fill', 'bookshelf', 'bootstrap', 'bootstrap-fill', 'bootstrap-reboot', 'border-style', 'border-width', 'bounding-box', 'bounding-box-circles', 'box', 'box-arrow-down', 'box-arrow-down-left', 'box-arrow-down-right', 'box-arrow-in-down', 'box-arrow-in-down-left', 'box-arrow-in-down-right', 'box-arrow-in-left', 'box-arrow-in-right', 'box-arrow-in-up', 'box-arrow-in-up-left', 'box-arrow-in-up-right', 'box-arrow-left', 'box-arrow-right', 'box-arrow-up', 'box-arrow-up-left', 'box-arrow-up-right', 'box-seam', 'braces', 'bricks', 'briefcase', 'briefcase-fill', 'brightness-alt-high', 'brightness-alt-high-fill', 'brightness-alt-low', 'brightness-alt-low-fill', 'brightness-high', 'brightness-high-fill', 'brightness-low', 'brightness-low-fill', 'broadcast', 'broadcast-pin', 'brush', 'brush-fill', 'bucket', 'bucket-fill', 'bug', 'bug-fill', 'building', 'bullseye',
        'calculator', 'calculator-fill', 'calendar', 'calendar2', 'calendar2-check', 'calendar2-check-fill', 'calendar2-date', 'calendar2-date-fill', 'calendar2-day', 'calendar2-day-fill', 'calendar2-event', 'calendar2-event-fill', 'calendar2-fill', 'calendar2-minus', 'calendar2-minus-fill', 'calendar2-month', 'calendar2-month-fill', 'calendar2-plus', 'calendar2-plus-fill', 'calendar2-range', 'calendar2-range-fill', 'calendar2-week', 'calendar2-week-fill', 'calendar2-x', 'calendar2-x-fill', 'calendar3', 'calendar3-event', 'calendar3-event-fill', 'calendar3-fill', 'calendar3-range', 'calendar3-range-fill', 'calendar3-week', 'calendar3-week-fill', 'calendar4', 'calendar4-event', 'calendar4-range', 'calendar4-week', 'calendar-check', 'calendar-check-fill', 'calendar-date', 'calendar-date-fill', 'calendar-day', 'calendar-day-fill', 'calendar-event', 'calendar-event-fill', 'calendar-fill', 'calendar-minus', 'calendar-minus-fill', 'calendar-month', 'calendar-month-fill', 'calendar-plus', 'calendar-plus-fill', 'calendar-range', 'calendar-range-fill', 'calendar-week', 'calendar-week-fill', 'calendar-x', 'calendar-x-fill', 'camera', 'camera2', 'camera-fill', 'camera-reels', 'camera-reels-fill', 'camera-video', 'camera-video-fill', 'camera-video-off', 'camera-video-off-fill', 'capslock', 'capslock-fill', 'card-checklist', 'card-heading', 'card-image', 'card-list', 'card-text', 'caret-down', 'caret-down-fill', 'caret-down-square', 'caret-down-square-fill', 'caret-left', 'caret-left-fill', 'caret-left-square', 'caret-left-square-fill', 'caret-right', 'caret-right-fill', 'caret-right-square', 'caret-right-square-fill', 'caret-up', 'caret-up-fill', 'caret-up-square', 'caret-up-square-fill', 'cart', 'cart2', 'cart3', 'cart4', 'cart-check', 'cart-check-fill', 'cart-dash', 'cart-dash-fill', 'cart-fill', 'cart-plus', 'cart-plus-fill', 'cart-x', 'cart-x-fill', 'cash', 'cash-stack', 'cast', 'chat', 'chat-dots', 'chat-dots-fill', 'chat-fill', 'chat-left', 'chat-left-dots', 'chat-left-dots-fill', 'chat-left-fill', 'chat-left-quote', 'chat-left-quote-fill', 'chat-left-text', 'chat-left-text-fill', 'chat-quote', 'chat-quote-fill', 'chat-right', 'chat-right-dots', 'chat-right-dots-fill', 'chat-right-fill', 'chat-right-quote', 'chat-right-quote-fill', 'chat-right-text', 'chat-right-text-fill', 'chat-square', 'chat-square-dots', 'chat-square-dots-fill', 'chat-square-fill', 'chat-square-quote', 'chat-square-quote-fill', 'chat-square-text', 'chat-square-text-fill', 'chat-text', 'chat-text-fill', 'check', 'check2', 'check2-all', 'check2-circle', 'check2-square', 'check-all', 'check-circle', 'check-circle-fill', 'check-square', 'check-square-fill', 'chevron-bar-contract', 'chevron-bar-down', 'chevron-bar-expand', 'chevron-bar-left', 'chevron-bar-right', 'chevron-bar-up', 'chevron-compact-down', 'chevron-compact-left', 'chevron-compact-right', 'chevron-compact-up', 'chevron-contract', 'chevron-double-down', 'chevron-double-left', 'chevron-double-right', 'chevron-double-up', 'chevron-down', 'chevron-expand', 'chevron-left', 'chevron-right', 'chevron-up', 'circle', 'circle-fill', 'circle-half', 'circle-square', 'clipboard', 'clipboard-check', 'clipboard-data', 'clipboard-minus', 'clipboard-plus', 'clipboard-x', 'clock', 'clock-fill', 'clock-history', 'cloud', 'cloud-arrow-down', 'cloud-arrow-down-fill', 'cloud-arrow-up', 'cloud-arrow-up-fill', 'cloud-check', 'cloud-check-fill', 'cloud-download', 'cloud-download-fill', 'cloud-fill', 'cloud-minus', 'cloud-minus-fill', 'cloud-plus', 'cloud-plus-fill', 'cloud-slash', 'cloud-slash-fill', 'cloud-upload', 'cloud-upload-fill', 'code', 'code-slash', 'code-square', 'collection', 'collection-fill', 'collection-play', 'collection-play-fill', 'columns', 'columns-gap', 'command', 'compass', 'compass-fill', 'cone', 'cone-striped', 'controller', 'cpu', 'cpu-fill', 'credit-card', 'credit-card2-back', 'credit-card2-back-fill', 'credit-card2-front', 'credit-card2-front-fill', 'credit-card-fill', 'crop', 'cup', 'cup-fill', 'cup-straw', 'cursor', 'cursor-fill', 'cursor-text',
        'dash', 'dash-circle', 'dash-circle-fill', 'dash-square', 'dash-square-fill', 'diagram2', 'diagram2-fill', 'diagram3', 'diagram3-fill', 'diamond', 'diamond-fill', 'diamond-half', 'dice1', 'dice1-fill', 'dice2', 'dice2-fill', 'dice3', 'dice3-fill', 'dice4', 'dice4-fill', 'dice5', 'dice5-fill', 'dice6', 'dice6-fill', 'disc', 'disc-fill', 'discord', 'display', 'display-fill', 'distribute-horizontal', 'distribute-vertical', 'door-closed', 'door-closed-fill', 'door-open', 'door-open-fill', 'dot', 'download', 'droplet', 'droplet-fill', 'droplet-half',
        'earbuds', 'easel', 'easel-fill', 'egg', 'egg-fill', 'egg-fried', 'eject', 'eject-fill', 'emoji-angry', 'emoji-angry-fill', 'emoji-dizzy', 'emoji-dizzy-fill', 'emoji-expressionless', 'emoji-expressionless-fill', 'emoji-frown', 'emoji-frown-fill', 'emoji-heart-eyes', 'emoji-heart-eyes-fill', 'emoji-laughing', 'emoji-laughing-fill', 'emoji-neutral', 'emoji-neutral-fill', 'emoji-smile', 'emoji-smile-fill', 'emoji-smile-upside-down', 'emoji-smile-upside-down-fill', 'emoji-sunglasses', 'emoji-sunglasses-fill', 'emoji-wink', 'emoji-wink-fill', 'envelope', 'envelope-fill', 'envelope-open', 'envelope-open-fill', 'exclamation', 'exclamation-circle', 'exclamation-circle-fill', 'exclamation-diamond', 'exclamation-diamond-fill', 'exclamation-octagon', 'exclamation-octagon-fill', 'exclamation-square', 'exclamation-square-fill', 'exclamation-triangle', 'exclamation-triangle-fill', 'exclude', 'eye', 'eye-fill', 'eye-slash', 'eye-slash-fill', 'eyeglasses',
        'facebook', 'file', 'file-arrow-down', 'file-arrow-down-fill', 'file-arrow-up', 'file-arrow-up-fill', 'file-bar-graph', 'file-bar-graph-fill', 'file-binary', 'file-binary-fill', 'file-break', 'file-break-fill', 'file-check', 'file-check-fill', 'file-code', 'file-code-fill', 'file-diff', 'file-diff-fill', 'file-earmark', 'file-earmark-arrow-down', 'file-earmark-arrow-down-fill', 'file-earmark-arrow-up', 'file-earmark-arrow-up-fill', 'file-earmark-bar-graph', 'file-earmark-bar-graph-fill', 'file-earmark-binary', 'file-earmark-binary-fill', 'file-earmark-break', 'file-earmark-break-fill', 'file-earmark-check', 'file-earmark-check-fill', 'file-earmark-code', 'file-earmark-code-fill', 'file-earmark-diff', 'file-earmark-diff-fill', 'file-earmark-easel', 'file-earmark-easel-fill', 'file-earmark-excel', 'file-earmark-excel-fill', 'file-earmark-fill', 'file-earmark-font', 'file-earmark-font-fill', 'file-earmark-image', 'file-earmark-image-fill', 'file-earmark-lock', 'file-earmark-lock2', 'file-earmark-lock2-fill', 'file-earmark-lock-fill', 'file-earmark-medical', 'file-earmark-medical-fill', 'file-earmark-minus', 'file-earmark-minus-fill', 'file-earmark-music', 'file-earmark-music-fill', 'file-earmark-person', 'file-earmark-person-fill', 'file-earmark-play', 'file-earmark-play-fill', 'file-earmark-plus', 'file-earmark-plus-fill', 'file-earmark-post', 'file-earmark-post-fill', 'file-earmark-ppt', 'file-earmark-ppt-fill', 'file-earmark-richtext', 'file-earmark-richtext-fill', 'file-earmark-ruled', 'file-earmark-ruled-fill', 'file-earmark-slides', 'file-earmark-slides-fill', 'file-earmark-spreadsheet', 'file-earmark-spreadsheet-fill', 'file-earmark-text', 'file-earmark-text-fill', 'file-earmark-word', 'file-earmark-word-fill', 'file-earmark-x', 'file-earmark-x-fill', 'file-earmark-zip', 'file-earmark-zip-fill', 'file-easel', 'file-easel-fill', 'file-excel', 'file-excel-fill', 'file-fill', 'file-font', 'file-font-fill', 'file-image', 'file-image-fill', 'file-lock', 'file-lock2', 'file-lock2-fill', 'file-lock-fill', 'file-medical', 'file-medical-fill', 'file-minus', 'file-minus-fill', 'file-music', 'file-music-fill', 'file-person', 'file-person-fill', 'file-play', 'file-play-fill', 'file-plus', 'file-plus-fill', 'file-post', 'file-post-fill', 'file-ppt', 'file-ppt-fill', 'file-richtext', 'file-richtext-fill', 'file-ruled', 'file-ruled-fill', 'file-slides', 'file-slides-fill', 'file-spreadsheet', 'file-spreadsheet-fill', 'file-text', 'file-text-fill', 'file-word', 'file-word-fill', 'file-x', 'file-x-fill', 'file-zip', 'file-zip-fill', 'files', 'files-alt', 'film', 'filter', 'filter-circle', 'filter-circle-fill', 'filter-left', 'filter-right', 'filter-square', 'filter-square-fill', 'flag', 'flag-fill', 'flower1', 'flower2', 'flower3', 'folder', 'folder2', 'folder2-open', 'folder-check', 'folder-fill', 'folder-minus', 'folder-plus', 'folder-symlink', 'folder-symlink-fill', 'folder-x', 'fonts', 'forward', 'forward-fill', 'front', 'fullscreen', 'fullscreen-exit', 'funnel', 'funnel-fill',
        'gear', 'gear-fill', 'gear-wide', 'gear-wide-connected', 'gem', 'geo', 'geo-alt', 'geo-alt-fill', 'geo-fill', 'gift', 'gift-fill', 'github', 'globe', 'globe2', 'google', 'graph-down', 'graph-up', 'grid', 'grid1x2', 'grid1x2-fill', 'grid3x2', 'grid3x2-gap', 'grid3x2-gap-fill', 'grid3x3', 'grid3x3-gap', 'grid3x3-gap-fill', 'grid-fill', 'grip-horizontal', 'grip-vertical',
        'hammer', 'hand-index', 'hand-index-thumb', 'hand-thumbs-down', 'hand-thumbs-up', 'handbag', 'handbag-fill', 'hash', 'hdd', 'hdd-fill', 'hdd-network', 'hdd-network-fill', 'hdd-rack', 'hdd-rack-fill', 'hdd-stack', 'hdd-stack-fill', 'headphones', 'headset', 'heart', 'heart-fill', 'heart-half', 'heptagon', 'heptagon-fill', 'heptagon-half', 'hexagon', 'hexagon-fill', 'hexagon-half', 'hourglass', 'hourglass-bottom', 'hourglass-split', 'hourglass-top', 'house', 'house-door', 'house-door-fill', 'house-fill', 'hr',
        'image', 'image-alt', 'image-fill', 'images', 'inbox', 'inbox-fill', 'inboxes', 'inboxes-fill', 'info', 'info-circle', 'info-circle-fill', 'info-square', 'info-square-fill', 'input-cursor', 'input-cursor-text', 'instagram', 'intersect',
        'journal', 'journal-album', 'journal-arrow-down', 'journal-arrow-up', 'journal-bookmark', 'journal-bookmark-fill', 'journal-check', 'journal-code', 'journal-medical', 'journal-minus', 'journal-plus', 'journal-richtext', 'journal-text', 'journal-x', 'journals', 'joystick', 'justify', 'justify-left', 'justify-right',
        'kanban', 'kanban-fill', 'key', 'key-fill', 'keyboard', 'keyboard-fill',
        'ladder', 'lamp', 'lamp-fill', 'laptop', 'laptop-fill', 'layers', 'layers-fill', 'layers-half', 'layout-sidebar', 'layout-sidebar-inset', 'layout-sidebar-inset-reverse', 'layout-sidebar-reverse', 'layout-split', 'layout-text-sidebar', 'layout-text-sidebar-reverse', 'layout-text-window', 'layout-text-window-reverse', 'layout-three-columns', 'layout-wtf', 'life-preserver', 'lightning', 'lightning-fill', 'link', 'link45deg', 'linkedin', 'list', 'list-check', 'list-nested', 'list-ol', 'list-stars', 'list-task', 'list-ul', 'lock', 'lock-fill',
        'mailbox', 'mailbox2', 'map', 'map-fill', 'markdown', 'markdown-fill', 'menu-app', 'menu-app-fill', 'menu-button', 'menu-button-fill', 'menu-button-wide', 'menu-button-wide-fill', 'menu-down', 'menu-up', 'mic', 'mic-fill', 'mic-mute', 'mic-mute-fill', 'minecart', 'minecart-loaded', 'moon', 'mouse', 'mouse2', 'mouse3', 'music-note', 'music-note-beamed', 'music-note-list', 'music-player', 'music-player-fill',
        'newspaper', 'node-minus', 'node-minus-fill', 'node-plus', 'node-plus-fill', 'nut', 'nut-fill',
        'octagon', 'octagon-fill', 'octagon-half', 'option', 'outlet',
        'paperclip', 'paragraph', 'patch-check', 'patch-check-fill', 'patch-exclamation', 'patch-exclamation-fill', 'patch-minus', 'patch-minus-fill', 'patch-plus', 'patch-plus-fill', 'patch-question', 'patch-question-fill', 'pause', 'pause-btn', 'pause-btn-fill', 'pause-circle', 'pause-circle-fill', 'pause-fill', 'peace', 'peace-fill', 'pen', 'pen-fill', 'pencil', 'pencil-fill', 'pencil-square', 'pentagon', 'pentagon-fill', 'pentagon-half', 'people', 'people-fill', 'percent', 'person', 'person-badge', 'person-badge-fill', 'person-bounding-box', 'person-check', 'person-check-fill', 'person-circle', 'person-dash', 'person-dash-fill', 'person-fill', 'person-lines-fill', 'person-plus', 'person-plus-fill', 'person-square', 'person-x', 'person-x-fill', 'phone', 'phone-fill', 'phone-landscape', 'phone-landscape-fill', 'phone-vibrate', 'pie-chart', 'pie-chart-fill', 'pip', 'pip-fill', 'play', 'play-btn', 'play-btn-fill', 'play-circle', 'play-circle-fill', 'play-fill', 'plug', 'plug-fill', 'plus', 'plus-circle', 'plus-circle-fill', 'plus-square', 'plus-square-fill', 'power', 'printer', 'printer-fill', 'puzzle', 'puzzle-fill',
        'question', 'question-circle', 'question-circle-fill', 'question-diamond', 'question-diamond-fill', 'question-octagon', 'question-octagon-fill', 'question-square', 'question-square-fill',
        'receipt', 'receipt-cutoff', 'reception0', 'reception1', 'reception2', 'reception3', 'reception4', 'record', 'record2', 'record2-fill', 'record-btn', 'record-btn-fill', 'record-circle', 'record-circle-fill', 'record-fill', 'reply', 'reply-all', 'reply-all-fill', 'reply-fill', 'rss', 'rss-fill',
        'scissors', 'screwdriver', 'search', 'segmented-nav', 'server', 'share', 'share-fill', 'shield', 'shield-check', 'shield-exclamation', 'shield-fill', 'shield-fill-check', 'shield-fill-exclamation', 'shield-fill-minus', 'shield-fill-plus', 'shield-fill-x', 'shield-lock', 'shield-lock-fill', 'shield-minus', 'shield-plus', 'shield-shaded', 'shield-slash', 'shield-slash-fill', 'shield-x', 'shift', 'shift-fill', 'shop', 'shop-window', 'shuffle', 'signpost', 'signpost2', 'signpost2-fill', 'signpost-fill', 'signpost-split', 'signpost-split-fill', 'sim', 'sim-fill', 'skip-backward', 'skip-backward-btn', 'skip-backward-btn-fill', 'skip-backward-circle', 'skip-backward-circle-fill', 'skip-backward-fill', 'skip-end', 'skip-end-btn', 'skip-end-btn-fill', 'skip-end-circle', 'skip-end-circle-fill', 'skip-end-fill', 'skip-forward', 'skip-forward-btn', 'skip-forward-btn-fill', 'skip-forward-circle', 'skip-forward-circle-fill', 'skip-forward-fill', 'skip-start', 'skip-start-btn', 'skip-start-btn-fill', 'skip-start-circle', 'skip-start-circle-fill', 'skip-start-fill', 'slack', 'slash', 'slash-circle', 'slash-circle-fill', 'slash-square', 'slash-square-fill', 'sliders', 'smartwatch', 'sort-alpha-down', 'sort-alpha-down-alt', 'sort-alpha-up', 'sort-alpha-up-alt', 'sort-down', 'sort-down-alt', 'sort-numeric-down', 'sort-numeric-down-alt', 'sort-numeric-up', 'sort-numeric-up-alt', 'sort-up', 'sort-up-alt', 'soundwave', 'speaker', 'speaker-fill', 'spellcheck', 'square', 'square-fill', 'square-half', 'star', 'star-fill', 'star-half', 'stickies', 'stickies-fill', 'sticky', 'sticky-fill', 'stop', 'stop-btn', 'stop-btn-fill', 'stop-circle', 'stop-circle-fill', 'stop-fill', 'stoplights', 'stoplights-fill', 'stopwatch', 'stopwatch-fill', 'subtract', 'suit-club', 'suit-club-fill', 'suit-diamond', 'suit-diamond-fill', 'suit-heart', 'suit-heart-fill', 'suit-spade', 'suit-spade-fill', 'sun', 'sunglasses',
        'table', 'tablet', 'tablet-fill', 'tablet-landscape', 'tablet-landscape-fill', 'tag', 'tag-fill', 'tags', 'tags-fill', 'telephone', 'telephone-fill', 'telephone-forward', 'telephone-forward-fill', 'telephone-inbound', 'telephone-inbound-fill', 'telephone-minus', 'telephone-minus-fill', 'telephone-outbound', 'telephone-outbound-fill', 'telephone-plus', 'telephone-plus-fill', 'telephone-x', 'telephone-x-fill', 'terminal', 'terminal-fill', 'text-center', 'text-indent-left', 'text-indent-right', 'text-left', 'text-paragraph', 'text-right', 'textarea', 'textarea-resize', 'textarea-t', 'thermometer', 'thermometer-half', 'three-dots', 'three-dots-vertical', 'toggle2-off', 'toggle2-on', 'toggle-off', 'toggle-on', 'toggles', 'toggles2', 'tools', 'trash', 'trash2', 'trash2-fill', 'trash-fill', 'tree', 'tree-fill', 'triangle', 'triangle-fill', 'triangle-half', 'trophy', 'trophy-fill', 'truck', 'truck-flatbed', 'tv', 'tv-fill', 'twitch', 'twitter', 'type', 'type-bold', 'type-h1', 'type-h2', 'type-h3', 'type-italic', 'type-strikethrough', 'type-underline',
        'ui-checks', 'ui-checks-grid', 'ui-radios', 'ui-radios-grid', 'union', 'unlock', 'unlock-fill', 'upc', 'upc-scan', 'upload',
        'vector-pen', 'view-list', 'view-stacked', 'vinyl', 'vinyl-fill', 'voicemail', 'volume-down', 'volume-down-fill', 'volume-mute', 'volume-mute-fill', 'volume-off', 'volume-off-fill', 'volume-up', 'volume-up-fill', 'vr',
        'wallet', 'wallet2', 'wallet-fill', 'watch', 'wifi', 'wifi1', 'wifi2', 'wifi-off', 'window', 'wrench',
        'x', 'x-circle', 'x-circle-fill', 'x-diamond', 'x-diamond-fill', 'x-octagon', 'x-octagon-fill', 'x-square', 'x-square-fill',
        'youtube',
        'zoom-in', 'zoom-out'
    ];

    globalEvents = [
        {
            value: 'component-hovered',
            text: 'args: [componentId, isHovered]'
        },
        {
            value: 'plugin-toggled',
            text: 'args: [plugin, isToggled]'
        },
        {
            value: 'route-changed',
            text: 'args: [from, to]'
        },
        {
            value: 'screen-resized',
            text: 'args: []'
        },
        {
            value: 'set-user',
            text: 'args: [user]'
        },
        {
            value: 'synchronized',
            text: 'args: [synchronizationResult]'
        },
        {
            value: 'tick',
            text: 'args: [tickValueInSeconds]'
        },

    ];

    tick = 0;
    locked = false;
    uis = [];
    attributes = {};
    editMode = false;
    offlineMode = false;
    domainModels = {};
    selectedComponentId = undefined;
    targetedComponentId = undefined;
    hoveredComponentId = undefined;
    clipboard = undefined;
    applicationLoaded = false;
    user = undefined;
    sync = undefined;
    colors = undefined;
    availablePlugins = [
        'assets/plugins/google-authentication.js',
        'assets/plugins/backend4dlite-connector.js'
    ];
    componentTools = [
        {type: "HttpConnector", label: "Http Endpoint", category: "data-sources"},
        {type: "CookieConnector", label: "Cookie", category: "data-sources"},
        {type: "LocalStorageConnector", label: "Storage", category: "data-sources"},
        {type: "DataMapper", label: "Data mapper", category: "data-sources"},

        {type: "TextView", label: "Text/HTML", category: "basic-components"},
        {type: "CheckboxView", label: "Checkbox", category: "basic-components"},
        {type: "SelectView", label: "Select", category: "basic-components"},
        {type: "InputView", label: "Input", category: "basic-components"},
        {type: "ButtonView", label: "Button", category: "basic-components"},
        {type: "ImageView", label: "Image", category: "basic-components"},
        {type: "IconView", label: "Icon", category: "basic-components"},

        {type: "TableView", label: "Table", category: "advanced-components"},
        {type: "CardView", label: "Card", category: "advanced-components"},
        {type: "ChartView", label: "Chart", category: "advanced-components"},
        {type: "TimeSeriesChartView", label: "Time series", category: "advanced-components"},
        {type: "DialogView", label: "Dialog", category: "advanced-components"},
        {type: "PopoverView", label: "Popover", category: "advanced-components"},
        {type: "DatepickerView", label: "Date picker", category: "advanced-components"},
        {type: "TimepickerView", label: "Time picker", category: "advanced-components"},
        {type: "PaginationView", label: "Pagination", category: "advanced-components"},
        {type: "PdfView", label: "PDF Viewer", category: "advanced-components"},
        {type: "EmbedView", label: "Embed", category: "advanced-components"},
        {type: "CarouselView", label: "Carousel", category: "advanced-components"},

        {type: "ContainerView", label: "Container", category: "layout"},
        {type: "SplitView", label: "Split", category: "layout"},
        {type: "IteratorView", label: "Iterator", category: "layout"},

        {type: "instance-form-builder", label: "Instance form", category: "builders"},
        {type: "collection-editor-builder", label: "Collection editor", category: "builders"},
        {type: "login-form-builder", label: "Login form", category: "builders"},
        {type: "raw-builder", label: "Generic", category: "builders"}
    ];

    constructor() {
        this.sync = new Sync(() => {
                console.info("AUTHORIZATION ERROR!!!");
                this.setUser(undefined);
            },
            document.location.protocol + '//' + document.location.host + "/api"
        );
        this.attributes = {};
        this.setAttribute('leftSidebarState', 'open');
        this.setAttribute('rightSidebarState', 'open');
        Vue.prototype.$eventHub.$on('edit', (event) => {
            this.editMode = event;
            console.info("switch edit", this.editMode);
            this.targetedComponentId = undefined;
            document.querySelectorAll(".targeted").forEach(element => element.classList.remove("targeted"));
            if (this.editMode) {
                document.querySelector(".root-container").classList.add("targeted");
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        });
        this.locked = parameters.get('locked') === 'true';
        this.colors = {
            selection: '#0088AA',
            highlight: 'highlight'
        }
    }

    setUser(user) {
        this.user = user;
        document.title = $tools.camelToLabelText(applicationModel.name) + (user ? ' [' + user.login + ']' : '');
        Vue.prototype.$eventHub.$emit('set-user', user);
    }

    registerSignInFunction(signInFunction) {
        Vue.prototype.$eventHub.$on('sign-in-request', signInFunction);
    }

    unregisterSignInFunction(signInFunction) {
        Vue.prototype.$eventHub.$off('sign-in-request', signInFunction);
    }

    /**
     * Triggers a sign-in request by emitting the global 'sign-in-request' event.
     */
    signInRequest() {
        Vue.prototype.$eventHub.$emit('sign-in-request');
    }

    reportError(level, title, description) {
        Vue.prototype.$eventHub.$emit('report-error', level, title, description);
    }

    getPluginIdentifier(plugin) {
        let chunks = plugin.split('/');
        return $tools.kebabToCamelCase(chunks[chunks.length - 1].split('.')[0], true);
    }

    togglePlugin(plugin) {
        if (!applicationModel.plugins) {
            applicationModel.plugins = [];
        }
        if (applicationModel.plugins.indexOf(plugin) > -1) {
            applicationModel.plugins.splice(applicationModel.plugins.indexOf(plugin), 1);
            Vue.prototype.$eventHub.$emit('plugin-toggled', plugin, false);
            console.info("stopping plugin", this.getPluginIdentifier(plugin));
            if (window.plugins[this.getPluginIdentifier(plugin)]) {
                window.plugins[this.getPluginIdentifier(plugin)].stop();
            }
        } else {
            applicationModel.plugins.push(plugin);
            Vue.prototype.$eventHub.$emit('plugin-toggled', plugin, true);
            $tools.loadScript(plugin);
        }
    }

    pluginLoaded(pluginIdentifier) {
        console.info("starting plugin", pluginIdentifier);
        if (window.plugins[pluginIdentifier]) {
            window.plugins[pluginIdentifier].start();
        }
    }

    removeComponentTool(type) {
        let index = this.componentTools.findIndex(tool => tool.type === type);
        if (index > -1) {
            this.componentTools.splice(index, 1);
        }
    }

    isPluginActive(plugin) {
        return applicationModel.plugins && applicationModel.plugins.indexOf(plugin) > -1;
    }

    async start() {
        await ide.connectToServer();

        if (window.bundledApplicationModel) {
            ide.locked = true;
            await ide.loadApplicationContent(window.bundledApplicationModel);
        } else {
            if (parameters.get('src')) {
                console.info("src", parameters.get('src'));
                await ide.loadUrl(parameters.get('src'));
            } else {
                await ide.loadUI();
            }
        }
        start();
    }

    setEditMode(editMode) {
        Vue.prototype.$eventHub.$emit('edit', editMode);
    }

    selectComponent(cid) {
        console.info("ide.select", cid);
        this.selectedComponentId = cid;
        setTimeout(() => {
            Vue.prototype.$eventHub.$emit('component-selected', cid);
        }, 100);
    }

    hoverComponent(cid) {
        if (this.hoveredComponentId) {
            Vue.prototype.$eventHub.$emit('component-hovered', this.hoveredComponentId, false);
        }
        this.hoveredComponentId = cid;
        if (cid) {
            Vue.prototype.$eventHub.$emit('component-hovered', cid, true);
        }
    }

    setAttribute(name, value) {
        this.attributes[name] = value;
    }

    getAttribute(name) {
        return this.attributes[name];
    }

    getComponentIcon(type) {
        return `assets/component-icons/${Tools.camelToKebabCase(type)}.png`
    }

    getApplicationContent() {
        return JSON.stringify({
            applicationModel: applicationModel,
            roots: components.getRoots()
        }, undefined, 2);
    }

    async save() {
        if (!userInterfaceName) {
            userInterfaceName = 'default';
        }
        applicationModel.versionIndex = versionIndex;
        applicationModel.name = userInterfaceName;
        let formData = new FormData();
        const contents = this.getApplicationContent();
        formData.append('userInterfaceName', userInterfaceName);
        formData.append('model', contents);

        fetch(baseUrl + '/saveUserInterface', {
            method: "POST",
            body: formData
        });
    }

    isFileDirty() {
        return applicationModel && this.savedFileModel !== this.getApplicationContent();
    }

    isBrowserDirty() {
        return applicationModel && this.savedBrowserModel !== this.getApplicationContent();
    }

    async saveFile() {
        applicationModel.versionIndex = versionIndex;
        applicationModel.name = userInterfaceName;

        const content = this.getApplicationContent();

        // const options = {
        //     types: [
        //         {
        //             description: 'DLite applications',
        //             accept: {
        //                 'application/dlite': ['.dlite']
        //             },
        //         },
        //     ],
        //     suggestedName: userInterfaceName + ".dlite"
        // };
        // const fileHandle = await window.showSaveFilePicker(options);
        //
        // const writable = await fileHandle.createWritable();
        // await writable.write(contents);
        // await writable.close();

        Tools.download(content.replaceAll("</script>", '<\\/script>'), userInterfaceName + ".dlite", "application/dlite");
        this.savedFileModel = content;
        Vue.prototype.$eventHub.$emit('application-saved');
    }

    saveInBrowser() {
        applicationModel.versionIndex = versionIndex;
        applicationModel.name = userInterfaceName;

        const content = this.getApplicationContent();

        let applications = JSON.parse(localStorage.getItem('dlite.ide.apps'));
        if (!applications) {
            applications = {};
        }

        applications[userInterfaceName] = content;
        localStorage.setItem('dlite.ide.apps', JSON.stringify(applications));

        let myApps = JSON.parse(localStorage.getItem('dlite.ide.myApps'));
        if (!myApps) {
            myApps = [];
        }

        let myApp = myApps.find(app => app.name == userInterfaceName);

        if (!myApp) {
            myApp = {};
            myApps.push(myApp);
            myApp.name = userInterfaceName;
            myApp.description = userInterfaceName;
            myApp.url = 'localstorage:' + userInterfaceName;
            myApp.icon = 'assets/app-icons/no_image.png';
        }

        localStorage.setItem('dlite.ide.myApps', JSON.stringify(myApps));
        this.savedBrowserModel = content;
        Vue.prototype.$eventHub.$emit('application-saved');

    }

    loadFile(callback) {
        // const pickerOpts = {
        //     types: [
        //         {
        //             description: 'DLite applications',
        //             accept: {
        //                 'application/dlite': ['.dlite']
        //             }
        //         },
        //     ],
        //     excludeAcceptAllOption: true,
        //     multiple: false
        // };
        // // open file picker
        // window.showOpenFilePicker(pickerOpts).then(([fileHandle]) => {
        //     fileHandle.getFile().then(fileData => {
        //         fileData.text().then(content => {
        //             console.info("loaded", content);
        //             let contentObject = JSON.parse(content);
        //             this.loadApplicationContent(contentObject, callback);
        //         })
        //     })
        // });
        Tools.upload(content => {
            console.info("loaded", content);
            let contentObject = JSON.parse(content);
            this.loadApplicationContent(contentObject, callback);
        });
    }

    detachComponent(cid) {
        if (!cid) {
            throw new Error("undefined cid");
        }
        // TODO: first change component models only, then detach
        const containerView = components.getContainerView(cid);
        let parentComponentModel = components.getComponentModel(containerView.$parent.cid)
        let keyInParent = containerView.keyInParent;
        console.info("deleting", containerView.cid, keyInParent, JSON.stringify(parentComponentModel));
        if (Array.isArray(parentComponentModel[keyInParent])) {
            if (containerView.indexInKey === undefined) {
                Vue.prototype.$bvToast.toast("Cannot remove component - undefined index for array key", {
                    title: `Component not removed`,
                    variant: 'warning',
                    autoHideDelay: 3000,
                    solid: false
                });

                throw new Error("undefined index for array key");
            }
            parentComponentModel[keyInParent].splice(containerView.indexInKey, 1);
        } else {
            parentComponentModel[keyInParent] = undefined;
        }
        this.selectComponent(undefined);
        this.hideOverlays();
        // Vue.prototype.$bvToast.toast("Successfully moved component to the trash.", {
        //     title: `Component trashed`,
        //     variant: 'success',
        //     autoHideDelay: 2000,
        //     solid: false
        // });
    }

    deleteComponent(cid) {
        console.info('delete component', cid);
        if (!cid) {
            throw new Error("undefined cid");
        }
        const containerView = components.getContainerView(cid);
        if (containerView != null) {
            this.detachComponent(cid);
        }
        components.deleteComponentModel(cid);
        this.selectComponent(undefined);
    }

    copyComponent(cid) {
        console.info('copy component', cid);
        if (!cid) {
            throw new Error("undefined cid");
        }
        localStorage.setItem('dlite.clipboard', JSON.stringify($c(cid).viewModel));
    }

    pasteComponent() {
        console.info('paste');
        if (localStorage.getItem('dlite.clipboard') == null) {
            throw new Error("empty clipboard");
        }
        if (!this.getTargetLocation()) {
            throw new Error("no target location");
        }
        const template = components.registerTemplate(JSON.parse(localStorage.getItem('dlite.clipboard')));
        components.setChild(ide.getTargetLocation(), template);
    }

    async loadUrl(url) {
        if (url.startsWith('localstorage:')) {
            try {
                let name = url.split(':')[1];
                console.info("name", name);
                let appsItem = localStorage.getItem('dlite.ide.apps');
                console.info("appsItem", appsItem);
                let apps = JSON.parse(appsItem);
                console.info("apps", apps);
                await this.loadApplicationContent(JSON.parse(apps[name]));
            } catch (e) {
                alert(`Source file at ${url} failed to be loaded.`);
                console.error(e);
                await this.loadUI();
            }
        } else {
            await fetch(url)
                .then(res => res.json())
                .then(async (json) => {
                    console.info("loadurl", json);
                    await this.loadApplicationContent(json);
                })
                .catch(async err => {
                    console.error(err);
                    alert(`Source project file at ${url} failed to be loaded. Check the URL or the CORS policies from the server.`);
                    await this.loadUI();
                });
        }
    }

    createAndLoad(userInterfaceName) {
        if (userInterfaceName) {
            let url = window.location.origin + window.location.pathname + "?ui=" + userInterfaceName;
            if (backend) {
                url += '&backend=' + backend;
            }
            window.location.href = url;
        }
    }

    load(userInterfaceName, pageName) {
        if (userInterfaceName) {
            let url = undefined;
            if (pageName) {
                url = window.location.origin + window.location.pathname + "?ui=" + userInterfaceName + "#/" + pageName;
            } else {
                url = window.location.origin + window.location.pathname + "?ui=" + userInterfaceName;
            }
            if (url) {
                if (backend) {
                    url += '&backend=' + backend;
                }
                window.location.href = url;
            }
        }
    }

    setStyleUrl(url, darkMode) {
        console.info("set style", url, darkMode);
        if (document.getElementById('bootstrap-css').href !== url) {
            document.getElementById('bootstrap-css').href = url;
        }
        applicationModel.bootstrapStylesheetUrl = url;
        applicationModel.darkMode = darkMode;
        let style = getComputedStyle(document.body);
        setTimeout(() => {
            PRIMARY = this.colors.primary = style.getPropertyValue('--primary');
            SECONDARY = this.colors.secondary = style.getPropertyValue('--secondary');
            SUCCESS = this.colors.success = style.getPropertyValue('--success');
            INFO = this.colors.info = style.getPropertyValue('--info');
            WARNING = this.colors.warning = style.getPropertyValue('--warning');
            DANGER = this.colors.danger = style.getPropertyValue('--danger');
            LIGHT = this.colors.light = style.getPropertyValue('--light');
            DARK = this.colors.dark = style.getPropertyValue('--dark');
            DARK_MODE = darkMode;
        }, 5000);
        Vue.prototype.$eventHub.$emit('style-changed');
    }

    setStyle(styleName, darkMode) {
        if (styleName === undefined) {
            this.setStyleUrl("assets/ext/bootstrap@4.5.3.min.css", false);
        } else {
            this.setStyleUrl(`assets/ext/themes/${styleName}.css`, darkMode);
        }
    }

    isDarkMode() {
        return applicationModel.darkMode ? true : false;
    }

    setTargetMode() {
        if (!this.selectedComponentId) {
            console.warn("invalid state for setTargetMode");
            return;
        }
        // if (this.targetedComponentId) {
        document.querySelectorAll(".targeted").forEach(element => element.classList.remove("targeted", "targeted-bg-dark", "targeted-bg"));
        if (this.targetedComponentId === this.selectedComponentId) {
            document.querySelector(".root-container").classList.add("targeted");
            this.targetedComponentId = undefined;
            Vue.prototype.$eventHub.$emit('component-targeted', undefined);
        } else {
            this.targetedComponentId = this.selectedComponentId;
            Vue.prototype.$eventHub.$emit('component-targeted', this.targetedComponentId);
            try {
                components.getHtmlElement(this.targetedComponentId).classList.add("targeted");
                components.getHtmlElement(this.targetedComponentId).classList.add(this.isDarkMode() ? "targeted-bg-dark" : "targeted-bg");
            } catch (e) {
            }
        }
        // } else {
        //     this.targetedComponentId = this.selectedComponentId;
        //     Vue.prototype.$eventHub.$emit('component-targeted', this.targetedComponentId);
        //     try {
        //         components.getHtmlElement(this.targetedComponentId).classList.add("targeted");
        //     } catch (e) {
        //     }
        // }

    }

    setTargetLocation(targetLocation) {
        this.targetLocation = targetLocation;
        setTimeout(() => {
            Vue.prototype.$eventHub.$emit('target-location-selected', targetLocation);
        }, 100);
    }

    getTargetLocation() {
        return this.targetLocation;
    }

    startWebSocketConnection() {
        console.log("Starting connection to WebSocket Server");
        this.wsConnection = new WebSocket(`ws://${backend}/ws/`);
        this.wsConnection.onopen = (event) => {
            console.log(`Successfully connected to the ${backend} websocket server.`)
        };

        this.wsConnection.onerror = (error) => {
            console.error(`Websocket with ${backend} encountered an error, closing :`, error);
            this.wsConnection.close();
        };

        this.wsConnection.onclose = () => {
            console.error(`Websocket is closed, attempting to reopen in 2 seconds...`);
            setTimeout(() => {
                this.startWebSocketConnection();
            }, 2000);
        };

        this.wsConnection.onmessage = (event) => {
            const data = JSON.parse(event.data);
            Vue.prototype.$eventHub.$emit(data.name, data);
        };
    }

    loadApplicationContent(contentObject, callback) {
        console.info("loading", contentObject);
        applicationModel = contentObject.applicationModel;
        if (applicationModel.name) {
            userInterfaceName = applicationModel.name;
            if (this.uis.indexOf(userInterfaceName) === -1) {
                this.uis.push(userInterfaceName);
            }
        }
        if (applicationModel.versionIndex !== versionIndex) {
            alert(`Application version index (${applicationModel.versionIndex}), does not match the IDE version index (${versionIndex}). Some features may not work properly or lack support.`);
        }
        applicationModel.navbar = contentObject.roots.find(c => c.cid === 'navbar');
        components.loadRoots(contentObject.roots);
        this.initApplicationModel();
        console.info("application loaded", applicationModel);
        this.applicationLoaded = true;
        Vue.prototype.$eventHub.$emit('application-loaded');
        let content = this.getApplicationContent();
        this.savedFileModel = content;
        this.savedBrowserModel = content;
        setTimeout(() => {
            window.parent.postMessage({
                applicationName: applicationModel.name,
                type: 'APPLICATION_LOADED'
            }, '*');
        });
        if (callback) {
            callback();
        }
    }

    async connectToServer() {
        await fetch(baseUrl + '/uis', {
            method: "GET"
        })
            .then(response => response.json())
            .then(async uis => {
                console.log("uis", JSON.stringify(uis, null, 4));
                ide.uis = uis;
                this.offlineMode = false;
                Vue.prototype.$eventHub.$emit('offline-mode', false);
                try {
                    ide.startWebSocketConnection();
                } catch (e) {
                    console.error(e);
                }
                await this.fetchDomainModel();
            })
            .catch(error => {
                console.error("error connecting to server", error);
                this.offlineMode = true;
                Vue.prototype.$eventHub.$emit('offline-mode', true);
            });
    }

    createBlankProject() {
        console.error('creating blank project');
        applicationModel =
            {
            "navbar": {
                "cid": "navbar",
                "type": "NavbarView",
                "brand": "App name",
                "defaultPage": "index",
                "navigationItems": [
                    {
                        "pageId": "index",
                        "label": "Index"
                    }
                ],
                "eventHandlers": []
            },
            "autoIncrementIds": {},
            "name": "default"
        };
        components.fillComponentModelRepository(applicationModel);
        let content = this.getApplicationContent();
        this.savedFileModel = content;
        this.savedBrowserModel = content;
        this.editMode = true;
        ide.uis = ["default"];
    }

    async loadUI() {
        if (this.offlineMode) {
            this.createBlankProject();
        } else {
            await fetch(baseUrl + '/index/?ui=' + userInterfaceName, {
                method: "GET",
                mode: "cors"
            })
                .then(response => response.json())
                .then(contentObject => {

                    if (contentObject != null) {
                        this.loadApplicationContent(contentObject);
                    }
                });
        }
    }

    getDomainModel(serverBaseUrl) {
        if (!serverBaseUrl) {
            serverBaseUrl = baseUrl;
        }
        if (this.domainModels[serverBaseUrl] === undefined) {
            this.fetchDomainModel(serverBaseUrl);
        }
        return this.domainModels[serverBaseUrl] === undefined ? {} : this.domainModels[serverBaseUrl];
    }


    async fetchDomainModel(serverBaseUrl) {
        if (!serverBaseUrl) {
            serverBaseUrl = baseUrl;
        }
        await fetch(serverBaseUrl + '/model', {
            method: "GET"
        })
            .then(response => response.json())
            .then(model => {
                console.log("model", JSON.stringify(model, null, 4));
                this.domainModels[serverBaseUrl] = model;
            })
            .catch(error => {
                this.domainModels[serverBaseUrl] = {};
            });
    }

    initApplicationModel() {

        console.info("init application model", applicationModel);

        document.title = $tools.camelToLabelText(applicationModel.name) + (this.user ? '[' + this.user.login + ']' : '');

        if (parameters.get('styleUrl')) {
            ide.setStyleUrl(parameters.get('styleUrl'), parameters.get('darkMode'));
        } else {
            if (!applicationModel.bootstrapStylesheetUrl) {
                ide.setStyle("superhero", true);
            }

            if (applicationModel.bootstrapStylesheetUrl) {
                ide.setStyleUrl(applicationModel.bootstrapStylesheetUrl, applicationModel.darkMode);
            }
        }

        if (applicationModel.navbar && !applicationModel.navbar.eventHandlers) {
            applicationModel.navbar.eventHandlers = [];
        }

        if (ide.router) {

            let defaultPage = applicationModel.navbar.defaultPage || applicationModel.defaultPage || 'index';
            let navigationItems = applicationModel.navbar.navigationItems;

            ide.router.addRoute({path: "/", redirect: applicationModel.defaultPage});

            navigationItems.forEach(nav => {
                if (nav.pageId && nav.pageId !== "" && (nav.kind === undefined || nav.kind === "Page")) {
                    console.info("add route to page '" + nav.pageId + "'");
                    ide.router.addRoute({
                        name: nav.pageId,
                        path: "/" + nav.pageId,
                        component: Vue.component('page-view')
                    });
                }
            });

            ide.router.addRoute({path: "*", redirect: defaultPage});

            if (!applicationModel.navbar.navigationItems.find(navItem => navItem.pageId === ide.router.currentRoute.name)) {
                ide.router.push({name: defaultPage});
            }

            console.info('initialized application router', ide.router);
        }

        if (applicationModel.synchronizationServerBaseUrl && document.location.host.indexOf('localhost') === -1) {
            this.sync.baseUrl = applicationModel.synchronizationServerBaseUrl;
        }

        if (applicationModel.plugins) {
            applicationModel.plugins.forEach(plugin => {
                console.info("loading plugin", plugin);
                $tools.loadScript(plugin);
            });
        }

    }

    async authenticate(login, password) {
        console.info("authenticating user", login);
        let baseUrl = this.sync.baseUrl;
        if (applicationModel.authenticationServerBaseUrl) {
            baseUrl = applicationModel.authenticationServerBaseUrl;
        }
        const response = await fetch(`${baseUrl}/authenticate.php?user=${login}&password=${password}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        console.info("authentication result", result);
        if (result['authorized'] && result['user']) {
            this.setUser(result.user);
            this.synchronize();
        } else {
            this.setUser(undefined);
            ide.reportError("danger", "Authentication error", "Invalid user name or password");
        }
        this.storeCurrentUser();
        return result;
    }

    async signOut() {
        await this.synchronize();
        this.setUser(undefined);
        this.storeCurrentUser();
        const response = await fetch(`${baseUrl}/logout.php?user=${login}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        console.info("logout result", result);
    }

    /**
     * Stores the current user in a cookie.
     */
    storeCurrentUser() {
        if (this.user == null) {
            Tools.deleteCookie("dlite.user");
        } else {
            Tools.setCookie("dlite.user", JSON.stringify(this.user));
        }
    }

    isInFrame () {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    async synchronize() {
        if (!this.user) {
            return;
        }
        let lastSyncUserId = localStorage.getItem('dlite.lastSyncUserId');
        if (lastSyncUserId != null && lastSyncUserId != this.user.id) {
            console.info("changed user - clear local storage data");
            localStorage.clear();
        }
        try {
            this.sync.userId = this.user.login;
            let pullResult = await this.sync.pull();
            await this.sync.push();
            localStorage.setItem('dlite.lastSyncUserId', this.user.id);
            Vue.prototype.$eventHub.$emit('synchronized', pullResult);
        } catch (e) {
            console.error('synchronization error', e);
        }
    }

    updateHoverOverlay(cid) {
        let hoverOverlay = document.getElementById('hoverOverlay');
        if (!hoverOverlay) {
            return;
        }
        if (!ide.editMode || !cid) {
            hoverOverlay.style.display = 'none';
        } else {
            let componentElement = document.getElementById(cid);
            if (!componentElement) {
                hoverOverlay.style.display = 'none';
                return;
            }
            let eventShieldOverlay = document.getElementById('eventShieldOverlay');
            const rect = componentElement.getBoundingClientRect();
            eventShieldOverlay.style.top = hoverOverlay.style.top = (rect.top - 2) + 'px';
            eventShieldOverlay.style.left = hoverOverlay.style.left = (rect.left - 2) + 'px';
            eventShieldOverlay.style.width = hoverOverlay.style.width = (rect.width + 4) + 'px';
            eventShieldOverlay.style.height = hoverOverlay.style.height = (rect.height + 4) + 'px';
            hoverOverlay.style.backgroundColor = this.colors.selection;
            if (ide.selectedComponentId == cid) {
                hoverOverlay.style.display = 'none';
            }
        }
    }

    showHoverOverlay() {
        let hoverOverlay = document.getElementById('hoverOverlay');
        if (!ide.editMode || !hoverOverlay) {
            return;
        }
        hoverOverlay.style.display = 'block';
    }

    updateSelectionOverlay(cid) {
        if (!cid) {
            return;
        }
        let selectionOverlay = document.getElementById('selectionOverlay');
        if (!ide.editMode || !selectionOverlay) {
            return;
        }
        let componentElement = document.getElementById(cid);
        if (!componentElement) {
            return;
        }
        const rect = componentElement.getBoundingClientRect();
        selectionOverlay.style.top = (rect.top - 2) + 'px';
        selectionOverlay.style.left = (rect.left - 2) + 'px';
        selectionOverlay.style.width = (rect.width + 4) + 'px';
        selectionOverlay.style.height = (rect.height + 4) + 'px';
        selectionOverlay.style.borderColor = this.colors.selection;
    }

    showSelectionOverlay() {
        let selectionOverlay = document.getElementById('selectionOverlay');
        if (!ide.editMode || !selectionOverlay) {
            return;
        }
        selectionOverlay.style.display = 'block';
    }

    hideOverlays() {
        let hoverOverlay = document.getElementById('hoverOverlay');
        if (hoverOverlay) {
            hoverOverlay.style.display = 'none';
        }
        let selectionOverlay = document.getElementById('selectionOverlay');
        if (selectionOverlay) {
            selectionOverlay.style.display = 'none';
        }
    }

}

let ide = new IDE();

function start() {
    Vue.component('main-layout', {
        template: `
        <div :style="contentFillHeight()?'height:100vh':''">

            <div id="eventShieldOverlay" draggable @dragstart="startDrag($event)"></div>
            
            <b-modal v-if="edit" id="models-modal" title="Model editor" size="xl">
              <b-embed id="models-iframe" src="?locked=true&src=assets/apps/models.dlite#/?embed=true"></b-embed>
            </b-modal> 

            <b-modal v-if="edit" id="storage-modal" title="Storage manager" size="xl">
              <b-embed id="storage-iframe" src="?locked=true&src=assets/apps/storage.dlite#/?embed=true"></b-embed>
            </b-modal> 

            <b-modal v-if="edit" id="settings-modal" title="Project settings" size="xl">
                <b-form-group label="Project file name" label-for="header" 
                    label-size="sm" label-class="mb-0" class="mb-1"
                >
                    <b-form-input v-model="userInterfaceName" style="display:inline-block" size="sm" @change="changeName"></b-form-input>
                </b-form-group>
                
                <b-form-group label="Synchronization server base URL" label-for="header" 
                    label-size="sm" label-class="mb-0" class="mb-1"
                >
                    <b-form-input v-model="viewModel.synchronizationServerBaseUrl" style="display:inline-block" size="sm"></b-form-input>
                </b-form-group>

                <b-form-group label="Authentication server base URL" label-for="header" 
                    label-size="sm" label-class="mb-0" class="mb-1"
                >
                    <b-form-input v-model="viewModel.authenticationServerBaseUrl" style="display:inline-block" size="sm"></b-form-input>
                </b-form-group>
                
                <b-form-group label="Additional header code" label-for="header" 
                    label-size="sm" label-class="mb-0" class="mb-1"
                    description="HTML code to be inserted in the header of the application once deployed (not in development mode) - to be used with caution"
                >
                    <b-form-textarea id="header" size="sm" :rows="20" 
                        v-model="viewModel.additionalHeaderCode"></b-form-textarea>
                </b-form-group>
            </b-modal> 

            <b-modal id="sign-in-modal" title="Sign in" size="sm" @ok="doSignIn">
                <b-form-group label="User login / email" label-for="header" 
                    label-size="sm" label-class="mb-0" class="mb-1"
                >
                    <b-form-input v-model="userLogin" style="display:inline-block"></b-form-input>
                </b-form-group>
                <b-form-group label="User password" label-for="header" 
                    label-size="sm" label-class="mb-0" class="mb-1"
                >
                    <b-form-input v-model="userPassword" type="password" style="display:inline-block" @keypress.native.enter="doSignIn"></b-form-input>
                </b-form-group>

            </b-modal> 
            
            <b-button v-if="!edit && !isLocked()" pill size="sm" class="shadow" style="position:fixed; z-index: 10000; right: 1em; top: 1em" v-on:click="setEditMode(!edit)"><b-icon :icon="edit ? 'play' : 'pencil'"></b-icon></b-button>
            <b-button v-if="edit && !isLocked()" pill size="sm" class="shadow show-mobile" style="position:fixed; z-index: 10000; right: 1em; top: 1em" v-on:click="$eventHub.$emit('edit', !edit)"><b-icon :icon="edit ? 'play' : 'pencil'"></b-icon></b-button>
             
            <b-navbar :style="'visibility: ' + (edit && loaded ? 'visible' : 'hidden')" class="show-desktop shadow" ref="ide-navbar" id="ide-navbar" type="dark" variant="dark" fixed="top">
                <b-navbar-nav>
                    <b-navbar-brand :href="basePath">
                        <b-img :src="'assets/images/logo-dlite-2-white.svg'" alt="DLite" class="align-top" style="height: 1.5rem;"></b-img>
                    </b-navbar-brand>            
                  <b-nav-item-dropdown text="File" left lazy>
                    <b-dropdown-item :disabled="!isFileDirty()" @click="saveFile"><b-icon icon="download" class="mr-2"></b-icon>Save project file</b-dropdown-item>
                    <b-dropdown-item @click="loadFile2"><b-icon icon="upload" class="mr-2"></b-icon>Load project file</b-dropdown-item>
                    <b-dropdown-item :disabled="!isBrowserDirty()"  @click="saveInBrowser"><b-icon icon="download" class="mr-2"></b-icon>Save project in browser</b-dropdown-item>
                    <div v-show="!offlineMode" class="dropdown-divider"></div>                    
                    <b-dropdown-item v-show="!offlineMode" @click="save" class="mr-2"><b-icon icon="cloud-upload" class="mr-2"></b-icon>Save project to the server</b-dropdown-item>
                    <b-dropdown-item v-show="!offlineMode" @click="load" class="mr-2"><b-icon icon="cloud-download" class="mr-2"></b-icon>Load project from the server</b-dropdown-item>
                    <div class="dropdown-divider"></div>                    
                    <b-dropdown-item :disabled="!loggedIn" @click="synchronize"><b-icon icon="arrow-down-up" class="mr-2"></b-icon>Synchronize</b-dropdown-item>
                    <div class="dropdown-divider"></div>                    
                    <b-dropdown-item @click="openSettings"><b-icon icon="gear" class="mr-2"></b-icon>Project settings</b-dropdown-item>
                  </b-nav-item-dropdown>
            
                  <b-nav-item-dropdown text="Edit" left lazy>
                    <b-dropdown-item :disabled="selectedComponentId ? undefined : 'disabled'" @click="copyComponent">Copy</b-dropdown-item>
                    <b-dropdown-item :disabled="canPaste() ? undefined : 'disabled'" @click="pasteComponent">Paste</b-dropdown-item>
                    <b-dropdown-item :disabled="selectedComponentId ? undefined : 'disabled'" @click="detachComponent"><b-icon icon="trash" class="mr-2"></b-icon>Trash</b-dropdown-item>
                    <div class="dropdown-divider"></div>
                    <b-dropdown-item @click="emptyTrash">Empty trash</b-dropdown-item>
                  </b-nav-item-dropdown>
    
                   <b-nav-item-dropdown text="Themes" left lazy>
                        <b-dropdown-item v-on:click="setStyle()">default</b-dropdown-item>
                        <b-dropdown-item v-on:click="setStyle('litera')">litera</b-dropdown-item>
                        <b-dropdown-item v-on:click="setStyle('lumen')">lumen</b-dropdown-item>
                        <b-dropdown-item v-on:click="setStyle('lux')">lux</b-dropdown-item>                        
                        <b-dropdown-item v-on:click="setStyle('materia')">materia</b-dropdown-item>                        
                        <b-dropdown-item v-on:click="setStyle('minty')">minty</b-dropdown-item>                        
                        <b-dropdown-item v-on:click="setStyle('pulse')">pulse</b-dropdown-item>                        
                        <b-dropdown-item v-on:click="setStyle('sandstone')">sandstone</b-dropdown-item>                        
                        <b-dropdown-item v-on:click="setStyle('simplex')">simplex</b-dropdown-item>                        
                        <b-dropdown-item v-on:click="setStyle('sketchy')">sketchy</b-dropdown-item>                        
                        <b-dropdown-item v-on:click="setStyle('slate', true)">slate</b-dropdown-item>                        
                        <b-dropdown-item v-on:click="setStyle('solar', true)">solar</b-dropdown-item>                        
                        <b-dropdown-item v-on:click="setStyle('spacelab')">spacelab</b-dropdown-item>                        
                        <b-dropdown-item v-on:click="setStyle('superhero', true)">superhero</b-dropdown-item>                        
                        <b-dropdown-item v-on:click="setStyle('united')">united</b-dropdown-item>                        
                        <b-dropdown-item v-on:click="setStyle('yeti')">yeti</b-dropdown-item>                        
                  </b-nav-item-dropdown>

                  <b-nav-item-dropdown text="Tools" left lazy>
                    <b-dropdown-item @click="openModels"><b-icon icon="diagram3" class="mr-2"></b-icon>Model editor</b-dropdown-item>
                    <b-dropdown-item @click="openStorage"><b-icon icon="server" class="mr-2"></b-icon>Storage management</b-dropdown-item>
                  </b-nav-item-dropdown>

                   <b-nav-item-dropdown text="Plugins" left lazy>
                        <b-dropdown-item v-for="plugin of availablePlugins()" v-on:click="togglePlugin(plugin)">
                            <b-icon :icon="pluginState(plugin) ? 'check-circle' : 'circle'" class="mr-2"></b-icon> {{pluginLabel(plugin)}}
                        </b-dropdown-item>
                  </b-nav-item-dropdown>

                  <b-navbar-nav class="ml-auto">
                    <b-nav-form>
                        <b-button v-if="!loggedIn" class="float-right" @click="signIn">Sign in</b-button>  
                        <div v-else class="float-right">
                            <div @click="signOut" style="cursor: pointer">
                                <b-avatar v-if="user().imageUrl" variant="primary" :src="user().imageUrl" class="mr-3"></b-avatar>
                                <b-avatar v-else variant="primary" :text="(user().firstName && user().lastName) ? (user().firstName[0] + '' + user().lastName[0]) : '?'" class="mr-3"></b-avatar>
                                <span class="text-light">{{ user().email }}</span>
                            </div>
                        </div>          
                    </b-nav-form>                
                  </b-navbar-nav>
                 
                </b-navbar-nav>
                
            </b-navbar>
            
            
           <!-- status bar --> 
          <b-navbar :style="'visibility: ' + (edit && loaded ? 'visible' : 'hidden')" class="show-desktop shadow" ref="ide-statusbar" id="ide-statusbar"  toggleable="lg" type="dark" variant="dark" fixed="bottom">
        
            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
        
            <b-collapse id="nav-collapse" is-nav>
        
              <b-navbar-nav>
                <span class="mr-2">dLite version {{ version() }}</span>
              </b-navbar-nav>
              
              <b-navbar-nav class="ml-auto">
                <b-nav-form>
                  <b-form-input size="sm" class="mr-sm-2" placeholder="Command" v-model="command" v-on:keyup.enter="evalCommand"></b-form-input>
                  <b-button size="sm" class="my-2 my-sm-0" @click="evalCommand"><b-icon icon="play"></b-icon></b-button>
                </b-nav-form>
              </b-navbar-nav>              
            </b-collapse>
          </b-navbar>
            
            <b-container id="platform-main-container" v-if="offlineMode && !loaded" fluid class="pt-3">
                <b-button v-if="!loggedIn" class="float-right" @click="signIn">Sign in</b-button>
                <div v-if="loggedIn" class="text-right">
                    <div @click="signOut" style="cursor: pointer">
                        <b-avatar v-if="user().imageUrl" variant="primary" :src="user().imageUrl" class="mr-3"></b-avatar>
                        <b-avatar v-else variant="primary" :text="(user().firstName && user().lastName) ? (user().firstName[0] + '' + user().lastName[0]) : '?'" class="mr-3"></b-avatar>
                        <span class="show-desktop text-light">{{ user().email }}</span>
                    </div>
                </div>          
                <b-container>
                    <div class="text-center">
                        <div class="show-desktop">
                            <a href="https://www.dlite.io">
                                <b-img :src="'assets/images/' + (darkMode ? 'logo-dlite-1-white.svg' : 'dlite_logo_banner.png')" style="width: 30%"></b-img>
                            </a>
                            <div class="mr-2">Version {{ version() }}</div>
                            <div style="font-size: 1.5rem; font-weight: lighter">Low-code platform for frontend development</div>
                            <div class="mb-5" style="font-size: 1rem; font-style: italic">Leverage the Local-First Software paradigm and build apps MUCH faster with no limits</div>
                        </div>
                        <div class="show-mobile">
                            <b-img :src="'assets/images/' + (darkMode ? 'logo-dlite-1-white.svg' : 'dlite_logo_banner.png')" style="width: 60%"></b-img>
                            <div style="font-size: 1rem; font-weight: lighter">Low-code platform for frontend development</div>
                            <div class="mb-5" style="font-size: 0.8rem; font-style: italic">Build apps MUCH faster with no limits</div>
                        </div>
                        <b-button size="md" pill class="m-2" v-on:click="loadFile" variant="primary"><b-icon icon="upload" class="mr-2"></b-icon>Load project file</b-button>
                        <b-button size="md" pill class="m-2" v-on:click="blankProject" variant="secondary"><b-icon icon="arrow-right-square" class="mr-2"></b-icon>Start with a blank project</b-button>
                    </div>
                    <div class="text-center mt-2">
                        Or check out our <b-link href="#examples">examples and templates</b-link> (free to use and fork at will).
                    </div>
                    <b-card class="mt-4 d-none">
                        <p class="text-center">Or connect to a DLite server:</p>
                        <b-form-input v-model="backend" size="md" :state="!offlineMode" v-b-tooltip.hover title="Server address"></b-form-input>
                        <b-button size="md" pill class="mt-2 float-right" v-on:click="connect" variant="outline-primary"><b-icon icon="cloud-plus" class="mr-2"></b-icon>Connect</b-button>
                    </b-card>
                    <div class="text-center mt-2">
                        New to dLite? Check out the <a href="https://www.dlite.io">official Web site</a>.
                    </div>
                    <div class="text-center">
                        Need some help to get started? Check out the <a href="https://www.dlite.io/#/tutorial">tutorial</a>.
                    </div>
                </b-container>
                
                <a id="examples"></a>
                <h3 class="text-center mt-5 mb-0">Tools</h3>
                <div class="text-center" style="font-weight: lighter; font-style: italic">Extendable at will for your own needs</div>
                <apps-panel :basePath="basePath" :apps="coreApps.filter(app => app.category === 'tools')"></apps-panel>
                <h3 class="text-center mt-4 mb-0">Search and APIs</h3>
                <div class="text-center" style="font-weight: lighter; font-style: italic">Extendable at will for your own needs</div>
                <apps-panel :basePath="basePath" :apps="coreApps.filter(app => app.category === 'api')"></apps-panel>
                <h3 class="text-center mt-4 mb-0">Misc.</h3>
                <div class="text-center" style="font-weight: lighter; font-style: italic">Extendable at will for your own needs</div>
                <apps-panel :basePath="basePath" :apps="coreApps.filter(app => (app.category === 'family' || app.category === 'web'))"></apps-panel>
                <h3 class="text-center mt-4 mb-0">Developer tools</h3>
                <div class="text-center" style="font-weight: lighter; font-style: italic">Extendable at will for your own needs</div>
                <apps-panel :basePath="basePath" :apps="coreApps.filter(app => app.category === 'developer-tools')"></apps-panel>
                <h3 v-if="myApps" class="text-center mt-4">My apps</h3>
                <apps-panel v-if="myApps" :basePath="basePath" :apps="myApps"></apps-panel>
                
                <p class="text-center mt-4">Copyright &copy; 2021, <a target="_blank" href="https://cincheo.com/cincheo">CINCHEO</a></p>                        
            </b-container>            

            <div v-else :class="contentFillHeight()?'h-100':''">
                        
                <b-sidebar v-if="edit" class="left-sidebar show-desktop" id="left-sidebar" ref="left-sidebar" title="Left sidebar" :visible="isRightSidebarOpened()"
                    no-header no-close-on-route-change shadow width="20em" 
                    :bg-variant="darkMode ? 'dark' : 'light'" :text-variant="darkMode ? 'light' : 'dark'"
                    :style="'padding-top: ' + navbarHeight + 'px; padding-bottom: ' + statusbarHeight + 'px'"
                    >
                    <tools-panel></tools-panel>
                </b-sidebar>
                <b-sidebar v-if="edit" class="show-mobile" id="left-sidebar-mobile" ref="left-sidebar-mobile" :visible="false"
                    shadow width="20em" 
                    :bg-variant="darkMode ? 'dark' : 'light'" :text-variant="darkMode ? 'light' : 'dark'" >
                    <mobile-tools-panel></mobile-tools-panel>
                </b-sidebar>
                <b-sidebar v-if="edit" class="right-sidebar show-desktop" id="right-sidebar" ref="right-sidebar" title="Right sidebar" :visible="isRightSidebarOpened()" 
                    no-header no-close-on-route-change shadow width="30em" 
                    :bg-variant="darkMode ? 'dark' : 'light'" :text-variant="darkMode ? 'light' : 'dark'" 
                    :style="'padding-top: ' + navbarHeight + 'px; padding-bottom: ' + statusbarHeight + 'px'"
                    >
                    <component-panel></component-panel>
                </b-sidebar>
                <div ref="ide-main-container" :class="contentFillHeight()?'h-100':''">

                    <div v-if="edit" id="hoverOverlay"></div>
                    <div v-if="edit" id="selectionOverlay"></div>
                    
                    <b-button v-if="edit" v-b-toggle.left-sidebar-mobile pill size="sm" class="shadow show-mobile" style="position:fixed; z-index: 300; left: -1em; top: 50%; opacity: 0.5"><b-icon icon="list"></b-icon></b-button>
                
                    <builder-dialogs v-if="edit"></builder-dialogs>

                    <b-modal id="component-modal" static scrollable hide-footer>
                        <template #modal-title>
                            <h6>Component properties</h6>
                            <component-icon :type="selectedComponentType()"></component-icon> {{ selectedComponentId }}
                        </template>
                        <component-panel :modal="true"></component-panel>
                    </b-modal>

                    <b-modal id="create-component-modal" title="Create component" static scrollable hide-footer>
                        <create-component-panel @componentCreated="hideComponentCreatedModal" initialCollapse="all"></create-component-panel>
                    </b-modal>

                    <component-view v-for="dialogId in viewModel.dialogIds" :key="dialogId" :cid="dialogId" keyInParent="dialogIds" :inSelection="false"></component-view>
                    
                    <div id="root-container" 
                        :class="'root-container' + (edit?' targeted':'')" 
                        :style="'position: relative; ' + (edit ? 'padding-top: ' + navbarHeight + 'px;' + 'padding-bottom: ' + statusbarHeight + 'px; height: 100vh; overflow: auto' : (contentFillHeight()?'height:100%; display: flex; flex-direction: column':''))" 
                        v-on:scroll="followScroll"
                    >
                        <a id="_top"></a>
                    
                        <component-view :cid="viewModel.navbar.cid" keyInParent="navbar" :inSelection="false"></component-view>
                        <div id="content" :style="((this.viewModel.navbar.contentFillHeight == true)?(edit?'height: 100%; ':'flex-grow:1; '):'')+'overflow-y: auto'">
                            <slot></slot>
                        </div>
                    </div>    
                    
                </div>
            </div>                
        </div>
        `,
        data: () => {
            return {
                viewModel: applicationModel,
                activePlugins: undefined,
                edit: ide.editMode,
                userInterfaceName: userInterfaceName,
                backend: backend,
                loaded: ide.applicationLoaded,
                darkMode: ide.isDarkMode(),
                coreApps: [],
                myApps: [],
                selectedComponentId: ide.selectedComponentId,
                targetLocation: ide.targetLocation,
                bootstrapStylesheetUrl: applicationModel.bootstrapStylesheetUrl,
                offlineMode: ide.offlineMode,
                loggedIn: ide.user !== undefined,
                timeout: undefined,
                shieldDisplay: undefined,
                eventShieldOverlay: undefined,
                errorMessages: [],
                command: '',
                userLogin: undefined,
                userPassword: undefined
            }
        },
        computed: {
            basePath: function () {
                let p = window.location.pathname;
                let params = [];
                if (parameters.get('plugins')) {
                    params.push('plugins=' + parameters.get('plugins'));
                }
                if (params.length > 0) {
                    p += '?';
                }
                p += params.join('&');
                return p;
            },
            isActive(href) {
                return href === this.$root.currentRoute;
            },
            navbarHeight: function () {
                if (this.bootstrapStylesheetUrl) {
                    console.info('computing navbarHeight');
                }
                const navBar = document.getElementById('ide-navbar');
                let height = navBar ? navBar.offsetHeight : 0;
                ide.updateSelectionOverlay(ide.selectedComponentId);
                ide.updateHoverOverlay(ide.hoveredComponentId);
                return height;
            },
            statusbarHeight: function () {
                if (this.bootstrapStylesheetUrl) {
                    console.info('computing statusbar');
                }
                const statusBar = document.getElementById('ide-statusbar');
                let height = statusBar ? statusBar.offsetHeight : 0;
                ide.updateSelectionOverlay(ide.selectedComponentId);
                ide.updateHoverOverlay(ide.hoveredComponentId);
                return height;
            }
        },
        watch: {
            $route(to, from) {
                this.$eventHub.$emit('route-changed', to, from);
            }
        },
        created: function () {
            Vue.prototype.$eventHub.$on('sign-in-request', () => {
                if (Vue.prototype.$eventHub._events['sign-in-request'].length === 1) {
                    // default sign in
                    this.$root.$emit('bv::show::modal', 'sign-in-modal');
                }
            });
            Vue.prototype.$eventHub.$on('report-error', (level, tittle, description) => {
                this.$bvToast.toast(description, {
                    title: tittle,
                    variant: level,
                    autoHideDelay: 2000,
                    solid: true
                });
            });
            this.$eventHub.$on('set-user', (user) => {
                this.loggedIn = user !== undefined;
                if (this.loggedIn) {
                    this.$root.$emit('bv::hide::modal', 'sign-in-modal');
                }
            });
            this.$eventHub.$on('edit', (event) => {
                this.edit = event;
            });
            this.$eventHub.$on('application-loaded', () => {
                console.info("application-loaded");
                this.loaded = true;
                if (applicationModel) {
                    this.viewModel = applicationModel;
                }
            });
            this.$eventHub.$on('application-saved', () => {
                console.info("application-saved");
                this.$forceUpdate();
            });
            this.$eventHub.$on('style-changed', () => {
                this.darkMode = ide.isDarkMode();
                // hack to wait that the new style renders
                setTimeout(() => {
                    this.bootstrapStylesheetUrl = applicationModel.bootstrapStylesheetUrl;
                    setTimeout(() => {
                        this.bootstrapStylesheetUrl = "$";
                        this.bootstrapStylesheetUrl = applicationModel.bootstrapStylesheetUrl;
                        setTimeout(() => {
                            this.bootstrapStylesheetUrl = "$";
                            this.bootstrapStylesheetUrl = applicationModel.bootstrapStylesheetUrl;
                            setTimeout(() => {
                                this.bootstrapStylesheetUrl = "$";
                                this.bootstrapStylesheetUrl = applicationModel.bootstrapStylesheetUrl;
                                setTimeout(() => {
                                    this.bootstrapStylesheetUrl = "$";
                                    this.bootstrapStylesheetUrl = applicationModel.bootstrapStylesheetUrl;
                                }, 5000);
                            }, 2000);
                        }, 500);
                    }, 300);
                }, 300);
            });
            this.$eventHub.$on('screen-resized', () => {
                console.info('screen-resized');
                // hack to force the navbar height to be calculated
                setTimeout(() => {
                    this.bootstrapStylesheetUrl = "$";
                    this.bootstrapStylesheetUrl = applicationModel.bootstrapStylesheetUrl;
                }, 300);
            });
            this.$eventHub.$on('component-selected', (cid) => {
                this.selectedComponentId = cid;
            });
            this.$eventHub.$on('offline-mode', (offlineMode) => {
                this.offlineMode = offlineMode;
            });
            this.$eventHub.$on('target-location-selected', (targetLocation) => {
                this.targetLocation = targetLocation;
            });
            this.$eventHub.$on('component-selected', (cid) => {
                this.selectedComponentId = cid;
            });
        },
        mounted: async function () {

            this.eventShieldOverlay = document.getElementById('eventShieldOverlay');

            window.addEventListener('mousewheel', this.followScroll);

            // TODO: ADD scroll event listener on main container for iframes !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

            const findComponent = (x, y) => {
                const display = this.eventShieldOverlay.style.display;
                this.eventShieldOverlay.style.display = 'none';
                let el = document.elementFromPoint(x, y);
                while (el && !el.classList.contains('component-container')) {
                    el = el.parentElement;
                }
                this.eventShieldOverlay.style.display = display;
                if (el) {
                    return el.id.substring(3);
                } else {
                    return undefined;
                }
            }

            window.addEventListener('mousemove', ev => {
                if (!this.edit || ev.buttons) {
                    return;
                }
                const cid = findComponent(ev.clientX, ev.clientY);
                if (cid) {
                    ide.hoverComponent(cid);
                    if (ide.selectedComponentId !== ide.hoveredComponentId) {
                        this.eventShieldOverlay.style.display = 'block';
                    } else {
                        this.eventShieldOverlay.style.display = 'none';
                    }
                } else {
                    this.eventShieldOverlay.style.display = 'none';
                    ide.updateHoverOverlay(undefined);
                    ide.hoverComponent(undefined);
                }
            });

            let mousedownCid;

            window.addEventListener('mousedown', ev => {
                if (!this.edit) {
                    return;
                }
                mousedownCid = findComponent(ev.clientX, ev.clientY);
            });

            window.addEventListener('mouseup', ev => {
                if (!this.edit) {
                    return;
                }
                const cid = findComponent(ev.clientX, ev.clientY);
                console.info("mouseup", ev, cid, mousedownCid);
                try {
                    if (cid && cid === mousedownCid) {
                        ide.selectComponent(cid);
                        const hoverOverlay = document.getElementById('hoverOverlay');
                        hoverOverlay.style.backgroundColor = '';
                        this.eventShieldOverlay.style.display = 'none';
                    }
                } finally {
                    mousedownCid = undefined;
                }
            });

            if (this.offlineMode) {
                const url = 'assets/apps/core-apps.json';
                console.info("core apps url", url);
                this.coreApps = await fetch(url, {
                    method: "GET"
                }).then(response => response.json());
                try {
                    this.myApps = JSON.parse(localStorage.getItem('dlite.ide.myApps'));
                } catch (e) {
                    // swallow
                }
            }
            try {
                let userCookie = Tools.getCookie("dlite.user");
                if (userCookie) {
                    ide.setUser(JSON.parse(userCookie));
                    ide.synchronize();
                }
            } catch (e) {
                console.error(e);
            }
            // if (document.location.host.split(':')[0] == 'localhost') {
            //     if (parameters.get('user') === 'dev-alt') {
            //         ide.setUser({
            //             id: 'dev-alt',
            //             firstName: 'Dev',
            //             lastName: '2nd',
            //             email: 'dev-alt@cincheo.com'
            //         });
            //     } else {
            //         ide.setUser({
            //             id: 'dev',
            //             firstName: 'Dev',
            //             lastName: '1st',
            //             email: 'dev@cincheo.com'
            //         });
            //     }
            //     ide.synchronize();
            // }

            if (plugins) {
                plugins.forEach(plugin => {
                    console.info("loading plugin", plugin);
                    $tools.loadScript(plugin);
                });
            }

        },
        updated: function () {
            if (this.updatedTimeout) {
                clearTimeout(this.updatedTimeout);
            }
            this.updatedTimeout = setTimeout(() => {
                console.info('GLOBAL UPDATED', this.loaded, this.edit);
                this.$eventHub.$emit('main-updated', this.loaded, this.edit);
                if (this.loaded && !this.edit && !this.reactiveBindingsEnsured) {
                    this.reactiveBindingsEnsured = true;
                    components.ensureReactiveBindings();
                    console.info("OBSERVING", document.getElementById("_top"));
                    this.$intersectionObserver.observe(document.getElementById("_top"));
                }
            }, 200);
        },
        methods: {
            contentFillHeight() {
                return !this.edit && (this.viewModel.navbar.contentFillHeight == true);
            },
            isFileDirty: function () {
                return ide.isFileDirty();
            },
            isBrowserDirty: function () {
                return ide.isBrowserDirty();
            },
            version() {
                return window.ideVersion;
            },
            changeName() {
                userInterfaceName = this.userInterfaceName;
            },
            availablePlugins() {
                return ide.availablePlugins;
            },
            togglePlugin(plugin) {
                ide.togglePlugin(plugin);
                this.activePlugins = applicationModel.plugins;
                ide.setEditMode(false);
                setTimeout(() => {
                    ide.setEditMode(true);
                    setTimeout(() => {
                        this.$bvToast.toast(`Plugin ${this.pluginLabel(plugin)} ${this.pluginState(plugin) ? 'activated' : 'deactivated'}.`, {
                            title: `Plugin ${this.pluginState(plugin) ? 'activated' : 'deactivated'}`,
                            variant: 'info',
                            autoHideDelay: 3000,
                            solid: true
                        });
                    }, 500);
                }, 500);
            },
            pluginLabel(plugin) {
                let chunks = plugin.split('/');
                return $tools.kebabToLabelText(chunks[chunks.length - 1].split('.')[0]);
            },
            pluginState(plugin) {
                if (!this.activePlugins) {
                    this.activePlugins = applicationModel.plugins;
                }
                console.info("plugin state", plugin, this.activePlugins);
                return this.activePlugins && this.activePlugins.indexOf(plugin) > -1;
            },
            evalCommand() {
                let result = eval(this.command);
                if (result) {
                    if (typeof result === 'string') {
                        alert(result);
                    } else {
                        try {
                            alert(JSON.stringify(result, undefined, 2));
                        } catch (e) {
                            let output = '';
                            for (let property in result) {
                                if (result[property] !== Object(result[property])) {
                                    output += property + ': ' + result[property] + '\n';
                                }
                            }
                            alert(output);
                        }
                    }
                }
            },
            hasTrashedComponents() {
                return components.hasTrashedComponents();
            },
            emptyTrash() {
                components.emptyTrash();
            },
            isLocked() {
                return ide.locked;
            },
            setEditMode(editMode) {
                ide.setEditMode(editMode);
            },
            openModels: function () {
                this.$root.$emit('bv::show::modal', 'models-modal');
            },
            openStorage: function () {
                this.$root.$emit('bv::show::modal', 'storage-modal');
            },
            openSettings: function () {
                this.$root.$emit('bv::show::modal', 'settings-modal');
            },
            followScroll: function () {
                if (!this.timeout) {
                    this.shieldDisplay = this.eventShieldOverlay.style.display;
                }
                this.eventShieldOverlay.style.display = 'none';
                ide.updateHoverOverlay(ide.hoveredComponentId);
                ide.updateSelectionOverlay(ide.selectedComponentId);
                if (this.timeout) {
                    clearTimeout(this.timeout);
                    this.timeout = undefined;
                }
                this.timeout = setTimeout(() => {
                    this.eventShieldOverlay.style.display = this.shieldDisplay;
                }, 100);
            },
            startDrag: function (evt) {
                const cid = ide.hoveredComponentId;
                ide.hoverComponent(undefined);
                evt.dataTransfer.dropEffect = 'move';
                evt.dataTransfer.effectAllowed = 'all';
                evt.dataTransfer.setData('cid', cid);
                evt.dataTransfer.setDragImage(
                    document.getElementById(cid),
                    5,
                    5
                );
            },
            user() {
                return ide.user;
            },
            signIn() {
                ide.signInRequest();
            },
            signOut() {
                if (confirm("Are you sure you want to sign out?")) {
                    ide.signOut();
                }
            },
            doSignIn: function() {
                console.info("do sign in", this.userLogin, this.userPassword);
                ide.authenticate(this.userLogin, this.userPassword);
            },
            async synchronize() {
                ide.synchronize();
            },
            onSelectionOverlayClicked(event) {
                event.source.style.backgroundColor = 'none';
                //event.source.style.pointerEvents = 'none';
                //event.stopPropagation();
            },
            selectedComponentType() {
                const c = components.getComponentModel(this.selectedComponentId);
                return c ? c.type : undefined;
            },
            hideComponentCreatedModal() {
                console.info("hide modal");
                this.$root.$emit('bv::hide::modal', 'create-component-modal');
            },
            loadFile() {
                ide.loadFile(() => {
                    this.$eventHub.$emit('edit', false);
                    ide.selectComponent('navbar');
                });
            },
            saveFile() {
                ide.saveFile();
            },
            loadFile2() {
                ide.loadFile();
            },
            saveInBrowser() {
                ide.saveInBrowser();
            },
            async save() {
                ide.save(userInterfaceName);
            },
            async load() {
                ide.createAndLoad(userInterfaceName);
            },
            detachComponent() {
                ide.detachComponent(this.selectedComponentId);
                ide.selectComponent(undefined);
            },
            deleteComponent() {
                ide.deleteComponent(this.selectedComponentId);
            },
            copyComponent() {
                ide.copyComponent(this.selectedComponentId);
            },
            pasteComponent() {
                ide.pasteComponent();
            },
            canPaste() {
                return this.targetLocation;
            },
            blankProject() {
                this.loaded = true;
                ide.selectComponent('navbar');
            },
            connect() {
                backend = this.backend;
                ide.createAndLoad("default");
            },
            toggleLeftSidebar: function (forceClose) {
                const sidebar = document.getElementById('left-sidebar');
                const sidebarOuter = sidebar.parentElement;
                console.info("toggleLeftSidebar", forceClose);

                if (forceClose == true || this.isLeftSidebarOpened()) {
                    sidebarOuter.classList.remove('open-sidebar');
                    sidebarOuter.classList.add('close-sidebar');
                    ide.setAttribute('leftSidebarState', 'close');
                    console.info("LEFT CLOSED");
                } else {
                    sidebarOuter.classList.remove('close-sidebar');
                    sidebarOuter.classList.add('open-sidebar');
                    sidebar.style.display = 'flex';
                    ide.setAttribute('leftSidebarState', 'open');
                    console.info("LEFT OPENED");
                }
            },
            toggleRightSidebar: function (forceClose) {
                const sidebar = document.getElementById('right-sidebar');
                const sidebarOuter = sidebar.parentElement;
                console.info("toggleRightSidebar", forceClose);

                if (forceClose == true || this.isRightSidebarOpened()) {
                    sidebarOuter.classList.remove('open-sidebar');
                    sidebarOuter.classList.add('close-sidebar');
                    ide.setAttribute('rightSidebarState', 'close');
                    console.info("RIGHT CLOSED");
                } else {
                    sidebarOuter.classList.remove('close-sidebar');
                    sidebarOuter.classList.add('open-sidebar');
                    sidebar.style.display = 'flex';
                    ide.setAttribute('rightSidebarState', 'open');
                    console.info("RIGHT OPENED");
                }
            },
            isLeftSidebarOpened() {
                return this.edit && ide.getAttribute('leftSidebarState') === 'open';
            },
            isRightSidebarOpened() {
                return this.edit && ide.getAttribute('rightSidebarState') === 'open';
            },
            setStyle(value, darkMode) {
                ide.setStyle(value, darkMode);
            }
        }
    });

    Vue.component('page-view', {
        template: `
            <div>
                <main-layout>
                    <component-view :cid="viewModel ? viewModel.cid : undefined" :inSelection="false" />
                </main-layout>
            </div>
        `,
        data: () => {
            return {
                viewModel: undefined,
                edit: ide.editMode
            }
        },
        created: function () {
            this.fetchModel();
        },
        mounted: function () {
            if (!applicationModel.bootstrapStylesheetUrl) {
                ide.setStyle("slate", true);
                let content = ide.getApplicationContent();
                ide.savedFileModel = content;
                ide.savedBrowserModel = content;
            }
        },
        beforeDestroy() {
            console.info("destroying component")
            let events = this.viewModel["events"];
            for (let eventName in events) {
                this.$eventHub.$off(eventName);
            }
        },
        watch: {
            $route(to, from) {
                this.fetchModel();
            }
        },
        methods: {
            fetchModel: async function () {
                let pageModel = components.getComponentModel(this.$route.name);
                if (pageModel == null) {
                    // if (ide.offlineMode) {
                    pageModel = components.createComponentModel('ContainerView');
                    components.registerComponentModel(pageModel, this.$route.name);
                    // } else {
                    //     let url = `${baseUrl}/page?ui=${userInterfaceName}&pageId=${this.$route.name}`;
                    //     console.log("fetch page", url);
                    //     pageModel = await fetch(url, {
                    //         method: "GET"
                    //     }).then(response => response.json());
                    //     console.log("component for page '" + this.$route.name + "'", JSON.stringify(pageModel, null, 4));
                    //     if (pageModel == null || pageModel.type == null) {
                    //         console.log("auto create container for page '" + this.$route.name + "'");
                    //         pageModel = components.createComponentModel('ContainerView');
                    //         components.registerComponentModel(pageModel, this.$route.name);
                    //     }
                    // }
                    components.fillComponentModelRepository(pageModel);
                }
                this.viewModel = pageModel;
                console.info("viewModel.cid", this.viewModel.cid);
            }
        }
    });

    let routes = [];

    let defaultPage = applicationModel.navbar.defaultPage || applicationModel.defaultPage || 'index';
    routes.push({path: "/", redirect: defaultPage});

    applicationModel.navbar.navigationItems.forEach(nav => {
        console.info("add route to page '" + nav.pageId + "'");
        routes.push({
            name: nav.pageId,
            path: "/" + nav.pageId,
            component: Vue.component('page-view')
        });
    });

    routes.push({path: "*", redirect: defaultPage});

    console.log("building router", routes);

    const router = new VueRouter({
        routes: routes,
        linkActiveClass: "active",
        scrollBehavior(to, from, savedPosition) {
            if (!ide.scrollDisabled) {
                if (to.hash) {
                    return {
                        selector: to.hash,
                        behavior: 'smooth'
                    }
                } else if (savedPosition) {
                    return {
                        selector: savedPosition.hash,
                        behavior: 'smooth'
                    };
                } else {
                    return {
                        x: 0,
                        y: 0,
                        behavior: 'smooth'
                    }
                }
            }
        }
    });
    ide.router = router;

    new Vue({
        router
    }).$mount("#app");
}

ide.start();
