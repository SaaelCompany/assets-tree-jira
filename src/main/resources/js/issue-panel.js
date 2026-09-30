(function () {
    'use strict';

    function contextPath() {
        if (window.AJS && typeof AJS.contextPath === 'function') {
            return AJS.contextPath();
        }
        var meta = document.querySelector('meta[name="ajs-context-path"]');
        return meta ? (meta.getAttribute('content') || '') : '';
    }

    function restBase() {
        return contextPath() + '/rest/asset-tree/1.0';
    }

    function ajax(method, path, body, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, restBase() + path, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('X-Atlassian-Token', 'no-check');
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;
            var payload = null;
            if (xhr.responseText) {
                try { payload = JSON.parse(xhr.responseText); } catch (error) { payload = { message: xhr.responseText }; }
            }
            callback(xhr.status, payload);
        };
        xhr.send(body ? JSON.stringify(body) : null);
    }

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined && text !== null) node.textContent = text;
        return node;
    }

    function t(i18n, key) {
        return (i18n && i18n[key]) || key;
    }

    function boot() {
        var panel = document.getElementById('asset-tree-panel');
        if (!panel || panel.getAttribute('data-ready') === '1') return;
        panel.setAttribute('data-ready', '1');
        var issueId = panel.getAttribute('data-issue-id');
        if (!issueId) return;
        ajax('GET', '/meta', null, function (status, meta) {
            var i18n = status === 200 && meta ? meta.i18n : {};
            ajax('GET', '/issues/' + issueId + '/context', null, function (contextStatus, context) {
                var canEdit = contextStatus === 200 && context ? !!context.canEdit : false;
                var projectKey = contextStatus === 200 && context ? context.projectKey : '';
                render(panel, issueId, i18n, canEdit, projectKey);
                loadLinks(panel, issueId, i18n, canEdit, projectKey);
            });
        });
    }

    function render(panel, issueId, i18n, canEdit, projectKey) {
        panel.innerHTML = '';
        panel.appendChild(el('p', 'asset-tree-panel-hint', t(i18n, 'panelHint')));
        if (canEdit) {
            var input = el('input');
            input.type = 'search';
            input.placeholder = t(i18n, 'panelSearch');
            var results = el('ul', 'asset-tree-panel-results');
            var timer = null;
            input.addEventListener('input', function () {
                clearTimeout(timer);
                var query = input.value.trim();
                timer = setTimeout(function () {
                    if (query.length < 1) {
                        results.innerHTML = '';
                        return;
                    }
                    ajax('GET', '/issues/' + issueId + '/search?q=' + encodeURIComponent(query), null, function (status, payload) {
                        results.innerHTML = '';
                        if (status !== 200) return;
                        (payload || []).slice(0, 8).forEach(function (asset) {
                            var item = el('li');
                            var hit = el('button', 'asset-tree-panel-hit');
                            hit.appendChild(el('span', null, asset.name));
                            hit.appendChild(el('span', 'asset-tree-panel-key', asset.objectKey));
                            hit.addEventListener('click', function () {
                                ajax('POST', '/issues/' + issueId + '/assets', { assetId: asset.id }, function (linkStatus) {
                                    if (linkStatus >= 200 && linkStatus < 300) {
                                        input.value = '';
                                        results.innerHTML = '';
                                        loadLinks(panel, issueId, i18n, canEdit, projectKey);
                                    }
                                });
                            });
                            item.appendChild(hit);
                            results.appendChild(item);
                        });
                    });
                }, 220);
            });
            panel.appendChild(input);
            panel.appendChild(results);
        }
        var list = el('ul', 'asset-tree-panel-list');
        list.id = 'asset-tree-panel-list';
        panel.appendChild(list);
        var open = el('a', null, t(i18n, 'openTree'));
        open.href = contextPath() + '/plugins/servlet/asset-tree' + (projectKey ? '?project=' + encodeURIComponent(projectKey) : '');
        open.style.display = 'inline-block';
        open.style.marginTop = '8px';
        panel.appendChild(open);
    }

    function loadLinks(panel, issueId, i18n, canEdit, projectKey) {
        var list = document.getElementById('asset-tree-panel-list');
        if (!list) return;
        ajax('GET', '/issues/' + issueId + '/assets', null, function (status, payload) {
            list.innerHTML = '';
            if (status !== 200) {
                list.appendChild(el('li', 'asset-tree-panel-error', (payload && payload.message) || t(i18n, 'errorTitle')));
                return;
            }
            var assets = payload || [];
            if (!assets.length) {
                list.appendChild(el('li', 'asset-tree-panel-empty', t(i18n, 'panelEmpty')));
                return;
            }
            assets.forEach(function (asset) {
                var item = el('li');
                var link = el('a', null, asset.objectKey + '  ' + asset.name + (asset.location ? ' · ' + asset.location : ''));
                link.href = contextPath() + '/plugins/servlet/asset-tree?project=' + encodeURIComponent(asset.projectKey || projectKey || '') + '#' + asset.id;
                item.appendChild(link);
                if (canEdit) {
                    var remove = el('button', null, '×');
                    remove.setAttribute('aria-label', t(i18n, 'unlink'));
                    remove.addEventListener('click', function () {
                        ajax('DELETE', '/assets/' + asset.id + '/issues/' + issueId, null, function () {
                            loadLinks(panel, issueId, i18n, canEdit, projectKey);
                        });
                    });
                    item.appendChild(remove);
                }
                list.appendChild(item);
            });
        });
    }

    function start() {
        if (window.AJS && AJS.toInit) {
            AJS.toInit(boot);
        } else if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', boot);
        } else {
            boot();
        }
    }

    start();
})();
