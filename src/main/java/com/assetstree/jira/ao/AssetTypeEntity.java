package com.assetstree.jira.ao;

import net.java.ao.Entity;
import net.java.ao.schema.Indexed;
import net.java.ao.schema.NotNull;
import net.java.ao.schema.StringLength;
import net.java.ao.schema.Table;
import net.java.ao.schema.Unique;

@Table("AST_TYPE")
public interface AssetTypeEntity extends Entity {
    @NotNull
    @Unique
    @StringLength(64)
    String getTypeKey();

    void setTypeKey(String typeKey);

    @NotNull
    @StringLength(255)
    String getLabel();

    void setLabel(String label);

    @NotNull
    @StringLength(16)
    String getColor();

    void setColor(String color);

    boolean isSystemType();

    void setSystemType(boolean systemType);

    int getSortOrder();

    void setSortOrder(int sortOrder);

    @NotNull
    @Indexed
    @StringLength(80)
    String getProjectKey();

    void setProjectKey(String projectKey);

    @StringLength(40)
    String getBaseKey();

    void setBaseKey(String baseKey);

    boolean isLocation();

    void setLocation(boolean location);

    boolean isShowInTree();

    void setShowInTree(boolean showInTree);
}
