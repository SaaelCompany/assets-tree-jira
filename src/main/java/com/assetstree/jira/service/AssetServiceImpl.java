package com.assetstree.jira.service;

import com.atlassian.activeobjects.external.ActiveObjects;
import com.atlassian.crowd.embedded.api.CrowdDirectoryService;
import com.atlassian.crowd.embedded.api.CrowdService;
import com.atlassian.crowd.embedded.api.Directory;
import com.atlassian.crowd.embedded.api.UserWithAttributes;
import com.atlassian.jira.bc.user.search.UserSearchParams;
import com.atlassian.jira.bc.user.search.UserSearchService;
import com.atlassian.jira.component.ComponentAccessor;
import com.atlassian.jira.issue.Issue;
import com.atlassian.jira.issue.IssueManager;
import com.atlassian.jira.permission.GlobalPermissionKey;
import com.atlassian.jira.permission.ProjectPermissions;
import com.atlassian.jira.project.Project;
import com.atlassian.jira.project.ProjectManager;
import com.atlassian.crowd.embedded.api.Group;
import com.atlassian.jira.security.GlobalPermissionManager;
import com.atlassian.jira.security.JiraAuthenticationContext;
import com.atlassian.jira.security.PermissionManager;
import com.atlassian.jira.security.groups.GroupManager;
import com.atlassian.jira.security.plugin.ProjectPermissionKey;
import com.atlassian.jira.user.ApplicationUser;
import com.atlassian.jira.user.util.UserManager;
import com.atlassian.jira.util.I18nHelper;
import com.atlassian.sal.api.transaction.TransactionCallback;
import com.assetstree.jira.PluginInfo;
import com.assetstree.jira.ao.AssetActivityEntity;
import com.assetstree.jira.ao.AssetAttributeEntity;
import com.assetstree.jira.ao.AssetCommentEntity;
import com.assetstree.jira.ao.AssetCounterEntity;
import com.assetstree.jira.ao.AssetEntity;
import com.assetstree.jira.ao.AssetFieldEntity;
import com.assetstree.jira.ao.AssetFileEntity;
import com.assetstree.jira.ao.AssetIssueLinkEntity;
import com.assetstree.jira.ao.InventoryMarkEntity;
import com.assetstree.jira.ao.PortalRuleConditionEntity;
import com.assetstree.jira.ao.PortalRuleEntity;
import com.assetstree.jira.ao.ProjectGrantEntity;
import com.assetstree.jira.ao.ProjectStatusEntity;
import com.assetstree.jira.ao.AssetTypeEntity;
import com.assetstree.jira.dto.ActivityDto;
import com.assetstree.jira.dto.AssetDto;
import com.assetstree.jira.dto.AssetListDto;
import com.assetstree.jira.dto.AssetTypeDto;
import com.assetstree.jira.dto.AttributeDto;
import com.assetstree.jira.dto.CommentDto;
import com.assetstree.jira.dto.FieldDto;
import com.assetstree.jira.dto.FileDto;
import com.assetstree.jira.dto.GrantDto;
import com.assetstree.jira.dto.InventoryDto;
import com.assetstree.jira.dto.InventoryRowDto;
import com.assetstree.jira.dto.IssueContextDto;
import com.assetstree.jira.dto.IssueRefDto;
import com.assetstree.jira.dto.MetaDto;
import com.assetstree.jira.dto.PickerNodeDto;
import com.assetstree.jira.dto.PortalRuleDto;
import com.assetstree.jira.dto.ProjectDto;
import com.assetstree.jira.dto.ReportBucketDto;
import com.assetstree.jira.dto.ReportDto;
import com.assetstree.jira.dto.ReportHolderDto;
import com.assetstree.jira.dto.ReportPlaceDto;
import com.assetstree.jira.dto.StatusDto;
import com.assetstree.jira.dto.UserProfileDto;
import com.assetstree.jira.model.AssetDraft;
import com.assetstree.jira.model.AssetException;
import com.assetstree.jira.model.AssetValidator;
import com.assetstree.jira.model.AttributeDraft;
import com.assetstree.jira.model.DefaultTypes;
import com.assetstree.jira.model.FieldDraft;
import com.assetstree.jira.model.FieldKinds;
import com.assetstree.jira.model.GrantCaps;
import com.assetstree.jira.model.GrantDraft;
import com.assetstree.jira.model.MoveDraft;
import com.assetstree.jira.model.PortalConditionDraft;
import com.assetstree.jira.model.PortalRuleDraft;
import com.assetstree.jira.model.StatusDraft;
import com.assetstree.jira.model.ProjectKeys;
import com.assetstree.jira.model.StatusCategories;
import com.assetstree.jira.model.Statuses;
import com.assetstree.jira.model.TreeLogic;
import com.assetstree.jira.model.TypeDraft;
import com.assetstree.jira.model.TypeIcons;
import com.assetstree.jira.web.UiCatalog;
import net.java.ao.DBParam;
import net.java.ao.Query;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

public class AssetServiceImpl implements AssetService {
    private static final Logger log = LoggerFactory.getLogger(AssetServiceImpl.class);
    private static final int SEARCH_LIMIT = 30;
    private static final Pattern NUMBER = Pattern.compile("^-?\\d{1,12}(\\.\\d{1,4})?$");
    private static final GlobalPermissionKey MANAGE_ASSETS = GlobalPermissionKey.of("MANAGE_ASSETS");
    private static final GlobalPermissionKey MANAGE_ASSETS_FULL = GlobalPermissionKey.of(PluginInfo.KEY + ":MANAGE_ASSETS");
    private static final ProjectPermissionKey EDIT_ASSETS = new ProjectPermissionKey(PluginInfo.KEY + ":edit-assets");

    private volatile ActiveObjects aoRef;
    private volatile IssueManager issueManagerRef;
    private volatile JiraAuthenticationContext authenticationContextRef;
    private volatile GlobalPermissionManager globalPermissionManagerRef;
    private volatile PermissionManager permissionManagerRef;
    private volatile UserManager userManagerRef;
    private volatile ProjectManager projectManagerRef;
    private volatile UserSearchService userSearchServiceRef;
    private volatile CrowdService crowdServiceRef;
    private volatile CrowdDirectoryService crowdDirectoryServiceRef;
    private volatile GroupManager groupManagerRef;

    private ActiveObjects ao() {
        ActiveObjects current = aoRef;
        if (current == null) {
            current = JiraServices.activeObjects();
            aoRef = current;
        }
        return current;
    }

    private IssueManager issueManager() {
        IssueManager current = issueManagerRef;
        if (current == null) {
            current = ComponentAccessor.getIssueManager();
            issueManagerRef = current;
        }
        return current;
    }

    private JiraAuthenticationContext authenticationContext() {
        JiraAuthenticationContext current = authenticationContextRef;
        if (current == null) {
            current = ComponentAccessor.getJiraAuthenticationContext();
            authenticationContextRef = current;
        }
        return current;
    }

    private GlobalPermissionManager globalPermissionManager() {
        GlobalPermissionManager current = globalPermissionManagerRef;
        if (current == null) {
            current = ComponentAccessor.getGlobalPermissionManager();
            globalPermissionManagerRef = current;
        }
        return current;
    }

    private PermissionManager permissionManager() {
        PermissionManager current = permissionManagerRef;
        if (current == null) {
            current = ComponentAccessor.getPermissionManager();
            permissionManagerRef = current;
        }
        return current;
    }

    private UserManager userManager() {
        UserManager current = userManagerRef;
        if (current == null) {
            current = ComponentAccessor.getUserManager();
            userManagerRef = current;
        }
        return current;
    }

    private ProjectManager projectManager() {
        ProjectManager current = projectManagerRef;
        if (current == null) {
            current = ComponentAccessor.getProjectManager();
            projectManagerRef = current;
        }
        return current;
    }

    private UserSearchService userSearchService() {
        UserSearchService current = userSearchServiceRef;
        if (current == null) {
            current = ComponentAccessor.getComponent(UserSearchService.class);
            userSearchServiceRef = current;
        }
        return current;
    }

    private CrowdService crowdService() {
        CrowdService current = crowdServiceRef;
        if (current == null) {
            current = ComponentAccessor.getComponent(CrowdService.class);
            crowdServiceRef = current;
        }
        return current;
    }

    private CrowdDirectoryService crowdDirectoryService() {
        CrowdDirectoryService current = crowdDirectoryServiceRef;
        if (current == null) {
            current = ComponentAccessor.getComponent(CrowdDirectoryService.class);
            crowdDirectoryServiceRef = current;
        }
        return current;
    }

    private GroupManager groupManager() {
        GroupManager current = groupManagerRef;
        if (current == null) {
            current = ComponentAccessor.getGroupManager();
            groupManagerRef = current;
        }
        return current;
    }

    @Override
    public MetaDto meta(ApplicationUser user) {
        requireUser(user);
        I18nHelper i18n = authenticationContext().getI18nHelper();
        MetaDto meta = new MetaDto();
        meta.setVersion(PluginInfo.VERSION);
        meta.setLocale(i18n.getLocale() == null ? "en" : i18n.getLocale().toLanguageTag());
        meta.setDisplayName(user.getDisplayName());
        meta.setUserKey(user.getKey());
        Map<String, String> labels = new LinkedHashMap<String, String>();
        for (String key : UiCatalog.KEYS) {
            labels.put(key, i18n.getText("asset-tree.ui." + key));
        }
        meta.setI18n(labels);
        List<ProjectDto> projects = visibleProjects(user);
        boolean editable = false;
        boolean configurable = false;
        boolean grantable = false;
        for (ProjectDto project : projects) {
            if (project.isCanEdit() || project.isCanCreate() || project.isCanMove()
                    || project.isCanRemove() || project.isCanComment()) {
                editable = true;
            }
            if (project.isCanConfigure() || project.isCanGrant()) {
                configurable = true;
            }
            if (project.isCanGrant()) {
                grantable = true;
            }
        }
        meta.setCanEdit(editable);
        meta.setCanConfigure(configurable);
        meta.setCanGrant(grantable);
        meta.setProjects(projects);
        return meta;
    }

    @Override
    public AssetListDto listAssets(ApplicationUser user, String projectKey, String query) {
        Project project = requireReadableProject(user, projectKey);
        final String needle = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        final String key = project.getKey();
        return ao().executeInTransaction(new TransactionCallback<AssetListDto>() {
            @Override
            public AssetListDto doInTransaction() {
                AssetEntity[] rows = assetsIn(key);
                Map<Integer, List<AssetAttributeEntity>> attributes = attributesByAsset();
                List<AssetEntity> matched = new ArrayList<AssetEntity>();
                for (AssetEntity row : rows) {
                    if (!needle.isEmpty() && !matches(row, attributes.get(row.getID()), needle)) {
                        continue;
                    }
                    matched.add(row);
                    if (!needle.isEmpty() && matched.size() >= SEARCH_LIMIT) {
                        break;
                    }
                }
                Collections.sort(matched, SIBLING_ORDER);
                List<AssetTypeDto> types = typeDtos(key, rows);
                Map<String, AssetTypeDto> typeIndex = indexTypes(types);
                Map<Integer, AssetEntity> index = indexAssets(rows);
                AssetListDto list = new AssetListDto();
                List<AssetDto> assets = new ArrayList<AssetDto>();
                for (AssetEntity row : matched) {
                    assets.add(toDto(row, attributes.get(row.getID()), typeIndex, index, false));
                }
                list.setAssets(assets);
                list.setTypes(types);
                list.setStatuses(statusDtos(key, rows));
                return list;
            }
        });
    }

    @Override
    public AssetDto getAsset(ApplicationUser user, int id) {
        requireUser(user);
        return ao().executeInTransaction(new TransactionCallback<AssetDto>() {
            @Override
            public AssetDto doInTransaction() {
                AssetEntity entity = requireReadable(user, id);
                AssetEntity[] rows = assetsIn(entity.getProjectKey());
                return toDto(entity, attributesFor(id), indexTypes(typeDtos(entity.getProjectKey(), rows)), indexAssets(rows), true);
            }
        });
    }

    @Override
    public AssetDto createAsset(ApplicationUser user, AssetDraft draft) {
        final String error = AssetValidator.validateDraft(draft);
        if (error != null) {
            throw new AssetException(400, error);
        }
        AssetTypeEntity previewType = findType(draft.getTypeKey());
        String createCap = previewType != null && previewType.isLocation() ? GrantCaps.PLACES : GrantCaps.OBJECT;
        Project project = requireProjectCap(user, draft.getProjectKey(), createCap);
        return ao().executeInTransaction(new TransactionCallback<AssetDto>() {
            @Override
            public AssetDto doInTransaction() {
                String typeKey = draft.getTypeKey() == null ? "" : draft.getTypeKey().trim();
                AssetTypeEntity type = requireType(typeKey);
                if (!ProjectKeys.same(type.getProjectKey(), project.getKey())) {
                    throw new AssetException(400, "asset-tree.error.type");
                }
                Integer parentId = TreeLogic.normalizeParent(draft.getParentId());
                if (parentId != null) {
                    AssetEntity parent = requireReadable(user, parentId.intValue());
                    if (!ProjectKeys.same(parent.getProjectKey(), project.getKey())) {
                        throw new AssetException(400, "asset-tree.error.project.mismatch");
                    }
                }
                Map<Integer, Integer> parents = parentMap(assetsIn(project.getKey()));
                if (parentId != null && !parents.containsKey(parentId)) {
                    throw new AssetException(400, "asset-tree.error.parent");
                }
                if (parentId != null && TreeLogic.depth(parents, parentId.intValue()) + 1 >= TreeLogic.MAX_DEPTH) {
                    throw new AssetException(400, "asset-tree.error.depth");
                }
                String custodian = normalizeCustodian(draft.getCustodianKey());
                Date now = new Date();
                AssetEntity entity = ao().create(AssetEntity.class,
                        new DBParam("NAME", draft.getName().trim()),
                        new DBParam("OBJECT_KEY", nextKey()),
                        new DBParam("DESCRIPTION", draft.getDescription() == null ? "" : draft.getDescription()),
                        new DBParam("TYPE_KEY", type.getTypeKey()),
                        new DBParam("STATUS", resolveStatus(project.getKey(), draft.getStatus())),
                        new DBParam("SORT_ORDER", nextSort(parentId, project.getKey())),
                        new DBParam("CREATED", now),
                        new DBParam("UPDATED", now),
                        new DBParam("CREATED_BY", user.getKey()),
                        new DBParam("UPDATED_BY", user.getKey()),
                        new DBParam("PROJECT_KEY", project.getKey()));
                if (parentId != null) {
                    entity.setParentId(parentId);
                }
                entity.setCustodianKey(custodian);
                entity.save();
                replaceAttributes(entity, draft.getAttributes());
                logActivity(entity.getID(), user.getKey(), "created", "", "", entity.getName());
                AssetEntity[] rows = assetsIn(project.getKey());
                return toDto(entity, attributesFor(entity.getID()), indexTypes(typeDtos(project.getKey(), rows)), indexAssets(rows), true);
            }
        });
    }

