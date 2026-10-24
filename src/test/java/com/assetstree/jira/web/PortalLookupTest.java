package com.assetstree.jira.web;

import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

public class PortalLookupTest {
    @Test
    public void readsPortalIdFromCustomerUrl() {
        assertEquals(1, PortalLookup.portalIdFromUri("/servicedesk/customer/portal/1/create/12"));
        assertEquals(7, PortalLookup.portalIdFromUri("/jira/servicedesk/customer/portal/7/group/2/create/12"));
        assertEquals(0, PortalLookup.portalIdFromUri("/plugins/servlet/asset-tree"));
        assertEquals(0, PortalLookup.portalIdFromUri(null));
    }

    @Test
    public void unwrapsEitherAndServiceOutcome() throws Exception {
        assertEquals("STP", PortalLookup.unwrapResult(new FakeEither(true, "STP")));
        assertNull(PortalLookup.unwrapResult(new FakeEither(false, "STP")));
        assertEquals("MED", PortalLookup.unwrapResult(new FakeOutcome(true, "MED")));
        assertNull(PortalLookup.unwrapResult(new FakeOutcome(false, "MED")));
        assertEquals("plain", PortalLookup.unwrapResult("plain"));
        assertNull(PortalLookup.unwrapResult(null));
    }

    public static final class FakeEither {
        private final boolean right;
        private final Object value;

        public FakeEither(boolean right, Object value) {
            this.right = right;
            this.value = value;
        }

        public boolean isRight() {
            return right;
        }

        public FakeEither right() {
            return this;
        }

        public Object get() {
            return value;
        }
    }

    public static final class FakeOutcome {
        private final boolean valid;
        private final Object value;

        public FakeOutcome(boolean valid, Object value) {
            this.valid = valid;
            this.value = value;
        }

        public boolean isValid() {
            return valid;
        }

        public Object getReturnedValue() {
            return value;
        }
    }
}
