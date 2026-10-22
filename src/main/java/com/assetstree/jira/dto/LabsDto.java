package com.assetstree.jira.dto;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import java.util.ArrayList;
import java.util.List;

/** Features in testing turned on for one project. */
@XmlAccessorType(XmlAccessType.PROPERTY)
public class LabsDto {
    private List<String> labs = new ArrayList<String>();

    public List<String> getLabs() {
        return labs;
    }

    public void setLabs(List<String> labs) {
        this.labs = labs;
    }
}
