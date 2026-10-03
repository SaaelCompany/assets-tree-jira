package com.assetstree.jira.dto;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;

@XmlAccessorType(XmlAccessType.PROPERTY)
public class ProjectDto {
    private String key;
    private String name;
    private boolean canEdit;
    private boolean canCreate;
    private boolean canChange;
    private boolean canMove;
    private boolean canRemove;
    private boolean canComment;
    private boolean canConfigure;
    private boolean canGrant;
    private boolean canPlaces;
    private boolean canObjects;
    private boolean canTypes;
    private boolean canAssets;
    private boolean canAdmin;

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isCanEdit() {
        return canEdit;
    }

    public void setCanEdit(boolean canEdit) {
        this.canEdit = canEdit;
    }

    public boolean isCanConfigure() {
        return canConfigure;
    }

    public void setCanConfigure(boolean canConfigure) {
        this.canConfigure = canConfigure;
    }

    public boolean isCanCreate() {
        return canCreate;
    }

    public void setCanCreate(boolean canCreate) {
        this.canCreate = canCreate;
    }

    public boolean isCanChange() {
        return canChange;
    }

    public void setCanChange(boolean canChange) {
        this.canChange = canChange;
    }

    public boolean isCanMove() {
        return canMove;
    }

    public void setCanMove(boolean canMove) {
        this.canMove = canMove;
    }

    public boolean isCanRemove() {
        return canRemove;
    }

    public void setCanRemove(boolean canRemove) {
        this.canRemove = canRemove;
    }

    public boolean isCanComment() {
        return canComment;
    }

    public void setCanComment(boolean canComment) {
        this.canComment = canComment;
    }

    public boolean isCanGrant() {
        return canGrant;
    }

    public void setCanGrant(boolean canGrant) {
        this.canGrant = canGrant;
    }

    public boolean isCanPlaces() {
        return canPlaces;
    }

    public void setCanPlaces(boolean canPlaces) {
        this.canPlaces = canPlaces;
    }

    public boolean isCanObjects() {
        return canObjects;
    }

    public void setCanObjects(boolean canObjects) {
        this.canObjects = canObjects;
    }

    public boolean isCanTypes() {
        return canTypes;
    }

    public void setCanTypes(boolean canTypes) {
        this.canTypes = canTypes;
    }

    public boolean isCanAssets() {
        return canAssets;
    }

    public void setCanAssets(boolean canAssets) {
        this.canAssets = canAssets;
    }

    public boolean isCanAdmin() {
        return canAdmin;
    }

    public void setCanAdmin(boolean canAdmin) {
        this.canAdmin = canAdmin;
    }
}
