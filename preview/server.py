#!/usr/bin/env python3
"""In-memory preview of the asset tree.

This is not the Jira plugin. It serves the same page and REST contract.
Projects are not invented here: in Jira the list comes from the instance.
"""

import base64
import csv
import datetime
import json
import os
import re
import threading
import zipfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from io import BytesIO, StringIO
from xml.etree import ElementTree as ET
from urllib.parse import parse_qs, quote, unquote, urlparse

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RES = os.path.join(ROOT, "src", "main", "resources")
PORT = 47121
FILE_DIR = "/tmp/asset-tree-preview-files"
MAX_FILE_BYTES = 10 * 1024 * 1024
MAX_COMMENT = 10000
MAX_DEPTH = 40
PALETTE = ["#0F6E56", "#175CD3", "#6554C0", "#B54708", "#B42318", "#0E7090", "#363F72", "#087443"]
STATUSES = {"in_stock", "in_use", "repair", "reserve", "maintenance", "written_off", "active", "inactive", "retired"}
CANONICAL = {"active": "in_use", "inactive": "reserve", "retired": "written_off"}
DEFAULT_STATUSES = [
    ("in_stock", "asset-tree.ui.statusStock", "todo"),
    ("in_use", "asset-tree.ui.statusInUse", "progress"),
    ("repair", "asset-tree.ui.statusRepair", "progress"),
    ("reserve", "asset-tree.ui.statusReserve", "todo"),
    ("maintenance", "asset-tree.ui.statusMaintenance", "progress"),
    ("written_off", "asset-tree.ui.statusWrittenOff", "done"),
]
CATEGORY_COLOR = {
    "todo": "#4a6785", "progress": "#ffd351", "done": "#14892c",
    "blue": "#0052cc", "orange": "#ff8b00", "red": "#de350b", "purple": "#6554c0",
    "teal": "#00a3bf", "gray": "#6b778c", "pink": "#cd519d", "lime": "#36b37e", "brown": "#974f0c",
}
GROUPS = ["jira-administrators", "jira-servicedesk-users", "asset-keepers"]
ICONS = [
    "building", "warehouse", "department", "office", "hospital", "factory", "store", "home",
    "device", "desktop", "laptop", "monitor", "server", "printer", "scanner", "phone", "tablet",
    "camera", "network", "wifi", "storage", "keyboard", "projector", "battery",
    "medical", "microscope", "tool", "vehicle", "furniture", "box", "document", "tag",
]


def default_icon(location):
    return "building" if location else "device"


def resolve_icon(raw, location):
    icon = str(raw or "").strip().lower()
    if not icon:
        return default_icon(location)
    if icon not in ICONS:
        return None
    return icon
CAP_ORDER = ["view", "places", "types", "object", "assets", "admin"]
STATUS_KEY = re.compile(r"^[a-z][a-z0-9-]{0,39}$")

PROJECTS = [{"key": "TEST", "name": "test"}]
USERS = {
    "ivanov": {"userKey": "ivanov", "username": "ivanov", "displayName": "Иванов Сергей", "email": "ivanov@example.com", "phone": "+7 495 000-11-22", "department": "ИТ-поддержка", "title": "Инженер", "directory": "Active Directory", "active": True},
    "petrova": {"userKey": "petrova", "username": "petrova", "displayName": "Петрова Анна", "email": "petrova@example.com", "phone": "+7 495 000-33-44", "department": "Хирургия", "title": "Старшая медсестра", "directory": "Active Directory", "active": True},
    "smirnov": {"userKey": "smirnov", "username": "smirnov", "displayName": "Смирнов Олег", "email": "smirnov@example.com", "phone": "+7 812 000-55-66", "department": "Склад", "title": "Заведующий складом", "directory": "Active Directory", "active": True},
}
ISSUES = {
    "SD-14": {"issueId": 10014, "issueKey": "SD-14", "projectKey": "IT", "summary": "Не открывается почта на 3 этаже", "status": "В работе"},
    "SD-22": {"issueId": 10022, "issueKey": "SD-22", "projectKey": "IT", "summary": "Замена коммутатора в серверной", "status": "Открыта"},
    "MED-7": {"issueId": 20007, "issueKey": "MED-7", "projectKey": "MED", "summary": "Списать монитор после ремонта", "status": "Ожидание"},
    "STP-1": {"issueId": 30001, "issueKey": "STP-1", "projectKey": "TEST", "summary": "Aser", "status": "Ожидание поддержки"},
}
ISSUES_BY_ID = {item["issueId"]: item for item in ISSUES.values()}
SEEDS = [
    ("warehouse", "#175CD3", "warehouse", 0, True, [("address", "asset-tree.field.address", "text", True), ("phone", "asset-tree.field.phone", "text", False)]),
    ("branch", "#0E7090", "building", 1, True, [("address", "asset-tree.field.address", "text", True), ("phone", "asset-tree.field.phone", "text", False)]),
    ("department", "#6554C0", "department", 2, True, [("phone", "asset-tree.field.phone", "text", False)]),
    ("equipment", "#0F6E56", "device", 3, False, [("inventory", "asset-tree.field.inventory", "text", False), ("serial", "asset-tree.field.serial", "text", False)]),
]

LOCK = threading.Lock()
STATE = {
    "seq": 1, "assets": {}, "types": {}, "links": [], "checks": {},
    "portal_rules": [], "portal_seq": 1, "portal_demo": False,
    "comment_seq": 1, "file_seq": 1, "comments": {}, "files": {},
    "activity_seq": 1, "activities": {}, "statuses": {}, "grants": {},
}


def project_rights():
    return {
        "canEdit": True,
        "canChange": True,
        "canCreate": True,
        "canMove": True,
        "canRemove": True,
        "canComment": True,
        "canConfigure": True,
        "canGrant": True,
        "canPlaces": True,
        "canObjects": True,
        "canTypes": True,
        "canAssets": True,
        "canAdmin": True,
    }


def caps_from_level(level):
    if level in ("manage", "assets"):
        return "view,places,types,object,assets"
    if level == "admin":
        return ",".join(CAP_ORDER)
    if level == "edit":
        return "view,places,object"
    if level == "view":
        return "view"
    return ""


def normalize_caps(raw):
    chosen = set()
    for token in str(raw or "").split(","):
        token = token.strip()
        if token in ("create", "edit", "move", "remove", "comment"):
            chosen.update(("places", "object"))
        elif token == "schema":
            chosen.add("types")
        elif token == "access":
            chosen.add("assets")
        elif token in CAP_ORDER:
            chosen.add(token)
    if not chosen:
        return ""
    if "admin" in chosen:
        chosen.add("assets")
    if "assets" in chosen:
        chosen.update(("places", "types", "object"))
    if chosen - {"view"}:
        chosen.add("view")
    return ",".join(key for key in CAP_ORDER if key in chosen)


def level_of(caps):
    parts = {item for item in str(caps or "").split(",") if item}
    if "admin" in parts:
        return "admin"
    if "assets" in parts:
        return "assets"
    if parts & {"places", "types", "object"}:
        return "edit"
    return "view"


def unescape_properties(value):
    output = []
    index = 0
    while index < len(value):
        if value[index] == "\\" and index + 1 < len(value):
            code = value[index + 1]
            if code == "u" and index + 5 < len(value):
                output.append(chr(int(value[index + 2:index + 6], 16)))
                index += 6
                continue
            output.append({"n": "\n", "t": "\t", "r": "\r", "\\": "\\"}.get(code, code))
            index += 2
            continue
        output.append(value[index])
        index += 1
    return "".join(output)


def load_properties(path):
    result = {}
    if not os.path.exists(path):
        return result
    with open(path, "r", encoding="latin-1") as handle:
        for raw in handle:
            line = raw.strip()
            if not line or line.startswith("#") or line.startswith("!") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            result[key.strip()] = unescape_properties(value.strip())
    return result


def messages(lang):
    english = load_properties(os.path.join(RES, "i18n", "asset-tree.properties"))
    if lang.startswith("ru"):
        english.update(load_properties(os.path.join(RES, "i18n", "asset-tree_ru_RU.properties")))
    return english


def label_of(stored, text):
    if stored and stored.startswith("asset-tree."):
        return text.get(stored, stored)
    return stored


def canonical(status):
    return CANONICAL.get(status or "", status or "in_use")


def slug(label):
    builder = []
    dash = False
    for char in (label or "").strip().lower():
        if "a" <= char <= "z" or "0" <= char <= "9":
            builder.append(char)
            dash = False
        elif char in " -_." and builder and not dash:
            builder.append("-")
            dash = True
    text = "".join(builder).strip("-")[:40].strip("-")
    return text


def unique_key(base, taken):
    seed = base or ""
    if not seed or not ("a" <= seed[0] <= "z"):
        seed = "type" if not seed else "type-" + seed
    seed = seed[:40].strip("-") or "type"
    if seed not in taken:
        return seed
    index = 2
    while index < 10000:
        suffix = "-%s" % index
        head = seed
        if len(head) + len(suffix) > 40:
            head = head[:40 - len(suffix)].strip("-") or "type"
        candidate = head + suffix
        if candidate not in taken:
            return candidate
        index += 1
    return seed


def ensure_statuses(project_key, text):
    bucket = STATE["statuses"].setdefault(project_key, [])
    if bucket:
        return bucket
    for index, item in enumerate(DEFAULT_STATUSES):
        bucket.append({
            "statusKey": item[0],
            "label": text.get(item[1], item[0]),
            "category": item[2],
            "sortOrder": index,
        })
    return bucket


def status_dtos(project_key, text):
    rows = ensure_statuses(project_key, text)
    assets = project_assets(project_key)
    result = []
    for row in rows:
        count = len([asset for asset in assets if canonical(asset.get("status")) == row["statusKey"]])
        result.append({
            "statusKey": row["statusKey"],
            "label": row["label"],
            "category": row["category"],
            "sortOrder": row["sortOrder"],
            "assetCount": count,
        })
    return result


def status_known(project_key, status, text):
    key = canonical(status)
    return any(row["statusKey"] == key for row in ensure_statuses(project_key, text))


def ensure_portal_demo():
    if STATE.get("portal_demo"):
        return
    STATE["portal_demo"] = True

    def ensure_type(key, label, location, icon, order):
        if key not in STATE["types"]:
            STATE["types"][key] = {
                "typeKey": key, "projectKey": "TEST", "baseKey": key, "label": label,
                "color": "#0052CC", "icon": icon, "systemType": False, "location": location,
                "showInTree": location, "sortOrder": order, "fields": [],
            }

    ensure_type("test-place", "Площадка", True, "building", 10)
    ensure_type("test-dept", "Отделение", True, "department", 11)
    ensure_type("test-device", "Оборудование", False, "device", 12)
    place_a = add_asset("TEST", "test-place", "Площадка А", None, "in_use", None, {})
    place_b = add_asset("TEST", "test-place", "Площадка Б", None, "in_use", None, {})
    department = add_asset("TEST", "test-dept", "Отделение А", place_a, "in_use", None, {})
    add_asset("TEST", "test-device", "Аппарат", department, "in_use", None, {})
    add_asset("TEST", "test-device", "Принтер Б", place_b, "in_use", None, {})
    STATE["portal_rules"] = [
        {"id": 1, "assetId": place_a, "position": 1, "conditions": [{"field": "Площадка", "option": "Пункт А"}]},
        {"id": 2, "assetId": place_b, "position": 2, "conditions": [{"field": "Площадка", "option": "Пункт Б"}]},
        {"id": 3, "assetId": department, "position": 3, "conditions": [
            {"field": "Площадка", "option": "Пункт А"},
            {"field": "Отделение", "option": "Пункт А"},
        ]},
    ]
    STATE["portal_seq"] = 4


def portal_rule_dto(rule):
    asset = STATE["assets"].get(rule["assetId"])
    names = []
    cursor = asset
    guard = 0
    while cursor and guard < 40:
        names.insert(0, cursor["name"])
        cursor = STATE["assets"].get(cursor.get("parentId")) if cursor.get("parentId") else None
        guard += 1
    return {
        "id": rule["id"],
        "assetId": rule["assetId"],
        "assetName": asset["name"] if asset else "",
        "assetPath": " / ".join(names),
        "position": rule["position"],
        "conditions": rule["conditions"],
    }


