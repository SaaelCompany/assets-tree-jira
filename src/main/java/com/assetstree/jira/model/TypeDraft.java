package com.assetstree.jira.model;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;

@XmlAccessorType(XmlAccessType.PROPERTY)
public class TypeDraft {
    private String label;
    private String color;
    private String icon;
    private String projectKey;
    private boolean location;
    private Boolean showInTree;

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getProjectKey() {
        return projectKey;
    }

    public void setProjectKey(String projectKey) {
        this.projectKey = projectKey;
    }

    public boolean isLocation() {
        return location;
    }

    public void setLocation(boolean location) {
        this.location = location;
    }

    /** Null when the request did not mention the flag, so a partial update leaves it alone. */
    public Boolean getShowInTree() {
        return showInTree;
    }

    public void setShowInTree(Boolean showInTree) {
        this.showInTree = showInTree;
    }
}
