package com.assetstree.jira.ao;

import net.java.ao.Entity;
import net.java.ao.schema.Indexed;
import net.java.ao.schema.StringLength;
import net.java.ao.schema.Table;

@Table("AST_PLAN")
public interface ServicePlanEntity extends Entity {
    @Indexed
    int getAssetId();

    void setAssetId(int assetId);

    @StringLength(80)
    String getName();

    void setName(String name);

    @StringLength(16)
    String getLastDone();

    void setLastDone(String lastDone);

    int getEveryCount();

    void setEveryCount(int everyCount);

    @StringLength(8)
    String getEveryUnit();

    void setEveryUnit(String everyUnit);

    @StringLength(40)
    String getStatusKey();

    void setStatusKey(String statusKey);

    /** 1 sends a letter to the responsible person when the date is reached. */
    int getNotifyFlag();

    void setNotifyFlag(int notifyFlag);

    /** The due day already handled, so the same date is not applied again. */
    @StringLength(16)
    String getAppliedFor();

    void setAppliedFor(String appliedFor);
}