def seed_types(project_key):
    for base, color, icon, order, location, fields in SEEDS:
        type_key = "%s-%s" % (project_key.lower(), base)
        if type_key not in STATE["types"]:
            STATE["types"][type_key] = {
                "typeKey": type_key, "projectKey": project_key, "baseKey": base, "label": base,
                "color": color, "icon": icon, "systemType": True, "location": location, "showInTree": location,
                "sortOrder": order,
                "fields": [{"fieldKey": item[0], "label": item[1], "kind": item[2], "required": item[3], "position": index} for index, item in enumerate(fields)],
            }


def add_asset(project, type_key, name, parent, status, custodian, values):
    asset_id = STATE["seq"]
    STATE["seq"] += 1
    STATE["assets"][asset_id] = {
        "id": asset_id, "objectKey": "AST-%s" % asset_id, "projectKey": project, "name": name,
        "description": "", "typeKey": type_key, "status": status, "parentId": parent,
        "sortOrder": asset_id, "custodianKey": custodian, "created": "2026-09-26T09:00:00Z",
        "updated": "2026-09-26T09:00:00Z", "values": values,
    }
    return asset_id


def seed():
    return


def normalize_parent(parent_id):
    if parent_id in (None, "", 0):
        return None
    return int(parent_id)


def project_assets(project_key):
    return [asset for asset in STATE["assets"].values() if asset["projectKey"] == project_key]


def parent_map(rows):
    return {asset["id"]: normalize_parent(asset["parentId"]) for asset in rows}


def children_map(rows):
    children = {}
    for asset in rows:
        parent = normalize_parent(asset["parentId"])
        if parent is not None:
            children.setdefault(parent, []).append(asset["id"])
    return children


def would_cycle(rows, moving_id, new_parent):
    parents = parent_map(rows)
    cursor = new_parent
    guard = 0
    while cursor is not None and guard < 80:
        if cursor == moving_id:
            return True
        cursor = parents.get(cursor)
        guard += 1
    return False


def descendants(rows, asset_id):
    children = children_map(rows)
    ordered = []

    def walk(current):
        for child in children.get(current, []):
            ordered.append(child)
            walk(child)

    walk(asset_id)
    return ordered


def depth(rows, asset_id):
    parents = parent_map(rows)
    seen = 0
    cursor = parents.get(asset_id)
    while cursor is not None and seen < 80:
        seen += 1
        cursor = parents.get(cursor)
    return seen


def subtree_height(rows, asset_id):
    children = children_map(rows)

    def height(current):
        kids = children.get(current, [])
        return 0 if not kids else 1 + max(height(child) for child in kids)

    return height(asset_id)


def location_of(asset):
    names = []
    parent = normalize_parent(asset["parentId"])
    guard = 0
    while parent and guard < 80:
        node = STATE["assets"].get(parent)
        if not node:
            break
        names.insert(0, node["name"])
        parent = normalize_parent(node["parentId"])
        guard += 1
    return " / ".join(names)


def type_row(type_key):
    return STATE["types"].get(type_key)


def canonical_date(value):
    text = (value or "").strip()
    if not text:
        return ""
    patterns = (
        (r"^(\d{4})-(\d{2})-(\d{2})$", "iso"),
        (r"^(\d{1,2})\.(\d{1,2})\.(\d{4})$", "dmy"),
        (r"^(\d{1,2})\.(\d{1,2})\.(\d{2})$", "short"),
    )
    for pattern, shape in patterns:
        match = re.fullmatch(pattern, text)
        if not match:
            continue
        if shape == "iso":
            year, month, day = int(match.group(1)), int(match.group(2)), int(match.group(3))
        elif shape == "dmy":
            year, month, day = int(match.group(3)), int(match.group(2)), int(match.group(1))
        else:
            yy = int(match.group(3))
            year = 2000 + yy if yy <= 69 else 1900 + yy
            month, day = int(match.group(2)), int(match.group(1))
        if year < 1900 or year > 2199:
            return None
        try:
            return datetime.date(year, month, day).isoformat()
        except ValueError:
            return None
    return None


def type_dto(row, text, rows):
    label = row["label"]
    if row["systemType"] and row.get("baseKey"):
        label = text.get("asset-tree.type." + row["baseKey"], label)
    count = len([asset for asset in rows if asset["typeKey"] == row["typeKey"]])
    return {
        "typeKey": row["typeKey"], "projectKey": row["projectKey"], "label": label, "color": row["color"],
        "icon": row.get("icon") if row.get("icon") in ICONS else default_icon(row["location"]),
        "systemType": row["systemType"], "location": row["location"],
        "placeCaption": (row.get("placeCaption") or "") if row.get("location") else "",
        "showInTree": bool(row.get("location") or row.get("showInTree")), "assetCount": count,
        "fields": [{
            "fieldKey": field["fieldKey"], "label": label_of(field["label"], text), "kind": field["kind"],
            "required": field["required"], "position": field["position"],
        } for field in row["fields"]],
    }


def asset_dto(asset, text, with_issues):
    row = type_row(asset["typeKey"]) or {"label": asset["typeKey"], "color": "#5D6B82", "fields": [], "systemType": False, "baseKey": "", "location": False, "projectKey": asset["projectKey"]}
    typed = type_dto(row, text, project_assets(asset["projectKey"])) if asset["typeKey"] in STATE["types"] else {
        "label": asset["typeKey"], "color": "#5D6B82", "icon": default_icon(False), "fields": [], "location": False
    }
    attributes = []
    for field in typed["fields"]:
        attributes.append({
            "fieldKey": field["fieldKey"], "name": field["label"], "kind": field["kind"],
            "required": field["required"], "value": asset["values"].get(field["fieldKey"], ""),
        })
    holder = USERS.get(asset.get("custodianKey") or "")
    dto = {
        "id": asset["id"], "objectKey": asset["objectKey"], "name": asset["name"], "description": asset["description"],
        "typeKey": asset["typeKey"], "typeLabel": typed["label"], "color": typed["color"], "icon": typed["icon"],
        "status": canonical(asset["status"]), "parentId": normalize_parent(asset["parentId"]),
        "sortOrder": asset["sortOrder"], "created": asset["created"], "updated": asset["updated"],
        "createdBy": USERS["ivanov"]["displayName"], "updatedBy": USERS["ivanov"]["displayName"], "projectKey": asset["projectKey"],
        "projectName": next(item["name"] for item in PROJECTS if item["key"] == asset["projectKey"]),
        "location": location_of(asset), "editable": True, "custodian": holder, "attributes": attributes,
    }
    if with_issues:
        dto["issues"] = [dict(ISSUES_BY_ID[link["issueId"]]) for link in STATE["links"] if link["assetId"] == asset["id"] and link["issueId"] in ISSUES_BY_ID]
        dto["comments"] = [comment_dto(row) for row in comments_of(asset["id"])]
        dto["files"] = [file_dto(row) for row in files_of(asset["id"])]
        dto["activities"] = [activity_dto(row) for row in activities_of(asset["id"])]
    return dto


def now_stamp():
    return datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")


def comments_of(asset_id):
    rows = [row for row in STATE["comments"].values() if row["assetId"] == asset_id]
    rows.sort(key=lambda item: (item["created"], item["id"]))
    return rows


def files_of(asset_id):
    rows = [row for row in STATE["files"].values() if row["assetId"] == asset_id]
    rows.sort(key=lambda item: (item["created"], item["id"]))
    return rows


def comment_dto(row):
    author = USERS.get(row.get("authorKey") or "")
    if not author:
        author = {"userKey": row.get("authorKey") or "", "displayName": row.get("authorKey") or "", "active": False}
    return {"id": row["id"], "body": row["body"], "created": row["created"], "author": author}


def activities_of(asset_id):
    rows = [row for row in STATE["activities"].values() if row["assetId"] == asset_id]
    rows.sort(key=lambda item: (item["created"], item["id"]))
    return rows


def activity_dto(row):
    author = USERS.get(row.get("authorKey") or "")
    if not author:
        author = {"userKey": row.get("authorKey") or "", "displayName": row.get("authorKey") or "Preview", "active": False}
    return {
        "id": row["id"], "action": row["action"], "field": row.get("field") or "",
        "oldValue": row.get("oldValue") or "", "newValue": row.get("newValue") or "",
        "created": row["created"], "author": author,
    }


def record_activity(asset_id, kind, field, old_value, new_value):
    activity_id = STATE["activity_seq"]
    STATE["activity_seq"] += 1
    STATE["activities"][activity_id] = {
        "id": activity_id, "assetId": asset_id, "authorKey": "ivanov",
        "action": kind, "field": field or "", "oldValue": (old_value or "")[:500], "newValue": (new_value or "")[:500],
        "created": now_stamp(),
    }


def log_activity(asset_id, kind, field, old_value, new_value):
    left = old_value or ""
    right = new_value or ""
    if left == right:
        return
    record_activity(asset_id, kind, field, left, right)


def is_location_id(asset_id):
    asset = STATE["assets"].get(asset_id)
    if not asset:
        return False
    return bool((STATE["types"].get(asset["typeKey"]) or {}).get("location"))


def place_container(start_id, skip=None):
    current = normalize_parent(start_id)
    seen = set()
    skipped = skip or set()
    while current and current not in seen:
        seen.add(current)
        asset = STATE["assets"].get(current)
        if current in skipped:
            current = normalize_parent(asset.get("parentId")) if asset else None
            continue
        if is_location_id(current):
            return current
        current = normalize_parent(asset.get("parentId")) if asset else None
    return None


def log_place(place_id, kind, child):
    if not place_id or not child:
        return
    key = child.get("objectKey") or ""
    name = child.get("name") or ""
    if kind in ("place_add", "place_in"):
        record_activity(place_id, kind, key, "", name)
    else:
        record_activity(place_id, kind, key, name, "")


def file_dto(row):
    author = USERS.get(row.get("authorKey") or "")
    return {
        "id": row["id"], "fileName": row["fileName"], "contentType": row["contentType"],
        "size": row["size"], "created": row["created"],
        "authorName": author["displayName"] if author else "",
    }


def safe_file_name(raw):
    name = (raw or "").strip().replace("\\", "/").split("/")[-1]
    if not name or name in (".", ".."):
        return None
    if len(name) > 180:
        name = name[-180:]
    return name


def preview_file_path(file_id):
    return os.path.join(FILE_DIR, str(file_id))


def write_preview_file(file_id, data):
    os.makedirs(FILE_DIR, exist_ok=True)
    with open(preview_file_path(file_id), "wb") as handle:
        handle.write(data)


def delete_preview_file(file_id):
    path = preview_file_path(file_id)
    if os.path.isfile(path):
        os.remove(path)


def multipart_token(value):
    semi = value.find(";")
    return value[:semi].strip() if semi >= 0 else value.strip()


def multipart_unquote(value):
    if value is None:
        return None
    text = value.strip()
    if text.startswith('"') and text.endswith('"') and len(text) > 1:
        text = text[1:-1]
    return text


def multipart_decode_star(value):
    text = multipart_unquote(value) or ""
    mark = text.find("''")
    if mark >= 0:
        text = text[mark + 2:]
    return unquote(text)


def multipart_filename(headers):
    plain = None
    encoded = None
    for line in re.split(r"\r?\n", headers):
        lower = line.lower()
        if not lower.startswith("content-disposition:"):
            continue
        starred = lower.find("filename*=")
        if starred >= 0:
            encoded = multipart_token(line[starred + len("filename*="):].strip())
        named = lower.find("filename=")
        if named >= 0 and (starred < 0 or named < starred):
            plain = multipart_token(line[named + len("filename="):].strip())
    chosen = multipart_decode_star(encoded) if encoded else multipart_unquote(plain)
    if not chosen:
        return None
    return chosen.replace("\\", "/").split("/")[-1]


