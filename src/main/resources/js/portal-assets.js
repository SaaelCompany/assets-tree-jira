(function () {
    'use strict';
    if (window.__assetTreePortalAssets) return;
    window.__assetTreePortalAssets = true;
    if ((window.location.pathname || '').indexOf('/servicedesk/customer/') < 0) return;
    if (/\/servicedesk\/customer\/user\/(login|signup|forgotpassword|resetpassword)/.test(window.location.pathname)) return;

    var PROFILE_ID = 'asset-tree-pa-profile';
    var ownScript = currentScriptSrc();
    var data = null;
    var requested = false;
    var iconsWanted = false;

    var TEXT = {
        ru: {
            title: 'Мои активы',
            empty: 'За вами пока не числится оборудование.',
            error: 'Не удалось загрузить оборудование. Обновите страницу.',
            role: 'Вы указаны как',
            count: function (n) { return n + ' ' + plural(n, 'позиция', 'позиции', 'позиций'); }
        },
        en: {
            title: 'My assets',
            empty: 'No equipment is registered to you yet.',
            error: 'Could not load the equipment. Refresh the page.',
            role: 'You are listed as',
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

    /* ---------- profile section ---------- */

    function onProfile() {
        return /\/servicedesk\/customer\/user\/profile/.test(window.location.pathname || '');
    }

    function profileHost() {
        return document.querySelector('.cv-profile, #profile-page, .cv-page-content, #content-wrapper, main, [role="main"], #main');
    }

    function smallestWithText(pattern) {
        var nodes = document.body.getElementsByTagName('*');
        var found = null;
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (node.id === PROFILE_ID || (node.closest && node.closest('#' + PROFILE_ID))) continue;
            var text = (node.textContent || '').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
            if (text.length > 80 || !pattern.test(text)) continue;
            if (!found || found.contains(node)) found = node;
        }
        return found;
    }

    /* Puts the block after the profile fields and before the "Powered by" line, inside the same white panel. */
    function profileSpot() {
        var footer = smallestWithText(/^(работает на базе|powered by)/i);
        var heading = smallestWithText(/^(мой профиль|my profile|настройки|preferences)$/i);
        if (footer && heading) {
            var common = heading.parentNode;
            while (common && !common.contains(footer)) common = common.parentNode;
            if (common) {
                var before = footer;
                while (before.parentNode !== common) before = before.parentNode;
                var after = heading;
                while (after.parentNode !== common) after = after.parentNode;
                if (after !== before) return { parent: common, before: before };
            }
        }
        if (footer && footer.parentNode) {
            var top = footer;
            var host = profileHost();
            while (top.parentNode && top.parentNode !== host && top.parentNode !== document.body
                && top.parentNode.children.length === 1) {
                top = top.parentNode;
            }
            return { parent: top.parentNode, before: top };
        }
        var fallback = profileHost();
        return fallback ? { parent: fallback, before: null } : null;
    }

    function ensureProfile() {
        if (!onProfile() || !data) return;
        var existing = document.getElementById(PROFILE_ID);
        if (existing && document.body.contains(existing)) return;
        var spot = profileSpot();
        if (!spot || !spot.parent) return;
        var section = el('section', 'asset-tree-pa-profile');
        section.id = PROFILE_ID;
        var heading = el('h2', 'asset-tree-pa-profile-title', t('title'));
        heading.appendChild(el('span', 'asset-tree-pa-count', t('count', total(data))));
        section.appendChild(heading);
        var body = el('div', 'asset-tree-pa-body');
        renderList(body, data);
        section.appendChild(body);
        spot.parent.insertBefore(section, spot.before);
    }

    /* ---------- boot ---------- */

    /* The portal is a single-page app, so the profile can open without a page load. */
    function apply() {
        if (!document.body || !onProfile()) return;
        if (data) {
            if (data.enabled) ensureProfile();
            return;
        }
        if (requested) return;
        requested = true;
        load(function (payload) {
            if (!payload) {
                requested = false;
                return;
            }
            data = payload;
            if (data.enabled) ensureProfile();
        });
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
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch);
    else watch();
})();
