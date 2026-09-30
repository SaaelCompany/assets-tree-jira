package com.assetstree.jira.web;

import com.atlassian.jira.component.ComponentAccessor;
import com.atlassian.jira.issue.CustomFieldManager;
import com.atlassian.jira.issue.fields.CustomField;
import com.atlassian.jira.project.Project;
import com.atlassian.jira.user.ApplicationUser;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

/**
 * Finds the asset custom fields and the Jira project behind a Service Desk portal.
 * The portal classes are loaded by reflection so the plugin still starts on Jira
 * without Service Management.
 */
public final class PortalLookup {
    private PortalLookup() {
    }

    public static List<String> assetFieldIds() {
        List<String> ids = new ArrayList<String>();
        CustomFieldManager manager = ComponentAccessor.getCustomFieldManager();
        if (manager == null) {
            return ids;
        }
        for (CustomField field : manager.getCustomFieldObjects()) {
            if (field == null || field.getCustomFieldType() == null || field.getId() == null) {
                continue;
            }
            String key = field.getCustomFieldType().getKey();
            if (key != null && key.endsWith(":asset-cf")) {
                ids.add(field.getId());
            }
        }
        return ids;
    }

    public static String projectKeyForPortal(ApplicationUser user, int portalId) {
        if (portalId <= 0) {
            return null;
        }
        try {
            Class<?> type = Class.forName("com.atlassian.servicedesk.api.portal.PortalService");
            Object service = ComponentAccessor.getOSGiComponentInstanceOfType(type);
            if (service == null) {
                return null;
            }
            Object portal = findPortal(service, type, user, portalId);
            if (portal == null) {
                return null;
            }
            String key = projectKey(portal);
            if (key != null && !key.isEmpty()) {
                return key;
            }
            Long projectId = projectId(portal);
            if (projectId == null) {
                return null;
            }
            Project project = ComponentAccessor.getProjectManager().getProjectObj(projectId);
            return project == null ? null : project.getKey();
        } catch (ReflectiveOperationException ex) {
            return null;
        } catch (RuntimeException ex) {
            return null;
        }
    }

    private static Object findPortal(Object service, Class<?> type, ApplicationUser user, int portalId) throws ReflectiveOperationException {
        Method[] methods = type.getMethods();
        for (int i = 0; i < methods.length; i++) {
            Method method = methods[i];
            if (!"getPortalForId".equals(method.getName()) || method.getParameterTypes().length != 2) {
                continue;
            }
            Object id = convert(method.getParameterTypes()[1], portalId);
            if (id == null) {
                continue;
            }
            return unwrap(method.invoke(service, user, id));
        }
        return null;
    }

    private static Object convert(Class<?> type, int portalId) {
        if (type == Integer.class || type == int.class) {
            return Integer.valueOf(portalId);
        }
        if (type == Long.class || type == long.class) {
            return Long.valueOf(portalId);
        }
        return null;
    }

    private static Object unwrap(Object value) throws ReflectiveOperationException {
        if (value == null) {
            return null;
        }
        String name = value.getClass().getName();
        if (name.endsWith("Either") || name.contains(".Either")) {
            Method isRight = value.getClass().getMethod("isRight");
            if (!Boolean.TRUE.equals(isRight.invoke(value))) {
                return null;
            }
            Object projection = value.getClass().getMethod("right").invoke(value);
            return projection.getClass().getMethod("get").invoke(projection);
        }
        return value;
    }

    private static String projectKey(Object portal) {
        Object project = invoke(portal, "getProject");
        if (project instanceof String) {
            return (String) project;
        }
        if (project != null) {
            Object key = invoke(project, "getKey");
            if (key instanceof String) {
                return (String) key;
            }
        }
        Object key = invoke(portal, "getProjectKey");
        return key instanceof String ? (String) key : null;
    }

    private static Long projectId(Object portal) {
        Object id = invoke(portal, "getProjectId");
        if (id instanceof Number) {
            return Long.valueOf(((Number) id).longValue());
        }
        return null;
    }

    private static Object invoke(Object target, String name) {
        try {
            return target.getClass().getMethod(name).invoke(target);
        } catch (ReflectiveOperationException ex) {
            return null;
        }
    }
}
