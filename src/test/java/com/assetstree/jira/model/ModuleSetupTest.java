package com.assetstree.jira.model;

import com.assetstree.jira.dto.ModuleSetupDto;
import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class ModuleSetupTest {
    @Test
    public void defaultsFillAnEmptySetup() {
        ModuleSetupDto setup = ModuleSetup.read("");
        assertEquals("to,kts,verify", setup.getScheduleKinds());
        assertEquals("month", setup.getScheduleUnit());
        assertFalse(setup.getScheduleNotify().booleanValue());
        assertEquals(1200, setup.getMapWidth().intValue());
        assertEquals(760, setup.getMapHeight().intValue());
        assertEquals(24, setup.getMapGrid().intValue());
        assertTrue(setup.getMapSnap().booleanValue());
        assertEquals("", setup.getReportHidden());
        assertTrue(setup.getLifeApproval().booleanValue());
        assertEquals("RUB", setup.getLifeCurrency());
    }

    @Test
    public void aSavedSetupRoundTripsAndDropsUnknownValues() {
        ModuleSetupDto draft = new ModuleSetupDto();
        draft.setScheduleKinds("verify,nope,to");
        draft.setScheduleUnit("week");
        draft.setScheduleNotify(Boolean.TRUE);
        draft.setMapWidth(Integer.valueOf(1800));
        draft.setMapHeight(Integer.valueOf(900));
        draft.setMapGrid(Integer.valueOf(16));
        draft.setMapSnap(Boolean.FALSE);
        draft.setReportHidden("age,missing,work");
        draft.setLifeApproval(Boolean.FALSE);
        draft.setLifeApprover("ivanov");
        draft.setLifeCurrency("usd");
        draft.setLifeMonths(Integer.valueOf(36));
        ModuleSetupDto setup = ModuleSetup.read(ModuleSetup.write(draft));
        assertEquals("to,verify", setup.getScheduleKinds());
        assertEquals("week", setup.getScheduleUnit());
        assertTrue(setup.getScheduleNotify().booleanValue());
        assertEquals(1800, setup.getMapWidth().intValue());
        assertEquals(900, setup.getMapHeight().intValue());
        assertEquals(16, setup.getMapGrid().intValue());
        assertFalse(setup.getMapSnap().booleanValue());
        assertEquals("age,work", setup.getReportHidden());
        assertFalse(setup.getLifeApproval().booleanValue());
        assertEquals("ivanov", setup.getLifeApprover());
        assertEquals("USD", setup.getLifeCurrency());
        assertEquals(36, setup.getLifeMonths().intValue());
        assertEquals(640, FloorBounds.width(10));
        assertEquals("", FloorBounds.color("blue"));
        assertEquals("#deebff", FloorBounds.color("#DEEBFF"));
    }
}