def multipart_content_type(headers):
    for line in re.split(r"\r?\n", headers):
        if line.lower().startswith("content-type:"):
            value = line.split(":", 1)[1].strip()
            semi = value.find(";")
            return (value[:semi] if semi >= 0 else value).strip() or "application/octet-stream"
    return "application/octet-stream"


def parse_multipart(body, content_type):
    if not body or not content_type:
        return None
    lowered = content_type.lower()
    at = lowered.find("boundary=")
    if at < 0:
        return None
    boundary = content_type[at + len("boundary="):].strip()
    if boundary.startswith('"') and boundary.endswith('"') and len(boundary) > 1:
        boundary = boundary[1:-1]
    semi = boundary.find(";")
    if semi >= 0:
        boundary = boundary[:semi].strip()
    if not boundary:
        return None
    fence = ("--" + boundary).encode("latin-1", "replace")
    separator = b"\r\n" + fence
    cursor = body.find(fence)
    if cursor < 0:
        return None
    cursor += len(fence)
    while cursor < len(body):
        if cursor + 1 < len(body) and body[cursor:cursor + 2] == b"--":
            break
        if cursor < len(body) and body[cursor:cursor + 1] == b"\r":
            cursor += 2
        elif cursor < len(body) and body[cursor:cursor + 1] == b"\n":
            cursor += 1
        header_end = body.find(b"\r\n\r\n", cursor)
        gap = 4
        if header_end < 0:
            header_end = body.find(b"\n\n", cursor)
            gap = 2
        if header_end < 0:
            return None
        headers = body[cursor:header_end].decode("latin-1", "replace")
        data_start = header_end + gap
        next_at = body.find(separator, data_start)
        data_end = next_at
        step = len(separator)
        if next_at < 0:
            next_at = body.find(fence, data_start)
            data_end = next_at
            step = len(fence)
            if data_end >= 2 and body[data_end - 2:data_end] == b"\r\n":
                data_end -= 2
            elif data_end >= 1 and body[data_end - 1:data_end] == b"\n":
                data_end -= 1
        if data_end < 0:
            data_end = len(body)
            step = 0
            next_at = len(body)
        if data_end < data_start:
            return None
        file_name = multipart_filename(headers)
        if file_name:
            return file_name, multipart_content_type(headers), body[data_start:data_end]
        cursor = next_at + step
    return None


def equipment_headers(text):
    return [
        text.get("asset-tree.ui.keyLabel", "Key"),
        text.get("asset-tree.ui.name", "Name"),
        text.get("asset-tree.ui.type", "Type"),
        text.get("asset-tree.ui.status", "Status"),
        text.get("asset-tree.ui.exchangePlace", "Place"),
        text.get("asset-tree.ui.custodian", "Custodian"),
        text.get("asset-tree.ui.description", "Description"),
    ]


def display_date(value, day_first):
    iso = canonical_date(value)
    if not iso:
        return value or ""
    if not day_first:
        return iso
    year, month, day = iso.split("-")
    return "%s.%s.%s" % (day, month, year)


def equipment_table(project_key, text, day_first):
    headers = equipment_headers(text)
    statuses = {row["statusKey"]: row["label"] for row in status_dtos(project_key, text)}
    types = {row["typeKey"]: row for row in STATE["types"].values() if row["projectKey"] == project_key}
    fields = []
    seen = {header.strip().lower() for header in headers}
    for kind in types.values():
        if kind.get("location"):
            continue
        for field in kind.get("fields") or []:
            label = label_of(field["label"], text)
            marker = label.strip().lower()
            if not marker or marker in seen:
                continue
            seen.add(marker)
            fields.append((field, label))
            headers.append(label)
    assets = [asset for asset in project_assets(project_key) if not (types.get(asset["typeKey"]) or {}).get("location")]
    assets.sort(key=lambda item: item["objectKey"])
    lines = []
    for asset in assets:
        kind = types.get(asset["typeKey"]) or {}
        person = USERS.get(asset.get("custodianKey") or "")
        line = [
            asset["objectKey"],
            asset["name"],
            kind.get("label") or asset["typeKey"],
            statuses.get(canonical(asset.get("status")), asset.get("status") or ""),
            location_of(asset),
            person["displayName"] if person else "",
            asset.get("description") or "",
        ]
        values = asset.get("values") or {}
        for field, _label in fields:
            value = values.get(field["fieldKey"]) or ""
            if field.get("kind") == "date" and value:
                value = display_date(value, day_first)
            line.append(value)
        lines.append(line)
    return headers, lines


def equipment_csv(project_key, text):
    headers, rows = equipment_table(project_key, text, True)
    buffer = StringIO()
    buffer.write("\ufeff")
    writer = csv.writer(buffer, delimiter=";", lineterminator="\n")
    writer.writerow(headers)
    writer.writerows(rows)
    return buffer.getvalue()


def xml_text(value):
    text = value or ""
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def column_name(index):
    name = ""
    number = index + 1
    while number:
        number, rem = divmod(number - 1, 26)
        name = chr(65 + rem) + name
    return name


def workbook_bytes(headers, rows):
    sheet = ["<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>",
             "<worksheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\"><sheetData>"]
    table = [headers] + rows
    for number, cells in enumerate(table, start=1):
        sheet.append("<row r=\"%d\">" % number)
        for index, cell in enumerate(cells):
            sheet.append("<c r=\"%s%d\" t=\"inlineStr\"><is><t xml:space=\"preserve\">%s</t></is></c>"
                         % (column_name(index), number, xml_text(cell)))
        sheet.append("</row>")
    sheet.append("</sheetData></worksheet>")
    parts = {
        "[Content_Types].xml": """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>""",
        "_rels/.rels": """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>""",
        "xl/workbook.xml": """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="Equipment" sheetId="1" r:id="rId1"/></sheets></workbook>""",
        "xl/_rels/workbook.xml.rels": """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>""",
        "xl/styles.xml": """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
<borders count="1"><border/></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
</styleSheet>""",
        "xl/worksheets/sheet1.xml": "".join(sheet),
    }
    buffer = BytesIO()
    with zipfile.ZipFile(buffer, "w", compression=zipfile.ZIP_DEFLATED) as book:
        for name, xml in parts.items():
            book.writestr(name, xml.encode("utf-8"))
    return buffer.getvalue()


def equipment_xlsx(project_key, text, day_first):
    headers, rows = equipment_table(project_key, text, day_first)
    return workbook_bytes(headers, rows)


def xml_local(tag):
    return tag.rsplit("}", 1)[-1]


def column_index(ref):
    column = 0
    used = 0
    for ch in ref or "":
        if "A" <= ch <= "Z" or "a" <= ch <= "z":
            column = column * 26 + (ord(ch.upper()) - 64)
            used += 1
        else:
            break
    return column - 1 if used else -1


def plain_number(raw):
    try:
        value = float(raw)
    except ValueError:
        return raw
    if abs(value) < 1e15 and abs(value - round(value)) < 1e-6:
        return str(int(round(value)))
    return raw


def excel_date(raw):
    try:
        days = int(float(raw))
        return (datetime.date(1970, 1, 1) + datetime.timedelta(days=days - 25569)).isoformat()
    except (ValueError, OverflowError):
        return raw


def parse_workbook(data):
    with zipfile.ZipFile(BytesIO(data)) as book:
        names = {}
        for name in book.namelist():
            names[name.replace("\\", "/").lstrip("/")] = name
        shared = []
        if "xl/sharedStrings.xml" in names:
            root = ET.fromstring(book.read(names["xl/sharedStrings.xml"]))
            for node in root:
                if xml_local(node.tag) != "si":
                    continue
                parts = []
                for child in node.iter():
                    if xml_local(child.tag) == "t" and child.text:
                        parts.append(child.text)
                shared.append("".join(parts))
        sheet_name = names.get("xl/worksheets/sheet1.xml")
        if not sheet_name:
            for key, original in names.items():
                if key.startswith("xl/worksheets/") and key.endswith(".xml"):
                    sheet_name = original
                    break
        if not sheet_name:
            raise ValueError("sheet")
        root = ET.fromstring(book.read(sheet_name))
    headers = []
    records = []
    for row in root.iter():
        if xml_local(row.tag) != "row":
            continue
        cells = {}
        next_column = 0
        for cell in list(row):
            if xml_local(cell.tag) != "c":
                continue
            column = column_index(cell.attrib.get("r"))
            if column < 0:
                column = next_column
            cells[column] = workbook_cell(cell, shared)
            next_column = column + 1
        if not cells:
            continue
        line = [cells.get(index, "") for index in range(max(cells) + 1)]
        if not any(item.strip() for item in line):
            continue
        if not headers:
            headers = [item.strip() for item in line]
        else:
            try:
                number = int(row.attrib.get("r") or 0)
            except ValueError:
                number = 0
            records.append((number or len(records) + 2, line))
    return headers, records


def workbook_cell(cell, shared):
    kind = cell.attrib.get("t")
    texts = []
    value = ""
    for node in cell.iter():
        name = xml_local(node.tag)
        if name == "t" and node.text:
            texts.append(node.text)
        elif name == "v" and node.text:
            value = node.text.strip()
    if kind == "inlineStr" or (texts and kind != "s" and not value):
        return "".join(texts)
    if kind == "s":
        try:
            index = int(value)
        except ValueError:
            return ""
        return shared[index] if 0 <= index < len(shared) else ""
    if kind == "b":
        return "true" if value == "1" else "false"
    if kind == "str" or not value:
        return value or "".join(texts)
    return plain_number(value)


def parse_sheet(source):
    text = source or ""
    if text.startswith("\ufeff"):
        text = text[1:]
    sample = text.splitlines()[0] if text.splitlines() else ""
    delimiter = ";" if sample.count(";") >= sample.count(",") and ";" in sample else ","
    rows = list(csv.reader(StringIO(text), delimiter=delimiter))
    while rows and not any(cell.strip() for cell in rows[0]):
        rows.pop(0)
    if not rows:
        return [], []
    headers = [cell.strip() for cell in rows[0]]
    records = []
    for index, cells in enumerate(rows[1:], start=2):
        if any(cell.strip() for cell in cells):
            records.append((index, cells))
    return headers, records


def sheet_role(header):
    name = " ".join((header or "").strip().lower().replace("ё", "е").split())
    roles = {
        "key": "key", "ключ": "key",
        "name": "name", "название": "name", "имя": "name",
        "type": "type", "тип": "type",
        "status": "status", "статус": "status",
        "place": "place", "площадка": "place", "место": "place",
        "custodian": "custodian", "ответственный": "custodian", "мол": "custodian",
        "description": "description", "описание": "description",
    }
    return roles.get(name)


def find_preview_user(raw):
    text = (raw or "").strip().lower()
    if not text:
        return None
    matches = []
    for user in USERS.values():
        if text in {user["userKey"].lower(), user["username"].lower(), user["email"].lower(), user["displayName"].lower()}:
            matches.append(user["userKey"])
    if len(matches) == 1:
        return matches[0]
    return ""


def find_preview_place(project_key, path):
    parts = [part.strip() for part in (path or "").split("/") if part.strip()]
    if not parts:
        return None
    parent = None
    types = {row["typeKey"]: row for row in STATE["types"].values()}
    for part in parts:
        matches = []
        for asset in project_assets(project_key):
            kind = types.get(asset["typeKey"]) or {}
            if not kind.get("location") or asset["name"].lower() != part.lower():
                continue
            if normalize_parent(asset["parentId"]) == parent:
                matches.append(asset)
        if len(matches) != 1:
            return None
        parent = matches[0]["id"]
    return parent


