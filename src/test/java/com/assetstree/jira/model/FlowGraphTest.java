package com.assetstree.jira.model;

import com.assetstree.jira.dto.FlowGraphDto;
import com.assetstree.jira.dto.FlowLinkDto;
import com.assetstree.jira.dto.FlowNodeDto;
import com.assetstree.jira.dto.FlowRuleDto;
import org.junit.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

public class FlowGraphTest {
    private static final Set<String> KNOWN = new HashSet<String>(Arrays.asList("in_stock", "in_use", "repair"));

    @Test
    public void aLineFromTheRequestNodeSetsTheEquipmentStatus() {
        FlowGraphDto graph = graph(
                request("req1", "10001", 40, 40),
                status("sta1", "repair", 320, 40),
                link("req1", "sta1"));
        List<FlowRuleDto> pairs = FlowGraph.pairs(graph);
        assertEquals(1, pairs.size());
        assertEquals("repair", FlowRules.statusToApply(pairs, "10001", true, "in_stock", KNOWN));
        assertNull(FlowRules.statusToApply(pairs, "10002", true, "in_stock", KNOWN));
        assertNull(FlowRules.statusToApply(pairs, "10001", false, "in_stock", KNOWN));
    }

    @Test
    public void aNodeWithoutALineAndABackwardsLineDoNothing() {
        FlowGraphDto graph = graph(
                request("req1", "10001", 10, 10),
                status("sta1", "repair", 300, 10),
                link("sta1", "req1"));
        assertTrue(FlowGraph.pairs(graph).isEmpty());
        assertTrue(FlowGraph.normalize(graph).getLinks().isEmpty());
    }

    @Test
    public void theLaterLineForTheSameRequestTypeWins() {
        FlowNodeDto first = request("req1", "10001", 0, 0);
        FlowNodeDto second = request("req2", "10001", 0, 160);
        FlowGraphDto graph = graph(first, second, status("staa", "repair", 400, 0), status("stab", "in_use", 400, 160),
                link("req1", "staa"), link("req2", "stab"));
        List<FlowRuleDto> pairs = FlowGraph.pairs(graph);
        assertEquals("in_use", FlowRules.statusToApply(pairs, "10001", true, "in_stock", KNOWN));
    }

    @Test
    public void oneRequestNodeKeepsEveryOutgoingLineAndTheLaterStatusWins() {
        FlowGraphDto graph = graph(
                request("req1", "10001", 0, 0),
                status("staa", "repair", 400, 0),
                status("stab", "in_use", 400, 160),
                link("req1", "staa"),
                link("req1", "stab"),
                link("req1", "stab"));
        assertEquals(2, FlowGraph.normalize(graph).getLinks().size());
        assertEquals("in_use", FlowRules.statusToApply(FlowGraph.pairs(graph), "10001", true, "in_stock", KNOWN));
        assertEquals("in_use", FlowGraph.equipmentStatus(graph, "10001", null, false));
    }

    @Test
    public void aStatusChangeDoesNotFireWhenEquipmentIsAdded() {
        FlowGraphDto graph = graph(
                request("req1", "10001", 0, 0),
                issue("iss1", "5", 280, 0),
                status("sta1", "repair", 560, 0),
                status("sta2", "in_use", 560, 160),
                link("req1", "iss1"),
                link("iss1", "sta1"),
                link("req1", "sta2"));
        assertEquals("in_use", FlowGraph.equipmentStatus(graph, "10001", "5", false));
        assertEquals("repair", FlowGraph.equipmentStatus(graph, "10001", "5", true));
        assertNull(FlowGraph.equipmentStatus(graph, "10001", "3", true));
        assertNull(FlowGraph.equipmentStatus(graph, "10002", "5", true));
        assertTrue(FlowGraph.pairs(chainOnly()).isEmpty());
        assertNull(FlowGraph.equipmentStatus(chainOnly(), "10001", "5", false));
        assertEquals("repair", FlowGraph.equipmentStatus(chainOnly(), "10001", "5", true));
    }

