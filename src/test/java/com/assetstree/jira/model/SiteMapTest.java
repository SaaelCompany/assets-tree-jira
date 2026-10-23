package com.assetstree.jira.model;

import com.assetstree.jira.dto.SiteBuildingDto;
import com.assetstree.jira.dto.SiteMapDto;
import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class SiteMapTest {
    @Test
    public void aBuildingKeepsAFreePositionRotationAndOutline() {
        SiteMap.Building wing = building(12, SiteMap.L);
        wing.setX(12.4);
        wing.setY(37.8);
        wing.setW(210);
        wing.setH(150);
        wing.setRotation(17);
        wing.setFloors(4);
        wing.setColor("#175cd3");
        wing.setLabel("Корпус Б");
        SiteMap.Canvas canvas = new SiteMap.Canvas();
        canvas.setSnap(0);
        canvas.setShowGrid(false);
        canvas.getBuildings().add(wing);

        SiteMap.Canvas again = SiteMap.read(SiteMap.write(canvas));

        assertEquals(0, again.getSnap());
        assertFalse(again.isShowGrid());
        assertEquals(1, again.getBuildings().size());
        SiteMap.Building stored = again.getBuildings().get(0);
        assertEquals(SiteMap.L, stored.getShape());
        assertEquals(12.4, stored.getX(), 0.01);
        assertEquals(37.8, stored.getY(), 0.01);
        assertEquals(17, stored.getRotation());
        assertEquals(4, stored.getFloors());
        assertEquals("#175CD3", stored.getColor());
        assertEquals("Корпус Б", stored.getLabel());
        assertFalse(stored.getX() == Math.rint(stored.getX()) && stored.getY() == Math.rint(stored.getY()));
    }

    @Test
    public void aCustomOutlineSurvivesAndABrokenOneFallsBack() {
        SiteMap.Building poly = building(4, SiteMap.POLY);
        poly.setPoints("0,0;80.5,10;40,100;5,40");
        poly.setRotation(275);
        SiteMap.Building broken = building(5, SiteMap.POLY);
        broken.setPoints("0,0;10,10");
        SiteMap.Canvas canvas = new SiteMap.Canvas();
        canvas.getBuildings().add(poly);
        canvas.getBuildings().add(broken);

        SiteMap.Canvas again = SiteMap.read(SiteMap.write(canvas));

        assertEquals(SiteMap.POLY, again.getBuildings().get(0).getShape());
        assertEquals("0,0;80.5,10;40,100;5,40", again.getBuildings().get(0).getPoints());
        assertEquals(275, again.getBuildings().get(0).getRotation());
        assertEquals(SiteMap.RECT, again.getBuildings().get(1).getShape());
        assertEquals("", again.getBuildings().get(1).getPoints());
    }

    @Test
    public void unknownShapesAndBadSnapDoNotForceAGrid() {
        SiteMapDto dto = new SiteMapDto();
        dto.setSnap(7);
        dto.setShowGrid(true);
        dto.setBackground("paper");
        SiteBuildingDto item = new SiteBuildingDto();
        item.setAssetId(9);
        item.setShape("sketch");
        item.setX(3);
        item.setY(9);
        item.setRotation(-20);
        item.setOpacity(10);
        dto.getBuildings().add(item);

        SiteMapDto stored = SiteMap.toDto(SiteMap.fromDto(dto));

        assertEquals(0, stored.getSnap());
        assertTrue(stored.isShowGrid());
        assertEquals("#F4F5F7", stored.getBackground());
        assertEquals(SiteMap.RECT, stored.getBuildings().get(0).getShape());
        assertEquals(340, stored.getBuildings().get(0).getRotation());
        assertEquals(30, stored.getBuildings().get(0).getOpacity());
        assertEquals(3, stored.getBuildings().get(0).getX(), 0.01);
        assertEquals(9, stored.getBuildings().get(0).getY(), 0.01);
    }

    private static SiteMap.Building building(int assetId, String shape) {
        SiteMap.Building building = new SiteMap.Building();
        building.setAssetId(assetId);
        building.setShape(shape);
        return building;
    }
}
