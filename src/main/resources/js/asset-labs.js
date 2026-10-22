/* Features in testing: schedule, building map, reports and asset lifecycle. Each project turns them on in Settings → Project. */
(function () {
    'use strict';

    var WORDS = [
        ['beta', 'Бета', 'Beta'],
        ['labsTitle', 'Тестовый функционал', 'Features in testing'],
        ['labsHint', 'Функции в разработке, проверены не до конца. Включаются для этого проекта, по умолчанию всё выключено. Данные сохраняются и остаются, если функцию выключить.',
            'Features still in development and not fully tested. They are turned on for this project only; everything is off by default. Data is kept when a feature is turned off.'],
        ['labsSaved', 'Тестовый функционал сохранён', 'Features in testing saved'],
        ['labSchedule', 'Графики ТО, КТС и поверки', 'Maintenance, inspection and calibration schedule'],
        ['labScheduleHint', 'Добавляет вкладку «Графики»: расписание работ по объектам с исполнителями, повторами и отметкой о выполнении.',
            'Adds the Schedules tab: work plans per asset with assignees, repeats and completion marks.'],
        ['labMap', 'Карта здания', 'Building map'],
        ['labMapHint', 'Добавляет вкладку «Карта»: план здания по этажам, комнаты, стены и двери, оборудование на своих местах.',
            'Adds the Map tab: a floor-by-floor building plan with rooms, walls and doors, and equipment placed where it stands.'],
        ['labReports', 'Отчёты', 'Reports'],
        ['labReportsHint', 'Добавляет вкладку «Отчёты»: стандартные и свои отчёты по активам с диаграммами и выгрузкой в CSV, как в JSM.',
            'Adds the Reports tab: built-in and custom asset reports with charts and CSV export, as in JSM.'],
        ['labLife', 'Жизненный цикл', 'Lifecycle'],
        ['labLifeHint', 'Добавляет в карточку закупку, гарантию, стоимость и амортизацию, а также списание через согласование.',
            'Adds purchase, warranty, cost and depreciation to the asset card, and write-off with approval.'],

        ['tabSchedule', 'Графики', 'Schedules'],
        ['tabMap', 'Карта', 'Map'],
        ['tabReports', 'Отчёты', 'Reports'],
        ['loading', 'Загрузка…', 'Loading…'],
        ['save', 'Сохранить', 'Save'],
        ['saved', 'Сохранено', 'Saved'],
        ['cancel', 'Отмена', 'Cancel'],
        ['delete', 'Удалить', 'Delete'],
        ['edit', 'Изменить', 'Edit'],
        ['close', 'Закрыть', 'Close'],
        ['open', 'Открыть карточку', 'Open card'],
        ['all', 'Все', 'All'],
        ['none', '—', '—'],
        ['search', 'Поиск', 'Search'],
        ['betaNote', 'Тестовый функционал: возможны ошибки. Если двое правят одновременно, сохранится последняя правка.',
            'Feature in testing: errors are possible. If two people edit at once, the last save wins.'],

        ['lifeTitle', 'Жизненный цикл', 'Lifecycle'],
        ['lifeEmpty', 'Сведения о закупке и гарантии ещё не заполнены.', 'Purchase and warranty details are not filled in yet.'],
        ['lifeFill', 'Заполнить', 'Fill in'],
        ['stagePurchase', 'Закупка', 'Purchase'],
        ['stageStart', 'Ввод в эксплуатацию', 'Commissioning'],
        ['stageWarranty', 'Гарантия', 'Warranty'],
        ['stageUse', 'Эксплуатация', 'In service'],
        ['stageWriteOff', 'Списание', 'Write-off'],
        ['purchaseDate', 'Дата закупки', 'Purchase date'],
        ['supplier', 'Поставщик', 'Supplier'],
        ['document', 'Документ (договор, счёт)', 'Document (contract, invoice)'],
        ['cost', 'Стоимость', 'Cost'],
        ['currency', 'Валюта', 'Currency'],
        ['commissioned', 'Дата ввода в эксплуатацию', 'Commissioning date'],
        ['warrantyUntil', 'Гарантия до', 'Warranty until'],
        ['warrantyNote', 'Гарантийный сервис', 'Warranty service'],
        ['lifeMonths', 'Срок полезного использования, мес.', 'Useful life, months'],
        ['method', 'Метод амортизации', 'Depreciation method'],
        ['methodLinear', 'Линейный', 'Straight-line'],
        ['methodDeclining', 'Уменьшаемого остатка', 'Declining balance'],
        ['salvage', 'Ликвидационная стоимость', 'Salvage value'],
        ['bookValue', 'Остаточная стоимость', 'Book value'],
        ['depreciated', 'Начислено амортизации', 'Depreciation to date'],
        ['wear', 'Износ', 'Wear'],
        ['age', 'Возраст', 'Age'],
        ['ageValue', '{0}', '{0}'],
        ['years', 'г.', 'y'],
        ['months', 'мес.', 'mo'],
        ['warrantyActive', 'Действует, осталось {0} дн.', 'Active, {0} days left'],
        ['warrantySoon', 'Истекает через {0} дн.', 'Expires in {0} days'],
        ['warrantyExpired', 'Истекла {0}', 'Expired {0}'],
        ['warrantyNone', 'Не указана', 'Not set'],
        ['writeOffAsk', 'Запросить списание', 'Request write-off'],
        ['writeOffReason', 'Причина списания', 'Reason for write-off'],
        ['writeOffSend', 'Отправить на согласование', 'Send for approval'],
        ['writeOffPending', 'На согласовании', 'Waiting for approval'],
        ['writeOffApproved', 'Списание согласовано', 'Write-off approved'],
        ['writeOffRejected', 'Списание отклонено', 'Write-off rejected'],
        ['writeOffCancelled', 'Запрос отозван', 'Request withdrawn'],
        ['writeOffBy', '{0} запросил(а)', 'Requested by {0}'],
        ['writeOffDecidedBy', 'Решение: {0}', 'Decision by {0}'],
        ['approve', 'Согласовать', 'Approve'],
        ['reject', 'Отклонить', 'Reject'],
        ['withdraw', 'Отозвать', 'Withdraw'],
        ['approveStatus', 'Статус после списания', 'Status after write-off'],
        ['decisionNote', 'Комментарий', 'Comment'],
        ['approvals', 'Списания на согласовании: {0}', 'Write-offs to approve: {0}'],
        ['approvalsTitle', 'Списания на согласовании', 'Write-offs to approve'],
        ['approvalsEmpty', 'Нет запросов на списание.', 'No write-off requests.'],
        ['mapOnCard', 'На карте', 'On the map'],
        ['mapShow', 'Показать на карте', 'Show on the map'],
        ['mapNotPlaced', 'Не размещено на карте.', 'Not placed on the map.'],

        ['schTitle', 'Графики ТО, КТС и поверки', 'Maintenance, inspection and calibration'],
        ['schNew', 'Новая работа', 'New job'],
        ['schCalendar', 'Календарь', 'Calendar'],
        ['schList', 'Список', 'List'],
        ['schPeople', 'По исполнителям', 'By assignee'],
        ['schToday', 'Сегодня', 'Today'],
        ['schKind', 'Вид работ', 'Kind of work'],
        ['kindTo', 'ТО', 'Maintenance'],
        ['kindKts', 'КТС', 'Inspection'],
        ['kindVerify', 'Поверка', 'Calibration'],
        ['kindToLong', 'Техническое обслуживание', 'Maintenance'],
        ['kindKtsLong', 'Контроль технического состояния', 'Technical condition check'],
        ['kindVerifyLong', 'Поверка средств измерений', 'Calibration of measuring instruments'],
        ['schAssignee', 'Исполнитель', 'Assignee'],
        ['schAnyone', 'Все исполнители', 'All assignees'],
        ['schNobody', 'Не назначен', 'Unassigned'],
        ['schName', 'Название', 'Title'],
        ['schObjects', 'Объекты', 'Assets'],
        ['schObjectsPick', 'Найдите и отметьте объекты', 'Find and tick assets'],
        ['schObjectsNone', 'Объекты не выбраны', 'No assets selected'],
        ['schStart', 'Первая дата', 'First date'],
        ['schTime', 'Время', 'Time'],
        ['schRepeat', 'Повтор', 'Repeat'],
        ['repNone', 'Без повтора', 'Once'],
        ['repWeek', 'Каждую неделю', 'Every week'],
        ['repMonth', 'Каждый месяц', 'Every month'],
        ['repQuarter', 'Раз в квартал', 'Every quarter'],
        ['repHalf', 'Раз в полгода', 'Every 6 months'],
        ['repYear', 'Раз в год', 'Every year'],
        ['rep2Year', 'Раз в 2 года', 'Every 2 years'],
        ['schUntil', 'Повторять до', 'Repeat until'],
        ['schNote', 'Что сделать', 'What to do'],
        ['schDone', 'Выполнено', 'Done'],
        ['schMarkDone', 'Отметить выполненным', 'Mark as done'],
        ['schUnmark', 'Снять отметку', 'Undo done'],
        ['schOverdue', 'Просрочено', 'Overdue'],
        ['schPlanned', 'Запланировано', 'Planned'],
        ['schWeek', 'На этой неделе', 'This week'],
        ['schMonthDone', 'Выполнено за месяц', 'Done this month'],
        ['schDeleteAsk', 'Удалить работу «{0}» вместе со всеми повторами?', 'Delete "{0}" with all its repeats?'],
        ['schEmpty', 'Работ пока нет. Нажмите «Новая работа», чтобы составить график.', 'No jobs yet. Click New job to build a schedule.'],
        ['schNothing', 'В этом периоде работ нет.', 'Nothing in this period.'],
        ['schMore', 'ещё {0}', '{0} more'],
        ['schDate', 'Дата', 'Date'],
        ['schStatus', 'Состояние', 'State'],
        ['schNeedName', 'Укажите название и первую дату.', 'Enter the title and the first date.'],
        ['schDoneBy', 'Выполнил(а) {0}', 'Done by {0}'],
        ['schSeries', 'Изменить работу', 'Edit job'],
        ['schCount', 'Работ: {0}', 'Jobs: {0}'],
        ['schPersonFind', 'Найти сотрудника', 'Find a person'],
        ['schMe', 'Назначить меня', 'Assign me'],
        ['schClear', 'Убрать', 'Clear'],
        ['schPrint', 'Печать', 'Print'],

        ['mapTitle', 'Карта здания', 'Building map'],
        ['mapFloors', 'Этажи', 'Floors'],
        ['mapFloor', 'Этаж {0}', 'Floor {0}'],
        ['mapAddFloor', 'Добавить этаж', 'Add floor'],
        ['mapRename', 'Переименовать', 'Rename'],
        ['mapFloorName', 'Название этажа', 'Floor name'],
        ['mapFloorDelete', 'Удалить этаж «{0}» со всем планом?', 'Delete floor "{0}" with its whole plan?'],
        ['mapEdit', 'Редактировать план', 'Edit plan'],
        ['mapDoneEdit', 'Готово', 'Done'],
        ['mapToolSelect', 'Выбор', 'Select'],
        ['mapToolRoom', 'Комната', 'Room'],
        ['mapToolWall', 'Стена', 'Wall'],
        ['mapToolDoor', 'Дверь', 'Door'],
        ['mapToolLabel', 'Подпись', 'Label'],
        ['mapToolHint', 'Комнату и стену тяните мышью. Дверь и подпись ставятся щелчком. Delete удаляет выбранное.',
            'Drag to draw rooms and walls. Click to put a door or a label. Delete removes the selection.'],
        ['mapEquipment', 'Оборудование', 'Equipment'],
        ['mapUnplaced', 'Не размещено', 'Not placed'],
        ['mapPlaced', 'На этом этаже', 'On this floor'],
        ['mapPlaceHint', 'Перетащите объект на план или выберите его и щёлкните по плану.', 'Drag an asset onto the plan, or pick it and click the plan.'],
        ['mapPlacing', 'Щёлкните по плану, чтобы поставить «{0}»', 'Click the plan to place "{0}"'],
        ['mapRemovePin', 'Убрать с карты', 'Remove from map'],
        ['mapRoomName', 'Название комнаты', 'Room name'],
        ['mapLabelText', 'Текст подписи', 'Label text'],
        ['mapColor', 'Цвет', 'Colour'],
        ['mapSize', 'Размер плана', 'Plan size'],
        ['mapWidth', 'Ширина', 'Width'],
        ['mapHeight', 'Высота', 'Height'],
        ['mapZoomIn', 'Крупнее', 'Zoom in'],
        ['mapZoomOut', 'Мельче', 'Zoom out'],
        ['mapZoomFit', 'По размеру', 'Fit'],
        ['mapFind', 'Найти на карте', 'Find on the map'],
        ['mapNotFound', 'Этот объект не размещён на карте.', 'This asset is not on the map.'],
        ['mapNoFloors', 'Этажей пока нет. Добавьте этаж и нарисуйте план.', 'No floors yet. Add a floor and draw the plan.'],
        ['mapUnsaved', 'Есть несохранённые изменения', 'There are unsaved changes'],
        ['mapLeave', 'План не сохранён. Уйти без сохранения?', 'The plan is not saved. Leave without saving?'],
        ['mapRoom', 'Комната', 'Room'],
        ['mapSelected', 'Выбрано', 'Selected'],
        ['mapNoSelection', 'Щёлкните по элементу плана, чтобы изменить его.', 'Click a plan element to change it.'],
        ['mapInRoom', '{0}, {1}', '{0}, {1}'],

        ['repTitle', 'Отчёты', 'Reports'],
        ['repBuiltIn', 'Стандартные', 'Built-in'],
        ['repCustom', 'Мои отчёты', 'Custom'],
        ['repNew', 'Создать отчёт', 'Create report'],
        ['repName', 'Название отчёта', 'Report name'],
        ['repGroup', 'Группировать по', 'Group by'],
        ['repChart', 'Вид диаграммы', 'Chart'],
        ['repMetric', 'Показатель', 'Measure'],
        ['repFilterType', 'Только типы', 'Only types'],
        ['repFilterStatus', 'Только статусы', 'Only statuses'],
        ['repFilterAll', 'Все', 'All'],
        ['chartBar', 'Столбцы', 'Bars'],
        ['chartDonut', 'Кольцо', 'Donut'],
        ['chartLine', 'По времени', 'Over time'],
        ['chartTable', 'Таблица', 'Table'],
        ['metricCount', 'Количество', 'Count'],
        ['metricCost', 'Стоимость закупки', 'Purchase cost'],
        ['metricBook', 'Остаточная стоимость', 'Book value'],
        ['groupStatus', 'Статус', 'Status'],
        ['groupType', 'Тип', 'Type'],
        ['groupPlace', 'Площадка', 'Place'],
        ['groupHolder', 'Ответственный (МОЛ)', 'Custodian'],
        ['groupCreated', 'Месяц добавления', 'Month added'],
        ['groupWarranty', 'Гарантия', 'Warranty'],
        ['groupAge', 'Возраст', 'Age'],
        ['groupWriteOff', 'Списания', 'Write-offs'],
        ['groupWork', 'Работы графика по месяцам', 'Scheduled work by month'],
        ['groupField', 'Поле: {0}', 'Field: {0}'],
        ['repByStatus', 'Активы по статусам', 'Assets by status'],
        ['repByType', 'Активы по типам', 'Assets by type'],
        ['repByPlace', 'Оборудование по площадкам', 'Equipment by place'],
        ['repByHolder', 'Оборудование по ответственным', 'Equipment by custodian'],
        ['repByCreated', 'Поступление по месяцам', 'Added by month'],
        ['repCostByType', 'Стоимость по типам', 'Value by type'],
        ['repWarranty', 'Гарантия', 'Warranty'],
        ['repAge', 'Возраст оборудования', 'Equipment age'],
        ['repWriteOffs', 'Списания', 'Write-offs'],
        ['repWork', 'Работы графика', 'Scheduled work'],
        ['repTotal', 'Итого', 'Total'],
        ['repEmpty', 'Нет данных для отчёта.', 'No data for this report.'],
        ['repCsv', 'Скачать CSV', 'Download CSV'],
        ['repDeleteAsk', 'Удалить отчёт «{0}»?', 'Delete report "{0}"?'],
        ['repNoPlace', 'Без площадки', 'No place'],
        ['repNoHolder', 'Не назначен', 'Unassigned'],
        ['repNoValue', 'Не заполнено', 'Empty'],
        ['repShare', 'Доля', 'Share'],
        ['repValue', 'Значение', 'Value'],
        ['repItems', 'Записей: {0}', 'Rows: {0}'],
        ['repNeedName', 'Укажите название отчёта.', 'Enter the report name.'],
        ['repLifeNeeded', 'Нужен «Жизненный цикл»', 'Needs Lifecycle'],
        ['repEquipmentOnly', 'Считаются объекты, площадки не учитываются.', 'Counts assets; places are not included.'],
        ['ageUnder1', 'До 1 года', 'Under 1 year'],
        ['age1to3', '1–3 года', '1–3 years'],
        ['age3to5', '3–5 лет', '3–5 years'],
        ['ageOver5', 'Больше 5 лет', 'Over 5 years'],
        ['ageUnknown', 'Дата не указана', 'Date not set'],
        ['wActive', 'Действует', 'Active'],
        ['wSoon', 'Истекает в течение 30 дней', 'Expires within 30 days'],
        ['wExpired', 'Истекла', 'Expired'],
        ['wNone', 'Не указана', 'Not set'],
        ['workPlanned', 'Запланировано', 'Planned'],
        ['workDone', 'Выполнено', 'Done']
    ];
    var TEXT = { ru: {}, en: {} };
    WORDS.forEach(function (row) {
        TEXT.ru[row[0]] = row[1];
        TEXT.en[row[0]] = row[2];
    });
    var LABS = [
        { key: 'schedule', title: 'labSchedule', hint: 'labScheduleHint' },
        { key: 'map', title: 'labMap', hint: 'labMapHint' },
        { key: 'reports', title: 'labReports', hint: 'labReportsHint' },
        { key: 'lifecycle', title: 'labLife', hint: 'labLifeHint' }
    ];
    var VIEWS = { schedule: 'tabSchedule', map: 'tabMap', reports: 'tabReports' };
    var KINDS = [
        { key: 'to', label: 'kindTo', long: 'kindToLong', color: '#0052CC' },
        { key: 'kts', label: 'kindKts', long: 'kindKtsLong', color: '#6554C0' },
        { key: 'verify', label: 'kindVerify', long: 'kindVerifyLong', color: '#FF8B00' }
    ];
    var REPEATS = [
        { key: 'none', label: 'repNone' },
        { key: 'week', label: 'repWeek', days: 7 },
        { key: 'month', label: 'repMonth', months: 1 },
        { key: 'quarter', label: 'repQuarter', months: 3 },
        { key: 'half', label: 'repHalf', months: 6 },
        { key: 'year', label: 'repYear', months: 12 },
        { key: 'year2', label: 'rep2Year', months: 24 }
    ];
    var CHART_COLORS = ['#0052CC', '#00875A', '#FF8B00', '#6554C0', '#DE350B', '#00A3BF', '#97A0AF', '#36B37E', '#FFAB00', '#4C9AFF', '#998DD9', '#79E2F2'];

    window.AssetTreeLabs = function (api) {
        var state = api.state;
        var el = api.el;
        var button = api.button;
        var cache = fresh('');
        var ui = {
            schedule: { mode: 'calendar', month: null, kind: '', person: '' },
            map: { floorId: '', edit: false, tool: 'select', zoom: null, selected: null, placing: null, query: '', focus: null, dirty: false, draft: null },
            reports: { id: 'byStatus' }
        };

        function fresh(projectKey) {
            return { project: projectKey, docs: {}, life: {}, lifeDocs: null, lifeLoading: false, writeOffs: null, writeOffsLoading: false };
        }

        function sync() {
            if (cache.project !== state.projectKey) {
                cache = fresh(state.projectKey);
                ui.map.floorId = '';
                ui.map.selected = null;
                ui.map.placing = null;
                ui.map.dirty = false;
                ui.map.draft = null;
                ui.map.edit = false;
            }
        }

        function ru() {
            return String(state.locale || 'ru').toLowerCase().indexOf('ru') === 0;
        }

        function L(key, arg, arg2) {
            var table = ru() ? TEXT.ru : TEXT.en;
            var value = table[key] !== undefined ? table[key] : (TEXT.ru[key] !== undefined ? TEXT.ru[key] : key);
            if (arg !== undefined && arg !== null) value = String(value).split('{0}').join(String(arg));
            if (arg2 !== undefined && arg2 !== null) value = String(value).split('{1}').join(String(arg2));
            return value;
        }

        function labsOf(project) {
            return (project && project.labs) || [];
        }

        function on(lab) {
            return labsOf(api.currentProject()).indexOf(lab) >= 0;
        }

        function fail(payload) {
            api.notify((payload && payload.message) || api.t('errorTitle'));
        }

        function uid(prefix) {
            return prefix + Math.random().toString(36).slice(2, 10);
        }

        function pad(n) {
            return (n < 10 ? '0' : '') + n;
        }

        function dayKey(date) {
            return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
        }

        function parseDay(text) {
            var match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(text || ''));
            return match ? new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10)) : null;
        }

        function todayKey() {
            return dayKey(new Date());
        }

        function addDays(date, count) {
            var next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            next.setDate(next.getDate() + count);
            return next;
        }

        function addMonths(date, count, day) {
            var next = new Date(date.getFullYear(), date.getMonth() + count, 1);
            var last = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
            next.setDate(Math.min(day || date.getDate(), last));
            return next;
        }

        function daysBetween(from, to) {
            return Math.round((to.getTime() - from.getTime()) / 86400000);
        }

        function showDay(key) {
            return key ? api.formatFieldDate(String(key).slice(0, 10)) : '';
        }

        function monthName(date, short) {
            try {
                return date.toLocaleString(ru() ? 'ru' : 'en', { month: short ? 'short' : 'long', year: 'numeric' });
            } catch (error) {
                return (date.getMonth() + 1) + '.' + date.getFullYear();
            }
        }

        function num(value) {
            var parsed = parseFloat(String(value === undefined || value === null ? '' : value).replace(',', '.').replace(/\s/g, ''));
            return isNaN(parsed) ? null : parsed;
        }

        function money(value, currency) {
            if (value === null || value === undefined || isNaN(value)) return '';
            var text;
            try {
                text = Number(value).toLocaleString(ru() ? 'ru' : 'en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            } catch (error) {
                text = Number(value).toFixed(2);
            }
            return text + ' ' + (currency || (ru() ? '₽' : 'RUB'));
        }

        function field(label, control, wide) {
            var wrap = el('label', 'asset-labs-field' + (wide ? ' is-wide' : ''));
            wrap.appendChild(el('span', 'asset-labs-label', label));
            wrap.appendChild(control);
            return wrap;
        }

        function textInput(value, placeholder, type) {
            var node = el('input', 'asset-tree-text');
            node.type = type || 'text';
            node.value = value === undefined || value === null ? '' : String(value);
            if (placeholder) node.placeholder = placeholder;
            return node;
        }

        function selectInput(options, value) {
            var node = el('select', 'asset-tree-text');
            options.forEach(function (option) {
                var item = el('option', null, option.label);
                item.value = option.value;
                node.appendChild(item);
            });
            node.value = value === undefined || value === null ? '' : String(value);
            if (node.selectedIndex < 0 && node.options.length) node.selectedIndex = 0;
            return node;
        }

        function textArea(value, placeholder) {
            var node = el('textarea', 'asset-tree-text asset-labs-area');
            node.value = value || '';
            if (placeholder) node.placeholder = placeholder;
            node.rows = 3;
            return node;
        }

        function dialogActions(dialog, primaryLabel, onPrimary, extra) {
            var actions = el('div', 'asset-tree-dialog-actions');
            actions.appendChild(button(primaryLabel, 'asset-tree-btn primary', onPrimary));
            (extra || []).forEach(function (node) { actions.appendChild(node); });
            actions.appendChild(button(L('cancel'), 'asset-tree-btn subtle', api.closeModal));
            dialog.appendChild(actions);
            return actions;
        }

        function errorLine() {
            var node = el('div', 'asset-tree-form-error');
            node.hidden = true;
            node.show = function (text) {
                node.textContent = text;
                node.hidden = false;
            };
            return node;
        }

        function equipment() {
            return state.assets.filter(function (asset) { return !api.isFolder(asset); });
        }

        function assetName(asset) {
            if (!asset) return '';
            return asset.name + (asset.objectKey ? ' · ' + asset.objectKey : '');
        }

        function betaBar(root, title, tools) {
            var head = el('div', 'asset-labs-head');
            var titles = el('div', 'asset-labs-titles');
            var h = el('h2', null, title);
            h.appendChild(el('span', 'asset-labs-beta', L('beta')));
            titles.appendChild(h);
            titles.appendChild(el('p', 'asset-tree-hint', L('betaNote')));
            head.appendChild(titles);
            if (tools) head.appendChild(tools);
            root.appendChild(head);
            return head;
        }

        /* ---------- Stored documents ---------- */

        function loadDoc(kind, done) {
            sync();
            var entry = cache.docs[kind];
            if (entry && entry.data) {
                if (done) done(entry.data);
                return;
            }
            if (entry && entry.loading) {
                if (done) entry.waiters.push(done);
                return;
            }
            entry = { loading: true, waiters: done ? [done] : [], data: null };
            cache.docs[kind] = entry;
            var projectKey = state.projectKey;
            api.ajax('GET', '/projects/' + encodeURIComponent(projectKey) + '/lab/' + kind, null, function (status, payload) {
                if (cache.project !== projectKey) return;
                entry.loading = false;
                var data = {};
                if (status === 200 && payload) {
                    try {
                        data = JSON.parse(payload.body || '{}') || {};
                    } catch (error) {
                        data = {};
                    }
                } else {
                    entry.failed = true;
                    fail(payload);
                }
                entry.data = data;
                var waiters = entry.waiters;
                entry.waiters = [];
                waiters.forEach(function (waiter) { waiter(data); });
            });
        }

        function docReady(kind) {
            sync();
            var entry = cache.docs[kind];
            return entry && entry.data ? entry.data : null;
        }

        function saveDoc(kind, data, done) {
            var projectKey = state.projectKey;
            api.ajax('PUT', '/projects/' + encodeURIComponent(projectKey) + '/lab/' + kind, { body: JSON.stringify(data) }, function (status, payload) {
                if (status < 200 || status >= 300) {
                    fail(payload);
                    if (done) done(false);
                    return;
                }
                if (cache.project === projectKey) {
                    cache.docs[kind] = { loading: false, waiters: [], data: data };
                }
                if (done) done(true);
            });
        }

        /* ---------- Settings → Project ---------- */

        function settingsBlock(onChange) {
            var project = api.currentProject();
            var block = el('div', 'asset-tree-settings-block asset-tree-project-section asset-labs-settings');
            var head = el('div', 'asset-labs-settings-head');
            head.appendChild(el('h3', 'asset-tree-settings-title', L('labsTitle')));
            head.appendChild(el('span', 'asset-labs-beta', L('beta')));
            block.appendChild(head);
            block.appendChild(el('p', 'asset-tree-hint', L('labsHint')));
            var list = el('div', 'asset-labs-switches');
            var boxes = [];
            LABS.forEach(function (lab) {
                var row = el('label', 'asset-labs-switch');
                var box = el('input');
                box.type = 'checkbox';
                box.value = lab.key;
                box.id = 'asset-labs-' + lab.key;
                box.checked = labsOf(project).indexOf(lab.key) >= 0;
                box.disabled = !state.canConfigure;
                box.addEventListener('change', function () {
                    var picked = boxes.filter(function (item) { return item.checked; }).map(function (item) { return item.value; });
                    boxes.forEach(function (item) { item.disabled = true; });
                    api.ajax('PUT', '/projects/' + encodeURIComponent(state.projectKey) + '/labs', { labs: picked }, function (status, payload) {
                        boxes.forEach(function (item) { item.disabled = !state.canConfigure; });
                        if (status < 200 || status >= 300) {
                            box.checked = !box.checked;
                            fail(payload);
                            return;
                        }
                        project.labs = (payload && payload.labs) || [];
                        boxes.forEach(function (item) { item.checked = project.labs.indexOf(item.value) >= 0; });
                        cache.writeOffs = null;
                        api.notify(L('labsSaved'));
                        if (onChange) onChange();
                    });
                });
                row.appendChild(box);
                var text = el('span', 'asset-labs-switch-text');
                text.appendChild(el('strong', null, L(lab.title)));
                text.appendChild(el('span', 'asset-tree-hint', L(lab.hint)));
                row.appendChild(text);
                list.appendChild(row);
                boxes.push(box);
            });
            block.appendChild(list);
            return block;
        }

        function views() {
            var project = api.currentProject();
            return ['schedule', 'map', 'reports'].filter(function (view) {
                return labsOf(project).indexOf(view) >= 0;
            }).map(function (view) {
                return { view: view, label: L(VIEWS[view]) };
            });
        }

        function isView(view) {
            return view === 'schedule' || view === 'map' || view === 'reports';
        }

        function render(view, frame) {
            sync();
            var root = el('section', 'asset-labs is-' + view);
            frame.appendChild(root);
            if (view === 'schedule') renderSchedule(root);
            else if (view === 'map') renderMap(root);
            else renderReports(root);
        }

        function rerender() {
            if (isView(state.view)) api.renderFrame();
        }

        function leaving() {
            if (state.view === 'map' && ui.map.dirty) {
                if (!window.confirm(L('mapLeave'))) return false;
                ui.map.dirty = false;
                ui.map.draft = null;
            }
            return true;
        }

        /* ---------- Lifecycle ---------- */

        function lifeOf(id) {
            sync();
            return cache.life[id] || null;
        }

        function loadLife(id) {
            sync();
            var projectKey = state.projectKey;
            cache.life[id] = { loading: true };
            api.ajax('GET', '/assets/' + id + '/life', null, function (status, payload) {
                if (cache.project !== projectKey) return;
                if (status !== 200) {
                    cache.life[id] = { failed: true, data: {}, message: payload && payload.message };
                } else {
                    cache.life[id] = readLife(payload);
                }
                api.redrawCard(id);
            });
        }

        function readLife(payload) {
            var data = {};
            try {
                data = JSON.parse((payload && payload.body) || '{}') || {};
            } catch (error) {
                data = {};
            }
            return { data: data, writeOff: payload ? payload.writeOff : null, canDecide: !!(payload && payload.canDecide) };
        }

        function lifeMath(data) {
            var cost = num(data.cost);
            var salvage = num(data.salvage) || 0;
            var months = num(data.lifeMonths);
            var start = parseDay(data.commissioned) || parseDay(data.purchaseDate);
            var today = parseDay(todayKey());
            var result = { cost: cost, start: start, book: null, depreciated: null, wear: null, ageMonths: null, warranty: null, warrantyDays: null };
            if (start) {
                result.ageMonths = Math.max(0, daysBetween(start, today) / 30.4375);
            }
            if (cost !== null && start && months && months > 0) {
                var used = Math.min(result.ageMonths, months);
                var book;
                if (data.method === 'declining') {
                    var rate = 2 / months;
                    book = cost * Math.pow(Math.max(0, 1 - rate), used);
                    if (used >= months) book = salvage;
                    book = Math.max(salvage, book);
                } else {
                    book = cost - (cost - salvage) * used / months;
                }
                book = Math.max(Math.min(book, cost), Math.min(salvage, cost));
                result.book = book;
                result.depreciated = cost - book;
                result.wear = cost > 0 ? (cost - book) / cost : 0;
            } else if (cost !== null) {
                result.book = cost;
                result.depreciated = 0;
                result.wear = 0;
            }
            var until = parseDay(data.warrantyUntil);
            if (until) {
                result.warrantyDays = daysBetween(today, until);
                result.warranty = result.warrantyDays < 0 ? 'expired' : (result.warrantyDays <= 30 ? 'soon' : 'active');
            } else {
                result.warranty = 'none';
            }
            return result;
        }

        function ageText(months) {
            if (months === null || months === undefined) return '';
            var whole = Math.floor(months);
            var years = Math.floor(whole / 12);
            var rest = whole % 12;
            var parts = [];
            if (years) parts.push(years + ' ' + L('years'));
            if (rest || !years) parts.push(rest + ' ' + L('months'));
            return parts.join(' ');
        }

        function warrantyText(math, data) {
            if (math.warranty === 'none') return L('warrantyNone');
            if (math.warranty === 'expired') return L('warrantyExpired', showDay(data.warrantyUntil));
            if (math.warranty === 'soon') return L('warrantySoon', math.warrantyDays);
            return L('warrantyActive', math.warrantyDays) + ' · ' + showDay(data.warrantyUntil);
        }

        function lifeBlock(asset) {
            if (!on('lifecycle') || !asset || api.isFolder(asset)) return null;
            var body = el('div', 'asset-labs-life');
            var entry = lifeOf(asset.id);
            if (!entry) {
                loadLife(asset.id);
                body.appendChild(el('p', 'asset-tree-hint', L('loading')));
            } else if (entry.loading) {
                body.appendChild(el('p', 'asset-tree-hint', L('loading')));
            } else if (entry.failed) {
                body.appendChild(el('p', 'asset-tree-hint', entry.message || api.t('errorTitle')));
            } else if (entry.editing) {
                body.appendChild(lifeEditor(asset, entry));
            } else {
                paintLife(body, asset, entry);
            }
            var block = api.moduleBlock(L('lifeTitle'), body, false);
            var title = block.querySelector('.asset-tree-module-head > span:last-child');
            if (title) title.appendChild(el('span', 'asset-labs-beta is-inline', L('beta')));
            return block;
        }

        function stageOf(entry, math) {
            var request = entry.writeOff;
            if (request && request.state === 'approved') return 4;
            if (request && request.state === 'pending') return 4;
            if (math.warranty === 'active' || math.warranty === 'soon') return 2;
            if (math.start && parseDay(entry.data.commissioned)) return 3;
            if (math.start) return 1;
            return entry.data.purchaseDate ? 0 : -1;
        }

        function paintLife(body, asset, entry) {
            var data = entry.data || {};
            var math = lifeMath(data);
            var stage = stageOf(entry, math);
            var steps = el('ol', 'asset-labs-stages');
            var dates = [data.purchaseDate, data.commissioned, data.warrantyUntil, '', entry.writeOff && entry.writeOff.state === 'approved' ? entry.writeOff.decided : ''];
            ['stagePurchase', 'stageStart', 'stageWarranty', 'stageUse', 'stageWriteOff'].forEach(function (key, index) {
                var cls = 'asset-labs-stage';
                if (index < stage) cls += ' is-past';
                if (index === stage) cls += ' is-current';
                if (index === 4 && entry.writeOff && entry.writeOff.state === 'pending') cls += ' is-waiting';
                var step = el('li', cls);
                step.appendChild(el('span', 'asset-labs-stage-dot'));
                step.appendChild(el('span', 'asset-labs-stage-name', L(key)));
                if (dates[index]) step.appendChild(el('span', 'asset-labs-stage-date', showDay(dates[index])));
                steps.appendChild(step);
            });
            body.appendChild(steps);
            var filled = data.purchaseDate || data.cost || data.warrantyUntil || data.commissioned || data.supplier;
            if (!filled) {
                body.appendChild(el('p', 'asset-tree-hint', L('lifeEmpty')));
            } else {
                var grid = el('dl', 'asset-labs-facts');
                function fact(label, value, strong) {
                    if (value === '' || value === null || value === undefined) return;
                    grid.appendChild(el('dt', null, label));
                    grid.appendChild(el('dd', strong ? 'is-strong' : null, value));
                }
                fact(L('purchaseDate'), showDay(data.purchaseDate));
                fact(L('supplier'), data.supplier);
                fact(L('document'), data.document);
                fact(L('cost'), math.cost !== null ? money(math.cost, data.currency) : '');
                fact(L('commissioned'), showDay(data.commissioned));
                fact(L('stageWarranty'), warrantyText(math, data));
                fact(L('warrantyNote'), data.warrantyNote);
                fact(L('age'), ageText(math.ageMonths));
                if (math.cost !== null) {
                    fact(L('method'), data.method === 'declining' ? L('methodDeclining') : L('methodLinear'));
                    if (data.lifeMonths) fact(L('lifeMonths'), String(data.lifeMonths));
                    fact(L('bookValue'), money(math.book, data.currency), true);
                    fact(L('depreciated'), money(math.depreciated, data.currency));
                    fact(L('wear'), Math.round((math.wear || 0) * 100) + ' %');
                }
                body.appendChild(grid);
                if (math.cost !== null && math.wear !== null) {
                    var bar = el('div', 'asset-labs-wear');
                    var fillBar = el('span');
                    fillBar.style.width = Math.round(Math.min(1, math.wear) * 100) + '%';
                    bar.appendChild(fillBar);
                    body.appendChild(bar);
                }
            }
            body.appendChild(writeOffPanel(asset, entry));
            if (api.mayEdit(asset)) {
                var actions = el('div', 'asset-labs-actions');
                actions.appendChild(button(filled ? L('edit') : L('lifeFill'), 'asset-tree-btn', function () {
                    entry.editing = true;
                    api.redrawCard(asset.id);
                }));
                body.appendChild(actions);
            }
        }

        function lifeEditor(asset, entry) {
            var data = entry.data || {};
            var form = el('form', 'asset-labs-life-form');
            form.addEventListener('submit', function (event) { event.preventDefault(); });
            var inputs = {
                purchaseDate: textInput(data.purchaseDate, '', 'date'),
                supplier: textInput(data.supplier),
                document: textInput(data.document),
                cost: textInput(data.cost, '0,00'),
                currency: textInput(data.currency || (ru() ? '₽' : 'RUB')),
                commissioned: textInput(data.commissioned, '', 'date'),
                warrantyUntil: textInput(data.warrantyUntil, '', 'date'),
                warrantyNote: textInput(data.warrantyNote),
                lifeMonths: textInput(data.lifeMonths, '60', 'number'),
                method: selectInput([{ value: 'linear', label: L('methodLinear') }, { value: 'declining', label: L('methodDeclining') }], data.method || 'linear'),
                salvage: textInput(data.salvage, '0,00')
            };
            inputs.lifeMonths.min = '1';
            inputs.currency.maxLength = 8;
            function section(title, keys) {
                var box = el('fieldset', 'asset-labs-fieldset');
                box.appendChild(el('legend', null, title));
                keys.forEach(function (pair) {
                    box.appendChild(field(L(pair[1]), inputs[pair[0]], pair[2]));
                });
                form.appendChild(box);
            }
            section(L('stagePurchase'), [['purchaseDate', 'purchaseDate'], ['supplier', 'supplier'], ['document', 'document', true], ['cost', 'cost'], ['currency', 'currency']]);
            section(L('stageStart') + ' · ' + L('stageWarranty'), [['commissioned', 'commissioned'], ['warrantyUntil', 'warrantyUntil'], ['warrantyNote', 'warrantyNote', true]]);
            section(L('method'), [['lifeMonths', 'lifeMonths'], ['method', 'method'], ['salvage', 'salvage']]);
            var error = errorLine();
            form.appendChild(error);
            var actions = el('div', 'asset-labs-actions');
            actions.appendChild(button(L('save'), 'asset-tree-btn primary', function () {
                var next = {};
                Object.keys(inputs).forEach(function (key) {
                    var value = String(inputs[key].value || '').replace(/^\s+|\s+$/g, '');
                    if (value) next[key] = value;
                });
                ['cost', 'salvage', 'lifeMonths'].forEach(function (key) {
                    if (next[key] !== undefined) {
                        var parsed = num(next[key]);
                        if (parsed === null || parsed < 0) {
                            error.show(L(key) + ': ?');
                            next.invalid = true;
                        } else next[key] = parsed;
                    }
                });
                if (next.invalid) return;
                api.ajax('PUT', '/assets/' + asset.id + '/life', { body: JSON.stringify(next) }, function (status, payload) {
                    if (status < 200 || status >= 300) {
                        error.show((payload && payload.message) || api.t('errorTitle'));
                        return;
                    }
                    cache.life[asset.id] = readLife(payload);
                    cache.lifeDocs = null;
                    api.notify(L('saved'));
                    api.redrawCard(asset.id);
                });
            }));
            actions.appendChild(button(L('cancel'), 'asset-tree-btn subtle', function () {
                entry.editing = false;
                api.redrawCard(asset.id);
            }));
            form.appendChild(actions);
            return form;
        }

        function writeOffPanel(asset, entry) {
            var box = el('div', 'asset-labs-writeoff');
            var request = entry.writeOff;
            var editable = api.mayEdit(asset);
            if (request) {
                var stateKey = { pending: 'writeOffPending', approved: 'writeOffApproved', rejected: 'writeOffRejected', cancelled: 'writeOffCancelled' }[request.state] || 'writeOffPending';
                var head = el('div', 'asset-labs-writeoff-head');
                head.appendChild(el('span', 'asset-labs-pill is-' + request.state, L(stateKey)));
                head.appendChild(el('span', 'asset-tree-hint', L('writeOffBy', request.requestedByName || request.requestedBy || '') + ' · ' + api.formatDate(request.requested)));
                box.appendChild(head);
                if (request.reason) box.appendChild(el('p', 'asset-labs-writeoff-reason', request.reason));
                if (request.state !== 'pending' && request.decidedByName) {
                    var decided = L('writeOffDecidedBy', request.decidedByName) + ' · ' + api.formatDate(request.decided);
                    box.appendChild(el('p', 'asset-tree-hint', decided + (request.note ? ' — ' + request.note : '')));
                }
            }
            var actions = el('div', 'asset-labs-actions');
            if (request && request.state === 'pending') {
                if (entry.canDecide) {
                    actions.appendChild(button(L('approve'), 'asset-tree-btn primary', function () { openDecision(asset.id, true); }));
                    actions.appendChild(button(L('reject'), 'asset-tree-btn', function () { openDecision(asset.id, false); }));
                }
                if (entry.canDecide || request.requestedBy === state.userKey) {
                    actions.appendChild(button(L('withdraw'), 'asset-tree-btn subtle', function () {
                        api.ajax('DELETE', '/assets/' + asset.id + '/writeoff', null, function (status, payload) {
                            if (status < 200 || status >= 300) return fail(payload);
                            cache.life[asset.id] = readLife(payload);
                            cache.writeOffs = null;
                            api.redrawCard(asset.id);
                            api.refreshTop();
                        });
                    }));
                }
            } else if (editable && (!request || request.state !== 'approved')) {
                actions.appendChild(button(L('writeOffAsk'), 'asset-tree-btn', function () { openWriteOff(asset); }));
            }
            if (actions.firstChild) box.appendChild(actions);
            return box;
        }

        function openWriteOff(asset) {
            api.openModal(function (dialog) {
                dialog.appendChild(el('h2', null, L('writeOffAsk')));
                dialog.appendChild(el('p', 'asset-tree-hint', assetName(asset)));
                var reason = textArea('', L('writeOffReason'));
                dialog.appendChild(field(L('writeOffReason'), reason, true));
                var error = errorLine();
                dialog.appendChild(error);
                dialogActions(dialog, L('writeOffSend'), function () {
                    var text = reason.value.replace(/^\s+|\s+$/g, '');
                    if (!text) {
                        error.show(L('writeOffReason'));
                        return;
                    }
                    api.ajax('POST', '/assets/' + asset.id + '/writeoff', { reason: text }, function (status, payload) {
                        if (status < 200 || status >= 300) {
                            error.show((payload && payload.message) || api.t('errorTitle'));
                            return;
                        }
                        api.closeModal();
                        cache.life[asset.id] = readLife(payload);
                        cache.writeOffs = null;
                        api.redrawCard(asset.id);
                        api.refreshTop();
                    });
                });
            });
        }

        function defaultWriteOffStatus() {
            var choices = api.statusChoices();
            for (var i = 0; i < choices.length; i++) {
                if (choices[i].value === 'written_off') return choices[i].value;
            }
            return choices.length ? choices[choices.length - 1].value : '';
        }

        function openDecision(assetId, approve, done) {
            var asset = api.byId()[assetId];
            api.openModal(function (dialog) {
                dialog.appendChild(el('h2', null, approve ? L('approve') : L('reject')));
                if (asset) dialog.appendChild(el('p', 'asset-tree-hint', assetName(asset)));
                var status = null;
                if (approve) {
                    status = selectInput(api.statusChoices(), defaultWriteOffStatus());
                    dialog.appendChild(field(L('approveStatus'), status, true));
                }
                var note = textArea('', L('decisionNote'));
                dialog.appendChild(field(L('decisionNote'), note, true));
                var error = errorLine();
                dialog.appendChild(error);
                dialogActions(dialog, approve ? L('approve') : L('reject'), function () {
                    var body = { approve: approve, note: note.value };
                    if (status) body.statusKey = status.value;
                    api.ajax('POST', '/assets/' + assetId + '/writeoff/decision', body, function (code, payload) {
                        if (code < 200 || code >= 300) {
                            error.show((payload && payload.message) || api.t('errorTitle'));
                            return;
                        }
                        api.closeModal();
                        cache.life[assetId] = readLife(payload);
                        cache.writeOffs = null;
                        cache.lifeDocs = null;
                        if (done) done();
                        api.reloadAssets(function () {
                            api.redrawCard(assetId);
                            api.refreshTop();
                        });
                    });
                });
            });
        }

        function loadWriteOffs(done) {
            sync();
            if (cache.writeOffs) {
                done(cache.writeOffs);
                return;
            }
            var projectKey = state.projectKey;
            api.ajax('GET', '/projects/' + encodeURIComponent(projectKey) + '/writeoffs', null, function (status, payload) {
                if (cache.project !== projectKey) return;
                cache.writeOffs = status === 200 ? (payload || []) : [];
                done(cache.writeOffs);
            });
        }

        function topActions(actions) {
            if (!on('lifecycle') || !state.canConfigure || !state.projectKey) return;
            var pill = button('', 'asset-tree-btn asset-labs-approvals', openApprovals);
            pill.hidden = true;
            pill.setAttribute('data-keep', '1');
            actions.appendChild(pill);
            loadWriteOffs(function (list) {
                var pending = list.filter(function (item) { return item.state === 'pending'; });
                pill.textContent = L('approvals', pending.length);
                pill.hidden = !pending.length;
            });
        }

        function openApprovals() {
            loadWriteOffs(function (list) {
                var pending = list.filter(function (item) { return item.state === 'pending'; });
                api.openModal(function (dialog) {
                    dialog.classList.add('asset-labs-wide-dialog');
                    dialog.appendChild(el('h2', null, L('approvalsTitle')));
                    if (!pending.length) dialog.appendChild(el('p', 'asset-tree-hint', L('approvalsEmpty')));
                    pending.forEach(function (item) {
                        var row = el('div', 'asset-labs-approval');
                        var text = el('div', 'asset-labs-approval-text');
                        var name = button((item.objectKey ? item.objectKey + ' · ' : '') + item.assetName, 'asset-tree-linkish', function () {
                            api.closeModal();
                            api.openAsset(item.assetId);
                        });
                        text.appendChild(name);
                        text.appendChild(el('span', 'asset-tree-hint', L('writeOffBy', item.requestedByName || item.requestedBy) + ' · ' + api.formatDate(item.requested)));
                        if (item.reason) text.appendChild(el('p', null, item.reason));
                        row.appendChild(text);
                        var buttons = el('div', 'asset-labs-actions');
                        buttons.appendChild(button(L('approve'), 'asset-tree-btn primary', function () {
                            api.closeModal();
                            openDecision(item.assetId, true);
                        }));
                        buttons.appendChild(button(L('reject'), 'asset-tree-btn', function () {
                            api.closeModal();
                            openDecision(item.assetId, false);
                        }));
                        row.appendChild(buttons);
                        dialog.appendChild(row);
                    });
                    var actions = el('div', 'asset-tree-dialog-actions');
                    actions.appendChild(button(L('close'), 'asset-tree-btn subtle', api.closeModal));
                    dialog.appendChild(actions);
                });
            });
        }

        function cardBlocks(asset) {
            var blocks = [];
            var life = lifeBlock(asset);
            if (life) blocks.push(life);
            var spot = mapBlock(asset);
            if (spot) blocks.push(spot);
            return blocks;
        }

        function activityVerb(action) {
            if (action === 'writeoff_request') return L('writeOffAsk');
            if (action === 'writeoff_approved') return L('writeOffApproved');
            if (action === 'writeoff_rejected') return L('writeOffRejected');
            if (action === 'writeoff_cancelled') return L('writeOffCancelled');
            return null;
        }

        /* ---------- Schedule ---------- */

        function canWrite() {
            return !!state.canObjects;
        }

        function kindOf(key) {
            for (var i = 0; i < KINDS.length; i++) {
                if (KINDS[i].key === key) return KINDS[i];
            }
            return KINDS[0];
        }

        function repeatOf(key) {
            for (var i = 0; i < REPEATS.length; i++) {
                if (REPEATS[i].key === key) return REPEATS[i];
            }
            return REPEATS[0];
        }

        function occurrences(item, fromKey, toKey) {
            var start = parseDay(item.start);
            var from = parseDay(fromKey);
            var to = parseDay(toKey);
            if (!start || !from || !to) return [];
            var repeat = repeatOf(item.repeat);
            var until = parseDay(item.until);
            var out = [];
            var current = start;
            var index = 0;
            if (repeat.days && current < from) {
                index = Math.max(0, Math.floor(daysBetween(start, from) / repeat.days) - 1);
                current = addDays(start, repeat.days * index);
            } else if (repeat.months && current < from) {
                var gap = (from.getFullYear() - start.getFullYear()) * 12 + from.getMonth() - start.getMonth();
                index = Math.max(0, Math.floor(gap / repeat.months) - 1);
                current = addMonths(start, repeat.months * index, start.getDate());
            }
            var guard = 0;
            while (current && guard < 1000) {
                guard++;
                if (until && current > until) break;
                if (current > to) break;
                if (current >= from) out.push(dayKey(current));
                if (!repeat.days && !repeat.months) break;
                index++;
                current = repeat.days ? addDays(start, repeat.days * index) : addMonths(start, repeat.months * index, start.getDate());
            }
            return out;
        }

        function scheduleItems() {
            var data = docReady('schedule') || {};
            if (!data.items) data.items = [];
            return data.items;
        }

        function passes(item) {
            var filter = ui.schedule;
            if (filter.kind && item.kind !== filter.kind) return false;
            if (filter.person) {
                var who = item.assignee && item.assignee.userKey ? item.assignee.userKey : '_none';
                if (who !== filter.person) return false;
            }
            return true;
        }

        function collect(fromKey, toKey, all) {
            var today = todayKey();
            var list = [];
            scheduleItems().forEach(function (item) {
                if (!all && !passes(item)) return;
                occurrences(item, fromKey, toKey).forEach(function (day) {
                    var done = item.done && item.done[day] ? item.done[day] : null;
                    list.push({ item: item, day: day, done: done, overdue: !done && day < today });
                });
            });
            list.sort(function (left, right) {
                if (left.day !== right.day) return left.day < right.day ? -1 : 1;
                return String(left.item.time || '').localeCompare(String(right.item.time || ''));
            });
            return list;
        }

        function monthStart() {
            if (!ui.schedule.month) {
                var now = new Date();
                ui.schedule.month = new Date(now.getFullYear(), now.getMonth(), 1);
            }
            return ui.schedule.month;
        }

        function jobTitle(item) {
            return item.title || L(kindOf(item.kind).long);
        }

        function kindChip(kindKey) {
            var kind = kindOf(kindKey);
            var chip = el('span', 'asset-labs-kind', L(kind.label));
            chip.style.background = kind.color;
            return chip;
        }

        function saveSchedule(done) {
            var data = docReady('schedule') || { items: [] };
            data.version = 1;
            saveDoc('schedule', data, function (ok) {
                if (done) done(ok);
                rerender();
            });
        }

        function renderSchedule(root) {
            var data = docReady('schedule');
            if (!data) {
                betaBar(root, L('schTitle'));
                root.appendChild(el('p', 'asset-tree-hint', L('loading')));
                loadDoc('schedule', rerender);
                return;
            }
            var tools = el('div', 'asset-labs-tools');
            if (canWrite()) tools.appendChild(button(L('schNew'), 'asset-tree-btn primary', function () { openJob(null, ''); }));
            betaBar(root, L('schTitle'), tools);

            var start = monthStart();
            var end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
            var monthList = collect(dayKey(start), dayKey(end), false);
            var today = parseDay(todayKey());
            var overdue = collect(dayKey(addDays(today, -730)), dayKey(addDays(today, -1)), false).filter(function (occ) { return occ.overdue; });
            var weekEnd = addDays(today, 7 - ((today.getDay() + 6) % 7) - 1);
            var week = collect(todayKey(), dayKey(weekEnd), false).filter(function (occ) { return !occ.done; });
            var stats = el('div', 'asset-labs-stats');
            function stat(label, value, cls) {
                var card = el('div', 'asset-labs-stat' + (cls ? ' ' + cls : ''));
                card.appendChild(el('strong', null, String(value)));
                card.appendChild(el('span', null, label));
                stats.appendChild(card);
            }
            stat(L('schOverdue'), overdue.length, overdue.length ? 'is-bad' : '');
            stat(L('schWeek'), week.length);
            stat(L('schPlanned') + ' · ' + monthName(start, false), monthList.length);
            stat(L('schMonthDone'), monthList.filter(function (occ) { return occ.done; }).length, 'is-good');
            root.appendChild(stats);

            var bar = el('div', 'asset-labs-bar');
            var modes = el('div', 'asset-labs-segment');
            [['calendar', 'schCalendar'], ['list', 'schList'], ['people', 'schPeople']].forEach(function (pair) {
                modes.appendChild(button(L(pair[1]), 'asset-labs-seg' + (ui.schedule.mode === pair[0] ? ' is-active' : ''), function () {
                    ui.schedule.mode = pair[0];
                    rerender();
                }));
            });
            bar.appendChild(modes);
            var nav = el('div', 'asset-labs-monthnav');
            nav.appendChild(button('‹', 'asset-tree-btn', function () {
                ui.schedule.month = new Date(start.getFullYear(), start.getMonth() - 1, 1);
                rerender();
            }));
            nav.appendChild(el('strong', 'asset-labs-month', monthName(start, false)));
            nav.appendChild(button('›', 'asset-tree-btn', function () {
                ui.schedule.month = new Date(start.getFullYear(), start.getMonth() + 1, 1);
                rerender();
            }));
            nav.appendChild(button(L('schToday'), 'asset-tree-btn subtle', function () {
                ui.schedule.month = null;
                rerender();
            }));
            bar.appendChild(nav);
            var filters = el('div', 'asset-labs-filters');
            var kindSelect = selectInput([{ value: '', label: L('all') + ' · ' + L('schKind').toLowerCase() }].concat(KINDS.map(function (kind) {
                return { value: kind.key, label: L(kind.long) };
            })), ui.schedule.kind);
            kindSelect.addEventListener('change', function () {
                ui.schedule.kind = kindSelect.value;
                rerender();
            });
            filters.appendChild(kindSelect);
            var people = [{ value: '', label: L('schAnyone') }];
            var seen = {};
            scheduleItems().forEach(function (item) {
                var key = item.assignee && item.assignee.userKey ? item.assignee.userKey : '_none';
                if (seen[key]) return;
                seen[key] = true;
                people.push({ value: key, label: key === '_none' ? L('schNobody') : item.assignee.name });
            });
            var personSelect = selectInput(people, ui.schedule.person);
            personSelect.addEventListener('change', function () {
                ui.schedule.person = personSelect.value;
                rerender();
            });
            filters.appendChild(personSelect);
            bar.appendChild(filters);
            root.appendChild(bar);

            if (!scheduleItems().length) {
                root.appendChild(el('p', 'asset-labs-empty', L('schEmpty')));
                return;
            }
            if (ui.schedule.mode === 'list') paintList(root, monthList, overdue);
            else if (ui.schedule.mode === 'people') paintPeople(root, monthList);
            else paintCalendar(root, start);
        }

        function occChip(occ) {
            var kind = kindOf(occ.item.kind);
            var chip = button('', 'asset-labs-chip' + (occ.done ? ' is-done' : '') + (occ.overdue ? ' is-overdue' : ''), function (event) {
                event.stopPropagation();
                openOccurrence(occ);
            });
            chip.style.borderLeftColor = kind.color;
            if (occ.item.time) chip.appendChild(el('span', 'asset-labs-chip-time', occ.item.time));
            chip.appendChild(el('span', 'asset-labs-chip-text', (occ.done ? '✓ ' : '') + jobTitle(occ.item)));
            chip.title = jobTitle(occ.item) + ' · ' + L(kind.long) + (occ.item.assignee ? ' · ' + occ.item.assignee.name : '');
            return chip;
        }

        function paintCalendar(root, start) {
            var grid = el('div', 'asset-labs-calendar');
            var first = addDays(start, -((start.getDay() + 6) % 7));
            var last = addDays(first, 41);
            var list = collect(dayKey(first), dayKey(last), false);
            var byDay = {};
            list.forEach(function (occ) {
                (byDay[occ.day] = byDay[occ.day] || []).push(occ);
            });
            var monday = new Date(2024, 0, 1);
            for (var w = 0; w < 7; w++) {
                var name;
                try {
                    name = addDays(monday, w).toLocaleString(ru() ? 'ru' : 'en', { weekday: 'short' });
                } catch (error) {
                    name = String(w + 1);
                }
                grid.appendChild(el('div', 'asset-labs-weekday', name));
            }
            var today = todayKey();
            for (var i = 0; i < 42; i++) {
                var day = addDays(first, i);
                var key = dayKey(day);
                var cell = el('div', 'asset-labs-day' + (day.getMonth() !== start.getMonth() ? ' is-other' : '') + (key === today ? ' is-today' : '') + (day.getDay() === 0 || day.getDay() === 6 ? ' is-weekend' : ''));
                cell.appendChild(el('span', 'asset-labs-daynum', String(day.getDate())));
                var items = byDay[key] || [];
                items.slice(0, 3).forEach(function (occ) { cell.appendChild(occChip(occ)); });
                if (items.length > 3) {
                    (function (dayItems, dayKeyText) {
                        cell.appendChild(button(L('schMore', dayItems.length - 3), 'asset-labs-more', function (event) {
                            event.stopPropagation();
                            openDay(dayKeyText, dayItems);
                        }));
                    })(items, key);
                }
                if (canWrite()) {
                    (function (presetDay) {
                        cell.addEventListener('dblclick', function () { openJob(null, presetDay); });
                    })(key);
                }
                grid.appendChild(cell);
            }
            root.appendChild(grid);
        }

        function openDay(day, items) {
            api.openModal(function (dialog) {
                dialog.appendChild(el('h2', null, showDay(day)));
                items.forEach(function (occ) {
                    dialog.appendChild(occChip(occ));
                });
                var actions = el('div', 'asset-tree-dialog-actions');
                actions.appendChild(button(L('close'), 'asset-tree-btn subtle', api.closeModal));
                dialog.appendChild(actions);
            });
        }

        function objectsText(item) {
            var index = api.byId();
            var names = (item.assetIds || []).map(function (id) { return index[id] ? index[id].name : null; }).filter(Boolean);
            if (!names.length) return L('schObjectsNone');
            if (names.length <= 2) return names.join(', ');
            return names.slice(0, 2).join(', ') + ' +' + (names.length - 2);
        }

        function doneToggle(occ) {
            if (!canWrite()) return el('span', occ.done ? 'asset-labs-pill is-approved' : (occ.overdue ? 'asset-labs-pill is-rejected' : 'asset-labs-pill'), occ.done ? L('schDone') : (occ.overdue ? L('schOverdue') : L('schPlanned')));
            var box = el('label', 'asset-labs-done');
            var check = el('input');
            check.type = 'checkbox';
            check.checked = !!occ.done;
            check.addEventListener('change', function () { markDone(occ, check.checked); });
            box.appendChild(check);
            box.appendChild(el('span', occ.overdue ? 'is-overdue' : null, occ.done ? L('schDone') : (occ.overdue ? L('schOverdue') : L('schPlanned'))));
            return box;
        }

        function occRow(occ, table) {
            var row = el('tr', occ.done ? 'is-done' : (occ.overdue ? 'is-overdue' : ''));
            var date = el('td', 'asset-labs-nowrap', showDay(occ.day) + (occ.item.time ? ' ' + occ.item.time : ''));
            row.appendChild(date);
            var kind = el('td');
            kind.appendChild(kindChip(occ.item.kind));
            row.appendChild(kind);
            var title = el('td');
            title.appendChild(button(jobTitle(occ.item), 'asset-tree-linkish', function () { openOccurrence(occ); }));
            row.appendChild(title);
            row.appendChild(el('td', null, objectsText(occ.item)));
            row.appendChild(el('td', null, occ.item.assignee ? occ.item.assignee.name : L('schNobody')));
            var stateCell = el('td');
            stateCell.appendChild(doneToggle(occ));
            row.appendChild(stateCell);
            table.appendChild(row);
        }

        function occTable(list) {
            var table = el('table', 'asset-labs-table');
            var head = el('tr');
            ['schDate', 'schKind', 'schName', 'schObjects', 'schAssignee', 'schStatus'].forEach(function (key) {
                head.appendChild(el('th', null, L(key)));
            });
            var thead = el('thead');
            thead.appendChild(head);
            table.appendChild(thead);
            var body = el('tbody');
            list.forEach(function (occ) { occRow(occ, body); });
            table.appendChild(body);
            return table;
        }

        function paintList(root, monthList, overdue) {
            if (overdue.length) {
                root.appendChild(el('h3', 'asset-labs-subtitle is-bad', L('schOverdue') + ' · ' + overdue.length));
                root.appendChild(occTable(overdue));
            }
            root.appendChild(el('h3', 'asset-labs-subtitle', monthName(monthStart(), false)));
            if (!monthList.length) root.appendChild(el('p', 'asset-tree-hint', L('schNothing')));
            else root.appendChild(occTable(monthList));
        }

        function paintPeople(root, monthList) {
            var groups = {};
            var order = [];
            monthList.forEach(function (occ) {
                var key = occ.item.assignee && occ.item.assignee.userKey ? occ.item.assignee.userKey : '_none';
                if (!groups[key]) {
                    groups[key] = { name: key === '_none' ? L('schNobody') : occ.item.assignee.name, list: [] };
                    order.push(key);
                }
                groups[key].list.push(occ);
            });
            if (!order.length) {
                root.appendChild(el('p', 'asset-tree-hint', L('schNothing')));
                return;
            }
            order.sort(function (left, right) {
                if (left === '_none' || right === '_none') return left === '_none' ? 1 : -1;
                return groups[left].name.localeCompare(groups[right].name);
            });
            var wrap = el('div', 'asset-labs-people');
            order.forEach(function (key) {
                var group = groups[key];
                var card = el('div', 'asset-labs-person');
                var head = el('div', 'asset-labs-person-head');
                head.appendChild(el('span', 'asset-tree-avatar' + (key === '_none' ? ' is-blank' : ''), key === '_none' ? '' : api.initials(group.name)));
                head.appendChild(el('strong', null, group.name));
                var done = group.list.filter(function (occ) { return occ.done; }).length;
                var late = group.list.filter(function (occ) { return occ.overdue; }).length;
                head.appendChild(el('span', 'asset-tree-hint', L('schCount', group.list.length) + ' · ' + L('schDone').toLowerCase() + ' ' + done + (late ? ' · ' + L('schOverdue').toLowerCase() + ' ' + late : '')));
                card.appendChild(head);
                var progress = el('div', 'asset-labs-wear is-good');
                var fillBar = el('span');
                fillBar.style.width = Math.round(done / group.list.length * 100) + '%';
                progress.appendChild(fillBar);
                card.appendChild(progress);
                card.appendChild(occTable(group.list));
                wrap.appendChild(card);
            });
            root.appendChild(wrap);
        }

        function markDone(occ, done) {
            var item = occ.item;
            item.done = item.done || {};
            if (done) {
                item.done[occ.day] = { by: state.userKey, name: state.displayName, at: new Date().toISOString() };
            } else {
                delete item.done[occ.day];
            }
            saveSchedule();
        }

        function openOccurrence(occ) {
            var item = occ.item;
            var kind = kindOf(item.kind);
            api.openModal(function (dialog) {
                dialog.classList.add('asset-labs-wide-dialog');
                var head = el('div', 'asset-labs-dialog-head');
                head.appendChild(kindChip(item.kind));
                head.appendChild(el('h2', null, jobTitle(item)));
                dialog.appendChild(head);
                var facts = el('dl', 'asset-labs-facts');
                function fact(label, value) {
                    if (!value) return;
                    facts.appendChild(el('dt', null, label));
                    facts.appendChild(el('dd', null, value));
                }
                fact(L('schKind'), L(kind.long));
                fact(L('schDate'), showDay(occ.day) + (item.time ? ' ' + item.time : ''));
                fact(L('schRepeat'), L(repeatOf(item.repeat).label) + (item.until ? ' · ' + L('schUntil').toLowerCase() + ' ' + showDay(item.until) : ''));
                fact(L('schAssignee'), item.assignee ? item.assignee.name : L('schNobody'));
                fact(L('schStatus'), occ.done ? L('schDoneBy', occ.done.name || '') + ' · ' + api.formatDate(occ.done.at) : (occ.overdue ? L('schOverdue') : L('schPlanned')));
                dialog.appendChild(facts);
                if (item.note) dialog.appendChild(el('p', 'asset-labs-note', item.note));
                dialog.appendChild(el('h3', 'asset-labs-subtitle', L('schObjects')));
                var objects = el('ul', 'asset-labs-objects');
                var index = api.byId();
                (item.assetIds || []).forEach(function (id) {
                    var asset = index[id];
                    if (!asset) return;
                    var li = el('li');
                    li.appendChild(api.typeTile(api.typeFor(asset), 'sm'));
                    li.appendChild(button(assetName(asset), 'asset-tree-linkish', function () {
                        api.closeModal();
                        api.openAsset(asset.id);
                    }));
                    if (asset.location) li.appendChild(el('span', 'asset-tree-hint', asset.location));
                    objects.appendChild(li);
                });
                if (!objects.firstChild) objects.appendChild(el('li', 'asset-tree-hint', L('schObjectsNone')));
                dialog.appendChild(objects);
                var actions = el('div', 'asset-tree-dialog-actions');
                if (canWrite()) {
                    actions.appendChild(button(occ.done ? L('schUnmark') : L('schMarkDone'), 'asset-tree-btn primary', function () {
                        api.closeModal();
                        markDone(occ, !occ.done);
                    }));
                    actions.appendChild(button(L('schSeries'), 'asset-tree-btn', function () {
                        api.closeModal();
                        openJob(item, '');
                    }));
                    actions.appendChild(button(L('delete'), 'asset-tree-btn danger', function () {
                        if (!window.confirm(L('schDeleteAsk', jobTitle(item)))) return;
                        var data = docReady('schedule');
                        data.items = (data.items || []).filter(function (other) { return other.id !== item.id; });
                        api.closeModal();
                        saveSchedule();
                    }));
                }
                actions.appendChild(button(L('close'), 'asset-tree-btn subtle', api.closeModal));
                dialog.appendChild(actions);
            });
        }

        function assetChooser(selected) {
            var wrap = el('div', 'asset-labs-chooser');
            var chips = el('div', 'asset-labs-chips');
            var search = textInput('', L('schObjectsPick'), 'search');
            var results = el('div', 'asset-labs-results');
            function paintChips() {
                chips.innerHTML = '';
                var index = api.byId();
                selected.forEach(function (id) {
                    var asset = index[id];
                    if (!asset) return;
                    var chip = el('span', 'asset-labs-tag', asset.name);
                    var remove = button('×', 'asset-labs-tag-x', function () {
                        selected.splice(selected.indexOf(id), 1);
                        paintChips();
                        paintResults();
                    });
                    remove.setAttribute('aria-label', L('delete'));
                    chip.appendChild(remove);
                    chips.appendChild(chip);
                });
                if (!chips.firstChild) chips.appendChild(el('span', 'asset-tree-hint', L('schObjectsNone')));
            }
            function paintResults() {
                results.innerHTML = '';
                var query = search.value.toLowerCase().replace(/^\s+|\s+$/g, '');
                var shown = 0;
                equipment().forEach(function (asset) {
                    if (shown >= 60) return;
                    var hay = [asset.name, asset.objectKey, asset.typeLabel, asset.location].join(' ').toLowerCase();
                    if (query && hay.indexOf(query) < 0) return;
                    shown++;
                    var row = el('label', 'asset-labs-result');
                    var check = el('input');
                    check.type = 'checkbox';
                    check.checked = selected.indexOf(asset.id) >= 0;
                    check.addEventListener('change', function () {
                        var at = selected.indexOf(asset.id);
                        if (check.checked && at < 0) selected.push(asset.id);
                        if (!check.checked && at >= 0) selected.splice(at, 1);
                        paintChips();
                    });
                    row.appendChild(check);
                    row.appendChild(api.typeTile(api.typeFor(asset), 'sm'));
                    var text = el('span', 'asset-labs-result-text');
                    text.appendChild(el('strong', null, asset.name));
                    text.appendChild(el('span', 'asset-tree-hint', [asset.objectKey, asset.typeLabel, asset.location].filter(Boolean).join(' · ')));
                    row.appendChild(text);
                    results.appendChild(row);
                });
            }
            search.addEventListener('input', paintResults);
            paintChips();
            paintResults();
            wrap.appendChild(chips);
            wrap.appendChild(search);
            wrap.appendChild(results);
            return wrap;
        }

        function personChooser(current, onPick) {
            var wrap = el('div', 'asset-labs-person-pick');
            var shown = el('div', 'asset-labs-person-current');
            var picked = current ? { userKey: current.userKey, name: current.name } : null;
            var search = textInput('', L('schPersonFind'), 'search');
            var results = el('div', 'asset-labs-user-results');
            function paint() {
                shown.innerHTML = '';
                shown.appendChild(el('span', 'asset-tree-avatar' + (picked ? '' : ' is-blank'), picked ? api.initials(picked.name) : ''));
                shown.appendChild(el('strong', null, picked ? picked.name : L('schNobody')));
                if (picked) {
                    shown.appendChild(button(L('schClear'), 'asset-tree-linkish', function () {
                        picked = null;
                        onPick(null);
                        paint();
                    }));
                }
                if (state.userKey && (!picked || picked.userKey !== state.userKey)) {
                    shown.appendChild(button(L('schMe'), 'asset-tree-linkish', function () {
                        picked = { userKey: state.userKey, name: state.displayName || state.userKey };
                        onPick(picked);
                        paint();
                    }));
                }
            }
            var timer = null;
            var seq = 0;
            search.addEventListener('input', function () {
                clearTimeout(timer);
                timer = setTimeout(function () {
                    var query = search.value.replace(/^\s+|\s+$/g, '');
                    var mine = ++seq;
                    results.innerHTML = '';
                    if (query.length < 2) return;
                    api.ajax('GET', '/users?q=' + encodeURIComponent(query), null, function (status, payload) {
                        if (mine !== seq || status !== 200) return;
                        results.innerHTML = '';
                        (payload || []).slice(0, 8).forEach(function (user) {
                            results.appendChild(button(user.displayName + (user.department ? ' · ' + user.department : ''), 'asset-tree-user-hit', function () {
                                picked = { userKey: user.userKey, name: user.displayName };
                                onPick(picked);
                                search.value = '';
                                results.innerHTML = '';
                                paint();
                            }));
                        });
                    });
                }, 220);
            });
            paint();
            wrap.appendChild(shown);
            wrap.appendChild(search);
            wrap.appendChild(results);
            return wrap;
        }

        function openJob(item, presetDay) {
            var creating = !item;
            var draft = item ? JSON.parse(JSON.stringify(item)) : {
                id: uid('j'), kind: 'to', title: '', assetIds: [], assignee: null,
                start: presetDay || todayKey(), time: '', repeat: 'none', until: '', note: '', done: {}
            };
            if (!draft.assetIds) draft.assetIds = [];
            api.openModal(function (dialog) {
                dialog.classList.add('asset-labs-wide-dialog');
                dialog.appendChild(el('h2', null, creating ? L('schNew') : L('schSeries')));
                var form = el('form', 'asset-labs-form');
                form.addEventListener('submit', function (event) { event.preventDefault(); });
                var kind = selectInput(KINDS.map(function (entry) { return { value: entry.key, label: L(entry.long) }; }), draft.kind);
                var title = textInput(draft.title, L(kindOf(draft.kind).long));
                kind.addEventListener('change', function () { title.placeholder = L(kindOf(kind.value).long); });
                var start = textInput(draft.start, '', 'date');
                var time = textInput(draft.time, '', 'time');
                var repeat = selectInput(REPEATS.map(function (entry) { return { value: entry.key, label: L(entry.label) }; }), draft.repeat);
                var until = textInput(draft.until, '', 'date');
                var untilField = field(L('schUntil'), until);
                function syncUntil() { untilField.hidden = repeat.value === 'none'; }
                repeat.addEventListener('change', syncUntil);
                syncUntil();
                var note = textArea(draft.note, L('schNote'));
                var row1 = el('div', 'asset-labs-row');
                row1.appendChild(field(L('schKind'), kind));
                row1.appendChild(field(L('schName'), title, true));
                form.appendChild(row1);
                var row2 = el('div', 'asset-labs-row');
                row2.appendChild(field(L('schStart'), start));
                row2.appendChild(field(L('schTime'), time));
                row2.appendChild(field(L('schRepeat'), repeat));
                row2.appendChild(untilField);
                form.appendChild(row2);
                var who = el('div', 'asset-labs-field is-wide');
                who.appendChild(el('span', 'asset-labs-label', L('schAssignee')));
                who.appendChild(personChooser(draft.assignee, function (person) { draft.assignee = person; }));
                form.appendChild(who);
                var objects = el('div', 'asset-labs-field is-wide');
                objects.appendChild(el('span', 'asset-labs-label', L('schObjects')));
                objects.appendChild(assetChooser(draft.assetIds));
                form.appendChild(objects);
                form.appendChild(field(L('schNote'), note, true));
                var error = errorLine();
                form.appendChild(error);
                dialog.appendChild(form);
                dialogActions(dialog, L('save'), function () {
                    if (!start.value) {
                        error.show(L('schNeedName'));
                        return;
                    }
                    draft.kind = kind.value;
                    draft.title = title.value.replace(/^\s+|\s+$/g, '');
                    draft.start = start.value;
                    draft.time = time.value;
                    draft.repeat = repeat.value;
                    draft.until = repeat.value === 'none' ? '' : until.value;
                    draft.note = note.value;
                    var data = docReady('schedule') || { items: [] };
                    data.items = data.items || [];
                    if (creating) data.items.push(draft);
                    else {
                        for (var i = 0; i < data.items.length; i++) {
                            if (data.items[i].id === draft.id) data.items[i] = draft;
                        }
                    }
                    api.closeModal();
                    saveSchedule();
                });
            });
        }

        /* ---------- Building map ---------- */

        var SVG_NS = 'http://www.w3.org/2000/svg';
        var GRID = 10;
        var ROOM_COLORS = ['#4C9AFF', '#57D9A3', '#FFC400', '#FF8F73', '#998DD9', '#79E2F2', '#C1C7D0'];

        function svgEl(tag, attrs) {
            var node = document.createElementNS(SVG_NS, tag);
            Object.keys(attrs || {}).forEach(function (key) {
                node.setAttribute(key, attrs[key]);
            });
            return node;
        }

        function snap(value) {
            return Math.round(value / GRID) * GRID;
        }

        function mapData() {
            if (ui.map.edit && ui.map.draft) return ui.map.draft;
            var stored = docReady('map') || {};
            if (!stored.floors) stored.floors = [];
            return stored;
        }

        function floorsOf(data) {
            if (!data.floors) data.floors = [];
            return data.floors;
        }

        function currentFloor(data) {
            var floors = floorsOf(data);
            for (var i = 0; i < floors.length; i++) {
                if (floors[i].id === ui.map.floorId) return floors[i];
            }
            if (floors.length) {
                ui.map.floorId = floors[0].id;
                return floors[0];
            }
            return null;
        }

        function pinOf(data, assetId) {
            var floors = floorsOf(data);
            for (var i = 0; i < floors.length; i++) {
                var pins = floors[i].pins || [];
                for (var j = 0; j < pins.length; j++) {
                    if (pins[j].assetId === assetId) return { floor: floors[i], pin: pins[j] };
                }
            }
            return null;
        }

        function roomAt(floor, x, y) {
            var shapes = floor.shapes || [];
            for (var i = shapes.length - 1; i >= 0; i--) {
                var shape = shapes[i];
                if (shape.type === 'room' && x >= shape.x && x <= shape.x + shape.w && y >= shape.y && y <= shape.y + shape.h) return shape;
            }
            return null;
        }

        function shapeById(floor, id) {
            var shapes = floor.shapes || [];
            for (var i = 0; i < shapes.length; i++) {
                if (shapes[i].id === id) return shapes[i];
            }
            return null;
        }

        function markDirty() {
            ui.map.dirty = true;
            var badge = document.getElementById('asset-labs-unsaved');
            if (badge) badge.hidden = false;
        }

        function startEdit() {
            var stored = docReady('map') || {};
            ui.map.draft = JSON.parse(JSON.stringify(stored));
            if (!ui.map.draft.floors) ui.map.draft.floors = [];
            ui.map.edit = true;
            ui.map.dirty = false;
            ui.map.selected = null;
            ui.map.placing = null;
            ui.map.tool = 'select';
        }

        function stopEdit(save) {
            if (save) {
                var draft = ui.map.draft || { floors: [] };
                draft.version = 1;
                saveDoc('map', draft, function (ok) {
                    if (!ok) return;
                    ui.map.edit = false;
                    ui.map.dirty = false;
                    ui.map.draft = null;
                    ui.map.selected = null;
                    ui.map.placing = null;
                    api.notify(L('saved'));
                    rerender();
                });
                return;
            }
            if (ui.map.dirty && !window.confirm(L('mapLeave'))) return;
            ui.map.edit = false;
            ui.map.dirty = false;
            ui.map.draft = null;
            ui.map.selected = null;
            ui.map.placing = null;
            rerender();
        }

        function addFloor(data) {
            var floors = floorsOf(data);
            var floor = { id: uid('f'), name: L('mapFloor', floors.length + 1), width: 1200, height: 760, shapes: [], pins: [] };
            floors.push(floor);
            ui.map.floorId = floor.id;
            ui.map.zoom = null;
            markDirty();
            return floor;
        }

        function placePin(data, floor, assetId, x, y) {
            floorsOf(data).forEach(function (other) {
                other.pins = (other.pins || []).filter(function (pin) { return pin.assetId !== assetId; });
            });
            floor.pins = floor.pins || [];
            floor.pins.push({ assetId: assetId, x: x, y: y });
            ui.map.selected = { kind: 'pin', id: assetId };
            markDirty();
        }

        function removeSelected(floor) {
            var selected = ui.map.selected;
            if (!selected || !floor) return;
            if (selected.kind === 'pin') {
                floor.pins = (floor.pins || []).filter(function (pin) { return pin.assetId !== selected.id; });
            } else {
                floor.shapes = (floor.shapes || []).filter(function (shape) { return shape.id !== selected.id; });
            }
            ui.map.selected = null;
            markDirty();
        }

        document.addEventListener('keydown', function (event) {
            if (state.view !== 'map' || !ui.map.edit || !ui.map.selected) return;
            if (event.key !== 'Delete' && event.key !== 'Backspace') return;
            var tag = event.target && event.target.tagName ? event.target.tagName.toLowerCase() : '';
            if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
            if (document.querySelector('.asset-tree-backdrop')) return;
            event.preventDefault();
            removeSelected(currentFloor(mapData()));
            rerender();
        });

        function renderMap(root) {
            var stored = docReady('map');
            if (!stored) {
                betaBar(root, L('mapTitle'));
                root.appendChild(el('p', 'asset-tree-hint', L('loading')));
                loadDoc('map', rerender);
                return;
            }
            var data = mapData();
            var floor = currentFloor(data);
            var tools = el('div', 'asset-labs-tools');
            if (canWrite()) {
                if (ui.map.edit) {
                    var unsaved = el('span', 'asset-labs-unsaved', L('mapUnsaved'));
                    unsaved.id = 'asset-labs-unsaved';
                    unsaved.hidden = !ui.map.dirty;
                    tools.appendChild(unsaved);
                    tools.appendChild(button(L('save'), 'asset-tree-btn primary', function () { stopEdit(true); }));
                    tools.appendChild(button(L('cancel'), 'asset-tree-btn subtle', function () { stopEdit(false); }));
                } else {
                    tools.appendChild(button(L('mapEdit'), 'asset-tree-btn', function () {
                        startEdit();
                        rerender();
                    }));
                }
            }
            betaBar(root, L('mapTitle'), tools);
            var layout = el('div', 'asset-labs-map' + (ui.map.edit ? ' is-edit' : ''));
            var side = el('aside', 'asset-labs-map-side');
            var stage = el('div', 'asset-labs-map-stage');
            layout.appendChild(side);
            layout.appendChild(stage);
            root.appendChild(layout);
            paintFloors(side, data, floor);
            if (ui.map.edit) {
                paintTools(side);
                if (floor) {
                    paintSelection(side, data, floor);
                    paintEquipment(side, data, floor);
                }
            } else {
                paintFinder(side, data);
            }
            if (!floor) {
                var empty = el('div', 'asset-labs-empty');
                empty.appendChild(el('p', null, L('mapNoFloors')));
                if (canWrite()) {
                    empty.appendChild(button(L('mapAddFloor'), 'asset-tree-btn primary', function () {
                        if (!ui.map.edit) startEdit();
                        addFloor(mapData());
                        rerender();
                    }));
                }
                stage.appendChild(empty);
                return;
            }
            paintStage(stage, data, floor);
        }

        function sideSection(side, title) {
            var box = el('section', 'asset-labs-side-section');
            box.appendChild(el('h3', null, title));
            side.appendChild(box);
            return box;
        }

        function paintFloors(side, data, floor) {
            var box = sideSection(side, L('mapFloors'));
            var list = el('div', 'asset-labs-floors');
            floorsOf(data).forEach(function (item) {
                var pins = (item.pins || []).length;
                var row = button('', 'asset-labs-floor' + (floor && item.id === floor.id ? ' is-active' : ''), function () {
                    ui.map.floorId = item.id;
                    ui.map.selected = null;
                    ui.map.zoom = null;
                    rerender();
                });
                row.appendChild(el('span', null, item.name));
                row.appendChild(el('span', 'asset-labs-count', String(pins)));
                list.appendChild(row);
            });
            box.appendChild(list);
            if (ui.map.edit) {
                var actions = el('div', 'asset-labs-actions');
                actions.appendChild(button('+ ' + L('mapAddFloor'), 'asset-tree-btn subtle', function () {
                    addFloor(data);
                    rerender();
                }));
                if (floor) {
                    actions.appendChild(button(L('mapRename'), 'asset-tree-btn subtle', function () {
                        var name = window.prompt(L('mapFloorName'), floor.name);
                        if (name === null) return;
                        name = name.replace(/^\s+|\s+$/g, '');
                        if (!name) return;
                        floor.name = name.slice(0, 60);
                        markDirty();
                        rerender();
                    }));
                    actions.appendChild(button(L('delete'), 'asset-tree-btn subtle danger', function () {
                        if (!window.confirm(L('mapFloorDelete', floor.name))) return;
                        data.floors = floorsOf(data).filter(function (other) { return other.id !== floor.id; });
                        ui.map.floorId = '';
                        ui.map.selected = null;
                        markDirty();
                        rerender();
                    }));
                }
                box.appendChild(actions);
            }
        }

        function paintFinder(side, data) {
            var box = sideSection(side, L('mapFind'));
            var search = textInput(ui.map.query, L('search'), 'search');
            var results = el('div', 'asset-labs-pinlist');
            function paint() {
                results.innerHTML = '';
                var query = search.value.toLowerCase().replace(/^\s+|\s+$/g, '');
                ui.map.query = search.value;
                var index = api.byId();
                var count = 0;
                floorsOf(data).forEach(function (floor) {
                    (floor.pins || []).forEach(function (pin) {
                        var asset = index[pin.assetId];
                        if (!asset || count >= 40) return;
                        var hay = [asset.name, asset.objectKey, asset.typeLabel].join(' ').toLowerCase();
                        if (query && hay.indexOf(query) < 0) return;
                        count++;
                        var room = roomAt(floor, pin.x, pin.y);
                        var row = button('', 'asset-labs-pinrow', function () {
                            ui.map.floorId = floor.id;
                            ui.map.focus = asset.id;
                            rerender();
                        });
                        row.appendChild(api.typeTile(api.typeFor(asset), 'sm'));
                        var text = el('span', 'asset-labs-result-text');
                        text.appendChild(el('strong', null, asset.name));
                        text.appendChild(el('span', 'asset-tree-hint', floor.name + (room && room.name ? ' · ' + room.name : '')));
                        row.appendChild(text);
                        results.appendChild(row);
                    });
                });
                if (!count) results.appendChild(el('p', 'asset-tree-hint', query ? L('mapNotFound') : L('mapNotPlaced')));
            }
            search.addEventListener('input', paint);
            paint();
            box.appendChild(search);
            box.appendChild(results);
        }

        function paintTools(side) {
            var box = sideSection(side, L('mapEdit'));
            var row = el('div', 'asset-labs-toolset');
            [['select', 'mapToolSelect', '⬚'], ['room', 'mapToolRoom', '▭'], ['wall', 'mapToolWall', '▬'], ['door', 'mapToolDoor', '⌒'], ['label', 'mapToolLabel', 'T']].forEach(function (tool) {
                var item = button('', 'asset-labs-tool' + (ui.map.tool === tool[0] ? ' is-active' : ''), function () {
                    ui.map.tool = tool[0];
                    ui.map.placing = null;
                    rerender();
                });
                item.appendChild(el('span', 'asset-labs-tool-icon', tool[2]));
                item.appendChild(el('span', null, L(tool[1])));
                item.id = 'asset-labs-tool-' + tool[0];
                row.appendChild(item);
            });
            box.appendChild(row);
            box.appendChild(el('p', 'asset-tree-hint', L('mapToolHint')));
        }

        function paintSelection(side, data, floor) {
            var box = sideSection(side, L('mapSelected'));
            var selected = ui.map.selected;
            if (!selected) {
                box.appendChild(el('p', 'asset-tree-hint', L('mapNoSelection')));
                return;
            }
            if (selected.kind === 'pin') {
                var asset = api.byId()[selected.id];
                if (asset) {
                    var head = el('div', 'asset-labs-pinrow is-static');
                    head.appendChild(api.typeTile(api.typeFor(asset), 'sm'));
                    head.appendChild(el('strong', null, assetName(asset)));
                    box.appendChild(head);
                    var actions = el('div', 'asset-labs-actions');
                    actions.appendChild(button(L('mapRemovePin'), 'asset-tree-btn', function () {
                        removeSelected(floor);
                        rerender();
                    }));
                    box.appendChild(actions);
                }
                return;
            }
            var shape = shapeById(floor, selected.id);
            if (!shape) return;
            var kindLabel = { room: 'mapToolRoom', wall: 'mapToolWall', door: 'mapToolDoor', label: 'mapToolLabel' }[shape.type];
            box.appendChild(el('p', 'asset-labs-label', L(kindLabel)));
            if (shape.type === 'room' || shape.type === 'label') {
                var text = textInput(shape.type === 'room' ? shape.name : shape.text, shape.type === 'room' ? L('mapRoomName') : L('mapLabelText'));
                text.addEventListener('input', function () {
                    if (shape.type === 'room') shape.name = text.value.slice(0, 80);
                    else shape.text = text.value.slice(0, 80);
                    markDirty();
                    if (ui.map.redraw) ui.map.redraw();
                });
                box.appendChild(field(shape.type === 'room' ? L('mapRoomName') : L('mapLabelText'), text, true));
            }
            if (shape.type === 'room') {
                var colors = el('div', 'asset-labs-colors');
                ROOM_COLORS.forEach(function (color) {
                    var swatch = button('', 'asset-labs-color' + (shape.color === color ? ' is-active' : ''), function () {
                        shape.color = color;
                        markDirty();
                        rerender();
                    });
                    swatch.style.background = color;
                    swatch.setAttribute('aria-label', color);
                    colors.appendChild(swatch);
                });
                box.appendChild(field(L('mapColor'), colors, true));
            }
            var remove = el('div', 'asset-labs-actions');
            remove.appendChild(button(L('delete'), 'asset-tree-btn danger', function () {
                removeSelected(floor);
                rerender();
            }));
            box.appendChild(remove);
        }

        function paintEquipment(side, data, floor) {
            var box = sideSection(side, L('mapEquipment'));
            box.appendChild(el('p', 'asset-tree-hint', L('mapPlaceHint')));
            var search = textInput(ui.map.query, L('search'), 'search');
            var lists = el('div');
            function paint() {
                lists.innerHTML = '';
                ui.map.query = search.value;
                var query = search.value.toLowerCase().replace(/^\s+|\s+$/g, '');
                var unplaced = el('div', 'asset-labs-pinlist');
                var placed = el('div', 'asset-labs-pinlist');
                var counts = { unplaced: 0, placed: 0 };
                equipment().forEach(function (asset) {
                    var hay = [asset.name, asset.objectKey, asset.typeLabel, asset.location].join(' ').toLowerCase();
                    if (query && hay.indexOf(query) < 0) return;
                    var spot = pinOf(data, asset.id);
                    if (spot && spot.floor.id !== floor.id) return;
                    var target = spot ? placed : unplaced;
                    var key = spot ? 'placed' : 'unplaced';
                    if (counts[key] >= 80) return;
                    counts[key]++;
                    var row = button('', 'asset-labs-pinrow' + (ui.map.placing === asset.id ? ' is-active' : '') + (spot && ui.map.selected && ui.map.selected.kind === 'pin' && ui.map.selected.id === asset.id ? ' is-active' : ''), function () {
                        if (spot) {
                            ui.map.selected = { kind: 'pin', id: asset.id };
                            ui.map.focus = asset.id;
                        } else {
                            ui.map.placing = ui.map.placing === asset.id ? null : asset.id;
                            ui.map.tool = 'select';
                        }
                        rerender();
                    });
                    row.draggable = true;
                    row.addEventListener('dragstart', function (event) {
                        event.dataTransfer.setData('text/plain', 'asset:' + asset.id);
                        event.dataTransfer.effectAllowed = 'move';
                    });
                    row.appendChild(api.typeTile(api.typeFor(asset), 'sm'));
                    var text = el('span', 'asset-labs-result-text');
                    text.appendChild(el('strong', null, asset.name));
                    text.appendChild(el('span', 'asset-tree-hint', [asset.objectKey, asset.location].filter(Boolean).join(' · ')));
                    row.appendChild(text);
                    target.appendChild(row);
                });
                lists.appendChild(el('p', 'asset-labs-label', L('mapUnplaced') + ' · ' + counts.unplaced));
                lists.appendChild(unplaced);
                lists.appendChild(el('p', 'asset-labs-label', L('mapPlaced') + ' · ' + counts.placed));
                lists.appendChild(placed);
            }
            search.addEventListener('input', paint);
            paint();
            box.appendChild(search);
            box.appendChild(lists);
        }

        function paintStage(stage, data, floor) {
            var bar = el('div', 'asset-labs-map-bar');
            bar.appendChild(el('strong', null, floor.name));
            var zoomBox = el('div', 'asset-labs-zoom');
            var canvas = el('div', 'asset-labs-map-canvas');
            var svg = svgEl('svg', { 'class': 'asset-labs-svg', viewBox: '0 0 ' + floor.width + ' ' + floor.height });
            function applyZoom() {
                var zoom = ui.map.zoom || 1;
                svg.setAttribute('width', String(Math.round(floor.width * zoom)));
                svg.setAttribute('height', String(Math.round(floor.height * zoom)));
            }
            function fit() {
                var room = canvas.clientWidth - 24;
                var tall = canvas.clientHeight - 24;
                if (room > 120) {
                    var scale = room / floor.width;
                    if (tall > 120) scale = Math.min(scale, tall / floor.height);
                    ui.map.zoom = Math.max(0.2, Math.min(2, scale));
                }
                applyZoom();
            }
            zoomBox.appendChild(button('−', 'asset-tree-btn', function () {
                ui.map.zoom = Math.max(0.2, (ui.map.zoom || 1) / 1.2);
                applyZoom();
            }));
            zoomBox.appendChild(button(L('mapZoomFit'), 'asset-tree-btn', fit));
            zoomBox.appendChild(button('+', 'asset-tree-btn', function () {
                ui.map.zoom = Math.min(4, (ui.map.zoom || 1) * 1.2);
                applyZoom();
            }));
            bar.appendChild(zoomBox);
            if (ui.map.edit) {
                var size = el('div', 'asset-labs-size');
                size.appendChild(el('span', 'asset-tree-hint', L('mapSize')));
                var width = textInput(floor.width, '', 'number');
                var height = textInput(floor.height, '', 'number');
                width.min = height.min = '200';
                width.max = height.max = '10000';
                width.step = height.step = '100';
                width.setAttribute('aria-label', L('mapWidth'));
                height.setAttribute('aria-label', L('mapHeight'));
                function resize() {
                    var w = Math.max(200, Math.min(10000, parseInt(width.value, 10) || floor.width));
                    var h = Math.max(200, Math.min(10000, parseInt(height.value, 10) || floor.height));
                    floor.width = w;
                    floor.height = h;
                    markDirty();
                    rerender();
                }
                width.addEventListener('change', resize);
                height.addEventListener('change', resize);
                size.appendChild(width);
                size.appendChild(el('span', null, '×'));
                size.appendChild(height);
                bar.appendChild(size);
            }
            stage.appendChild(bar);
            if (ui.map.placing) {
                var placing = api.byId()[ui.map.placing];
                stage.appendChild(el('div', 'asset-labs-placing', L('mapPlacing', placing ? placing.name : '')));
            }
            canvas.appendChild(svg);
            stage.appendChild(canvas);
            var popover = el('div', 'asset-labs-popover');
            popover.hidden = true;
            canvas.appendChild(popover);

            function draw() {
                while (svg.firstChild) svg.removeChild(svg.firstChild);
                var defs = svgEl('defs');
                var pattern = svgEl('pattern', { id: 'asset-labs-grid', width: '20', height: '20', patternUnits: 'userSpaceOnUse' });
                pattern.appendChild(svgEl('path', { d: 'M 20 0 L 0 0 0 20', fill: 'none', stroke: '#DFE1E6', 'stroke-width': '1' }));
                defs.appendChild(pattern);
                svg.appendChild(defs);
                svg.appendChild(svgEl('rect', { x: '0', y: '0', width: String(floor.width), height: String(floor.height), fill: '#FFFFFF' }));
                svg.appendChild(svgEl('rect', { x: '0', y: '0', width: String(floor.width), height: String(floor.height), fill: 'url(#asset-labs-grid)', 'class': 'asset-labs-bg' }));
                var selected = ui.map.selected;
                var shapes = floor.shapes || [];
                ['room', 'wall', 'door', 'label'].forEach(function (type) {
                    shapes.forEach(function (shape) {
                        if (shape.type !== type) return;
                        var picked = selected && selected.kind === 'shape' && selected.id === shape.id;
                        var group = svgEl('g', { 'data-kind': 'shape', 'data-id': shape.id, 'class': 'asset-labs-shape is-' + type + (picked ? ' is-selected' : '') });
                        if (type === 'room') {
                            var color = shape.color || ROOM_COLORS[0];
                            group.appendChild(svgEl('rect', { x: shape.x, y: shape.y, width: shape.w, height: shape.h, fill: color, 'fill-opacity': '0.16', stroke: color, 'stroke-width': '2', rx: '2' }));
                            if (shape.name) {
                                var name = svgEl('text', { x: shape.x + 10, y: shape.y + 22, 'class': 'asset-labs-room-name' });
                                name.textContent = shape.name;
                                group.appendChild(name);
                            }
                        } else if (type === 'wall' || type === 'door') {
                            group.appendChild(svgEl('line', { x1: shape.x1, y1: shape.y1, x2: shape.x2, y2: shape.y2, 'class': 'asset-labs-hit' }));
                            group.appendChild(svgEl('line', { x1: shape.x1, y1: shape.y1, x2: shape.x2, y2: shape.y2, stroke: type === 'wall' ? '#42526E' : '#FF991F', 'stroke-width': type === 'wall' ? '8' : '6', 'stroke-linecap': type === 'wall' ? 'square' : 'round', 'stroke-dasharray': type === 'door' ? '12 4' : '' }));
                        } else {
                            var label = svgEl('text', { x: shape.x, y: shape.y, 'class': 'asset-labs-map-label' });
                            label.textContent = shape.text || L('mapToolLabel');
                            group.appendChild(label);
                        }
                        svg.appendChild(group);
                        if (picked && ui.map.edit) {
                            if (type === 'room') {
                                svg.appendChild(svgEl('rect', { x: shape.x + shape.w - 6, y: shape.y + shape.h - 6, width: '12', height: '12', 'class': 'asset-labs-handle', 'data-kind': 'handle', 'data-id': 'corner' }));
                            } else if (type === 'wall' || type === 'door') {
                                svg.appendChild(svgEl('circle', { cx: shape.x1, cy: shape.y1, r: '7', 'class': 'asset-labs-handle', 'data-kind': 'handle', 'data-id': 'end1' }));
                                svg.appendChild(svgEl('circle', { cx: shape.x2, cy: shape.y2, r: '7', 'class': 'asset-labs-handle', 'data-kind': 'handle', 'data-id': 'end2' }));
                            }
                        }
                    });
                });
                var index = api.byId();
                (floor.pins || []).forEach(function (pin) {
                    var asset = index[pin.assetId];
                    if (!asset) return;
                    var type = api.typeFor(asset);
                    var picked = selected && selected.kind === 'pin' && selected.id === pin.assetId;
                    var group = svgEl('g', { 'data-kind': 'pin', 'data-id': String(pin.assetId), transform: 'translate(' + pin.x + ',' + pin.y + ')', 'class': 'asset-labs-pin' + (picked ? ' is-selected' : '') + (ui.map.focus === pin.assetId ? ' is-focus' : '') });
                    var tip = svgEl('title');
                    tip.textContent = assetName(asset) + (asset.status ? ' · ' + api.statusLabel(asset.status) : '');
                    group.appendChild(tip);
                    group.appendChild(svgEl('circle', { r: '20', 'class': 'asset-labs-pin-halo' }));
                    group.appendChild(svgEl('circle', { r: '13', fill: type.color || '#0052CC', stroke: '#FFFFFF', 'stroke-width': '3' }));
                    var letter = svgEl('text', { y: '5', 'class': 'asset-labs-pin-letter' });
                    letter.textContent = String(type.label || asset.name || '?').charAt(0).toUpperCase();
                    group.appendChild(letter);
                    var caption = svgEl('text', { y: '32', 'class': 'asset-labs-pin-name' });
                    caption.textContent = asset.name.length > 22 ? asset.name.slice(0, 21) + '…' : asset.name;
                    group.appendChild(caption);
                    svg.appendChild(group);
                });
            }
            ui.map.redraw = draw;
            draw();
            applyZoom();

            function point(event) {
                var matrix = svg.getScreenCTM();
                if (!matrix) return { x: 0, y: 0 };
                var pt = svg.createSVGPoint();
                pt.x = event.clientX;
                pt.y = event.clientY;
                var local = pt.matrixTransform(matrix.inverse());
                return { x: Math.max(0, Math.min(floor.width, local.x)), y: Math.max(0, Math.min(floor.height, local.y)) };
            }

            function showPopover(assetId) {
                var asset = api.byId()[assetId];
                var spot = pinOf(data, assetId);
                if (!asset || !spot) return;
                popover.innerHTML = '';
                var head = el('div', 'asset-labs-popover-head');
                head.appendChild(api.typeTile(api.typeFor(asset), 'sm'));
                var text = el('div', 'asset-labs-result-text');
                text.appendChild(el('strong', null, asset.name));
                text.appendChild(el('span', 'asset-tree-hint', [asset.objectKey, asset.typeLabel].filter(Boolean).join(' · ')));
                head.appendChild(text);
                popover.appendChild(head);
                if (asset.status) popover.appendChild(api.lozenge(asset.status));
                var room = roomAt(spot.floor, spot.pin.x, spot.pin.y);
                popover.appendChild(el('p', 'asset-tree-hint', spot.floor.name + (room && room.name ? ' · ' + room.name : '')));
                if (asset.custodian && asset.custodian.displayName) popover.appendChild(el('p', 'asset-tree-hint', asset.custodian.displayName));
                var actions = el('div', 'asset-labs-actions');
                actions.appendChild(button(L('open'), 'asset-tree-btn primary', function () { api.openAsset(asset.id); }));
                actions.appendChild(button('×', 'asset-tree-btn subtle', function () { popover.hidden = true; }));
                popover.appendChild(actions);
                var zoom = ui.map.zoom || 1;
                popover.style.left = Math.round(spot.pin.x * zoom + 22) + 'px';
                popover.style.top = Math.round(spot.pin.y * zoom - 10) + 'px';
                popover.hidden = false;
            }

            function track(onMove, onUp) {
                function move(event) {
                    onMove(event);
                }
                function up(event) {
                    window.removeEventListener('pointermove', move);
                    window.removeEventListener('pointerup', up);
                    onUp(event);
                }
                window.addEventListener('pointermove', move);
                window.addEventListener('pointerup', up);
            }

            svg.addEventListener('dragover', function (event) {
                if (!ui.map.edit) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
            });
            svg.addEventListener('drop', function (event) {
                if (!ui.map.edit) return;
                event.preventDefault();
                var raw = event.dataTransfer.getData('text/plain') || '';
                var match = /^asset:(\d+)$/.exec(raw);
                if (!match) return;
                var at = point(event);
                placePin(data, floor, parseInt(match[1], 10), snap(at.x), snap(at.y));
                ui.map.placing = null;
                rerender();
            });

            svg.addEventListener('pointerdown', function (event) {
                if (event.button !== 0) return;
                var holder = event.target && event.target.closest ? event.target.closest('[data-kind]') : null;
                var kind = holder ? holder.getAttribute('data-kind') : '';
                var id = holder ? holder.getAttribute('data-id') : '';
                var start = point(event);
                if (!ui.map.edit) {
                    if (kind === 'pin') showPopover(parseInt(id, 10));
                    else popover.hidden = true;
                    return;
                }
                event.preventDefault();
                if (ui.map.placing) {
                    placePin(data, floor, ui.map.placing, snap(start.x), snap(start.y));
                    ui.map.placing = null;
                    rerender();
                    return;
                }
                var tool = ui.map.tool;
                floor.shapes = floor.shapes || [];
                if (tool === 'room' || tool === 'wall') {
                    var sx = snap(start.x);
                    var sy = snap(start.y);
                    var shape = tool === 'room'
                        ? { id: uid('s'), type: 'room', x: sx, y: sy, w: 0, h: 0, name: '', color: ROOM_COLORS[floor.shapes.length % ROOM_COLORS.length] }
                        : { id: uid('s'), type: 'wall', x1: sx, y1: sy, x2: sx, y2: sy };
                    floor.shapes.push(shape);
                    ui.map.selected = { kind: 'shape', id: shape.id };
                    track(function (move) {
                        var at = point(move);
                        if (tool === 'room') {
                            var ex = snap(at.x);
                            var ey = snap(at.y);
                            shape.x = Math.min(sx, ex);
                            shape.y = Math.min(sy, ey);
                            shape.w = Math.abs(ex - sx);
                            shape.h = Math.abs(ey - sy);
                        } else {
                            var wx = snap(at.x);
                            var wy = snap(at.y);
                            if (!move.altKey) {
                                if (Math.abs(wx - sx) >= Math.abs(wy - sy)) wy = sy;
                                else wx = sx;
                            }
                            shape.x2 = wx;
                            shape.y2 = wy;
                        }
                        draw();
                    }, function () {
                        var tiny = tool === 'room' ? (shape.w < 20 || shape.h < 20) : (Math.abs(shape.x2 - shape.x1) + Math.abs(shape.y2 - shape.y1) < 20);
                        if (tiny) {
                            floor.shapes = floor.shapes.filter(function (other) { return other.id !== shape.id; });
                            ui.map.selected = null;
                        } else {
                            markDirty();
                        }
                        rerender();
                    });
                    return;
                }
                if (tool === 'door') {
                    var door = { id: uid('s'), type: 'door', x1: snap(start.x) - 20, y1: snap(start.y), x2: snap(start.x) + 20, y2: snap(start.y) };
                    floor.shapes.push(door);
                    ui.map.selected = { kind: 'shape', id: door.id };
                    ui.map.tool = 'select';
                    markDirty();
                    rerender();
                    return;
                }
                if (tool === 'label') {
                    var text = window.prompt(L('mapLabelText'), '');
                    if (text === null || !text.replace(/^\s+|\s+$/g, '')) return;
                    var label = { id: uid('s'), type: 'label', x: snap(start.x), y: snap(start.y), text: text.slice(0, 80) };
                    floor.shapes.push(label);
                    ui.map.selected = { kind: 'shape', id: label.id };
                    ui.map.tool = 'select';
                    markDirty();
                    rerender();
                    return;
                }
                if (!holder) {
                    if (ui.map.selected) {
                        ui.map.selected = null;
                        rerender();
                    }
                    return;
                }
                if (kind === 'handle' && ui.map.selected && ui.map.selected.kind === 'shape') {
                    var target = shapeById(floor, ui.map.selected.id);
                    if (!target) return;
                    track(function (move) {
                        var at = point(move);
                        if (id === 'corner') {
                            target.w = Math.max(20, snap(at.x) - target.x);
                            target.h = Math.max(20, snap(at.y) - target.y);
                        } else if (id === 'end1') {
                            target.x1 = snap(at.x);
                            target.y1 = snap(at.y);
                        } else {
                            target.x2 = snap(at.x);
                            target.y2 = snap(at.y);
                        }
                        draw();
                    }, function () {
                        markDirty();
                        rerender();
                    });
                    return;
                }
                if (kind === 'pin') {
                    var assetId = parseInt(id, 10);
                    var spot = pinOf(data, assetId);
                    if (!spot) return;
                    var wasSelected = ui.map.selected && ui.map.selected.kind === 'pin' && ui.map.selected.id === assetId;
                    ui.map.selected = { kind: 'pin', id: assetId };
                    var px = spot.pin.x;
                    var py = spot.pin.y;
                    var moved = false;
                    draw();
                    track(function (move) {
                        var at = point(move);
                        spot.pin.x = snap(px + at.x - start.x);
                        spot.pin.y = snap(py + at.y - start.y);
                        moved = moved || spot.pin.x !== px || spot.pin.y !== py;
                        draw();
                    }, function () {
                        if (moved) markDirty();
                        if (moved || !wasSelected) rerender();
                    });
                    return;
                }
                if (kind === 'shape') {
                    var item = shapeById(floor, id);
                    if (!item) return;
                    var picked = ui.map.selected && ui.map.selected.kind === 'shape' && ui.map.selected.id === item.id;
                    ui.map.selected = { kind: 'shape', id: item.id };
                    var origin = JSON.parse(JSON.stringify(item));
                    var shifted = false;
                    draw();
                    track(function (move) {
                        var at = point(move);
                        var dx = snap(at.x - start.x);
                        var dy = snap(at.y - start.y);
                        if (item.type === 'room' || item.type === 'label') {
                            item.x = origin.x + dx;
                            item.y = origin.y + dy;
                        } else {
                            item.x1 = origin.x1 + dx;
                            item.y1 = origin.y1 + dy;
                            item.x2 = origin.x2 + dx;
                            item.y2 = origin.y2 + dy;
                        }
                        shifted = shifted || dx !== 0 || dy !== 0;
                        draw();
                    }, function () {
                        if (shifted) markDirty();
                        if (shifted || !picked) rerender();
                    });
                }
            });

            setTimeout(function () {
                if (!canvas.parentNode) return;
                if (!ui.map.zoom) fit();
                if (ui.map.focus) {
                    var spot = pinOf(data, ui.map.focus);
                    if (spot && spot.floor.id === floor.id) {
                        var zoom = ui.map.zoom || 1;
                        canvas.scrollLeft = Math.max(0, spot.pin.x * zoom - canvas.clientWidth / 2);
                        canvas.scrollTop = Math.max(0, spot.pin.y * zoom - canvas.clientHeight / 2);
                        if (!ui.map.edit) showPopover(ui.map.focus);
                    }
                    var focused = ui.map.focus;
                    setTimeout(function () {
                        if (ui.map.focus === focused) ui.map.focus = null;
                    }, 2500);
                }
            }, 0);
        }

        function mapBlock(asset) {
            if (!on('map') || !asset || api.isFolder(asset)) return null;
            var data = docReady('map');
            if (!data) {
                loadDoc('map', function () { api.redrawCard(asset.id); });
                return null;
            }
            var spot = pinOf({ floors: data.floors || [] }, asset.id);
            if (!spot) return null;
            var body = el('div', 'asset-labs-mapspot');
            var room = roomAt(spot.floor, spot.pin.x, spot.pin.y);
            body.appendChild(el('span', null, spot.floor.name + (room && room.name ? ' · ' + room.name : '')));
            body.appendChild(button(L('mapShow'), 'asset-tree-btn', function () {
                ui.map.floorId = spot.floor.id;
                ui.map.focus = asset.id;
                ui.map.zoom = null;
                api.showView('map');
            }));
            return api.moduleBlock(L('mapOnCard'), body, false);
        }

        /* ---------- Reports ---------- */

        function builtIns() {
            var list = [
                { id: 'byStatus', name: L('repByStatus'), group: 'status', chart: 'donut', metric: 'count' },
                { id: 'byType', name: L('repByType'), group: 'type', chart: 'bar', metric: 'count' },
                { id: 'byPlace', name: L('repByPlace'), group: 'place', chart: 'bar', metric: 'count' },
                { id: 'byHolder', name: L('repByHolder'), group: 'holder', chart: 'bar', metric: 'count' },
                { id: 'byCreated', name: L('repByCreated'), group: 'created', chart: 'line', metric: 'count' }
            ];
            if (on('lifecycle')) {
                list.push({ id: 'costByType', name: L('repCostByType'), group: 'type', chart: 'bar', metric: 'book' });
                list.push({ id: 'warranty', name: L('repWarranty'), group: 'warranty', chart: 'donut', metric: 'count' });
                list.push({ id: 'age', name: L('repAge'), group: 'age', chart: 'bar', metric: 'count' });
                list.push({ id: 'writeOffs', name: L('repWriteOffs'), group: 'writeoff', chart: 'donut', metric: 'count' });
            }
            if (on('schedule')) {
                list.push({ id: 'work', name: L('repWork'), group: 'work', chart: 'line', metric: 'count' });
            }
            list.forEach(function (item) { item.builtin = true; });
            return list;
        }

        function customReports() {
            var data = docReady('reports') || {};
            if (!data.items) data.items = [];
            return data.items;
        }

        function reportById(id) {
            var all = builtIns().concat(customReports());
            for (var i = 0; i < all.length; i++) {
                if (all[i].id === id) return all[i];
            }
            return all[0];
        }

        function fieldChoices() {
            var seen = {};
            var list = [];
            (state.types || []).forEach(function (type) {
                (type.fields || []).forEach(function (item) {
                    if (!item.fieldKey || seen[item.fieldKey]) return;
                    seen[item.fieldKey] = true;
                    list.push({ value: 'field:' + item.fieldKey, label: L('groupField', item.label || item.fieldKey) });
                });
            });
            return list;
        }

        function groupChoices() {
            var list = [
                { value: 'status', label: L('groupStatus') },
                { value: 'type', label: L('groupType') },
                { value: 'place', label: L('groupPlace') },
                { value: 'holder', label: L('groupHolder') },
                { value: 'created', label: L('groupCreated') }
            ];
            if (on('lifecycle')) {
                list.push({ value: 'warranty', label: L('groupWarranty') });
                list.push({ value: 'age', label: L('groupAge') });
            }
            return list.concat(fieldChoices());
        }

        function groupLabel(group) {
            var choices = groupChoices().concat([{ value: 'writeoff', label: L('groupWriteOff') }, { value: 'work', label: L('groupWork') }]);
            for (var i = 0; i < choices.length; i++) {
                if (choices[i].value === group) return choices[i].label;
            }
            return group;
        }

        function needsLife(def) {
            return def.metric === 'cost' || def.metric === 'book' || def.group === 'warranty' || def.group === 'age';
        }

        function loadLifeDocs(done) {
            sync();
            if (cache.lifeDocs) {
                done(cache.lifeDocs);
                return;
            }
            if (cache.lifeLoading) return;
            cache.lifeLoading = true;
            var projectKey = state.projectKey;
            api.ajax('GET', '/projects/' + encodeURIComponent(projectKey) + '/life', null, function (status, payload) {
                if (cache.project !== projectKey) return;
                cache.lifeLoading = false;
                var map = {};
                if (status === 200) {
                    (payload || []).forEach(function (doc) {
                        try {
                            map[doc.ref] = JSON.parse(doc.body || '{}') || {};
                        } catch (error) {
                            map[doc.ref] = {};
                        }
                    });
                }
                cache.lifeDocs = map;
                done(map);
            });
        }

        function missingFor(def) {
            if (def.group === 'writeoff' && !cache.writeOffs) return function (done) { loadWriteOffs(function () { done(); }); };
            if (def.group === 'work' && !docReady('schedule')) return function (done) { loadDoc('schedule', function () { done(); }); };
            if (needsLife(def) && on('lifecycle') && !cache.lifeDocs) return function (done) { loadLifeDocs(function () { done(); }); };
            return null;
        }

        function monthKey(iso) {
            var day = parseDay(iso);
            return day ? day.getFullYear() + '-' + pad(day.getMonth() + 1) : '';
        }

        function monthLabel(key) {
            var parts = key.split('-');
            return monthName(new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1), true);
        }

        function compute(def) {
            var buckets = {};
            var order = [];
            function bump(key, label, amount, color, second) {
                if (!buckets[key]) {
                    buckets[key] = { key: key, label: label, value: 0, second: 0, color: color };
                    order.push(key);
                }
                buckets[key].value += amount;
                if (second) buckets[key].second += second;
            }
            if (def.group === 'writeoff') {
                (cache.writeOffs || []).forEach(function (item) {
                    var names = { pending: 'writeOffPending', approved: 'writeOffApproved', rejected: 'writeOffRejected', cancelled: 'writeOffCancelled' };
                    var colors = { pending: '#FF8B00', approved: '#DE350B', rejected: '#6B778C', cancelled: '#C1C7D0' };
                    bump(item.state, L(names[item.state] || 'writeOffPending'), 1, colors[item.state]);
                });
                return finish(buckets, order, false);
            }
            if (def.group === 'work') {
                var year = new Date().getFullYear();
                for (var m = 0; m < 12; m++) {
                    var key = year + '-' + pad(m + 1);
                    bump(key, monthLabel(key), 0, '#0052CC');
                }
                scheduleItems().forEach(function (item) {
                    occurrences(item, year + '-01-01', year + '-12-31').forEach(function (day) {
                        var done = item.done && item.done[day] ? 1 : 0;
                        bump(day.slice(0, 7), monthLabel(day.slice(0, 7)), 1, '#0052CC', done);
                    });
                });
                return finish(buckets, order, true);
            }
            var types = def.types || [];
            var statuses = def.statuses || [];
            var life = cache.lifeDocs || {};
            var created = [];
            equipment().forEach(function (asset) {
                if (types.length && types.indexOf(asset.typeKey) < 0) return;
                if (statuses.length && statuses.indexOf(asset.status) < 0) return;
                var amount = 1;
                var data = life[asset.id] || {};
                var math = null;
                if (needsLife(def)) math = lifeMath(data);
                if (def.metric === 'cost') amount = math && math.cost !== null ? math.cost : 0;
                if (def.metric === 'book') amount = math && math.book !== null ? math.book : 0;
                var group = def.group;
                if (group === 'status') {
                    bump(asset.status || '', api.statusLabel(asset.status) || L('repNoValue'), amount, api.statusColor(asset.status));
                } else if (group === 'type') {
                    var type = api.typeFor(asset);
                    bump(asset.typeKey || '', asset.typeLabel || type.label || L('repNoValue'), amount, type.color);
                } else if (group === 'place') {
                    bump(asset.location || '_none', asset.location || L('repNoPlace'), amount);
                } else if (group === 'holder') {
                    var holder = asset.custodian && asset.custodian.displayName ? asset.custodian : null;
                    bump(holder ? holder.userKey : '_none', holder ? holder.displayName : L('repNoHolder'), amount, holder ? null : '#C1C7D0');
                } else if (group === 'created') {
                    var month = monthKey(asset.created);
                    if (month) {
                        created.push(month);
                        bump(month, monthLabel(month), amount, '#0052CC');
                    }
                } else if (group === 'warranty') {
                    var warranty = math.warranty;
                    var wNames = { active: 'wActive', soon: 'wSoon', expired: 'wExpired', none: 'wNone' };
                    var wColors = { active: '#00875A', soon: '#FF8B00', expired: '#DE350B', none: '#C1C7D0' };
                    bump(warranty, L(wNames[warranty]), amount, wColors[warranty]);
                } else if (group === 'age') {
                    var age = math.ageMonths;
                    var bucket = age === null ? 'unknown' : (age < 12 ? 'under1' : (age < 36 ? '1to3' : (age < 60 ? '3to5' : 'over5')));
                    var aNames = { under1: 'ageUnder1', '1to3': 'age1to3', '3to5': 'age3to5', over5: 'ageOver5', unknown: 'ageUnknown' };
                    bump(bucket, L(aNames[bucket]), amount, bucket === 'unknown' ? '#C1C7D0' : null);
                } else if (group.indexOf('field:') === 0) {
                    var fieldKey = group.slice(6);
                    var value = '';
                    (asset.attributes || []).forEach(function (attribute) {
                        if (attribute.fieldKey === fieldKey) value = attribute.displayValue || attribute.value || '';
                    });
                    bump(value || '_none', value || L('repNoValue'), amount, value ? null : '#C1C7D0');
                }
            });
            if (def.group === 'created' && created.length) {
                created.sort();
                var first = parseDay(created[0] + '-01');
                var last = parseDay(created[created.length - 1] + '-01');
                var steps = 0;
                for (var cursor = first; cursor <= last && steps < 60; cursor = addMonths(cursor, 1, 1)) {
                    steps++;
                    var gap = cursor.getFullYear() + '-' + pad(cursor.getMonth() + 1);
                    bump(gap, monthLabel(gap), 0, '#0052CC');
                }
                return finish(buckets, order, true);
            }
            if (def.group === 'age') {
                var ageOrder = ['under1', '1to3', '3to5', 'over5', 'unknown'];
                order.sort(function (left, right) { return ageOrder.indexOf(left) - ageOrder.indexOf(right); });
                return finish(buckets, order, null);
            }
            return finish(buckets, order, false);
        }

        function finish(buckets, order, chronological) {
            var rows = order.map(function (key) { return buckets[key]; });
            if (chronological) rows.sort(function (left, right) { return left.key < right.key ? -1 : 1; });
            else if (chronological === false) rows.sort(function (left, right) { return right.value - left.value; });
            rows.forEach(function (row, index) {
                if (!row.color) row.color = CHART_COLORS[index % CHART_COLORS.length];
            });
            return rows;
        }

        function formatValue(def, value) {
            if (def.metric === 'cost' || def.metric === 'book') return money(value);
            return String(Math.round(value * 100) / 100);
        }

        function barChart(def, rows) {
            var box = el('div', 'asset-labs-bars');
            var max = 0;
            rows.forEach(function (row) { max = Math.max(max, row.value); });
            rows.forEach(function (row) {
                var line = el('div', 'asset-labs-barrow');
                line.appendChild(el('span', 'asset-labs-barlabel', row.label));
                var track = el('span', 'asset-labs-bartrack');
                var fillBar = el('span', 'asset-labs-barfill');
                fillBar.style.width = (max ? Math.max(1, row.value / max * 100) : 0) + '%';
                fillBar.style.background = row.color;
                track.appendChild(fillBar);
                line.appendChild(track);
                line.appendChild(el('span', 'asset-labs-barvalue', formatValue(def, row.value)));
                box.appendChild(line);
            });
            return box;
        }

        function donutChart(def, rows) {
            var box = el('div', 'asset-labs-donut');
            var total = 0;
            rows.forEach(function (row) { total += row.value; });
            var svg = svgEl('svg', { viewBox: '0 0 200 200', width: '200', height: '200' });
            var radius = 70;
            var length = 2 * Math.PI * radius;
            var offset = 0;
            svg.appendChild(svgEl('circle', { cx: '100', cy: '100', r: String(radius), fill: 'none', stroke: '#EBECF0', 'stroke-width': '34' }));
            rows.forEach(function (row) {
                if (!total || !row.value) return;
                var part = row.value / total * length;
                var arc = svgEl('circle', {
                    cx: '100', cy: '100', r: String(radius), fill: 'none', stroke: row.color, 'stroke-width': '34',
                    'stroke-dasharray': part + ' ' + (length - part), 'stroke-dashoffset': String(-offset), transform: 'rotate(-90 100 100)'
                });
                var tip = svgEl('title');
                tip.textContent = row.label + ': ' + formatValue(def, row.value);
                arc.appendChild(tip);
                svg.appendChild(arc);
                offset += part;
            });
            var center = svgEl('text', { x: '100', y: '96', 'class': 'asset-labs-donut-total' });
            center.textContent = formatValue(def, total);
            svg.appendChild(center);
            var caption = svgEl('text', { x: '100', y: '118', 'class': 'asset-labs-donut-caption' });
            caption.textContent = L('repTotal');
            svg.appendChild(caption);
            box.appendChild(svg);
            var legend = el('ul', 'asset-labs-legend');
            rows.forEach(function (row) {
                var item = el('li');
                var dot = el('span', 'asset-labs-dot');
                dot.style.background = row.color;
                item.appendChild(dot);
                item.appendChild(el('span', null, row.label));
                item.appendChild(el('strong', null, formatValue(def, row.value)));
                legend.appendChild(item);
            });
            box.appendChild(legend);
            return box;
        }

        function columnChart(def, rows) {
            var width = Math.max(480, rows.length * 56);
            var height = 240;
            var max = 0;
            rows.forEach(function (row) { max = Math.max(max, row.value, row.second || 0); });
            if (max > 0) {
                var raw = max / 4;
                var power = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
                var step = power;
                [1, 2, 5, 10].some(function (factor) {
                    step = factor * power;
                    return step >= raw;
                });
                if (step < 1) step = 1;
                max = step * 4;
            }
            var svg = svgEl('svg', { viewBox: '0 0 ' + width + ' ' + height, 'class': 'asset-labs-columns', preserveAspectRatio: 'xMinYMin meet' });
            var top = 16;
            var bottom = 36;
            var plot = height - top - bottom;
            for (var g = 0; g <= 4; g++) {
                var y = top + plot - plot * g / 4;
                svg.appendChild(svgEl('line', { x1: '30', x2: String(width), y1: String(y), y2: String(y), stroke: '#EBECF0' }));
                var tick = svgEl('text', { x: '24', y: String(y + 4), 'class': 'asset-labs-axis is-y' });
                tick.textContent = max ? String(Math.round(max * g / 4)) : '';
                svg.appendChild(tick);
            }
            var slot = (width - 40) / Math.max(1, rows.length);
            var dual = def.group === 'work';
            rows.forEach(function (row, index) {
                var x = 40 + slot * index;
                var bar = Math.min(32, slot * (dual ? 0.36 : 0.6));
                var h = max ? row.value / max * plot : 0;
                var rect = svgEl('rect', { x: String(x + (slot - (dual ? bar * 2 + 4 : bar)) / 2), y: String(top + plot - h), width: String(bar), height: String(h), fill: dual ? '#B3D4FF' : '#0052CC', rx: '2' });
                var tip = svgEl('title');
                tip.textContent = row.label + ': ' + formatValue(def, row.value);
                rect.appendChild(tip);
                svg.appendChild(rect);
                if (dual) {
                    var h2 = max ? row.second / max * plot : 0;
                    var done = svgEl('rect', { x: String(x + (slot - (bar * 2 + 4)) / 2 + bar + 4), y: String(top + plot - h2), width: String(bar), height: String(h2), fill: '#00875A', rx: '2' });
                    var tip2 = svgEl('title');
                    tip2.textContent = row.label + ': ' + L('workDone') + ' ' + row.second;
                    done.appendChild(tip2);
                    svg.appendChild(done);
                }
                var label = svgEl('text', { x: String(x + slot / 2), y: String(height - 14), 'class': 'asset-labs-axis' });
                label.textContent = row.label;
                svg.appendChild(label);
            });
            var box = el('div', 'asset-labs-columns-wrap');
            box.appendChild(svg);
            if (dual) {
                var legend = el('ul', 'asset-labs-legend is-row');
                [['#B3D4FF', L('workPlanned')], ['#00875A', L('workDone')]].forEach(function (pair) {
                    var item = el('li');
                    var dot = el('span', 'asset-labs-dot');
                    dot.style.background = pair[0];
                    item.appendChild(dot);
                    item.appendChild(el('span', null, pair[1]));
                    legend.appendChild(item);
                });
                box.appendChild(legend);
            }
            return box;
        }

        function resultTable(def, rows) {
            var total = 0;
            rows.forEach(function (row) { total += row.value; });
            var table = el('table', 'asset-labs-table');
            var head = el('tr');
            head.appendChild(el('th', null, groupLabel(def.group)));
            head.appendChild(el('th', 'is-num', def.metric === 'count' ? L('metricCount') : L(def.metric === 'cost' ? 'metricCost' : 'metricBook')));
            if (def.group === 'work') head.appendChild(el('th', 'is-num', L('workDone')));
            else head.appendChild(el('th', 'is-num', L('repShare')));
            var thead = el('thead');
            thead.appendChild(head);
            table.appendChild(thead);
            var body = el('tbody');
            rows.forEach(function (row) {
                var tr = el('tr');
                var name = el('td');
                var dot = el('span', 'asset-labs-dot');
                dot.style.background = row.color;
                name.appendChild(dot);
                name.appendChild(document.createTextNode(row.label));
                tr.appendChild(name);
                tr.appendChild(el('td', 'is-num', formatValue(def, row.value)));
                if (def.group === 'work') tr.appendChild(el('td', 'is-num', String(row.second)));
                else tr.appendChild(el('td', 'is-num', total ? Math.round(row.value / total * 1000) / 10 + ' %' : '—'));
                body.appendChild(tr);
            });
            var sum = el('tr', 'is-total');
            sum.appendChild(el('td', null, L('repTotal')));
            sum.appendChild(el('td', 'is-num', formatValue(def, total)));
            var secondTotal = 0;
            rows.forEach(function (row) { secondTotal += row.second || 0; });
            sum.appendChild(el('td', 'is-num', def.group === 'work' ? String(secondTotal) : '100 %'));
            body.appendChild(sum);
            table.appendChild(body);
            return table;
        }

        function downloadCsv(def, rows) {
            var lines = [[groupLabel(def.group), def.metric === 'count' ? L('metricCount') : L(def.metric === 'cost' ? 'metricCost' : 'metricBook')]];
            if (def.group === 'work') lines[0].push(L('workDone'));
            rows.forEach(function (row) {
                var line = [row.label, String(Math.round(row.value * 100) / 100)];
                if (def.group === 'work') line.push(String(row.second));
                lines.push(line);
            });
            var text = '\ufeff' + lines.map(function (line) {
                return line.map(function (cell) { return '"' + String(cell).replace(/"/g, '""') + '"'; }).join(';');
            }).join('\r\n');
            var blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
            var link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = (def.name || 'report').replace(/[\\/:*?"<>|]+/g, ' ') + '.csv';
            document.body.appendChild(link);
            link.click();
            setTimeout(function () {
                URL.revokeObjectURL(link.href);
                link.parentNode.removeChild(link);
            }, 0);
        }

        function renderReports(root) {
            var stored = docReady('reports');
            if (!stored) {
                betaBar(root, L('repTitle'));
                root.appendChild(el('p', 'asset-tree-hint', L('loading')));
                loadDoc('reports', rerender);
                return;
            }
            var tools = el('div', 'asset-labs-tools');
            if (canWrite()) tools.appendChild(button(L('repNew'), 'asset-tree-btn primary', function () { openReport(null); }));
            betaBar(root, L('repTitle'), tools);
            var layout = el('div', 'asset-labs-reports');
            var side = el('aside', 'asset-labs-report-list');
            var main = el('div', 'asset-labs-report-main');
            layout.appendChild(side);
            layout.appendChild(main);
            root.appendChild(layout);
            var def = reportById(ui.reports.id);
            ui.reports.id = def.id;
            function listSection(title, items) {
                side.appendChild(el('h3', null, title));
                items.forEach(function (item) {
                    var row = button(item.name, 'asset-labs-report-item' + (item.id === def.id ? ' is-active' : ''), function () {
                        ui.reports.id = item.id;
                        rerender();
                    });
                    side.appendChild(row);
                });
            }
            listSection(L('repBuiltIn'), builtIns());
            var custom = customReports();
            if (custom.length) listSection(L('repCustom'), custom);
            var missing = missingFor(def);
            var head = el('div', 'asset-labs-report-head');
            var titles = el('div');
            titles.appendChild(el('h3', null, def.name));
            var meta = [L('repGroup') + ': ' + groupLabel(def.group)];
            if (def.metric !== 'count') meta.push(L('repMetric') + ': ' + L(def.metric === 'cost' ? 'metricCost' : 'metricBook'));
            if (def.types && def.types.length) meta.push(L('repFilterType') + ': ' + def.types.map(function (key) { return api.typeOf(key).label; }).join(', '));
            if (def.statuses && def.statuses.length) meta.push(L('repFilterStatus') + ': ' + def.statuses.map(api.statusLabel).join(', '));
            titles.appendChild(el('p', 'asset-tree-hint', meta.join(' · ')));
            head.appendChild(titles);
            var actions = el('div', 'asset-labs-actions');
            head.appendChild(actions);
            main.appendChild(head);
            if (missing) {
                main.appendChild(el('p', 'asset-tree-hint', L('loading')));
                missing(rerender);
                return;
            }
            if (needsLife(def) && !on('lifecycle')) {
                main.appendChild(el('p', 'asset-labs-empty', L('repLifeNeeded')));
                return;
            }
            var rows = compute(def);
            actions.appendChild(button(L('repCsv'), 'asset-tree-btn', function () { downloadCsv(def, rows); }));
            if (!def.builtin && canWrite()) {
                actions.appendChild(button(L('edit'), 'asset-tree-btn', function () { openReport(def); }));
                actions.appendChild(button(L('delete'), 'asset-tree-btn subtle danger', function () {
                    if (!window.confirm(L('repDeleteAsk', def.name))) return;
                    var data = docReady('reports');
                    data.items = (data.items || []).filter(function (item) { return item.id !== def.id; });
                    ui.reports.id = 'byStatus';
                    saveDoc('reports', data, rerender);
                }));
            }
            var hasData = rows.some(function (row) { return row.value || row.second; });
            if (!hasData) {
                main.appendChild(el('p', 'asset-labs-empty', L('repEmpty')));
                return;
            }
            var chartBox = el('div', 'asset-labs-chart');
            if (def.chart === 'donut') chartBox.appendChild(donutChart(def, rows));
            else if (def.chart === 'line') chartBox.appendChild(columnChart(def, rows));
            else if (def.chart === 'bar') chartBox.appendChild(barChart(def, rows));
            if (chartBox.firstChild) main.appendChild(chartBox);
            main.appendChild(resultTable(def, rows));
            if (def.group !== 'work' && def.group !== 'writeoff') main.appendChild(el('p', 'asset-tree-hint', L('repEquipmentOnly')));
        }

        function multiPick(options, selected) {
            var box = el('div', 'asset-labs-multi');
            options.forEach(function (option) {
                var row = el('label', 'asset-labs-multi-item');
                var check = el('input');
                check.type = 'checkbox';
                check.value = option.value;
                check.checked = selected.indexOf(option.value) >= 0;
                row.appendChild(check);
                row.appendChild(el('span', null, option.label));
                box.appendChild(row);
            });
            box.values = function () {
                return Array.prototype.slice.call(box.querySelectorAll('input:checked')).map(function (node) { return node.value; });
            };
            return box;
        }

        function openReport(def) {
            var creating = !def;
            var draft = def ? JSON.parse(JSON.stringify(def)) : { id: uid('r'), name: '', group: 'type', chart: 'bar', metric: 'count', types: [], statuses: [] };
            api.openModal(function (dialog) {
                dialog.classList.add('asset-labs-wide-dialog');
                dialog.appendChild(el('h2', null, creating ? L('repNew') : L('edit')));
                var form = el('form', 'asset-labs-form');
                form.addEventListener('submit', function (event) { event.preventDefault(); });
                var name = textInput(draft.name, L('repName'));
                name.maxLength = 80;
                form.appendChild(field(L('repName'), name, true));
                var row = el('div', 'asset-labs-row');
                var group = selectInput(groupChoices(), draft.group);
                var chart = selectInput([
                    { value: 'bar', label: L('chartBar') }, { value: 'donut', label: L('chartDonut') },
                    { value: 'line', label: L('chartLine') }, { value: 'table', label: L('chartTable') }
                ], draft.chart);
                var metrics = [{ value: 'count', label: L('metricCount') }];
                if (on('lifecycle')) {
                    metrics.push({ value: 'cost', label: L('metricCost') });
                    metrics.push({ value: 'book', label: L('metricBook') });
                }
                var metric = selectInput(metrics, draft.metric);
                row.appendChild(field(L('repGroup'), group));
                row.appendChild(field(L('repChart'), chart));
                row.appendChild(field(L('repMetric'), metric));
                form.appendChild(row);
                var types = multiPick((state.types || []).filter(function (type) { return !type.location; }).map(function (type) {
                    return { value: type.typeKey, label: type.label };
                }), draft.types || []);
                var statuses = multiPick(api.statusChoices(), draft.statuses || []);
                var filters = el('div', 'asset-labs-row');
                filters.appendChild(field(L('repFilterType'), types, true));
                filters.appendChild(field(L('repFilterStatus'), statuses, true));
                form.appendChild(filters);
                var error = errorLine();
                form.appendChild(error);
                dialog.appendChild(form);
                dialogActions(dialog, L('save'), function () {
                    var title = name.value.replace(/^\s+|\s+$/g, '');
                    if (!title) {
                        error.show(L('repNeedName'));
                        return;
                    }
                    draft.name = title;
                    draft.group = group.value;
                    draft.chart = chart.value;
                    draft.metric = metric.value;
                    draft.types = types.values();
                    draft.statuses = statuses.values();
                    delete draft.builtin;
                    var data = docReady('reports') || { items: [] };
                    data.items = data.items || [];
                    if (creating) data.items.push(draft);
                    else {
                        for (var i = 0; i < data.items.length; i++) {
                            if (data.items[i].id === draft.id) data.items[i] = draft;
                        }
                    }
                    data.version = 1;
                    api.closeModal();
                    ui.reports.id = draft.id;
                    saveDoc('reports', data, rerender);
                });
            });
        }

        return {
            text: L,
            on: on,
            views: views,
            isView: isView,
            render: render,
            leaving: leaving,
            settingsBlock: settingsBlock,
            cardBlocks: cardBlocks,
            topActions: topActions,
            activityVerb: activityVerb
        };
    };
})();