    @Override
    public AssetDto updateAsset(ApplicationUser user, int id, AssetDraft draft) {
        final String error = AssetValidator.validateDraft(draft);
        if (error != null) {
            throw new AssetException(400, error);
        }
        return ao().executeInTransaction(new TransactionCallback<AssetDto>() {
            @Override
            public AssetDto doInTransaction() {
                AssetEntity entity = requireWritable(user, id);
                String typeKey = draft.getTypeKey() == null || draft.getTypeKey().trim().isEmpty()
                        ? entity.getTypeKey() : draft.getTypeKey().trim();
                AssetTypeEntity type = requireType(typeKey);
                if (!ProjectKeys.same(type.getProjectKey(), entity.getProjectKey())) {
                    throw new AssetException(400, "asset-tree.error.type");
                }
                String oldName = entity.getName() == null ? "" : entity.getName();
                String oldDescription = entity.getDescription() == null ? "" : entity.getDescription();
                String oldTypeKey = entity.getTypeKey() == null ? "" : entity.getTypeKey();
                String oldStatus = Statuses.canonical(entity.getStatus());
                String oldCustodian = entity.getCustodianKey() == null ? "" : entity.getCustodianKey();
                Map<String, String> oldAttributes = attributeValues(id);
                String newName = draft.getName().trim();
                String newDescription = draft.getDescription() == null ? "" : draft.getDescription();
                String newStatus = resolveStatus(entity.getProjectKey(), draft.getStatus() == null ? entity.getStatus() : draft.getStatus());
                String newCustodian = normalizeCustodian(draft.getCustodianKey());
                String storedCustodian = newCustodian == null ? "" : newCustodian;
                entity.setName(newName);
                entity.setDescription(newDescription);
                entity.setTypeKey(type.getTypeKey());
                entity.setStatus(newStatus);
                entity.setCustodianKey(newCustodian);
                entity.setUpdated(new Date());
                entity.setUpdatedBy(user.getKey());
                entity.save();
                if (draft.getAttributes() != null) {
                    replaceAttributes(entity, draft.getAttributes());
                }
                logActivity(id, user.getKey(), "name", "", oldName, newName);
                logActivity(id, user.getKey(), "description", "", clip(oldDescription), clip(newDescription));
                logActivity(id, user.getKey(), "type", "", typeLabel(requireType(oldTypeKey)), typeLabel(type));
                logActivity(id, user.getKey(), "status", "", oldStatus, newStatus);
                logActivity(id, user.getKey(), "custodian", "", displayName(oldCustodian), displayName(storedCustodian));
                if (draft.getAttributes() != null) {
                    logAttributeChanges(id, user.getKey(), entity.getTypeKey(), oldAttributes);
                }
                AssetEntity[] rows = assetsIn(entity.getProjectKey());
                return toDto(entity, attributesFor(id), indexTypes(typeDtos(entity.getProjectKey(), rows)), indexAssets(rows), true);
            }
        });
    }

    @Override
    public CommentDto addComment(ApplicationUser user, int id, String body) {
        requireAssetCap(user, id, kindCap(requireAsset(id)));
        String text = body == null ? "" : body.trim();
        if (text.isEmpty()) {
            throw new AssetException(400, "asset-tree.error.comment.required");
        }
        if (text.length() > AssetValidator.MAX_DESCRIPTION) {
            throw new AssetException(400, "asset-tree.error.description.length");
        }
        final String saved = text;
        AssetCommentEntity created = ao().executeInTransaction(new TransactionCallback<AssetCommentEntity>() {
            @Override
            public AssetCommentEntity doInTransaction() {
                return ao().create(AssetCommentEntity.class,
                        new DBParam("ASSET_ID", id),
                        new DBParam("AUTHOR_KEY", user.getKey()),
                        new DBParam("BODY", saved),
                        new DBParam("CREATED", new Date()));
            }
        });
        logActivity(id, user.getKey(), "comment", "", "", clip(saved));
        return commentDto(created);
    }

    @Override
    public void deleteComment(ApplicationUser user, int assetId, int commentId) {
        requireAssetCap(user, assetId, kindCap(requireAsset(assetId)));
        AssetCommentEntity comment = ao().get(AssetCommentEntity.class, commentId);
        if (comment == null || comment.getAssetId() != assetId) {
            throw new AssetException(404, "asset-tree.error.notFound");
        }
        logActivity(assetId, user.getKey(), "comment_delete", "", clip(comment.getBody()), "");
        ao().delete(comment);
    }

    @Override
    public FileDto storeFile(ApplicationUser user, int assetId, String fileName, String contentType, byte[] data) {
        requireAssetCap(user, assetId, kindCap(requireAsset(assetId)));
        if (data == null || data.length == 0) {
            throw new AssetException(400, "asset-tree.error.file.required");
        }
        if (data.length > AssetFileStore.MAX_BYTES) {
            throw new AssetException(400, "asset-tree.error.file.size");
        }
        final String safeName = fileNameOf(fileName);
        final String safeType = contentType == null || contentType.trim().isEmpty() ? "application/octet-stream" : contentType.trim();
        final byte[] bytes = data;
        AssetFileEntity created = ao().executeInTransaction(new TransactionCallback<AssetFileEntity>() {
            @Override
            public AssetFileEntity doInTransaction() {
                return ao().create(AssetFileEntity.class,
                        new DBParam("ASSET_ID", assetId),
                        new DBParam("FILE_NAME", safeName),
                        new DBParam("CONTENT_TYPE", safeType),
                        new DBParam("SIZE_BYTES", Long.valueOf(bytes.length)),
                        new DBParam("AUTHOR_KEY", user.getKey()),
                        new DBParam("CREATED", new Date()));
            }
        });
        try {
            AssetFileStore.write(created.getID(), bytes);
        } catch (IOException ex) {
            ao().delete(created);
            throw new AssetException(500, "asset-tree.error.unexpected");
        }
        logActivity(assetId, user.getKey(), "file", "", "", safeName);
        return fileDto(created);
    }

    @Override
    public StoredFile openFile(ApplicationUser user, int fileId) {
        AssetFileEntity file = ao().get(AssetFileEntity.class, fileId);
        if (file == null) {
            throw new AssetException(404, "asset-tree.error.notFound");
        }
        requireReadable(user, file.getAssetId());
        java.io.File stored = AssetFileStore.file(file.getID());
        if (!stored.isFile()) {
            throw new AssetException(404, "asset-tree.error.notFound");
        }
        byte[] data = new byte[(int) stored.length()];
        try {
            FileInputStream input = new FileInputStream(stored);
            try {
                int offset = 0;
                while (offset < data.length) {
                    int read = input.read(data, offset, data.length - offset);
                    if (read < 0) {
                        break;
                    }
                    offset += read;
                }
            } finally {
                input.close();
            }
        } catch (IOException ex) {
            throw new AssetException(500, "asset-tree.error.unexpected");
        }
        return new StoredFile(file.getFileName(), file.getContentType(), data);
    }

    @Override
    public void deleteFile(ApplicationUser user, int assetId, int fileId) {
        requireAssetCap(user, assetId, kindCap(requireAsset(assetId)));
        AssetFileEntity file = ao().get(AssetFileEntity.class, fileId);
        if (file == null || file.getAssetId() != assetId) {
            throw new AssetException(404, "asset-tree.error.notFound");
        }
        logActivity(assetId, user.getKey(), "file_delete", "", file.getFileName(), "");
        ao().delete(file);
        AssetFileStore.delete(fileId);
    }

    @Override
    public void deleteAsset(ApplicationUser user, int id, boolean cascade) {
        ao().executeInTransaction(new TransactionCallback<Void>() {
            @Override
            public Void doInTransaction() {
                AssetEntity entity = requireAssetCap(user, id, kindCap(requireAsset(id)));
                AssetEntity[] all = assetsIn(entity.getProjectKey());
                List<Integer> descendants = TreeLogic.descendants(childrenMap(all), id);
                if (!descendants.isEmpty() && !cascade) {
                    throw new AssetException(409, "asset-tree.error.hasChildren", Integer.valueOf(descendants.size()));
                }
                List<Integer> toDelete = new ArrayList<Integer>(descendants);
                toDelete.add(Integer.valueOf(id));
                List<Integer> fileIds = new ArrayList<Integer>();
                for (Integer assetId : toDelete) {
                    for (AssetFileEntity file : ao().find(AssetFileEntity.class, Query.select().where("ASSET_ID = ?", assetId))) {
                        fileIds.add(file.getID());
                    }
                    ao().deleteWithSQL(AssetAttributeEntity.class, "ASSET_ID = ?", assetId);
                    ao().deleteWithSQL(AssetIssueLinkEntity.class, "ASSET_ID = ?", assetId);
                    ao().deleteWithSQL(InventoryMarkEntity.class, "ASSET_ID = ?", assetId);
                    ao().deleteWithSQL(AssetCommentEntity.class, "ASSET_ID = ?", assetId);
                    ao().deleteWithSQL(AssetFileEntity.class, "ASSET_ID = ?", assetId);
                    ao().deleteWithSQL(AssetActivityEntity.class, "ASSET_ID = ?", assetId);
                    deletePortalRulesFor(assetId.intValue());
                }
                for (Integer fileId : fileIds) {
                    AssetFileStore.delete(fileId.intValue());
                }
                for (int i = descendants.size() - 1; i >= 0; i--) {
                    AssetEntity child = ao().get(AssetEntity.class, descendants.get(i));
                    if (child != null) {
                        ao().delete(child);
                    }
                }
                ao().delete(entity);
                return null;
            }
        });
    }

    @Override
    public AssetDto moveAsset(ApplicationUser user, int id, MoveDraft move) {
        if (move == null) {
            throw new AssetException(400, "asset-tree.error.parent");
        }
        return ao().executeInTransaction(new TransactionCallback<AssetDto>() {
            @Override
            public AssetDto doInTransaction() {
                AssetEntity moving = requireAssetCap(user, id, kindCap(requireAsset(id)));
                Integer parentId = TreeLogic.normalizeParent(move.getParentId());
                if (parentId != null) {
                    AssetEntity parent = requireReadable(user, parentId.intValue());
                    if (!ProjectKeys.same(parent.getProjectKey(), moving.getProjectKey())) {
                        throw new AssetException(400, "asset-tree.error.project.mismatch");
                    }
                }
                AssetEntity[] all = assetsIn(moving.getProjectKey());
                Map<Integer, Integer> parents = parentMap(all);
                if (parentId != null && !parents.containsKey(parentId)) {
                    throw new AssetException(400, "asset-tree.error.parent");
                }
                if (TreeLogic.wouldCycle(parents, id, parentId)) {
                    throw new AssetException(400, "asset-tree.error.cycle");
                }
                int baseDepth = parentId == null ? 0 : TreeLogic.depth(parents, parentId.intValue()) + 1;
                int extra = TreeLogic.subtreeHeight(childrenMap(all), id);
                if (baseDepth >= TreeLogic.MAX_DEPTH || baseDepth + extra >= TreeLogic.MAX_DEPTH) {
                    throw new AssetException(400, "asset-tree.error.depth");
                }
                List<AssetEntity> siblings = new ArrayList<AssetEntity>();
                for (AssetEntity candidate : all) {
                    if (candidate.getID() == id) {
                        continue;
                    }
                    if (TreeLogic.sameParent(candidate.getParentId(), parentId)) {
                        siblings.add(candidate);
                    }
                }
                Collections.sort(siblings, SIBLING_ORDER);
                Integer previousParent = TreeLogic.normalizeParent(moving.getParentId());
                int index = move.getIndex() == null ? siblings.size() : move.getIndex().intValue();
                if (index < 0) {
                    index = 0;
                }
                if (index > siblings.size()) {
                    index = siblings.size();
                }
                moving.setParentId(parentId);
                moving.setUpdated(new Date());
                moving.setUpdatedBy(user.getKey());
                if (!TreeLogic.sameParent(previousParent, parentId)) {
                    logActivity(id, user.getKey(), "move", "", parentName(previousParent), parentName(parentId));
                }
                siblings.add(index, moving);
                for (int i = 0; i < siblings.size(); i++) {
                    AssetEntity sibling = siblings.get(i);
                    sibling.setSortOrder(i);
                    sibling.save();
                }
                return toDto(moving, attributesFor(id), indexTypes(typeDtos(moving.getProjectKey(), all)), indexAssets(all), true);
            }
        });
    }

    @Override
    public AssetTypeDto createType(ApplicationUser user, TypeDraft draft) {
        if (draft == null) {
            throw new AssetException(400, "asset-tree.error.type.label");
        }
        Project project = requireConfigurableProject(user, draft.getProjectKey());
        String labelError = AssetValidator.validateTypeLabel(draft.getLabel());
        if (labelError != null) {
            throw new AssetException(400, labelError);
        }
        String color = draft.getColor();
        if (color == null || color.trim().isEmpty()) {
            color = DefaultTypes.PALETTE[Math.floorMod(draft.getLabel().hashCode(), DefaultTypes.PALETTE.length)];
        }
        String colorError = AssetValidator.validateColor(color);
        if (colorError != null) {
            throw new AssetException(400, colorError);
        }
        final String chosenColor = color;
        final String chosenIcon = resolveIcon(draft.getIcon(), draft.isLocation());
        return ao().executeInTransaction(new TransactionCallback<AssetTypeDto>() {
            @Override
            public AssetTypeDto doInTransaction() {
                AssetTypeEntity[] existing = ao().find(AssetTypeEntity.class);
                Set<String> taken = new HashSet<String>();
                int maxOrder = -1;
                for (AssetTypeEntity type : existing) {
                    taken.add(type.getTypeKey());
                    if (ProjectKeys.same(type.getProjectKey(), project.getKey()) && type.getSortOrder() > maxOrder) {
                        maxOrder = type.getSortOrder();
                    }
                }
                String key = TreeLogic.uniqueKey(TreeLogic.slug(draft.getLabel()), taken);
                if (!AssetValidator.isTypeKey(key)) {
                    throw new AssetException(400, "asset-tree.error.type.duplicate");
                }
                AssetTypeEntity created = ao().create(AssetTypeEntity.class,
                        new DBParam("TYPE_KEY", key),
                        new DBParam("LABEL", draft.getLabel().trim()),
                        new DBParam("COLOR", chosenColor),
                        new DBParam("ICON", chosenIcon),
                        new DBParam("SYSTEM_TYPE", Boolean.FALSE),
                        new DBParam("SORT_ORDER", maxOrder + 1),
                        new DBParam("PROJECT_KEY", project.getKey()),
                        new DBParam("BASE_KEY", ""),
                        new DBParam("LOCATION", Boolean.valueOf(draft.isLocation())),
                        new DBParam("SHOW_IN_TREE", Boolean.valueOf(draft.isLocation() || Boolean.TRUE.equals(draft.getShowInTree()))));
                return toTypeDto(created, i18n(), 0);
            }
        });
    }

