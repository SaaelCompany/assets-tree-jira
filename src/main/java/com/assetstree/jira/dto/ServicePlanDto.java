package com.assetstree.jira.dto;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;

@XmlAccessorType(XmlAccessType.PROPERTY)
public class ServicePlanDto {
    private int id;
    private String name;
    private String lastDone;
    private int everyCount;
    private String everyUnit;
    private String statusKey;
    private boolean notify;
    private String nextDue;
    private boolean due;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLastDone() {
        return lastDone;
    }

    public void setLastDone(String lastDone) {
        this.lastDone = lastDone;
    }

    public int getEveryCount() {
        return everyCount;
    }

    public void setEveryCount(int everyCount) {
        this.everyCount = everyCount;
    }

    public String getEveryUnit() {
        return everyUnit;
    }

    public void setEveryUnit(String everyUnit) {
        this.everyUnit = everyUnit;
    }

    public String getStatusKey() {
        return statusKey;
    }

    public void setStatusKey(String statusKey) {
        this.statusKey = statusKey;
    }

    public boolean isNotify() {
        return notify;
    }

    public void setNotify(boolean notify) {
        this.notify = notify;
    }

    public String getNextDue() {
        return nextDue;
    }

    public void setNextDue(String nextDue) {
        this.nextDue = nextDue;
    }

    public boolean isDue() {
        return due;
    }

    public void setDue(boolean due) {
        this.due = due;
    }
}
