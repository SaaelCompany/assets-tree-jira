package com.assetstree.jira.service;

import com.atlassian.jira.issue.Issue;
import com.atlassian.jira.user.ApplicationUser;
import com.assetstree.jira.dto.AssetDto;
import com.assetstree.jira.dto.BulkResultDto;
import com.assetstree.jira.dto.AssetListDto;
import com.assetstree.jira.dto.AssetTypeDto;
import com.assetstree.jira.dto.CommentDto;
import com.assetstree.jira.dto.FieldDto;
import com.assetstree.jira.dto.FileDto;
import com.assetstree.jira.dto.GrantDto;
import com.assetstree.jira.dto.ImportResultDto;
import com.assetstree.jira.dto.StatusDto;
import com.assetstree.jira.dto.InventoryDto;
import com.assetstree.jira.dto.InventoryRowDto;
import com.assetstree.jira.dto.IssueContextDto;
import com.assetstree.jira.dto.IssueRefDto;
import com.assetstree.jira.dto.MetaDto;
import com.assetstree.jira.dto.PickerNodeDto;
import com.assetstree.jira.dto.ReportDto;
import com.assetstree.jira.dto.UserProfileDto;
import com.assetstree.jira.model.AssetDraft;
import com.assetstree.jira.model.BulkDraft;
import com.assetstree.jira.model.FieldDraft;
import com.assetstree.jira.model.GrantDraft;
import com.assetstree.jira.model.ImportDraft;
import com.assetstree.jira.dto.PortalRuleDto;
import com.assetstree.jira.model.MoveDraft;
import com.assetstree.jira.model.PortalRuleDraft;
import com.assetstree.jira.model.StatusDraft;
import com.assetstree.jira.model.TypeDraft;

import java.util.List;

public interface AssetService {
    MetaDto meta(ApplicationUser user);

    AssetListDto listAssets(ApplicationUser user, String projectKey, String query);

    AssetDto getAsset(ApplicationUser user, int id);

    AssetDto createAsset(ApplicationUser user, AssetDraft draft);

    AssetDto updateAsset(ApplicationUser user, int id, AssetDraft draft);

    CommentDto addComment(ApplicationUser user, int id, String body);

    void deleteComment(ApplicationUser user, int assetId, int commentId);

    FileDto storeFile(ApplicationUser user, int assetId, String fileName, String contentType, byte[] data);

    StoredFile openFile(ApplicationUser user, int fileId);

    void deleteFile(ApplicationUser user, int assetId, int fileId);

    void deleteAsset(ApplicationUser user, int id, boolean cascade);

    AssetDto moveAsset(ApplicationUser user, int id, MoveDraft move);

    AssetTypeDto createType(ApplicationUser user, TypeDraft draft);

    AssetTypeDto updateType(ApplicationUser user, String typeKey, TypeDraft draft);

    void deleteType(ApplicationUser user, String typeKey);

    FieldDto addField(ApplicationUser user, String typeKey, FieldDraft draft);

    void deleteField(ApplicationUser user, String typeKey, String fieldKey);

    List<StatusDto> listStatuses(ApplicationUser user, String projectKey);

    StatusDto createStatus(ApplicationUser user, String projectKey, StatusDraft draft);

    StatusDto updateStatus(ApplicationUser user, String projectKey, String statusKey, StatusDraft draft);

    void deleteStatus(ApplicationUser user, String projectKey, String statusKey);

    List<GrantDto> listGrants(ApplicationUser user, String projectKey);

    GrantDto addGrant(ApplicationUser user, String projectKey, GrantDraft draft);

    void deleteGrant(ApplicationUser user, String projectKey, String groupName);

    List<GrantDto> searchGroups(ApplicationUser user, String query);

    IssueRefDto linkIssue(ApplicationUser user, int assetId, String issueKey);

    void unlinkIssue(ApplicationUser user, int assetId, long issueId);

    List<AssetDto> assetsForIssue(ApplicationUser user, long issueId);

    AssetDto linkAssetToIssue(ApplicationUser user, long issueId, int assetId);

    List<AssetDto> searchForIssue(ApplicationUser user, long issueId, String query);

    IssueContextDto issueContext(ApplicationUser user, long issueId);

    ReportDto report(ApplicationUser user, String projectKey);

    byte[] exportEquipment(ApplicationUser user, String projectKey);

    ImportResultDto importEquipment(ApplicationUser user, String projectKey, ImportDraft draft);

    BulkResultDto applyBulk(ApplicationUser user, String projectKey, BulkDraft draft);

    InventoryDto inventory(ApplicationUser user, String projectKey);

    InventoryRowDto markInventory(ApplicationUser user, int id, boolean checked);

    List<PickerNodeDto> picker(ApplicationUser user, String projectKey);

    List<PortalRuleDto> listPortalRules(ApplicationUser user, String projectKey);

    PortalRuleDto addPortalRule(ApplicationUser user, String projectKey, PortalRuleDraft draft);

    void deletePortalRule(ApplicationUser user, String projectKey, int ruleId);

    List<UserProfileDto> searchUsers(ApplicationUser user, String query);

    List<AssetDto> assetsForUser(ApplicationUser user, String userKey);

    void syncRequestAsset(ApplicationUser user, Issue issue, String previousAssetId, String nextAssetId);

    String describeAsset(String assetId);
}