    @Override
    public AssetTypeDto updateType(ApplicationUser user, String typeKey, TypeDraft draft) {
        if (draft == null) {
            throw new AssetException(400, "asset-tree.error.type.notFound");
        }
        return ao().executeInTransaction(new TransactionCallback<AssetTypeDto>() {
            @Override
            public AssetTypeDto doInTransaction() {
                AssetTypeEntity type = findType(typeKey);
                if (type == null) {
                    throw new AssetException(404, "asset-tree.error.type.notFound");
                }
                requireConfigurableProject(user, type.getProjectKey());
                if (draft.getShowInTree() != null) {
                    type.setShowInTree(type.isLocation() || draft.getShowInTree().booleanValue());
                }
                if (draft.getIcon() != null) {
                    type.setIcon(resolveIcon(draft.getIcon(), type.isLocation()));
                }
                if (draft.getColor() != null) {
                    String colorError = AssetValidator.validateColor(draft.getColor().trim());
                    if (colorError != null) {
                        throw new AssetException(400, colorError);
                    }
                    type.setColor(draft.getColor().trim());
                }
                type.save();
                int count = ao().count(AssetEntity.class, "TYPE_KEY = ?", type.getTypeKey());
                return toTypeDto(type, i18n(), count);
            }
        });
    }

    @Override
    public void deleteType(ApplicationUser user, String typeKey) {
        ao().executeInTransaction(new TransactionCallback<Void>() {
            @Override
            public Void doInTransaction() {
                AssetTypeEntity type = findType(typeKey);
                if (type == null) {
                    throw new AssetException(404, "asset-tree.error.type.notFound");
                }
                requireConfigurableProject(user, type.getProjectKey());
                if (type.isSystemType()) {
                    throw new AssetException(400, "asset-tree.error.type.system");
                }
                int used = ao().count(AssetEntity.class, "TYPE_KEY = ?", type.getTypeKey());
                if (used > 0) {
                    throw new AssetException(409, "asset-tree.error.type.inUse");
                }
                ao().deleteWithSQL(AssetFieldEntity.class, "TYPE_KEY = ?", type.getTypeKey());
                ao().delete(type);
                return null;
            }
        });
    }

    @Override
    public FieldDto addField(ApplicationUser user, String typeKey, FieldDraft draft) {
        if (draft == null) {
            throw new AssetException(400, "asset-tree.error.field.label");
        }
        String labelError = AssetValidator.validateTypeLabel(draft.getLabel());
        if (labelError != null) {
            throw new AssetException(400, "asset-tree.error.field.label");
        }
        if (!FieldKinds.isKind(draft.getKind())) {
            throw new AssetException(400, "asset-tree.error.field.kind");
        }
        return ao().executeInTransaction(new TransactionCallback<FieldDto>() {
            @Override
            public FieldDto doInTransaction() {
                AssetTypeEntity type = findType(typeKey);
                if (type == null) {
                    throw new AssetException(404, "asset-tree.error.type.notFound");
                }
                requireConfigurableProject(user, type.getProjectKey());
                AssetFieldEntity[] existing = fields(type.getTypeKey());
                Set<String> taken = new HashSet<String>();
                int max = -1;
                for (AssetFieldEntity field : existing) {
                    taken.add(field.getFieldKey());
                    if (field.getPosition() > max) {
                        max = field.getPosition();
                    }
                }
                String fieldKey = TreeLogic.uniqueKey(TreeLogic.slug(draft.getLabel()), taken);
                if (!AssetValidator.isTypeKey(fieldKey)) {
                    throw new AssetException(400, "asset-tree.error.field.label");
                }
                AssetFieldEntity created = ao().create(AssetFieldEntity.class,
                        new DBParam("TYPE_KEY", type.getTypeKey()),
                        new DBParam("FIELD_KEY", fieldKey),
                        new DBParam("SCOPE_KEY", type.getTypeKey() + ":" + fieldKey),
                        new DBParam("LABEL", draft.getLabel().trim()),
                        new DBParam("KIND", draft.getKind()),
                        new DBParam("REQUIRED", Boolean.valueOf(draft.isRequired())),
                        new DBParam("POSITION", max + 1));
                return toFieldDto(created, i18n());
            }
        });
    }

    @Override
    public void deleteField(ApplicationUser user, String typeKey, String fieldKey) {
        ao().executeInTransaction(new TransactionCallback<Void>() {
            @Override
            public Void doInTransaction() {
                AssetTypeEntity type = findType(typeKey);
                if (type == null) {
                    throw new AssetException(404, "asset-tree.error.type.notFound");
                }
                requireConfigurableProject(user, type.getProjectKey());
                AssetFieldEntity field = findField(type.getTypeKey(), fieldKey);
                if (field == null) {
                    throw new AssetException(404, "asset-tree.error.field.notFound");
                }
                AssetEntity[] assets = ao().find(AssetEntity.class, Query.select().where("TYPE_KEY = ?", type.getTypeKey()));
                for (AssetEntity asset : assets) {
                    ao().deleteWithSQL(AssetAttributeEntity.class, "ASSET_ID = ? AND ATTR_NAME = ?", asset.getID(), field.getFieldKey());
                }
                ao().delete(field);
                return null;
            }
        });
    }

    @Override
    public List<StatusDto> listStatuses(ApplicationUser user, final String projectKey) {
        final Project project = requireReadableProject(user, projectKey);
        return ao().executeInTransaction(new TransactionCallback<List<StatusDto>>() {
            @Override
            public List<StatusDto> doInTransaction() {
                return statusDtos(project.getKey(), assetsIn(project.getKey()));
            }
        });
    }

    @Override
    public StatusDto createStatus(ApplicationUser user, String projectKey, final StatusDraft draft) {
        final Project project = requireConfigurableProject(user, projectKey);
        if (draft == null || draft.getLabel() == null || draft.getLabel().trim().isEmpty()) {
            throw new AssetException(400, "asset-tree.error.status");
        }
        final String category = normalizeCategory(draft.getCategory());
        return ao().executeInTransaction(new TransactionCallback<StatusDto>() {
            @Override
            public StatusDto doInTransaction() {
                ensureStatuses(project.getKey());
                ProjectStatusEntity[] existing = projectStatuses(project.getKey());
                Set<String> taken = new HashSet<String>();
                int maxOrder = -1;
                for (ProjectStatusEntity row : existing) {
                    taken.add(row.getStatusKey());
                    if (row.getSortOrder() > maxOrder) {
                        maxOrder = row.getSortOrder();
                    }
                }
                String key = TreeLogic.uniqueKey(TreeLogic.slug(draft.getLabel()), taken);
                if (!AssetValidator.isStatusKey(key)) {
                    throw new AssetException(400, "asset-tree.error.status");
                }
                ProjectStatusEntity created = ao().create(ProjectStatusEntity.class,
                        new DBParam("PROJECT_KEY", project.getKey()),
                        new DBParam("STATUS_KEY", key),
                        new DBParam("LABEL", draft.getLabel().trim()),
                        new DBParam("CATEGORY", category),
                        new DBParam("SORT_ORDER", maxOrder + 1));
                return toStatusDto(created, Integer.valueOf(0));
            }
        });
    }

    @Override
    public StatusDto updateStatus(ApplicationUser user, String projectKey, final String statusKey, final StatusDraft draft) {
        final Project project = requireConfigurableProject(user, projectKey);
        if (draft == null) {
            throw new AssetException(400, "asset-tree.error.status");
        }
        return ao().executeInTransaction(new TransactionCallback<StatusDto>() {
            @Override
            public StatusDto doInTransaction() {
                ensureStatuses(project.getKey());
                ProjectStatusEntity row = findStatus(project.getKey(), statusKey);
                if (row == null) {
                    throw new AssetException(404, "asset-tree.error.status");
                }
                if (draft.getLabel() != null) {
                    if (draft.getLabel().trim().isEmpty()) {
                        throw new AssetException(400, "asset-tree.error.status");
                    }
                    row.setLabel(draft.getLabel().trim());
                }
                if (draft.getCategory() != null && !draft.getCategory().trim().isEmpty()) {
                    row.setCategory(normalizeCategory(draft.getCategory()));
                }
                row.save();
                return toStatusDto(row, Integer.valueOf(countStatus(project.getKey(), row.getStatusKey())));
            }
        });
    }

    @Override
    public void deleteStatus(ApplicationUser user, String projectKey, final String statusKey) {
        final Project project = requireConfigurableProject(user, projectKey);
        ao().executeInTransaction(new TransactionCallback<Void>() {
            @Override
            public Void doInTransaction() {
                ensureStatuses(project.getKey());
                ProjectStatusEntity[] rows = projectStatuses(project.getKey());
                if (rows.length <= 1) {
                    throw new AssetException(400, "asset-tree.error.status.last");
                }
                ProjectStatusEntity row = findStatus(project.getKey(), statusKey);
                if (row == null) {
                    throw new AssetException(404, "asset-tree.error.status");
                }
                if (countStatus(project.getKey(), row.getStatusKey()) > 0) {
                    throw new AssetException(409, "asset-tree.error.status.inUse");
                }
                ao().delete(row);
                return null;
            }
        });
    }

    @Override
    public List<GrantDto> listGrants(ApplicationUser user, final String projectKey) {
        final Project project = requireProjectCap(user, projectKey, GrantCaps.ACCESS);
        return ao().executeInTransaction(new TransactionCallback<List<GrantDto>>() {
            @Override
            public List<GrantDto> doInTransaction() {
                return grantDtos(project.getKey());
            }
        });
    }

    @Override
    public GrantDto addGrant(ApplicationUser user, String projectKey, final GrantDraft draft) {
        final Project project = requireProjectCap(user, projectKey, GrantCaps.ACCESS);
        if (draft == null || draft.getGroupName() == null || draft.getGroupName().trim().isEmpty()) {
            throw new AssetException(400, "asset-tree.error.group");
        }
        final String groupName = draft.getGroupName().trim();
        final String caps = resolveCaps(draft);
        final String level = GrantCaps.levelOf(caps);
        if (!groupExists(groupName)) {
            throw new AssetException(400, "asset-tree.error.group");
        }
        final boolean administrator = GrantCaps.has(caps, GrantCaps.ADMIN);
        if (administrator && !hasCap(user, project, GrantCaps.ADMIN)) {
            throw new AssetException(403, "asset-tree.error.forbidden");
        }
        return ao().executeInTransaction(new TransactionCallback<GrantDto>() {
            @Override
            public GrantDto doInTransaction() {
                ProjectGrantEntity global = findGrant(GrantCaps.ALL_PROJECTS, groupName);
                if (global != null && GrantCaps.has(global.getCaps(), GrantCaps.ADMIN) && !hasCap(user, project, GrantCaps.ADMIN)) {
                    throw new AssetException(403, "asset-tree.error.forbidden");
                }
                String storedKey = administrator ? GrantCaps.ALL_PROJECTS : project.getKey();
                if (administrator) {
                    ProjectGrantEntity local = findGrant(project.getKey(), groupName);
                    if (local != null) {
                        ao().delete(local);
                    }
                } else if (global != null) {
                    ao().delete(global);
                    global = null;
                }
                ProjectGrantEntity row = findGrant(storedKey, groupName);
                if (row == null) {
                    row = ao().create(ProjectGrantEntity.class,
                            new DBParam("PROJECT_KEY", storedKey),
                            new DBParam("GROUP_NAME", groupName),
                            new DBParam("LEVEL", level),
                            new DBParam("CAPS", caps));
                } else {
                    row.setLevel(level);
                    row.setCaps(caps);
                    row.save();
                }
                return toGrantDto(row);
            }
        });
    }

    @Override
    public void deleteGrant(ApplicationUser user, String projectKey, final String groupName) {
        final Project project = requireProjectCap(user, projectKey, GrantCaps.ACCESS);
        if (groupName == null || groupName.trim().isEmpty()) {
            throw new AssetException(400, "asset-tree.error.group");
        }
        ao().executeInTransaction(new TransactionCallback<Void>() {
            @Override
            public Void doInTransaction() {
                String name = groupName.trim();
                ProjectGrantEntity row = findGrant(project.getKey(), name);
                ProjectGrantEntity global = findGrant(GrantCaps.ALL_PROJECTS, name);
                if (global != null && !hasCap(user, project, GrantCaps.ADMIN)) {
                    throw new AssetException(403, "asset-tree.error.forbidden");
                }
                if (row == null && global == null) {
                    throw new AssetException(404, "asset-tree.error.group");
                }
                if (row != null) {
                    ao().delete(row);
                }
                if (global != null) {
                    ao().delete(global);
                }
                return null;
            }
        });
    }

    @Override
    public List<GrantDto> searchGroups(ApplicationUser user, String query) {
        requireUser(user);
        List<GrantDto> found = new ArrayList<GrantDto>();
        if (query == null || query.trim().isEmpty() || !canSearchGroups(user)) {
            return found;
        }
        String needle = query.trim().toLowerCase(Locale.ROOT);
        Collection<Group> groups = groupManager().getAllGroups();
        if (groups == null) {
            return found;
        }
        for (Group group : groups) {
            if (group == null || group.getName() == null) {
                continue;
            }
            if (!group.getName().toLowerCase(Locale.ROOT).contains(needle)) {
                continue;
            }
            GrantDto dto = new GrantDto();
            dto.setGroupName(group.getName());
            found.add(dto);
            if (found.size() >= 15) {
                break;
            }
        }
        return found;
    }

    @Override
    public IssueRefDto linkIssue(ApplicationUser user, int assetId, String issueKey) {
        Issue issue = requireIssue(user, issueKey);
        return link(user, assetId, issue, true);
    }

    @Override
    public AssetDto linkAssetToIssue(ApplicationUser user, long issueId, int assetId) {
        Issue issue = issueManager().getIssueObject(Long.valueOf(issueId));
        if (!canBrowse(user, issue)) {
            throw new AssetException(404, "asset-tree.error.issue.notFound");
        }
        if (!canWorkIssue(user, issue)) {
            throw new AssetException(403, "asset-tree.error.forbidden");
        }
        link(user, assetId, issue, false);
        return getAsset(user, assetId);
    }

