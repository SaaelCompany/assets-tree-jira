(function () {
    'use strict';
    if (window.__assetTreeFieldBoot) return;
    window.__assetTreeFieldBoot = true;

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
        return norm(String(value || '')
            .replace(/\((?:необязательно|optional)\)/gi, ' ')
            .replace(/[*:]/g, ' '));
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
        var hidden = picker.valueInput || picker.querySelector('.asset-tree-picker-value');
        var levels = picker.querySelector('.asset-tree-picker-levels');
        var current = picker.querySelector('.asset-tree-picker-current');
        var waitText = picker.getAttribute('data-wait') || phrase('wait');
        var chooseText = picker.getAttribute('data-choose') || phrase('choose');
        var emptyText = picker.getAttribute('data-empty') || phrase('empty');
        var flat = !!picker.valueInput;
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
            if (locked || flat) {
                if (locked && !rootId) {
                    hidden.value = '';
                    drawList(null, true);
                    return;
                }
                if (rootId && value && !listedContains(rootId, value)) {
                    hidden.value = '';
                }
                drawList(locked ? rootId : null, false);
                return;
            }
            if (rootId && (!value || !contains(byId, rootId, value))) {
                hidden.value = String(rootId);
                value = rootId;
            }
            draw(value, rootId);
        }

        function listedContains(rootId, id) {
            var items = listed(rootId);
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === id) return true;
            }
            return false;
        }

        function listed(rootId) {
            var items = [];
            (nodes || []).forEach(function (node) {
                if (rootId && !contains(byId, rootId, node.id)) return;
                items.push(node);
            });
            if (rootId && childrenOf(nodes, rootId).length) {
                items = items.filter(function (node) { return node.id !== rootId; });
            }
            items.sort(function (left, right) {
                return labelOf(left).localeCompare(labelOf(right));
            });
            return items;
        }

        function labelOf(node) {
            return pathTo(byId, node.id).map(function (item) { return item.name; }).join(' / ');
        }

        function drawList(rootId, waiting) {
            levels.innerHTML = '';
            if (waiting) {
                var waitingSelect = el('select');
                waitingSelect.disabled = true;
                var placeholder = el('option', null, '—');
                placeholder.value = '';
                waitingSelect.appendChild(placeholder);
                levels.appendChild(waitingSelect);
                levels.appendChild(el('p', 'asset-tree-picker-wait', waitText));
                if (current) current.textContent = '';
                return;
            }
            if (rootId && byId[rootId]) {
                levels.appendChild(el('p', 'asset-tree-picker-root', labelOf(byId[rootId])));
            }
            var options = listed(rootId);
            var select = el('select');
            var empty = el('option', null, chooseText);
            empty.value = '';
            select.appendChild(empty);
            options.forEach(function (node) {
                var option = el('option', null, labelOf(node));
                option.value = String(node.id);
                if (hidden.value === option.value) option.selected = true;
                select.appendChild(option);
            });
            select.addEventListener('change', function () {
                hidden.value = select.value;
                show(hidden.value ? parseInt(hidden.value, 10) : null);
            });
            levels.appendChild(select);
            if (!options.length) levels.appendChild(el('p', 'asset-tree-picker-wait', emptyText));
            show(hidden.value ? parseInt(hidden.value, 10) : null);
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

    function phrase(kind) {
        var lang = (document.documentElement.getAttribute('lang') || '').toLowerCase();
        var ru = lang.indexOf('ru') === 0;
        if (kind === 'choose') return ru ? 'Выберите актив' : 'Choose an asset';
        if (kind === 'empty') return ru ? 'В этом месте нет активов' : 'No assets in this place';
        return ru
            ? 'Заполните поля выше. Список активов откроется на подходящей площадке.'
            : 'Fill in the fields above. The asset list will open at the matching place.';
    }

    function bootMarker() {
        return document.getElementById('asset-tree-portal-boot');
    }

    function projectFromPage() {
        var marker = bootMarker();
        if (marker && marker.getAttribute('data-project')) return marker.getAttribute('data-project');
        var meta = document.querySelector('meta[name="ajs-project-key"]');
        if (meta && meta.getAttribute('content')) return meta.getAttribute('content');
        var marked = document.querySelector('[data-project-key]');
        if (marked && marked.getAttribute('data-project-key')) return marked.getAttribute('data-project-key');
        var match = /(?:\?|&)project=([A-Za-z][A-Za-z0-9_]*)/.exec(window.location.search || '');
        if (match) return match[1];
        var embedded = /"projectKey"\s*:\s*"([A-Z][A-Z0-9_]*)"/.exec(document.body ? document.body.innerHTML : '');
        return embedded ? embedded[1] : '';
    }

    function fieldsFromPage() {
        var marker = bootMarker();
        if (!marker) return [];
        var parts = (marker.getAttribute('data-fields') || '').split(',');
        var ids = [];
        for (var i = 0; i < parts.length; i++) {
            var id = parts[i].replace(/^\s+|\s+$/g, '');
            if (id.indexOf('customfield_') === 0) ids.push(id);
        }
        return ids;
    }

    function portalIdFromLocation() {
        var match = /\/portal\/(\d+)/.exec(window.location.pathname || '');
        if (match) return match[1];
        var marker = bootMarker();
        if (marker && marker.getAttribute('data-portal')) return marker.getAttribute('data-portal');
        var meta = document.querySelector('meta[name="ajs-portal-id"], meta[name="ajs-portalid"]');
        return meta ? (meta.getAttribute('content') || '') : '';
    }

    var fieldContext = null;
    var fieldWaiters = null;

    function contextComplete(ctx) {
        return !!(ctx && ctx.projectKey && ctx.fieldsSettled);
    }

    function loadFieldContext(done) {
        if (contextComplete(fieldContext)) {
            done(fieldContext);
            return;
        }
        if (fieldWaiters) {
            fieldWaiters.push(done);
            return;
        }
        fieldWaiters = [done];
        var knownFields = fieldsFromPage();
        var ctx = {
            fields: knownFields,
            fieldsSettled: knownFields.length > 0,
            projectKey: projectFromPage()
        };
        var pending = 1;
        function finish() {
            if (--pending > 0) return;
            if (contextComplete(ctx)) fieldContext = ctx;
            var waiters = fieldWaiters;
            fieldWaiters = null;
            for (var i = 0; i < waiters.length; i++) waiters[i](ctx);
        }
        if (!ctx.fieldsSettled) {
            pending++;
            ajax('/asset-fields', function (status, payload) {
                if (status === 200 && payload && payload.fields) {
                    ctx.fields = payload.fields;
                    ctx.fieldsSettled = true;
                }
                finish();
            });
        }
        var portalId = portalIdFromLocation();
        if (!ctx.projectKey && portalId) {
            pending++;
            ajax('/portals/' + encodeURIComponent(portalId), function (status, payload) {
                if (status === 200 && payload && payload.projectKey) {
                    ctx.projectKey = payload.projectKey;
                    finish();
                    return;
                }
                serviceDeskProject(portalId, function (key) {
                    if (key) ctx.projectKey = key;
                    finish();
                });
            });
        }
        finish();
    }

    function serviceDeskProject(portalId, done) {
        var paths = ['/rest/servicedeskapi/portals/', '/rest/servicedeskapi/servicedesk/'];
        var index = 0;
        function next() {
            if (index >= paths.length) {
                done('');
                return;
            }
            var xhr = new XMLHttpRequest();
            xhr.open('GET', contextPath() + paths[index] + encodeURIComponent(portalId), true);
            index++;
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('X-Atlassian-Token', 'no-check');
            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) return;
                var key = '';
                if (xhr.status === 200 && xhr.responseText) {
                    try {
                        var payload = JSON.parse(xhr.responseText);
                        key = payload && payload.projectKey ? payload.projectKey : '';
                    } catch (error) {
                        key = '';
                    }
                }
                if (key) done(key);
                else next();
            };
            xhr.send(null);
        }
        next();
    }

    function hideNative(input) {
        input.setAttribute('data-asset-tree', '1');
        input.className = (input.className ? input.className + ' ' : '') + 'asset-tree-picker-native';
        if (input.style && input.style.setProperty) input.style.setProperty('display', 'none', 'important');
        else input.style.display = 'none';
    }

    function adoptTextFields(ctx) {
        if (!ctx || !ctx.projectKey || !ctx.fields || !ctx.fields.length) return;
        for (var f = 0; f < ctx.fields.length; f++) {
            var id = ctx.fields[f];
            var inputs = document.querySelectorAll(
                'input[name="' + id + '"], textarea[name="' + id + '"], input[id="' + id + '"], textarea[id="' + id + '"]'
            );
            for (var i = 0; i < inputs.length; i++) {
                var input = inputs[i];
                if (input.getAttribute('data-asset-tree') === '1' || insidePicker(input) || input.type === 'hidden') continue;
                hideNative(input);
                var picker = el('div', 'asset-tree-picker');
                picker.setAttribute('data-project', ctx.projectKey);
                picker.setAttribute('data-wait', phrase('wait'));
                picker.setAttribute('data-choose', phrase('choose'));
                picker.setAttribute('data-empty', phrase('empty'));
                picker.valueInput = input;
                picker.appendChild(el('div', 'asset-tree-picker-levels'));
                picker.appendChild(el('p', 'asset-tree-picker-current'));
                if (input.nextSibling) input.parentNode.insertBefore(picker, input.nextSibling);
                else if (input.parentNode) input.parentNode.appendChild(picker);
            }
        }
    }

    function boot() {
        var pickers = document.querySelectorAll('.asset-tree-picker');
        for (var i = 0; i < pickers.length; i++) mount(pickers[i]);
        var inputs = document.querySelectorAll('input[name^="customfield_"], textarea[name^="customfield_"], input[id^="customfield_"], textarea[id^="customfield_"]');
        if (!inputs.length) return;
        loadFieldContext(function (ctx) {
            adoptTextFields(ctx);
            var created = document.querySelectorAll('.asset-tree-picker');
            for (var n = 0; n < created.length; n++) mount(created[n]);
        });
    }

    function watch() {
        if (!document.body) {
            setTimeout(watch, 50);
            return;
        }
        if (!watch.started && window.MutationObserver) {
            watch.started = true;
            var observer = new MutationObserver(function () { boot(); });
            observer.observe(document.body, { childList: true, subtree: true });
        }
        boot();
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

    if (window.AJS && AJS.toInit) AJS.toInit(watch);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch);
    else watch();
    var polls = 0;
    var timer = setInterval(function () {
        watch();
        if (++polls >= 40) clearInterval(timer);
    }, 500);
})();
