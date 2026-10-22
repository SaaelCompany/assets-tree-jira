package com.assetstree.jira.dto;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import java.util.ArrayList;
import java.util.List;

/**
 * Equipment held by the signed-in customer, grouped by the project that owns it.
 */
@XmlAccessorType(XmlAccessType.PROPERTY)
public class PortalAssetsDto {
    private boolean enabled;
    private List<PortalAssetGroupDto> projects = new ArrayList<PortalAssetGroupDto>();

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public List<PortalAssetGroupDto> getProjects() {
        return projects;
    }

    public void setProjects(List<PortalAssetGroupDto> projects) {
        this.projects = projects;
    }
}