    @Override
    public void unlinkIssue(ApplicationUser user, int assetId, long issueId) {
        ao().executeInTransaction(new TransactionCallback<Void>() {
            @Override
            public Void doInTransaction() {
                AssetEntity asset = requireVisible(user, assetId);
                Issue issue = issueManager().getIssueObject(Long.valueOf(issueId));
                Project project = project(asset.getProjectKey());
                if (!canWrite(user, project) && !canEditIssue(user, issue)) {
                    throw new AssetException(403, "asset-tree.error.forbidden");
                }
                ao().deleteWithSQL(AssetIssueLinkEntity.class, "ASSET_ID = ? AND ISSUE_ID = ?", assetId, issueId);
                return null;
            }
        });
    }

    @Override
    public List<AssetDto> assetsForIssue(ApplicationUser user, long issueId) {
        requireUser(user);
        Issue issue = issueManager().getIssueObject(Long.valueOf(issueId));
        if (!canBrowse(user, issue)) {
            throw new AssetException(404, "asset-tree.error.issue.notFound");
        }
        return linkedAssets(user, issueId);
    }

    @Override
    public List<AssetDto> searchForIssue(ApplicationUser user, long issueId, String query) {
        Issue issue = issueManager().getIssueObject(Long.valueOf(issueId));
        if (!canBrowse(user, issue) || issue.getProjectObject() == null) {
            throw new AssetException(404, "asset-tree.error.issue.notFound");
        }
        return listAssets(user, issue.getProjectObject().getKey(), query).getAssets();
    }

    @Override
    public IssueContextDto issueContext(ApplicationUser user, long issueId) {
        requireUser(user);
        Issue issue = issueManager().getIssueObject(Long.valueOf(issueId));
        if (!canBrowse(user, issue) || issue.getProjectObject() == null) {
            throw new AssetException(404, "asset-tree.error.issue.notFound");
        }
        Project project = issue.getProjectObject();
        IssueContextDto dto = new IssueContextDto();
        dto.setProjectKey(project.getKey());
        dto.setProjectName(project.getName());
        dto.setCanEdit(canWrite(user, project) || canEditIssue(user, issue));
        return dto;
    }

    @Override
    public ReportDto report(ApplicationUser user, String projectKey) {
        Project project = requireReadableProject(user, projectKey);
        return ao().executeInTransaction(new TransactionCallback<ReportDto>() {
            @Override
            public ReportDto doInTransaction() {
                AssetEntity[] rows = assetsIn(project.getKey());
                List<AssetTypeDto> types = typeDtos(project.getKey(), rows);
                Map<String, AssetTypeDto> typeIndex = indexTypes(types);
                ReportDto report = new ReportDto();
                report.setProjectKey(project.getKey());
                report.setProjectName(project.getName());
                report.setTotal(rows.length);
                List<StatusDto> statuses = statusDtos(project.getKey(), rows);
                Map<String, StatusDto> statusIndex = new LinkedHashMap<String, StatusDto>();
                Map<String, Integer> statusCounts = new LinkedHashMap<String, Integer>();
                for (StatusDto status : statuses) {
                    statusIndex.put(status.getStatusKey(), status);
                    statusCounts.put(status.getStatusKey(), Integer.valueOf(0));
                }
                Map<String, Integer> typeCounts = new LinkedHashMap<String, Integer>();
                Map<String, Integer> holderCounts = new HashMap<String, Integer>();
                Map<Integer, Boolean> locationAsset = new HashMap<Integer, Boolean>();
                int equipment = 0;
                int unassigned = 0;
                for (AssetEntity row : rows) {
                    AssetTypeDto type = typeIndex.get(row.getTypeKey());
                    boolean location = type != null && type.isLocation();
                    locationAsset.put(row.getID(), Boolean.valueOf(location));
                    if (location) {
                        continue;
                    }
                    equipment++;
                    String status = Statuses.canonical(row.getStatus());
                    Integer statusCount = statusCounts.get(status);
                    statusCounts.put(status, Integer.valueOf((statusCount == null ? 0 : statusCount.intValue()) + 1));
                    Integer typeCount = typeCounts.get(row.getTypeKey());
                    typeCounts.put(row.getTypeKey(), Integer.valueOf((typeCount == null ? 0 : typeCount.intValue()) + 1));
                    if (row.getCustodianKey() == null || row.getCustodianKey().isEmpty()) {
                        unassigned++;
                    } else {
                        Integer held = holderCounts.get(row.getCustodianKey());
                        holderCounts.put(row.getCustodianKey(), Integer.valueOf((held == null ? 0 : held.intValue()) + 1));
                    }
                }
                report.setEquipment(equipment);
                report.setUnassigned(unassigned);
                List<ReportBucketDto> byStatus = new ArrayList<ReportBucketDto>();
                for (Map.Entry<String, Integer> entry : statusCounts.entrySet()) {
                    if (entry.getValue().intValue() == 0) {
                        continue;
                    }
                    StatusDto known = statusIndex.get(entry.getKey());
                    String label = known == null ? statusText(entry.getKey()) : known.getLabel();
                    String color = known == null ? null : categoryColor(known.getCategory());
                    byStatus.add(new ReportBucketDto(entry.getKey(), label, color, entry.getValue().intValue()));
                }
                report.setByStatus(byStatus);
                List<ReportBucketDto> byType = new ArrayList<ReportBucketDto>();
                for (AssetTypeDto type : types) {
                    Integer count = typeCounts.get(type.getTypeKey());
                    if (count == null || count.intValue() == 0) {
                        continue;
                    }
                    ReportBucketDto bucket = new ReportBucketDto(type.getTypeKey(), type.getLabel(), type.getColor(), count.intValue());
                    bucket.setIcon(type.getIcon());
                    byType.add(bucket);
                }
                report.setByType(byType);
                Map<Integer, List<Integer>> children = childrenMap(rows);
                List<ReportPlaceDto> places = new ArrayList<ReportPlaceDto>();
                for (AssetEntity row : rows) {
                    if (!Boolean.TRUE.equals(locationAsset.get(row.getID()))) {
                        continue;
                    }
                    int nested = 0;
                    for (Integer descendant : TreeLogic.descendants(children, row.getID())) {
                        if (!Boolean.TRUE.equals(locationAsset.get(descendant))) {
                            nested++;
                        }
                    }
                    ReportPlaceDto place = new ReportPlaceDto();
                    place.setId(row.getID());
                    place.setName(row.getName());
                    AssetTypeDto type = typeIndex.get(row.getTypeKey());
                    place.setTypeLabel(type == null ? row.getTypeKey() : type.getLabel());
                    place.setEquipment(nested);
                    places.add(place);
                }
                Collections.sort(places, new Comparator<ReportPlaceDto>() {
                    @Override
                    public int compare(ReportPlaceDto left, ReportPlaceDto right) {
                        return Integer.compare(right.getEquipment(), left.getEquipment());
                    }
                });
                report.setPlaces(places);
                List<ReportHolderDto> holders = new ArrayList<ReportHolderDto>();
                for (Map.Entry<String, Integer> entry : holderCounts.entrySet()) {
                    ReportHolderDto holder = new ReportHolderDto();
                    holder.setUser(profile(entry.getKey()));
                    holder.setCount(entry.getValue().intValue());
                    holders.add(holder);
                }
                Collections.sort(holders, new Comparator<ReportHolderDto>() {
                    @Override
                    public int compare(ReportHolderDto left, ReportHolderDto right) {
                        return Integer.compare(right.getCount(), left.getCount());
                    }
                });
                if (holders.size() > 8) {
                    holders = new ArrayList<ReportHolderDto>(holders.subList(0, 8));
                }
                report.setHolders(holders);
                return report;
            }
        });
    }

    @Override
    public InventoryDto inventory(ApplicationUser user, String projectKey) {
        Project project = requireReadableProject(user, projectKey);
        return ao().executeInTransaction(new TransactionCallback<InventoryDto>() {
            @Override
            public InventoryDto doInTransaction() {
                AssetEntity[] rows = assetsIn(project.getKey());
                Map<String, AssetTypeDto> types = indexTypes(typeDtos(project.getKey(), rows));
                Map<Integer, AssetEntity> index = indexAssets(rows);
                Map<Integer, InventoryMarkEntity> marks = new HashMap<Integer, InventoryMarkEntity>();
                for (InventoryMarkEntity mark : ao().find(InventoryMarkEntity.class)) {
                    marks.put(Integer.valueOf(mark.getAssetId()), mark);
                }
                List<InventoryRowDto> list = new ArrayList<InventoryRowDto>();
                int checked = 0;
                for (AssetEntity row : rows) {
                    AssetTypeDto type = types.get(row.getTypeKey());
                    if (type != null && type.isLocation()) {
                        continue;
                    }
                    InventoryRowDto item = inventoryRow(row, type, index, marks.get(Integer.valueOf(row.getID())));
                    if (item.isChecked()) {
                        checked++;
                    }
                    list.add(item);
                }
                Collections.sort(list, new Comparator<InventoryRowDto>() {
                    @Override
                    public int compare(InventoryRowDto left, InventoryRowDto right) {
                        int byPlace = left.getLocation().compareToIgnoreCase(right.getLocation());
                        if (byPlace != 0) {
                            return byPlace;
                        }
                        return left.getName().compareToIgnoreCase(right.getName());
                    }
                });
                InventoryDto dto = new InventoryDto();
                dto.setTotal(list.size());
                dto.setChecked(checked);
                dto.setRows(list);
                return dto;
            }
        });
    }

    @Override
    public InventoryRowDto markInventory(ApplicationUser user, int id, final boolean checked) {
        return ao().executeInTransaction(new TransactionCallback<InventoryRowDto>() {
            @Override
            public InventoryRowDto doInTransaction() {
                AssetEntity entity = requireWritable(user, id);
                InventoryMarkEntity[] existing = ao().find(InventoryMarkEntity.class, Query.select().where("ASSET_ID = ?", entity.getID()));
                InventoryMarkEntity mark = existing.length == 0 ? null : existing[0];
                if (!checked) {
                    if (mark != null) {
                        ao().delete(mark);
                    }
                    for (int i = 1; i < existing.length; i++) {
                        ao().delete(existing[i]);
                    }
                    mark = null;
                } else if (mark == null) {
                    mark = ao().create(InventoryMarkEntity.class,
                            new DBParam("ASSET_ID", entity.getID()),
                            new DBParam("CHECKED_AT", new Date()),
                            new DBParam("CHECKED_BY", user.getKey()));
                } else {
                    mark.setCheckedAt(new Date());
                    mark.setCheckedBy(user.getKey());
                    mark.save();
                }
                AssetEntity[] rows = assetsIn(entity.getProjectKey());
                Map<String, AssetTypeDto> types = indexTypes(typeDtos(entity.getProjectKey(), rows));
                return inventoryRow(entity, types.get(entity.getTypeKey()), indexAssets(rows), mark);
            }
        });
    }

    private InventoryRowDto inventoryRow(AssetEntity row, AssetTypeDto type, Map<Integer, AssetEntity> index, InventoryMarkEntity mark) {
        InventoryRowDto item = new InventoryRowDto();
        item.setId(row.getID());
        item.setName(row.getName());
        item.setObjectKey(row.getObjectKey());
        item.setTypeLabel(type == null ? row.getTypeKey() : type.getLabel());
        item.setStatus(Statuses.canonical(row.getStatus()));
        item.setLocation(location(row, index));
        List<Integer> ancestors = new ArrayList<Integer>();
        Integer cursor = TreeLogic.normalizeParent(row.getParentId());
        int guard = 0;
        while (cursor != null && guard < 80) {
            ancestors.add(cursor);
            AssetEntity parent = index.get(cursor);
            if (parent == null) {
                break;
            }
            cursor = TreeLogic.normalizeParent(parent.getParentId());
            guard++;
        }
        Collections.reverse(ancestors);
        item.setAncestors(ancestors);
        if (row.getCustodianKey() != null && !row.getCustodianKey().isEmpty()) {
            UserProfileDto person = profile(row.getCustodianKey());
            item.setCustodian(person == null ? "" : person.getDisplayName());
        } else {
            item.setCustodian("");
        }
        item.setChecked(mark != null);
        item.setCheckedAt(mark == null ? "" : format(mark.getCheckedAt()));
        item.setCheckedBy(mark == null ? "" : displayName(mark.getCheckedBy()));
        return item;
    }

    @Override
    public List<PickerNodeDto> picker(ApplicationUser user, String projectKey) {
        Project project = requireVisibleProject(user, projectKey);
        return ao().executeInTransaction(new TransactionCallback<List<PickerNodeDto>>() {
            @Override
            public List<PickerNodeDto> doInTransaction() {
                AssetEntity[] rows = assetsIn(project.getKey());
                Map<String, AssetTypeDto> types = indexTypes(typeDtos(project.getKey(), rows));
                List<AssetEntity> ordered = new ArrayList<AssetEntity>();
                Collections.addAll(ordered, rows);
                Collections.sort(ordered, SIBLING_ORDER);
                List<PickerNodeDto> nodes = new ArrayList<PickerNodeDto>();
                for (AssetEntity row : ordered) {
                    PickerNodeDto node = new PickerNodeDto();
                    node.setId(row.getID());
                    node.setParentId(TreeLogic.normalizeParent(row.getParentId()));
                    node.setName(row.getName());
                    node.setObjectKey(row.getObjectKey());
                    node.setStatus(Statuses.canonical(row.getStatus()));
                    AssetTypeDto type = types.get(row.getTypeKey());
                    node.setTypeLabel(type == null ? row.getTypeKey() : type.getLabel());
                    nodes.add(node);
                }
                return nodes;
            }
        });
    }

    @Override
    public List<PortalRuleDto> listPortalRules(ApplicationUser user, String projectKey) {
        final Project project = requireVisibleProject(user, projectKey);
        return ao().executeInTransaction(new TransactionCallback<List<PortalRuleDto>>() {
            @Override
            public List<PortalRuleDto> doInTransaction() {
                return portalRules(project.getKey());
            }
        });
    }

    @Override
    public PortalRuleDto addPortalRule(ApplicationUser user, String projectKey, PortalRuleDraft draft) {
        final Project project = requireConfigurableProject(user, projectKey);
        if (draft == null || draft.getAssetId() <= 0) {
            throw new AssetException(400, "asset-tree.error.portal.target");
        }
        final List<PortalConditionDraft> conditions = cleanConditions(draft.getConditions());
        return ao().executeInTransaction(new TransactionCallback<PortalRuleDto>() {
            @Override
            public PortalRuleDto doInTransaction() {
                AssetEntity asset = ao().get(AssetEntity.class, draft.getAssetId());
                if (asset == null || !ProjectKeys.same(asset.getProjectKey(), project.getKey())) {
                    throw new AssetException(400, "asset-tree.error.portal.target");
                }
                int position = 1;
                for (PortalRuleEntity existing : ao().find(PortalRuleEntity.class, Query.select().where("PROJECT_KEY = ?", project.getKey()))) {
                    if (existing.getPosition() >= position) {
                        position = existing.getPosition() + 1;
                    }
                }
                PortalRuleEntity rule = ao().create(PortalRuleEntity.class,
                        new DBParam("PROJECT_KEY", project.getKey()),
                        new DBParam("ASSET_ID", draft.getAssetId()),
                        new DBParam("POSITION", position));
                for (int i = 0; i < conditions.size(); i++) {
                    PortalConditionDraft condition = conditions.get(i);
                    ao().create(PortalRuleConditionEntity.class,
                            new DBParam("RULE_ID", rule.getID()),
                            new DBParam("POSITION", i),
                            new DBParam("FIELD_NAME", condition.getField()),
                            new DBParam("OPTION_NAME", condition.getOption()));
                }
                return toPortalRule(rule);
            }
        });
    }

