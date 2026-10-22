package com.assetstree.jira.dto;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import java.util.List;

@XmlAccessorType(XmlAccessType.PROPERTY)
public class ProjectViewDto {
    private Boolean treeObjects;
    private List<String> columns;

    public Boolean getTreeObjects() {
        return treeObjects;
    }

    public void setTreeObjects(Boolean treeObjects) {
        this.treeObjects = treeObjects;
    }

    public List<String> getColumns() {
        return columns;
    }

    public void setColumns(List<String> columns) {
        this.columns = columns;
    }
}