def import_request(project_key, body, text):
    body = body or {}
    content = body.get("content") or ""
    if content:
        try:
            data = base64.b64decode(content)
        except Exception:
            message = text.get("asset-tree.error.import.workbook", "Workbook")
            return {"created": 0, "updated": 0, "errors": [{"row": 1, "message": message}]}
        name = (body.get("name") or "").lower()
        if data[:4] == b"\xd0\xcf\x11\xe0" or (name.endswith(".xls") and not name.endswith(".xlsx")):
            message = text.get("asset-tree.error.import.workbook", "Workbook")
            return {"created": 0, "updated": 0, "errors": [{"row": 1, "message": message}]}
        if data[:2] == b"PK":
            try:
                headers, records = parse_workbook(data)
            except Exception:
                message = text.get("asset-tree.error.import.workbook", "Workbook")
                return {"created": 0, "updated": 0, "errors": [{"row": 1, "message": message}]}
            return import_rows(project_key, headers, records, text)
        source = data.decode("utf-8", "replace")
    else:
        source = body.get("csv") or ""
    headers, records = parse_sheet(source)
    return import_rows(project_key, headers, records, text)


def import_equipment(project_key, source, text):
    headers, records = parse_sheet(source)
    return import_rows(project_key, headers, records, text)


def import_rows(project_key, headers, records, text):
    roles = {}
    for index, header in enumerate(headers):
        role = sheet_role(header)
        if role:
            roles[role] = index
    if "name" not in roles:
        return {"created": 0, "updated": 0, "errors": [{"row": 1, "message": text.get("asset-tree.error.import.header", "Header")}]}
    if not records:
        return {"created": 0, "updated": 0, "errors": [{"row": 1, "message": text.get("asset-tree.error.import.empty", "Empty")}]}
    types = [row for row in STATE["types"].values() if row["projectKey"] == project_key]
    statuses = status_dtos(project_key, text)
    by_key = {asset["objectKey"].lower(): asset for asset in project_assets(project_key)}
    created = 0
    updated = 0
    errors = []
    seen = set()

    def cell(cells, role):
        index = roles.get(role)
        if index is None or index >= len(cells):
            return ""
        return cells[index].strip()

    for row_number, cells in records:
        name = cell(cells, "name")
        key = cell(cells, "key")
        type_name = cell(cells, "type")
        status_name = cell(cells, "status")
        place = cell(cells, "place")
        custodian_name = cell(cells, "custodian")
        description = cell(cells, "description")
        has_custodian = "custodian" in roles
        has_description = "description" in roles
        if not name:
            errors.append({"row": row_number, "message": text.get("asset-tree.error.import.name", "Name")})
            continue
        existing = None
        if key:
            marker = key.lower()
            if marker in seen:
                errors.append({"row": row_number, "message": text.get("asset-tree.error.import.key.duplicate", "Duplicate").replace("{0}", key)})
                continue
            seen.add(marker)
            existing = by_key.get(marker)
            if not existing:
                errors.append({"row": row_number, "message": text.get("asset-tree.error.import.key", "Key").replace("{0}", key)})
                continue
        kind = None
        for item in types:
            if not item.get("location") and type_name.lower() in {item["label"].lower(), item["typeKey"].lower()}:
                kind = item
                break
        if not kind:
            errors.append({"row": row_number, "message": text.get("asset-tree.error.import.type", "Type").replace("{0}", type_name)})
            continue
        status_key = ""
        if not status_name:
            status_key = "in_use"
        else:
            for status in statuses:
                if status_name.lower() in {status["label"].lower(), status["statusKey"].lower()}:
                    status_key = status["statusKey"]
                    break
        if not status_key:
            errors.append({"row": row_number, "message": text.get("asset-tree.error.import.status", "Status").replace("{0}", status_name)})
            continue
        parent = find_preview_place(project_key, place)
        if not parent:
            message = text.get("asset-tree.error.import.place.required" if not place else "asset-tree.error.import.place", "Place")
            errors.append({"row": row_number, "message": message.replace("{0}", place)})
            continue
        custodian = None
        if custodian_name:
            custodian = find_preview_user(custodian_name)
            if not custodian:
                errors.append({"row": row_number, "message": text.get("asset-tree.error.import.user", "User").replace("{0}", custodian_name)})
                continue
        if existing:
            old_parent = normalize_parent(existing.get("parentId"))
            existing["name"] = name
            existing["typeKey"] = kind["typeKey"]
            existing["status"] = status_key
            existing["parentId"] = parent
            existing["updated"] = now_stamp()
            if has_description:
                existing["description"] = description
            if has_custodian:
                existing["custodianKey"] = custodian
            if old_parent != parent:
                from_place = place_container(old_parent)
                to_place = place_container(parent)
                old_name = STATE["assets"].get(old_parent, {}).get("name", "") if old_parent else ""
                new_name = STATE["assets"].get(parent, {}).get("name", "") if parent else ""
                log_activity(existing["id"], "move", "", old_name, new_name)
                if from_place and from_place != to_place:
                    log_place(from_place, "place_out", existing)
                if to_place and to_place != from_place:
                    log_place(to_place, "place_in", existing)
            updated += 1
        else:
            asset_id = add_asset(project_key, kind["typeKey"], name, parent, status_key, custodian, {})
            STATE["assets"][asset_id]["description"] = description
            by_key[STATE["assets"][asset_id]["objectKey"].lower()] = STATE["assets"][asset_id]
            log_activity(asset_id, "created", "", "", name)
            log_place(place_container(parent), "place_add", STATE["assets"][asset_id])
            created += 1
    return {"created": created, "updated": updated, "errors": errors}


def bulk_parents(project_key):
    return {asset["id"]: normalize_parent(asset.get("parentId")) for asset in project_assets(project_key)}


def bulk_roots(ids, parents):
    selected = set(ids)
    roots = []
    for item in ids:
        parent = parents.get(item)
        seen = set()
        covered = False
        while parent:
            if parent in selected:
                covered = True
                break
            if parent in seen:
                break
            seen.add(parent)
            parent = parents.get(parent)
        if not covered:
            roots.append(item)
    return roots


def bulk_depth(item, parents):
    level = 0
    parent = parents.get(item)
    seen = set()
    while parent and parent not in seen:
        seen.add(parent)
        level += 1
        parent = parents.get(parent)
    return level


def bulk_under(item, ancestor, parents):
    parent = parents.get(item)
    seen = set()
    while parent:
        if parent == ancestor:
            return True
        if parent in seen:
            return False
        seen.add(parent)
        parent = parents.get(parent)
    return False


def bulk_apply(project_key, body, text):
    body = body or {}
    action = (body.get("action") or "").strip()
    target = (body.get("target") or "").strip()
    if target == "type":
        return bulk_types(project_key, action, body.get("keys") or [], text)
    if target != "asset" or action not in ("delete", "move", "status", "custodian"):
        return 400, {"message": text.get("asset-tree.error.bulk.action", "Action")}
    ids = []
    seen = set()
    for raw in body.get("ids") or []:
        try:
            item = int(raw)
        except (TypeError, ValueError):
            continue
        if item > 0 and item not in seen:
            seen.add(item)
            ids.append(item)
    if not ids:
        return 400, {"message": text.get("asset-tree.error.bulk.empty", "Empty")}
    if len(ids) > 200:
        return 400, {"message": text.get("asset-tree.error.bulk.limit", "Limit").replace("{0}", "200")}
    if action == "move" and not body.get("toRoot") and not normalize_parent(body.get("parentId")):
        return 400, {"message": text.get("asset-tree.error.import.place.required", "Place")}
    parents = bulk_parents(project_key)
    outermost = action == "move" or (action == "delete" and body.get("cascade"))
    order = bulk_roots(ids, parents) if outermost else sorted(ids, key=lambda item: -bulk_depth(item, parents))
    covered = set()
    errors = []
    for item in order:
        asset = STATE["assets"].get(item)
        label = asset["name"] if asset else str(item)
        if asset and asset["projectKey"] != project_key:
            errors.append({"label": label, "message": text.get("asset-tree.error.project.mismatch", "Project")})
            continue
        if not asset:
            if outermost:
                covered.add(item)
            continue
        kind = next((row for row in STATE["types"].values() if row["typeKey"] == asset["typeKey"]), {})
        if action in ("status", "custodian") and kind.get("location"):
            errors.append({"label": label, "message": text.get("asset-tree.error.bulk.place", "Place").replace("{0}", label)})
            continue
        if action == "delete":
            status, payload = Handler.delete_asset(Handler, item, bool(body.get("cascade")), text)
            if status >= 400:
                errors.append({"label": label, "message": (payload or {}).get("message") or ""})
                continue
        elif action == "move":
            move = {"parentId": None if body.get("toRoot") else body.get("parentId")}
            status, payload = Handler.move_asset(Handler, item, move, text)
            if status >= 400:
                errors.append({"label": label, "message": (payload or {}).get("message") or ""})
                continue
        elif action == "status":
            asset["status"] = canonical(body.get("status") or "in_use")
            asset["updated"] = now_stamp()
        else:
            key = (body.get("custodianKey") or "").strip()
            asset["custodianKey"] = key or None
            asset["updated"] = now_stamp()
        covered.add(item)
        if outermost:
            for other in ids:
                if bulk_under(other, item, parents):
                    covered.add(other)
    return 200, {"done": len(covered), "errors": errors}


def bulk_types(project_key, action, keys, text):
    if action != "delete":
        return 400, {"message": text.get("asset-tree.error.bulk.action", "Action")}
    unique = []
    seen = set()
    for key in keys:
        name = (key or "").strip()
        if name and name not in seen:
            seen.add(name)
            unique.append(name)
    if not unique:
        return 400, {"message": text.get("asset-tree.error.bulk.empty", "Empty")}
    done = 0
    errors = []
    for key in unique:
        row = STATE["types"].get(key)
        label = row["label"] if row else key
        if not row:
            errors.append({"label": label, "message": text.get("asset-tree.error.type.notFound", "Type")})
            continue
        if row.get("projectKey") != project_key:
            errors.append({"label": label, "message": text.get("asset-tree.error.project.mismatch", "Project")})
            continue
        if row.get("systemType"):
            errors.append({"label": label, "message": text.get("asset-tree.error.type.system", "System")})
            continue
        if any(asset["typeKey"] == key for asset in STATE["assets"].values()):
            errors.append({"label": label, "message": text.get("asset-tree.error.type.inUse", "Used")})
            continue
        del STATE["types"][key]
        done += 1
    return 200, {"done": done, "errors": errors}


