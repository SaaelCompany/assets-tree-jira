package com.assetstree.jira.rest;

import com.atlassian.jira.component.ComponentAccessor;
import com.atlassian.jira.security.JiraAuthenticationContext;
import com.atlassian.jira.user.ApplicationUser;
import com.atlassian.jira.util.I18nHelper;
import com.assetstree.jira.dto.MessageDto;
import com.assetstree.jira.model.AssetDraft;
import com.assetstree.jira.model.CommentDraft;
import com.assetstree.jira.model.AssetException;
import com.assetstree.jira.model.FieldDraft;
import com.assetstree.jira.model.GrantDraft;
import com.assetstree.jira.model.InventoryDraft;
import com.assetstree.jira.model.IssueLinkDraft;
import com.assetstree.jira.model.MoveDraft;
import com.assetstree.jira.model.PortalRuleDraft;
import com.assetstree.jira.model.StatusDraft;
import com.assetstree.jira.model.TypeDraft;
import com.assetstree.jira.service.AssetBridge;
import com.assetstree.jira.service.AssetService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.concurrent.Callable;

@Path("/")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class AssetResource {
    private static final Logger log = LoggerFactory.getLogger(AssetResource.class);

    private final AssetService assetService;

    public AssetResource() {
        this.assetService = AssetBridge.service();
    }

    @GET
    @Path("meta")
    public Response meta() {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                return Response.ok(assetService.meta(user())).build();
            }
        });
    }

    @GET
    @Path("assets")
    public Response list(@QueryParam("projectKey") final String projectKey, @QueryParam("q") final String query) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                return Response.ok(assetService.listAssets(user(), projectKey, query)).build();
            }
        });
    }

    @POST
    @Path("assets")
    public Response create(final AssetDraft draft) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                return Response.status(Response.Status.CREATED).entity(assetService.createAsset(user(), draft)).build();
            }
        });
    }

    @GET
    @Path("assets/{id}")
    public Response get(@PathParam("id") final int id) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                return Response.ok(assetService.getAsset(user(), id)).build();
            }
        });
    }

    @PUT
    @Path("assets/{id}")
    public Response update(@PathParam("id") final int id, final AssetDraft draft) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                return Response.ok(assetService.updateAsset(user(), id, draft)).build();
            }
        });
    }

    @POST
    @Path("assets/{id}/comments")
    public Response addComment(@PathParam("id") final int id, final CommentDraft draft) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                String body = draft == null ? null : draft.getBody();
                return Response.status(Response.Status.CREATED).entity(assetService.addComment(user(), id, body)).build();
            }
        });
    }

    @DELETE
    @Path("assets/{id}/comments/{commentId}")
    public Response deleteComment(@PathParam("id") final int id, @PathParam("commentId") final int commentId) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                assetService.deleteComment(user(), id, commentId);
                return Response.noContent().build();
            }
        });
    }

    @DELETE
    @Path("assets/{id}/files/{fileId}")
    public Response deleteFile(@PathParam("id") final int id, @PathParam("fileId") final int fileId) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                assetService.deleteFile(user(), id, fileId);
                return Response.noContent().build();
            }
        });
    }

    @DELETE
    @Path("assets/{id}")
    public Response delete(@PathParam("id") final int id, @QueryParam("cascade") final boolean cascade) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                assetService.deleteAsset(user(), id, cascade);
                return Response.noContent().build();
            }
        });
    }

    @POST
    @Path("assets/{id}/inventory")
    public Response inventoryMark(@PathParam("id") final int id, final InventoryDraft draft) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                boolean checked = draft != null && draft.isChecked();
                return Response.ok(assetService.markInventory(user(), id, checked)).build();
            }
        });
    }

    @GET
    @Path("projects/{projectKey}/inventory")
    public Response inventory(@PathParam("projectKey") final String projectKey) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                return Response.ok(assetService.inventory(user(), projectKey)).build();
            }
        });
    }

    @POST
    @Path("assets/{id}/move")
    public Response move(@PathParam("id") final int id, final MoveDraft move) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                return Response.ok(assetService.moveAsset(user(), id, move)).build();
            }
        });
    }

    @POST
    @Path("assets/{id}/issues")
    public Response linkIssue(@PathParam("id") final int id, final IssueLinkDraft draft) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                String issueKey = draft == null ? null : draft.getIssueKey();
                return Response.status(Response.Status.CREATED).entity(assetService.linkIssue(user(), id, issueKey)).build();
            }
        });
    }

    @DELETE
    @Path("assets/{id}/issues/{issueId}")
    public Response unlinkIssue(@PathParam("id") final int id, @PathParam("issueId") final long issueId) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                assetService.unlinkIssue(user(), id, issueId);
                return Response.noContent().build();
            }
        });
    }

    @GET
    @Path("issues/{issueId}/assets")
    public Response assetsForIssue(@PathParam("issueId") final long issueId) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                return Response.ok(assetService.assetsForIssue(user(), issueId)).build();
            }
        });
    }

    @POST
    @Path("issues/{issueId}/assets")
    public Response linkAsset(@PathParam("issueId") final long issueId, final IssueLinkDraft draft) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                Integer assetId = draft == null ? null : draft.getAssetId();
                if (assetId == null) {
                    throw new AssetException(404, "asset-tree.error.notFound");
                }
                return Response.status(Response.Status.CREATED)
                        .entity(assetService.linkAssetToIssue(user(), issueId, assetId.intValue()))
                        .build();
            }
        });
    }

    @POST
    @Path("types")
    public Response createType(final TypeDraft draft) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                return Response.status(Response.Status.CREATED).entity(assetService.createType(user(), draft)).build();
            }
        });
    }

    @POST
    @Path("types/{typeKey}/fields")
    public Response addField(@PathParam("typeKey") final String typeKey, final FieldDraft draft) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                return Response.status(Response.Status.CREATED).entity(assetService.addField(user(), typeKey, draft)).build();
            }
        });
    }

    @DELETE
    @Path("types/{typeKey}/fields/{fieldKey}")
    public Response deleteField(@PathParam("typeKey") final String typeKey, @PathParam("fieldKey") final String fieldKey) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                assetService.deleteField(user(), typeKey, fieldKey);
                return Response.noContent().build();
            }
        });
    }

    @GET
    @Path("projects/{projectKey}/report")
    public Response report(@PathParam("projectKey") final String projectKey) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                return Response.ok(assetService.report(user(), projectKey)).build();
            }
        });
    }

    @GET
    @Path("projects/{projectKey}/statuses")
    public Response statuses(@PathParam("projectKey") final String projectKey) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                return Response.ok(assetService.listStatuses(user(), projectKey)).build();
            }
        });
    }

    @POST
    @Path("projects/{projectKey}/statuses")
    public Response createStatus(@PathParam("projectKey") final String projectKey, final StatusDraft draft) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                return Response.status(Response.Status.CREATED)
                        .entity(assetService.createStatus(user(), projectKey, draft))
                        .build();
            }
        });
    }

    @PUT
    @Path("projects/{projectKey}/statuses/{statusKey}")
    public Response updateStatus(@PathParam("projectKey") final String projectKey,
                                 @PathParam("statusKey") final String statusKey,
                                 final StatusDraft draft) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                return Response.ok(assetService.updateStatus(user(), projectKey, statusKey, draft)).build();
            }
        });
    }

    @DELETE
    @Path("projects/{projectKey}/statuses/{statusKey}")
    public Response deleteStatus(@PathParam("projectKey") final String projectKey,
                                 @PathParam("statusKey") final String statusKey) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                assetService.deleteStatus(user(), projectKey, statusKey);
                return Response.noContent().build();
            }
        });
    }

    @GET
    @Path("projects/{projectKey}/grants")
    public Response grants(@PathParam("projectKey") final String projectKey) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                return Response.ok(assetService.listGrants(user(), projectKey)).build();
            }
        });
    }

    @POST
    @Path("projects/{projectKey}/grants")
    public Response addGrant(@PathParam("projectKey") final String projectKey, final GrantDraft draft) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                return Response.status(Response.Status.CREATED)
                        .entity(assetService.addGrant(user(), projectKey, draft))
                        .build();
            }
        });
    }

    @DELETE
    @Path("projects/{projectKey}/grants")
    public Response deleteGrant(@PathParam("projectKey") final String projectKey, @QueryParam("group") final String group) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                assetService.deleteGrant(user(), projectKey, group);
                return Response.noContent().build();
            }
        });
    }

    @GET
    @Path("groups")
    public Response groups(@QueryParam("q") final String query) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                return Response.ok(assetService.searchGroups(user(), query)).build();
            }
        });
    }

    @GET
    @Path("projects/{projectKey}/picker")
    public Response picker(@PathParam("projectKey") final String projectKey) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                return Response.ok(assetService.picker(user(), projectKey)).build();
            }
        });
    }

    @GET
    @Path("projects/{projectKey}/portal-rules")
    public Response portalRules(@PathParam("projectKey") final String projectKey) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                return Response.ok(assetService.listPortalRules(user(), projectKey)).build();
            }
        });
    }

    @POST
    @Path("projects/{projectKey}/portal-rules")
    public Response addPortalRule(@PathParam("projectKey") final String projectKey, final PortalRuleDraft draft) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                return Response.status(Response.Status.CREATED)
                        .entity(assetService.addPortalRule(user(), projectKey, draft))
                        .build();
            }
        });
    }

    @DELETE
    @Path("projects/{projectKey}/portal-rules/{ruleId}")
    public Response deletePortalRule(@PathParam("projectKey") final String projectKey, @PathParam("ruleId") final int ruleId) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                assetService.deletePortalRule(user(), projectKey, ruleId);
                return Response.noContent().build();
            }
        });
    }

    @GET
    @Path("users")
    public Response users(@QueryParam("q") final String query) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                return Response.ok(assetService.searchUsers(user(), query)).build();
            }
        });
    }

    @GET
    @Path("users/{userKey}/assets")
    public Response userAssets(@PathParam("userKey") final String userKey) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                return Response.ok(assetService.assetsForUser(user(), userKey)).build();
            }
        });
    }

    @GET
    @Path("issues/{issueId}/context")
    public Response issueContext(@PathParam("issueId") final long issueId) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                return Response.ok(assetService.issueContext(user(), issueId)).build();
            }
        });
    }

    @GET
    @Path("issues/{issueId}/search")
    public Response searchForIssue(@PathParam("issueId") final long issueId, @QueryParam("q") final String query) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                return Response.ok(assetService.searchForIssue(user(), issueId, query)).build();
            }
        });
    }

    @PUT
    @Path("types/{typeKey}")
    public Response updateType(@PathParam("typeKey") final String typeKey, final TypeDraft draft) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                return Response.ok(assetService.updateType(user(), typeKey, draft)).build();
            }
        });
    }

    @DELETE
    @Path("types/{typeKey}")
    public Response deleteType(@PathParam("typeKey") final String typeKey) {
        return invoke(new Callable<Response>() {
            @Override
            public Response call() {
                assetService.deleteType(user(), typeKey);
                return Response.noContent().build();
            }
        });
    }

    private ApplicationUser user() {
        return authenticationContext().getLoggedInUser();
    }

    private JiraAuthenticationContext authenticationContext() {
        return ComponentAccessor.getJiraAuthenticationContext();
    }

    private Response invoke(Callable<Response> action) {
        try {
            return action.call();
        } catch (AssetException ex) {
            return message(ex.getStatus(), ex.getMessageKey(), ex.getArgs());
        } catch (Exception ex) {
            log.error("Asset tree request failed", ex);
            return message(500, "asset-tree.error.unexpected");
        }
    }

    private Response message(int status, String key, Object... args) {
        I18nHelper i18n = authenticationContext().getI18nHelper();
        String text = args == null || args.length == 0 ? i18n.getText(key) : i18n.getText(key, args);
        return Response.status(status).entity(new MessageDto(text)).build();
    }
}
