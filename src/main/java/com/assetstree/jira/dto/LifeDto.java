package com.assetstree.jira.dto;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;

/** Lifecycle of one asset: purchase, warranty, cost and the latest write-off request. */
@XmlAccessorType(XmlAccessType.PROPERTY)
public class LifeDto {
    private int assetId;
    private String body;
    private WriteOffDto writeOff;
    private boolean canDecide;

    public int getAssetId() {
        return assetId;
    }

    public void setAssetId(int assetId) {
        this.assetId = assetId;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public WriteOffDto getWriteOff() {
        return writeOff;
    }

    public void setWriteOff(WriteOffDto writeOff) {
        this.writeOff = writeOff;
    }

    public boolean isCanDecide() {
        return canDecide;
    }

    public void setCanDecide(boolean canDecide) {
        this.canDecide = canDecide;
    }
}
