package com.assetstree.jira.dto;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;

import java.util.ArrayList;
import java.util.List;

@XmlAccessorType(XmlAccessType.PROPERTY)
public class SiteMapDto {
    private int snap;
    private boolean showGrid;
    private String background = "#F4F5F7";
    private boolean showLabels = true;
    private boolean showFloors = true;
    private boolean showCount = true;
    private List<SiteBuildingDto> buildings = new ArrayList<SiteBuildingDto>();

    public int getSnap() {
        return snap;
    }

    public void setSnap(int snap) {
        this.snap = snap;
    }

    public boolean isShowGrid() {
        return showGrid;
    }

    public void setShowGrid(boolean showGrid) {
        this.showGrid = showGrid;
    }

    public String getBackground() {
        return background;
    }

    public void setBackground(String background) {
        this.background = background;
    }

    public boolean isShowLabels() {
        return showLabels;
    }

    public void setShowLabels(boolean showLabels) {
        this.showLabels = showLabels;
    }

    public boolean isShowFloors() {
        return showFloors;
    }

    public void setShowFloors(boolean showFloors) {
        this.showFloors = showFloors;
    }

    public boolean isShowCount() {
        return showCount;
    }

    public void setShowCount(boolean showCount) {
        this.showCount = showCount;
    }

    public List<SiteBuildingDto> getBuildings() {
        return buildings;
    }

    public void setBuildings(List<SiteBuildingDto> buildings) {
        this.buildings = buildings == null ? new ArrayList<SiteBuildingDto>() : buildings;
    }
}
