(function () {
    'use strict';

    var app = document.getElementById('asset-tree-app');
    if (!app) {
        return;
    }

    var PALETTE = ['#0052CC', '#00875A', '#6554C0', '#FF991F', '#DE350B', '#00A3BF', '#172B4D', '#36B37E'];
    var DEFAULT_PLACE_ICON = 'building';
    var DEFAULT_OBJECT_ICON = 'device';
    var TYPE_ICONS = [
        { key: 'building', d: 'M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v4h4a1 1 0 0 1 1 1v11H4zM7 8h2V6H7v2zm4 0h2V6h-2v2zm-4 4h2v-2H7v2zm4 0h2v-2h-2v2zm6 0h2v-2h-2v2zM7 16h2v-2H7v2zm10 0h2v-2h-2v2zm-7 5h4v-4h-4v4z' },
        { key: 'warehouse', d: 'M2 21V9l10-5 10 5v12H2zm4-2h5v-4H6v4zm7 0h5v-4h-5v4zm-4-6h6v-3H9v3z' },
        { key: 'department', d: 'M5 3h14v18H5V3zm2 2v14h6V5H7zm4 6h1.5v2H11v-2z' },
        { key: 'office', d: 'M9 4h6a1 1 0 0 1 1 1v2h4a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h4V5a1 1 0 0 1 1-1zm1 3h4V6h-4v1zM3 12h18v1.5H3V12z' },
        { key: 'hospital', d: 'M3 21V7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v14H3zm7.5-12v2.5H8v3h2.5V17h3v-2.5H16v-3h-2.5V9h-3z' },
        { key: 'factory', d: 'M3 21V9l5 3V9l5 3V9l5 3V4h3v17H3zm3-4h2v-2H6v2zm5 0h2v-2h-2v2zm5 0h2v-2h-2v2z' },
        { key: 'store', d: 'M3 4h18v3l-1.5 3H4.5L3 7V4zm1 8h16v9H4v-9zm2 2v5h5v-5H6zm7 0v5h3v-5h-3z' },
        { key: 'home', d: 'M12 3l9 8h-2.5v10h-5v-6h-3v6h-5V11H3l9-8z' },
        { key: 'device', d: 'M7 7h10v10H7V7zm2 2v6h6V9H9zm2-7h2v3h-2V2zm0 17h2v3h-2v-3zM2 11h3v2H2v-2zm17 0h3v2h-3v-2zM6 2h2v3H6V2zm10 0h2v3h-2V2zM6 19h2v3H6v-3zm10 0h2v3h-2v-3zM2 6h3v2H2V6zm17 0h3v2h-3V6zM2 16h3v2H2v-2zm17 0h3v2h-3v-2z' },
        { key: 'desktop', d: 'M3 4h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-7v2h4v2H6v-2h4v-2H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm1 2v9h16V6H4z' },
        { key: 'laptop', d: 'M4 5h16a1 1 0 0 1 1 1v10H3V6a1 1 0 0 1 1-1zm1 2v7h14V7H5zM2 18h20v1.5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V18z' },
        { key: 'monitor', d: 'M2 5a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5zm2 1v10h16V6H4zm4 14h8v1.5H8V20z' },
        { key: 'server', d: 'M3 4h18v5H3V4zm0 6h18v5H3v-5zm0 6h18v5H3v-5zm2-10.5v2h2v-2H5zm0 6v2h2v-2H5zm0 6v2h2v-2H5z' },
        { key: 'printer', d: 'M7 3h10v4H7V3zM4 8h16a1 1 0 0 1 1 1v8h-4v4H7v-4H3V9a1 1 0 0 1 1-1zm5 6v5h6v-5H9zm9-3h-2v1.5h2V11z' },
        { key: 'scanner', d: 'M5 4l14 6.5H5V4zM3 12h18a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1zm14 3v2h3v-2h-3z' },
        { key: 'phone', d: 'M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm1 3v13h8V5H8zm3 14v1.5h2V19h-2z' },
        { key: 'tablet', d: 'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm2 2v13h12V5H6zm5 14.5v1h2v-1h-2z' },
        { key: 'camera', d: 'M9 4h6l1.5 2H20a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3.5L9 4zm3 5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z' },
        { key: 'network', d: 'M9 3h6v5H9V3zm2 5h2v3h-2V8zM4 11h16v2H4v-2zm0 2h2v3H4v-3zm7 0h2v3h-2v-3zm7 0h2v3h-2v-3zM2 16h6v5H2v-5zm7 0h6v5H9v-5zm7 0h6v5h-6v-5z' },
        { key: 'wifi', d: 'M12 20a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm-4.6-5.4l-2.1-2.1a9.5 9.5 0 0 1 13.4 0l-2.1 2.1a6.5 6.5 0 0 0-9.2 0zM3.5 9.5L1.4 7.4a15 15 0 0 1 21.2 0l-2.1 2.1a12 12 0 0 0-17 0z' },
        { key: 'storage', d: 'M12 3c5 0 9 1.3 9 3v3c0 1.7-4 3-9 3S3 10.7 3 9V6c0-1.7 4-3 9-3zm0 11c5 0 9-1.3 9-3v4c0 1.7-4 3-9 3s-9-1.3-9-3v-4c0 1.7 4 3 9 3zm0 6c5 0 9-1.3 9-3v1c0 1.7-4 3-9 3s-9-1.3-9-3v-1c0 1.7 4 3 9 3z' },
        { key: 'keyboard', d: 'M2 6h20a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm2 3v2h2V9H4zm4 0v2h2V9H8zm4 0v2h2V9h-2zm4 0v2h2V9h-2zM4 14v2h12v-2H4zm14 0v2h2v-2h-2z' },
        { key: 'projector', d: 'M2 8h13a5 5 0 0 1 0 8h-1v2h-2v-2H7v2H5v-2H2a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zm13 1.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3 11h6v2H3v-2zm16-5h4v1.5h-4V6zm0 4h4v1.5h-4V10zm0 4h4v1.5h-4V14z' },
        { key: 'battery', d: 'M13 2L4 14h6l-1 8 9-12h-6l1-8z' },
        { key: 'medical', d: 'M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11zm-1.25-13v2.25H8.5v2.5h2.25V15h2.5v-2.25h2.25v-2.5h-2.25V8h-2.5z' },
        { key: 'microscope', d: 'M9 2h6v2h-1v5.5l5.5 9.2A1.5 1.5 0 0 1 18.2 21H5.8a1.5 1.5 0 0 1-1.3-2.3L10 9.5V4H9V2z' },
        { key: 'tool', d: 'M21.7 6.3a5.5 5.5 0 0 1-7.1 6.9L7.4 20.4a2 2 0 0 1-2.8-2.8l7.2-7.2a5.5 5.5 0 0 1 6.9-7.1l-3.2 3.2 2.8 2.8 3.4-3z' },
        { key: 'vehicle', d: 'M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11h1a1 1 0 0 1 1 1v5h-2v2h-3v-2H8v2H5v-2H3v-5a1 1 0 0 1 1-1h1zm2.2 0h9.6l-1-3H8.2l-1 3zM6 13.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm12 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z' },
        { key: 'furniture', d: 'M6 3h12a1 1 0 0 1 1 1v8h-2v-2H7v2H5V4a1 1 0 0 1 1-1zM4 13h16a1 1 0 0 1 1 1v3h-2v4h-2v-4H7v4H5v-4H3v-3a1 1 0 0 1 1-1z' },
        { key: 'box', d: 'M12 3l9 4v10l-9 4-9-4V7l9-4zm0 2.2L6.5 7.6 12 10l5.5-2.4L12 5.2zM5 9.1v6.9l6 2.7v-6.9L5 9.1zm14 0l-6 2.7v6.9l6-2.7V9.1z' },
        { key: 'document', d: 'M6 2h8l6 6v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm7 1.5V9h5.5L13 3.5zM8 12h8v1.5H8V12zm0 4h8v1.5H8V16z' },
        { key: 'tag', d: 'M3 3h8.6a1 1 0 0 1 .7.3l8.4 8.4a1 1 0 0 1 0 1.4l-7.6 7.6a1 1 0 0 1-1.4 0L3.3 12.3A1 1 0 0 1 3 11.6V3zm4.5 3A1.5 1.5 0 1 0 7.5 9a1.5 1.5 0 0 0 0-3z' }
    ];
    var STATUSES = ['in_stock', 'in_use', 'repair', 'reserve', 'maintenance', 'written_off'];
    var CATEGORIES = ['todo', 'progress', 'done', 'blue', 'orange', 'red', 'purple', 'teal', 'gray', 'pink', 'lime', 'brown'];
    var state = {
        rest: app.getAttribute('data-rest-base') || '',
        initialProject: app.getAttribute('data-project') || '',
        i18n: {},
        locale: 'ru',
        canEdit: false,
        canCreate: false,
        canMove: false,
        canRemove: false,
        canComment: false,
        canConfigure: false,
        canGrant: false,
        canManage: false,
        treeReady: false,
        projects: [],
        projectKey: '',
        view: normalizeView(app.getAttribute('data-view')),
        userKey: '',
        displayName: '',
        pane: 'list',
        activityTab: 'all',
        mineAssets: null,
        searchHits: null,
        searching: false,
        searchToken: 0,
        assets: [],
        types: [],
        statuses: [],
        grants: null,
        selectedId: null,
        dirty: false,
        expanded: {},
        expansionReady: false,
        query: '',
        searchScope: 'project',
        sortKey: 'tree',
        sortDir: 'asc',
        rules: [],
        savedFilters: [],
        activeFilterId: '',
        focusSearch: String(app.getAttribute('data-view') || '').toLowerCase() === 'search',
        loading: true,
        error: null,
        draggingId: null,
        busy: false,
        report: null,
        holderQuery: '',
        holderUser: null,
        holderAssets: [],
        editing: false,
        detail: null,
        typeGroup: null,
        schemaTab: 'statuses',
        schemaTypeKey: '',
        schemaAdding: false,
        statusQuery: '',
        typeQuery: '',
        fieldQuery: '',
        grantQuery: ''
    };
    var idIndex = null;
    var noticeTimer = null;

    function normalizeView(raw) {
        var value = String(raw || '').toLowerCase();
        if (value === 'mine' || value === 'settings' || value === 'dashboard') {
            return value;
        }
        return 'all';
    }

    function viewTitle(view) {
        if (view === 'mine') return t('menuMine');
        if (view === 'settings') return t('menuSettings');
        if (view === 'dashboard') return t('menuDashboard');
        return t('menuAll');
    }

    function rememberView(view) {
        state.view = view;
        if (!window.history || !window.history.replaceState) {
            return;
        }
        var params = [];
        if (state.projectKey) {
            params.push('project=' + encodeURIComponent(state.projectKey));
        }
        params.push('view=' + encodeURIComponent(view || 'all'));
        var hash = window.location.hash || '';
        window.history.replaceState(null, '', window.location.pathname + '?' + params.join('&') + hash);
    }

    function t(key, arg) {
        var value = (state.i18n && state.i18n[key]) || key;
        if (arg !== undefined && arg !== null) {
            value = String(value).split('{0}').join(String(arg));
        }
        return value;
    }

    function ajax(method, path, body, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, state.rest + path, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('X-Atlassian-Token', 'no-check');
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }
            var payload = null;
            if (xhr.responseText) {
                try {
                    payload = JSON.parse(xhr.responseText);
                } catch (error) {
                    payload = { message: xhr.responseText };
                }
            }
            callback(xhr.status, payload);
        };
        xhr.send(body ? JSON.stringify(body) : null);
    }

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) {
            node.className = className;
        }
        if (text !== undefined && text !== null) {
            node.textContent = text;
        }
        return node;
    }

    function byId() {
        if (!idIndex) {
            idIndex = {};
            state.assets.forEach(function (asset) {
                idIndex[asset.id] = asset;
            });
        }
        return idIndex;
    }

    function invalidate() {
        idIndex = null;
    }

    function compareAssets(left, right) {
        if (left.sortOrder !== right.sortOrder) {
            return left.sortOrder - right.sortOrder;
        }
        return left.id - right.id;
    }

    function childrenOf(parentId) {
        return state.assets.filter(function (asset) {
            if (parentId === null) {
                return asset.parentId === null || asset.parentId === undefined || !byId()[asset.parentId];
            }
            return asset.parentId === parentId;
        }).sort(compareAssets);
    }

    function descendantsOf(id) {
        var result = [];
        var stack = childrenOf(id).map(function (asset) { return asset.id; });
        var seen = {};
        while (stack.length) {
            var current = stack.pop();
            if (seen[current]) {
                continue;
            }
            seen[current] = true;
            result.push(current);
            childrenOf(current).forEach(function (child) {
                stack.push(child.id);
            });
        }
        return result;
    }

    function typeOf(typeKey) {
        for (var i = 0; i < state.types.length; i++) {
            if (state.types[i].typeKey === typeKey) {
                return state.types[i];
            }
        }
        return { typeKey: typeKey, label: typeKey || '', color: '#5D6B82', systemType: false, assetCount: 0 };
    }

    /* Type of an asset; falls back to what the server sent with the asset when the type is not loaded (other projects). */
    function typeFor(asset) {
        if (!asset) return typeOf('');
        for (var i = 0; i < state.types.length; i++) {
            if (state.types[i].typeKey === asset.typeKey) return state.types[i];
        }
        return {
            typeKey: asset.typeKey, label: asset.typeLabel || asset.typeKey || '',
            color: asset.color || '#5D6B82', icon: asset.icon, systemType: false, assetCount: 0
        };
    }

    function builtinStatusLabel(status) {
        if (status === 'in_stock') return t('statusStock');
        if (status === 'in_use' || status === 'active') return t('statusInUse');
        if (status === 'repair') return t('statusRepair');
        if (status === 'reserve' || status === 'inactive') return t('statusReserve');
        if (status === 'maintenance') return t('statusMaintenance');
        if (status === 'written_off' || status === 'retired') return t('statusWrittenOff');
        return status || '';
    }

    function statusRecord(status) {
        var key = status;
        if (status === 'active') key = 'in_use';
        if (status === 'inactive') key = 'reserve';
        if (status === 'retired') key = 'written_off';
        var list = state.statuses || [];
        for (var i = 0; i < list.length; i++) {
            if (list[i].statusKey === key) return list[i];
        }
        return null;
    }

    function defaultCategory(status) {
        if (status === 'written_off' || status === 'retired') return 'done';
        if (status === 'in_use' || status === 'active' || status === 'repair' || status === 'maintenance') return 'progress';
        return 'todo';
    }

    function statusLabel(status) {
        var found = statusRecord(status);
        if (found && found.label) return found.label;
        return builtinStatusLabel(status);
    }

    function statusClass(status) {
        var found = statusRecord(status);
        var category = found && found.category ? found.category : defaultCategory(status);
        return (status || '') + ' cat-' + category;
    }

    function statusChoices() {
        if (state.statuses && state.statuses.length) {
            return state.statuses.map(function (item) {
                return { value: item.statusKey, label: item.label || statusLabel(item.statusKey) };
            });
        }
        return STATUSES.map(function (status) {
            return { value: status, label: builtinStatusLabel(status) };
        });
    }

    function categoryLabel(category) {
        var names = {
            progress: 'statusProgress',
            done: 'statusDone',
            blue: 'statusBlue',
            orange: 'statusOrange',
            red: 'statusRed',
            purple: 'statusPurple',
            teal: 'statusTeal',
            gray: 'statusGray',
            pink: 'statusPink',
            lime: 'statusLime',
            brown: 'statusBrown'
        };
        return t(names[category] || 'statusTodo');
    }

    var CATEGORY_COLORS = {
        todo: '#4a6785',
        progress: '#ffd351',
        done: '#14892c',
        blue: '#0052cc',
        orange: '#ff8b00',
        red: '#de350b',
        purple: '#6554c0',
        teal: '#00a3bf',
        gray: '#6b778c',
        pink: '#cd519d',
        lime: '#36b37e',
        brown: '#974f0c'
    };

    function categoryColor(key) {
        return CATEGORY_COLORS[key] || CATEGORY_COLORS.todo;
    }

    function paintDot(dot, key) {
        dot.style.setProperty('background', categoryColor(key), 'important');
        dot.title = categoryLabel(key);
        dot.setAttribute('aria-label', categoryLabel(key));
    }

    function closeColorMenu() {
        var menu = document.getElementById('asset-tree-color-menu');
        if (!menu) return;
        if (menu._outside) document.removeEventListener('mousedown', menu._outside);
        if (menu.parentNode) menu.parentNode.removeChild(menu);
    }

    function openColorMenu(anchor, selected, onPick) {
        var existing = document.getElementById('asset-tree-color-menu');
        if (existing && existing._anchor === anchor) {
            closeColorMenu();
            return;
        }
        closeColorMenu();
        var menu = el('div', 'asset-tree-color-menu');
        menu.id = 'asset-tree-color-menu';
        menu._anchor = anchor;
        var grid = el('div', 'asset-tree-color-grid');
        var caption = el('div', 'asset-tree-color-caption', categoryLabel(selected));
        CATEGORIES.forEach(function (key) {
            var dot = button('', 'asset-tree-color-dot' + (key === selected ? ' is-selected' : ''), function (event) {
                event.stopPropagation();
                closeColorMenu();
                if (key !== selected) onPick(key);
            });
            paintDot(dot, key);
            dot.addEventListener('mouseenter', function () {
                caption.textContent = categoryLabel(key);
            });
            grid.appendChild(dot);
        });
        menu.appendChild(grid);
        menu.appendChild(caption);
        app.appendChild(menu);
        var box = anchor.getBoundingClientRect();
        menu.style.top = (box.bottom + 6) + 'px';
        menu.style.left = Math.max(8, Math.min(box.left - 8, window.innerWidth - 204)) + 'px';
        function outside(event) {
            if (menu.contains(event.target) || anchor.contains(event.target)) return;
            closeColorMenu();
        }
        menu._outside = outside;
        setTimeout(function () {
            document.addEventListener('mousedown', outside);
        }, 0);
    }

    function colorTrigger(selected, onPick) {
        var trigger = button('', 'asset-tree-color-trigger', function (event) {
            event.stopPropagation();
            openColorMenu(trigger, selected, onPick);
        });
        paintDot(trigger, selected);
        trigger.setAttribute('aria-haspopup', 'dialog');
        return trigger;
    }

    var CAP_KEYS = ['view', 'create', 'edit', 'move', 'remove', 'comment', 'schema', 'access'];
    var CAP_CHOICES = ['view', 'create', 'edit', 'move', 'schema', 'access'];

    function applyRights(project) {
        function present(name) {
            return project && project[name] !== undefined && project[name] !== null;
        }
        state.canEdit = present('canChange') ? !!project.canChange : !!(project && project.canEdit);
        state.canCreate = present('canCreate') ? !!project.canCreate : state.canEdit;
        state.canMove = present('canMove') ? !!project.canMove : state.canEdit;
        state.canRemove = present('canRemove') ? !!project.canRemove : state.canEdit;
        state.canComment = present('canComment') ? !!project.canComment : state.canEdit;
        state.canConfigure = present('canConfigure') ? !!project.canConfigure : state.canEdit;
        state.canGrant = present('canGrant') ? !!project.canGrant : state.canConfigure;
    }

    function grantCaps(grant) {
        if (grant && grant.caps) {
            return String(grant.caps).split(',').map(function (item) { return item.trim(); }).filter(Boolean);
        }
        if (grant && grant.level === 'manage') return CAP_KEYS.slice();
        if (grant && grant.level === 'edit') return ['view', 'create', 'edit', 'move', 'remove', 'comment'];
        return ['view'];
    }

    function capLabel(key) {
        var names = {
            view: 'capView',
            create: 'capCreate',
            edit: 'capEdit',
            move: 'capMove',
            remove: 'capRemove',
            comment: 'capComment',
            schema: 'capSchema',
            access: 'capAccess'
        };
        return t(names[key] || 'capView');
    }

    function capHint(key) {
        var names = {
            view: 'capViewHint',
            create: 'capCreateHint',
            edit: 'capEditHint',
            move: 'capMoveHint',
            remove: 'capRemoveHint',
            comment: 'capCommentHint',
            schema: 'capSchemaHint',
            access: 'capAccessHint'
        };
        return t(names[key] || 'capViewHint');
    }

    function capsJoined(keys) {
        var present = {};
        (keys || []).forEach(function (key) {
            if (CAP_KEYS.indexOf(key) >= 0) present[key] = true;
        });
        if (present.create) {
            present.remove = true;
            present.comment = true;
        }
        var other = CAP_KEYS.some(function (key) {
            return key !== 'view' && present[key];
        });
        if (other) present.view = true;
        return CAP_KEYS.filter(function (key) { return present[key]; }).join(',');
    }

    function presetCaps(kind) {
        if (kind === 'view') return 'view';
        if (kind === 'tree') return 'view,create,edit,move,remove,comment';
        return CAP_KEYS.join(',');
    }

    function rememberGrant(payload) {
        var next = (state.grants || []).filter(function (item) {
            return item.groupName !== payload.groupName;
        });
        next.push(payload);
        next.sort(function (left, right) {
            return String(left.groupName || '').localeCompare(String(right.groupName || ''));
        });
        state.grants = next;
    }

    function postGrant(groupName, caps, errorNode) {
        ajax('POST', '/projects/' + encodeURIComponent(state.projectKey) + '/grants', {
            groupName: groupName,
            caps: caps
        }, function (status, payload) {
            if (status >= 200 && status < 300) {
                rememberGrant(payload);
                renderFrame();
            } else if (errorNode) {
                errorNode.hidden = false;
                errorNode.textContent = (payload && payload.message) || t('errorTitle');
            } else {
                notify((payload && payload.message) || t('errorTitle'));
                renderFrame();
            }
        });
    }

    function capCheckbox(key, checked, onChange) {
        var label = el('label', 'asset-tree-check');
        label.title = capHint(key);
        var box = document.createElement('input');
        box.type = 'checkbox';
        box.checked = !!checked;
        box.addEventListener('change', function () {
            onChange(!!box.checked);
        });
        label.appendChild(box);
        label.appendChild(document.createTextNode(capLabel(key)));
        return label;
    }

    function capGrid(selected, onToggle) {
        var grid = el('div', 'asset-tree-caps');
        CAP_CHOICES.forEach(function (key) {
            grid.appendChild(capCheckbox(key, selected.indexOf(key) >= 0, function (checked) {
                onToggle(key, checked);
            }));
        });
        return grid;
    }

    function capPresets(onPick) {
        var row = el('div', 'asset-tree-cap-presets');
        [['view', 'capPresetView'], ['tree', 'capPresetTree'], ['all', 'capPresetAll']].forEach(function (pair) {
            row.appendChild(button(t(pair[1]), 'asset-tree-btn', function () {
                onPick(presetCaps(pair[0]));
            }));
        });
        return row;
    }

    function currentProject() {
        for (var i = 0; i < state.projects.length; i++) {
            if (state.projects[i].key === state.projectKey) return state.projects[i];
        }
        return null;
    }

    function haystack(asset) {
        var parts = [asset.name || '', asset.objectKey || '', asset.description || '', asset.typeLabel || '', asset.location || ''];
        if (asset.custodian) {
            parts.push(asset.custodian.displayName || '', asset.custodian.email || '', asset.custodian.department || '');
        }
        (asset.attributes || []).forEach(function (attribute) {
            parts.push(attribute.name || '', attribute.value || '');
        });
        return parts.join('\n').toLowerCase();
    }

    function textQuery() {
        return state.query.trim();
    }

    function useRemoteSearch() {
        return state.searchScope === 'all' && textQuery().length >= 2;
    }

    function projectFiltering() {
        if (useRemoteSearch()) {
            return false;
        }
        return !!(textQuery() || (state.rules && state.rules.length));
    }

    function visibleSet() {
        if (!projectFiltering()) {
            return null;
        }
        var matched = {};
        state.assets.forEach(function (asset) {
            if (assetMatches(asset)) {
                matched[asset.id] = true;
            }
        });
        var visible = {};
        Object.keys(matched).forEach(function (id) {
            var current = byId()[id];
            var guard = 0;
            while (current && guard < 80) {
                visible[current.id] = true;
                current = current.parentId ? byId()[current.parentId] : null;
                guard++;
            }
        });
        visible.__matches = matched;
        return visible;
    }

    function isExpanded(id) {
        if (projectFiltering()) {
            return true;
        }
        return !!state.expanded[id];
    }

    function filterFields() {
        var fields = [
            { key: 'name', label: t('name'), kind: 'text' },
            { key: 'type', label: t('type'), kind: 'type' },
            { key: 'status', label: t('status'), kind: 'status' },
            { key: 'custodian', label: t('custodian'), kind: 'text' },
            { key: 'updated', label: t('updated'), kind: 'text' }
        ];
        var seen = {};
        state.types.forEach(function (type) {
            (type.fields || []).forEach(function (field) {
                if (!field.fieldKey || seen[field.fieldKey]) return;
                seen[field.fieldKey] = true;
                fields.push({ key: 'attr:' + field.fieldKey, label: field.label, kind: field.kind || 'text' });
            });
        });
        return fields;
    }

    function fieldSpec(key) {
        var fields = filterFields();
        for (var i = 0; i < fields.length; i++) {
            if (fields[i].key === key) return fields[i];
        }
        return { key: key, label: key, kind: 'text' };
    }

    function opsFor(kind) {
        if (kind === 'number') return ['eq', 'gt', 'lt', 'empty', 'notEmpty'];
        if (kind === 'type' || kind === 'status') return ['eq'];
        return ['contains', 'eq', 'empty', 'notEmpty'];
    }

    function opLabel(op) {
        if (op === 'eq') return t('opEq');
        if (op === 'gt') return t('opGt');
        if (op === 'lt') return t('opLt');
        if (op === 'empty') return t('opEmpty');
        if (op === 'notEmpty') return t('opNotEmpty');
        return t('opContains');
    }

    function attrRaw(asset, key) {
        var fieldKey = key.slice(5);
        var attrs = asset.attributes || [];
        for (var i = 0; i < attrs.length; i++) {
            if (attrs[i].fieldKey === fieldKey || attrs[i].name === fieldKey) {
                return attrs[i].value || '';
            }
        }
        return '';
    }

    function fieldRaw(asset, key) {
        if (key === 'name') return asset.name || '';
        if (key === 'type') return asset.typeLabel || typeOf(asset.typeKey).label || '';
        if (key === 'status') return statusLabel(asset.status);
        if (key === 'custodian') return asset.custodian && asset.custodian.displayName ? asset.custodian.displayName : '';
        if (key === 'updated') return asset.updated || '';
        if (key.indexOf('attr:') === 0) return attrRaw(asset, key);
        return '';
    }

    function ruleStored(asset, rule) {
        if (rule.field === 'type') return asset.typeKey || '';
        if (rule.field === 'status') return asset.status || '';
        return fieldRaw(asset, rule.field);
    }

    function rulePasses(asset, rule) {
        var value = String(ruleStored(asset, rule) || '').trim();
        var expected = String(rule.value || '').trim();
        var op = rule.op || 'contains';
        if (op === 'empty') return !value;
        if (op === 'notEmpty') return !!value;
        if (op === 'gt' || op === 'lt' || (op === 'eq' && fieldSpec(rule.field).kind === 'number')) {
            var left = parseFloat(value.replace(',', '.'));
            var right = parseFloat(expected.replace(',', '.'));
            if (isNaN(left) || isNaN(right)) return false;
            if (op === 'gt') return left > right;
            if (op === 'lt') return left < right;
            return left === right;
        }
        if (op === 'eq') {
            if (rule.field === 'type' || rule.field === 'status') return value === expected;
            return value.toLowerCase() === expected.toLowerCase();
        }
        return value.toLowerCase().indexOf(expected.toLowerCase()) >= 0;
    }

    function assetMatches(asset, skipText) {
        if (!skipText) {
            var query = textQuery().toLowerCase();
            if (query && haystack(asset).indexOf(query) < 0) return false;
        }
        var rules = state.rules || [];
        for (var i = 0; i < rules.length; i++) {
            if (!rulePasses(asset, rules[i])) return false;
        }
        return true;
    }

    function matchesIn(parentId) {
        var allowed = null;
        if (parentId) {
            allowed = {};
            descendantsOf(parentId).forEach(function (id) { allowed[id] = true; });
        }
        return state.assets.filter(function (asset) {
            if (allowed && !allowed[asset.id]) return false;
            return assetMatches(asset);
        });
    }

    function compareByField(left, right, key) {
        var kind = fieldSpec(key).kind;
        var av = fieldRaw(left, key);
        var bv = fieldRaw(right, key);
        if (kind === 'number') {
            var an = parseFloat(String(av).replace(',', '.'));
            var bn = parseFloat(String(bv).replace(',', '.'));
            if (isNaN(an) && isNaN(bn)) return 0;
            if (isNaN(an)) return 1;
            if (isNaN(bn)) return -1;
            return an - bn;
        }
        return String(av).toLowerCase().localeCompare(String(bv).toLowerCase());
    }

    function listed(assets) {
        var copy = assets.slice();
        if (!state.sortKey || state.sortKey === 'tree') {
            copy.sort(compareAssets);
            return copy;
        }
        var dir = state.sortDir === 'desc' ? -1 : 1;
        copy.sort(function (a, b) {
            var aEmpty = !String(fieldRaw(a, state.sortKey) || '').trim();
            var bEmpty = !String(fieldRaw(b, state.sortKey) || '').trim();
            if (aEmpty || bEmpty) {
                if (aEmpty && bEmpty) return compareAssets(a, b);
                return aEmpty ? 1 : -1;
            }
            var cmp = compareByField(a, b, state.sortKey);
            if (!cmp) return compareAssets(a, b);
            return cmp * dir;
        });
        return copy;
    }

    function filtersKey() {
        return 'asset-tree-filters:' + (state.projectKey || '');
    }

    function loadSavedFilters() {
        state.savedFilters = [];
        try {
            var raw = localStorage.getItem(filtersKey());
            var parsed = raw ? JSON.parse(raw) : [];
            if (parsed && parsed.length) state.savedFilters = parsed;
        } catch (error) {
            state.savedFilters = [];
        }
    }

    function storeSavedFilters() {
        try {
            localStorage.setItem(filtersKey(), JSON.stringify(state.savedFilters || []));
        } catch (error) {
            /* ignore */
        }
    }

    function refreshBrowse() {
        if ((projectFiltering() || useRemoteSearch()) && state.pane === 'card') {
            state.pane = 'list';
        }
        renderNodes();
        replaceDetail();
    }

    function rememberExpanded() {
        try {
            sessionStorage.setItem('asset-tree-expanded', JSON.stringify(state.expanded));
        } catch (error) {
            /* session storage can be unavailable */
        }
    }

    function restoreExpanded() {
        try {
            var raw = sessionStorage.getItem('asset-tree-expanded');
            if (!raw) {
                return false;
            }
            var parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                state.expanded = parsed;
                state.expansionReady = true;
                return true;
            }
        } catch (error) {
            return false;
        }
        return false;
    }

    function isFolder(asset) {
        if (!asset) return false;
        return !!typeOf(asset.typeKey).location;
    }

    function selectedPlaceId() {
        var current = state.selectedId ? byId()[state.selectedId] : null;
        if (!current) return null;
        if (isFolder(current)) return current.id;
        return current.parentId || null;
    }

    function showsInTree(asset) {
        if (!asset) return false;
        var type = typeOf(asset.typeKey);
        return !!(type.location || type.showInTree);
    }

    function hasTreeDescendant(asset, visible) {
        var kids = childrenOf(asset.id);
        for (var i = 0; i < kids.length; i++) {
            if (visible && !visible[kids[i].id]) continue;
            if (showsInTree(kids[i]) || hasTreeDescendant(kids[i], visible)) return true;
        }
        return false;
    }

    function treeChildren(parentId, visible) {
        return childrenOf(parentId).filter(function (child) {
            if (!isFolder(child)) return false;
            if (visible && !visible[child.id]) return false;
            return true;
        });
    }

    function queueCount(asset) {
        var count = 0;
        childrenOf(asset.id).forEach(function (child) {
            if (!showsInTree(child)) count += 1;
            count += queueCount(child);
        });
        return count;
    }

    function treeAnchorId() {
        var current = state.selectedId ? byId()[state.selectedId] : null;
        var guard = 0;
        while (current && !showsInTree(current) && guard < 80) {
            current = current.parentId ? byId()[current.parentId] : null;
            guard++;
        }
        return current ? current.id : null;
    }

    function expandPath(id) {
        var current = byId()[id];
        var guard = 0;
        var changed = false;
        while (current && guard < 80) {
            if (current.parentId && !state.expanded[current.parentId]) {
                state.expanded[current.parentId] = true;
                changed = true;
            }
            current = current.parentId ? byId()[current.parentId] : null;
            guard++;
        }
        if (state.rootOpen === false) {
            state.rootOpen = true;
            changed = true;
        }
        if (changed) rememberExpanded();
    }

    function equipmentIn(placeId, typeKey) {
        return childrenOf(placeId).filter(function (asset) {
            return !isFolder(asset) && (!typeKey || asset.typeKey === typeKey);
        });
    }

    function equipmentUnder(placeId) {
        var rows = [];
        function walk(id) {
            childrenOf(id).forEach(function (child) {
                if (isFolder(child)) walk(child.id);
                else rows.push(child);
            });
        }
        walk(placeId);
        return rows;
    }

    function equipmentCount(assetId) {
        var count = 0;
        childrenOf(assetId).forEach(function (child) {
            if (isFolder(child)) count += equipmentCount(child.id);
            else count += 1;
        });
        return count;
    }

    function typeGroupsFor(placeId) {
        var place = byId()[placeId];
        if (!place || !isFolder(place)) return [];
        var used = {};
        equipmentIn(placeId).forEach(function (asset) { used[asset.typeKey] = true; });
        var childPlaces = childrenOf(placeId).filter(isFolder);
        return state.types.filter(function (type) {
            if (type.location) return false;
            if (childPlaces.length) return !!used[type.typeKey];
            return true;
        });
    }

    function ensureExpandedDefaults() {
        if (state.expansionReady) {
            return;
        }
        if (restoreExpanded()) {
            return;
        }
        state.assets.forEach(function (asset) {
            if (showsInTree(asset)) state.expanded[asset.id] = true;
        });
        state.expansionReady = true;
        rememberExpanded();
    }

    function formatDate(iso) {
        if (!iso) {
            return '';
        }
        var date = new Date(iso);
        if (isNaN(date.getTime())) {
            return iso;
        }
        try {
            return date.toLocaleString(state.locale || 'ru', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return iso;
        }
    }

    function notify(message) {
        var node = document.getElementById('asset-tree-notice');
        if (!node) {
            return;
        }
        node.textContent = message;
        node.className = 'asset-tree-notice is-visible';
        clearTimeout(noticeTimer);
        noticeTimer = setTimeout(function () {
            node.className = 'asset-tree-notice';
        }, 2400);
    }

    function setBusy(busy) {
        state.busy = busy;
        var buttons = app.querySelectorAll('button');
        for (var i = 0; i < buttons.length; i++) {
            if (buttons[i].getAttribute('data-keep') === '1') {
                continue;
            }
            buttons[i].disabled = busy || buttons[i].getAttribute('data-disabled') === '1';
        }
    }

    function viewTabs() {
        var bar = el('div', 'asset-tree-viewtabs');
        bar.setAttribute('role', 'tablist');
        var items = [
            { view: 'mine', label: t('menuMine') },
            { view: 'all', label: t('tabAssets') },
            { view: 'dashboard', label: t('menuDashboard') }
        ];
        if (state.canManage) {
            items.push({ view: 'settings', label: t('menuSettings') });
        }
        items.forEach(function (item) {
            var active = state.view === item.view;
            var tab = button(item.label, 'asset-tree-viewtab' + (active ? ' is-active' : ''), function () {
                showView(item.view);
            });
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-selected', active ? 'true' : 'false');
            bar.appendChild(tab);
        });
        return bar;
    }

    function showView(view) {
        if (state.view === view) {
            return;
        }
        state.view = view;
        state.dirty = false;
        state.editing = false;
        rememberView(view);
        if (view === 'mine') {
            if (state.mineAssets === null) {
                state.loading = true;
                mount();
                loadMine();
            } else {
                state.loading = false;
                state.error = null;
                mount();
            }
            return;
        }
        ensureTree(function () {
            state.loading = false;
            state.error = null;
            mount();
            if (view === 'all' && state.pane === 'card' && state.selectedId && byId()[state.selectedId]) {
                selectAsset(state.selectedId, true);
            }
            if (view === 'dashboard') {
                loadReport();
            }
        });
    }

    function ensureTree(done) {
        if (state.treeReady || !state.projectKey) {
            done();
            return;
        }
        state.loading = true;
        state.error = null;
        mount();
        reloadTree(done);
    }

    function mount() {
        app.innerHTML = '';
        var top = el('div', 'asset-tree-top');
        top.appendChild(viewTabs());
        var row = el('div', 'asset-tree-top-row');
        var titles = el('div', 'asset-tree-heading');
        titles.appendChild(el('h1', null, viewTitle(state.view)));
        if (state.view === 'all') {
            titles.appendChild(el('p', 'asset-tree-hint', t('allHint')));
        }
        var actions = el('div', 'asset-tree-actions');
        var projectLabel = el('label', 'asset-tree-project-label', t('project'));
        projectLabel.setAttribute('for', 'asset-tree-project');
        var projectPicker = el('select', 'asset-tree-project');
        projectPicker.id = 'asset-tree-project';
        state.projects.forEach(function (project) {
            var option = el('option', null, project.name);
            option.value = project.key;
            if (project.key === state.projectKey) option.selected = true;
            projectPicker.appendChild(option);
        });
        projectPicker.addEventListener('change', function () {
            switchProject(projectPicker.value);
        });
        if (!state.projects.length) {
            projectLabel.hidden = true;
            projectPicker.hidden = true;
        }
        actions.appendChild(projectLabel);
        actions.appendChild(projectPicker);
        if (state.view === 'all') {
            var search = el('input', 'asset-tree-search');
            search.type = 'search';
            search.id = 'asset-tree-search';
            search.placeholder = t('searchPlaceholder');
            search.value = state.query || '';
            search.setAttribute('aria-label', t('searchPlaceholder'));
            search.title = t('searchHint');
            var searchTimer = null;
            search.addEventListener('input', function () {
                var value = search.value;
                clearTimeout(searchTimer);
                searchTimer = setTimeout(function () {
                    state.query = value;
                    if (state.searchScope === 'all') {
                        runSearch();
                    } else {
                        state.searchHits = null;
                        state.searching = false;
                        refreshBrowse();
                    }
                }, 180);
            });
            actions.appendChild(search);
            var scope = selectBox('asset-tree-scope', [
                { value: 'project', label: t('searchScopeProject') },
                { value: 'all', label: t('searchScopeAll') }
            ], state.searchScope || 'project', false);
            scope.addEventListener('change', function () {
                state.searchScope = scope.value;
                if (state.searchScope === 'all') {
                    runSearch();
                } else {
                    state.searchHits = null;
                    state.searching = false;
                    refreshBrowse();
                }
            });
            actions.appendChild(scope);
        }
        row.appendChild(titles);
        row.appendChild(actions);
        top.appendChild(row);
        app.appendChild(top);

        var banner = el('div', 'asset-tree-banner');
        banner.id = 'asset-tree-banner';
        if (!state.projectKey || state.canCreate || state.canEdit || state.canMove || state.canRemove || state.canComment) {
            banner.hidden = true;
        } else {
            banner.textContent = t('readOnly');
        }
        app.appendChild(banner);
        var notice = el('div', 'asset-tree-notice');
        notice.id = 'asset-tree-notice';
        app.appendChild(notice);

        var frame = el('div', 'asset-tree-frame ' + (state.view === 'all' ? 'is-split' : 'is-plain'));
        frame.id = 'asset-tree-frame';
        app.appendChild(frame);
        var modal = el('div');
        modal.id = 'asset-tree-modal-root';
        app.appendChild(modal);
        renderFrame();
    }

    function button(label, className, onClick) {
        var node = el('button', className, label);
        node.type = 'button';
        node.addEventListener('click', onClick);
        return node;
    }

    function renderFrame() {
        closeStatusMenu();
        closeColorMenu();
        var frame = document.getElementById('asset-tree-frame');
        if (!frame) {
            return;
        }
        frame.innerHTML = '';
        if (state.loading) {
            var loading = el('div', 'asset-tree-message');
            loading.appendChild(el('h2', null, t('loading')));
            var skeleton = el('div', 'asset-tree-skeleton');
            for (var i = 0; i < 6; i++) {
                var bar = el('span');
                bar.style.width = (58 + (i % 3) * 12) + '%';
                skeleton.appendChild(bar);
            }
            loading.appendChild(skeleton);
            frame.appendChild(loading);
            return;
        }
        if (state.error) {
            var error = el('div', 'asset-tree-message');
            error.appendChild(el('h2', null, t('errorTitle')));
            error.appendChild(el('p', null, state.error));
            error.appendChild(button(t('retry'), 'asset-tree-btn', boot));
            frame.appendChild(error);
            return;
        }
        if (!state.projects.length) {
            var missing = el('div', 'asset-tree-message');
            missing.appendChild(el('h2', null, t('noProjects')));
            missing.appendChild(el('p', null, t('noProjectsHint')));
            frame.appendChild(missing);
            return;
        }
        if (state.view === 'mine') {
            frame.appendChild(renderMine());
            return;
        }
        if (state.view === 'settings') {
            frame.appendChild(renderSettings());
            return;
        }
        if (state.view === 'dashboard') {
            frame.appendChild(renderDashboardPage());
            return;
        }
        frame.appendChild(renderSide());
        frame.appendChild(renderDetail());
    }

    function renderSide() {
        var side = el('aside', 'asset-tree-side');
        side.appendChild(el('div', 'asset-tree-side-caption', t('hierarchyMenu')));
        var bar = el('div', 'asset-tree-searchbar');
        var tools = el('div', 'asset-tree-tools');
        tools.appendChild(button(t('expandAll'), 'asset-tree-btn slim', function () {
            state.assets.forEach(function (asset) {
                if (showsInTree(asset)) state.expanded[asset.id] = true;
            });
            state.query = '';
            rememberExpanded();
            renderNodes();
        }));
        tools.appendChild(button(t('collapseAll'), 'asset-tree-btn slim', function () {
            state.expanded = {};
            rememberExpanded();
            renderNodes();
        }));
        var count = el('span', 'asset-tree-count', t('assetCount', state.assets.length));
        count.id = 'asset-tree-count';
        count.hidden = true;
        tools.appendChild(count);
        bar.appendChild(tools);
        var dragHint = el('p', 'asset-tree-draghint', t('dragHint'));
        dragHint.hidden = !state.canMove;
        bar.appendChild(dragHint);
        side.appendChild(bar);
        var scroll = el('div', 'asset-tree-scroll');
        scroll.id = 'asset-tree-scroll';
        var nodes = el('div', 'asset-tree-nodes');
        nodes.id = 'asset-tree-nodes';
        nodes.setAttribute('role', 'tree');
        scroll.appendChild(nodes);
        var drop = el('div', 'asset-tree-rootdrop', t('dropRoot'));
        drop.id = 'asset-tree-rootdrop';
        scroll.appendChild(drop);
        side.appendChild(scroll);
        if (state.canCreate) {
            side.appendChild(button('+ ' + t('addHere'), 'asset-tree-queue-add', function () {
                if (state.typeGroup) openCreate(state.typeGroup.placeId, 'object', state.typeGroup.typeKey);
                else if (treeAnchorId() && isFolder(byId()[treeAnchorId()])) openCreate(treeAnchorId());
                else openCreate(null, 'place');
            }));
        }
        renderNodesInto(nodes);
        return side;
    }

    function visibleCount() {
        var visible = visibleSet();
        if (!visible) {
            return state.assets.length;
        }
        return Object.keys(visible.__matches).length;
    }

    function renderNodes() {
        var nodes = document.getElementById('asset-tree-nodes');
        var scroll = document.getElementById('asset-tree-scroll');
        if (!nodes) {
            renderFrame();
            return;
        }
        var top = scroll ? scroll.scrollTop : 0;
        renderNodesInto(nodes);
        if (scroll) {
            scroll.scrollTop = top;
        }
        var count = document.getElementById('asset-tree-count');
        if (count) {
            count.textContent = t('assetCount', visibleCount());
        }
    }

    function renderNodesInto(nodes) {
        nodes.innerHTML = '';
        var visible = visibleSet();
        var matches = visible ? visible.__matches : null;
        var branch = el('div', 'asset-tree-branch');
        branch.appendChild(rootRow());
        var children = el('div', 'asset-tree-children');
        if (state.rootOpen === false) {
            children.hidden = true;
        }
        if (visible && !Object.keys(matches).length) {
            children.appendChild(el('p', 'asset-tree-hint', t('noResults')));
        } else if (!state.assets.length && !projectFiltering()) {
            children.appendChild(el('p', 'asset-tree-hint', t('treeEmpty')));
        } else {
            appendLevel(children, null, visible, matches);
        }
        branch.appendChild(children);
        nodes.appendChild(branch);
    }

    function rootRow() {
        var project = currentProject();
        var row = el('div', 'asset-tree-row is-root');
        row.setAttribute('role', 'treeitem');
        if (!treeAnchorId() && !state.typeGroup) row.classList.add('is-selected');
        var chevron = el('button', 'asset-tree-chevron', state.rootOpen === false ? '▸' : '▾');
        chevron.type = 'button';
        chevron.setAttribute('aria-label', state.rootOpen === false ? t('expand') : t('collapse'));
        chevron.addEventListener('click', function (event) {
            event.stopPropagation();
            state.rootOpen = state.rootOpen === false;
            renderNodes();
        });
        var name = el('span', 'asset-tree-name', project ? project.name : state.projectKey);
        row.appendChild(chevron);
        row.appendChild(name);
        var hidden = 0;
        state.assets.forEach(function (asset) {
            if (!isFolder(asset)) hidden += 1;
        });
        if (hidden) row.appendChild(el('span', 'asset-tree-qcount', '(' + hidden + ')'));
        row.appendChild(nestButton(null));
        row.addEventListener('click', function () {
            if (state.dirty && !window.confirm(t('confirmDiscard'))) {
                return;
            }
            state.selectedId = null;
            state.typeGroup = null;
            state.dirty = false;
            state.pane = 'list';
            renderNodes();
            replaceDetail();
        });
        return row;
    }

    function nestButton(parentId) {
        var nest = el('button', 'asset-tree-nest', '+');
        nest.type = 'button';
        nest.title = t('addNode');
        nest.setAttribute('aria-label', nest.title);
        if (!state.canCreate) {
            nest.disabled = true;
        }
        nest.addEventListener('click', function (event) {
            event.stopPropagation();
            if (!parentId) openCreate(null, 'place');
            else openCreate(parentId);
        });
        return nest;
    }

    function replaceDetail() {
        var frame = document.getElementById('asset-tree-frame');
        var existing = document.getElementById('asset-tree-detail');
        if (!frame || !existing) {
            renderFrame();
            return;
        }
        frame.replaceChild(renderDetail(), existing);
    }

    function appendLevel(container, parentId, visible, matches) {
        treeChildren(parentId, visible).forEach(function (asset) {
            var groups = isFolder(asset) ? typeGroupsFor(asset.id) : [];
            var kids = treeChildren(asset.id, visible);
            var expandable = !!(kids.length || groups.length);
            var branch = el('div', 'asset-tree-branch');
            var row = el('div', 'asset-tree-row');
            row.setAttribute('role', 'treeitem');
            row.setAttribute('data-id', String(asset.id));
            if (state.selectedId === asset.id || treeAnchorId() === asset.id) {
                row.classList.add('is-selected');
            }
            if (matches && matches[asset.id]) {
                row.classList.add('is-match');
            }
            if (state.canMove && isFolder(asset)) {
                row.appendChild(dragGrip(asset));
            }
            var chevron = el('button', 'asset-tree-chevron', expandable ? (isExpanded(asset.id) ? '▾' : '▸') : '');
            chevron.type = 'button';
            chevron.disabled = !expandable;
            chevron.setAttribute('aria-label', isExpanded(asset.id) ? t('collapse') : t('expand'));
            chevron.addEventListener('click', function (event) {
                event.stopPropagation();
                state.expanded[asset.id] = !isExpanded(asset.id);
                state.query = '';
                rememberExpanded();
                renderNodes();
            });
            var name = el('span', 'asset-tree-name', asset.name);
            name.title = asset.name;
            row.appendChild(chevron);
            row.appendChild(name);
            var queued = equipmentCount(asset.id);
            if (queued) row.appendChild(el('span', 'asset-tree-qcount', '(' + queued + ')'));
            row.appendChild(nestButton(asset.id));
            row.addEventListener('click', function () {
                state.pane = 'list';
                selectAsset(asset.id);
            });
            branch.appendChild(row);
            if (expandable && isExpanded(asset.id)) {
                var nested = el('div', 'asset-tree-children');
                appendLevel(nested, asset.id, visible, matches);
                branch.appendChild(nested);
            }
            container.appendChild(branch);
        });
        if (parentId && byId()[parentId] && isFolder(byId()[parentId])) {
            typeGroupsFor(parentId).forEach(function (type) {
                container.appendChild(typeGroupRow(parentId, type));
            });
        }
    }

    function typeGroupRow(placeId, type) {
        var branch = el('div', 'asset-tree-branch');
        var row = el('div', 'asset-tree-row is-type');
        row.setAttribute('role', 'treeitem');
        row.setAttribute('data-place-id', String(placeId));
        var selected = state.typeGroup && state.typeGroup.placeId === placeId && state.typeGroup.typeKey === type.typeKey;
        if (selected) row.classList.add('is-selected');
        var chevron = el('button', 'asset-tree-chevron', '');
        chevron.type = 'button';
        chevron.disabled = true;
        row.appendChild(chevron);
        var name = el('span', 'asset-tree-name', type.label);
        name.insertBefore(typeTile(type, 'sm'), name.firstChild);
        row.appendChild(name);
        var count = equipmentIn(placeId, type.typeKey).length;
        if (count) row.appendChild(el('span', 'asset-tree-qcount', '(' + count + ')'));
        if (state.canCreate) {
            var nest = el('button', 'asset-tree-nest', '+');
            nest.type = 'button';
            nest.title = t('addObject');
            nest.setAttribute('aria-label', nest.title);
            nest.addEventListener('click', function (event) {
                event.stopPropagation();
                openCreate(placeId, 'object', type.typeKey);
            });
            row.appendChild(nest);
        }
        row.addEventListener('click', function () {
            selectTypeGroup(placeId, type.typeKey);
        });
        branch.appendChild(row);
        return branch;
    }

    function selectTypeGroup(placeId, typeKey, scope) {
        if (state.dirty && !window.confirm(t('confirmDiscard'))) return;
        state.typeGroup = { placeId: placeId, typeKey: typeKey, scope: scope || 'direct' };
        state.selectedId = null;
        state.editing = false;
        state.dirty = false;
        state.pane = 'list';
        state.expanded[placeId] = true;
        rememberExpanded();
        if (window.history && window.history.replaceState) {
            var params = [];
            if (state.projectKey) params.push('project=' + encodeURIComponent(state.projectKey));
            params.push('view=' + encodeURIComponent(state.view || 'all'));
            window.history.replaceState(null, '', window.location.pathname + '?' + params.join('&') + '#t:' + placeId + ':' + encodeURIComponent(typeKey));
        }
        renderNodes();
        replaceDetail();
    }

    var pointerDrag = null;

    function dragGrip(asset) {
        var grip = el('span', 'asset-tree-grip');
        grip.title = t('dragHint');
        grip.setAttribute('aria-label', t('dragHint'));
        grip.appendChild(gripIcon());
        grip.addEventListener('pointerdown', function (event) {
            if (event.button !== 0 || !state.canMove) return;
            event.preventDefault();
            event.stopPropagation();
            if (grip.setPointerCapture) grip.setPointerCapture(event.pointerId);
            pointerDrag = {
                id: asset.id,
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                active: false,
                plan: null
            };
            document.addEventListener('pointermove', onGripMove, true);
            document.addEventListener('pointerup', onGripUp, true);
            document.addEventListener('pointercancel', onGripUp, true);
        });
        grip.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
        });
        return grip;
    }

    function onGripMove(event) {
        if (!pointerDrag || event.pointerId !== pointerDrag.pointerId) return;
        var dx = event.clientX - pointerDrag.startX;
        var dy = event.clientY - pointerDrag.startY;
        if (!pointerDrag.active) {
            if (dx * dx + dy * dy < 16) return;
            pointerDrag.active = true;
            state.draggingId = pointerDrag.id;
            app.classList.add('is-dragging');
            document.documentElement.classList.add('asset-tree-dragging');
            var moving = byId()[pointerDrag.id];
            var ghost = el('div', 'asset-tree-drag-ghost', moving ? moving.name : '');
            ghost.id = 'asset-tree-drag-ghost';
            document.body.appendChild(ghost);
        }
        event.preventDefault();
        var ghostNode = document.getElementById('asset-tree-drag-ghost');
        if (ghostNode) {
            ghostNode.style.left = (event.clientX + 12) + 'px';
            ghostNode.style.top = (event.clientY + 10) + 'px';
        }
        var scroller = document.getElementById('asset-tree-scroll');
        if (scroller) {
            var bounds = scroller.getBoundingClientRect();
            if (event.clientY < bounds.top + 28) scroller.scrollTop -= 14;
            else if (event.clientY > bounds.bottom - 28) scroller.scrollTop += 14;
        }
        pointerDrag.plan = planDrop(event.clientX, event.clientY, pointerDrag.id);
    }

    function onGripUp(event) {
        if (!pointerDrag || event.pointerId !== pointerDrag.pointerId) return;
        document.removeEventListener('pointermove', onGripMove, true);
        document.removeEventListener('pointerup', onGripUp, true);
        document.removeEventListener('pointercancel', onGripUp, true);
        var commit = event.type !== 'pointercancel' && pointerDrag.active;
        var plan = commit ? (pointerDrag.plan || planDrop(event.clientX, event.clientY, pointerDrag.id)) : null;
        var movingId = pointerDrag.id;
        endPointerDrag();
        if (plan) moveAsset(movingId, plan.parentId, plan.index);
    }

    function endPointerDrag() {
        pointerDrag = null;
        state.draggingId = null;
        app.classList.remove('is-dragging');
        document.documentElement.classList.remove('asset-tree-dragging');
        clearDropClasses();
        var root = document.getElementById('asset-tree-rootdrop');
        if (root) root.classList.remove('is-over');
        var ghost = document.getElementById('asset-tree-drag-ghost');
        if (ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost);
    }

    function planDrop(x, y, movingId) {
        clearDropClasses();
        var root = document.getElementById('asset-tree-rootdrop');
        if (root) root.classList.remove('is-over');
        var stack = document.elementsFromPoint ? document.elementsFromPoint(x, y) : [document.elementFromPoint(x, y)];
        var row = null;
        var rootHit = false;
        for (var i = 0; i < stack.length; i++) {
            var node = stack[i];
            if (!node || !node.closest) continue;
            if (node.id === 'asset-tree-drag-ghost' || node.closest('#asset-tree-drag-ghost')) continue;
            if (node.classList && node.classList.contains('asset-tree-draghint')) continue;
            var hitRow = node.closest('.asset-tree-row');
            if (hitRow && app.contains(hitRow)) {
                row = hitRow;
                break;
            }
            if (node.id === 'asset-tree-rootdrop' || node.closest('#asset-tree-rootdrop')) {
                rootHit = true;
                break;
            }
        }
        if (rootHit) {
            if (root) root.classList.add('is-over');
            return { parentId: null, index: null };
        }
        if (!row) return null;
        var typePlace = row.getAttribute('data-place-id');
        if (!row.getAttribute('data-id') && typePlace) {
            var placeRow = app.querySelector('.asset-tree-row[data-id="' + typePlace + '"]');
            if (!placeRow || parseInt(typePlace, 10) === movingId) return null;
            placeRow.classList.add('is-drop-inside');
            return { parentId: parseInt(typePlace, 10), index: null };
        }
        if (!row.getAttribute('data-id')) return null;
        var targetId = parseInt(row.getAttribute('data-id'), 10);
        if (targetId === movingId) return null;
        var rect = row.getBoundingClientRect();
        var ratio = rect.height ? (y - rect.top) / rect.height : 0.5;
        var mode = ratio < 0.28 ? 'before' : (ratio > 0.72 ? 'after' : 'inside');
        row.classList.add(mode === 'before' ? 'is-drop-before' : (mode === 'after' ? 'is-drop-after' : 'is-drop-inside'));
        if (mode === 'inside') return { parentId: targetId, index: null };
        var target = byId()[targetId];
        var parentId = target && target.parentId ? target.parentId : null;
        return { parentId: parentId, index: destinationIndex(parentId, targetId, mode, movingId) };
    }

    function gripIcon() {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 10 16');
        svg.setAttribute('aria-hidden', 'true');
        [[2, 2], [8, 2], [2, 8], [8, 8], [2, 14], [8, 14]].forEach(function (dot) {
            var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', String(dot[0]));
            circle.setAttribute('cy', String(dot[1]));
            circle.setAttribute('r', '1.35');
            circle.setAttribute('fill', 'currentColor');
            svg.appendChild(circle);
        });
        return svg;
    }

    function clearDropClasses() {
        var rows = app.querySelectorAll('.asset-tree-row');
        for (var i = 0; i < rows.length; i++) {
            rows[i].classList.remove('is-drop-before', 'is-drop-after', 'is-drop-inside');
            rows[i].removeAttribute('data-drop-mode');
        }
    }

    function destinationIndex(parentId, targetId, mode, movingId) {
        var siblings = childrenOf(parentId).filter(function (asset) {
            return asset.id !== movingId;
        });
        var index = siblings.length;
        for (var i = 0; i < siblings.length; i++) {
            if (siblings[i].id === targetId) {
                index = mode === 'after' ? i + 1 : i;
                break;
            }
        }
        return index;
    }

    function wouldCycle(movingId, parentId) {
        if (parentId === null || parentId === undefined) {
            return false;
        }
        var current = byId()[parentId];
        var guard = 0;
        while (current && guard < 80) {
            if (current.id === movingId) {
                return true;
            }
            current = current.parentId ? byId()[current.parentId] : null;
            guard++;
        }
        return false;
    }

    function moveAsset(movingId, parentId, index) {
        if (!state.canMove || movingId === null || movingId === undefined) {
            return;
        }
        if (state.dirty && !window.confirm(t('confirmDiscard'))) {
            return;
        }
        if (wouldCycle(movingId, parentId)) {
            notify(t('errorTitle'));
            return;
        }
        state.dirty = false;
        ajax('POST', '/assets/' + movingId + '/move', { parentId: parentId, index: index }, function (status, payload) {
            if (status < 200 || status >= 300) {
                notify((payload && payload.message) || t('errorTitle'));
                return;
            }
            if (parentId) {
                state.expanded[parentId] = true;
                rememberExpanded();
            }
            reloadTree(function () {
                selectAsset(movingId, true);
                notify(t('moved'));
            });
        });
    }

    function selectAsset(id, force) {
        if (!force && state.dirty && state.selectedId !== id && !window.confirm(t('confirmDiscard'))) {
            return;
        }
        if (state.selectedId !== id) {
            state.editing = false;
        }
        var next = byId()[id];
        if (next && isFolder(next)) state.typeGroup = null;
        state.selectedId = id;
        state.dirty = false;
        expandPath(id);
        var asset = byId()[id];
        var folder = asset && (childrenOf(id).length || isFolder(asset));
        if (window.history && window.history.replaceState) {
            var hash = '#' + id;
            var params = [];
            if (state.projectKey) params.push('project=' + encodeURIComponent(state.projectKey));
            params.push('view=' + encodeURIComponent(state.view || 'all'));
            window.history.replaceState(null, '', window.location.pathname + '?' + params.join('&') + hash);
        } else {
            window.location.hash = String(id);
        }
        if (folder) {
            state.pane = 'list';
            state.detail = asset;
            renderNodes();
            replaceDetail();
            ajax('GET', '/assets/' + id, null, function (status, payload) {
                if (state.selectedId !== id || state.dirty || state.editing) {
                    return;
                }
                if (status === 200) {
                    state.detail = payload;
                    replaceDetail();
                }
            });
            return;
        }
        state.pane = 'card';
        renderNodes();
        showDetail(asset, true);
        ajax('GET', '/assets/' + id, null, function (status, payload) {
            if (state.selectedId !== id || state.dirty) {
                return;
            }
            if (status === 200) {
                showDetail(payload, false);
            } else if (status === 404) {
                state.selectedId = null;
                state.dirty = false;
                renderFrame();
            } else {
                setFormError((payload && payload.message) || t('errorTitle'));
            }
        });
    }

    function crumbs(asset) {
        var chain = [];
        var current = asset;
        var guard = 0;
        while (current && guard < 80) {
            chain.unshift(current.name);
            current = current.parentId ? byId()[current.parentId] : null;
            guard++;
        }
        return chain.join('  /  ');
    }

    function renderDetail() {
        var asset = state.selectedId ? byId()[state.selectedId] : null;
        if (state.pane === 'card' && asset && !isFolder(asset)) {
            var section = el('section', 'asset-tree-detail');
            section.id = 'asset-tree-detail';
            return section;
        }
        if (state.typeGroup && byId()[state.typeGroup.placeId]) {
            return renderTypeGroup();
        }
        if (asset && isFolder(asset) && !useRemoteSearch() && !projectFiltering()) {
            return renderPlaceHome(asset);
        }
        if (!asset || (state.pane !== 'card' && (childrenOf(asset.id).length || isFolder(asset)))) {
            return renderChildList(asset);
        }
        var card = el('section', 'asset-tree-detail');
        card.id = 'asset-tree-detail';
        return card;
    }

    function renderTypeGroup() {
        var group = state.typeGroup;
        var place = group ? byId()[group.placeId] : null;
        var type = typeOf(group ? group.typeKey : '');
        var section = el('section', 'asset-tree-detail is-queue');
        section.id = 'asset-tree-detail';
        var source = group.scope === 'under' ? equipmentUnder(group.placeId) : equipmentIn(group.placeId, group.typeKey);
        if (group.scope === 'under') {
            source = source.filter(function (asset) { return asset.typeKey === group.typeKey; });
        }
        var kids = listed(source);
        var head = el('div', 'asset-tree-queue-head');
        var titles = el('div', 'asset-tree-queue-titles');
        var titleRow = el('div', 'asset-tree-queue-title');
        titleRow.appendChild(el('h2', null, type.label || group.typeKey));
        titleRow.appendChild(el('span', 'asset-tree-badge', String(kids.length)));
        titles.appendChild(titleRow);
        if (place) titles.appendChild(el('p', 'asset-tree-crumb', crumbs(place)));
        head.appendChild(titles);
        var tools = el('div', 'asset-tree-inline-actions');
        if (state.canCreate) {
            tools.appendChild(button(t('addObject'), 'asset-tree-btn primary', function () {
                openCreate(group.placeId, 'object', group.typeKey);
            }));
        }
        if (state.canConfigure) {
            tools.appendChild(button(t('typeFields'), 'asset-tree-btn', function () {
                openFieldModal(type);
            }));
        }
        head.appendChild(tools);
        section.appendChild(head);
        section.appendChild(filterBar());
        if (!kids.length) {
            section.appendChild(el('p', 'asset-tree-hint', t('typeListHint')));
            return section;
        }
        section.appendChild(assetTable(kids.map(function (child) {
            var who = child.custodian && child.custodian.displayName ? child.custodian.displayName : '';
            return [
                openName(child.name, function () {
                    state.pane = 'card';
                    selectAsset(child.id);
                }),
                child.objectKey || '',
                lozenge(child.status),
                who || t('custodianNone')
            ];
        }), [t('name'), t('keyLabel'), t('status'), t('custodian')]));
        return section;
    }

    function stamp(iso) {
        var when = relativeTime(iso);
        var clock = clockText(iso);
        return clock ? (when + ' ' + clock) : when;
    }

    function clockText(iso) {
        var date = new Date(iso);
        if (isNaN(date.getTime())) return '';
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var suffix = hours >= 12 ? 'PM' : 'AM';
        var hour = hours % 12;
        if (!hour) hour = 12;
        return hour + ':' + (minutes < 10 ? '0' : '') + minutes + ' ' + suffix;
    }

    function issueCrumb(asset) {
        var crumb = el('div', 'asset-tree-issue-crumb');
        crumb.appendChild(el('span', null, asset.projectName || asset.projectKey || ''));
        if (asset.objectKey) {
            crumb.appendChild(el('span', 'asset-tree-issue-crumb-sep', '/'));
            crumb.appendChild(el('span', null, asset.objectKey));
        }
        return crumb;
    }

    function toolIcon(name) {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('aria-hidden', 'true');
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        var shapes = {
            edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
            comment: 'M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2z',
            assign: 'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-3.31 0-8 1.67-8 4v2h16v-2c0-2.33-4.69-4-8-4z',
            more: 'M6 10a2 2 0 1 0 .01 4A2 2 0 0 0 6 10zm6 0a2 2 0 1 0 .01 4A2 2 0 0 0 12 10zm6 0a2 2 0 1 0 .01 4A2 2 0 0 0 18 10z',
            plus: 'M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z',
            trash: 'M9 3h6l1 2h4v2H4V5h4l1-2zm-2 6h2v9H7V9zm4 0h2v9h-2V9zm4 0h2v9h-2V9zM6 7h12l-1 14H7L6 7z',
            cloud: 'M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 8.6 3.5 3.5 0 0 0 7 18z',
            issue: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 13h8v1.6H8V13zm0 4h5v1.6H8V17z'
        };
        path.setAttribute('d', shapes[name] || shapes.more);
        path.setAttribute('fill', 'currentColor');
        svg.appendChild(path);
        return svg;
    }

    function iconShape(key) {
        for (var i = 0; i < TYPE_ICONS.length; i++) {
            if (TYPE_ICONS[i].key === key) return TYPE_ICONS[i];
        }
        return null;
    }

    function iconKeyOf(type) {
        if (!type) return DEFAULT_OBJECT_ICON;
        if (iconShape(type.icon)) return type.icon;
        return type.location ? DEFAULT_PLACE_ICON : DEFAULT_OBJECT_ICON;
    }

    function iconLabel(key) {
        return t('icon' + key.charAt(0).toUpperCase() + key.slice(1));
    }

    function iconGlyph(key) {
        var shape = iconShape(key) || iconShape(DEFAULT_OBJECT_ICON);
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', shape.d);
        path.setAttribute('fill', 'currentColor');
        path.setAttribute('fill-rule', 'evenodd');
        svg.appendChild(path);
        return svg;
    }

    /* Colored tile with a white glyph: the same shape Jira uses for request type icons. */
    function typeTile(type, size, iconKey, color) {
        var tile = el('span', 'asset-tree-type-icon' + (size ? ' is-' + size : ''));
        tile.style.background = color || (type && type.color) || '#5D6B82';
        tile.appendChild(iconGlyph(iconKey || iconKeyOf(type)));
        if (type && type.label) tile.title = type.label;
        return tile;
    }

    function typeBadge(type, label, size) {
        var wrap = el('span', 'asset-tree-type-badge');
        wrap.appendChild(typeTile(type, size || 'sm'));
        wrap.appendChild(el('span', 'asset-tree-type-badge-label', label || (type && type.label) || ''));
        return wrap;
    }

    /* Palette row. Returns the container; call container.set(color) to move the selection. */
    function colorSwatches(initial, onPick) {
        var colors = el('div', 'asset-tree-swatches');
        var buttons = {};
        PALETTE.forEach(function (color) {
            var swatch = el('button', 'asset-tree-swatch');
            swatch.type = 'button';
            swatch.style.background = color;
            swatch.setAttribute('aria-label', color);
            swatch.addEventListener('click', function () {
                colors.set(color);
                onPick(color);
            });
            buttons[color] = swatch;
            colors.appendChild(swatch);
        });
        colors.set = function (color) {
            Object.keys(buttons).forEach(function (key) {
                if (key === color) buttons[key].classList.add('is-selected');
                else buttons[key].classList.remove('is-selected');
            });
        };
        colors.set(initial);
        return colors;
    }

    /* Icon grid. Returns the container; call grid.set(key) or grid.paint(color) to update it. */
    function iconPicker(initialKey, initialColor, onPick) {
        var grid = el('div', 'asset-tree-icon-grid');
        grid.setAttribute('role', 'listbox');
        var tiles = {};
        var currentColor = initialColor || PALETTE[0];
        TYPE_ICONS.forEach(function (shape) {
            var pick = el('button', 'asset-tree-icon-pick');
            pick.type = 'button';
            pick.title = iconLabel(shape.key);
            pick.setAttribute('aria-label', pick.title);
            pick.setAttribute('role', 'option');
            var tile = typeTile(null, 'lg', shape.key, currentColor);
            pick.appendChild(tile);
            pick.addEventListener('click', function () {
                grid.set(shape.key);
                onPick(shape.key);
            });
            tiles[shape.key] = { button: pick, tile: tile };
            grid.appendChild(pick);
        });
        grid.set = function (key) {
            Object.keys(tiles).forEach(function (name) {
                var on = name === key;
                if (on) tiles[name].button.classList.add('is-selected');
                else tiles[name].button.classList.remove('is-selected');
                tiles[name].button.setAttribute('aria-selected', on ? 'true' : 'false');
            });
        };
        grid.paint = function (color) {
            currentColor = color || currentColor;
            Object.keys(tiles).forEach(function (name) {
                tiles[name].tile.style.background = currentColor;
            });
        };
        grid.set(initialKey);
        return grid;
    }

    function toolButton(label, icon, onClick) {
        var node = button('', 'asset-tree-tool', onClick);
        node.appendChild(toolIcon(icon));
        node.appendChild(el('span', null, label));
        return node;
    }

    function moreMenu(items) {
        if (!state.moreBound) {
            state.moreBound = true;
            document.addEventListener('mousedown', function (event) {
                var wrap = document.querySelector('.asset-tree-more');
                var menu = document.querySelector('.asset-tree-more-menu');
                if (menu && wrap && !wrap.contains(event.target)) menu.hidden = true;
            });
        }
        var wrap = el('div', 'asset-tree-more');
        var menu = el('div', 'asset-tree-more-menu');
        menu.hidden = true;
        var toggle = toolButton(t('moreActions'), 'more', function (event) {
            event.stopPropagation();
            menu.hidden = !menu.hidden;
        });
        items.forEach(function (item) {
            menu.appendChild(button(item.label, 'asset-tree-more-item' + (item.danger ? ' is-danger' : ''), function () {
                menu.hidden = true;
                item.onClick();
            }));
        });
        wrap.appendChild(toggle);
        wrap.appendChild(menu);
        return wrap;
    }

    function moduleBlock(title, bodyNode) {
        var block = el('div', 'asset-tree-module');
        var head = el('button', 'asset-tree-module-head');
        head.type = 'button';
        var caret = el('span', 'asset-tree-caret', '\u25BE');
        head.appendChild(caret);
        head.appendChild(el('span', null, title));
        var body = el('div', 'asset-tree-module-body');
        if (bodyNode) body.appendChild(bodyNode);
        head.addEventListener('click', function () {
            body.hidden = !body.hidden;
            caret.textContent = body.hidden ? '\u25B8' : '\u25BE';
        });
        block.appendChild(head);
        block.appendChild(body);
        return block;
    }

    function detailItem(label, valueNode) {
        var row = el('div', 'asset-tree-detail-item');
        row.appendChild(el('span', 'asset-tree-detail-label', label));
        var value = el('div', 'asset-tree-detail-value');
        value.appendChild(valueNode);
        row.appendChild(value);
        return row;
    }

    function detailGrid(items) {
        var grid = el('div', 'asset-tree-details');
        items.forEach(function (item) { grid.appendChild(item); });
        return grid;
    }

    function dateField(label, iso) {
        var field = el('div', 'asset-tree-people-field');
        field.appendChild(el('div', 'asset-tree-people-label', label));
        field.appendChild(el('div', 'asset-tree-people-value', stamp(iso)));
        return field;
    }

    function datesBody(asset) {
        var box = el('div');
        box.appendChild(dateField(t('created'), asset.created));
        box.appendChild(dateField(t('updated'), asset.updated));
        return box;
    }

    function renderPlaceHome(asset) {
        var full = (state.detail && state.detail.id == asset.id) ? state.detail : asset;
        if (state.editing && state.canEdit) {
            var editor = el('section', 'asset-tree-detail is-issue');
            editor.id = 'asset-tree-detail';
            showDetail(full, full.issues == null, editor);
            return editor;
        }
        var section = el('section', 'asset-tree-detail is-issue is-view is-place');
        section.id = 'asset-tree-detail';
        var gear = equipmentUnder(asset.id);
        var departments = childrenOf(asset.id).filter(isFolder);
        var seen = {};
        var types = [];
        function addType(type) {
            if (!type || type.location || !type.typeKey || seen[type.typeKey]) return;
            seen[type.typeKey] = true;
            types.push(type);
        }
        typeGroupsFor(asset.id).forEach(addType);
        gear.forEach(function (item) { addType(typeOf(item.typeKey)); });
        var form = el('div', 'asset-tree-request is-view');
        var main = el('div', 'asset-tree-request-main');
        var aside = el('aside', 'asset-tree-request-aside');

        main.appendChild(issueCrumb(full));
        main.appendChild(el('h1', 'asset-tree-issue-title', asset.name || ''));
        var ops = el('div', 'asset-tree-ops');
        if (state.canEdit) {
            ops.appendChild(toolButton(t('edit'), 'edit', function () {
                state.editing = true;
                state.detail = full;
                replaceDetail();
                if (full.issues == null) {
                    ajax('GET', '/assets/' + asset.id, null, function (status, payload) {
                        if (state.selectedId !== asset.id || !state.editing || state.dirty) return;
                        if (status === 200) {
                            state.detail = payload;
                            replaceDetail();
                        }
                    });
                }
            }));
            ops.appendChild(toolButton(t('addHere'), 'plus', function () {
                openCreate(asset.id);
            }));
            ops.appendChild(moreMenu([{ label: t('delete'), danger: true, onClick: function () { openDelete(full); } }]));
        }
        main.appendChild(ops);
        if (asset.parentId && crumbs(asset)) main.appendChild(el('p', 'asset-tree-crumb', crumbs(asset)));

        var placeItems = [detailItem(t('type'), typeBadge(typeFor(full), full.typeLabel || typeOf(full.typeKey).label || ''))];
        if (full.parentId && byId()[full.parentId]) {
            placeItems.push(detailItem(t('parent'), el('span', null, byId()[full.parentId].name)));
        }
        (full.attributes || []).forEach(function (attribute) {
            var shown = attribute.value ? String(attribute.value) : t('emptyValue');
            placeItems.push(detailItem(attribute.name || attribute.fieldKey, el('span', attribute.value ? null : 'is-empty', shown)));
        });
        main.appendChild(moduleBlock(t('detailsTitle'), detailGrid(placeItems)));
        main.appendChild(descriptionModule(full, true));

        if (departments.length) {
            var places = el('div');
            departments.forEach(function (place) {
                places.appendChild(linkLine(place.name, place.typeLabel || typeOf(place.typeKey).label || '', function () {
                    state.pane = 'list';
                    selectAsset(place.id);
                }, typeOf(place.typeKey).color, typeOf(place.typeKey)));
            });
            main.appendChild(moduleBlock(t('placeInside'), places));
        }

        var typeBlock = el('div');
        if (!types.length) {
            typeBlock.appendChild(el('p', 'asset-tree-hint', t('placeEmptyInside')));
        } else {
            types.forEach(function (type) {
                var count = 0;
                gear.forEach(function (item) { if (item.typeKey === type.typeKey) count++; });
                typeBlock.appendChild(linkLine(type.label, t('childCount', count), function () {
                    selectTypeGroup(asset.id, type.typeKey, 'under');
                }, type.color, type));
            });
        }
        main.appendChild(moduleBlock(t('placeTypes'), typeBlock));

        var issues = el('div');
        if (state.canEdit) {
            var linker = el('div', 'asset-tree-linkrow');
            var issueInput = el('input');
            issueInput.placeholder = t('issuePlaceholder');
            linker.appendChild(issueInput);
            linker.appendChild(button(t('linkIssue'), 'asset-tree-btn', function () {
                linkIssue(full.id, issueInput.value);
            }));
            issues.appendChild(linker);
        }
        if (full.issues == null) {
            issues.appendChild(el('p', 'asset-tree-hint', t('loadingIssues')));
        } else if (!full.issues.length) {
            issues.appendChild(el('p', 'asset-tree-hint', t('linkedEmpty')));
        } else {
            full.issues.forEach(function (issue) {
                issues.appendChild(issueRow(full.id, issue));
            });
        }
        main.appendChild(moduleBlock(t('issues'), issues));

        aside.appendChild(moduleBlock(t('people'), staticPeople(full)));
        aside.appendChild(moduleBlock(t('dates'), datesBody(full)));

        form.appendChild(main);
        form.appendChild(aside);
        section.appendChild(form);
        return section;
    }

    function issueMark(color) {
        var mark = el('span', 'asset-tree-issuelink-icon');
        mark.style.color = color || '#0052cc';
        mark.appendChild(toolIcon('issue'));
        return mark;
    }

    function linkLine(label, summary, onClick, color, type) {
        var row = el('div', 'asset-tree-issue');
        row.appendChild(type && type.typeKey ? typeTile(type, 'sm') : issueMark(color));
        var title = button(label, 'asset-tree-linkish', onClick);
        row.appendChild(title);
        if (summary) row.appendChild(el('span', 'asset-tree-issuelink-summary', summary));
        row.addEventListener('click', function (event) {
            if (event.target === title || title.contains(event.target)) return;
            title.click();
        });
        return row;
    }

    function renderChildList(asset) {
        var section = el('section', 'asset-tree-detail is-queue');
        section.id = 'asset-tree-detail';
        var project = currentProject();
        var title = asset ? asset.name : (project ? project.name : state.projectKey);
        var parentId = asset ? asset.id : null;
        var remote = useRemoteSearch();
        var pool = projectFiltering() ? matchesIn(parentId) : childrenOf(parentId);
        if (asset && isFolder(asset) && !projectFiltering() && !remote) {
            pool = pool.filter(isFolder);
        }
        var kids = remote
            ? listed((state.searchHits || []).filter(function (asset) { return assetMatches(asset, true); }))
            : listed(pool);
        if (remote || projectFiltering()) {
            title = t('searchResults');
        }
        var head = el('div', 'asset-tree-queue-head');
        var titles = el('div', 'asset-tree-queue-titles');
        var titleRow = el('div', 'asset-tree-queue-title');
        titleRow.appendChild(el('h2', null, title));
        titleRow.appendChild(el('span', 'asset-tree-badge', String(remote && state.searching ? '…' : kids.length)));
        titles.appendChild(titleRow);
        if (asset) titles.appendChild(el('p', 'asset-tree-crumb', crumbs(asset)));
        head.appendChild(titles);
        var tools = el('div', 'asset-tree-inline-actions');
        var emptyRoot = !asset && !kids.length && !projectFiltering() && !remote;
        if (state.canCreate && !emptyRoot) {
            tools.appendChild(button(asset && isFolder(asset) ? t('addHere') : t('addPlace'), 'asset-tree-btn', function () {
                if (asset && isFolder(asset)) openCreate(parentId);
                else openCreate(null, 'place');
            }));
        }
        if (tools.childNodes.length) head.appendChild(tools);
        section.appendChild(head);
        section.appendChild(filterBar());
        if (state.searchScope === 'all' && textQuery() && textQuery().length < 2) {
            section.appendChild(el('p', 'asset-tree-hint', t('searchPrompt')));
        }
        if (state.searching && remote) {
            section.appendChild(el('p', 'asset-tree-hint', t('loading')));
            return section;
        }
        if (!kids.length && !asset && !projectFiltering() && !remote) {
            var lead = el('div', 'asset-tree-lead');
            lead.appendChild(el('p', 'asset-tree-hint', t('hierarchyLead')));
            var steps = el('ol', 'asset-tree-steps');
            [t('stepBranch'), t('stepKind'), t('stepObject')].forEach(function (line) {
                steps.appendChild(el('li', null, line));
            });
            lead.appendChild(steps);
            if (state.canCreate) {
                lead.appendChild(button(t('addPlace'), 'asset-tree-btn primary', function () {
                    openCreate(null, 'place');
                }));
            }
            section.appendChild(lead);
        } else if (!kids.length) {
            section.appendChild(el('p', 'asset-tree-hint', (projectFiltering() || remote) ? t('noResults') : (asset && isFolder(asset) ? t('placeListHint') : t('listEmpty'))));
        }
        if (!kids.length) {
            return section;
        }
        var headers = [t('name'), t('keyLabel'), t('type'), t('status'), t('custodian')];
        var showField = state.sortKey && state.sortKey.indexOf('attr:') === 0;
        if (showField) headers.push(fieldSpec(state.sortKey).label);
        if (remote) headers.push(t('project'));
        section.appendChild(assetTable(kids.map(function (child) {
            var nested = childrenOf(child.id).length;
            var who = child.custodian && child.custodian.displayName ? child.custodian.displayName : '';
            var cells = [
                openName(child.name, function () {
                    if (child.projectKey && child.projectKey !== state.projectKey) {
                        goToAsset(child.projectKey, child.id);
                        return;
                    }
                    state.pane = 'list';
                    selectAsset(child.id);
                }),
                child.objectKey || '',
                typeBadge(typeFor(child), child.typeLabel || typeOf(child.typeKey).label),
                nested && !projectFiltering() && !remote ? t('childCount', nested) : lozenge(child.status),
                who || t('custodianNone')
            ];
            if (showField) cells.push(fieldRaw(child, state.sortKey));
            if (remote) cells.push(child.projectName || child.projectKey || '');
            return cells;
        }), headers));
        return section;
    }

    function openName(label, onClick) {
        return button(label, 'asset-tree-linkish', onClick);
    }

    function lozenge(status) {
        return el('span', 'asset-tree-lozenge ' + statusClass(status), statusLabel(status));
    }

    function assetTable(records, headers) {
        var table = el('table', 'asset-tree-table');
        var head = el('thead');
        var hr = el('tr');
        headers.forEach(function (label) {
            hr.appendChild(el('th', null, label));
        });
        head.appendChild(hr);
        table.appendChild(head);
        var body = el('tbody');
        records.forEach(function (cells) {
            var tr = el('tr');
            cells.forEach(function (cell) {
                var td = el('td');
                if (cell && cell.nodeType) {
                    td.appendChild(cell);
                } else {
                    td.textContent = cell == null ? '' : String(cell);
                }
                tr.appendChild(td);
            });
            body.appendChild(tr);
        });
        table.appendChild(body);
        return table;
    }

    function openAll(id) {
        state.view = 'all';
        state.pane = 'list';
        state.dirty = false;
        state.loading = false;
        state.error = null;
        state.selectedId = id || null;
        rememberView('all');
        mount();
        renderFrame();
        if (id && byId()[id]) {
            selectAsset(id, true);
        }
    }

    function goToAsset(projectKey, id) {
        state.pane = 'list';
        if (projectKey && projectKey !== state.projectKey) {
            state.view = 'all';
            rememberView('all');
            switchProject(projectKey, id);
            return;
        }
        openAll(id);
    }

    function relativeTime(iso) {
        if (!iso) {
            return '';
        }
        var then = Date.parse(iso);
        if (isNaN(then)) {
            return formatDate(iso);
        }
        var minutes = Math.round((Date.now() - then) / 60000);
        if (minutes < 1) return t('justNow');
        if (minutes < 60) return t('agoMinutes', minutes);
        var hours = Math.round(minutes / 60);
        if (hours < 24) return t('agoHours', hours);
        var days = Math.round(hours / 24);
        if (days < 30) return t('agoDays', days);
        return formatDate(iso);
    }

    function initials(name) {
        var parts = String(name || '').trim().split(/\s+/).slice(0, 2);
        var letters = parts.map(function (part) { return part.charAt(0).toUpperCase(); }).join('');
        return letters || '?';
    }

    function propRow(label, valueNode) {
        var row = el('div', 'asset-tree-prop');
        row.appendChild(el('span', null, label));
        row.appendChild(valueNode);
        return row;
    }

    function statusPicker(asset) {
        if (!state.canEdit) {
            return el('span', 'asset-tree-lozenge ' + statusClass(asset.status), statusLabel(asset.status));
        }
        var current = button(statusLabel(asset.status), 'asset-tree-lozenge asset-tree-status-btn ' + statusClass(asset.status), function (event) {
            event.stopPropagation();
            toggleStatusMenu(current, asset);
        });
        current.title = t('status');
        current.setAttribute('aria-haspopup', 'listbox');
        return current;
    }

    function toggleStatusMenu(anchor, asset) {
        var open = document.getElementById('asset-tree-status-menu');
        if (open) {
            closeStatusMenu();
            return;
        }
        var menu = el('div', 'asset-tree-status-menu');
        menu.id = 'asset-tree-status-menu';
        menu.setAttribute('role', 'listbox');
        statusChoices().forEach(function (choice) {
            var status = choice.value;
            var item = button('', 'asset-tree-status-item' + (status === asset.status ? ' is-current' : ''), function () {
                closeStatusMenu();
                if (status !== asset.status) changeStatus(asset, status);
            });
            item.appendChild(el('span', 'asset-tree-lozenge ' + statusClass(status), choice.label));
            menu.appendChild(item);
        });
        app.appendChild(menu);
        var box = anchor.getBoundingClientRect();
        menu.style.top = (box.bottom + 4) + 'px';
        menu.style.left = Math.max(8, Math.min(box.left, window.innerWidth - 200)) + 'px';
        function outside(event) {
            if (menu.contains(event.target) || anchor.contains(event.target)) return;
            closeStatusMenu();
        }
        menu._outside = outside;
        setTimeout(function () {
            document.addEventListener('mousedown', outside);
        }, 0);
    }

    function closeStatusMenu() {
        var menu = document.getElementById('asset-tree-status-menu');
        if (!menu) return;
        if (menu._outside) document.removeEventListener('mousedown', menu._outside);
        if (menu.parentNode) menu.parentNode.removeChild(menu);
    }

    function changeStatus(asset, status) {
        persistAsset(asset, { status: status });
    }

    function changeCustodian(asset, userKey) {
        persistAsset(asset, { custodianKey: userKey || '' });
    }

    function persistAsset(asset, changes) {
        if (!state.canEdit || !asset) return;
        var attributes = (asset.attributes || []).map(function (attribute) {
            return { fieldKey: attribute.fieldKey, value: attribute.value || '' };
        });
        var custodianKey = asset.custodian && asset.custodian.userKey ? asset.custodian.userKey : '';
        if (changes && Object.prototype.hasOwnProperty.call(changes, 'custodianKey')) {
            custodianKey = changes.custodianKey || '';
        }
        setBusy(true);
        ajax('PUT', '/assets/' + asset.id, {
            name: changes && Object.prototype.hasOwnProperty.call(changes, 'name') ? changes.name : asset.name,
            projectKey: asset.projectKey || state.projectKey,
            typeKey: asset.typeKey,
            status: changes && changes.status ? changes.status : asset.status,
            description: changes && Object.prototype.hasOwnProperty.call(changes, 'description') ? changes.description : (asset.description || ''),
            custodianKey: custodianKey,
            attributes: attributes
        }, function (code, payload) {
            setBusy(false);
            if (code < 200 || code >= 300) {
                setFormError((payload && payload.message) || t('errorTitle'));
                return;
            }
            notify(t('saved'));
            reloadTree(function () {
                selectAsset(asset.id, true);
            });
        });
    }

    function staticPeople(asset) {
        var box = el('div');
        box.appendChild(personField(t('custodian'), asset.custodian && asset.custodian.displayName ? asset.custodian.displayName : t('custodianNone'), null));
        box.appendChild(personField(t('author'), asset.createdBy || '', null));
        return box;
    }

    function personField(label, name, extra) {
        var field = el('div', 'asset-tree-people-field');
        field.appendChild(el('div', 'asset-tree-people-label', label));
        var row = el('div', 'asset-tree-person');
        var blank = !name || name === t('custodianNone');
        row.appendChild(el('span', 'asset-tree-avatar' + (blank ? ' is-blank' : ''), blank ? '' : initials(name)));
        var text = el('div', 'asset-tree-person-text');
        text.appendChild(el('strong', null, name || t('custodianNone')));
        if (extra) text.appendChild(extra);
        row.appendChild(text);
        field.appendChild(row);
        return field;
    }

    function descriptionModule(asset, inline) {
        var host = el('div');
        function paint() {
            host.innerHTML = '';
            var text = asset.description ? asset.description : t('descriptionHint');
            var view = el('div', 'asset-tree-desc' + (asset.description ? '' : ' is-empty'), text);
            if (state.canEdit) view.addEventListener('click', inline ? editInline : editForm);
            host.appendChild(view);
        }
        function editForm() {
            state.editing = true;
            state.detail = asset;
            replaceDetail();
        }
        function editInline() {
            host.innerHTML = '';
            var area = el('textarea', 'asset-tree-description');
            area.value = asset.description || '';
            var row = el('div', 'asset-tree-desc-actions');
            row.appendChild(button(t('save'), 'asset-tree-btn', function () {
                persistAsset(asset, { description: area.value });
            }));
            row.appendChild(button(t('cancel'), 'asset-tree-btn ghost', paint));
            host.appendChild(area);
            host.appendChild(row);
            area.focus();
        }
        paint();
        return moduleBlock(t('description'), host);
    }

    function custodianPicker(asset) {
        var field = el('div', 'asset-tree-people-field');
        field.appendChild(el('div', 'asset-tree-people-label', t('custodian')));
        var who = asset.custodian && asset.custodian.displayName ? asset.custodian.displayName : '';
        var person = el('div', 'asset-tree-person');
        person.appendChild(el('span', 'asset-tree-avatar' + (who ? '' : ' is-blank'), who ? initials(who) : ''));
        var personText = el('div', 'asset-tree-person-text');
        personText.appendChild(el('strong', null, who || t('custodianNone')));
        if (asset.custodian && asset.custodian.email) personText.appendChild(el('span', null, asset.custodian.email));
        if (state.canEdit && state.userKey && (!asset.custodian || asset.custodian.userKey !== state.userKey)) {
            personText.appendChild(button(t('assignMe'), 'asset-tree-linkish', function () {
                changeCustodian(asset, state.userKey);
            }));
        }
        person.appendChild(personText);
        var box = el('div', 'asset-tree-assign');
        box.id = 'asset-tree-assign';
        if (!state.canEdit) {
            field.appendChild(person);
            return field;
        }
        var toggle = button('', 'asset-tree-assign-btn', function () {
            search.hidden = !search.hidden;
            if (!search.hidden) input.focus();
        });
        toggle.appendChild(person);
        box.appendChild(toggle);
        var search = el('div', 'asset-tree-assign-search');
        search.hidden = true;
        var input = el('input');
        input.type = 'search';
        input.placeholder = t('custodianSearch');
        var results = el('div', 'asset-tree-user-results');
        var timer = null;
        input.addEventListener('input', function () {
            clearTimeout(timer);
            timer = setTimeout(function () {
                var query = input.value.trim();
                results.innerHTML = '';
                if (query.length < 2) return;
                ajax('GET', '/users?q=' + encodeURIComponent(query), null, function (status, payload) {
                    results.innerHTML = '';
                    if (status !== 200) return;
                    (payload || []).forEach(function (user) {
                        results.appendChild(button(user.displayName + (user.department ? ' · ' + user.department : ''), 'asset-tree-user-hit', function () {
                            changeCustodian(asset, user.userKey);
                        }));
                    });
                });
            }, 220);
        });
        search.appendChild(input);
        search.appendChild(results);
        if (who) {
            search.appendChild(button(t('unassign'), 'asset-tree-linkish', function () {
                changeCustodian(asset, '');
            }));
        }
        box.appendChild(search);
        field.appendChild(box);
        return field;
    }

    function openAssign() {
        var search = document.querySelector('#asset-tree-assign .asset-tree-assign-search');
        var toggle = document.querySelector('#asset-tree-assign .asset-tree-assign-btn');
        if (search && search.hidden && toggle) toggle.click();
        var input = document.querySelector('#asset-tree-assign input');
        if (input) input.focus();
    }

    function openComment() {
        var editor = document.getElementById('asset-tree-comment-editor');
        if (!editor) return;
        editor.hidden = false;
        var trigger = document.getElementById('asset-tree-comment-trigger');
        if (trigger) trigger.hidden = true;
        var area = editor.querySelector('textarea');
        if (area) area.focus();
        editor.scrollIntoView({ block: 'nearest' });
    }

    function commentCard(asset, comment) {
        var row = el('div', 'asset-tree-activity-comment');
        var head = el('div', 'asset-tree-action-head');
        var author = comment.author && comment.author.displayName ? comment.author.displayName : '';
        head.appendChild(el('span', 'asset-tree-avatar is-small', initials(author)));
        var details = el('div', 'asset-tree-action-details');
        var line = el('div', 'asset-tree-action-line');
        line.appendChild(el('span', 'asset-tree-comment-user', author));
        line.appendChild(document.createTextNode(' ' + t('actComment') + ' \u2014 '));
        line.appendChild(el('span', 'asset-tree-comment-time', stamp(comment.created)));
        details.appendChild(line);
        details.appendChild(el('div', 'asset-tree-action-body', comment.body || ''));
        if (state.canComment) {
            var links = el('div', 'asset-tree-action-links');
            links.appendChild(button(t('delete'), 'asset-tree-linkish', function () {
                ajax('DELETE', '/assets/' + asset.id + '/comments/' + comment.id, null, function (status, payload) {
                    if (status >= 200 && status < 300) selectAsset(asset.id, true);
                    else setFormError((payload && payload.message) || t('errorTitle'));
                });
            }));
            details.appendChild(links);
        }
        head.appendChild(details);
        row.appendChild(head);
        return row;
    }

    function historyValue(item, value) {
        if (!value) return '';
        if (item.action === 'status') return statusLabel(value);
        return value;
    }

    function historyField(item) {
        if (item.field) return item.field;
        if (item.action === 'status') return t('status');
        if (item.action === 'custodian') return t('custodian');
        if (item.action === 'name') return t('name');
        if (item.action === 'description') return t('description');
        if (item.action === 'type') return t('type');
        if (item.action === 'move') return t('parent');
        return '';
    }

    function historyVerb(item) {
        if (item.action === 'created') return t('actCreated');
        if (item.action === 'comment') return t('actComment');
        if (item.action === 'comment_delete') return t('actCommentDelete');
        if (item.action === 'file') return t('actFile');
        if (item.action === 'file_delete') return t('actFileDelete');
        if (item.action === 'move') return t('actMove');
        return t('actUpdated');
    }

    function historyCard(item) {
        var row = el('div', 'asset-tree-history');
        var head = el('div', 'asset-tree-history-head');
        var author = item.author && item.author.displayName ? item.author.displayName : '';
        head.appendChild(el('span', 'asset-tree-avatar', initials(author)));
        var text = el('div');
        var line = el('div');
        line.appendChild(el('strong', null, author));
        line.appendChild(document.createTextNode(' ' + historyVerb(item)));
        text.appendChild(line);
        text.appendChild(el('span', null, stamp(item.created)));
        head.appendChild(text);
        row.appendChild(head);
        if (item.action === 'created') return row;
        var change = el('div', 'asset-tree-history-change');
        var field = historyField(item);
        if (field) change.appendChild(el('span', 'asset-tree-history-field', field));
        var oldText = historyValue(item, item.oldValue);
        var newText = historyValue(item, item.newValue);
        if (item.action === 'file' || item.action === 'file_delete' || item.action === 'comment' || item.action === 'comment_delete') {
            change.appendChild(el('span', null, newText || oldText));
        } else if (item.action === 'status') {
            if (item.oldValue) change.appendChild(el('span', 'asset-tree-lozenge ' + statusClass(item.oldValue), statusLabel(item.oldValue)));
            change.appendChild(el('span', 'asset-tree-history-arrow', '\u2192'));
            if (item.newValue) change.appendChild(el('span', 'asset-tree-lozenge ' + statusClass(item.newValue), statusLabel(item.newValue)));
        } else if (oldText || newText || item.action === 'custodian') {
            var missing = item.action === 'custodian' ? t('custodianNone') : t('emptyValue');
            change.appendChild(el('span', 'is-old', oldText || missing));
            change.appendChild(el('span', 'asset-tree-history-arrow', '\u2192'));
            change.appendChild(el('span', 'is-new', newText || missing));
        }
        row.appendChild(change);
        return row;
    }

    function activityEvents(asset, tab) {
        var events = [];
        var activities = asset.activities || [];
        var hasCreated = activities.some(function (item) { return item.action === 'created'; });
        if (!hasCreated && asset.created) {
            activities = activities.concat([{
                id: 0,
                action: 'created',
                created: asset.created,
                author: { displayName: asset.createdBy || '' }
            }]);
        }
        if (tab !== 'history') {
            (asset.comments || []).forEach(function (comment) {
                events.push({ kind: 'comment', created: comment.created || '', id: comment.id, comment: comment });
            });
        }
        if (tab !== 'comments') {
            activities.forEach(function (item) {
                if (tab !== 'history' && item.action === 'comment') return;
                events.push({ kind: 'history', created: item.created || '', id: item.id, item: item });
            });
        }
        events.sort(function (left, right) {
            if (left.created === right.created) return left.id - right.id;
            return left.created < right.created ? -1 : 1;
        });
        return events;
    }

    function activityBlock(asset) {
        var body = el('div');
        var tabs = el('div', 'asset-tree-tabs');
        [['all', 'activityAll'], ['comments', 'activityComments'], ['history', 'activityHistory']].forEach(function (pair) {
            var tab = button(t(pair[1]), 'asset-tree-tab' + (state.activityTab === pair[0] ? ' is-active' : ''), function () {
                state.activityTab = pair[0];
                if (state.detail && state.detail.id === asset.id) showDetail(state.detail, false);
            });
            tabs.appendChild(tab);
        });
        body.appendChild(tabs);
        if (asset.comments == null || asset.activities == null) {
            body.appendChild(el('p', 'asset-tree-hint', t('loading')));
        } else {
            var events = activityEvents(asset, state.activityTab || 'all');
            if (!events.length) {
                body.appendChild(el('p', 'asset-tree-empty-note', state.activityTab === 'history' ? t('historyEmpty') : t('activityEmpty')));
            } else {
                events.forEach(function (event) {
                    body.appendChild(event.kind === 'comment' ? commentCard(asset, event.comment) : historyCard(event.item));
                });
            }
        }
        if (state.canComment) {
            var editor = el('div', 'asset-tree-comment-editor');
            editor.id = 'asset-tree-comment-editor';
            editor.hidden = true;
            var area = el('textarea', 'asset-tree-comment-box');
            area.placeholder = t('commentPlaceholder');
            var actions = el('div', 'asset-tree-comment-actions');
            actions.appendChild(button(t('commentSubmit'), 'asset-tree-btn primary', function () {
                var text = area.value.trim();
                if (!text) {
                    setFormError(t('commentPlaceholder'));
                    return;
                }
                ajax('POST', '/assets/' + asset.id + '/comments', { body: text }, function (status, payload) {
                    if (status >= 200 && status < 300) selectAsset(asset.id, true);
                    else setFormError((payload && payload.message) || t('errorTitle'));
                });
            }));
            actions.appendChild(button(t('cancel'), 'asset-tree-linkish', function () {
                editor.hidden = true;
                area.value = '';
                var trigger = document.getElementById('asset-tree-comment-trigger');
                if (trigger) trigger.hidden = false;
            }));
            editor.appendChild(area);
            editor.appendChild(actions);
            body.appendChild(editor);
            var trigger = toolButton(t('addComment'), 'comment', openComment);
            trigger.id = 'asset-tree-comment-trigger';
            body.appendChild(trigger);
        }
        return moduleBlock(t('activityTitle'), body);
    }

    function fileBlock(asset) {
        var body = el('div');
        var list = asset.files;
        if (list == null) {
            body.appendChild(el('p', 'asset-tree-hint', t('loading')));
        } else {
            list.forEach(function (file) {
                var row = el('div', 'asset-tree-attachment');
                row.appendChild(el('span', 'asset-tree-file-icon is-' + fileKind(file.fileName), fileGlyph(file.fileName)));
                var link = el('a', null, file.fileName || '');
                link.href = contextPath() + '/plugins/servlet/asset-tree-file?id=' + file.id;
                row.appendChild(link);
                row.appendChild(el('span', 'asset-tree-file-meta', fileSize(file.size)));
                if (file.authorName) row.appendChild(el('span', 'asset-tree-file-meta', file.authorName));
                if (state.canComment) {
                    row.appendChild(button(t('delete'), 'asset-tree-linkish', function () {
                        ajax('DELETE', '/assets/' + asset.id + '/files/' + file.id, null, function (status, payload) {
                            if (status >= 200 && status < 300) selectAsset(asset.id, true);
                            else setFormError((payload && payload.message) || t('errorTitle'));
                        });
                    }));
                }
                body.appendChild(row);
            });
        }
        var fileError = el('p', 'asset-tree-form-error');
        fileError.id = 'asset-tree-file-error';
        fileError.hidden = true;
        body.appendChild(fileError);
        if (state.canComment) {
            var drop = el('label', 'asset-tree-drop');
            var input = el('input', 'asset-tree-file');
            input.type = 'file';
            input.addEventListener('change', function () {
                var chosen = input.files && input.files[0];
                input.value = '';
                if (chosen) uploadFile(asset, chosen);
            });
            drop.appendChild(input);
            drop.appendChild(toolIcon('cloud'));
            var caption = el('div', 'asset-tree-drop-caption');
            caption.appendChild(document.createTextNode(t('attachDrop') + ' '));
            caption.appendChild(el('span', 'asset-tree-drop-browse', t('attachBrowse')));
            drop.appendChild(caption);
            drop.addEventListener('dragover', function (event) {
                event.preventDefault();
                drop.classList.add('is-over');
            });
            drop.addEventListener('dragleave', function () { drop.classList.remove('is-over'); });
            drop.addEventListener('drop', function (event) {
                event.preventDefault();
                drop.classList.remove('is-over');
                if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                    uploadFile(asset, event.dataTransfer.files[0]);
                }
            });
            body.appendChild(drop);
        } else if (list && !list.length) {
            body.appendChild(el('p', 'asset-tree-hint', t('attachEmpty')));
        }
        return moduleBlock(t('attachments'), body);
    }

    function fileKind(name) {
        var ext = String(name || '').split('.').pop().toLowerCase();
        if (!ext || ext === String(name || '').toLowerCase()) return 'file';
        if (ext === 'pdf') return 'pdf';
        if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif' || ext === 'webp') return 'img';
        if (ext === 'doc' || ext === 'docx' || ext === 'txt' || ext === 'rtf') return 'doc';
        if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') return 'xls';
        if (ext === 'zip' || ext === 'rar' || ext === '7z') return 'zip';
        return 'file';
    }

    function fileGlyph(name) {
        var kind = fileKind(name);
        if (kind === 'pdf') return 'PDF';
        if (kind === 'img') return 'IMG';
        if (kind === 'doc') return 'DOC';
        if (kind === 'xls') return 'XLS';
        if (kind === 'zip') return 'ZIP';
        var ext = String(name || '').split('.').pop();
        if (!ext || ext === name) return 'FILE';
        return ext.slice(0, 4).toUpperCase();
    }

    function fileSize(bytes) {
        var size = Number(bytes) || 0;
        if (size < 1024) return size + ' B';
        if (size < 1048576) return Math.round(size / 1024) + ' KB';
        return (size / 1048576).toFixed(1) + ' MB';
    }

    function showFileError(message) {
        var node = document.getElementById('asset-tree-file-error');
        if (!node) {
            setFormError(message);
            return;
        }
        node.hidden = !message;
        node.textContent = message || '';
    }

    function uploadFile(asset, file) {
        if (!file) return;
        showFileError('');
        var xhr = new XMLHttpRequest();
        var data = new FormData();
        data.append('file', file, file.name || 'file');
        xhr.open('POST', contextPath() + '/plugins/servlet/asset-tree-file?assetId=' + asset.id, true);
        xhr.setRequestHeader('X-Atlassian-Token', 'no-check');
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;
            if (xhr.status >= 200 && xhr.status < 300) {
                notify(t('saved'));
                selectAsset(asset.id, true);
                return;
            }
            var payload = null;
            try { payload = JSON.parse(xhr.responseText); } catch (error) { payload = null; }
            showFileError((payload && payload.message) || t('errorTitle'));
        };
        xhr.send(data);
    }

    function showDetailView(asset, issuesLoading, section) {
        section.className = 'asset-tree-detail is-issue is-view';
        section.innerHTML = '';
        var form = el('div', 'asset-tree-request is-view');
        var main = el('div', 'asset-tree-request-main');
        var aside = el('aside', 'asset-tree-request-aside');

        main.appendChild(issueCrumb(asset));
        main.appendChild(el('h1', 'asset-tree-issue-title', asset.name || ''));
        var ops = el('div', 'asset-tree-ops');
        if (state.canEdit) {
            ops.appendChild(toolButton(t('edit'), 'edit', function () {
                state.editing = true;
                showDetail(state.detail || asset, false);
            }));
        }
        if (state.canComment) {
            ops.appendChild(toolButton(t('addComment'), 'comment', openComment));
        }
        var extra = [];
        if (state.canRemove) extra.push({ label: t('delete'), danger: true, onClick: function () { openDelete(asset); } });
        if (childrenOf(asset.id).length || !showsInTree(asset)) {
            extra.push({
                label: t('backToList'),
                onClick: function () {
                    state.pane = 'list';
                    if (!state.typeGroup) {
                        var parent = asset.parentId ? byId()[asset.parentId] : null;
                        state.selectedId = parent ? parent.id : null;
                    }
                    renderNodes();
                    replaceDetail();
                }
            });
        }
        if (extra.length) ops.appendChild(moreMenu(extra));
        main.appendChild(ops);
        if (crumbs(asset)) main.appendChild(el('p', 'asset-tree-crumb', crumbs(asset)));

        var items = [detailItem(t('type'), typeBadge(typeFor(asset), asset.typeLabel || typeOf(asset.typeKey).label || ''))];
        items.push(detailItem(t('status'), statusPicker(asset)));
        var place = asset.location || (asset.parentId && byId()[asset.parentId] ? byId()[asset.parentId].name : t('root'));
        items.push(detailItem(t('parent'), el('span', null, place)));
        (asset.attributes || []).forEach(function (attribute) {
            var shown = attribute.value ? String(attribute.value) : t('emptyValue');
            items.push(detailItem(attribute.name || attribute.fieldKey, el('span', attribute.value ? null : 'is-empty', shown)));
        });
        main.appendChild(moduleBlock(t('detailsTitle'), detailGrid(items)));
        main.appendChild(descriptionModule(asset, true));
        main.appendChild(fileBlock(asset));

        var issues = el('div');
        if (state.canEdit) {
            var linker = el('div', 'asset-tree-linkrow');
            var issueInput = el('input');
            issueInput.placeholder = t('issuePlaceholder');
            linker.appendChild(issueInput);
            linker.appendChild(button(t('linkIssue'), 'asset-tree-btn', function () {
                linkIssue(asset.id, issueInput.value);
            }));
            issues.appendChild(linker);
        }
        if (issuesLoading || asset.issues == null) {
            issues.appendChild(el('p', 'asset-tree-hint', t('loadingIssues')));
        } else if (!asset.issues.length) {
            issues.appendChild(el('p', 'asset-tree-hint', t('linkedEmpty')));
        } else {
            asset.issues.forEach(function (issue) {
                issues.appendChild(issueRow(asset.id, issue));
            });
        }
        main.appendChild(moduleBlock(t('issues'), issues));
        main.appendChild(activityBlock(asset));

        var error = el('div', 'asset-tree-form-error');
        error.id = 'asset-tree-form-error';
        error.hidden = true;
        main.appendChild(error);

        var people = el('div');
        people.appendChild(custodianPicker(asset));
        people.appendChild(personField(t('author'), asset.createdBy || '', null));
        aside.appendChild(moduleBlock(t('people'), people));
        aside.appendChild(moduleBlock(t('dates'), datesBody(asset)));

        form.appendChild(main);
        form.appendChild(aside);
        section.appendChild(form);
    }

    function showDetail(asset, issuesLoading, section) {
        if (!section) {
            section = document.getElementById('asset-tree-detail');
            if (!section) {
                renderFrame();
                section = document.getElementById('asset-tree-detail');
            }
        }
        if (!section || !asset) {
            return;
        }
        state.detail = asset;
        var placePage = isFolder(asset);
        if (!state.editing || !state.canEdit) {
            if (placePage) {
                state.editing = false;
                replaceDetail();
                return;
            }
            showDetailView(asset, issuesLoading, section);
            return;
        }
        section.className = 'asset-tree-detail is-issue';
        section.innerHTML = '';
        var form = el('form', 'asset-tree-request');
        form.id = 'asset-detail-form';
        var main = el('div', 'asset-tree-request-main');
        var aside = el('aside', 'asset-tree-request-aside');

        var top = el('div', 'asset-tree-request-top');
        var kicker = el('div', 'asset-tree-kicker');
        var key = el('span', 'asset-tree-issuekey', asset.objectKey);
        kicker.appendChild(key);
        if (!placePage) {
            kicker.appendChild(el('span', 'asset-tree-lozenge ' + statusClass(asset.status), statusLabel(asset.status)));
        }
        top.appendChild(kicker);
        var actions = el('div', 'asset-tree-detail-actions');
        if (!placePage && (childrenOf(asset.id).length || !showsInTree(asset))) {
            actions.appendChild(button(t('backToList'), 'asset-tree-btn', function () {
                state.pane = 'list';
                var parent = asset.parentId ? byId()[asset.parentId] : null;
                if (!showsInTree(asset)) {
                    state.selectedId = parent ? parent.id : null;
                }
                renderNodes();
                replaceDetail();
            }));
        }
        if (state.canEdit) {
            actions.appendChild(button(t('cancel'), 'asset-tree-btn', function () {
                if (state.dirty && !window.confirm(t('confirmDiscard'))) {
                    return;
                }
                state.editing = false;
                state.dirty = false;
                if (placePage) {
                    replaceDetail();
                    return;
                }
                showDetail(state.detail || asset, false);
            }));
            actions.appendChild(button(t('delete'), 'asset-tree-btn danger', function () { openDelete(asset); }));
            var save = button(t('save'), 'asset-tree-btn primary', function () { saveDetail(); });
            save.id = 'asset-tree-save';
            actions.appendChild(save);
        }
        top.appendChild(actions);
        main.appendChild(top);
        main.appendChild(el('p', 'asset-tree-crumb', crumbs(asset)));

        var summary = input('asset-field-name', asset.name || '', !state.canEdit);
        summary.className = 'asset-tree-summary';
        main.appendChild(summary);

        var description = el('div', 'asset-tree-request-block');
        description.appendChild(el('h3', null, t('description')));
        var descriptionBox = area('asset-field-description', asset.description || '', !state.canEdit);
        descriptionBox.className = 'asset-tree-description';
        description.appendChild(descriptionBox);
        main.appendChild(description);

        var attributes = el('div', 'asset-tree-request-block');
        var fieldHead = el('div', 'asset-tree-block-head');
        fieldHead.appendChild(el('h3', null, t('fields')));
        if (state.canEdit) {
            fieldHead.appendChild(button(t('addField'), 'asset-tree-btn', function () {
                if (state.dirty && !window.confirm(t('confirmDiscard'))) return;
                var typeBox = document.getElementById('asset-field-type');
                openFieldModal(typeOf(typeBox ? typeBox.value : asset.typeKey), function () {
                    reloadTree(function () {
                        selectAsset(asset.id, true);
                    });
                });
            }));
        }
        attributes.appendChild(fieldHead);
        attributes.appendChild(el('p', 'asset-tree-hint', t('attributesHint')));
        var attrList = el('div');
        attrList.id = 'asset-tree-attrs';
        paintAssetFields(attrList, asset.typeKey, asset.attributes || []);
        attributes.appendChild(attrList);
        main.appendChild(attributes);

        var issues = el('div', 'asset-tree-request-block');
        issues.appendChild(el('h3', null, t('issues')));
        if (state.canEdit) {
            var linker = el('div', 'asset-tree-linkrow');
            var issueInput = el('input');
            issueInput.id = 'asset-field-issue';
            issueInput.placeholder = t('issuePlaceholder');
            linker.appendChild(issueInput);
            linker.appendChild(button(t('linkIssue'), 'asset-tree-btn', function () {
                linkIssue(asset.id, issueInput.value);
            }));
            issues.appendChild(linker);
        }
        var issueList = el('div');
        issueList.id = 'asset-tree-issues';
        if (issuesLoading || asset.issues === null || asset.issues === undefined) {
            issueList.appendChild(el('p', 'asset-tree-hint', t('loadingIssues')));
        } else if (!asset.issues.length) {
            issueList.appendChild(el('p', 'asset-tree-hint', t('linkedEmpty')));
        } else {
            asset.issues.forEach(function (issue) {
                issueList.appendChild(issueRow(asset.id, issue));
            });
        }
        issues.appendChild(issueList);
        main.appendChild(issues);

        var error = el('div', 'asset-tree-form-error');
        error.id = 'asset-tree-form-error';
        error.hidden = true;
        main.appendChild(error);

        aside.appendChild(el('h3', null, t('people')));
        aside.appendChild(custodianField('asset-field-custodian', asset.custodian));
        aside.appendChild(el('h3', null, t('details')));
        aside.appendChild(field(t('type'), selectBox('asset-field-type', state.types.map(function (type) {
            return { value: type.typeKey, label: type.label };
        }), asset.typeKey, !state.canEdit)));
        if (!placePage) {
            aside.appendChild(field(t('status'), selectBox('asset-field-status', statusChoices(), asset.status, !state.canEdit)));
        }
        aside.appendChild(field(t('parent'), parentSelect(asset)));
        aside.appendChild(el('h3', null, t('dates')));
        var meta = el('div', 'asset-tree-meta');
        meta.appendChild(el('span', null, t('created') + ': ' + formatDate(asset.created) + (asset.createdBy ? ' · ' + asset.createdBy : '')));
        meta.appendChild(el('span', null, t('updated') + ': ' + formatDate(asset.updated) + (asset.updatedBy ? ' · ' + asset.updatedBy : '')));
        var nested = descendantsOf(asset.id).length;
        if (nested) meta.appendChild(el('span', null, t('descendants', nested)));
        aside.appendChild(meta);

        form.appendChild(main);
        form.appendChild(aside);
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            saveDetail();
        });
        form.addEventListener('input', function () {
            state.dirty = true;
        });
        form.addEventListener('change', function () {
            state.dirty = true;
        });
        section.appendChild(form);
        var typeSelect = document.getElementById('asset-field-type');
        if (typeSelect) {
            typeSelect.addEventListener('change', function () {
                paintAssetFields(attrList, typeSelect.value, collectAttributes());
            });
        }
    }

    function field(label, control, wide) {
        var wrap = el('label', 'asset-tree-field' + (wide ? ' wide' : ''));
        wrap.appendChild(el('span', null, label));
        wrap.appendChild(control);
        return wrap;
    }

    function input(id, value, disabled) {
        var node = el('input');
        if (id) node.id = id;
        node.value = value;
        node.disabled = !!disabled;
        if (disabled) node.setAttribute('data-disabled', '1');
        return node;
    }

    function area(id, value, disabled) {
        var node = el('textarea');
        if (id) node.id = id;
        node.value = value;
        node.disabled = !!disabled;
        if (disabled) node.setAttribute('data-disabled', '1');
        return node;
    }

    function selectBox(id, options, selected, disabled) {
        var node = el('select');
        if (id) node.id = id;
        options.forEach(function (option) {
            var item = el('option', null, option.label);
            item.value = option.value;
            if (option.value === selected) {
                item.selected = true;
            }
            node.appendChild(item);
        });
        node.disabled = !!disabled;
        if (disabled) node.setAttribute('data-disabled', '1');
        return node;
    }

    function parentSelect(asset) {
        var blocked = {};
        blocked[asset.id] = true;
        descendantsOf(asset.id).forEach(function (id) { blocked[id] = true; });
        var options = [{ value: '', label: t('root') }];
        function walk(parentId, depth) {
            childrenOf(parentId).forEach(function (candidate) {
                if (blocked[candidate.id]) {
                    return;
                }
                var prefix = '';
                for (var i = 0; i < depth; i++) {
                    prefix += '· ';
                }
                options.push({ value: String(candidate.id), label: prefix + candidate.name });
                walk(candidate.id, depth + 1);
            });
        }
        walk(null, 0);
        var selected = asset.parentId ? String(asset.parentId) : '';
        return selectBox('asset-field-parent', options, selected, !state.canEdit);
    }

    function attributeRow(attribute) {
        var row = el('div', 'asset-tree-attr');
        var name = el('input', 'asset-tree-attr-name');
        name.value = attribute.name || '';
        name.placeholder = t('attrName');
        name.disabled = !state.canEdit;
        var value = el('input', 'asset-tree-attr-value');
        value.value = attribute.value || '';
        value.placeholder = t('attrValue');
        value.disabled = !state.canEdit;
        row.appendChild(name);
        row.appendChild(value);
        if (state.canEdit) {
            row.appendChild(button(t('removeAttr'), 'asset-tree-btn ghost', function () {
                row.parentNode.removeChild(row);
                state.dirty = true;
            }));
        }
        return row;
    }

    function addAttribute() {
        var list = document.getElementById('asset-tree-attrs');
        if (!list) return;
        list.appendChild(attributeRow({ name: '', value: '' }));
        state.dirty = true;
        var names = list.querySelectorAll('.asset-tree-attr-name');
        if (names.length) {
            names[names.length - 1].focus();
        }
    }

    function issueRow(assetId, issue) {
        var row = el('div', 'asset-tree-issue');
        row.appendChild(issueMark('#0052cc'));
        var link = el('a', null, issue.issueKey);
        link.href = contextPath() + '/browse/' + encodeURIComponent(issue.issueKey);
        row.appendChild(link);
        row.appendChild(el('span', 'asset-tree-issuelink-summary', issue.summary || ''));
        if (state.canEdit) {
            row.appendChild(button(t('unlink'), 'asset-tree-linkish', function () {
                ajax('DELETE', '/assets/' + assetId + '/issues/' + issue.issueId, null, function (status, payload) {
                    if (status >= 200 && status < 300) {
                        selectAsset(assetId, true);
                    } else {
                        setFormError((payload && payload.message) || t('errorTitle'));
                    }
                });
            }));
        }
        return row;
    }

    function contextPath() {
        if (window.AJS && typeof AJS.contextPath === 'function') {
            return AJS.contextPath();
        }
        var rest = state.rest || '';
        var marker = '/rest/asset-tree/1.0';
        var index = rest.indexOf(marker);
        return index >= 0 ? rest.substring(0, index) : '';
    }

    function collectAttributes(root) {
        var scope = root || app;
        var rows = scope.querySelectorAll('[data-field-key]');
        var attributes = [];
        for (var i = 0; i < rows.length; i++) {
            var input = rows[i].querySelector('.asset-tree-field-value');
            attributes.push({
                fieldKey: rows[i].getAttribute('data-field-key'),
                value: input ? input.value : ''
            });
        }
        return attributes;
    }

    function setFormError(message) {
        var node = document.getElementById('asset-tree-form-error');
        if (!node) {
            notify(message);
            return;
        }
        node.hidden = !message;
        node.textContent = message || '';
    }

    function saveDetail() {
        if (!state.canEdit || !state.selectedId) return;
        var name = document.getElementById('asset-field-name').value;
        if (!name.trim()) {
            setFormError(t('nameRequired'));
            return;
        }
        var id = state.selectedId;
        var current = byId()[id];
        var parentValue = document.getElementById('asset-field-parent').value;
        var parentId = parentValue === '' ? null : parseInt(parentValue, 10);
        var parentChanged = !current || (current.parentId || null) !== parentId;
        var statusBox = document.getElementById('asset-field-status');
        setFormError('');
        setBusy(true);
        ajax('PUT', '/assets/' + id, {
            name: name,
            projectKey: state.projectKey,
            typeKey: document.getElementById('asset-field-type').value,
            status: statusBox ? statusBox.value : ((current && current.status) || 'in_stock'),
            description: document.getElementById('asset-field-description').value,
            custodianKey: document.getElementById('asset-field-custodian').value,
            attributes: collectAttributes(document.getElementById('asset-detail-form'))
        }, function (status, payload) {
            if (status < 200 || status >= 300) {
                setBusy(false);
                setFormError((payload && payload.message) || t('errorTitle'));
                return;
            }
            if (!parentChanged) {
                finishSave(id, t('saved'));
                return;
            }
            ajax('POST', '/assets/' + id + '/move', { parentId: parentId, index: null }, function (moveStatus, movePayload) {
                if (moveStatus < 200 || moveStatus >= 300) {
                    setBusy(false);
                    setFormError((movePayload && movePayload.message) || t('errorTitle'));
                    reloadTree(function () { selectAsset(id, true); });
                    return;
                }
                if (parentId) {
                    state.expanded[parentId] = true;
                    rememberExpanded();
                }
                finishSave(id, t('moved'));
            });
        });
    }

    function finishSave(id, message) {
        state.dirty = false;
        state.editing = false;
        reloadTree(function () {
            setBusy(false);
            selectAsset(id, true);
            notify(message);
            if (state.view === 'dashboard') {
                loadReport();
            }
        });
    }

    function linkIssue(assetId, issueKey) {
        if (!issueKey || !issueKey.trim()) {
            setFormError(t('issuePlaceholder'));
            return;
        }
        ajax('POST', '/assets/' + assetId + '/issues', { issueKey: issueKey.trim() }, function (status, payload) {
            if (status >= 200 && status < 300) {
                notify(t('issueAdded'));
                selectAsset(assetId, true);
            } else {
                setFormError((payload && payload.message) || t('errorTitle'));
            }
        });
    }

    function kindSelect(id, selected) {
        return selectBox(id, [
            { value: 'text', label: t('kindText') },
            { value: 'textarea', label: t('kindTextarea') },
            { value: 'number', label: t('kindNumber') },
            { value: 'user', label: t('kindUser') }
        ], selected || 'text', false);
    }

    function openCreate(parentId, kind, typeKey) {
        if (!kind && !parentId) {
            openCreate(null, 'place');
            return;
        }
        if (kind === 'place') {
            var placeAnchor = parentId ? byId()[parentId] : null;
            if (placeAnchor && !isFolder(placeAnchor)) {
                parentId = placeAnchor.parentId || null;
            }
        }
        openModal(function (dialog) {
            if (!kind) {
                var hasTypes = state.types.some(function (type) { return !type.location; });
                dialog.appendChild(el('h2', null, t('growTitle')));
                dialog.appendChild(el('p', 'asset-tree-hint', t('growHint')));
                var choose = el('div', 'asset-tree-dialog-actions');
                choose.appendChild(button(t('addInsidePlace'), 'asset-tree-btn' + (hasTypes ? ' primary' : ''), function () {
                    closeModal();
                    openCreate(parentId, 'place');
                }));
                if (state.canConfigure) {
                    choose.appendChild(button(t('addTypeHere'), 'asset-tree-btn' + (hasTypes ? '' : ' primary'), function () {
                        closeModal();
                        openTypes();
                    }));
                }
                choose.appendChild(button(t('cancel'), 'asset-tree-btn', closeModal));
                dialog.appendChild(choose);
                return;
            }
            if (kind !== 'place') dialog.classList.add('is-wide');
            if (kind === 'object' && !state.assets.some(isFolder)) {
                dialog.appendChild(el('h2', null, t('addObject')));
                dialog.appendChild(el('p', null, t('needPlace')));
                var missingPlace = el('div', 'asset-tree-dialog-actions');
                missingPlace.appendChild(button(t('cancel'), 'asset-tree-btn', closeModal));
                missingPlace.appendChild(button(t('addPlace'), 'asset-tree-btn primary', function () {
                    closeModal();
                    openCreate(null, 'place');
                }));
                dialog.appendChild(missingPlace);
                return;
            }
            if (kind === 'object' && !state.types.some(function (type) { return !type.location; })) {
                dialog.appendChild(el('h2', null, t('addObject')));
                dialog.appendChild(el('p', null, t('needType')));
                var missingType = el('div', 'asset-tree-dialog-actions');
                missingType.appendChild(button(t('cancel'), 'asset-tree-btn', closeModal));
                if (state.canConfigure) {
                    missingType.appendChild(button(t('types'), 'asset-tree-btn primary', function () {
                        closeModal();
                        openTypes();
                    }));
                }
                dialog.appendChild(missingType);
                return;
            }
            dialog.appendChild(el('h2', null, kind === 'place' ? t('addPlace') : t('addObject')));
            var form = el('form');
            var modeHint = el('p', 'asset-tree-hint');
            form.appendChild(modeHint);
            if (kind === 'place' && parentId && byId()[parentId]) {
                form.appendChild(el('p', 'asset-tree-crumb', t('insideLabel') + ': ' + crumbs(byId()[parentId])));
            }
            if (kind === 'object' && !(typeKey && parentId && byId()[parentId] && isFolder(byId()[parentId]))) {
                var placeSelect = el('select');
                placeSelect.id = 'create-place';
                state.assets.filter(isFolder).forEach(function (asset) {
                    var option = el('option', null, crumbs(asset));
                    option.value = String(asset.id);
                    placeSelect.appendChild(option);
                });
                var preferred = parentId && byId()[parentId] && isFolder(byId()[parentId]) ? parentId : selectedPlaceId();
                if (preferred) placeSelect.value = String(preferred);
                form.appendChild(field(t('objectPlace'), placeSelect, true));
            } else if (kind === 'object' && parentId && byId()[parentId]) {
                form.appendChild(el('p', 'asset-tree-crumb', crumbs(byId()[parentId]) + '  /  ' + (typeOf(typeKey).label || typeKey)));
            }
            form.appendChild(field(t('name'), input('create-name', '', false), true));
            var typeControl = el('select');
            typeControl.id = 'create-type';
            form.appendChild(field(t('type'), typeControl, true));

            var equipment = el('div');
            equipment.appendChild(field(t('status'), selectBox('create-status', statusChoices(), 'in_use', false), true));
            equipment.appendChild(custodianField('create-custodian', null));
            form.appendChild(equipment);

            var schema = el('div');
            schema.id = 'create-fields';
            form.appendChild(schema);

            var showField = button(t('addField'), 'asset-tree-add-field', function () {
                fieldForm.hidden = false;
                showField.hidden = true;
                var label = document.getElementById('create-extra-label');
                if (label) label.focus();
            });
            form.appendChild(showField);
            var fieldForm = el('div', 'asset-tree-inline-field');
            fieldForm.hidden = true;
            fieldForm.appendChild(field(t('fieldLabel'), input('create-extra-label', '', false), true));
            fieldForm.appendChild(field(t('fieldKind'), kindSelect('create-extra-kind', 'text'), true));
            var extraRequired = el('label', 'asset-tree-check');
            var extraBox = el('input');
            extraBox.type = 'checkbox';
            extraBox.id = 'create-extra-required';
            extraRequired.appendChild(extraBox);
            extraRequired.appendChild(el('span', null, t('fieldRequired')));
            fieldForm.appendChild(extraRequired);
            var extraActions = el('div', 'asset-tree-dialog-actions');
            extraActions.appendChild(button(t('cancel'), 'asset-tree-btn', function () {
                fieldForm.hidden = true;
                showField.hidden = typeControl.value === '__new__';
            }));
            extraActions.appendChild(button(t('addField'), 'asset-tree-btn primary', function () {
                saveExtraField();
            }));
            fieldForm.appendChild(extraActions);
            form.appendChild(fieldForm);

            var creator = el('div', 'asset-tree-new-type');
            creator.appendChild(field(t('typeLabel'), input('create-type-label', '', false), true));
            var locationToggle = el('label', 'asset-tree-check');
            var locationBox = el('input');
            locationBox.type = 'checkbox';
            locationBox.id = 'create-location';
            var parent = parentId ? byId()[parentId] : null;
            locationBox.checked = !parent || !!typeOf(parent.typeKey).location;
            locationToggle.appendChild(locationBox);
            locationToggle.appendChild(el('span', null, t('locationType')));
            creator.appendChild(locationToggle);
            var treeToggle = el('label', 'asset-tree-check');
            var treeBox = el('input');
            treeBox.type = 'checkbox';
            treeBox.id = 'create-show-tree';
            treeToggle.appendChild(treeBox);
            treeToggle.appendChild(el('span', null, t('showInTree')));
            treeToggle.title = t('showInTreeHint');
            creator.appendChild(treeToggle);
            var chosenColor = PALETTE[0];
            var chosenIcon = '';
            function effectiveIcon() {
                return chosenIcon || (locationBox.checked ? DEFAULT_PLACE_ICON : DEFAULT_OBJECT_ICON);
            }
            var icons = iconPicker(effectiveIcon(), chosenColor, function (key) {
                chosenIcon = key;
            });
            var colors = colorSwatches(chosenColor, function (color) {
                chosenColor = color;
                icons.paint(color);
            });
            locationBox.addEventListener('change', function () {
                if (!chosenIcon) icons.set(effectiveIcon());
            });
            var look = el('div', 'asset-tree-appearance');
            look.appendChild(field(t('color'), colors, true));
            look.appendChild(field(t('icon'), icons, true));
            look.appendChild(el('p', 'asset-tree-hint', t('iconHint')));
            creator.appendChild(look);
            var draftList = el('div', 'asset-tree-drafts');
            draftList.id = 'create-drafts';
            creator.appendChild(draftList);
            var draftSeq = 0;
            creator.appendChild(button(t('addField'), 'asset-tree-btn', function () {
                drafts = readDrafts();
                draftSeq += 1;
                drafts.push({ id: String(draftSeq), label: '', kind: 'text', required: false, value: '' });
                paintDrafts();
                var labels = draftList.querySelectorAll('.asset-tree-draft-label');
                if (labels.length) labels[labels.length - 1].focus();
            }));
            form.appendChild(creator);

            var drafts = [];
            var error = el('div', 'asset-tree-form-error');
            error.hidden = true;
            form.appendChild(error);
            var busy = false;

            function showError(message) {
                error.hidden = !message;
                error.textContent = message || '';
            }

            function typeChoices() {
                if (typeKey) {
                    var locked = typeOf(typeKey);
                    return [{ value: typeKey, label: locked.label || typeKey }];
                }
                var options = [];
                state.types.forEach(function (type) {
                    if (kind === 'place' && !type.location) return;
                    if (kind === 'object' && type.location) return;
                    options.push({ value: type.typeKey, label: type.label });
                });
                if (kind !== 'object') {
                    options.push({ value: '__new__', label: t('newType') });
                }
                return options;
            }

            function fillTypeControl(selected) {
                typeControl.innerHTML = '';
                typeChoices().forEach(function (option) {
                    var item = el('option', null, option.label);
                    item.value = option.value;
                    if (option.value === selected) item.selected = true;
                    typeControl.appendChild(item);
                });
            }

            function creatingNew() {
                return typeControl.value === '__new__';
            }

            function placeSelected() {
                if (kind === 'place') return true;
                if (kind === 'object') return false;
                if (creatingNew()) return !!locationBox.checked;
                return !!typeOf(typeControl.value).location;
            }

            function paintSchema(values) {
                schema.innerHTML = '';
                if (creatingNew()) return;
                renderSchema(schema, typeControl.value, values || []);
                if (!fieldsOf(typeControl.value).length) {
                    schema.appendChild(el('p', 'asset-tree-hint', t('noFieldsYet')));
                }
            }

            function sync(values) {
                var creating = creatingNew();
                var place = placeSelected();
                equipment.hidden = place;
                creator.hidden = kind === 'object' || !creating;
                locationToggle.hidden = kind === 'place' || kind === 'object';
                treeToggle.hidden = kind === 'place' || kind === 'object' || !creating || place;
                treeBox.disabled = place || kind === 'place';
                if (place || kind === 'place') {
                    locationBox.checked = true;
                    treeBox.checked = false;
                }
                showField.hidden = kind === 'object' || creating || !fieldForm.hidden;
                if (kind === 'place') {
                    if (creating) dialog.classList.add('is-wide');
                    else dialog.classList.remove('is-wide');
                    modeHint.textContent = parentId ? t('nestPlaceHint') : t('placeFormHint');
                } else {
                    modeHint.textContent = t('equipmentNodeHint');
                }
                paintSchema(creating ? [] : (values || []));
            }

            function draftValue(row) {
                var node = row.querySelector('.asset-tree-draft-input');
                if (!node) return '';
                if (node.classList.contains('asset-tree-userbox')) {
                    var hidden = node.querySelector('.asset-tree-field-value');
                    return hidden ? hidden.value : '';
                }
                return node.value || '';
            }

            function readDrafts() {
                var rows = draftList.querySelectorAll('[data-draft]');
                var next = [];
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    next.push({
                        id: row.getAttribute('data-draft'),
                        label: row.querySelector('.asset-tree-draft-label').value,
                        kind: row.querySelector('.asset-tree-draft-kind').value,
                        required: row.querySelector('.asset-tree-draft-required').checked,
                        value: draftValue(row)
                    });
                }
                return next;
            }

            function draftRow(draft) {
                var row = el('div', 'asset-tree-draft');
                row.setAttribute('data-draft', draft.id);
                var label = input('', draft.label, false);
                label.className = 'asset-tree-draft-label';
                label.placeholder = t('fieldLabel');
                var kind = kindSelect('', draft.kind);
                kind.className = 'asset-tree-draft-kind';
                kind.addEventListener('change', function () {
                    drafts = readDrafts();
                    paintDrafts();
                });
                var requiredLabel = el('label', 'asset-tree-check');
                var required = el('input');
                required.type = 'checkbox';
                required.className = 'asset-tree-draft-required';
                required.checked = !!draft.required;
                requiredLabel.appendChild(required);
                requiredLabel.appendChild(el('span', null, t('fieldRequired')));
                var valueControl;
                if (draft.kind === 'textarea') {
                    valueControl = area('', draft.value || '', false);
                } else if (draft.kind === 'user') {
                    valueControl = userBox(draft.value || '', false);
                } else {
                    valueControl = input('', draft.value || '', false);
                    if (draft.kind === 'number') valueControl.inputMode = 'decimal';
                }
                valueControl.classList.add('asset-tree-draft-input');
                var top = el('div', 'asset-tree-draft-top');
                top.appendChild(label);
                top.appendChild(kind);
                top.appendChild(requiredLabel);
                top.appendChild(button(t('deleteField'), 'asset-tree-btn', function () {
                    drafts = readDrafts().filter(function (item) { return item.id !== draft.id; });
                    paintDrafts();
                }));
                row.appendChild(top);
                row.appendChild(field(t('fieldValue'), valueControl, true));
                return row;
            }

            function paintDrafts() {
                draftList.innerHTML = '';
                drafts.forEach(function (draft) {
                    draftList.appendChild(draftRow(draft));
                });
            }

            function blankRequired(root) {
                var rows = root.querySelectorAll('[data-field-key]');
                for (var i = 0; i < rows.length; i++) {
                    var caption = rows[i].querySelector('span');
                    var box = rows[i].querySelector('.asset-tree-field-value');
                    var text = caption ? caption.textContent : '';
                    if (text && text.charAt(text.length - 1) === '*' && box && !String(box.value || '').trim()) {
                        return text.replace(/\s*\*$/, '');
                    }
                }
                return '';
            }

            function finishAsset(payload, place) {
                closeModal();
                if (payload.parentId) {
                    state.expanded[payload.parentId] = true;
                    rememberExpanded();
                }
                state.expanded[payload.id] = true;
                state.pane = place ? 'list' : 'card';
                reloadTree(function () {
                    selectAsset(payload.id, true);
                    notify(t('saved'));
                    if (state.view === 'dashboard') {
                        loadReport();
                    }
                });
            }

            function postAsset(typeKey, attributes, place, createdType) {
                var custodian = document.getElementById('create-custodian');
                var statusBox = document.getElementById('create-status');
                var chosenParent = parentId || null;
                if (kind === 'object' && !(typeKey && parentId)) {
                    var placeBox = document.getElementById('create-place');
                    chosenParent = placeBox && placeBox.value ? parseInt(placeBox.value, 10) : null;
                }
                ajax('POST', '/assets', {
                    name: document.getElementById('create-name').value,
                    projectKey: state.projectKey,
                    typeKey: typeKey,
                    status: place ? 'in_stock' : (statusBox ? statusBox.value : 'in_use'),
                    description: '',
                    custodianKey: place ? '' : (custodian ? custodian.value : ''),
                    parentId: chosenParent,
                    attributes: attributes
                }, function (status, payload) {
                    if (status < 200 || status >= 300) {
                        if (createdType) {
                            reloadTree(function () {
                                fillTypeControl(typeKey);
                                sync(attributes);
                                showError((payload && payload.message) || t('errorTitle'));
                                busy = false;
                            });
                            return;
                        }
                        busy = false;
                        showError((payload && payload.message) || t('errorTitle'));
                        return;
                    }
                    finishAsset(payload, place);
                });
            }

            function postDraftFields(typeKey, rows, index, attributes, place) {
                if (index >= rows.length) {
                    postAsset(typeKey, attributes, place, true);
                    return;
                }
                ajax('POST', '/types/' + encodeURIComponent(typeKey) + '/fields', {
                    label: rows[index].label,
                    kind: rows[index].kind,
                    required: rows[index].required
                }, function (status, payload) {
                    if (status < 200 || status >= 300) {
                        reloadTree(function () {
                            fillTypeControl(typeKey);
                            sync(attributes);
                            showError((payload && payload.message) || t('typeCreatedFieldsFailed'));
                            busy = false;
                        });
                        return;
                    }
                    attributes.push({ fieldKey: payload.fieldKey, value: rows[index].value || '' });
                    postDraftFields(typeKey, rows, index + 1, attributes, place);
                });
            }

            function saveExtraField() {
                var label = document.getElementById('create-extra-label').value;
                if (!label.trim()) {
                    showError(t('fieldNameRequired'));
                    return;
                }
                var kept = collectAttributes(form);
                var typeKey = typeControl.value;
                ajax('POST', '/types/' + encodeURIComponent(typeKey) + '/fields', {
                    label: label.trim(),
                    kind: document.getElementById('create-extra-kind').value,
                    required: document.getElementById('create-extra-required').checked
                }, function (status, payload) {
                    if (status < 200 || status >= 300) {
                        showError((payload && payload.message) || t('errorTitle'));
                        return;
                    }
                    document.getElementById('create-extra-label').value = '';
                    document.getElementById('create-extra-required').checked = false;
                    fieldForm.hidden = true;
                    showError('');
                    reloadTree(function () {
                        fillTypeControl(typeKey);
                        sync(kept);
                    });
                });
            }

            function createNode() {
                if (busy) return;
                showError('');
                var name = document.getElementById('create-name').value;
                if (!name.trim()) {
                    showError(t('nameRequired'));
                    return;
                }
                var place = placeSelected();
                if (!creatingNew()) {
                    var missing = blankRequired(form);
                    if (missing) {
                        showError(t('fillField', missing));
                        return;
                    }
                    busy = true;
                    postAsset(typeControl.value, collectAttributes(form), place, false);
                    return;
                }
                var typeLabel = document.getElementById('create-type-label').value;
                if (!typeLabel.trim()) {
                    showError(t('typeNameRequired'));
                    return;
                }
                var rows = readDrafts();
                for (var i = 0; i < rows.length; i++) {
                    if (!rows[i].label.trim()) {
                        showError(t('fieldNameRequired'));
                        return;
                    }
                    if (rows[i].required && !String(rows[i].value || '').trim()) {
                        showError(t('fillField', rows[i].label.trim()));
                        return;
                    }
                }
                busy = true;
                ajax('POST', '/types', {
                    label: typeLabel.trim(),
                    color: chosenColor,
                    icon: effectiveIcon(),
                    projectKey: state.projectKey,
                    location: place,
                    showInTree: place || !!treeBox.checked
                }, function (status, payload) {
                    if (status < 200 || status >= 300) {
                        busy = false;
                        showError((payload && payload.message) || t('errorTitle'));
                        return;
                    }
                    postDraftFields(payload.typeKey, rows, 0, [], place);
                });
            }

            locationBox.addEventListener('change', function () { sync(); });
            typeControl.addEventListener('change', function () {
                fieldForm.hidden = true;
                sync();
            });
            var initialType = '__new__';
            if (typeKey) {
                initialType = typeKey;
            } else if (kind === 'object') {
                var objectTypes = state.types.filter(function (type) { return !type.location; });
                initialType = objectTypes.length ? objectTypes[0].typeKey : '';
            } else if (kind === 'place') {
                var placeTypes = state.types.filter(function (type) { return !!type.location; });
                var branchType = null;
                placeTypes.forEach(function (type) {
                    if (!branchType && (type.baseKey === 'branch' || /(^|-)branch$/.test(type.typeKey))) {
                        branchType = type;
                    }
                });
                initialType = branchType ? branchType.typeKey : (placeTypes.length ? placeTypes[0].typeKey : '__new__');
                locationBox.checked = true;
            } else if (state.types.length) {
                initialType = state.types[0].typeKey;
            }
            fillTypeControl(initialType);
            if (typeKey) typeControl.disabled = true;
            sync();
            var actions = el('div', 'asset-tree-dialog-actions is-footer');
            actions.appendChild(button(t('cancel'), 'asset-tree-btn', closeModal));
            actions.appendChild(button(t('create'), 'asset-tree-btn primary', createNode));
            form.appendChild(actions);
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                createNode();
            });
            dialog.appendChild(form);
            setTimeout(function () {
                var name = document.getElementById('create-name');
                if (name) name.focus();
            }, 0);
        });
    }

    function openDelete(asset) {
        var nested = descendantsOf(asset.id).length;
        openModal(function (dialog) {
            dialog.appendChild(el('h2', null, t('deleteTitle')));
            dialog.appendChild(el('p', null, t('deleteText', asset.name)));
            if (nested) {
                dialog.appendChild(el('p', null, t('deleteCascade', nested)));
            }
            var actions = el('div', 'asset-tree-dialog-actions');
            actions.appendChild(button(t('cancel'), 'asset-tree-btn', closeModal));
            actions.appendChild(button(t('delete'), 'asset-tree-btn danger', function () {
                ajax('DELETE', '/assets/' + asset.id + '?cascade=' + (nested ? 'true' : 'false'), null, function (status, payload) {
                    if (status >= 200 && status < 300) {
                        closeModal();
                        var next = asset.parentId || null;
                        state.selectedId = next;
                        state.dirty = false;
                        reloadTree(function () {
                            if (next && byId()[next]) {
                                selectAsset(next, true);
                            } else {
                                renderFrame();
                            }
                            if (state.view === 'dashboard') {
                                loadReport();
                            }
                        });
                    } else {
                        dialog.appendChild(el('div', 'asset-tree-form-error', (payload && payload.message) || t('errorTitle')));
                    }
                });
            }));
            dialog.appendChild(actions);
        });
    }

    function openFieldModal(type, done) {
        openModal(function (dialog) {
            dialog.appendChild(el('h2', null, t('addFieldTitle')));
            dialog.appendChild(el('p', 'asset-tree-hint', type.label));
            var form = el('form');
            form.appendChild(field(t('fieldLabel'), input('field-label', '', false), true));
            form.appendChild(field(t('fieldKind'), kindSelect('field-kind', 'text'), true));
            var requiredLabel = el('label', 'asset-tree-check');
            var required = el('input');
            required.type = 'checkbox';
            required.id = 'field-required';
            requiredLabel.appendChild(required);
            requiredLabel.appendChild(el('span', null, t('fieldRequired')));
            form.appendChild(requiredLabel);
            var error = el('div', 'asset-tree-form-error');
            error.hidden = true;
            form.appendChild(error);
            function saveField() {
                var label = document.getElementById('field-label').value;
                if (!label.trim()) {
                    error.hidden = false;
                    error.textContent = t('fieldNameRequired');
                    return;
                }
                ajax('POST', '/types/' + encodeURIComponent(type.typeKey) + '/fields', {
                    label: label.trim(),
                    kind: document.getElementById('field-kind').value,
                    required: document.getElementById('field-required').checked
                }, function (status, payload) {
                    if (status >= 200 && status < 300) {
                        if (done) {
                            closeModal();
                            done(payload);
                        } else {
                            state.fieldQuery = '';
                            refreshSchema();
                        }
                    } else {
                        error.hidden = false;
                        error.textContent = (payload && payload.message) || t('errorTitle');
                    }
                });
            }
            var actions = el('div', 'asset-tree-dialog-actions');
            actions.appendChild(button(t('cancel'), 'asset-tree-btn', closeModal));
            actions.appendChild(button(t('addField'), 'asset-tree-btn primary', saveField));
            form.appendChild(actions);
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                saveField();
            });
            dialog.appendChild(form);
        });
    }

    function refreshSchema() {
        reloadTree(function () {
            if (state.view === 'settings') {
                closeAllModals();
                renderFrame();
                return;
            }
            // The tree and the open card list types too, so repaint them behind the dialog.
            if (state.dirty) {
                renderNodes();
            } else {
                renderFrame();
            }
            openTypes();
        });
    }

    function openTypes() {
        closeAllModals();
        state.schemaAdding = !state.types.length;
        openModal(function (dialog) {
            dialog.classList.add('is-wide');
            dialog.classList.add('is-schema');
            dialog.appendChild(el('h2', null, t('constructorTitle')));
            var host = el('div');
            host.id = 'asset-tree-type-host';
            dialog.appendChild(host);
            paintTypeBrowser(host, true);
        });
    }

    function repaintSchema() {
        if (state.view === 'settings') {
            renderFrame();
            return;
        }
        var host = document.getElementById('asset-tree-type-host');
        if (host) paintTypeBrowser(host, true);
    }

    function applyListFilter(needle, rows, emptyNode) {
        var query = String(needle || '').trim().toLowerCase();
        var shown = 0;
        rows.forEach(function (row) {
            var name = String(row.getAttribute('data-name') || '').toLowerCase();
            var ok = !query || name.indexOf(query) !== -1;
            if (ok) row.style.removeProperty('display');
            else row.style.setProperty('display', 'none', 'important');
            if (ok) shown += 1;
        });
        if (emptyNode) emptyNode.hidden = !query || shown > 0;
    }

    function schemaSearchInput(value, onInput) {
        var box = el('input', 'asset-tree-schema-search');
        box.type = 'search';
        box.placeholder = t('schemaSearch');
        box.value = value || '';
        box.addEventListener('input', onInput);
        return box;
    }

    function typeByKey(key) {
        for (var i = 0; i < state.types.length; i++) {
            if (state.types[i].typeKey === key) return state.types[i];
        }
        return null;
    }

    function sortedTypes() {
        return state.types.slice().sort(function (left, right) {
            return String(left.label || '').localeCompare(String(right.label || ''), 'ru');
        });
    }

    function appendConstructor(container, modal) {
        paintTypeBrowser(container, modal);
    }

    function paintTypeBrowser(container, modal) {
        container.innerHTML = '';
        if (!state.types.length && state.canConfigure) state.schemaAdding = true;
        var selectedType = null;
        if (!(state.schemaAdding && state.canConfigure)) {
            selectedType = typeByKey(state.schemaTypeKey);
            if (!selectedType && state.types.length) {
                selectedType = sortedTypes()[0];
                state.schemaTypeKey = selectedType.typeKey;
            }
        }
        if (modal) container.appendChild(el('p', 'asset-tree-hint', t('typesHelp')));
        var layout = el('div', 'asset-tree-schema');
        var side = el('div', 'asset-tree-schema-side');
        var tools = el('div', 'asset-tree-schema-tools');
        var rows = [];
        var list = el('div', 'asset-tree-schema-scroll');
        var empty = el('p', 'asset-tree-schema-empty', t('schemaNoMatch'));
        empty.hidden = true;
        var search = schemaSearchInput(state.typeQuery, function () {
            state.typeQuery = search.value;
            applyListFilter(search.value, rows, empty);
        });
        tools.appendChild(search);
        if (state.canConfigure) {
            tools.appendChild(button(t('addType'), 'asset-tree-btn', function () {
                state.schemaAdding = true;
                state.schemaTypeKey = '';
                repaintSchema();
            }));
        }
        side.appendChild(tools);
        sortedTypes().forEach(function (type) {
            var selected = !!(selectedType && type.typeKey === selectedType.typeKey);
            var pick = button('', 'asset-tree-type-pick' + (selected ? ' is-selected' : ''), function () {
                state.schemaAdding = false;
                state.schemaTypeKey = type.typeKey;
                state.fieldQuery = '';
                repaintSchema();
            });
            pick.setAttribute('data-name', type.label || '');
            pick.appendChild(typeTile(type, 'sm'));
            pick.appendChild(el('span', 'asset-tree-type-name', type.label || ''));
            var count = el('span', 'asset-tree-key', String((type.fields || []).length));
            count.title = t('schemaFieldCount', (type.fields || []).length);
            pick.appendChild(count);
            list.appendChild(pick);
            rows.push(pick);
        });
        list.appendChild(empty);
        applyListFilter(state.typeQuery, rows, empty);
        side.appendChild(list);
        var main = el('div', 'asset-tree-schema-main');
        if (state.schemaAdding && state.canConfigure) {
            main.appendChild(typeCreateForm());
        } else if (selectedType) {
            main.appendChild(typeDetail(selectedType));
        } else {
            main.appendChild(el('p', 'asset-tree-hint', t('schemaPickType')));
        }
        layout.appendChild(side);
        layout.appendChild(main);
        container.appendChild(layout);
    }

    function typeDetail(type) {
        var wrap = el('div', 'asset-tree-type-detail');
        var head = el('div', 'asset-tree-type-head');
        var title = el('div', 'asset-tree-type-title');
        title.appendChild(typeTile(type, 'lg'));
        title.appendChild(el('h3', null, type.label || ''));
        head.appendChild(title);
        var meta = type.systemType ? t('systemType') : t('schemaFieldCount', (type.fields || []).length);
        if (!type.systemType && type.assetCount) meta += ' · ' + type.assetCount;
        head.appendChild(el('span', 'asset-tree-key', meta));
        if (!type.systemType && !type.assetCount && state.canConfigure) {
            head.appendChild(button(t('deleteType'), 'asset-tree-btn', function () {
                if (!window.confirm(t('deleteTypeConfirm', type.label))) return;
                ajax('DELETE', '/types/' + encodeURIComponent(type.typeKey), null, function (status, payload) {
                    if (status >= 200 && status < 300) {
                        state.schemaTypeKey = '';
                        refreshSchema();
                    } else notify((payload && payload.message) || t('errorTitle'));
                });
            }));
        }
        wrap.appendChild(head);
        if (state.canConfigure) {
            var look = el('div', 'asset-tree-appearance');
            var saveLook = function (patch) {
                ajax('PUT', '/types/' + encodeURIComponent(type.typeKey), patch, function (status, payload) {
                    if (status >= 200 && status < 300) refreshSchema();
                    else notify((payload && payload.message) || t('errorTitle'));
                });
            };
            var icons = iconPicker(iconKeyOf(type), type.color, function (key) {
                saveLook({ icon: key });
            });
            var colors = colorSwatches(type.color, function (color) {
                icons.paint(color);
                saveLook({ color: color });
            });
            look.appendChild(field(t('color'), colors, true));
            look.appendChild(field(t('icon'), icons, true));
            look.appendChild(el('p', 'asset-tree-hint', t('iconHint')));
            wrap.appendChild(look);
        }
        if (!type.location) {
            var treeToggle = el('label', 'asset-tree-check');
            treeToggle.title = t('showInTreeHint');
            var treeBox = el('input');
            treeBox.type = 'checkbox';
            treeBox.checked = !!type.showInTree;
            treeBox.disabled = !state.canConfigure;
            if (!state.canConfigure) treeBox.setAttribute('data-disabled', '1');
            treeBox.addEventListener('change', function () {
                ajax('PUT', '/types/' + encodeURIComponent(type.typeKey), { showInTree: treeBox.checked }, function (status, payload) {
                    if (status >= 200 && status < 300) refreshSchema();
                    else {
                        treeBox.checked = !treeBox.checked;
                        notify((payload && payload.message) || t('errorTitle'));
                    }
                });
            });
            treeToggle.appendChild(treeBox);
            treeToggle.appendChild(el('span', null, t('showInTree')));
            wrap.appendChild(treeToggle);
        }
        var fieldTools = el('div', 'asset-tree-schema-tools');
        var fieldRows = [];
        var fieldEmpty = el('p', 'asset-tree-schema-empty', t('schemaNoMatch'));
        fieldEmpty.hidden = true;
        var fieldSearch = schemaSearchInput(state.fieldQuery, function () {
            state.fieldQuery = fieldSearch.value;
            applyListFilter(fieldSearch.value, fieldRows, fieldEmpty);
        });
        fieldSearch.placeholder = t('fieldSearch');
        fieldTools.appendChild(fieldSearch);
        if (state.canConfigure) {
            fieldTools.appendChild(button(t('addField'), 'asset-tree-btn', function () {
                openFieldModal(type);
            }));
        }
        wrap.appendChild(fieldTools);
        var fields = el('div', 'asset-tree-schema-scroll asset-tree-field-list');
        (type.fields || []).forEach(function (fieldDef) {
            var fieldRow = el('div', 'asset-tree-type-field');
            fieldRow.setAttribute('data-name', fieldDef.label || '');
            fieldRow.appendChild(el('span', null, fieldDef.label));
            fieldRow.appendChild(el('span', 'asset-tree-key', kindLabel(fieldDef.kind) + (fieldDef.required ? ' · ' + t('requiredMark') : '')));
            if (state.canConfigure) {
                fieldRow.appendChild(button(t('deleteField'), 'asset-tree-btn', function () {
                    ajax('DELETE', '/types/' + encodeURIComponent(type.typeKey) + '/fields/' + encodeURIComponent(fieldDef.fieldKey), null, function (status, payload) {
                        if (status >= 200 && status < 300) refreshSchema();
                        else notify((payload && payload.message) || t('errorTitle'));
                    });
                }));
            }
            fields.appendChild(fieldRow);
            fieldRows.push(fieldRow);
        });
        if (!(type.fields || []).length) {
            fields.appendChild(el('p', 'asset-tree-hint', t('noFieldsYet')));
        }
        fields.appendChild(fieldEmpty);
        applyListFilter(state.fieldQuery, fieldRows, fieldEmpty);
        wrap.appendChild(fields);
        return wrap;
    }

    function typeCreateForm() {
        var form = el('form', 'asset-tree-type-create');
        form.appendChild(field(t('typeLabel'), input('type-label', '', false), true));
        var locationToggle = el('label', 'asset-tree-check');
        var locationInput = el('input');
        locationInput.type = 'checkbox';
        locationInput.id = 'type-location';
        locationToggle.appendChild(locationInput);
        locationToggle.appendChild(el('span', null, t('locationType')));
        form.appendChild(locationToggle);
        var treeToggle = el('label', 'asset-tree-check');
        var treeInput = el('input');
        treeInput.type = 'checkbox';
        treeInput.id = 'type-show-tree';
        treeToggle.appendChild(treeInput);
        treeToggle.appendChild(el('span', null, t('showInTree')));
        treeToggle.title = t('showInTreeHint');
        form.appendChild(treeToggle);
        locationInput.addEventListener('change', function () {
            treeInput.disabled = locationInput.checked;
            if (locationInput.checked) treeInput.checked = false;
        });
        var chosen = PALETTE[0];
        var chosenIcon = '';
        function effectiveIcon() {
            return chosenIcon || (locationInput.checked ? DEFAULT_PLACE_ICON : DEFAULT_OBJECT_ICON);
        }
        var icons = iconPicker(effectiveIcon(), chosen, function (key) {
            chosenIcon = key;
        });
        var colors = colorSwatches(chosen, function (color) {
            chosen = color;
            icons.paint(color);
        });
        locationInput.addEventListener('change', function () {
            if (!chosenIcon) icons.set(effectiveIcon());
        });
        var look = el('div', 'asset-tree-appearance');
        look.appendChild(field(t('color'), colors, true));
        look.appendChild(field(t('icon'), icons, true));
        look.appendChild(el('p', 'asset-tree-hint', t('iconHint')));
        form.appendChild(look);
        var error = el('div', 'asset-tree-form-error');
        error.hidden = true;
        form.appendChild(error);
        form.appendChild(button(t('addType'), 'asset-tree-btn primary', function () {
            var label = document.getElementById('type-label').value;
            if (!label.trim()) {
                error.hidden = false;
                error.textContent = t('typeNameRequired');
                return;
            }
            var place = locationInput.checked;
            ajax('POST', '/types', {
                label: label.trim(),
                color: chosen,
                icon: effectiveIcon(),
                projectKey: state.projectKey,
                location: place,
                showInTree: place || treeInput.checked
            }, function (status, payload) {
                if (status >= 200 && status < 300) {
                    state.schemaAdding = false;
                    state.schemaTypeKey = (payload && payload.typeKey) || '';
                    state.typeQuery = '';
                    refreshSchema();
                } else {
                    error.hidden = false;
                    error.textContent = (payload && payload.message) || t('errorTitle');
                }
            });
        }));
        form.addEventListener('submit', function (event) {
            event.preventDefault();
        });
        return form;
    }


    function openModal(builder) {
        var backdrop = el('div', 'asset-tree-backdrop');
        var dialog = el('div', 'asset-tree-dialog');
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        builder(dialog);
        backdrop.appendChild(dialog);
        backdrop.addEventListener('click', function (event) {
            if (event.target === backdrop) closeModal();
        });
        document.body.appendChild(backdrop);
        var first = dialog.querySelector('input, select, button');
        if (first) first.focus();
    }

    function closeModal() {
        var nodes = document.querySelectorAll('.asset-tree-backdrop');
        if (nodes.length) {
            nodes[nodes.length - 1].parentNode.removeChild(nodes[nodes.length - 1]);
        }
    }

    function closeAllModals() {
        var nodes = document.querySelectorAll('.asset-tree-backdrop');
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].parentNode.removeChild(nodes[i]);
        }
    }

    function reloadTree(done) {
        ajax('GET', '/assets?projectKey=' + encodeURIComponent(state.projectKey), null, function (status, payload) {
            if (status !== 200) {
                state.treeReady = false;
                state.loading = false;
                state.error = (payload && payload.message) || t('errorTitle');
                renderFrame();
                return;
            }
            state.treeReady = true;
            state.assets = payload.assets || [];
            state.types = payload.types || [];
            state.statuses = payload.statuses || [];
            invalidate();
            ensureExpandedDefaults();
            if (done) {
                done();
            } else {
                renderFrame();
            }
        });
    }

    function hashId() {
        var raw = String(window.location.hash || '').replace(/^#/, '');
        return /^\d+$/.test(raw) ? parseInt(raw, 10) : null;
    }

    function hashGroup() {
        var raw = String(window.location.hash || '').replace(/^#/, '');
        var match = /^t:(\d+):(.+)$/.exec(raw);
        if (!match) return null;
        return { placeId: parseInt(match[1], 10), typeKey: decodeURIComponent(match[2]) };
    }

    function kindLabel(kind) {
        if (kind === 'number') return t('kindNumber');
        if (kind === 'user') return t('kindUser');
        if (kind === 'textarea') return t('kindTextarea');
        return t('kindText');
    }

    function chooseProject() {
        var stored = '';
        try { stored = sessionStorage.getItem('asset-tree-project') || ''; } catch (error) { stored = ''; }
        var wanted = state.initialProject || stored;
        var match = null;
        state.projects.forEach(function (project) {
            if (project.key === wanted) match = project;
        });
        if (!match && state.projects.length) match = state.projects[0];
        state.projectKey = match ? match.key : '';
        applyRights(match);
        state.grants = null;
        state.statuses = [];
        state.schemaTypeKey = '';
        state.schemaAdding = false;
        state.statusQuery = '';
        state.typeQuery = '';
        state.fieldQuery = '';
        state.grantQuery = '';
        loadSavedFilters();
    }

    function switchProject(key, selectedId) {
        state.projectKey = key;
        state.selectedId = selectedId || null;
        state.query = '';
        state.rules = [];
        state.activeFilterId = '';
        state.searchHits = null;
        state.searching = false;
        loadSavedFilters();
        state.dirty = false;
        state.report = null;
        state.treeReady = false;
        state.holderUser = null;
        state.holderAssets = [];
        var project = currentProject();
        applyRights(project);
        state.grants = null;
        state.statuses = [];
        state.schemaTypeKey = '';
        state.schemaAdding = false;
        state.statusQuery = '';
        state.typeQuery = '';
        state.fieldQuery = '';
        state.grantQuery = '';
        try { sessionStorage.setItem('asset-tree-project', key); } catch (error) { /* ignore */ }
        state.pane = 'list';
        state.loading = true;
        mount();
        reloadTree(function () {
            state.loading = false;
            renderFrame();
            if (state.view === 'dashboard') {
                loadReport();
            }
            if (state.view === 'all' && state.selectedId) {
                selectAsset(state.selectedId, true);
            }
        });
    }

    function fieldsOf(typeKey) {
        for (var i = 0; i < state.types.length; i++) {
            if (state.types[i].typeKey === typeKey) return state.types[i].fields || [];
        }
        return [];
    }

    function paintAssetFields(container, typeKey, values) {
        renderSchema(container, typeKey, values);
        if (!fieldsOf(typeKey).length) {
            container.appendChild(el('p', 'asset-tree-hint', t('noFieldsYet')));
        }
    }

    function renderSchema(container, typeKey, values) {
        container.innerHTML = '';
        var byKey = {};
        (values || []).forEach(function (item) {
            byKey[item.fieldKey || item.name] = item.value || '';
        });
        fieldsOf(typeKey).forEach(function (fieldDef) {
            var control;
            var current = byKey[fieldDef.fieldKey] || '';
            if (fieldDef.kind === 'textarea') {
                control = area('', current, !state.canEdit);
                control.classList.add('asset-tree-field-value');
            } else if (fieldDef.kind === 'user') {
                control = userBox(current, !state.canEdit);
            } else {
                control = input('', current, !state.canEdit);
                if (fieldDef.kind === 'number') control.inputMode = 'decimal';
                control.classList.add('asset-tree-field-value');
            }
            var wrap = field(fieldDef.label + (fieldDef.required ? ' *' : ''), control, true);
            wrap.setAttribute('data-field-key', fieldDef.fieldKey);
            container.appendChild(wrap);
        });
    }

    function userBox(userKey, disabled) {
        var box = el('div', 'asset-tree-userbox');
        var hidden = el('input');
        hidden.type = 'hidden';
        hidden.className = 'asset-tree-field-value';
        hidden.value = userKey || '';
        var text = el('input');
        text.type = 'search';
        text.placeholder = t('custodianSearch');
        text.disabled = !!disabled;
        text.value = userKey || '';
        var list = el('div', 'asset-tree-user-results');
        var timer = null;
        text.addEventListener('input', function () {
            hidden.value = '';
            clearTimeout(timer);
            var query = text.value.trim();
            timer = setTimeout(function () {
                if (query.length < 2) {
                    list.innerHTML = '';
                    return;
                }
                ajax('GET', '/users?q=' + encodeURIComponent(query), null, function (status, payload) {
                    list.innerHTML = '';
                    if (status !== 200) return;
                    (payload || []).forEach(function (user) {
                        var hit = button(user.displayName + (user.email ? ' · ' + user.email : ''), 'asset-tree-user-hit', function () {
                            hidden.value = user.userKey;
                            text.value = user.displayName;
                            list.innerHTML = '';
                            var card = box.querySelector('.asset-tree-profile');
                            if (card) card.parentNode.removeChild(card);
                            box.appendChild(profileCard(user));
                        });
                        list.appendChild(hit);
                    });
                });
            }, 220);
        });
        box.appendChild(hidden);
        box.appendChild(text);
        box.appendChild(list);
        return box;
    }

    function custodianField(id, profile) {
        var box = userBox(profile ? profile.userKey : '', !state.canEdit);
        box.querySelector('.asset-tree-field-value').id = id;
        var text = box.querySelector('input[type="search"]');
        if (profile && text) text.value = profile.displayName || '';
        var wrap = field(t('custodian'), box, true);
        if (profile) wrap.appendChild(profileCard(profile));
        return wrap;
    }

    function profileCard(user) {
        var card = el('div', 'asset-tree-profile');
        card.appendChild(el('strong', null, user.displayName || t('custodianNone')));
        var lines = [
            [t('userEmail'), user.email],
            [t('userPhone'), user.phone],
            [t('userDepartment'), user.department],
            [t('userTitle'), user.title],
            [t('userDirectory'), user.directory]
        ];
        lines.forEach(function (line) {
            if (!line[1]) return;
            card.appendChild(el('span', null, line[0] + ': ' + line[1]));
        });
        return card;
    }

    function renderHolders() {
        var panel = el('section', 'asset-tree-report');
        panel.appendChild(el('h2', null, t('holderTitle')));
        panel.appendChild(el('p', 'asset-tree-hint', t('holderHint')));
        var search = el('input');
        search.type = 'search';
        search.placeholder = t('custodianSearch');
        search.value = state.holderQuery || '';
        var results = el('div', 'asset-tree-user-results');
        var timer = null;
        search.addEventListener('input', function () {
            state.holderQuery = search.value;
            clearTimeout(timer);
            timer = setTimeout(function () {
                var query = search.value.trim();
                results.innerHTML = '';
                if (query.length < 2) return;
                ajax('GET', '/users?q=' + encodeURIComponent(query), null, function (status, payload) {
                    results.innerHTML = '';
                    if (status !== 200) return;
                    (payload || []).forEach(function (user) {
                        results.appendChild(button(user.displayName + (user.department ? ' · ' + user.department : ''), 'asset-tree-user-hit', function () {
                            state.holderUser = user;
                            ajax('GET', '/users/' + encodeURIComponent(user.userKey) + '/assets', null, function (assetStatus, assets) {
                                state.holderAssets = assetStatus === 200 ? assets : [];
                                renderFrame();
                            });
                        }));
                    });
                });
            }, 220);
        });
        panel.appendChild(search);
        panel.appendChild(results);
        if (state.holderUser) panel.appendChild(profileCard(state.holderUser));
        if (state.holderUser && !(state.holderAssets || []).length) {
            panel.appendChild(el('p', 'asset-tree-hint', t('holderEmpty')));
        }
        (state.holderAssets || []).forEach(function (asset) {
            var row = el('button', 'asset-tree-holder-row', '');
            row.type = 'button';
            row.appendChild(el('strong', null, asset.name));
            row.appendChild(el('span', 'asset-tree-key', asset.objectKey));
            row.appendChild(el('span', null, (asset.projectName || asset.projectKey || '') ));
            row.appendChild(el('span', 'asset-tree-lozenge ' + statusClass(asset.status), statusLabel(asset.status)));
            row.appendChild(el('span', null, asset.location || t('root')));
            if (asset.holderRole) row.appendChild(el('span', 'asset-tree-key', asset.holderRole));
            row.addEventListener('click', function () {
                goToAsset(asset.projectKey, asset.id);
            });
            panel.appendChild(row);
        });
        return panel;
    }

    function loadReport() {
        if (!state.projectKey) {
            return;
        }
        ajax('GET', '/projects/' + encodeURIComponent(state.projectKey) + '/report', null, function (status, payload) {
            state.report = status === 200 ? payload : null;
            var dash = document.getElementById('asset-tree-dashboard');
            if (dash) {
                fillDashboard(dash);
            }
        });
    }

    function bucketCount(rows, key) {
        var found = 0;
        (rows || []).forEach(function (item) {
            if (item.key === key) found = item.count;
        });
        return found;
    }

    function focusMatches(rule) {
        state.rules = [rule];
        state.activeFilterId = '';
        state.query = '';
        state.searchHits = null;
        state.searching = false;
        state.selectedId = null;
        state.pane = 'list';
        state.dirty = false;
        if (state.view !== 'all') {
            state.view = 'all';
            rememberView('all');
            mount();
            return;
        }
        var search = document.getElementById('asset-tree-search');
        if (search) search.value = '';
        refreshBrowse();
    }

    function showAllAssets() {
        state.rules = [];
        state.activeFilterId = '';
        state.query = '';
        state.searchHits = null;
        state.searching = false;
        state.selectedId = null;
        state.pane = 'list';
        state.dirty = false;
        if (state.view !== 'all') {
            state.view = 'all';
            rememberView('all');
            mount();
            return;
        }
        var search = document.getElementById('asset-tree-search');
        if (search) search.value = '';
        refreshBrowse();
    }

    function renderDashboardPage() {
        var section = el('section', 'asset-tree-report');
        var dash = el('div', 'asset-tree-dashboard');
        dash.id = 'asset-tree-dashboard';
        section.appendChild(dash);
        if (state.report) {
            fillDashboard(dash);
        } else {
            dash.appendChild(el('p', 'asset-tree-hint', t('loading')));
        }
        return section;
    }

    function dashStat(label, value, onClick, tone) {
        var className = 'asset-tree-stat' + (onClick ? ' is-action' : '') + (tone ? ' is-' + tone : '');
        var card = onClick ? button('', className, onClick) : el('div', className);
        card.appendChild(el('span', null, label));
        card.appendChild(el('strong', null, String(value)));
        return card;
    }

    function fillDashboard(node) {
        node.innerHTML = '';
        var report = state.report;
        if (!report) {
            node.appendChild(el('p', 'asset-tree-hint', t('loading')));
            return;
        }
        var places = report.total - report.equipment;
        var totals = el('div', 'asset-tree-dash-stats');
        totals.appendChild(dashStat(t('reportEquipment'), report.equipment, function () {
            showAllAssets();
        }));
        totals.appendChild(dashStat(t('reportPlaces'), places < 0 ? 0 : places));
        totals.appendChild(dashStat(t('statusRepair'), bucketCount(report.byStatus, 'repair'), function () {
            focusMatches({ field: 'status', op: 'eq', value: 'repair' });
        }, 'warn'));
        totals.appendChild(dashStat(t('statusMaintenance'), bucketCount(report.byStatus, 'maintenance'), function () {
            focusMatches({ field: 'status', op: 'eq', value: 'maintenance' });
        }, 'warn'));
        totals.appendChild(dashStat(t('reportUnassigned'), report.unassigned || 0, function () {
            focusMatches({ field: 'custodian', op: 'empty', value: '' });
        }, report.unassigned ? 'warn' : ''));
        totals.appendChild(dashStat(t('statusWrittenOff'), bucketCount(report.byStatus, 'written_off'), function () {
            focusMatches({ field: 'status', op: 'eq', value: 'written_off' });
        }, 'off'));

        var row = el('div', 'asset-tree-dash');
        var statusData = (report.byStatus || []).filter(function (item) {
            return item.count > 0;
        }).map(function (item) {
            return { key: item.key, label: item.label, count: item.count, color: item.color || statusColor(item.key) };
        });
        row.appendChild(dashCard(t('reportByStatus'), statusData.length ? statusChart(statusData) : el('p', 'asset-tree-hint', t('chartEmpty'))));

        var typeRows = (report.byType || []).filter(function (item) { return item.count > 0; });
        typeRows.sort(function (left, right) { return right.count - left.count; });
        row.appendChild(dashCard(t('reportByType'), typeRows.length ? typeList(typeRows) : el('p', 'asset-tree-hint', t('chartEmpty'))));

        var side = el('div', 'asset-tree-dash-stack');
        var placeRows = (report.places || []).filter(function (place) { return place.equipment > 0; });
        placeRows.sort(function (left, right) { return right.equipment - left.equipment; });
        placeRows = placeRows.slice(0, 5);
        side.appendChild(dashCard(t('reportByPlace'), placeRows.length ? placeList(placeRows) : el('p', 'asset-tree-hint', t('chartEmpty'))));
        var holderRows = (report.holders || []).slice();
        holderRows.sort(function (left, right) { return right.count - left.count; });
        holderRows = holderRows.slice(0, 5);
        side.appendChild(dashCard(t('reportHolders'), holderRows.length ? holderList(holderRows) : el('p', 'asset-tree-hint', t('chartEmpty'))));
        row.appendChild(side);
        node.appendChild(el('p', 'asset-tree-hint asset-tree-dash-note', t('dashHint')));
        node.appendChild(totals);
        node.appendChild(row);
    }

    function dashCard(title, body) {
        var card = el('div', 'asset-tree-chart-card');
        card.appendChild(el('div', 'asset-tree-section-title', title));
        card.appendChild(body);
        return card;
    }

    function statusChart(data) {
        var body = el('div', 'asset-tree-chart-body');
        body.appendChild(donutChart(data));
        var legend = el('div', 'asset-tree-legend');
        data.forEach(function (item) {
            var line = button(item.label + ' ' + item.count, 'asset-tree-legend-btn', function () {
                focusMatches({ field: 'status', op: 'eq', value: item.key });
            });
            var dot = el('i');
            dot.style.background = item.color;
            line.insertBefore(dot, line.firstChild);
            legend.appendChild(line);
        });
        body.appendChild(legend);
        return body;
    }

    function typeList(rows) {
        var list = el('div', 'asset-tree-dash-list');
        var max = 1;
        rows.forEach(function (row) { if (row.count > max) max = row.count; });
        rows.forEach(function (row) {
            var line = button(row.label, 'asset-tree-dash-link', function () {
                focusMatches({ field: 'type', op: 'eq', value: row.key });
            });
            line.insertBefore(typeTile({ color: row.color, icon: row.icon, label: row.label }, 'sm'), line.firstChild);
            var track = el('span', 'asset-tree-bar');
            var fill = el('span');
            fill.style.width = Math.round(100 * row.count / max) + '%';
            if (row.color) fill.style.background = row.color;
            track.appendChild(fill);
            line.appendChild(track);
            line.appendChild(el('strong', null, String(row.count)));
            list.appendChild(line);
        });
        return list;
    }

    function placeList(rows) {
        var list = el('div', 'asset-tree-dash-list');
        rows.forEach(function (place) {
            var line = button(place.name, 'asset-tree-dash-link', function () {
                state.rules = [];
                state.activeFilterId = '';
                state.query = '';
                state.searchHits = null;
                state.pane = 'list';
                openAll(place.id);
            });
            line.appendChild(el('span', 'asset-tree-key', place.typeLabel || ''));
            line.appendChild(el('strong', null, String(place.equipment)));
            list.appendChild(line);
        });
        return list;
    }

    function holderList(rows) {
        var list = el('div', 'asset-tree-dash-list');
        rows.forEach(function (holder) {
            var name = holder.user && holder.user.displayName ? holder.user.displayName : '';
            var line = button(name, 'asset-tree-dash-link', function () {
                focusMatches({ field: 'custodian', op: 'eq', value: name });
            });
            line.appendChild(el('strong', null, String(holder.count)));
            list.appendChild(line);
        });
        return list;
    }

    function loadMine() {
        if (!state.userKey) {
            state.mineAssets = [];
            state.loading = false;
            state.error = null;
            if (!document.getElementById('asset-tree-frame')) {
                mount();
            }
            renderFrame();
            return;
        }
        ajax('GET', '/users/' + encodeURIComponent(state.userKey) + '/assets', null, function (status, payload) {
            state.loading = false;
            if (status === 200) {
                state.mineAssets = payload || [];
                state.error = null;
            } else {
                state.mineAssets = [];
                state.error = (payload && payload.message) || t('errorTitle');
            }
            if (!document.getElementById('asset-tree-frame')) {
                mount();
            }
            renderFrame();
        });
    }

    function renderMine() {
        var panel = el('section', 'asset-tree-report');
        var title = state.displayName ? t('menuMine') + ' · ' + state.displayName : t('menuMine');
        panel.appendChild(el('h2', null, title));
        panel.appendChild(el('p', 'asset-tree-hint', t('mineHint')));
        if (state.mineAssets === null) {
            panel.appendChild(el('p', 'asset-tree-hint', t('loading')));
            return panel;
        }
        if (!state.mineAssets.length) {
            panel.appendChild(el('p', 'asset-tree-hint', t('mineEmpty')));
            return panel;
        }
        panel.appendChild(assetTable(state.mineAssets.map(function (asset) {
            return [
                openName(asset.name, function () { goToAsset(asset.projectKey, asset.id); }),
                asset.objectKey || '',
                asset.projectName || asset.projectKey || '',
                lozenge(asset.status),
                asset.location || t('root')
            ];
        }), [t('name'), t('keyLabel'), t('project'), t('status'), t('parent')]));
        return panel;
    }

    function filterBar() {
        var bar = el('div', 'asset-tree-filterbar');
        bar.appendChild(el('span', 'asset-tree-filter-label', t('sortBy')));
        var fields = filterFields();
        var sortOptions = [{ value: 'tree', label: t('sortManual') }].concat(fields.map(function (field) {
            return { value: field.key, label: field.label };
        }));
        var sort = selectBox('asset-tree-sort', sortOptions, state.sortKey || 'tree', false);
        sort.setAttribute('aria-label', t('sortBy'));
        sort.addEventListener('change', function () {
            state.sortKey = sort.value;
            replaceDetail();
        });
        bar.appendChild(sort);
        if (state.sortKey && state.sortKey !== 'tree') {
            bar.appendChild(button(state.sortDir === 'desc' ? t('sortDesc') : t('sortAsc'), 'asset-tree-btn', function () {
                state.sortDir = state.sortDir === 'desc' ? 'asc' : 'desc';
                replaceDetail();
            }));
        }
        var saved = [{ value: '', label: t('filterNone') }].concat((state.savedFilters || []).map(function (filter) {
            return { value: filter.id, label: filter.name };
        }));
        var picker = selectBox('asset-tree-saved-filter', saved, state.activeFilterId || '', false);
        picker.setAttribute('aria-label', t('filters'));
        picker.addEventListener('change', function () {
            state.activeFilterId = picker.value;
            var chosen = null;
            (state.savedFilters || []).forEach(function (filter) {
                if (filter.id === picker.value) chosen = filter;
            });
            state.rules = chosen ? chosen.rules.map(function (rule) {
                return { field: rule.field, op: rule.op, value: rule.value || '' };
            }) : [];
            refreshBrowse();
        });
        bar.appendChild(picker);
        bar.appendChild(button(t('filters'), 'asset-tree-btn', openFilterModal));
        if ((state.rules && state.rules.length) || state.activeFilterId) {
            bar.appendChild(button(t('clearFilters'), 'asset-tree-btn', function () {
                state.rules = [];
                state.activeFilterId = '';
                refreshBrowse();
            }));
        }
        if (state.rules && state.rules.length) {
            var chips = el('div', 'asset-tree-chips');
            state.rules.forEach(function (rule, index) {
                var chip = el('span', 'asset-tree-chip');
                var spec = fieldSpec(rule.field);
                var shown = rule.field === 'type'
                    ? (typeOf(rule.value).label || rule.value)
                    : (rule.field === 'status' ? statusLabel(rule.value) : (rule.value || ''));
                var text = spec.label + ' ' + opLabel(rule.op);
                if (rule.op !== 'empty' && rule.op !== 'notEmpty') text += ' ' + shown;
                chip.appendChild(document.createTextNode(text));
                chip.appendChild(button('×', 'asset-tree-btn asset-tree-chip-x', function () {
                    state.rules.splice(index, 1);
                    state.activeFilterId = '';
                    refreshBrowse();
                }));
                chips.appendChild(chip);
            });
            bar.appendChild(chips);
        }
        return bar;
    }

    function openFilterModal() {
        var draft = {
            id: state.activeFilterId || '',
            name: '',
            rules: (state.rules || []).map(function (rule) {
                return { field: rule.field, op: rule.op, value: rule.value || '' };
            })
        };
        (state.savedFilters || []).forEach(function (filter) {
            if (filter.id === draft.id) draft.name = filter.name;
        });
        if (!draft.rules.length) draft.rules.push({ field: 'name', op: 'contains', value: '' });
        openModal(function (dialog) {
            dialog.classList.add('is-wide');
            dialog.appendChild(el('h2', null, t('filters')));
            dialog.appendChild(el('p', 'asset-tree-hint', t('filterHint')));
            var form = el('form');
            form.appendChild(field(t('filterName'), input('filter-name', draft.name, false), true));
            var list = el('div');
            list.id = 'filter-rules';
            form.appendChild(list);
            var error = el('div', 'asset-tree-form-error');
            error.hidden = true;
            function showError(message) {
                error.hidden = !message;
                error.textContent = message || '';
            }
            function readRules() {
                var rows = list.querySelectorAll('[data-rule]');
                var rules = [];
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    var fieldBox = row.querySelector('.asset-tree-rule-field');
                    var opBox = row.querySelector('.asset-tree-rule-op');
                    var valueBox = row.querySelector('.asset-tree-rule-value');
                    var value = '';
                    if (valueBox) {
                        if (valueBox.classList.contains('asset-tree-userbox')) {
                            var hidden = valueBox.querySelector('.asset-tree-field-value');
                            value = hidden ? hidden.value : '';
                        } else {
                            value = valueBox.value || '';
                        }
                    }
                    rules.push({
                        field: fieldBox ? fieldBox.value : 'name',
                        op: opBox ? opBox.value : 'contains',
                        value: value
                    });
                }
                return rules;
            }
            function paintRules(keep) {
                if (!keep) {
                    var current = readRules();
                    if (current.length) draft.rules = current;
                }
                if (!draft.rules.length) draft.rules.push({ field: 'name', op: 'contains', value: '' });
                list.innerHTML = '';
                draft.rules.forEach(function (rule, index) {
                    var spec = fieldSpec(rule.field);
                    var ops = opsFor(spec.kind);
                    if (ops.indexOf(rule.op) < 0) rule.op = ops[0];
                    var row = el('div', 'asset-tree-rule');
                    row.setAttribute('data-rule', String(index));
                    var fieldBox = el('select', 'asset-tree-rule-field');
                    filterFields().forEach(function (item) {
                        var option = el('option', null, item.label);
                        option.value = item.key;
                        if (item.key === rule.field) option.selected = true;
                        fieldBox.appendChild(option);
                    });
                    fieldBox.addEventListener('change', function () {
                        paintRules(false);
                    });
                    var opBox = el('select', 'asset-tree-rule-op');
                    ops.forEach(function (op) {
                        var option = el('option', null, opLabel(op));
                        option.value = op;
                        if (op === rule.op) option.selected = true;
                        opBox.appendChild(option);
                    });
                    opBox.addEventListener('change', function () {
                        paintRules(false);
                    });
                    row.appendChild(fieldBox);
                    row.appendChild(opBox);
                    if (rule.op !== 'empty' && rule.op !== 'notEmpty') {
                        var valueBox;
                        if (spec.kind === 'type') {
                            valueBox = el('select', 'asset-tree-rule-value');
                            state.types.forEach(function (type) {
                                var option = el('option', null, type.label);
                                option.value = type.typeKey;
                                if (type.typeKey === rule.value) option.selected = true;
                                valueBox.appendChild(option);
                            });
                        } else if (spec.kind === 'status') {
                            valueBox = el('select', 'asset-tree-rule-value');
                            statusChoices().forEach(function (choice) {
                                var option = el('option', null, choice.label);
                                option.value = choice.value;
                                if (choice.value === rule.value) option.selected = true;
                                valueBox.appendChild(option);
                            });
                        } else if (spec.kind === 'user') {
                            valueBox = userBox(rule.value || '', false);
                            valueBox.classList.add('asset-tree-rule-value');
                        } else {
                            valueBox = input('', rule.value || '', false);
                            valueBox.className = 'asset-tree-rule-value';
                            if (spec.kind === 'number') valueBox.inputMode = 'decimal';
                        }
                        row.appendChild(valueBox);
                    }
                    row.appendChild(button(t('deleteField'), 'asset-tree-btn', function () {
                        draft.rules = readRules();
                        draft.rules.splice(index, 1);
                        paintRules(true);
                    }));
                    list.appendChild(row);
                });
            }
            form.appendChild(button(t('addField'), 'asset-tree-btn', function () {
                draft.rules = readRules();
                draft.rules.push({ field: 'name', op: 'contains', value: '' });
                paintRules(true);
            }));
            form.appendChild(error);
            function applyRules(save) {
                var rules = readRules().filter(function (rule) {
                    if (rule.op === 'empty' || rule.op === 'notEmpty') return true;
                    return String(rule.value || '').trim().length > 0;
                });
                if (!rules.length) {
                    showError(t('filterHint'));
                    return;
                }
                var name = document.getElementById('filter-name').value.trim();
                if (save && !name) {
                    showError(t('filterNameRequired'));
                    return;
                }
                state.rules = rules;
                if (save) {
                    var id = draft.id || ('f' + Date.now());
                    var next = (state.savedFilters || []).filter(function (filter) { return filter.id !== id; });
                    next.push({ id: id, name: name, rules: rules });
                    state.savedFilters = next;
                    state.activeFilterId = id;
                    storeSavedFilters();
                } else {
                    state.activeFilterId = '';
                }
                closeModal();
                refreshBrowse();
            }
            var actions = el('div', 'asset-tree-dialog-actions');
            actions.appendChild(button(t('cancel'), 'asset-tree-btn', closeModal));
            if (draft.id) {
                actions.appendChild(button(t('filterDelete'), 'asset-tree-btn danger', function () {
                    state.savedFilters = (state.savedFilters || []).filter(function (filter) { return filter.id !== draft.id; });
                    storeSavedFilters();
                    if (state.activeFilterId === draft.id) {
                        state.activeFilterId = '';
                        state.rules = [];
                    }
                    closeModal();
                    refreshBrowse();
                }));
            }
            actions.appendChild(button(t('filterApply'), 'asset-tree-btn', function () { applyRules(false); }));
            actions.appendChild(button(t('filterSave'), 'asset-tree-btn primary', function () { applyRules(true); }));
            form.appendChild(actions);
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                applyRules(true);
            });
            dialog.appendChild(form);
            paintRules(true);
        });
    }

    function runSearch() {
        var query = textQuery();
        if (state.searchScope !== 'all' || query.length < 2) {
            state.searchHits = null;
            state.searching = false;
            refreshBrowse();
            return;
        }
        var token = state.searchToken + 1;
        state.searchToken = token;
        state.searching = true;
        state.searchHits = [];
        refreshBrowse();
        var pending = state.projects.length;
        var hits = [];
        if (!pending) {
            state.searching = false;
            state.searchHits = [];
            refreshBrowse();
            return;
        }
        state.projects.forEach(function (project) {
            ajax('GET', '/assets?projectKey=' + encodeURIComponent(project.key) + '&q=' + encodeURIComponent(query), null, function (status, payload) {
                if (token !== state.searchToken) return;
                if (status === 200) {
                    (payload.assets || []).forEach(function (asset) {
                        hits.push(asset);
                    });
                }
                pending -= 1;
                if (pending === 0) {
                    state.searchHits = hits;
                    state.searching = false;
                    refreshBrowse();
                }
            });
        });
    }

    function renderSettings() {
        var panel = el('section', 'asset-tree-report');
        var project = currentProject();
        var name = project ? (project.name || project.key) : state.projectKey;
        panel.appendChild(el('h2', null, t('settingsProject', name)));
        panel.appendChild(el('p', 'asset-tree-hint', t('settingsHint')));
        if (!state.canConfigure && !state.canGrant) {
            panel.appendChild(el('p', 'asset-tree-hint', t('settingsDenied')));
            return panel;
        }
        var sections = [];
        if (state.canConfigure) {
            sections.push(['statuses', t('statusSection'), (state.statuses || []).length]);
            sections.push(['types', t('typesSection'), state.types.length]);
        }
        if (state.canGrant) {
            sections.push(['access', t('accessSection'), state.grants ? state.grants.length : null]);
        }
        var allowed = {};
        sections.forEach(function (item) {
            allowed[item[0]] = true;
        });
        if (!allowed[state.schemaTab]) state.schemaTab = sections[0][0];
        var tabs = el('div', 'asset-tree-viewtabs asset-tree-schema-tabs');
        tabs.setAttribute('role', 'tablist');
        sections.forEach(function (item) {
            var active = state.schemaTab === item[0];
            var tab = button('', 'asset-tree-viewtab asset-tree-schema-tab' + (active ? ' is-active' : ''), function () {
                if (state.schemaTab === item[0]) return;
                state.schemaTab = item[0];
                state.schemaAdding = false;
                renderFrame();
            });
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-selected', active ? 'true' : 'false');
            tab.appendChild(document.createTextNode(item[1]));
            if (item[2] !== null) {
                tab.appendChild(el('span', 'asset-tree-schema-count', String(item[2])));
            }
            tabs.appendChild(tab);
        });
        panel.appendChild(tabs);
        if (state.schemaTab === 'types') {
            var types = el('div', 'asset-tree-settings-block');
            panel.appendChild(types);
            appendConstructor(types, false);
        } else if (state.schemaTab === 'access') {
            renderAccessSettings(panel);
        } else {
            renderStatusSettings(panel);
        }
        return panel;
    }

    function refreshSettings() {
        reloadTree(function () {
            renderFrame();
        });
    }

    function renderStatusSettings(panel) {
        var block = el('div', 'asset-tree-settings-block');
        block.appendChild(el('p', 'asset-tree-hint', t('statusSectionHint')));
        var rows = [];
        var list = el('div', 'asset-tree-status-list asset-tree-schema-scroll');
        var empty = el('p', 'asset-tree-schema-empty', t('schemaNoMatch'));
        empty.hidden = true;
        var search = schemaSearchInput(state.statusQuery, function () {
            state.statusQuery = search.value;
            applyListFilter(search.value, rows, empty);
        });
        block.appendChild(search);
        (state.statuses || []).forEach(function (item) {
            var row = el('div', 'asset-tree-status-row');
            row.setAttribute('data-name', item.label || '');
            row.appendChild(lozenge(item.statusKey));
            var label = input('', item.label || '', false);
            label.addEventListener('change', function () {
                var next = label.value.trim();
                if (!next) {
                    label.value = item.label || '';
                    notify(t('statusRequired'));
                    return;
                }
                if (next === item.label) return;
                ajax('PUT', '/projects/' + encodeURIComponent(state.projectKey) + '/statuses/' + encodeURIComponent(item.statusKey), {
                    label: next,
                    category: item.category
                }, function (status, payload) {
                    if (status >= 200 && status < 300) refreshSettings();
                    else notify((payload && payload.message) || t('errorTitle'));
                });
            });
            row.appendChild(label);
            row.appendChild(colorTrigger(item.category, function (value) {
                ajax('PUT', '/projects/' + encodeURIComponent(state.projectKey) + '/statuses/' + encodeURIComponent(item.statusKey), {
                    label: item.label,
                    category: value
                }, function (status, payload) {
                    if (status >= 200 && status < 300) refreshSettings();
                    else notify((payload && payload.message) || t('errorTitle'));
                });
            }));
            row.appendChild(el('span', 'asset-tree-key', t('statusInUseCount', item.assetCount || 0)));
            if (!(item.assetCount || 0) && state.statuses.length > 1) {
                row.appendChild(button(t('deleteType'), 'asset-tree-btn', function () {
                    if (!window.confirm(t('statusDeleteConfirm', item.label))) return;
                    ajax('DELETE', '/projects/' + encodeURIComponent(state.projectKey) + '/statuses/' + encodeURIComponent(item.statusKey), null, function (status, payload) {
                        if (status >= 200 && status < 300) refreshSettings();
                        else notify((payload && payload.message) || t('errorTitle'));
                    });
                }));
            }
            list.appendChild(row);
            rows.push(row);
        });
        list.appendChild(empty);
        applyListFilter(state.statusQuery, rows, empty);
        var form = el('form', 'asset-tree-status-add');
        form.appendChild(field(t('name'), input('status-label', '', false), true));
        var chosenCategory = 'todo';
        var trigger = colorTrigger('todo', function (value) {
            chosenCategory = value;
            paintDot(trigger, value);
        });
        form.appendChild(trigger);
        var error = el('div', 'asset-tree-form-error');
        error.hidden = true;
        form.appendChild(error);
        form.appendChild(button(t('statusAdd'), 'asset-tree-btn primary', function () {
            var label = document.getElementById('status-label').value.trim();
            if (!label) {
                error.hidden = false;
                error.textContent = t('statusRequired');
                return;
            }
            ajax('POST', '/projects/' + encodeURIComponent(state.projectKey) + '/statuses', {
                label: label,
                category: chosenCategory
            }, function (status, payload) {
                if (status >= 200 && status < 300) {
                    state.statusQuery = '';
                    refreshSettings();
                } else {
                    error.hidden = false;
                    error.textContent = (payload && payload.message) || t('errorTitle');
                }
            });
        }));
        form.addEventListener('submit', function (event) {
            event.preventDefault();
        });
        block.appendChild(form);
        block.appendChild(list);
        panel.appendChild(block);
    }

    function renderAccessSettings(panel) {
        var block = el('div', 'asset-tree-settings-block');
        block.appendChild(el('p', 'asset-tree-hint', t('accessHint')));
        if (state.grants === null) {
            state.grants = [];
            block.appendChild(el('p', 'asset-tree-hint', t('loading')));
            panel.appendChild(block);
            var projectKey = state.projectKey;
            ajax('GET', '/projects/' + encodeURIComponent(projectKey) + '/grants', null, function (status, payload) {
                if (state.view !== 'settings' || state.projectKey !== projectKey) return;
                if (status === 200) state.grants = payload || [];
                else {
                    state.grants = [];
                    notify((payload && payload.message) || t('errorTitle'));
                }
                if (state.schemaTab === 'access') renderFrame();
            });
            return;
        }
        var grantRows = [];
        var grantList = el('div', 'asset-tree-schema-scroll asset-tree-grant-list');
        var grantEmpty = el('p', 'asset-tree-schema-empty', t('schemaNoMatch'));
        grantEmpty.hidden = true;
        var grantSearch = schemaSearchInput(state.grantQuery, function () {
            state.grantQuery = grantSearch.value;
            applyListFilter(grantSearch.value, grantRows, grantEmpty);
        });
        block.appendChild(grantSearch);
        if (!state.grants.length) {
            block.appendChild(el('p', 'asset-tree-hint', t('accessEmpty')));
        }
        state.grants.forEach(function (grant) {
            var row = el('div', 'asset-tree-grant');
            row.setAttribute('data-name', grant.groupName || '');
            var head = el('div', 'asset-tree-grant-head');
            head.appendChild(el('strong', null, grant.groupName));
            head.appendChild(button(t('accessRemove'), 'asset-tree-btn', function () {
                ajax('DELETE', '/projects/' + encodeURIComponent(state.projectKey) + '/grants?group=' + encodeURIComponent(grant.groupName), null, function (status, payload) {
                    if (status >= 200 && status < 300) {
                        state.grants = (state.grants || []).filter(function (item) {
                            return item.groupName !== grant.groupName;
                        });
                        renderFrame();
                    } else {
                        notify((payload && payload.message) || t('errorTitle'));
                    }
                });
            }));
            row.appendChild(head);
            row.appendChild(capPresets(function (caps) {
                postGrant(grant.groupName, caps, null);
            }));
            row.appendChild(capGrid(grantCaps(grant), function (key, checked) {
                var current = grantCaps(grant);
                var next = current.filter(function (item) { return item !== key; });
                if (checked) next.push(key);
                if (key === 'create' && !checked) {
                    next = next.filter(function (item) { return item !== 'remove' && item !== 'comment'; });
                }
                var caps = capsJoined(next);
                if (!caps || caps === capsJoined(current)) {
                    renderFrame();
                    return;
                }
                postGrant(grant.groupName, caps, null);
            }));
            grantList.appendChild(row);
            grantRows.push(row);
        });
        grantList.appendChild(grantEmpty);
        applyListFilter(state.grantQuery, grantRows, grantEmpty);
        var form = el('form', 'asset-tree-grant asset-tree-grant-add');
        var groupInput = input('grant-group', '', false);
        groupInput.placeholder = t('groupSearch');
        form.appendChild(field(t('accessGroup'), groupInput, true));
        var suggest = el('div', 'asset-tree-suggest');
        form.appendChild(suggest);
        var chosen = { view: true };
        var boxes = {};
        function paintChosen() {
            CAP_KEYS.forEach(function (key) {
                if (boxes[key]) boxes[key].checked = !!chosen[key];
            });
        }
        function applyDraft(caps) {
            chosen = {};
            String(caps || '').split(',').forEach(function (key) {
                if (CAP_KEYS.indexOf(key) >= 0) chosen[key] = true;
            });
            if (!chosen.view) chosen.view = true;
            paintChosen();
        }
        var grid = el('div', 'asset-tree-caps');
        CAP_CHOICES.forEach(function (key) {
            var label = el('label', 'asset-tree-check');
            label.title = capHint(key);
            var box = document.createElement('input');
            box.type = 'checkbox';
            box.checked = key === 'view';
            boxes[key] = box;
            box.addEventListener('change', function () {
                if (box.checked) {
                    chosen[key] = true;
                    if (key !== 'view') chosen.view = true;
                    if (key === 'create') {
                        chosen.remove = true;
                        chosen.comment = true;
                    }
                } else if (key === 'view') {
                    chosen.view = true;
                } else {
                    chosen[key] = false;
                    if (key === 'create') {
                        chosen.remove = false;
                        chosen.comment = false;
                    }
                }
                paintChosen();
            });
            label.appendChild(box);
            label.appendChild(document.createTextNode(capLabel(key)));
            grid.appendChild(label);
        });
        form.appendChild(capPresets(function (caps) {
            applyDraft(caps);
        }));
        form.appendChild(grid);
        var error = el('div', 'asset-tree-form-error');
        error.hidden = true;
        form.appendChild(error);
        groupInput.addEventListener('input', function () {
            var query = groupInput.value.trim();
            suggest.innerHTML = '';
            if (!query) return;
            ajax('GET', '/groups?q=' + encodeURIComponent(query), null, function (status, payload) {
                if (groupInput.value.trim() !== query) return;
                suggest.innerHTML = '';
                (payload || []).forEach(function (item) {
                    var name = typeof item === 'string' ? item : (item.groupName || item.name || '');
                    if (!name) return;
                    suggest.appendChild(button(name, 'asset-tree-btn', function () {
                        groupInput.value = name;
                        suggest.innerHTML = '';
                    }));
                });
            });
        });
        form.appendChild(button(t('accessAdd'), 'asset-tree-btn primary', function () {
            var groupName = groupInput.value.trim();
            if (!groupName) {
                error.hidden = false;
                error.textContent = t('groupSearch');
                return;
            }
            var caps = capsJoined(CAP_KEYS.filter(function (key) { return chosen[key]; }));
            if (!caps) {
                error.hidden = false;
                error.textContent = t('capRequired');
                return;
            }
            error.hidden = true;
            postGrant(groupName, caps, error);
        }));
        form.addEventListener('submit', function (event) {
            event.preventDefault();
        });
        block.appendChild(form);
        if (state.grants.length) block.appendChild(grantList);
        panel.appendChild(block);
    }

    function renderReport() {
        var panel = el('section', 'asset-tree-report');
        panel.appendChild(el('h2', null, t('reportTitle')));
        panel.appendChild(el('p', 'asset-tree-hint', t('reportHint')));
        var report = state.report;
        if (!report) {
            panel.appendChild(el('p', 'asset-tree-hint', t('loading')));
            return panel;
        }
        var totals = el('div', 'asset-tree-stats');
        totals.appendChild(stat(t('reportTotal'), report.total));
        totals.appendChild(stat(t('reportEquipment'), report.equipment));
        panel.appendChild(totals);
        var charts = el('div', 'asset-tree-charts');
        charts.appendChild(chartCard(t('reportByStatus'), report.byStatus, true));
        charts.appendChild(chartCard(t('reportByType'), report.byType, false));
        panel.appendChild(charts);
        var places = el('div', 'asset-tree-section');
        places.appendChild(el('div', 'asset-tree-section-title', t('reportByPlace')));
        (report.places || []).forEach(function (place) {
            var row = el('div', 'asset-tree-bar-row');
            row.appendChild(el('span', null, place.name));
            row.appendChild(el('span', 'asset-tree-key', place.typeLabel));
            row.appendChild(el('span', null, t('placeCount', place.equipment)));
            places.appendChild(row);
        });
        panel.appendChild(places);
        var holders = el('div', 'asset-tree-section');
        holders.appendChild(el('div', 'asset-tree-section-title', t('reportHolders')));
        (report.holders || []).forEach(function (holder) {
            var row = el('div', 'asset-tree-bar-row');
            row.appendChild(el('span', null, holder.user ? holder.user.displayName : ''));
            row.appendChild(el('span', null, String(holder.count)));
            holders.appendChild(row);
        });
        panel.appendChild(holders);
        return panel;
    }

    function stat(label, value) {
        var card = el('div', 'asset-tree-stat');
        card.appendChild(el('span', null, label));
        card.appendChild(el('strong', null, String(value)));
        return card;
    }

    function chartCard(title, rows, withDonut) {
        var card = el('div', 'asset-tree-chart-card');
        card.appendChild(el('div', 'asset-tree-section-title', title));
        var data = (rows || []).filter(function (row) { return row.count > 0; }).map(function (row) {
            return { label: row.label, count: row.count, color: row.color || statusColor(row.key) };
        });
        if (!data.length) {
            card.appendChild(el('p', 'asset-tree-hint', t('chartEmpty')));
            return card;
        }
        var body = el('div', 'asset-tree-chart-body');
        if (withDonut) {
            body.appendChild(donutChart(data));
        }
        body.appendChild(barChart(data));
        card.appendChild(body);
        return card;
    }

    function statusColor(key) {
        if (key === 'in_use') return '#00875A';
        if (key === 'repair' || key === 'maintenance') return '#FF8B00';
        if (key === 'written_off') return '#DE350B';
        if (key === 'reserve') return '#6554C0';
        if (key === 'in_stock') return '#6B778C';
        return '#0052CC';
    }

    function svgEl(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }

    function barChart(rows) {
        var width = 420;
        var rowHeight = 28;
        var height = rows.length * rowHeight + 8;
        var svg = svgEl('svg');
        svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
        svg.setAttribute('class', 'asset-tree-chart');
        svg.setAttribute('role', 'img');
        var max = 1;
        rows.forEach(function (row) {
            if (row.count > max) max = row.count;
        });
        rows.forEach(function (row, index) {
            var y = 6 + index * rowHeight;
            var label = svgEl('text');
            label.setAttribute('x', '0');
            label.setAttribute('y', String(y + 14));
            label.setAttribute('class', 'asset-tree-chart-label');
            label.textContent = row.label;
            svg.appendChild(label);
            var barWidth = Math.max(2, Math.round((row.count / max) * 210));
            var rect = svgEl('rect');
            rect.setAttribute('x', '148');
            rect.setAttribute('y', String(y + 2));
            rect.setAttribute('width', String(barWidth));
            rect.setAttribute('height', '16');
            rect.setAttribute('rx', '2');
            rect.setAttribute('fill', row.color || '#0052CC');
            svg.appendChild(rect);
            var value = svgEl('text');
            value.setAttribute('x', String(156 + barWidth));
            value.setAttribute('y', String(y + 14));
            value.setAttribute('class', 'asset-tree-chart-value');
            value.textContent = String(row.count);
            svg.appendChild(value);
        });
        return svg;
    }

    function donutChart(rows) {
        var svg = svgEl('svg');
        svg.setAttribute('viewBox', '0 0 120 120');
        svg.setAttribute('class', 'asset-tree-donut');
        svg.setAttribute('role', 'img');
        var total = 0;
        rows.forEach(function (row) { total += row.count; });
        if (rows.length === 1) {
            var ring = svgEl('circle');
            ring.setAttribute('cx', '60');
            ring.setAttribute('cy', '60');
            ring.setAttribute('r', '35');
            ring.setAttribute('fill', 'none');
            ring.setAttribute('stroke', rows[0].color || '#0052CC');
            ring.setAttribute('stroke-width', '14');
            svg.appendChild(ring);
            var only = svgEl('text');
            only.setAttribute('x', '60');
            only.setAttribute('y', '64');
            only.setAttribute('text-anchor', 'middle');
            only.setAttribute('class', 'asset-tree-chart-value');
            only.textContent = String(total);
            svg.appendChild(only);
            return svg;
        }
        var angle = -Math.PI / 2;
        rows.forEach(function (row) {
            var slice = (row.count / total) * Math.PI * 2;
            var path = svgEl('path');
            path.setAttribute('d', donutSlice(60, 60, 42, 28, angle, angle + slice));
            path.setAttribute('fill', row.color || '#0052CC');
            svg.appendChild(path);
            angle += slice;
        });
        var caption = svgEl('text');
        caption.setAttribute('x', '60');
        caption.setAttribute('y', '64');
        caption.setAttribute('text-anchor', 'middle');
        caption.setAttribute('class', 'asset-tree-chart-value');
        caption.textContent = String(total);
        svg.appendChild(caption);
        return svg;
    }

    function donutSlice(cx, cy, outer, inner, start, end) {
        var large = end - start > Math.PI ? 1 : 0;
        function point(radius, theta) {
            return [cx + Math.cos(theta) * radius, cy + Math.sin(theta) * radius];
        }
        var outerStart = point(outer, start);
        var outerEnd = point(outer, end);
        var innerEnd = point(inner, end);
        var innerStart = point(inner, start);
        return 'M ' + outerStart[0] + ' ' + outerStart[1]
            + ' A ' + outer + ' ' + outer + ' 0 ' + large + ' 1 ' + outerEnd[0] + ' ' + outerEnd[1]
            + ' L ' + innerEnd[0] + ' ' + innerEnd[1]
            + ' A ' + inner + ' ' + inner + ' 0 ' + large + ' 0 ' + innerStart[0] + ' ' + innerStart[1]
            + ' Z';
    }

    function bucket(title, rows, total) {
        var section = el('div', 'asset-tree-section');
        section.appendChild(el('div', 'asset-tree-section-title', title));
        (rows || []).forEach(function (row) {
            var line = el('div', 'asset-tree-bar-row');
            var label = el('span', null, row.label);
            var track = el('span', 'asset-tree-bar');
            var fill = el('span');
            fill.style.width = (total ? Math.round(100 * row.count / total) : 0) + '%';
            if (row.color) fill.style.background = row.color;
            track.appendChild(fill);
            line.appendChild(label);
            line.appendChild(track);
            line.appendChild(el('span', null, String(row.count)));
            section.appendChild(line);
        });
        return section;
    }

    function boot() {
        state.loading = true;
        state.error = null;
        renderFrame();
        ajax('GET', '/meta', null, function (status, payload) {
            if (status !== 200) {
                state.loading = false;
                state.error = (payload && payload.message) || t('errorTitle');
                state.i18n = state.i18n || {};
                mount();
                return;
            }
            state.i18n = payload.i18n || {};
            state.canManage = payload.canConfigure === undefined ? !!payload.canEdit : !!payload.canConfigure;
            state.projects = payload.projects || [];
            state.locale = payload.locale || 'ru';
            state.userKey = payload.userKey || '';
            state.displayName = payload.displayName || '';
            chooseProject();
            if (state.view === 'mine') {
                mount();
                loadMine();
                return;
            }
            mount();
            if (!state.projectKey) {
                state.loading = false;
                renderFrame();
                return;
            }
            reloadTree(function () {
                state.loading = false;
                renderFrame();
                if (state.view === 'dashboard') {
                    loadReport();
                }
                if (state.view === 'all') {
                    var grouped = hashGroup();
                    if (grouped && byId()[grouped.placeId]) {
                        selectTypeGroup(grouped.placeId, grouped.typeKey);
                    }
                    var requested = hashId();
                    if (requested && byId()[requested]) {
                        selectAsset(requested, true);
                    }
                    if (state.focusSearch) {
                        var searchBox = document.getElementById('asset-tree-search');
                        if (searchBox) searchBox.focus();
                        state.focusSearch = false;
                    }
                }
            });
        });
    }

    document.addEventListener('keydown', function (event) {
        if ((event.ctrlKey || event.metaKey) && (event.key === 's' || event.key === 'S')) {
            var form = document.getElementById('asset-detail-form');
            if (form && state.canEdit) {
                event.preventDefault();
                saveDetail();
            }
        }
        if (event.key === 'Escape') {
            closeColorMenu();
            closeModal();
        }
    });

    boot();
})();
