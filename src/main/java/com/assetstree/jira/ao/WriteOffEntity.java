package com.assetstree.jira.ao;

import net.java.ao.Entity;
import net.java.ao.schema.Indexed;
import net.java.ao.schema.StringLength;
import net.java.ao.schema.Table;

import java.util.Date;

/** A request to write off one asset and the decision on it. */
@Table("AST_WOFF")
public interface WriteOffEntity extends Entity {
    @Indexed
    int getAssetId();

    void setAssetId(int assetId);

    @Indexed
    @StringLength(80)
    String getProjectKey();

    void setProjectKey(String projectKey);

    /** pending, approved, rejected or cancelled. */
    @StringLength(16)
    String getState();

    void setState(String state);

    @StringLength(450)
    String getReason();

    void setReason(String reason);

    @StringLength(255)
    String getRequestedBy();

    void setRequestedBy(String requestedBy);

    Date getRequested();

    void setRequested(Date requested);

    @StringLength(255)
    String getDecidedBy();

    void setDecidedBy(String decidedBy);

    Date getDecided();

    void setDecided(Date decided);

    @StringLength(450)
    String getNote();

    void setNote(String note);

    @StringLength(40)
    String getStatusKey();

    void setStatusKey(String statusKey);
}
