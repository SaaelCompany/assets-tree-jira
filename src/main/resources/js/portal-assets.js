(function () {
    'use strict';
    if (window.__assetTreePortalAssets) return;
    window.__assetTreePortalAssets = true;
    if ((window.location.pathname || '').indexOf('/servicedesk/customer/') < 0) return;
    if (/\/servicedesk\/customer\/user\/(login|signup|forgotpassword|resetpassword)/.test(window.location.pathname)) return;

    var HASH = '#my-assets';
    var NAV_ID = 'asset-tree-pa-nav';
    var PROFILE_ID = 'asset-tree-pa-profile';
    var ownScript = currentScriptSrc();
    var data = null;
    var iconsWanted = false;
    var dialog = null;

    var TEXT = {
        ru: {
            nav: 'Активы',
            title: 'Мои активы',
            lead: 'Оборудование, которое числится за вами.',
            close: 'Закрыть',
            loading: 'Загрузка…',
            empty: 'За вами пока не числится оборудование.',
            error: 'Не удалось загрузить оборудование. Обновите страницу.',
            role: 'Числится как',
            count: function (n) { return n + ' ' + plural(n, 'позиция', 'позиции', 'позиций'); }
        },
        en: {
            nav: 'Assets',
            title: 'My assets',
            lead: 'Equipment registered to you.',
            close: 'Close',
            loading: 'Loading…',
            empty: 'No equipment is registered to you yet.',
            error: 'Could not load the equipment. Refresh the page.',
            role: 'Registered as',
            count: function (n) { return n + (n === 1 ? ' item' : ' items'); }
        }
    };

    function plural(n, one, few, many) {
        var tail = n % 100;
        if (tail >= 11 && tail <= 14) return many;
        tail = n % 10;
        if (tail === 1) return one;
        if (tail >= 2 && tail <= 4) return few;
        return many;
    }

    function lang() {
        var value = (document.documentElement.getAttribute('lang') || '').toLowerCase();
        if (!value) {
            var meta = document.querySelector('meta[name="ajs-user-locale"]');
            value = meta ? (meta.getAttribute('content') || '').toLowerCase() : '';
        }
        return value.indexOf('en') === 0 ? 'en' : 'ru';
    }

    function t(key, arg) {
        var item = TEXT[lang()][key];
        return typeof item === 'function' ? item(arg) : item;
    }

    function currentScriptSrc() {
        if (document.currentScript && document.currentScript.src) return document.currentScript.src;
        var scripts = document.getElementsByTagName('script');
        for (var i = scripts.length - 1; i >= 0; i--) {
            if ((scripts[i].src || '').indexOf('portal-assets.js') >= 0) return scripts[i].src;
        }
        return '';
    }

    function contextPath() {
        if (window.AJS && typeof AJS.contextPath === 'function') return AJS.contextPath();
        var meta = document.querySelector('meta[name="ajs-context-path"]');
        if (meta) return meta.getAttribute('content') || '';
        var at = (window.location.pathname || '').indexOf('/servicedesk/customer/');
        return at > 0 ? window.location.pathname.substring(0, at) : '';
    }

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined && text !== null && text !== '') node.textContent = text;
        return node;
    }

    function load(done) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', contextPath() + '/rest/asset-tree/1.0/portal/my-assets', true);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('X-Atlassian-Token', 'no-check');
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;
            var payload = null;
            if (xhr.status === 200 && xhr.responseText) {
                try { payload = JSON.parse(xhr.responseText); } catch (error) { payload = null; }
            }
            done(payload);
        };
        xhr.send(null);
    }

    /* ---------- type tiles ---------- */

    function iconPath(key) {
        var list = window.AssetTreeTypeIcons;
        if (!list) return '';
        for (var i = 0; i < list.length; i++) {
            if (list[i].key === key) return list[i].d;
        }
        return '';
    }

    function wantIcons() {
        if (iconsWanted || window.AssetTreeTypeIcons || !ownScript) return;
        iconsWanted = true;
        var script = document.createElement('script');
        script.src = ownScript.replace('portal-assets.js', 'type-icons.js');
        script.onload = function () { repaintTiles(); };
        document.head.appendChild(script);
    }

    function paintTile(tile) {
        if (tile.firstChild) return;
        var d = iconPath(tile.getAttribute('data-icon')) || iconPath('device');
        if (!d) return;
        var ns = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('aria-hidden', 'true');
        var path = document.createElementNS(ns, 'path');
        path.setAttribute('d', d);
        svg.appendChild(path);
        tile.appendChild(svg);
    }

    function repaintTiles() {
        var tiles = document.querySelectorAll('.asset-tree-pa-tile');
        for (var i = 0; i < tiles.length; i++) paintTile(tiles[i]);
    }

    function tile(item) {
        var node = el('span', 'asset-tree-pa-tile');
        node.style.background = item.color || '#5D6B82';
        node.setAttribute('data-icon', item.icon || 'device');
        if (item.typeLabel) node.title = item.typeLabel;
        paintTile(node);
        wantIcons();
        return node;
    }

    /* ---------- list ---------- */

    function formatValue(detail) {
        var value = detail.displayValue || detail.value || '';
        if (detail.kind === 'date') {
            var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
            if (match) return match[3] + '.' + match[2] + '.' + match[1];
        }
        return value;
    }

    function detailValue(detail) {
        var value = formatValue(detail);
        if (detail.kind === 'url' && /^https?:\/\//i.test(value)) {
            var link = el('a', 'asset-tree-pa-link', value);
            link.href = value;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            return link;
        }
        var node = el('dd', null, value);
        if (detail.kind === 'textarea') node.className = 'is-multiline';
        return node;
    }

    function itemCard(item) {
        var card = el('article', 'asset-tree-pa-item');
        var head = el('div', 'asset-tree-pa-head');
        head.appendChild(tile(item));
        var title = el('div', 'asset-tree-pa-title');
        title.appendChild(el('span', 'asset-tree-pa-name', item.name || ''));
        if (item.objectKey) title.appendChild(el('span', 'asset-tree-pa-key', item.objectKey));
        head.appendChild(title);
        if (item.statusLabel) {
            var lozenge = el('span', 'asset-tree-pa-status cat-' + (item.statusCategory || 'todo'), item.statusLabel);
            head.appendChild(lozenge);
        }
        card.appendChild(head);
        var list = el('dl', 'asset-tree-pa-details');
        if (item.role) {
            list.appendChild(el('dt', null, t('role')));
            list.appendChild(el('dd', null, item.role));
        }
        (item.details || []).forEach(function (detail) {
            list.appendChild(el('dt', null, detail.name || ''));
            var value = detailValue(detail);
            if (value.tagName.toLowerCase() === 'a') {
                var wrap = el('dd');
                wrap.appendChild(value);
                value = wrap;
            }
            list.appendChild(value);
        });
        card.appendChild(list);
        return card;
    }

    function total(payload) {
        var count = 0;
        (payload && payload.projects || []).forEach(function (group) { count += (group.assets || []).length; });
        return count;
    }

    function renderList(box, payload) {
        box.innerHTML = '';
        if (!payload) {
            box.appendChild(el('p', 'asset-tree-pa-message is-error', t('error')));
            return;
        }
        var groups = payload.projects || [];
        if (!groups.length) {
            box.appendChild(el('p', 'asset-tree-pa-message', t('empty')));
            return;
        }
        groups.forEach(function (group) {
            var section = el('section', 'asset-tree-pa-group');
            var heading = el('h3', 'asset-tree-pa-group-title');
            heading.appendChild(el('span', null, group.projectName || group.projectKey || ''));
            heading.appendChild(el('span', 'asset-tree-pa-count', t('count', (group.assets || []).length)));
            section.appendChild(heading);
            (group.assets || []).forEach(function (item) {
                section.appendChild(itemCard(item));
            });
            box.appendChild(section);
        });
    }

    /* ---------- dialog ---------- */

    function closeDialog() {
        if (!dialog) return;
        if (dialog.parentNode) dialog.parentNode.removeChild(dialog);
        dialog = null;
        document.removeEventListener('keydown', onKey, true);
        if (window.location.hash === HASH && window.history && window.history.replaceState) {
            window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
        }
    }

    function onKey(event) {
        if (event.key === 'Escape' || event.keyCode === 27) closeDialog();
    }

    function openDialog() {
        if (dialog) return;
        dialog = el('div', 'asset-tree-pa-backdrop');
        var box = el('div', 'asset-tree-pa-dialog');
        box.setAttribute('role', 'dialog');
        box.setAttribute('aria-modal', 'true');
        box.setAttribute('aria-label', t('title'));
        var head = el('div', 'asset-tree-pa-dialog-head');
        head.appendChild(el('h2', null, t('title')));
        var close = el('button', 'asset-tree-pa-close');
        close.type = 'button';
        close.setAttribute('aria-label', t('close'));
        close.title = t('close');
        close.textContent = '×';
        close.addEventListener('click', closeDialog);
        head.appendChild(close);
        box.appendChild(head);
        box.appendChild(el('p', 'asset-tree-pa-lead', t('lead')));
        var body = el('div', 'asset-tree-pa-body');
        body.appendChild(el('p', 'asset-tree-pa-message', t('loading')));
        box.appendChild(body);
        dialog.appendChild(box);
        dialog.addEventListener('mousedown', function (event) {
            if (event.target === dialog) closeDialog();
        });
        document.body.appendChild(dialog);
        document.addEventListener('keydown', onKey, true);
        close.focus();
        load(function (payload) {
            if (payload) data = payload;
            if (!dialog) return;
            renderList(body, payload);
        });
    }

    /* ---------- header link ---------- */

    function requestsLink() {
        var links = document.querySelectorAll('a[href*="/servicedesk/customer/user/requests"]');
        for (var i = 0; i < links.length; i++) {
            if (inHeader(links[i])) return links[i];
        }
        var words = /^(запросы|мои запросы|requests|my requests)$/i;
        var candidates = document.querySelectorAll('header a, header button, #header a, #header button, .cv-header a, .cv-header button');
        for (var j = 0; j < candidates.length; j++) {
            var text = (candidates[j].textContent || '').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
            if (words.test(text)) return candidates[j];
        }
        return null;
    }

    function headerNode() {
        return document.querySelector('#header, header[role="banner"], .cv-header, header');
    }

    function inHeader(node) {
        var header = headerNode();
        if (header && header.contains(node)) return true;
        var box = node.getBoundingClientRect ? node.getBoundingClientRect() : null;
        return !!(box && box.height > 0 && box.top < 120);
    }

    function profileHref() {
        return contextPath() + '/servicedesk/customer/user/profile' + HASH;
    }

    function navLink(className) {
        var link = el('a', className, t('nav'));
        link.id = NAV_ID;
        link.href = profileHref();
        link.addEventListener('click', function (event) {
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.button === 1) return;
            event.preventDefault();
            event.stopPropagation();
            openDialog();
        });
        return link;
    }

    function ensureNav() {
        if (document.getElementById(NAV_ID)) return;
        var anchor = requestsLink();
        if (anchor) {
            var item = anchor.parentNode && anchor.parentNode.tagName && anchor.parentNode.tagName.toLowerCase() === 'li'
                ? anchor.parentNode : null;
            var link = navLink((anchor.className ? anchor.className + ' ' : '') + 'asset-tree-pa-navlink');
            link.removeAttribute('aria-haspopup');
            if (item) {
                var li = el('li', item.className);
                li.appendChild(link);
                item.parentNode.insertBefore(li, item.nextSibling);
            } else {
                anchor.parentNode.insertBefore(link, anchor.nextSibling);
            }
            return;
        }
        var header = headerNode();
        if (header) {
            header.appendChild(navLink('asset-tree-pa-navlink is-standalone'));
            return;
        }
        document.body.appendChild(navLink('asset-tree-pa-navlink is-floating'));
    }

    /* ---------- profile section ---------- */

    function onProfile() {
        return /\/servicedesk\/customer\/user\/profile/.test(window.location.pathname || '');
    }

    function profileHost() {
        return document.querySelector('.cv-profile, #profile-page, .cv-page-content, #content-wrapper, main, [role="main"], #main');
    }

    function ensureProfile() {
        if (!onProfile() || !data) return;
        var existing = document.getElementById(PROFILE_ID);
        var host = profileHost();
        if (existing && host && host.contains(existing)) return;
        if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
        if (!host) return;
        var section = el('section', 'asset-tree-pa-profile');
        section.id = PROFILE_ID;
        var heading = el('h2', 'asset-tree-pa-profile-title', t('title'));
        heading.appendChild(el('span', 'asset-tree-pa-count', t('count', total(data))));
        section.appendChild(heading);
        var body = el('div', 'asset-tree-pa-body');
        renderList(body, data);
        section.appendChild(body);
        host.appendChild(section);
    }

    /* ---------- boot ---------- */

    function apply() {
        if (!data || !data.enabled || !document.body) return;
        ensureNav();
        ensureProfile();
    }

    function watch() {
        if (!document.body) {
            setTimeout(watch, 50);
            return;
        }
        if (window.MutationObserver) {
            var timer = null;
            new MutationObserver(function () {
                if (timer) return;
                timer = setTimeout(function () {
                    timer = null;
                    apply();
                }, 120);
            }).observe(document.body, { childList: true, subtree: true });
        }
        apply();
        if (data && data.enabled && window.location.hash === HASH) openDialog();
    }

    load(function (payload) {
        if (!payload || !payload.enabled) return;
        data = payload;
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch);
        else watch();
    });
})();
