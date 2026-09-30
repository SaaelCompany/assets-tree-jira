(function () {
    'use strict';

    function contextPath() {
        if (window.AJS && typeof AJS.contextPath === 'function') return AJS.contextPath();
        var meta = document.querySelector('meta[name="ajs-context-path"]');
        return meta ? (meta.getAttribute('content') || '') : '';
    }

    function ajax(path, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', contextPath() + '/rest/asset-tree/1.0' + path, true);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('X-Atlassian-Token', 'no-check');
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;
            var payload = null;
            if (xhr.responseText) {
                try { payload = JSON.parse(xhr.responseText); } catch (error) { payload = null; }
            }
            callback(xhr.status, payload);
        };
        xhr.send(null);
    }

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    function indexOf(nodes) {
        var byId = {};
        (nodes || []).forEach(function (node) { byId[node.id] = node; });
        return byId;
    }

    function childrenOf(nodes, parentId) {
        return (nodes || []).filter(function (node) {
            return (node.parentId || null) === (parentId || null);
        });
    }

    function pathTo(nodes, id) {
        var byId = indexOf(nodes);
        var chain = [];
        var cursor = byId[id];
        var guard = 0;
        while (cursor && guard < 40) {
            chain.unshift(cursor);
            cursor = cursor.parentId ? byId[cursor.parentId] : null;
            guard++;
        }
        return chain;
    }

    function caption(options, parent) {
        var label = '';
        options.forEach(function (node) {
            if (!label) label = node.typeLabel || '';
            else if (label !== node.typeLabel) label = '';
        });
        if (label) return label;
        return parent ? parent.name : '';
    }

    function mount(picker) {
        if (!picker || picker.getAttribute('data-ready') === '1') return;
        picker.setAttribute('data-ready', '1');
        var projectKey = picker.getAttribute('data-project') || '';
        var hidden = picker.querySelector('.asset-tree-picker-value');
        var levels = picker.querySelector('.asset-tree-picker-levels');
        var current = picker.querySelector('.asset-tree-picker-current');
        if (!projectKey || !hidden || !levels) return;
        ajax('/projects/' + encodeURIComponent(projectKey) + '/picker', function (status, nodes) {
            if (status !== 200 || !nodes) {
                levels.textContent = '';
                return;
            }
            var selected = hidden.value ? parseInt(hidden.value, 10) : null;
            draw(selected);

            function draw(value) {
                levels.innerHTML = '';
                var chain = value ? pathTo(nodes, value) : [];
                var parent = null;
                var depth = 0;
                while (depth < 40) {
                    var options = childrenOf(nodes, parent ? parent.id : null);
                    if (!options.length) break;
                    var chosen = chain[depth] || null;
                    levels.appendChild(level(options, parent, chosen, depth));
                    if (!chosen) break;
                    parent = chosen;
                    depth++;
                }
                show(value);
            }

            function level(options, parent, chosen) {
                var wrap = el('label', 'asset-tree-picker-level');
                wrap.appendChild(el('span', null, caption(options, parent)));
                var select = el('select');
                var empty = el('option', null, '—');
                empty.value = '';
                select.appendChild(empty);
                options.forEach(function (node) {
                    var option = el('option', null, node.name);
                    option.value = String(node.id);
                    if (chosen && chosen.id === node.id) option.selected = true;
                    select.appendChild(option);
                });
                select.addEventListener('change', function () {
                    if (!select.value) {
                        hidden.value = parent ? String(parent.id) : '';
                    } else {
                        hidden.value = select.value;
                    }
                    draw(hidden.value ? parseInt(hidden.value, 10) : null);
                });
                wrap.appendChild(select);
                return wrap;
            }

            function show(value) {
                if (!current) return;
                var chain = value ? pathTo(nodes, value) : [];
                current.textContent = chain.map(function (node) { return node.name; }).join('  /  ');
            }
        });
    }

    function boot() {
        var pickers = document.querySelectorAll('.asset-tree-picker');
        for (var i = 0; i < pickers.length; i++) mount(pickers[i]);
    }

    if (window.AJS && AJS.toInit) AJS.toInit(boot);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
    setTimeout(boot, 400);
})();
