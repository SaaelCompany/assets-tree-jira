package com.assetstree.jira.model;

import com.assetstree.jira.dto.FlowGraphDto;
import com.assetstree.jira.dto.FlowLinkDto;
import com.assetstree.jira.dto.FlowNodeDto;
import com.assetstree.jira.dto.FlowProcessDto;
import org.junit.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

public class FlowBookTest {
    @Test
    public void aStoredGraphOpensAsOneProcess() {
        FlowGraphDto graph = new FlowGraphDto();
        graph.getNodes().add(request("req1", "10001"));
        graph.getNodes().add(status("sta1", "repair"));
        graph.getLinks().add(link("req1", "sta1"));
        List<FlowProcessDto> processes = FlowBook.read(FlowGraph.write(graph));
        assertEquals(1, processes.size());
        assertEquals("legacy", processes.get(0).getId());
        assertEquals("repair", FlowBook.equipmentStatus(processes, "10001", null, false));
    }

    @Test
    public void theFirstMatchingProcessWinsAndTheBookRoundTrips() {
        FlowProcessDto repair = process("proc1", "Ремонт",
                request("req1", "10001"), status("sta1", "repair"), link("req1", "sta1"));
        FlowProcessDto stock = process("proc2", "Склад",
                request("req2", "10001"), status("sta2", "in_stock"), link("req2", "sta2"));
        FlowProcessDto other = process("proc3", "Другой",
                request("req3", "10002"), status("sta3", "in_use"), link("req3", "sta3"));
        List<FlowProcessDto> processes = Arrays.asList(repair, stock, other);
        assertEquals("repair", FlowBook.equipmentStatus(processes, "10001", null, false));
        assertEquals("in_use", FlowBook.equipmentStatus(processes, "10002", null, false));
        assertNull(FlowBook.equipmentStatus(processes, "10009", null, false));
        List<FlowProcessDto> again = FlowBook.read(FlowBook.write(processes));
        assertEquals(3, again.size());
        assertEquals("Ремонт", again.get(0).getName());
        assertEquals("repair", again.get(0).getNodes().get(1).getStatusKey());
        assertEquals("10002", FlowBook.pairs(again).get(1).getIssueTypeId());
        assertEquals(2, FlowBook.pairs(again).size());
        assertTrue(FlowBook.normalize(Arrays.asList(process("no", "x"))).isEmpty());
    }

    @Test
    public void removedStatusFollowsTheRequestTypeAndRoundTrips() {
        FlowProcessDto repair = process("proc1", "Ремонт", request("req1", "10001"));
        repair.setRemovedStatus("in_stock");
        FlowProcessDto any = process("proc2", "Любая заявка");
        any.setRemovedStatus("reserve");
        FlowProcessDto bad = process("proc3", "Плохой", request("req3", "10003"));
        bad.setRemovedStatus("Not A Key!");
        List<FlowProcessDto> processes = FlowBook.read(FlowBook.write(Arrays.asList(repair, any, bad)));
        assertEquals("in_stock", processes.get(0).getRemovedStatus());
        assertEquals("", processes.get(2).getRemovedStatus());
        assertEquals("in_stock", FlowBook.removedStatus(processes, "10001"));
        assertEquals("reserve", FlowBook.removedStatus(processes, "10009"));
        assertNull(FlowBook.removedStatus(Arrays.asList(repair), "10009"));
    }

    @Test
    public void restoreSurvivesTheRoundTrip() {
        FlowProcessDto back = process("proc1", "Вернуть", request("req1", "10001"));
        back.setRemovedStatus(FlowBook.RESTORE);
        List<FlowProcessDto> processes = FlowBook.read(FlowBook.write(Arrays.asList(back)));
        assertEquals(FlowBook.RESTORE, FlowBook.removedStatus(processes, "10001"));
    }

    private static FlowProcessDto process(String id, String name, Object... items) {
        FlowProcessDto process = new FlowProcessDto();
        process.setId(id);
        process.setName(name);
        for (Object item : items) {
            if (item instanceof FlowNodeDto) {
                process.getNodes().add((FlowNodeDto) item);
            } else {
                process.getLinks().add((FlowLinkDto) item);
            }
        }
        return process;
    }

    private static FlowNodeDto request(String id, String typeId) {
        FlowNodeDto node = new FlowNodeDto();
        node.setId(id);
        node.setKind(FlowGraph.REQUEST);
        node.setIssueTypeId(typeId);
        node.setX(40);
        node.setY(40);
        return node;
    }

    private static FlowNodeDto status(String id, String statusKey) {
        FlowNodeDto node = new FlowNodeDto();
        node.setId(id);
        node.setKind(FlowGraph.STATUS);
        node.setStatusKey(statusKey);
        node.setX(400);
        node.setY(40);
        return node;
    }

    private static FlowLinkDto link(String from, String to) {
        FlowLinkDto link = new FlowLinkDto();
        link.setFrom(from);
        link.setTo(to);
        return link;
    }
}