class Handler(BaseHTTPRequestHandler):
    server_version = "AssetTreePreview/1.1"

    def log_message(self, fmt, *args):
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))

    def do_GET(self):
        self.route("GET")

    def do_POST(self):
        self.route("POST")

    def do_PUT(self):
        self.route("PUT")

    def do_DELETE(self):
        self.route("DELETE")

    def route(self, method):
        parsed = urlparse(self.path)
        path = unquote(parsed.path)
        query = parse_qs(parsed.query)
        if path in ("/", "/plugins/servlet/asset-tree"):
            return self.serve_page(query)
        if path == "/issue":
            return self.serve_issue(query)
        if path == "/portal" or re.fullmatch(r"/servicedesk/customer/portal/\d+/create/\d+", path):
            return self.serve_portal(path)
        if path.startswith("/rest/servicedeskapi/portals/") or path.startswith("/rest/servicedeskapi/servicedesk/"):
            body = b'{"id":"7","projectId":"10000","projectKey":"TEST","projectName":"Test"}'
            return self.respond(200, body, "application/json; charset=utf-8")
        if path.startswith("/browse/"):
            return self.serve_browse(path.split("/", 2)[2])
        if path.startswith("/download/resources/"):
            return self.serve_static(path.rsplit("/", 1)[-1])
        if path.startswith("/rest/asset-tree/1.0/"):
            rest = path[len("/rest/asset-tree/1.0"):]
            if method == "GET" and re.fullmatch(r"/projects/[A-Za-z0-9]+/equipment\.xlsx", rest):
                project_key = rest.split("/")[2]
                body = equipment_xlsx(project_key, self.text(), self.lang() != "en")
                return self.respond(200, body, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", {
                    "Content-Disposition": 'attachment; filename="equipment-%s.xlsx"' % project_key,
                })
            if method == "GET" and re.fullmatch(r"/projects/[A-Za-z0-9]+/equipment\.csv", rest):
                project_key = rest.split("/")[2]
                body = equipment_csv(project_key, self.text()).encode("utf-8")
                return self.respond(200, body, "text/csv; charset=utf-8", {
                    "Content-Disposition": 'attachment; filename="equipment-%s.csv"' % project_key,
                })
            return self.serve_api(method, rest, query)
        if path == "/plugins/servlet/asset-tree-file":
            return self.serve_file(method, query)
        self.send_error(404)

    def lang(self):
        header = self.headers.get("Accept-Language", "ru")
        return "en" if header.lower().startswith("en") else "ru"

    def text(self):
        return messages(self.lang())

    def serve_page(self, query):
        template = open(os.path.join(RES, "templates", "page.html"), encoding="utf-8").read()
        text = self.text()
        project = (query.get("project") or [""])[0]
        view = (query.get("view") or ["all"])[0]
        if view == "dashboard":
            view = "all"
        if view not in ("all", "mine", "search", "settings"):
            view = "all"
        html = (template
                .replace("@@LANG@@", "ru" if self.lang() == "ru" else "en")
                .replace("@@TITLE@@", text.get("asset-tree.ui.title", "Asset tree"))
                .replace("@@CSS@@", "/download/resources/asset-tree/asset-tree.css")
                .replace("@@QR@@", "/download/resources/asset-tree/qr-code.js")
                .replace("@@JS@@", "/download/resources/asset-tree/asset-tree.js")
                .replace("@@REST@@", "/rest/asset-tree/1.0")
                .replace("@@PROJECT@@", project)
                .replace("@@VIEW@@", view))
        html = html.replace("<body>", "<body>\n" + self.preview_header(text, project), 1)
        self.respond(200, html.encode("utf-8"), "text/html; charset=utf-8")

    def preview_header(self, text, project):
        def href(view):
            query = "view=" + view
            if project:
                query = "project=" + project + "&" + query
            return "/plugins/servlet/asset-tree?" + query
        items = [
            ("mine", text.get("asset-tree.nav.mine", "My assets")),
            ("all", text.get("asset-tree.nav.all", "All assets")),
            ("settings", text.get("asset-tree.nav.settings", "Settings")),
        ]
        links = "".join('<a href="%s">%s</a>' % (href(key), label) for key, label in items)
        label = text.get("asset-tree.nav.label", "Assets")
        return """<style>
.preview-top { display: flex; align-items: center; gap: 8px; height: 56px; padding: 0 16px; background: #0747a6; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
.preview-brand { font-weight: 600; margin-right: 16px; }
.preview-drop { position: relative; }
.preview-drop > a { color: #fff; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; padding: 8px 10px; border-radius: 3px; }
.preview-drop > a:hover, .preview-drop:focus-within > a { background: rgba(255,255,255,0.16); }
.preview-menu { display: none; position: absolute; top: 100%%; left: 0; min-width: 196px; margin-top: 4px; padding: 4px 0; background: #fff; color: #172b4d; border-radius: 3px; box-shadow: 0 4px 8px -2px rgba(9,30,66,.25), 0 0 1px rgba(9,30,66,.31); z-index: 40; }
.preview-drop:hover .preview-menu, .preview-drop:focus-within .preview-menu { display: block; }
.preview-menu a { display: block; padding: 8px 16px; color: #172b4d; text-decoration: none; }
.preview-menu a:hover { background: #f4f5f7; color: #0052cc; }
</style>
<header class="preview-top"><span class="preview-brand">Jira</span>
<div class="preview-drop"><a href="%s">%s <span aria-hidden="true">▾</span></a>
<div class="preview-menu">%s</div></div></header>""" % (href("all"), label, links)

    def serve_issue(self, query):
        key = ((query or {}).get("key") or ["SD-14"])[0].upper()
        issue = ISSUES.get(key) or ISSUES["SD-14"]
        # late=1 mimics Jira: the panel HTML arrives after the scripts, with no issue id on the element.
        late = ((query or {}).get("late") or ["0"])[0] == "1"
        if late:
            html = """<!DOCTYPE html>
<html lang="ru"><head><meta charset="utf-8"><title>%s</title>
<link rel="stylesheet" href="/download/resources/asset-tree/issue-panel.css">
<style>
body { margin: 0; background: #f4f5f7; font-family: "Segoe UI", sans-serif; }
main { max-width: 880px; margin: 32px auto; display: grid; grid-template-columns: 1fr 280px; gap: 16px; }
article, aside { background: white; border: 1px solid #e3e7ee; border-radius: 12px; padding: 16px; }
h1 { margin: 0 0 8px; font-size: 22px; }
h2 { margin: 0 0 8px; font-size: 14px; }
p { color: #5d6b82; }
</style></head>
<body><main>
<article><h1>%s</h1><p>Панель справа показывает активы только проекта этой заявки.</p></article>
<aside><h2>Активы</h2><div id="panel-slot"></div></aside></main>
<script>
window.JIRA = window.JIRA || {};
JIRA.Events = { NEW_CONTENT_ADDED: 'newContentAdded' };
JIRA._handlers = {};
JIRA.bind = function (name, fn) { (this._handlers[name] = this._handlers[name] || []).push(fn); };
JIRA.trigger = function (name, context) {
  var handlers = this._handlers[name] || [];
  for (var i = 0; i < handlers.length; i++) handlers[i]({ type: name }, context, 'panelRefreshed');
};
JIRA.Issue = { getIssueId: function () { return %s; }, getIssueKey: function () { return '%s'; } };
</script>
<script src="/download/resources/asset-tree/issue-panel.js"></script>
<script>
setTimeout(function () {
  var slot = document.getElementById('panel-slot');
  slot.innerHTML = '<div id="asset-tree-panel" class="asset-tree-panel" data-issue-id="" data-issue-key=""></div>';
  JIRA.trigger(JIRA.Events.NEW_CONTENT_ADDED, slot);
}, 900);
</script>
</body></html>""" % (issue["issueKey"], issue["issueKey"], issue["issueId"], issue["issueKey"])
        else:
            html = """<!DOCTYPE html>
<html lang="ru"><head><meta charset="utf-8"><title>%s</title>
<link rel="stylesheet" href="/download/resources/asset-tree/issue-panel.css">
<style>
body { margin: 0; background: #f4f5f7; font-family: "Segoe UI", sans-serif; }
main { max-width: 880px; margin: 32px auto; display: grid; grid-template-columns: 1fr 280px; gap: 16px; }
article, aside { background: white; border: 1px solid #e3e7ee; border-radius: 12px; padding: 16px; }
h1 { margin: 0 0 8px; font-size: 22px; }
h2 { margin: 0 0 8px; font-size: 14px; }
p { color: #5d6b82; }
</style></head>
<body><main>
<article><h1>%s</h1><p>Панель справа показывает активы только проекта этой заявки.</p></article>
<aside><h2>Активы</h2>
<div id="asset-tree-panel" class="asset-tree-panel" data-issue-id="%s" data-issue-key="%s"></div>
</aside></main>
<script src="/download/resources/asset-tree/issue-panel.js"></script>
</body></html>""" % (issue["issueKey"], issue["issueKey"], issue["issueId"], issue["issueKey"])
        self.respond(200, html.encode("utf-8"), "text/html; charset=utf-8")

    def serve_portal(self, path):
        ensure_portal_demo()
        # The script is in the head, before the form exists, and the asset input
        # appears later. Project key is not in the page: portal 7 answers only
        # through the Service Desk portal API.
        rewrite = ""
        if path == "/portal":
            rewrite = "<script>history.replaceState(null,'','/servicedesk/customer/portal/7/create/5');</script>"
        html = """<!DOCTYPE html>
<html lang="ru"><head><meta charset="utf-8"><title>Техническая поддержка</title>
<link rel="stylesheet" href="/download/resources/asset-tree/asset-field.css">
<style>
body { margin: 0; background: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #172b4d; }
main { max-width: 720px; margin: 32px auto; background: white; border: 1px solid #dfe1e6; border-radius: 3px; padding: 20px; }
form { display: flex; flex-direction: column; gap: 16px; }
label { display: flex; flex-direction: column; gap: 4px; font-weight: 600; }
select, input[type="text"] { font: inherit; font-weight: 400; padding: 6px 8px; }
</style>
%s
<script src="/download/resources/asset-tree/asset-field.js"></script>
</head>
<body><main>
<h1>%s</h1>
<p>%s</p>
<form id="request-form" class="vp-request-form">
<div class="field-group">
<label>Площадка <span class="vp-optional">(необязательно)</span></label>
<select id="customfield_10100" name="customfield_10100">
<option value="">Не выбрано</option>
<option value="10122" selected>Пункт А</option>
<option value="10123">Пункт Б</option>
</select>
</div>
<div class="field-group">
<label>Отделение</label>
<div class="field-value">
<select id="customfield_10101" name="customfield_10101">
<option value="">Не выбрано</option>
<option value="10130">Пункт А</option>
</select>
</div>
</div>
<div id="asset-slot"></div>
</form>
</main>
<script>
setTimeout(function () {
  var slot = document.getElementById('asset-slot');
  slot.innerHTML = '<label for="customfield_10001">Актив <span>(необязательно)</span></label><input type="text" id="customfield_10001" name="customfield_10001" value="">';
}, 900);
</script>
</body></html>""" % (
            rewrite,
            self.text().get("asset-tree.ui.portalTitle", "Asset"),
            self.text().get("asset-tree.ui.portalHint", ""),
        )
        self.respond(200, html.encode("utf-8"), "text/html; charset=utf-8")

    def serve_browse(self, key):
        issue = ISSUES.get(key.upper())
        if not issue:
            self.send_error(404)
            return
        body = "<h1>%s</h1><p>%s</p><p>%s</p>" % (issue["issueKey"], issue["summary"], issue["status"])
        self.respond(200, body.encode("utf-8"), "text/html; charset=utf-8")

    def serve_static(self, name):
        folder = "css" if name.endswith(".css") else "js" if name.endswith(".js") else None
        if not folder:
            self.send_error(404)
            return
        file_path = os.path.join(RES, folder, name)
        if not os.path.isfile(file_path):
            self.send_error(404)
            return
        content_type = "text/css; charset=utf-8" if name.endswith(".css") else "application/javascript; charset=utf-8"
        with open(file_path, "rb") as handle:
            self.respond(200, handle.read(), content_type)

    def serve_api(self, method, path, query):
        try:
            with LOCK:
                seed()
                status, payload = self.api(method, path, query)
            if status == 204:
                self.send_response(204)
                self.send_header("Content-Length", "0")
                self.end_headers()
                return
            body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            self.respond(status, body, "application/json; charset=utf-8")
        except Exception as error:  # noqa: BLE001
            print("preview error", error)
            self.respond(500, json.dumps({"message": "Error"}).encode("utf-8"), "application/json; charset=utf-8")

    def api(self, method, path, query):
        text = self.text()
        if path == "/meta" and method == "GET":
            i18n = {key[len("asset-tree.ui."):]: value for key, value in text.items() if key.startswith("asset-tree.ui.")}
            return 200, {
                "canEdit": True, "canConfigure": True, "canGrant": True, "version": "1.2.57",
                "baseUrl": "http://127.0.0.1:47121",
                "locale": "ru-RU" if self.lang() == "ru" else "en-US",
                "displayName": USERS["ivanov"]["displayName"],
                "userKey": "ivanov", "i18n": i18n,
                "projects": [dict(project_rights(), key=item["key"], name=item["name"]) for item in PROJECTS],
            }
        if path == "/assets" and method == "GET":
            project_key = (query.get("projectKey") or [""])[0]
            if project_key not in {item["key"] for item in PROJECTS}:
                return 400, {"message": text["asset-tree.error.project.required"]}
            needle = (query.get("q") or [""])[0].strip().lower()
            rows = project_assets(project_key)
            if needle:
                rows = [row for row in rows if needle in (row["name"] + row["objectKey"] + location_of(row)).lower()][:30]
            rows.sort(key=lambda item: (item["sortOrder"], item["id"]))
            return 200, {
                "assets": [asset_dto(row, text, False) for row in rows],
                "types": [type_dto(row, text, project_assets(project_key)) for row in self.project_types(project_key)],
                "statuses": status_dtos(project_key, text),
            }
        if path == "/assets" and method == "POST":
            return self.create_asset(self.read_json(), text)
        if path == "/users" and method == "GET":
            needle = (query.get("q") or [""])[0].strip().lower()
            found = [user for user in USERS.values() if needle and needle in (user["displayName"] + user["email"] + user["department"]).lower()]
            return 200, found[:8]
        match = re.fullmatch(r"/users/([a-z0-9_-]+)/assets", path)
        if match and method == "GET":
            user_key = match.group(1)
            if user_key not in USERS:
                return 404, {"message": text["asset-tree.error.user"]}
            result = []
            for asset in STATE["assets"].values():
                role = text["asset-tree.ui.custodian"] if asset.get("custodianKey") == user_key else None
                if role:
                    dto = asset_dto(asset, text, False)
                    dto["holderRole"] = role
                    result.append(dto)
            return 200, result
        match = re.fullmatch(r"/projects/([A-Za-z0-9]+)/inventory", path)
        if match and method == "GET":
            return 200, self.inventory(match.group(1), text)
        match = re.fullmatch(r"/assets/(\d+)/inventory", path)
        if match and method == "POST":
            return self.mark_inventory(int(match.group(1)), self.read_json(), text)
        match = re.fullmatch(r"/projects/([A-Za-z0-9]+)/bulk", path)
        if match and method == "POST":
            if match.group(1) not in {item["key"] for item in PROJECTS}:
                return 400, {"message": text["asset-tree.error.project.required"]}
            return bulk_apply(match.group(1), self.read_json(), text)
        match = re.fullmatch(r"/projects/([A-Za-z0-9]+)/equipment", path)
        if match and method == "POST":
            if match.group(1) not in {item["key"] for item in PROJECTS}:
                return 400, {"message": text["asset-tree.error.project.required"]}
            body = self.read_json() or {}
            return 200, import_request(match.group(1), body, text)
        match = re.fullmatch(r"/projects/([A-Za-z0-9]+)/report", path)
        if match and method == "GET":
            return 200, self.report(match.group(1), text)
        if path == "/asset-fields" and method == "GET":
            return 200, {"fields": ["customfield_10001"]}
        match = re.fullmatch(r"/portals/(\d+)", path)
        if match and method == "GET":
            if match.group(1) == "7":
                return 404, {"message": text["asset-tree.error.project.notFound"]}
            return 200, {"projectKey": "TEST"}
        match = re.fullmatch(r"/projects/([A-Za-z0-9]+)/portal-rules/(\d+)", path)
        if match and method == "DELETE":
            ensure_portal_demo()
            rule_id = int(match.group(2))
            before = len(STATE["portal_rules"])
            STATE["portal_rules"] = [rule for rule in STATE["portal_rules"] if rule["id"] != rule_id]
            if len(STATE["portal_rules"]) == before:
                return 404, {"message": text["asset-tree.error.portal.missing"]}
            return 204, None
        match = re.fullmatch(r"/projects/([A-Za-z0-9]+)/portal-rules", path)
        if match and method == "GET":
            ensure_portal_demo()
            if match.group(1) != "TEST":
                return 200, []
            return 200, [portal_rule_dto(rule) for rule in STATE["portal_rules"]]
        if match and method == "POST":
            ensure_portal_demo()
            body = self.read_json() or {}
            asset = STATE["assets"].get(int(body.get("assetId") or 0))
            conditions = []
            seen = set()
            for item in body.get("conditions") or []:
                field = " ".join((item.get("field") or "").split())
                option = " ".join((item.get("option") or "").split())
                if not field or not option:
                    continue
                key = field.lower()
                if key in seen:
                    return 400, {"message": text["asset-tree.error.portal.field"]}
                seen.add(key)
                conditions.append({"field": field, "option": option})
            if not asset or asset["projectKey"] != match.group(1):
                return 400, {"message": text["asset-tree.error.portal.target"]}
            if not conditions:
                return 400, {"message": text["asset-tree.error.portal.conditions"]}
            rule_id = STATE["portal_seq"]
            STATE["portal_seq"] += 1
            rule = {"id": rule_id, "assetId": asset["id"], "position": rule_id, "conditions": conditions}
            STATE["portal_rules"].append(rule)
            return 201, portal_rule_dto(rule)
        match = re.fullmatch(r"/projects/([A-Za-z0-9]+)/picker", path)
        if match and method == "GET":
            rows = project_assets(match.group(1))
            rows.sort(key=lambda item: (item["sortOrder"], item["id"]))
            return 200, [{
                "id": row["id"], "parentId": normalize_parent(row["parentId"]), "name": row["name"],
                "objectKey": row["objectKey"], "status": canonical(row["status"]),
                "typeLabel": type_dto(type_row(row["typeKey"]), text, rows)["label"],
            } for row in rows]
        if path == "/types" and method == "POST":
            return self.create_type(self.read_json(), text)
        match = re.fullmatch(r"/assets/(\d+)", path)
        if match and method == "GET":
            asset = STATE["assets"].get(int(match.group(1)))
            if not asset:
                return 404, {"message": text["asset-tree.error.notFound"]}
            return 200, asset_dto(asset, text, True)
        if match and method == "PUT":
            return self.update_asset(int(match.group(1)), self.read_json(), text)
        if match and method == "DELETE":
            return self.delete_asset(int(match.group(1)), (query.get("cascade") or ["false"])[0] == "true", text)
        match = re.fullmatch(r"/assets/(\d+)/comments", path)
        if match and method == "POST":
            return self.add_comment(int(match.group(1)), self.read_json(), text)
        match = re.fullmatch(r"/assets/(\d+)/comments/(\d+)", path)
        if match and method == "DELETE":
            return self.delete_comment(int(match.group(1)), int(match.group(2)), text)
        match = re.fullmatch(r"/assets/(\d+)/files/(\d+)", path)
        if match and method == "DELETE":
            return self.delete_file(int(match.group(1)), int(match.group(2)), text)
        match = re.fullmatch(r"/assets/(\d+)/move", path)
        if match and method == "POST":
            return self.move_asset(int(match.group(1)), self.read_json(), text)
        match = re.fullmatch(r"/assets/(\d+)/issues", path)
        if match and method == "POST":
            return self.link_issue(int(match.group(1)), (self.read_json() or {}).get("issueKey"), text)
        match = re.fullmatch(r"/assets/(\d+)/issues/(\d+)", path)
        if match and method == "DELETE":
            STATE["links"] = [link for link in STATE["links"] if not (link["assetId"] == int(match.group(1)) and link["issueId"] == int(match.group(2)))]
            return 204, None
        match = re.fullmatch(r"/issues/(\d+)/context", path)
        if match and method == "GET":
            issue = ISSUES_BY_ID.get(int(match.group(1)))
            if not issue:
                return 404, {"message": text["asset-tree.error.issue.notFound"]}
            project = next((item for item in PROJECTS if item["key"] == issue["projectKey"]), None)
            if not project:
                return 404, {"message": text["asset-tree.error.project.notFound"]}
            return 200, {"projectKey": project["key"], "projectName": project["name"], "canEdit": True}
        match = re.fullmatch(r"/issues/(\d+)/search", path)
        if match and method == "GET":
            issue = ISSUES_BY_ID.get(int(match.group(1)))
            if not issue:
                return 404, {"message": text["asset-tree.error.issue.notFound"]}
            needle = (query.get("q") or [""])[0].strip().lower()
            rows = [row for row in project_assets(issue["projectKey"]) if needle in (row["name"] + row["objectKey"]).lower()]
            return 200, [asset_dto(row, text, False) for row in rows[:8]]
        match = re.fullmatch(r"/issues/(\d+)/assets", path)
        if match and method == "GET":
            issue_id = int(match.group(1))
            if issue_id not in ISSUES_BY_ID:
                return 404, {"message": text["asset-tree.error.issue.notFound"]}
            linked = [STATE["assets"][link["assetId"]] for link in STATE["links"] if link["issueId"] == issue_id and link["assetId"] in STATE["assets"]]
            return 200, [asset_dto(asset, text, False) for asset in linked]
        if match and method == "POST":
            body = self.read_json() or {}
            issue = ISSUES_BY_ID.get(int(match.group(1)))
            asset = STATE["assets"].get(int(body.get("assetId") or 0))
            if not issue or not asset:
                return 404, {"message": text["asset-tree.error.notFound"]}
            return self.link_issue(asset["id"], issue["issueKey"], text)
        match = re.fullmatch(r"/types/([a-z0-9-]+)/fields", path)
        if match and method == "POST":
            return self.add_field(match.group(1), self.read_json(), text)
        match = re.fullmatch(r"/types/([a-z0-9-]+)/fields/([a-z0-9-]+)", path)
        if match and method == "DELETE":
            row = STATE["types"].get(match.group(1))
            if not row:
                return 404, {"message": text["asset-tree.error.type.notFound"]}
            row["fields"] = [field for field in row["fields"] if field["fieldKey"] != match.group(2)]
            return 204, None
        match = re.fullmatch(r"/types/([a-z0-9-]+)", path)
        if match and method == "PUT":
            return self.update_type(match.group(1), self.read_json(), text)
        if match and method == "DELETE":
            row = STATE["types"].get(match.group(1))
            if not row:
                return 404, {"message": text["asset-tree.error.type.notFound"]}
            if row["systemType"]:
                return 400, {"message": text["asset-tree.error.type.system"]}
            if any(asset["typeKey"] == row["typeKey"] for asset in STATE["assets"].values()):
                return 409, {"message": text["asset-tree.error.type.inUse"]}
            del STATE["types"][row["typeKey"]]
            return 204, None
        match = re.fullmatch(r"/projects/([A-Za-z0-9]+)/statuses", path)
        if match and method == "GET":
            project_key = match.group(1)
            if project_key not in {item["key"] for item in PROJECTS}:
                return 404, {"message": text["asset-tree.error.project.notFound"]}
            return 200, status_dtos(project_key, text)
        if match and method == "POST":
            return self.create_status(match.group(1), self.read_json(), text)
        match = re.fullmatch(r"/projects/([A-Za-z0-9]+)/statuses/([a-z0-9_-]+)", path)
        if match and method == "PUT":
            return self.update_status(match.group(1), match.group(2), self.read_json(), text)
        if match and method == "DELETE":
            return self.delete_status(match.group(1), match.group(2), text)
        match = re.fullmatch(r"/projects/([A-Za-z0-9]+)/grants", path)
        if match and method == "GET":
            project_key = match.group(1)
            if project_key not in {item["key"] for item in PROJECTS}:
                return 404, {"message": text["asset-tree.error.project.notFound"]}
            return 200, list(STATE["grants"].get(project_key, []))
        if match and method == "POST":
            return self.add_grant(match.group(1), self.read_json(), text)
        if match and method == "DELETE":
            return self.delete_grant(match.group(1), (query.get("group") or [""])[0], text)
        if path == "/groups" and method == "GET":
            needle = (query.get("q") or [""])[0].strip().lower()
            found = [{"groupName": name} for name in GROUPS if needle and needle in name.lower()]
            return 200, found[:15]
        return 404, {"message": text["asset-tree.error.notFound"]}

    def create_status(self, project_key, body, text):
        if project_key not in {item["key"] for item in PROJECTS}:
            return 404, {"message": text["asset-tree.error.project.notFound"]}
        label = ((body or {}).get("label") or "").strip()
        if not label:
            return 400, {"message": text["asset-tree.error.status"]}
        category = ((body or {}).get("category") or "todo").strip() or "todo"
        if category not in CATEGORY_COLOR:
            return 400, {"message": text["asset-tree.error.status"]}
        rows = ensure_statuses(project_key, text)
        taken = {row["statusKey"] for row in rows}
        key = unique_key(slug(label), taken)
        if not STATUS_KEY.match(key):
            return 400, {"message": text["asset-tree.error.status"]}
        row = {"statusKey": key, "label": label, "category": category, "sortOrder": len(rows)}
        rows.append(row)
        return 201, dict(row, assetCount=0)

    def update_status(self, project_key, status_key, body, text):
        rows = ensure_statuses(project_key, text)
        row = next((item for item in rows if item["statusKey"] == status_key), None)
        if not row:
            return 404, {"message": text["asset-tree.error.status"]}
        label = ((body or {}).get("label") or "").strip()
        if (body or {}).get("label") is not None and not label:
            return 400, {"message": text["asset-tree.error.status"]}
        if label:
            row["label"] = label
        category = ((body or {}).get("category") or "").strip()
        if category:
            if category not in CATEGORY_COLOR:
                return 400, {"message": text["asset-tree.error.status"]}
            row["category"] = category
        count = len([asset for asset in project_assets(project_key) if canonical(asset.get("status")) == status_key])
        return 200, dict(row, assetCount=count)

    def delete_status(self, project_key, status_key, text):
        rows = ensure_statuses(project_key, text)
        if len(rows) <= 1:
            return 400, {"message": text["asset-tree.error.status.last"]}
        row = next((item for item in rows if item["statusKey"] == status_key), None)
        if not row:
            return 404, {"message": text["asset-tree.error.status"]}
        used = any(canonical(asset.get("status")) == status_key for asset in project_assets(project_key))
        if used:
            return 409, {"message": text["asset-tree.error.status.inUse"]}
        STATE["statuses"][project_key] = [item for item in rows if item["statusKey"] != status_key]
        return 204, None

    def add_grant(self, project_key, body, text):
        if project_key not in {item["key"] for item in PROJECTS}:
            return 404, {"message": text["asset-tree.error.project.notFound"]}
        group_name = ((body or {}).get("groupName") or "").strip()
        raw_caps = (body or {}).get("caps")
        level = ((body or {}).get("level") or "").strip()
        caps = normalize_caps(raw_caps) if raw_caps else caps_from_level(level)
        if group_name not in GROUPS or not caps:
            return 400, {"message": text["asset-tree.error.group"]}
        row = {"groupName": group_name, "level": level_of(caps), "caps": caps}
        rows = STATE["grants"].setdefault(project_key, [])
        current = next((item for item in rows if item["groupName"] == group_name), None)
        if current:
            current.update(row)
            return 201, current
        rows.append(row)
        rows.sort(key=lambda item: item["groupName"].lower())
        return 201, row

    def delete_grant(self, project_key, group_name, text):
        rows = STATE["grants"].get(project_key, [])
        match = next((item for item in rows if item["groupName"] == (group_name or "").strip()), None)
        if not match:
            return 404, {"message": text["asset-tree.error.group"]}
        STATE["grants"][project_key] = [item for item in rows if item is not match]
        return 204, None

    def project_types(self, project_key):
        rows = [row for row in STATE["types"].values() if row["projectKey"] == project_key]
        rows.sort(key=lambda item: item["sortOrder"])
        return rows

    def values_from(self, body, type_key, text):
        row = type_row(type_key)
        if not row:
            return text["asset-tree.error.type"], {}
        incoming = {}
        for item in (body or {}).get("attributes") or []:
            if item and item.get("fieldKey"):
                incoming[item["fieldKey"]] = item.get("value") or ""
        values = {}
        for field in row["fields"]:
            value = (incoming.get(field["fieldKey"]) or "").strip()
            if field["required"] and not value:
                return text["asset-tree.error.field.required"].replace("{0}", label_of(field["label"], text)), {}
            stored = incoming.get(field["fieldKey"]) or ""
            if field["kind"] == "date" and value:
                stored = canonical_date(value)
                if not stored:
                    return text.get("asset-tree.error.date", "Date"), {}
            if field["kind"] == "user" and value and value not in USERS:
                return text["asset-tree.error.user"], {}
            values[field["fieldKey"]] = stored
        return None, values

    def create_asset(self, body, text):
        if not body or not (body.get("name") or "").strip():
            return 400, {"message": text["asset-tree.error.name.required"]}
        project_key = body.get("projectKey")
        if project_key not in {item["key"] for item in PROJECTS}:
            return 400, {"message": text["asset-tree.error.project.required"]}
        type_key = (body.get("typeKey") or "").strip()
        row = type_row(type_key)
        if not row or row["projectKey"] != project_key:
            return 400, {"message": text["asset-tree.error.type"]}
        parent_id = normalize_parent(body.get("parentId"))
        parent = STATE["assets"].get(parent_id) if parent_id else None
        if parent_id and (not parent or parent["projectKey"] != project_key):
            return 400, {"message": text["asset-tree.error.project.mismatch"]}
        custodian = (body.get("custodianKey") or "").strip() or None
        if custodian and custodian not in USERS:
            return 400, {"message": text["asset-tree.error.user"]}
        error, values = self.values_from(body, type_key, text)
        if error:
            return 400, {"message": error}
        status = canonical(body.get("status") or "in_use")
        if not status_known(project_key, status, text):
            return 400, {"message": text["asset-tree.error.status"]}
        asset_id = add_asset(project_key, type_key, body["name"].strip(), parent_id, status, custodian, values)
        STATE["assets"][asset_id]["description"] = body.get("description") or ""
        log_activity(asset_id, "created", "", "", body["name"].strip())
        log_place(place_container(parent_id), "place_add", STATE["assets"][asset_id])
        return 201, asset_dto(STATE["assets"][asset_id], text, True)

    def update_asset(self, asset_id, body, text):
        asset = STATE["assets"].get(asset_id)
        if not asset:
            return 404, {"message": text["asset-tree.error.notFound"]}
        if not body or not (body.get("name") or "").strip():
            return 400, {"message": text["asset-tree.error.name.required"]}
        type_key = (body.get("typeKey") or asset["typeKey"]).strip()
        row = type_row(type_key)
        if not row or row["projectKey"] != asset["projectKey"]:
            return 400, {"message": text["asset-tree.error.type"]}
        status = canonical(body.get("status") or asset["status"])
        if not status_known(asset["projectKey"], status, text):
            return 400, {"message": text["asset-tree.error.status"]}
        custodian = (body.get("custodianKey") or "").strip() or None
        if custodian and custodian not in USERS:
            return 400, {"message": text["asset-tree.error.user"]}
        error, values = self.values_from(body, type_key, text)
        if error:
            return 400, {"message": error}
        old_name = asset["name"]
        old_description = asset.get("description") or ""
        old_type = asset["typeKey"]
        old_status = canonical(asset["status"])
        old_custodian = asset.get("custodianKey") or ""
        old_values = dict(asset.get("values") or {})
        new_name = body["name"].strip()
        new_description = body.get("description") or ""
        new_status = canonical(status)
        new_custodian = custodian or ""
        asset.update({"name": new_name, "description": new_description, "typeKey": type_key, "status": new_status, "custodianKey": custodian, "values": values, "updated": now_stamp()})
        log_activity(asset_id, "name", "", old_name, new_name)
        log_activity(asset_id, "description", "", old_description, new_description)
        old_type_row = type_row(old_type)
        new_type_row = type_row(type_key)
        log_activity(asset_id, "type", "", (old_type_row or {}).get("label") or old_type, (new_type_row or {}).get("label") or type_key)
        log_activity(asset_id, "status", "", old_status, new_status)
        old_person = USERS.get(old_custodian)
        new_person = USERS.get(new_custodian)
        log_activity(asset_id, "custodian", "", old_person["displayName"] if old_person else "", new_person["displayName"] if new_person else "")
        labels = {}
        for field in (new_type_row or {}).get("fields") or []:
            labels[field["fieldKey"]] = label_of(field["label"], text)
        keys = set(old_values) | set(values)
        for key in keys:
            old_value = (old_values.get(key) or "").strip()
            new_value = (values.get(key) or "").strip()
            log_activity(asset_id, "attribute", labels.get(key) or key, old_value, new_value)
        return 200, asset_dto(asset, text, True)

    def delete_asset(self, asset_id, cascade, text):
        asset = STATE["assets"].get(asset_id)
        if not asset:
            return 404, {"message": text["asset-tree.error.notFound"]}
        rows = project_assets(asset["projectKey"])
        nested = descendants(rows, asset_id)
        if nested and not cascade:
            return 409, {"message": text["asset-tree.error.hasChildren"].replace("{0}", str(len(nested)))}
        doomed = set(nested + [asset_id])
        for current in nested + [asset_id]:
            gone = STATE["assets"].get(current)
            if gone:
                log_place(place_container(gone.get("parentId"), doomed), "place_remove", gone)
        for current in nested + [asset_id]:
            STATE["assets"].pop(current, None)
            STATE["checks"].pop(current, None)
            STATE["links"] = [link for link in STATE["links"] if link["assetId"] != current]
            for comment_id in [row["id"] for row in comments_of(current)]:
                STATE["comments"].pop(comment_id, None)
            for file_id in [row["id"] for row in files_of(current)]:
                STATE["files"].pop(file_id, None)
                delete_preview_file(file_id)
            for activity_id in [row["id"] for row in activities_of(current)]:
                STATE["activities"].pop(activity_id, None)
        return 204, None

    def move_asset(self, asset_id, body, text):
        asset = STATE["assets"].get(asset_id)
        if not asset:
            return 404, {"message": text["asset-tree.error.notFound"]}
        parent_id = normalize_parent((body or {}).get("parentId"))
        parent = STATE["assets"].get(parent_id) if parent_id else None
        if parent_id and (not parent or parent["projectKey"] != asset["projectKey"]):
            return 400, {"message": text["asset-tree.error.project.mismatch"]}
        rows = project_assets(asset["projectKey"])
        if would_cycle(rows, asset_id, parent_id):
            return 400, {"message": text["asset-tree.error.cycle"]}
        base = 0 if parent_id is None else depth(rows, parent_id) + 1
        if base >= MAX_DEPTH or base + subtree_height(rows, asset_id) >= MAX_DEPTH:
            return 400, {"message": text["asset-tree.error.depth"]}
        siblings = [row for row in rows if row["id"] != asset_id and normalize_parent(row["parentId"]) == parent_id]
        siblings.sort(key=lambda item: (item["sortOrder"], item["id"]))
        index = None if body is None else body.get("index")
        if index is None:
            index = len(siblings)
        index = max(0, min(int(index), len(siblings)))
        previous_parent = normalize_parent(asset.get("parentId"))
        from_place = place_container(previous_parent)
        to_place = place_container(parent_id)
        asset["parentId"] = parent_id
        if previous_parent != parent_id:
            old_name = STATE["assets"].get(previous_parent, {}).get("name", "") if previous_parent else ""
            new_name = parent["name"] if parent else ""
            log_activity(asset_id, "move", "", old_name, new_name)
        if from_place and from_place != to_place:
            log_place(from_place, "place_out", asset)
        if to_place and to_place != from_place:
            log_place(to_place, "place_in", asset)
        siblings.insert(index, asset)
        for position, sibling in enumerate(siblings):
            sibling["sortOrder"] = position
        return 200, asset_dto(asset, text, True)

    def link_issue(self, asset_id, issue_key, text):
        asset = STATE["assets"].get(asset_id)
        issue = ISSUES.get((issue_key or "").strip().upper())
        if not asset or not issue:
            return 404, {"message": text["asset-tree.error.issue.notFound"] if not issue else text["asset-tree.error.notFound"]}
        if asset["projectKey"] != issue["projectKey"]:
            return 400, {"message": text["asset-tree.error.project.mismatch"]}
        if any(link["assetId"] == asset_id and link["issueId"] == issue["issueId"] for link in STATE["links"]):
            return 409, {"message": text["asset-tree.error.issue.duplicate"]}
        STATE["links"].append({"assetId": asset_id, "issueId": issue["issueId"]})
        return 201, issue

    def create_type(self, body, text):
        label = ((body or {}).get("label") or "").strip()
        project_key = (body or {}).get("projectKey")
        if not label:
            return 400, {"message": text["asset-tree.error.type.label"]}
        if project_key not in {item["key"] for item in PROJECTS}:
            return 400, {"message": text["asset-tree.error.project.required"]}
        color = (body or {}).get("color") or PALETTE[0]
        location = bool((body or {}).get("location"))
        icon = resolve_icon((body or {}).get("icon"), location)
        if icon is None:
            return 400, {"message": text["asset-tree.error.type.icon"]}
        caption = ""
        if location:
            caption = str((body or {}).get("placeCaption") or "").strip()
            if len(caption) > 80:
                return 400, {"message": text.get("asset-tree.error.caption.length", "Caption")}
        taken = set(STATE["types"])
        key = unique_key(slug(label) or "type", taken)
        order = max([item["sortOrder"] for item in self.project_types(project_key)] or [-1]) + 1
        STATE["types"][key] = {
            "typeKey": key, "projectKey": project_key, "baseKey": "", "label": label, "color": color, "icon": icon,
            "systemType": False, "location": location, "placeCaption": caption,
            "showInTree": location or bool((body or {}).get("showInTree")),
            "sortOrder": order, "fields": [],
        }
        return 201, type_dto(STATE["types"][key], text, project_assets(project_key))

    def update_type(self, type_key, body, text):
        row = STATE["types"].get(type_key)
        if not row:
            return 404, {"message": text["asset-tree.error.type.notFound"]}
        body = body or {}
        if body.get("showInTree") is not None:
            row["showInTree"] = bool(row.get("location")) or bool(body.get("showInTree"))
        if body.get("icon") is not None:
            icon = resolve_icon(body.get("icon"), bool(row.get("location")))
            if icon is None:
                return 400, {"message": text["asset-tree.error.type.icon"]}
            row["icon"] = icon
        if body.get("color") is not None:
            color = str(body.get("color")).strip()
            if not re.fullmatch(r"#[0-9A-Fa-f]{6}", color):
                return 400, {"message": text["asset-tree.error.type.color"]}
            row["color"] = color
        if body.get("placeCaption") is not None and row.get("location"):
            caption = str(body.get("placeCaption") or "").strip()
            if len(caption) > 80:
                return 400, {"message": text.get("asset-tree.error.caption.length", "Caption")}
            row["placeCaption"] = caption
        return 200, type_dto(row, text, project_assets(row["projectKey"]))

    def add_field(self, type_key, body, text):
        row = STATE["types"].get(type_key)
        label = ((body or {}).get("label") or "").strip()
        kind = (body or {}).get("kind") or "text"
        if not row:
            return 404, {"message": text["asset-tree.error.type.notFound"]}
        if not label:
            return 400, {"message": text["asset-tree.error.field.label"]}
        if kind not in ("text", "textarea", "number", "user", "date"):
            return 400, {"message": text["asset-tree.error.field.kind"]}
        taken = {field["fieldKey"] for field in row["fields"]}
        field_key = unique_key(slug(label) or "field", taken)
        field = {"fieldKey": field_key, "label": label, "kind": kind, "required": bool((body or {}).get("required")), "position": len(row["fields"])}
        row["fields"].append(field)
        return 201, {"fieldKey": field_key, "label": label, "kind": kind, "required": field["required"], "position": field["position"]}

    def ancestors_of(self, asset):
        chain = []
        cursor = normalize_parent(asset.get("parentId"))
        guard = 0
        while cursor and guard < 40:
            chain.append(cursor)
            parent = STATE["assets"].get(cursor)
            cursor = normalize_parent(parent.get("parentId")) if parent else None
            guard += 1
        chain.reverse()
        return chain

    def inventory(self, project_key, text):
        rows = project_assets(project_key)
        types = {row["typeKey"]: row for row in self.project_types(project_key)}
        items = []
        checked = 0
        for asset in rows:
            kind = types.get(asset["typeKey"])
            if kind and kind.get("location"):
                continue
            mark = STATE["checks"].get(asset["id"])
            if mark:
                checked += 1
            person = USERS.get(asset.get("custodianKey") or "")
            items.append({
                "id": asset["id"],
                "name": asset["name"],
                "objectKey": asset["objectKey"],
                "typeLabel": (kind or {}).get("label") or asset["typeKey"],
                "status": canonical(asset["status"]),
                "location": location_of(asset),
                "ancestors": self.ancestors_of(asset),
                "custodian": person["displayName"] if person else "",
                "checked": bool(mark),
                "checkedAt": mark["checkedAt"] if mark else "",
                "checkedBy": mark["checkedBy"] if mark else "",
            })
        items.sort(key=lambda item: (item["location"].lower(), item["name"].lower()))
        return {"total": len(items), "checked": checked, "rows": items}

    def mark_inventory(self, asset_id, body, text):
        asset = STATE["assets"].get(asset_id)
        if not asset:
            return 404, {"message": text["asset-tree.error.notFound"]}
        if (body or {}).get("checked"):
            STATE["checks"][asset_id] = {"checkedAt": "2026-09-27T10:00:00Z", "checkedBy": "Preview"}
        else:
            STATE["checks"].pop(asset_id, None)
        for row in self.inventory(asset["projectKey"], text)["rows"]:
            if row["id"] == asset_id:
                return 200, row
        return 200, {"id": asset_id, "checked": bool(STATE["checks"].get(asset_id)), "ancestors": []}

    def report(self, project_key, text):
        rows = project_assets(project_key)
        types = self.project_types(project_key)
        location_keys = {row["typeKey"] for row in types if row["location"]}
        equipment = [row for row in rows if row["typeKey"] not in location_keys]
        by_status = []
        for status in status_dtos(project_key, text):
            count = len([row for row in equipment if canonical(row["status"]) == status["statusKey"]])
            if count:
                by_status.append({
                    "key": status["statusKey"],
                    "label": status["label"],
                    "color": CATEGORY_COLOR.get(status["category"], "#4a6785"),
                    "count": count,
                })
        by_type = []
        for row in types:
            if row["typeKey"] in location_keys:
                continue
            count = len([asset for asset in equipment if asset["typeKey"] == row["typeKey"]])
            if count:
                typed = type_dto(row, text, rows)
                by_type.append({"key": row["typeKey"], "label": typed["label"], "color": row["color"], "icon": typed["icon"], "count": count})
        places = []
        for asset in rows:
            if asset["typeKey"] not in location_keys:
                continue
            nested = [item for item in descendants(rows, asset["id"]) if STATE["assets"][item]["typeKey"] not in location_keys]
            places.append({"id": asset["id"], "name": asset["name"], "typeLabel": type_dto(type_row(asset["typeKey"]), text, rows)["label"], "equipment": len(nested)})
        holders = {}
        for asset in equipment:
            if asset.get("custodianKey"):
                holders[asset["custodianKey"]] = holders.get(asset["custodianKey"], 0) + 1
        project = next(item for item in PROJECTS if item["key"] == project_key)
        return {
            "projectKey": project_key, "projectName": project["name"], "total": len(rows), "equipment": len(equipment),
            "unassigned": len([row for row in equipment if not row.get("custodianKey")]),
            "byStatus": by_status, "byType": by_type, "places": places,
            "holders": [{"user": USERS[key], "count": count} for key, count in holders.items()],
        }

    def add_comment(self, asset_id, body, text):
        asset = STATE["assets"].get(asset_id)
        if not asset:
            return 404, {"message": text["asset-tree.error.notFound"]}
        note = ((body or {}).get("body") or "").strip()
        if not note:
            return 400, {"message": text["asset-tree.error.comment.required"]}
        if len(note) > MAX_COMMENT:
            return 400, {"message": text["asset-tree.error.description.length"]}
        comment_id = STATE["comment_seq"]
        STATE["comment_seq"] += 1
        row = {
            "id": comment_id, "assetId": asset_id, "authorKey": "ivanov",
            "body": note, "created": now_stamp(),
        }
        STATE["comments"][comment_id] = row
        log_activity(asset_id, "comment", "", "", note[:500])
        return 201, comment_dto(row)

    def delete_comment(self, asset_id, comment_id, text):
        row = STATE["comments"].get(comment_id)
        if not row or row["assetId"] != asset_id or asset_id not in STATE["assets"]:
            return 404, {"message": text["asset-tree.error.notFound"]}
        log_activity(asset_id, "comment_delete", "", row.get("body") or "", "")
        STATE["comments"].pop(comment_id, None)
        return 204, None

    def delete_file(self, asset_id, file_id, text):
        row = STATE["files"].get(file_id)
        if not row or row["assetId"] != asset_id or asset_id not in STATE["assets"]:
            return 404, {"message": text["asset-tree.error.notFound"]}
        log_activity(asset_id, "file_delete", "", row.get("fileName") or "", "")
        STATE["files"].pop(file_id, None)
        delete_preview_file(file_id)
        return 204, None

    def serve_file(self, method, query):
        text = self.text()
        if method == "GET":
            try:
                file_id = int((query.get("id") or ["0"])[0])
            except ValueError:
                file_id = 0
            with LOCK:
                row = STATE["files"].get(file_id)
                path = preview_file_path(file_id) if row else ""
            if not row or not os.path.isfile(path):
                self.send_error(404)
                return
            with open(path, "rb") as handle:
                data = handle.read()
            name = (row["fileName"] or "file").replace('"', "").replace("\r", "").replace("\n", "")
            ascii_name = name.encode("ascii", "replace").decode("ascii")
            disposition = 'attachment; filename="%s"; filename*=UTF-8\'\'%s' % (ascii_name, quote(name))
            self.respond(200, data, row["contentType"] or "application/octet-stream", {
                "X-Content-Type-Options": "nosniff",
                "Content-Disposition": disposition,
            })
            return
        if method != "POST":
            self.send_error(405)
            return
        try:
            asset_id = int((query.get("assetId") or ["0"])[0])
        except ValueError:
            asset_id = 0
        length = int(self.headers.get("Content-Length") or 0)
        if asset_id <= 0 or length <= 0 or length > MAX_FILE_BYTES + 65536:
            self.respond(400, json.dumps({"message": text["asset-tree.error.file.required"]}, ensure_ascii=False).encode("utf-8"), "application/json; charset=utf-8")
            return
        raw = self.rfile.read(length)
        parsed = parse_multipart(raw, self.headers.get("Content-Type", ""))
        if not parsed or not parsed[2]:
            self.respond(400, json.dumps({"message": text["asset-tree.error.file.required"]}, ensure_ascii=False).encode("utf-8"), "application/json; charset=utf-8")
            return
        name, content_type, data = parsed
        if len(data) > MAX_FILE_BYTES:
            self.respond(400, json.dumps({"message": text["asset-tree.error.file.size"]}, ensure_ascii=False).encode("utf-8"), "application/json; charset=utf-8")
            return
        safe = safe_file_name(name)
        if not safe:
            self.respond(400, json.dumps({"message": text["asset-tree.error.file.name"]}, ensure_ascii=False).encode("utf-8"), "application/json; charset=utf-8")
            return
        with LOCK:
            if asset_id not in STATE["assets"]:
                missing = True
                file_id = 0
            else:
                missing = False
                file_id = STATE["file_seq"]
                STATE["file_seq"] += 1
                STATE["files"][file_id] = {
                    "id": file_id, "assetId": asset_id, "fileName": safe,
                    "contentType": content_type or "application/octet-stream",
                    "size": len(data), "authorKey": "ivanov", "created": now_stamp(),
                }
        if missing:
            self.respond(404, json.dumps({"message": text["asset-tree.error.notFound"]}, ensure_ascii=False).encode("utf-8"), "application/json; charset=utf-8")
            return
        try:
            write_preview_file(file_id, data)
        except OSError:
            with LOCK:
                STATE["files"].pop(file_id, None)
            self.respond(500, json.dumps({"message": text["asset-tree.error.unexpected"]}, ensure_ascii=False).encode("utf-8"), "application/json; charset=utf-8")
            return
        with LOCK:
            log_activity(asset_id, "file", "", "", safe)
        self.respond(201, json.dumps({"id": file_id}).encode("utf-8"), "application/json; charset=utf-8")

    def read_json(self):
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0:
            return {}
        raw = self.rfile.read(length)
        return json.loads(raw.decode("utf-8")) if raw else {}

    def respond(self, status, body, content_type, extra=None):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        for key, value in (extra or {}).items():
            self.send_header(key, value)
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print("Asset tree preview at http://127.0.0.1:%s" % PORT)
    server.serve_forever()