    @Override
    public void deletePortalRule(ApplicationUser user, String projectKey, int ruleId) {
        final Project project = requireConfigurableProject(user, projectKey);
        ao().executeInTransaction(new TransactionCallback<Void>() {
            @Override
            public Void doInTransaction() {
                PortalRuleEntity rule = ao().get(PortalRuleEntity.class, ruleId);
                if (rule == null || !ProjectKeys.same(rule.getProjectKey(), project.getKey())) {
                    throw new AssetException(404, "asset-tree.error.portal.missing");
                }
                ao().deleteWithSQL(PortalRuleConditionEntity.class, "RULE_ID = ?", ruleId);
                ao().delete(rule);
                return null;
            }
        });
    }

    private void deletePortalRulesFor(int assetId) {
        PortalRuleEntity[] rules = ao().find(PortalRuleEntity.class, Query.select().where("ASSET_ID = ?", assetId));
        for (PortalRuleEntity rule : rules) {
            ao().deleteWithSQL(PortalRuleConditionEntity.class, "RULE_ID = ?", rule.getID());
            ao().delete(rule);
        }
    }

    private List<PortalConditionDraft> cleanConditions(List<PortalConditionDraft> raw) {
        List<PortalConditionDraft> conditions = new ArrayList<PortalConditionDraft>();
        if (raw != null) {
            for (PortalConditionDraft item : raw) {
                if (item == null) {
                    continue;
                }
                String field = item.getField() == null ? "" : item.getField().trim().replaceAll("\\s+", " ");
                String option = item.getOption() == null ? "" : item.getOption().trim().replaceAll("\\s+", " ");
                if (field.isEmpty() || option.isEmpty()) {
                    continue;
                }
                if (field.length() > 255 || option.length() > 255) {
                    throw new AssetException(400, "asset-tree.error.portal.field");
                }
                boolean duplicate = false;
                for (PortalConditionDraft kept : conditions) {
                    if (kept.getField().equalsIgnoreCase(field)) {
                        duplicate = true;
                    }
                }
                if (duplicate) {
                    throw new AssetException(400, "asset-tree.error.portal.field");
                }
                PortalConditionDraft clean = new PortalConditionDraft();
                clean.setField(field);
                clean.setOption(option);
                conditions.add(clean);
                if (conditions.size() > 6) {
                    throw new AssetException(400, "asset-tree.error.portal.field");
                }
            }
        }
        if (conditions.isEmpty()) {
            throw new AssetException(400, "asset-tree.error.portal.conditions");
        }
        return conditions;
    }

    private List<PortalRuleDto> portalRules(String projectKey) {
        PortalRuleEntity[] rows = ao().find(PortalRuleEntity.class, Query.select().where("PROJECT_KEY = ?", projectKey));
        Arrays.sort(rows, new Comparator<PortalRuleEntity>() {
            @Override
            public int compare(PortalRuleEntity left, PortalRuleEntity right) {
                int byPosition = left.getPosition() - right.getPosition();
                if (byPosition != 0) {
                    return byPosition;
                }
                return left.getID() - right.getID();
            }
        });
        List<PortalRuleDto> result = new ArrayList<PortalRuleDto>();
        for (PortalRuleEntity row : rows) {
            result.add(toPortalRule(row));
        }
        return result;
    }

    private PortalRuleDto toPortalRule(PortalRuleEntity rule) {
        PortalRuleDto dto = new PortalRuleDto();
        dto.setId(rule.getID());
        dto.setAssetId(rule.getAssetId());
        dto.setPosition(rule.getPosition());
        AssetEntity asset = ao().get(AssetEntity.class, rule.getAssetId());
        if (asset != null) {
            dto.setAssetName(asset.getName());
            dto.setAssetPath(portalPath(asset));
        }
        PortalRuleConditionEntity[] conditions = ao().find(PortalRuleConditionEntity.class,
                Query.select().where("RULE_ID = ?", rule.getID()));
        Arrays.sort(conditions, new Comparator<PortalRuleConditionEntity>() {
            @Override
            public int compare(PortalRuleConditionEntity left, PortalRuleConditionEntity right) {
                return left.getPosition() - right.getPosition();
            }
        });
        List<PortalConditionDraft> items = new ArrayList<PortalConditionDraft>();
        for (PortalRuleConditionEntity condition : conditions) {
            PortalConditionDraft item = new PortalConditionDraft();
            item.setField(condition.getFieldName());
            item.setOption(condition.getOptionName());
            items.add(item);
        }
        dto.setConditions(items);
        return dto;
    }

