package com.assetstree.jira.ao;

import net.java.ao.Entity;
import net.java.ao.schema.Table;

@Table("AST_SEQ")
public interface AssetCounterEntity extends Entity {
    int getNextValue();

    void setNextValue(int nextValue);
}
