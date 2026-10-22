package com.assetstree.jira.ao;

import net.java.ao.Entity;
import net.java.ao.schema.Indexed;
import net.java.ao.schema.NotNull;
import net.java.ao.schema.StringLength;
import net.java.ao.schema.Table;

import java.util.Date;

/**
 * A JSON document of a feature in testing: the project schedule, building map or reports (ref 0),
 * or the lifecycle of one asset (kind "life", ref is the asset id).
 */
@Table("AST_LABDOC")
public interface LabDocEntity extends Entity {
    @NotNull
    @Indexed
    @StringLength(80)
    String getProjectKey();

    void setProjectKey(String projectKey);

    @NotNull
    @StringLength(16)
    String getKind();

    void setKind(String kind);

    @Indexed
    int getRef();

    void setRef(int ref);

    @StringLength(StringLength.UNLIMITED)
    String getBody();

    void setBody(String body);

    Date getUpdated();

    void setUpdated(Date updated);

    @StringLength(255)
    String getUpdatedBy();

    void setUpdatedBy(String updatedBy);
}
