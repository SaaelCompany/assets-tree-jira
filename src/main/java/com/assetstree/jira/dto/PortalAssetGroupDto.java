package com.assetstree.jira.dto;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import java.util.ArrayList;
import java.util.List;

@XmlAccessorType(XmlAccessType.PROPERTY)
public class PortalAssetGroupDto {
    private String projectKey;
    private String projectName;
    private List<PortalAssetDto> assets = new ArrayList<PortalAssetDto>();

    public String getProjectKey() {
        return projectKey;
    }

    public void setProjectKey(String projectKey) {
        this.projectKey = projectKey;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public List<PortalAssetDto> getAssets() {
        return assets;
    }

    public void setAssets(List<PortalAssetDto> assets) {
        this.assets = assets;
    }
}
