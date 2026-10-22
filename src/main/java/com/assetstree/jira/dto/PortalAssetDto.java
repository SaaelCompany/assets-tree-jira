package com.assetstree.jira.dto;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import java.util.ArrayList;
import java.util.List;

/**
 * One item on the customer portal. Only the details the project administrator chose are filled in.
 */
@XmlAccessorType(XmlAccessType.PROPERTY)
public class PortalAssetDto {
    private String objectKey;
    private String name;
    private String typeLabel;
    private String color;
    private String icon;
    private String statusLabel;
    private String statusCategory;
    private String role;
    private List<AttributeDto> details = new ArrayList<AttributeDto>();

    public String getObjectKey() {
        return objectKey;
    }

    public void setObjectKey(String objectKey) {
        this.objectKey = objectKey;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTypeLabel() {
        return typeLabel;
    }

    public void setTypeLabel(String typeLabel) {
        this.typeLabel = typeLabel;
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

    public String getStatusLabel() {
        return statusLabel;
    }

    public void setStatusLabel(String statusLabel) {
        this.statusLabel = statusLabel;
    }

    public String getStatusCategory() {
        return statusCategory;
    }

    public void setStatusCategory(String statusCategory) {
        this.statusCategory = statusCategory;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public List<AttributeDto> getDetails() {
        return details;
    }

    public void setDetails(List<AttributeDto> details) {
        this.details = details;
    }
}
