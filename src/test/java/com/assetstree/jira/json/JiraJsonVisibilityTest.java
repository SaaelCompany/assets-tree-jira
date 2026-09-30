package com.assetstree.jira.json;

import com.assetstree.jira.dto.AssetTypeDto;
import com.assetstree.jira.dto.MetaDto;
import com.assetstree.jira.dto.ProjectDto;
import com.assetstree.jira.model.AssetDraft;
import com.assetstree.jira.model.AttributeDraft;
import com.assetstree.jira.model.FieldDraft;
import com.assetstree.jira.model.PortalRuleDraft;
import com.assetstree.jira.model.TypeDraft;
import org.codehaus.jackson.map.AnnotationIntrospector;
import org.codehaus.jackson.map.DeserializationConfig;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.SerializationConfig;
import org.codehaus.jackson.map.annotate.JsonSerialize;
import org.codehaus.jackson.map.introspect.JacksonAnnotationIntrospector;
import org.codehaus.jackson.xc.JaxbAnnotationIntrospector;
import org.junit.Test;

import java.util.Collections;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

/**
 * Jira REST disables getter, setter, and field detection. Only an explicit
 * visibility annotation is written and read. This mapper matches
 * JacksonJsonProviderFactory in atlassian-rest 6.1.11.
 */
public class JiraJsonVisibilityTest {

    @Test
    public void metaSerializesPublicProperties() throws Exception {
        MetaDto meta = new MetaDto();
        meta.setCanEdit(true);
        meta.setVersion("1.2.45");
        meta.setLocale("ru-RU");
        meta.setDisplayName("Admin");
        meta.setUserKey("admin");
        meta.getI18n().put("asset-tree.nav", "Активы");
        ProjectDto project = new ProjectDto();
        project.setKey("MED");
        project.setName("Медицина");
        project.setCanEdit(true);
        meta.setProjects(Collections.singletonList(project));

        String json = mapper().writeValueAsString(meta);

        assertTrue(json.contains("\"version\":\"1.2.45\""));
        assertTrue(json.contains("\"locale\":\"ru-RU\""));
        assertTrue(json.contains("\"displayName\":\"Admin\""));
        assertTrue(json.contains("\"userKey\":\"admin\""));
        assertTrue(json.contains("\"canEdit\":true"));
        assertTrue(json.contains("\"key\":\"MED\""));
        assertTrue(json.contains("\"name\":\"Медицина\""));
        assertTrue(json.contains("Активы"));
    }

    @Test
    public void draftsBindSetters() throws Exception {
        ObjectMapper mapper = mapper();
        AssetDraft asset = mapper.readValue(
                "{\"name\":\"Принтер\",\"typeKey\":\"printer\",\"projectKey\":\"IT\","
                        + "\"attributes\":[{\"fieldKey\":\"serial\",\"value\":\"A-1\"}]}",
                AssetDraft.class);
        assertEquals("Принтер", asset.getName());
        assertEquals("printer", asset.getTypeKey());
        assertEquals("IT", asset.getProjectKey());
        assertEquals(1, asset.getAttributes().size());
        AttributeDraft attribute = asset.getAttributes().get(0);
        assertEquals("serial", attribute.getFieldKey());
        assertEquals("A-1", attribute.getValue());

        TypeDraft type = mapper.readValue(
                "{\"label\":\"Филиал\",\"projectKey\":\"MED\",\"location\":true,\"showInTree\":false,\"icon\":\"hospital\"}",
                TypeDraft.class);
        assertEquals("Филиал", type.getLabel());
        assertEquals("MED", type.getProjectKey());
        assertTrue(type.isLocation());
        assertEquals(Boolean.FALSE, type.getShowInTree());
        assertEquals("hospital", type.getIcon());

        TypeDraft partial = mapper.readValue("{\"icon\":\"printer\"}", TypeDraft.class);
        assertEquals("printer", partial.getIcon());
        assertNull(partial.getShowInTree());
        assertNull(partial.getColor());

        AssetTypeDto stored = new AssetTypeDto();
        stored.setTypeKey("pc");
        stored.setLabel("Компьютер");
        stored.setLocation(false);
        stored.setShowInTree(false);
        stored.setIcon("desktop");
        String typeJson = mapper.writeValueAsString(stored);
        assertTrue(typeJson.contains("\"showInTree\":false"));
        assertTrue(typeJson.contains("\"location\":false"));
        assertTrue(typeJson.contains("\"icon\":\"desktop\""));

        PortalRuleDraft portal = mapper.readValue(
                "{\"assetId\":4,\"conditions\":[{\"field\":\"Площадка\",\"option\":\"Пункт А\"},{\"field\":\"Отделение\",\"option\":\"Пункт А\"}]}",
                PortalRuleDraft.class);
        assertEquals(4, portal.getAssetId());
        assertEquals(2, portal.getConditions().size());
        assertEquals("Площадка", portal.getConditions().get(0).getField());
        assertEquals("Пункт А", portal.getConditions().get(1).getOption());

        FieldDraft field = mapper.readValue(
                "{\"label\":\"ОС\",\"kind\":\"text\",\"required\":false}",
                FieldDraft.class);
        assertEquals("ОС", field.getLabel());
        assertEquals("text", field.getKind());
        assertFalse(field.isRequired());
    }

    private static ObjectMapper mapper() {
        ObjectMapper mapper = new ObjectMapper();
        AnnotationIntrospector pair = AnnotationIntrospector.pair(
                new JacksonAnnotationIntrospector(),
                new JaxbAnnotationIntrospector());
        mapper.setDeserializationConfig(mapper.getDeserializationConfig().withAnnotationIntrospector(pair));
        mapper.setSerializationConfig(mapper.getSerializationConfig().withAnnotationIntrospector(pair));
        mapper.setSerializationInclusion(JsonSerialize.Inclusion.NON_NULL);
        mapper.configure(SerializationConfig.Feature.AUTO_DETECT_GETTERS, false);
        mapper.configure(SerializationConfig.Feature.AUTO_DETECT_FIELDS, false);
        mapper.configure(DeserializationConfig.Feature.AUTO_DETECT_SETTERS, false);
        mapper.configure(DeserializationConfig.Feature.AUTO_DETECT_FIELDS, false);
        return mapper;
    }
}
