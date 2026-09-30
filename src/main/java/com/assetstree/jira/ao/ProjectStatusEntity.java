package com.assetstree.jira.ao;

import net.java.ao.Entity;
import net.java.ao.schema.Indexed;
import net.java.ao.schema.NotNull;
import net.java.ao.schema.StringLength;
import net.java.ao.schema.Table;

@Table("AST_PSTATUS")
public interface ProjectStatusEntity extends Entity {
    @NotNull
    @Indexed
    @StringLength(80)
    String getProjectKey();

    void setProjectKey(String projectKey);

    @NotNull
    @StringLength(40)
    String getStatusKey();

    void setStatusKey(String statusKey);

    @NotNull
    @StringLength(255)
    String getLabel();

    void setLabel(String label);

    @NotNull
    @StringLength(16)
    String getCategory();

    void setCategory(String category);

    int getSortOrder();

    void setSortOrder(int sortOrder);
}