    @Test
    public void aRequestStatusWithoutAnIncomingRequestAppliesToEveryType() {
        FlowGraphDto graph = graph(
                issue("iss1", "5", 280, 0),
                status("sta1", "repair", 560, 0),
                link("iss1", "sta1"));
        assertEquals("repair", FlowGraph.equipmentStatus(graph, "10002", "5", true));
        assertNull(FlowGraph.equipmentStatus(graph, "10002", "5", false));
        assertTrue(FlowGraph.normalize(graph(
                issue("iss1", "5", 0, 0),
                issue("iss2", "3", 200, 0),
                status("sta1", "repair", 400, 0),
                link("iss1", "iss2"),
                link("sta1", "iss1"))).getLinks().isEmpty());
    }

    @Test
    public void aRequestStatusRoundTrips() {
        FlowGraphDto graph = graph(
                request("req1", "10001", 40, 48),
                issue("iss1", "5", 340, 48),
                status("sta1", "repair", 640, 48),
                link("req1", "iss1"),
                link("iss1", "sta1"));
        FlowGraphDto again = FlowGraph.read(FlowGraph.write(graph));
        assertEquals("5", again.getNodes().get(1).getIssueStatusId());
        assertEquals(2, again.getLinks().size());
        assertEquals("repair", FlowGraph.equipmentStatus(again, "10001", "5", true));
    }

    @Test
    public void storedRulesOpenAsConnectedNodesAndRoundTrip() {
        FlowRuleDto rule = new FlowRuleDto();
        rule.setId(7);
        rule.setIssueTypeId("10001");
        rule.setIssueTypeName("Инцидент");
        rule.setStatusKey("repair");
        FlowGraphDto graph = FlowGraph.fromRules(Collections.singletonList(rule));
        assertEquals(2, graph.getNodes().size());
        assertEquals(1, graph.getLinks().size());
        assertEquals(48, graph.getNodes().get(0).getX());
        assertEquals(420, graph.getNodes().get(1).getX());
        FlowGraphDto again = FlowGraph.read(FlowGraph.write(graph));
        assertEquals("10001", again.getNodes().get(0).getIssueTypeId());
        assertEquals("repair", again.getNodes().get(1).getStatusKey());
        assertEquals(graph.getLinks().get(0).getFrom(), again.getLinks().get(0).getFrom());
    }

    private static FlowGraphDto graph(Object... items) {
        FlowGraphDto graph = new FlowGraphDto();
        for (Object item : items) {
            if (item instanceof FlowNodeDto) {
                graph.getNodes().add((FlowNodeDto) item);
            } else {
                graph.getLinks().add((FlowLinkDto) item);
            }
        }
        return graph;
    }

    private static FlowNodeDto request(String id, String typeId, int x, int y) {
        FlowNodeDto node = new FlowNodeDto();
        node.setId(id);
        node.setKind(FlowGraph.REQUEST);
        node.setIssueTypeId(typeId);
        node.setX(x);
        node.setY(y);
        return node;
    }

    private static FlowGraphDto chainOnly() {
        return graph(
                request("req1", "10001", 0, 0),
                issue("iss1", "5", 280, 0),
                status("sta1", "repair", 560, 0),
                link("req1", "iss1"),
                link("iss1", "sta1"));
    }

    private static FlowNodeDto issue(String id, String issueStatusId, int x, int y) {
        FlowNodeDto node = new FlowNodeDto();
        node.setId(id);
        node.setKind(FlowGraph.ISSUE);
        node.setIssueStatusId(issueStatusId);
        node.setX(x);
        node.setY(y);
        return node;
    }

    private static FlowNodeDto status(String id, String statusKey, int x, int y) {
        FlowNodeDto node = new FlowNodeDto();
        node.setId(id);
        node.setKind(FlowGraph.STATUS);
        node.setStatusKey(statusKey);
        node.setX(x);
        node.setY(y);
        return node;
    }

    private static FlowLinkDto link(String from, String to) {
        FlowLinkDto link = new FlowLinkDto();
        link.setFrom(from);
        link.setTo(to);
        return link;
    }
}
