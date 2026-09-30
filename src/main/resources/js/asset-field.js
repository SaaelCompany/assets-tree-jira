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

    function norm(value) {
        return String(value || '').replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ').toLowerCase();
    }

    function ownText(node) {
        if (!node) return '';
        var copy = node.cloneNode(true);
        var nested = copy.querySelectorAll('select, input, textarea, button');
        for (var i = nested.length - 1; i >= 0; i--) {
            if (nested[i].parentNode) nested[i].parentNode.removeChild(nested[i]);
        }
        return norm(copy.textContent || copy.innerText || '');
    }

    function fieldCaption(control) {
        var labels;
        var i;
        if (control.id) {
            labels = document.getElementsByTagName('label');
            for (i = 0; i < labels.length; i++) {
                if (labels[i].htmlFor === control.id) {
                    var direct = tidy(ownText(labels[i]));
                    if (direct) return direct;
                }
            }
        }
        var node = control.parentNode;
        var guard = 0;
        while (node && guard < 6) {
            if (node.tagName && node.tagName.toLowerCase() === 'label') {
                var wrapped = tidy(ownText(node));
                if (wrapped) return wrapped;
            }
            if (node.tagName && node.tagName.toLowerCase() === 'form') break;
            node = node.parentNode;
            guard++;
        }
        return tidy(control.name || control.id || '');
    }

    function tidy(value) {
        return norm(String(value || '').replace(/[*:]/g, ' '));
    }

    function formOf(node) {
        while (node) {
            if (node.tagName && node.tagName.toLowerCase() === 'form') return node;
            node = node.parentNode;
        }
        return document;
    }

    function insidePicker(node) {
        while (node) {
            if (node.className && (' ' + node.className + ' ').indexOf(' asset-tree-picker ') !== -1) return true;
            node = node.parentNode;
        }
        return false;
    }

    function readAnswers(picker) {
        var form = formOf(picker);
        var answers = [];
        var selects = form.querySelectorAll('select');
        var i;
        for (i = 0; i < selects.length; i++) {
            var select = selects[i];
            if (insidePicker(select) || !select.value) continue;
            var chosen = select.options[select.selectedIndex];
            answers.push({
                label: fieldCaption(select),
                id: norm(select.id),
                name: norm(select.name),
                text: chosen ? (chosen.text || '') : '',
                value: select.value
            });
        }
        return answers;
    }

    /* Same precedence as PortalRules.choose: more conditions win, then the deeper place. */
    function chooseRule(rules, answers, byId) {
        var best = null;
        var bestScore = -1;
        var bestDepth = -1;
        (rules || []).forEach(function (rule) {
            if (!rule || !rule.conditions || !rule.conditions.length) return;
            var ok = rule.conditions.every(function (condition) {
                var field = norm(condition.field);
                var option = norm(condition.option);
                if (!field || !option) return false;
                return answers.some(function (answer) {
                    if (!norm(answer.value)) return false;
                    var sameField = field === norm(answer.label) || field === norm(answer.id) || field === norm(answer.name);
                    return sameField && (option === norm(answer.text) || option === norm(answer.value));
                });
            });
            if (!ok) return;
            var score = rule.conditions.length;
            var depth = depthOf(rule.assetId, byId);
            if (score > bestScore || (score === bestScore && depth > bestDepth)) {
                best = rule;
                bestScore = score;
                bestDepth = depth;
            }
        });
        return best;
    }

    function depthOf(id, byId) {
        var depth = 0;
        var cursor = byId[id];
        var guard = 0;
        while (cursor && guard < 40) {
            depth++;
            cursor = cursor.parentId ? byId[cursor.parentId] : null;
            guard++;
        }
        return depth;
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

    function pathTo(byId, id) {
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

    function contains(byId, rootId, id) {
        var cursor = byId[id];
        var guard = 0;
        while (cursor && guard < 40) {
            if (cursor.id === rootId) return true;
            cursor = cursor.parentId ? byId[cursor.parentId] : null;
            guard++;
        }
        return false;
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
        var waitText = picker.getAttribute('data-wait') || '';
        if (!projectKey || !hidden || !levels) return;
        var nodes = null;
        var byId = {};
        var rules = [];
        var rulesReady = false;
        var nodesReady = false;
        var appliedRoot = undefined;
        var appliedLock = undefined;

        ajax('/projects/' + encodeURIComponent(projectKey) + '/picker', function (status, payload) {
            nodesReady = true;
            nodes = status === 200 && payload ? payload : [];
            byId = indexOf(nodes);
            if (rulesReady) applyPortal(true);
        });
        ajax('/projects/' + encodeURIComponent(projectKey) + '/portal-rules', function (status, payload) {
            rulesReady = true;
            rules = status === 200 && payload ? payload : [];
            if (nodesReady) applyPortal(true);
        });

        function applyPortal(force) {
            if (!nodesReady || !rulesReady) return;
            var locked = rules.length > 0;
            var rule = locked ? chooseRule(rules, readAnswers(picker), byId) : null;
            var rootId = rule ? rule.assetId : null;
            if (!force && rootId === appliedRoot && locked === appliedLock) return;
            appliedRoot = rootId;
            appliedLock = locked;
            var value = hidden.value ? parseInt(hidden.value, 10) : null;
            if (locked && !rootId) {
                hidden.value = '';
                draw(null, null);
                return;
            }
            if (rootId && (!value || !contains(byId, rootId, value))) {
                hidden.value = String(rootId);
                value = rootId;
            }
            draw(value, rootId);
        }

        function draw(value, rootId) {
            levels.innerHTML = '';
            if (rules.length && !rootId) {
                levels.appendChild(el('p', 'asset-tree-picker-wait', waitText));
                if (current) current.textContent = '';
                return;
            }
            var chain = value ? pathTo(byId, value) : [];
            var parent = null;
            var depth = 0;
            if (rootId && byId[rootId]) {
                var rootPath = pathTo(byId, rootId);
                levels.appendChild(el('p', 'asset-tree-picker-root', rootPath.map(function (node) { return node.name; }).join('  /  ')));
                parent = byId[rootId];
                depth = rootPath.length;
            }
            while (depth < 40) {
                var options = childrenOf(nodes, parent ? parent.id : null);
                if (!options.length) break;
                var chosen = chain[depth] || null;
                levels.appendChild(level(options, parent, chosen));
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
                var rootId = appliedLock ? appliedRoot : null;
                draw(hidden.value ? parseInt(hidden.value, 10) : null, rootId);
            });
            wrap.appendChild(select);
            return wrap;
        }

        function show(value) {
            if (!current) return;
            var chain = value ? pathTo(byId, value) : [];
            current.textContent = chain.map(function (node) { return node.name; }).join('  /  ');
        }

        picker.applyPortal = function () { applyPortal(false); };
    }

    function boot() {
        var pickers = document.querySelectorAll('.asset-tree-picker');
        for (var i = 0; i < pickers.length; i++) mount(pickers[i]);
    }

    function refresh() {
        var pickers = document.querySelectorAll('.asset-tree-picker');
        for (var i = 0; i < pickers.length; i++) {
            if (pickers[i].applyPortal) pickers[i].applyPortal();
        }
    }

    document.addEventListener('change', function (event) {
        var target = event.target;
        if (!target || insidePicker(target)) return;
        var tag = target.tagName ? target.tagName.toLowerCase() : '';
        if (tag !== 'select' && target.type !== 'radio') return;
        refresh();
    });

    if (window.AJS && AJS.toInit) AJS.toInit(boot);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
    setTimeout(boot, 400);
    if (window.MutationObserver && document.body) {
        var observer = new MutationObserver(function () { boot(); });
        observer.observe(document.body, { childList: true, subtree: true });
    }
})();
