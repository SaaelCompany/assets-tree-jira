package com.assetstree.jira.dto;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;

import java.util.ArrayList;
import java.util.List;

@XmlAccessorType(XmlAccessType.PROPERTY)
public class FlowProcessDto {
    private String id = "";
    private String name = "";
    private List<FlowNodeDto> nodes = new ArrayList<FlowNodeDto>();
    private List<FlowLinkDto> links = new ArrayList<FlowLinkDto>();
    private String removedStatus = "";
    private boolean enabled = true;
    private boolean requireApproval;
    private boolean notifyApprover;
    private int slaDays;
    private String approverKey = "";
    private String approverName = "";
    private String note = "";
    private String color = "";

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id == null ? "" : id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name == null ? "" : name;
    }

    public List<FlowNodeDto> getNodes() {
        return nodes;
    }

    public void setNodes(List<FlowNodeDto> nodes) {
        this.nodes = nodes == null ? new ArrayList<FlowNodeDto>() : nodes;
    }

    public List<FlowLinkDto> getLinks() {
        return links;
    }

    public void setLinks(List<FlowLinkDto> links) {
        this.links = links == null ? new ArrayList<FlowLinkDto>() : links;
    }

    public String getRemovedStatus() {
        return removedStatus;
    }

    public void setRemovedStatus(String removedStatus) {
        this.removedStatus = removedStatus == null ? "" : removedStatus;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isRequireApproval() {
        return requireApproval;
    }

    public void setRequireApproval(boolean requireApproval) {
        this.requireApproval = requireApproval;
    }

    public boolean isNotifyApprover() {
        return notifyApprover;
    }

    public void setNotifyApprover(boolean notifyApprover) {
        this.notifyApprover = notifyApprover;
    }

    public int getSlaDays() {
        return slaDays;
    }

    public void setSlaDays(int slaDays) {
        this.slaDays = slaDays;
    }

    public String getApproverKey() {
        return approverKey;
    }

    public void setApproverKey(String approverKey) {
        this.approverKey = approverKey;
    }

    public String getApproverName() {
        return approverName;
    }

    public void setApproverName(String approverName) {
        this.approverName = approverName;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }
}
