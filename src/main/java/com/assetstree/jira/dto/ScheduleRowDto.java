package com.assetstree.jira.dto;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;

@XmlAccessorType(XmlAccessType.PROPERTY)
public class ScheduleRowDto {
    private int id;
    private int assetId;
    private String assetName;
    private String objectKey;
    private String name;
    private String kind;
    private String assigneeKey;
    private String assigneeName;
    private String lastDone;
    private int everyCount;
    private String everyUnit;
    private String nextDue;
    private boolean due;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public int getAssetId() { return assetId; }
    public void setAssetId(int assetId) { this.assetId = assetId; }
    public String getAssetName() { return assetName; }
    public void setAssetName(String assetName) { this.assetName = assetName; }
    public String getObjectKey() { return objectKey; }
    public void setObjectKey(String objectKey) { this.objectKey = objectKey; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getKind() { return kind; }
    public void setKind(String kind) { this.kind = kind; }
    public String getAssigneeKey() { return assigneeKey; }
    public void setAssigneeKey(String assigneeKey) { this.assigneeKey = assigneeKey; }
    public String getAssigneeName() { return assigneeName; }
    public void setAssigneeName(String assigneeName) { this.assigneeName = assigneeName; }
    public String getLastDone() { return lastDone; }
    public void setLastDone(String lastDone) { this.lastDone = lastDone; }
    public int getEveryCount() { return everyCount; }
    public void setEveryCount(int everyCount) { this.everyCount = everyCount; }
    public String getEveryUnit() { return everyUnit; }
    public void setEveryUnit(String everyUnit) { this.everyUnit = everyUnit; }
    public String getNextDue() { return nextDue; }
    public void setNextDue(String nextDue) { this.nextDue = nextDue; }
    public boolean isDue() { return due; }
    public void setDue(boolean due) { this.due = due; }
}