    private String portalPath(AssetEntity entity) {
        List<String> names = new ArrayList<String>();
        AssetEntity cursor = entity;
        int guard = 0;
        while (cursor != null && guard < 40) {
            names.add(0, cursor.getName());
            Integer parentId = TreeLogic.normalizeParent(cursor.getParentId());
            cursor = parentId == null ? null : ao().get(AssetEntity.class, parentId.intValue());
            guard++;
        }
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < names.size(); i++) {
            if (i > 0) {
                builder.append(" / ");
            }
            builder.append(names.get(i));
        }
        return builder.toString();
    }

    @Override
    public List<UserProfileDto> searchUsers(ApplicationUser user, String query) {
        requireUser(user);
        String needle = query == null ? "" : query.trim();
        if (needle.length() < 2) {
            return Collections.emptyList();
        }
        List<ApplicationUser> found = userSearchService().findUsers(needle, UserSearchParams.LIMITED_ACTIVE_USERS_IGNORE_EMPTY_QUERY);
        List<UserProfileDto> profiles = new ArrayList<UserProfileDto>();
        if (found == null) {
            return profiles;
        }
        for (ApplicationUser match : found) {
            profiles.add(profile(match.getKey()));
            if (profiles.size() >= 8) {
                break;
            }
        }
        return profiles;
    }

    @Override
    public List<AssetDto> assetsForUser(ApplicationUser user, String userKey) {
        requireUser(user);
        if (userKey == null || userKey.trim().isEmpty() || userManager().getUserByKey(userKey.trim()) == null) {
            throw new AssetException(404, "asset-tree.error.user");
        }
        final String holder = userKey.trim();
        return ao().executeInTransaction(new TransactionCallback<List<AssetDto>>() {
            @Override
            public List<AssetDto> doInTransaction() {
                List<AssetDto> result = new ArrayList<AssetDto>();
                for (ProjectDto project : visibleProjects(user)) {
                    AssetEntity[] rows = assetsIn(project.getKey());
                    Map<String, AssetTypeDto> types = indexTypes(typeDtos(project.getKey(), rows));
                    Map<Integer, AssetEntity> index = indexAssets(rows);
                    Map<Integer, List<AssetAttributeEntity>> attributes = new HashMap<Integer, List<AssetAttributeEntity>>();
                    for (AssetEntity row : rows) {
                        attributes.put(row.getID(), attributesFor(row.getID()));
                    }
                    for (AssetEntity row : rows) {
                        String role = holderRole(row, attributes.get(row.getID()), types.get(row.getTypeKey()), holder);
                        if (role == null) {
                            continue;
                        }
                        AssetDto dto = toDto(row, attributes.get(row.getID()), types, index, false);
                        dto.setHolderRole(role);
                        dto.setProjectName(project.getName());
                        result.add(dto);
                    }
                }
                Collections.sort(result, new Comparator<AssetDto>() {
                    @Override
                    public int compare(AssetDto left, AssetDto right) {
                        String leftProject = left.getProjectName() == null ? "" : left.getProjectName();
                        String rightProject = right.getProjectName() == null ? "" : right.getProjectName();
                        int byProject = leftProject.compareToIgnoreCase(rightProject);
                        if (byProject != 0) {
                            return byProject;
                        }
                        return left.getName().compareToIgnoreCase(right.getName());
                    }
                });
                return result;
            }
        });
    }

    @Override
    public void syncRequestAsset(ApplicationUser user, Issue issue, String previousAssetId, String nextAssetId) {
        if (user == null || issue == null || issue.getProjectObject() == null || !canBrowse(user, issue)) {
            return;
        }
        Integer previous = parseId(previousAssetId);
        Integer next = parseId(nextAssetId);
        if (previous != null && (next == null || previous.intValue() != next.intValue())) {
            try {
                ao().executeInTransaction(new TransactionCallback<Void>() {
                    @Override
                    public Void doInTransaction() {
                        ao().deleteWithSQL(AssetIssueLinkEntity.class, "ASSET_ID = ? AND ISSUE_ID = ?", previous, issue.getId());
                        return null;
                    }
                });
            } catch (RuntimeException ex) {
                log.warn("Could not drop the previous asset link {}", previous, ex);
            }
        }
        if (next == null) {
            return;
        }
        try {
            link(user, next.intValue(), issue, false);
        } catch (AssetException ex) {
            if (ex.getStatus() != 409) {
                log.warn("Could not link asset {} to {}", next, issue.getKey());
            }
        }
    }

    @Override
    public String describeAsset(String assetId) {
        Integer id = parseId(assetId);
        if (id == null) {
            return assetId == null ? "" : assetId;
        }
        AssetEntity entity = ao().get(AssetEntity.class, id.intValue());
        if (entity == null) {
            return assetId;
        }
        ApplicationUser user = authenticationContext().getLoggedInUser();
        Project project = project(entity.getProjectKey());
        if (user == null || !canSee(user, project)) {
            return entity.getObjectKey();
        }
        return entity.getObjectKey() + "  " + entity.getName();
    }

    private IssueRefDto link(ApplicationUser user, int assetId, Issue issue, boolean requireWrite) {
        return ao().executeInTransaction(new TransactionCallback<IssueRefDto>() {
            @Override
            public IssueRefDto doInTransaction() {
                AssetEntity asset = requireWrite ? requireWritable(user, assetId) : requireVisible(user, assetId);
                if (issue.getProjectObject() == null || !ProjectKeys.same(asset.getProjectKey(), issue.getProjectObject().getKey())) {
                    throw new AssetException(400, "asset-tree.error.project.mismatch");
                }
                AssetIssueLinkEntity[] existing = ao().find(AssetIssueLinkEntity.class,
                        Query.select().where("ASSET_ID = ? AND ISSUE_ID = ?", assetId, issue.getId()));
                if (existing.length > 0) {
                    throw new AssetException(409, "asset-tree.error.issue.duplicate");
                }
                ao().create(AssetIssueLinkEntity.class,
                        new DBParam("ASSET_ID", assetId),
                        new DBParam("ISSUE_ID", issue.getId()));
                return toIssue(issue);
            }
        });
    }

    private List<AssetDto> linkedAssets(ApplicationUser user, long issueId) {
        return ao().executeInTransaction(new TransactionCallback<List<AssetDto>>() {
            @Override
            public List<AssetDto> doInTransaction() {
                AssetIssueLinkEntity[] links = ao().find(AssetIssueLinkEntity.class, Query.select().where("ISSUE_ID = ?", issueId));
                List<AssetDto> assets = new ArrayList<AssetDto>();
                for (AssetIssueLinkEntity link : links) {
                    AssetEntity entity = ao().get(AssetEntity.class, link.getAssetId());
                    if (entity == null) {
                        continue;
                    }
                    Project project = project(entity.getProjectKey());
                    if (!canOpen(user, project)) {
                        continue;
                    }
                    AssetEntity[] rows = assetsIn(entity.getProjectKey());
                    assets.add(toDto(entity, attributesFor(entity.getID()), indexTypes(typeDtos(entity.getProjectKey(), rows)), indexAssets(rows), false));
                }
                Collections.sort(assets, new Comparator<AssetDto>() {
                    @Override
                    public int compare(AssetDto left, AssetDto right) {
                        return left.getName().compareToIgnoreCase(right.getName());
                    }
                });
                return assets;
            }
        });
    }

    private String nextKey() {
        for (int attempt = 0; attempt < 5; attempt++) {
            AssetCounterEntity[] rows = ao().find(AssetCounterEntity.class);
            AssetCounterEntity counter = rows.length == 0
                    ? ao().create(AssetCounterEntity.class, new DBParam("NEXT_VALUE", 1))
                    : rows[0];
            int value = Math.max(counter.getNextValue(), 1);
            counter.setNextValue(value + 1);
            counter.save();
            String key = "AST-" + value;
            if (ao().count(AssetEntity.class, "OBJECT_KEY = ?", key) == 0) {
                return key;
            }
        }
        throw new AssetException(500, "asset-tree.error.unexpected");
    }

    private int nextSort(Integer parentId, String projectKey) {
        int max = -1;
        for (AssetEntity asset : assetsIn(projectKey)) {
            if (TreeLogic.sameParent(asset.getParentId(), parentId) && asset.getSortOrder() > max) {
                max = asset.getSortOrder();
            }
        }
        return max + 1;
    }

    private void replaceAttributes(AssetEntity entity, List<AttributeDraft> attributes) {
        Map<String, AssetFieldEntity> schema = new LinkedHashMap<String, AssetFieldEntity>();
        for (AssetFieldEntity field : fields(entity.getTypeKey())) {
            schema.put(field.getFieldKey(), field);
        }
        ao().deleteWithSQL(AssetAttributeEntity.class, "ASSET_ID = ?", entity.getID());
        Map<String, String> values = new HashMap<String, String>();
        if (attributes != null) {
            for (AttributeDraft attribute : attributes) {
                if (attribute == null || attribute.getFieldKey() == null) {
                    continue;
                }
                String fieldKey = attribute.getFieldKey().trim();
                if (!schema.containsKey(fieldKey) || values.containsKey(fieldKey)) {
                    continue;
                }
                values.put(fieldKey, attribute.getValue() == null ? "" : attribute.getValue());
            }
        }
        I18nHelper labels = i18n();
        int position = 0;
        for (AssetFieldEntity field : schema.values()) {
            String value = values.containsKey(field.getFieldKey()) ? values.get(field.getFieldKey()) : "";
            String trimmed = value == null ? "" : value.trim();
            if (field.isRequired() && trimmed.isEmpty()) {
                throw new AssetException(400, "asset-tree.error.field.required", fieldLabel(field, labels));
            }
            if (!trimmed.isEmpty() && FieldKinds.NUMBER.equals(field.getKind()) && !NUMBER.matcher(trimmed).matches()) {
                throw new AssetException(400, "asset-tree.error.number");
            }
            if (!trimmed.isEmpty() && FieldKinds.USER.equals(field.getKind()) && userManager().getUserByKey(trimmed) == null) {
                throw new AssetException(400, "asset-tree.error.user");
            }
            if (trimmed.length() > AssetValidator.MAX_ATTR_VALUE) {
                throw new AssetException(400, "asset-tree.error.attribute.value.length");
            }
            ao().create(AssetAttributeEntity.class,
                    new DBParam("ASSET_ID", entity.getID()),
                    new DBParam("ATTR_NAME", field.getFieldKey()),
                    new DBParam("ATTR_VALUE", value == null ? "" : value),
                    new DBParam("ATTR_POSITION", position));
            position++;
        }
    }

    private String normalizeCustodian(String userKey) {
        if (userKey == null || userKey.trim().isEmpty()) {
            return null;
        }
        ApplicationUser holder = userManager().getUserByKey(userKey.trim());
        if (holder == null) {
            throw new AssetException(400, "asset-tree.error.user");
        }
        return holder.getKey();
    }

    private String holderRole(AssetEntity asset, List<AssetAttributeEntity> attributes, AssetTypeDto type, String userKey) {
        if (userKey.equals(asset.getCustodianKey())) {
            return i18n().getText("asset-tree.ui.custodian");
        }
        if (attributes == null || type == null || type.getFields() == null) {
            return null;
        }
        Map<String, FieldDto> fields = new HashMap<String, FieldDto>();
        for (FieldDto field : type.getFields()) {
            fields.put(field.getFieldKey(), field);
        }
        for (AssetAttributeEntity attribute : attributes) {
            FieldDto field = fields.get(attribute.getAttrName());
            if (field != null && FieldKinds.USER.equals(field.getKind()) && userKey.equals(attribute.getAttrValue())) {
                return field.getLabel();
            }
        }
        return null;
    }

    private AssetEntity requireReadable(ApplicationUser user, int id) {
        AssetEntity entity = requireAsset(id);
        if (!canOpen(user, project(entity.getProjectKey()))) {
            throw new AssetException(404, "asset-tree.error.notFound");
        }
        return entity;
    }

    private AssetEntity requireVisible(ApplicationUser user, int id) {
        AssetEntity entity = requireAsset(id);
        if (!canSee(user, project(entity.getProjectKey()))) {
            throw new AssetException(404, "asset-tree.error.notFound");
        }
        return entity;
    }

    private AssetEntity requireWritable(ApplicationUser user, int id) {
        return requireAssetCap(user, id, kindCap(requireAsset(id)));
    }

    private String kindCap(AssetEntity entity) {
        AssetTypeEntity type = entity == null ? null : findType(entity.getTypeKey());
        return type != null && type.isLocation() ? GrantCaps.PLACES : GrantCaps.OBJECT;
    }

    private AssetEntity requireAsset(int id) {
        AssetEntity entity = ao().get(AssetEntity.class, id);
        if (entity == null) {
            throw new AssetException(404, "asset-tree.error.notFound");
        }
        return entity;
    }

    private Project requireReadableProject(ApplicationUser user, String projectKey) {
        requireUser(user);
        if (projectKey == null || projectKey.trim().isEmpty()) {
            throw new AssetException(400, "asset-tree.error.project.required");
        }
        Project project = project(projectKey.trim());
        if (project == null) {
            throw new AssetException(404, "asset-tree.error.project.notFound");
        }
        if (!canOpen(user, project)) {
            throw new AssetException(403, "asset-tree.error.project.forbidden");
        }
        return project;
    }

    private Project requireVisibleProject(ApplicationUser user, String projectKey) {
        requireUser(user);
        if (projectKey == null || projectKey.trim().isEmpty()) {
            throw new AssetException(400, "asset-tree.error.project.required");
        }
        Project project = project(projectKey.trim());
        if (project == null) {
            throw new AssetException(404, "asset-tree.error.project.notFound");
        }
        if (!canSee(user, project)) {
            throw new AssetException(403, "asset-tree.error.project.forbidden");
        }
        return project;
    }

    private Project requireConfigurableProject(ApplicationUser user, String projectKey) {
        requireUser(user);
        if (projectKey == null || projectKey.trim().isEmpty()) {
            throw new AssetException(400, "asset-tree.error.project.required");
        }
        Project project = project(projectKey.trim());
        if (project == null) {
            throw new AssetException(404, "asset-tree.error.project.notFound");
        }
        if (!canConfigure(user, project)) {
            if (!canOpen(user, project)) {
                throw new AssetException(403, "asset-tree.error.project.forbidden");
            }
            throw new AssetException(403, "asset-tree.error.forbidden");
        }
        return project;
    }

    private Project project(String projectKey) {
        if (projectKey == null || projectKey.trim().isEmpty()) {
            return null;
        }
        Project current = projectManager().getProjectByCurrentKey(projectKey.trim());
        return current != null ? current : projectManager().getProjectObjByKey(projectKey.trim());
    }

    private List<ProjectDto> visibleProjects(ApplicationUser user) {
        Map<String, Project> found = new LinkedHashMap<String, Project>();
        if (isAdmin(user)) {
            for (Project project : projectManager().getProjects()) {
                found.put(project.getKey(), project);
            }
        } else {
            collect(found, permissionManager().getProjects(ProjectPermissions.BROWSE_PROJECTS, user));
            collect(found, permissionManager().getProjects(ProjectPermissions.ADMINISTER_PROJECTS, user));
            includeGranted(user, found);
        }
        List<ProjectDto> projects = new ArrayList<ProjectDto>();
        for (Project project : found.values()) {
            ProjectDto dto = new ProjectDto();
            dto.setKey(project.getKey());
            dto.setName(project.getName());
            applyRights(dto, user, project);
            projects.add(dto);
        }
        Collections.sort(projects, new Comparator<ProjectDto>() {
            @Override
            public int compare(ProjectDto left, ProjectDto right) {
                return left.getName().compareToIgnoreCase(right.getName());
            }
        });
        return projects;
    }

    private void collect(Map<String, Project> found, Collection<Project> projects) {
        if (projects == null) {
            return;
        }
        for (Project project : projects) {
            if (project != null && project.getKey() != null) {
                found.put(project.getKey(), project);
            }
        }
    }

    private boolean canOpen(ApplicationUser user, Project project) {
        if (user == null || project == null) {
            return false;
        }
        if (isAdmin(user)) {
            return true;
        }
        return permissionManager().hasPermission(ProjectPermissions.BROWSE_PROJECTS, project, user)
                || permissionManager().hasPermission(ProjectPermissions.ADMINISTER_PROJECTS, project, user)
                || grantHas(user, project, GrantCaps.VIEW);
    }

    private boolean canSee(ApplicationUser user, Project project) {
        return canOpen(user, project)
                || (user != null && project != null
                && permissionManager().hasPermission(ProjectPermissions.CREATE_ISSUES, project, user));
    }

    private boolean canWrite(ApplicationUser user, Project project) {
        return hasCap(user, project, GrantCaps.OBJECT);
    }

    private boolean canConfigure(ApplicationUser user, Project project) {
        return hasCap(user, project, GrantCaps.TYPES);
    }

    private void applyRights(ProjectDto dto, ApplicationUser user, Project project) {
        boolean places = hasCap(user, project, GrantCaps.PLACES);
        boolean objects = hasCap(user, project, GrantCaps.OBJECT);
        boolean types = hasCap(user, project, GrantCaps.TYPES);
        boolean assets = hasCap(user, project, GrantCaps.ASSETS);
        boolean admin = hasCap(user, project, GrantCaps.ADMIN);
        dto.setCanPlaces(places);
        dto.setCanObjects(objects);
        dto.setCanTypes(types);
        dto.setCanAssets(assets);
        dto.setCanAdmin(admin);
        dto.setCanEdit(objects);
        dto.setCanChange(objects);
        dto.setCanCreate(objects);
        dto.setCanMove(places || objects);
        dto.setCanRemove(places || objects);
        dto.setCanComment(places || objects);
        dto.setCanConfigure(types);
        dto.setCanGrant(assets || admin);
    }

    private boolean hasCap(ApplicationUser user, Project project, String cap) {
        if (user == null || project == null) {
            return false;
        }
        if (isAdmin(user)) {
            return true;
        }
        if (grantHas(user, project, cap)) {
            return true;
        }
        if (GrantCaps.ADMIN.equals(cap)) {
            return false;
        }
        if (permissionManager().hasPermission(ProjectPermissions.ADMINISTER_PROJECTS, project, user)) {
            return true;
        }
        if (canOpen(user, project) && (hasGlobalManage(user)
                || permissionManager().hasPermission(EDIT_ASSETS, project, user))) {
            return true;
        }
        return false;
    }

    private Project requireProjectCap(ApplicationUser user, String projectKey, String cap) {
        requireUser(user);
        if (projectKey == null || projectKey.trim().isEmpty()) {
            throw new AssetException(400, "asset-tree.error.project.required");
        }
        Project project = project(projectKey.trim());
        if (project == null) {
            throw new AssetException(404, "asset-tree.error.project.notFound");
        }
        if (!hasCap(user, project, cap)) {
            if (!canOpen(user, project)) {
                throw new AssetException(403, "asset-tree.error.project.forbidden");
            }
            throw new AssetException(403, "asset-tree.error.forbidden");
        }
        return project;
    }

    private AssetEntity requireAssetCap(ApplicationUser user, int id, String cap) {
        AssetEntity entity = requireAsset(id);
        Project project = project(entity.getProjectKey());
        if (!hasCap(user, project, cap)) {
            if (!canOpen(user, project)) {
                throw new AssetException(404, "asset-tree.error.notFound");
            }
            throw new AssetException(403, "asset-tree.error.forbidden");
        }
        return entity;
    }

    private boolean canSearchGroups(ApplicationUser user) {
        if (isAdmin(user) || hasGlobalManage(user)) {
            return true;
        }
        for (ProjectDto project : visibleProjects(user)) {
            if (project.isCanGrant()) {
                return true;
            }
        }
        return false;
    }

    private boolean canEditIssue(ApplicationUser user, Issue issue) {
        return issue != null && permissionManager().hasPermission(ProjectPermissions.EDIT_ISSUES, issue, user);
    }

    private boolean canWorkIssue(ApplicationUser user, Issue issue) {
        if (issue == null || issue.getProjectObject() == null) {
            return false;
        }
        return canEditIssue(user, issue) || canWrite(user, issue.getProjectObject());
    }

    private boolean canBrowse(ApplicationUser user, Issue issue) {
        return issue != null && permissionManager().hasPermission(ProjectPermissions.BROWSE_PROJECTS, issue, user);
    }

    private void requireUser(ApplicationUser user) {
        if (user == null) {
            throw new AssetException(401, "asset-tree.error.auth");
        }
    }

    private boolean isAdmin(ApplicationUser user) {
        return user != null && (globalPermissionManager().hasPermission(GlobalPermissionKey.ADMINISTER, user)
                || globalPermissionManager().hasPermission(GlobalPermissionKey.SYSTEM_ADMIN, user));
    }

    private boolean hasGlobalManage(ApplicationUser user) {
        return globalPermissionManager().hasPermission(MANAGE_ASSETS, user)
                || globalPermissionManager().hasPermission(MANAGE_ASSETS_FULL, user);
    }

    private Issue requireIssue(ApplicationUser user, String issueKey) {
        String normalized = AssetValidator.normalizeIssueKey(issueKey);
        if (!AssetValidator.isIssueKey(normalized)) {
            throw new AssetException(404, "asset-tree.error.issue.notFound");
        }
        Issue issue = issueManager().getIssueObject(normalized);
        if (!canBrowse(user, issue)) {
            throw new AssetException(404, "asset-tree.error.issue.notFound");
        }
        return issue;
    }

    private AssetEntity[] assetsIn(String projectKey) {
        return ao().find(AssetEntity.class, Query.select().where("PROJECT_KEY = ?", projectKey));
    }

    private AssetTypeEntity requireType(String typeKey) {
        AssetTypeEntity type = findType(typeKey);
        if (type == null) {
            throw new AssetException(400, "asset-tree.error.type");
        }
        return type;
    }

    private AssetTypeEntity findType(String typeKey) {
        if (typeKey == null || typeKey.trim().isEmpty()) {
            return null;
        }
        AssetTypeEntity[] found = ao().find(AssetTypeEntity.class, Query.select().where("TYPE_KEY = ?", typeKey.trim()));
        return found.length == 0 ? null : found[0];
    }

    private AssetFieldEntity[] fields(String typeKey) {
        return ao().find(AssetFieldEntity.class, Query.select().where("TYPE_KEY = ?", typeKey).order("POSITION ASC"));
    }

    private AssetFieldEntity findField(String typeKey, String fieldKey) {
        AssetFieldEntity[] found = ao().find(AssetFieldEntity.class,
                Query.select().where("TYPE_KEY = ? AND FIELD_KEY = ?", typeKey, fieldKey));
        return found.length == 0 ? null : found[0];
    }

    private Map<Integer, List<AssetAttributeEntity>> attributesByAsset() {
        AssetAttributeEntity[] all = ao().find(AssetAttributeEntity.class, Query.select().order("ATTR_POSITION ASC"));
        Map<Integer, List<AssetAttributeEntity>> map = new HashMap<Integer, List<AssetAttributeEntity>>();
        for (AssetAttributeEntity attribute : all) {
            List<AssetAttributeEntity> bucket = map.get(attribute.getAssetId());
            if (bucket == null) {
                bucket = new ArrayList<AssetAttributeEntity>();
                map.put(attribute.getAssetId(), bucket);
            }
            bucket.add(attribute);
        }
        return map;
    }

    private List<AssetAttributeEntity> attributesFor(int assetId) {
        AssetAttributeEntity[] rows = ao().find(AssetAttributeEntity.class,
                Query.select().where("ASSET_ID = ?", assetId).order("ATTR_POSITION ASC"));
        List<AssetAttributeEntity> list = new ArrayList<AssetAttributeEntity>();
        Collections.addAll(list, rows);
        return list;
    }

    private boolean matches(AssetEntity asset, List<AssetAttributeEntity> attributes, String needle) {
        if (contains(asset.getName(), needle) || contains(asset.getObjectKey(), needle)
                || contains(asset.getDescription(), needle) || contains(asset.getCustodianKey(), needle)) {
            return true;
        }
        UserProfileDto holder = profile(asset.getCustodianKey());
        if (holder != null && (contains(holder.getDisplayName(), needle) || contains(holder.getEmail(), needle))) {
            return true;
        }
        if (attributes == null) {
            return false;
        }
        for (AssetAttributeEntity attribute : attributes) {
            if (contains(attribute.getAttrName(), needle) || contains(attribute.getAttrValue(), needle)) {
                return true;
            }
        }
        return false;
    }

    private boolean contains(String value, String needle) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(needle);
    }

    private List<AssetTypeDto> typeDtos(String projectKey, AssetEntity[] assets) {
        Map<String, Integer> counts = new HashMap<String, Integer>();
        if (assets != null) {
            for (AssetEntity asset : assets) {
                Integer count = counts.get(asset.getTypeKey());
                counts.put(asset.getTypeKey(), Integer.valueOf(count == null ? 1 : count.intValue() + 1));
            }
        }
        List<AssetTypeEntity> ordered = new ArrayList<AssetTypeEntity>();
        for (AssetTypeEntity type : ao().find(AssetTypeEntity.class)) {
            if (ProjectKeys.same(type.getProjectKey(), projectKey)) {
                ordered.add(type);
            }
        }
        Collections.sort(ordered, new Comparator<AssetTypeEntity>() {
            @Override
            public int compare(AssetTypeEntity left, AssetTypeEntity right) {
                int byOrder = Integer.compare(left.getSortOrder(), right.getSortOrder());
                return byOrder != 0 ? byOrder : left.getTypeKey().compareTo(right.getTypeKey());
            }
        });
        I18nHelper labels = i18n();
        List<AssetTypeDto> result = new ArrayList<AssetTypeDto>();
        for (AssetTypeEntity type : ordered) {
            Integer count = counts.get(type.getTypeKey());
            result.add(toTypeDto(type, labels, count == null ? 0 : count.intValue()));
        }
        return result;
    }

    private AssetTypeDto toTypeDto(AssetTypeEntity type, I18nHelper labels, int assetCount) {
        AssetTypeDto dto = new AssetTypeDto();
        dto.setTypeKey(type.getTypeKey());
        dto.setProjectKey(type.getProjectKey());
        dto.setColor(type.getColor());
        dto.setIcon(TypeIcons.resolve(type.getIcon(), type.isLocation()));
        dto.setSystemType(type.isSystemType());
        dto.setLocation(type.isLocation());
        dto.setShowInTree(type.isLocation() || type.isShowInTree());
        dto.setAssetCount(assetCount);
        if (type.isSystemType() && type.getBaseKey() != null && !type.getBaseKey().isEmpty()) {
            String key = "asset-tree.type." + type.getBaseKey();
            String label = labels.getText(key);
            dto.setLabel(key.equals(label) ? type.getLabel() : label);
        } else {
            dto.setLabel(type.getLabel());
        }
        List<FieldDto> fields = new ArrayList<FieldDto>();
        for (AssetFieldEntity field : fields(type.getTypeKey())) {
            fields.add(toFieldDto(field, labels));
        }
        dto.setFields(fields);
        return dto;
    }

    private FieldDto toFieldDto(AssetFieldEntity field, I18nHelper labels) {
        FieldDto dto = new FieldDto();
        dto.setFieldKey(field.getFieldKey());
        dto.setKind(field.getKind());
        dto.setRequired(field.isRequired());
        dto.setPosition(field.getPosition());
        dto.setLabel(fieldLabel(field, labels));
        return dto;
    }

    private String resolveIcon(String raw, boolean location) {
        String icon = raw == null ? "" : raw.trim().toLowerCase(Locale.ROOT);
        if (icon.isEmpty()) {
            return TypeIcons.defaultFor(location);
        }
        if (!TypeIcons.isIcon(icon)) {
            throw new AssetException(400, "asset-tree.error.type.icon");
        }
        return icon;
    }

    private String fieldLabel(AssetFieldEntity field, I18nHelper labels) {
        String stored = field.getLabel();
        if (stored != null && stored.startsWith("asset-tree.")) {
            String translated = labels.getText(stored);
            if (!stored.equals(translated)) {
                return translated;
            }
        }
        return stored;
    }

    private String resolveStatus(String projectKey, String raw) {
        ensureStatuses(projectKey);
        String key = Statuses.canonical(raw);
        if (findStatus(projectKey, key) == null) {
            throw new AssetException(400, "asset-tree.error.status");
        }
        return key;
    }

    private void ensureStatuses(String projectKey) {
        if (projectStatuses(projectKey).length > 0) {
            return;
        }
        String[] keys = new String[] {
                Statuses.IN_STOCK, Statuses.IN_USE, Statuses.REPAIR,
                Statuses.RESERVE, Statuses.MAINTENANCE, Statuses.WRITTEN_OFF
        };
        String[] labelKeys = new String[] {
                "asset-tree.ui.statusStock", "asset-tree.ui.statusInUse", "asset-tree.ui.statusRepair",
                "asset-tree.ui.statusReserve", "asset-tree.ui.statusMaintenance", "asset-tree.ui.statusWrittenOff"
        };
        String[] categories = new String[] {"todo", "progress", "progress", "todo", "progress", "done"};
        I18nHelper labels = i18n();
        for (int i = 0; i < keys.length; i++) {
            String label = labels.getText(labelKeys[i]);
            if (label == null || label.equals(labelKeys[i])) {
                label = keys[i];
            }
            ao().create(ProjectStatusEntity.class,
                    new DBParam("PROJECT_KEY", projectKey),
                    new DBParam("STATUS_KEY", keys[i]),
                    new DBParam("LABEL", label),
                    new DBParam("CATEGORY", categories[i]),
                    new DBParam("SORT_ORDER", i));
        }
    }

    private ProjectStatusEntity[] projectStatuses(String projectKey) {
        return ao().find(ProjectStatusEntity.class, Query.select().where("PROJECT_KEY = ?", projectKey).order("SORT_ORDER ASC"));
    }

    private ProjectStatusEntity findStatus(String projectKey, String statusKey) {
        if (projectKey == null || statusKey == null || statusKey.trim().isEmpty()) {
            return null;
        }
        ProjectStatusEntity[] found = ao().find(ProjectStatusEntity.class,
                Query.select().where("PROJECT_KEY = ? AND STATUS_KEY = ?", projectKey, statusKey.trim()));
        return found.length == 0 ? null : found[0];
    }

    private List<StatusDto> statusDtos(String projectKey, AssetEntity[] assets) {
        ensureStatuses(projectKey);
        Map<String, Integer> counts = new HashMap<String, Integer>();
        if (assets != null) {
            for (AssetEntity asset : assets) {
                String key = Statuses.canonical(asset.getStatus());
                Integer count = counts.get(key);
                counts.put(key, Integer.valueOf((count == null ? 0 : count.intValue()) + 1));
            }
        }
        List<StatusDto> result = new ArrayList<StatusDto>();
        for (ProjectStatusEntity row : projectStatuses(projectKey)) {
            result.add(toStatusDto(row, counts.get(row.getStatusKey())));
        }
        return result;
    }

    private StatusDto toStatusDto(ProjectStatusEntity row, Integer count) {
        StatusDto dto = new StatusDto();
        dto.setStatusKey(row.getStatusKey());
        dto.setLabel(row.getLabel());
        dto.setCategory(row.getCategory());
        dto.setSortOrder(row.getSortOrder());
        dto.setAssetCount(count == null ? 0 : count.intValue());
        return dto;
    }

    private int countStatus(String projectKey, String statusKey) {
        int count = 0;
        for (AssetEntity row : assetsIn(projectKey)) {
            if (statusKey.equals(Statuses.canonical(row.getStatus()))) {
                count++;
            }
        }
        return count;
    }

    private String normalizeCategory(String category) {
        String value = category == null ? "" : category.trim();
        if (value.isEmpty()) {
            return "todo";
        }
        if (!StatusCategories.allowed(value)) {
            throw new AssetException(400, "asset-tree.error.status");
        }
        return value;
    }

    private String categoryColor(String category) {
        return StatusCategories.color(category);
    }

    private List<GrantDto> grantDtos(String projectKey) {
        List<GrantDto> result = new ArrayList<GrantDto>();
        ProjectGrantEntity[] rows = ao().find(ProjectGrantEntity.class, Query.select().where("PROJECT_KEY = ?", projectKey));
        ProjectGrantEntity[] global = ao().find(ProjectGrantEntity.class, Query.select().where("PROJECT_KEY = ?", GrantCaps.ALL_PROJECTS));
        for (ProjectGrantEntity row : rows) {
            result.add(toGrantDto(row));
        }
        for (ProjectGrantEntity row : global) {
            boolean listed = false;
            for (GrantDto existing : result) {
                if (existing.getGroupName() != null && existing.getGroupName().equalsIgnoreCase(row.getGroupName())) {
                    listed = true;
                }
            }
            if (!listed) {
                result.add(toGrantDto(row));
            }
        }
        Collections.sort(result, new Comparator<GrantDto>() {
            @Override
            public int compare(GrantDto left, GrantDto right) {
                String a = left.getGroupName() == null ? "" : left.getGroupName();
                String b = right.getGroupName() == null ? "" : right.getGroupName();
                return a.compareToIgnoreCase(b);
            }
        });
        return result;
    }

    private GrantDto toGrantDto(ProjectGrantEntity row) {
        GrantDto dto = new GrantDto();
        dto.setGroupName(row.getGroupName());
        String caps = row.getCaps();
        if (caps == null || caps.trim().isEmpty()) {
            caps = GrantCaps.fromLevel(row.getLevel());
        } else {
            caps = GrantCaps.normalize(caps);
        }
        dto.setCaps(caps);
        dto.setLevel(GrantCaps.levelOf(caps));
        return dto;
    }

    private String resolveCaps(GrantDraft draft) {
        String caps = draft.getCaps() == null ? "" : GrantCaps.normalize(draft.getCaps());
        if (caps.isEmpty()) {
            caps = GrantCaps.fromLevel(draft.getLevel());
        }
        if (caps.isEmpty()) {
            throw new AssetException(400, "asset-tree.error.group");
        }
        return caps;
    }

    private ProjectGrantEntity findGrant(String projectKey, String groupName) {
        ProjectGrantEntity[] found = ao().find(ProjectGrantEntity.class,
                Query.select().where("PROJECT_KEY = ? AND GROUP_NAME = ?", projectKey, groupName));
        return found.length == 0 ? null : found[0];
    }

    private boolean groupExists(String groupName) {
        try {
            return groupManager().getGroup(groupName) != null;
        } catch (RuntimeException ex) {
            return false;
        }
    }

    private void includeGranted(ApplicationUser user, Map<String, Project> found) {
        if (user == null) {
            return;
        }
        try {
            ProjectGrantEntity[] grants = ao().find(ProjectGrantEntity.class);
            for (ProjectGrantEntity grant : grants) {
                if (grant.getProjectKey() == null || !inGroup(user, grant.getGroupName())) {
                    continue;
                }
                if (GrantCaps.ALL_PROJECTS.equals(grant.getProjectKey())) {
                    String caps = grant.getCaps();
                    if (caps == null || caps.trim().isEmpty()) {
                        caps = GrantCaps.fromLevel(grant.getLevel());
                    }
                    if (GrantCaps.has(caps, GrantCaps.ADMIN)) {
                        for (Project granted : projectManager().getProjects()) {
                            if (granted != null && granted.getKey() != null) {
                                found.put(granted.getKey(), granted);
                            }
                        }
                    }
                    continue;
                }
                if (found.containsKey(grant.getProjectKey())) {
                    continue;
                }
                Project granted = project(grant.getProjectKey());
                if (granted != null) {
                    found.put(granted.getKey(), granted);
                }
            }
        } catch (RuntimeException ex) {
            log.debug("Grant project lookup skipped", ex);
        }
    }

    private boolean grantHas(ApplicationUser user, Project project, String cap) {
        if (user == null || project == null || project.getKey() == null) {
            return false;
        }
        try {
            if (grantRowsAllow(user, project.getKey(), cap)) {
                return true;
            }
            return grantRowsAllow(user, GrantCaps.ALL_PROJECTS, cap);
        } catch (RuntimeException ex) {
            return false;
        }
    }

    private boolean grantRowsAllow(ApplicationUser user, String projectKey, String cap) {
        ProjectGrantEntity[] rows = ao().find(ProjectGrantEntity.class,
                Query.select().where("PROJECT_KEY = ?", projectKey));
        for (int i = 0; i < rows.length; i++) {
            ProjectGrantEntity row = rows[i];
            if (!inGroup(user, row.getGroupName())) {
                continue;
            }
            String caps = row.getCaps();
            if (caps == null || caps.trim().isEmpty()) {
                caps = GrantCaps.fromLevel(row.getLevel());
            }
            if (GrantCaps.has(caps, cap)) {
                return true;
            }
        }
        return false;
    }

    private boolean inGroup(ApplicationUser user, String groupName) {
        if (user == null || groupName == null || groupName.trim().isEmpty()) {
            return false;
        }
        try {
            return groupManager().isUserInGroup(user, groupName.trim());
        } catch (RuntimeException ex) {
            return false;
        }
    }

    private String statusText(String status) {
        String key = "asset-tree.ui.statusInUse";
        if (Statuses.IN_STOCK.equals(status)) {
            key = "asset-tree.ui.statusStock";
        } else if (Statuses.REPAIR.equals(status)) {
            key = "asset-tree.ui.statusRepair";
        } else if (Statuses.RESERVE.equals(status)) {
            key = "asset-tree.ui.statusReserve";
        } else if (Statuses.MAINTENANCE.equals(status)) {
            key = "asset-tree.ui.statusMaintenance";
        } else if (Statuses.WRITTEN_OFF.equals(status)) {
            key = "asset-tree.ui.statusWrittenOff";
        }
        return i18n().getText(key);
    }

    private Map<String, AssetTypeDto> indexTypes(List<AssetTypeDto> types) {
        Map<String, AssetTypeDto> index = new HashMap<String, AssetTypeDto>();
        for (AssetTypeDto type : types) {
            index.put(type.getTypeKey(), type);
        }
        return index;
    }

    private Map<Integer, AssetEntity> indexAssets(AssetEntity[] assets) {
        Map<Integer, AssetEntity> index = new HashMap<Integer, AssetEntity>();
        if (assets != null) {
            for (AssetEntity asset : assets) {
                index.put(asset.getID(), asset);
            }
        }
        return index;
    }

    private AssetDto toDto(AssetEntity entity, List<AssetAttributeEntity> attributes, Map<String, AssetTypeDto> types,
                           Map<Integer, AssetEntity> index, boolean withIssues) {
        AssetDto dto = new AssetDto();
        dto.setId(entity.getID());
        dto.setObjectKey(entity.getObjectKey());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription() == null ? "" : entity.getDescription());
        dto.setTypeKey(entity.getTypeKey());
        dto.setStatus(Statuses.canonical(entity.getStatus()));
        dto.setParentId(TreeLogic.normalizeParent(entity.getParentId()));
        dto.setSortOrder(entity.getSortOrder());
        dto.setCreated(format(entity.getCreated()));
        dto.setUpdated(format(entity.getUpdated()));
        dto.setCreatedBy(displayName(entity.getCreatedBy()));
        dto.setUpdatedBy(displayName(entity.getUpdatedBy()));
        dto.setProjectKey(entity.getProjectKey());
        Project project = project(entity.getProjectKey());
        dto.setProjectName(project == null ? entity.getProjectKey() : project.getName());
        dto.setEditable(canWrite(authenticationContext().getLoggedInUser(), project));
        dto.setLocation(location(entity, index));
        dto.setCustodian(profile(entity.getCustodianKey()));
        AssetTypeDto type = types.get(entity.getTypeKey());
        if (type != null) {
            dto.setTypeLabel(type.getLabel());
            dto.setColor(type.getColor());
            dto.setIcon(type.getIcon());
        } else {
            dto.setTypeLabel(entity.getTypeKey());
            dto.setColor("#5D6B82");
            dto.setIcon(TypeIcons.DEFAULT_OBJECT);
        }
        dto.setAttributes(attributeDtos(type, attributes));
        if (withIssues) {
            dto.setIssues(issuesFor(entity.getID()));
            dto.setComments(commentDtos(entity.getID()));
            dto.setFiles(fileDtos(entity.getID()));
            dto.setActivities(activityDtos(entity.getID()));
        }
        return dto;
    }

    private void logActivity(int assetId, String authorKey, String kind, String field, String oldValue, String newValue) {
        String left = oldValue == null ? "" : oldValue;
        String right = newValue == null ? "" : newValue;
        if (left.equals(right)) {
            return;
        }
        recordActivity(assetId, authorKey, kind, field, left, right);
    }

    private void recordActivity(int assetId, String authorKey, String kind, String field, String oldValue, String newValue) {
        ao().create(AssetActivityEntity.class,
                new DBParam("ASSET_ID", assetId),
                new DBParam("AUTHOR_KEY", authorKey == null ? "" : authorKey),
                new DBParam("KIND", kind),
                new DBParam("FIELD_NAME", field == null ? "" : field),
                new DBParam("OLD_VALUE", clip(oldValue)),
                new DBParam("NEW_VALUE", clip(newValue)),
                new DBParam("CREATED", new Date()));
    }

    private String clip(String value) {
        if (value == null) {
            return "";
        }
        return value.length() > 500 ? value.substring(0, 500) : value;
    }

    private Map<String, String> attributeValues(int assetId) {
        Map<String, String> values = new HashMap<String, String>();
        for (AssetAttributeEntity attribute : attributesFor(assetId)) {
            values.put(attribute.getAttrName(), attribute.getAttrValue() == null ? "" : attribute.getAttrValue().trim());
        }
        return values;
    }

    private void logAttributeChanges(int assetId, String authorKey, String typeKey, Map<String, String> before) {
        Map<String, String> after = attributeValues(assetId);
        Map<String, String> names = new HashMap<String, String>();
        I18nHelper labels = i18n();
        for (AssetFieldEntity field : fields(typeKey)) {
            names.put(field.getFieldKey(), fieldLabel(field, labels));
        }
        Set<String> keys = new HashSet<String>();
        keys.addAll(before.keySet());
        keys.addAll(after.keySet());
        for (String key : keys) {
            String oldValue = before.containsKey(key) ? before.get(key) : "";
            String newValue = after.containsKey(key) ? after.get(key) : "";
            String label = names.containsKey(key) ? names.get(key) : key;
            logActivity(assetId, authorKey, "attribute", label, oldValue, newValue);
        }
    }

    private String typeLabel(AssetTypeEntity type) {
        if (type == null) {
            return "";
        }
        if (type.isSystemType() && type.getBaseKey() != null && !type.getBaseKey().isEmpty()) {
            String key = "asset-tree.type." + type.getBaseKey();
            String label = i18n().getText(key);
            return key.equals(label) ? type.getLabel() : label;
        }
        return type.getLabel() == null ? "" : type.getLabel();
    }

    private String parentName(Integer parentId) {
        if (parentId == null) {
            return "";
        }
        AssetEntity parent = ao().get(AssetEntity.class, parentId.intValue());
        return parent == null || parent.getName() == null ? "" : parent.getName();
    }

    private List<ActivityDto> activityDtos(int assetId) {
        AssetActivityEntity[] rows = ao().find(AssetActivityEntity.class, Query.select().where("ASSET_ID = ?", assetId));
        List<ActivityDto> result = new ArrayList<ActivityDto>();
        if (rows == null) {
            return result;
        }
        List<AssetActivityEntity> ordered = new ArrayList<AssetActivityEntity>();
        Collections.addAll(ordered, rows);
        Collections.sort(ordered, new Comparator<AssetActivityEntity>() {
            @Override
            public int compare(AssetActivityEntity left, AssetActivityEntity right) {
                Date leftCreated = left.getCreated();
                Date rightCreated = right.getCreated();
                if (leftCreated == null || rightCreated == null) {
                    return left.getID() - right.getID();
                }
                int byTime = leftCreated.compareTo(rightCreated);
                return byTime == 0 ? left.getID() - right.getID() : byTime;
            }
        });
        for (AssetActivityEntity row : ordered) {
            ActivityDto dto = new ActivityDto();
            dto.setId(row.getID());
            dto.setAction(row.getKind() == null ? "" : row.getKind());
            dto.setField(row.getFieldName() == null ? "" : row.getFieldName());
            dto.setOldValue(row.getOldValue() == null ? "" : row.getOldValue());
            dto.setNewValue(row.getNewValue() == null ? "" : row.getNewValue());
            dto.setCreated(format(row.getCreated()));
            dto.setAuthor(profile(row.getAuthorKey()));
            result.add(dto);
        }
        return result;
    }

    private List<CommentDto> commentDtos(int assetId) {
        AssetCommentEntity[] rows = ao().find(AssetCommentEntity.class, Query.select().where("ASSET_ID = ?", assetId));
        List<CommentDto> result = new ArrayList<CommentDto>();
        if (rows == null) {
            return result;
        }
        List<AssetCommentEntity> ordered = new ArrayList<AssetCommentEntity>();
        for (AssetCommentEntity row : rows) {
            ordered.add(row);
        }
        Collections.sort(ordered, new Comparator<AssetCommentEntity>() {
            @Override
            public int compare(AssetCommentEntity left, AssetCommentEntity right) {
                Date leftCreated = left.getCreated();
                Date rightCreated = right.getCreated();
                if (leftCreated == null || rightCreated == null) {
                    return left.getID() - right.getID();
                }
                int byTime = leftCreated.compareTo(rightCreated);
                return byTime == 0 ? left.getID() - right.getID() : byTime;
            }
        });
        for (AssetCommentEntity row : ordered) {
            result.add(commentDto(row));
        }
        return result;
    }

    private CommentDto commentDto(AssetCommentEntity row) {
        CommentDto dto = new CommentDto();
        dto.setId(row.getID());
        dto.setBody(row.getBody() == null ? "" : row.getBody());
        dto.setCreated(format(row.getCreated()));
        dto.setAuthor(profile(row.getAuthorKey()));
        return dto;
    }

    private List<FileDto> fileDtos(int assetId) {
        AssetFileEntity[] rows = ao().find(AssetFileEntity.class, Query.select().where("ASSET_ID = ?", assetId));
        List<FileDto> result = new ArrayList<FileDto>();
        if (rows == null) {
            return result;
        }
        for (AssetFileEntity row : rows) {
            result.add(fileDto(row));
        }
        return result;
    }

    private FileDto fileDto(AssetFileEntity row) {
        FileDto dto = new FileDto();
        dto.setId(row.getID());
        dto.setFileName(row.getFileName());
        dto.setContentType(row.getContentType());
        dto.setSize(row.getSizeBytes());
        dto.setCreated(format(row.getCreated()));
        UserProfileDto author = profile(row.getAuthorKey());
        dto.setAuthorName(author == null ? "" : author.getDisplayName());
        return dto;
    }

    private String fileNameOf(String fileName) {
        String name = fileName == null ? "" : fileName.trim();
        int slash = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
        if (slash >= 0) {
            name = name.substring(slash + 1);
        }
        if (name.isEmpty() || ".".equals(name) || "..".equals(name)) {
            throw new AssetException(400, "asset-tree.error.file.name");
        }
        if (name.length() > 180) {
            name = name.substring(name.length() - 180);
        }
        return name;
    }

    private List<AttributeDto> attributeDtos(AssetTypeDto type, List<AssetAttributeEntity> stored) {
        Map<String, String> values = new HashMap<String, String>();
        if (stored != null) {
            for (AssetAttributeEntity attribute : stored) {
                values.put(attribute.getAttrName(), attribute.getAttrValue() == null ? "" : attribute.getAttrValue());
            }
        }
        List<AttributeDto> result = new ArrayList<AttributeDto>();
        if (type == null || type.getFields() == null) {
            return result;
        }
        for (FieldDto field : type.getFields()) {
            AttributeDto dto = new AttributeDto();
            dto.setFieldKey(field.getFieldKey());
            dto.setName(field.getLabel());
            dto.setKind(field.getKind());
            dto.setRequired(field.isRequired());
            dto.setValue(values.containsKey(field.getFieldKey()) ? values.get(field.getFieldKey()) : "");
            result.add(dto);
        }
        return result;
    }

    private String location(AssetEntity entity, Map<Integer, AssetEntity> index) {
        List<String> names = new ArrayList<String>();
        Integer parentId = TreeLogic.normalizeParent(entity.getParentId());
        int guard = 0;
        while (parentId != null && guard < 80) {
            AssetEntity parent = index.get(parentId);
            if (parent == null) {
                break;
            }
            names.add(0, parent.getName());
            parentId = TreeLogic.normalizeParent(parent.getParentId());
            guard++;
        }
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < names.size(); i++) {
            if (i > 0) {
                builder.append(" / ");
            }
            builder.append(names.get(i));
        }
        return builder.toString();
    }

    private List<IssueRefDto> issuesFor(int assetId) {
        AssetIssueLinkEntity[] links = ao().find(AssetIssueLinkEntity.class, Query.select().where("ASSET_ID = ?", assetId));
        ApplicationUser user = authenticationContext().getLoggedInUser();
        List<IssueRefDto> issues = new ArrayList<IssueRefDto>();
        for (AssetIssueLinkEntity link : links) {
            Issue issue = issueManager().getIssueObject(Long.valueOf(link.getIssueId()));
            if (!canBrowse(user, issue)) {
                continue;
            }
            issues.add(toIssue(issue));
        }
        Collections.sort(issues, new Comparator<IssueRefDto>() {
            @Override
            public int compare(IssueRefDto left, IssueRefDto right) {
                return left.getIssueKey().compareToIgnoreCase(right.getIssueKey());
            }
        });
        return issues;
    }

    private IssueRefDto toIssue(Issue issue) {
        IssueRefDto dto = new IssueRefDto();
        dto.setIssueId(issue.getId() == null ? 0L : issue.getId().longValue());
        dto.setIssueKey(issue.getKey());
        dto.setSummary(issue.getSummary());
        if (issue.getStatus() != null) {
            dto.setStatus(issue.getStatus().getNameTranslation());
        }
        return dto;
    }

    private UserProfileDto profile(String userKey) {
        if (userKey == null || userKey.isEmpty()) {
            return null;
        }
        ApplicationUser user = userManager().getUserByKey(userKey);
        UserProfileDto dto = new UserProfileDto();
        dto.setUserKey(userKey);
        if (user == null) {
            dto.setDisplayName(userKey);
            dto.setActive(false);
            return dto;
        }
        dto.setUsername(user.getUsername());
        dto.setDisplayName(user.getDisplayName());
        dto.setEmail(user.getEmailAddress());
        dto.setActive(user.isActive());
        try {
            Directory directory = crowdDirectoryService().findDirectoryById(user.getDirectoryId());
            if (directory != null) {
                dto.setDirectory(directory.getName());
            }
        } catch (RuntimeException ex) {
            log.debug("Directory lookup failed for {}", userKey, ex);
        }
        try {
            UserWithAttributes attributes = crowdService().getUserWithAttributes(user.getName());
            if (attributes != null) {
                dto.setPhone(firstValue(attributes, "telephoneNumber", "phone", "mobile", "mobilePhone"));
                dto.setDepartment(firstValue(attributes, "department", "departmentNumber"));
                dto.setTitle(firstValue(attributes, "title", "jobTitle"));
            }
        } catch (RuntimeException ex) {
            log.debug("Directory attributes failed for {}", userKey, ex);
        }
        return dto;
    }

    private String firstValue(UserWithAttributes attributes, String... keys) {
        for (String key : keys) {
            String value = attributes.getValue(key);
            if (value != null && !value.trim().isEmpty()) {
                return value.trim();
            }
        }
        return "";
    }

    private String displayName(String userKey) {
        UserProfileDto profile = profile(userKey);
        return profile == null ? "" : profile.getDisplayName();
    }

    private String format(Date date) {
        return date == null ? null : date.toInstant().toString();
    }

    private I18nHelper i18n() {
        return authenticationContext().getI18nHelper();
    }

    private Integer parseId(String raw) {
        if (raw == null) {
            return null;
        }
        String trimmed = raw.trim();
        if (!trimmed.matches("\\d+")) {
            return null;
        }
        try {
            return Integer.valueOf(trimmed);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private Map<Integer, Integer> parentMap(AssetEntity[] assets) {
        Map<Integer, Integer> parents = new HashMap<Integer, Integer>();
        for (AssetEntity asset : assets) {
            parents.put(asset.getID(), TreeLogic.normalizeParent(asset.getParentId()));
        }
        return parents;
    }

    private Map<Integer, List<Integer>> childrenMap(AssetEntity[] assets) {
        Map<Integer, List<Integer>> children = new HashMap<Integer, List<Integer>>();
        for (AssetEntity asset : assets) {
            Integer parentId = TreeLogic.normalizeParent(asset.getParentId());
            if (parentId == null) {
                continue;
            }
            List<Integer> bucket = children.get(parentId);
            if (bucket == null) {
                bucket = new ArrayList<Integer>();
                children.put(parentId, bucket);
            }
            bucket.add(asset.getID());
        }
        return children;
    }

    private static final Comparator<AssetEntity> SIBLING_ORDER = new Comparator<AssetEntity>() {
        @Override
        public int compare(AssetEntity left, AssetEntity right) {
            int bySort = Integer.compare(left.getSortOrder(), right.getSortOrder());
            return bySort != 0 ? bySort : Integer.compare(left.getID(), right.getID());
        }
    };
}
