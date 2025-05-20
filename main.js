require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/widgets/Search",
  "esri/layers/GraphicsLayer",
  "esri/widgets/Sketch",
  "esri/Graphic",
  "esri/widgets/LayerList",
  "esri/widgets/Expand",
  "esri/widgets/Legend",
  "esri/widgets/Zoom",
  "esri/widgets/BasemapGallery",
], (
  Map,
  MapView,
  FeatureLayer,
  Search,
  GraphicsLayer,
  Sketch,
  Graphic,
  LayerList,
  Expand,
  Legend,
  Zoom,
  BasemapGallery
) => {
  const map = new Map({ basemap: "streets" });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    zoom: 6,
    center: [-80.19179, 25.76168], // Miami
    popup: {
      dockEnabled: false, // or true
      autoOpenEnabled: false,
    },
  });

  //basemapgallery
  const basemapGallery = new BasemapGallery({
    view: view,
  });

  const expand = new Expand({
    view: view,
    content: basemapGallery,
    expandTooltip: "Basemap Gallery",
  });

  // Add the expand widget to the top-right corner of the view
  view.ui.add(expand, {
    position: "bottom-left",
  });

  //Graphic layer for selection
  const graphicsLayer = new GraphicsLayer({
    title: "Selected Features",
  });
  map.add(graphicsLayer);

  //render arcade expression for filtering null and not null value for symbology
  const renderer = {
    type: "unique-value",
    valueExpression: `
  IIF(
    IsEmpty($feature.Impact), 
    "brown", 
    IIF(
      $feature.Impact == "Not a Threat", 
      "white", 
      "yellow"
    )
  )
`,
    valueExpressionTitle: "Impact",
    uniqueValueInfos: [
      {
        value: "brown", // This corresponds to the color returned when Impact is empty
        symbol: {
          type: "simple-marker",
          color: "brown",
          size: "10px",
        },
        label: "No Threat Assigned",
      },
      {
        value: "white", // This corresponds to the color returned for "Not a Threat"
        symbol: {
          type: "simple-marker",
          color: "white",
          size: "10px",
        },
        label: "Not a Threat",
      },
      {
        value: "yellow", // This corresponds to the color returned for other non-null values
        symbol: {
          type: "simple-marker",
          color: "yellow",
          size: "10px",
        },
        label: "Threats Assigned",
      },
    ],
  };

  let featureLayer = new FeatureLayer({
    url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/SGC_Image_Points_V2/FeatureServer/0",
    outFields: ["*"],
    title: "Debris - AshBritt",
    renderer: renderer,
  });

  // map.add(featureLayer);

  let ticketData = new FeatureLayer({
    url: "https://gis.cdrmaguire.com/arcgis/rest/services/DBO_DR4828FL_Waterway_Barge_Tickets_Public_Facing/FeatureServer/44",
    outFields: ["*"],
    title: "Ticket Data",
    visible: false,
    renderer: {
      type: "simple", // SimpleRenderer
      symbol: {
        type: "simple-marker", // For points
        color: "purple", // Fill color
        size: 8, // Size of the marker
        outline: {
          color: "white", // Outline color
          width: 1, // Outline width
        },
      },
    },
  });

  //clint setup web map 8 layers
  let THREATS_Public_Safety_Threats_Basic = new FeatureLayer({
    url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/THREATS_Public_Safety_Threats_Basic/FeatureServer/0",
    outFields: ["*"],
    title: "THREATS Public Safety Threats Basic",
    visible: false,
  });
  let THREATS_PS_StormSurge = new FeatureLayer({
    url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/THREATS_PS_StormSurge/FeatureServer/0",
    outFields: ["*"],
    title: "THREATS PS StormSurge",
    visible: false,
  });
  let THREATS_Flood_Mitigation_Threats_Basic = new FeatureLayer({
    url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/THREATS_Flood_Mitigation_Threats_Basic/FeatureServer/0",
    outFields: ["*"],
    title: "THREATS Flood Mitigation Threats Basic",
    visible: false,
  });
  let THREATS_FM_dfirm_fldhaz_100_500Yr = new FeatureLayer({
    url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/THREATS_FM_dfirm_fldhaz_100_500Yr/FeatureServer/0",
    outFields: ["*"],
    title: "THREATS FM dfirm fldhaz 100 500Yr",
    visible: false,
  });
  let THREATS_Infrastructure_Damage_Threat_Basic = new FeatureLayer({
    url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/THREATS_Infrastructure_Damage_Threat_Basic/FeatureServer/0",
    outFields: ["*"],
    title: "THREATS Infrastructure Damage Threat Basic",
    visible: false,
  });
  let THREATS_Navigable_Waterway_Threat_Basic = new FeatureLayer({
    url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/THREATS_Navigable_Waterway_Threat_Basic/FeatureServer/0",
    outFields: ["*"],
    title: "THREATS Navigable Waterway Threat Basic",
    visible: false,
  });
  let THREATS_Critical_Habitat_Threat_Basic = new FeatureLayer({
    url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/THREATS_Critical_Habitat_Threat_Basic/FeatureServer/0",
    outFields: ["*"],
    title: "THREATS Critical Habitat Threat Basic",
    visible: false,
  });
  let THREATS_Protected_Lands_Threat_Basic = new FeatureLayer({
    url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/THREATS_Protected_Lands_Threat_Basic/FeatureServer/0",
    outFields: ["*"],
    title: "THREATS Protected Lands Threat Basic",
    visible: false,
  });
  let County_Layer = new FeatureLayer({
    url: "https://ocean.floridamarine.org/arcgis/rest/services/FWC_GIS/MRGIS_Boundaries/FeatureServer/36",
    outFields: ["*"],
    title: "County Work Boundary",
    visible: true,
    renderer: {
      type: "simple", // SimpleRenderer
      symbol: {
        type: "simple-fill", // For polygons
        color: "rgba(0,0,0,0)", // 50% opacity
        outline: {
          color: "blue",
          width: 1,
        },
      },
    },
    labelingInfo: [
      {
        labelExpressionInfo: {
          expression: "$feature.County", // Change "NAME" to your desired field
        },
        symbol: {
          type: "text", // autocasts as new TextSymbol()
          color: "white",
          haloColor: "black",
          haloSize: "2px",
          font: {
            size: 12,
            family: "sans-serif",
            weight: "bold",
          },
        },
        labelPlacement: "center-right",
        minScale: 800000,
      },
    ],

    labelsVisible: true, // Important!
  });
  let Work_Layer = new FeatureLayer({
    url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/FL_Waterway_Debris___Completed_Work_Areas/FeatureServer/0",
    outFields: ["*"],
    title: "Work Area",
    visible: true,
    opacity: 0.3,
  });

  // Adding layers from THREAT_ASSESSMENT_VIEWER_LAYERSET
  let Life_Safety_and_Emergency_Response_Zone_Threats_FULL = new FeatureLayer({
    url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/Life_Safety_and_Emergency_Response_Zone_Threats_FULL/FeatureServer/0",
    outFields: ["*"],
    title: "Life Safety and Emergency Response Zone Threats FULL",
    visible: false,
  });
  let Contamination_and_Environmental_Health_Threats_FULL = new FeatureLayer({
    url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/Contamination_and_Environmental_Health_Threats_FULL/FeatureServer/0",
    outFields: ["*"],
    title: "Contamination and Environmental Health Threats FULL",
    visible: false,
  });
  let Damage_Prone_Critical_Infrastructure_FULL = new FeatureLayer({
    url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/Damage_Prone_Critical_Infrastructure_FULL/FeatureServer/0",
    outFields: ["*"],
    title: "Damage Prone Critical Infrastructure FULL",
    visible: false,
  });
  let Flood_Risk_Mitigation_Zones_Threats_FULL = new FeatureLayer({
    url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/Flood_Risk_Mitigation_Zones_Threats_FULL/FeatureServer/0",
    outFields: ["*"],
    title: "Flood Risk Mitigation Zones Threats FULL",
    visible: false,
  });
  //   let THREATS_FM_dfirm_fldhaz_100_500Yr = new FeatureLayer({
  //   url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/THREATS_FM_dfirm_fldhaz_100_500Yr/FeatureServer/0",
  //   outFields: ["*"],
  //   title: "THREATS FM dfirm fldhaz 100_500Yr",
  //   visible: false,
  // });
  //   let THREATS_PS_StormSurge = new FeatureLayer({
  //   url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/THREATS_PS_StormSurge/FeatureServer/0",
  //   outFields: ["*"],
  //   title: "THREATS_PS_StormSurge",
  //   visible: false,
  // });
  let Navigable_Waterway_Threats_FULL = new FeatureLayer({
    url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/Navigable_Waterway_Threats_FULL/FeatureServer/0",
    outFields: ["*"],
    title: "Navigable Waterway Threats FULL",
    visible: false,
  });
  let Environmental_and_Historic_Preservation_Threats_FULL = new FeatureLayer({
    url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/Environmental_and_Historic_Preservation_Threats_FULL/FeatureServer/0",
    outFields: ["*"],
    title: "Environmental and Historic Preservation Threats FULL",
    visible: false,
  });
  let Eq_Vulnerability_Threats_FULL = new FeatureLayer({
    url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/Eq_Vulnerability_Threats_FULL/FeatureServer/0",
    outFields: ["*"],
    title: "Eq Vulnerability Threats FULL",
    visible: false,
  });

  map.addMany([
    Eq_Vulnerability_Threats_FULL,
    Environmental_and_Historic_Preservation_Threats_FULL,
    Navigable_Waterway_Threats_FULL,
    THREATS_PS_StormSurge,
    THREATS_FM_dfirm_fldhaz_100_500Yr,
    Flood_Risk_Mitigation_Zones_Threats_FULL,
    Damage_Prone_Critical_Infrastructure_FULL,
    Contamination_and_Environmental_Health_Threats_FULL,
    Life_Safety_and_Emergency_Response_Zone_Threats_FULL,
    County_Layer,
    // THREATS_Protected_Lands_Threat_Basic,
    // THREATS_Critical_Habitat_Threat_Basic,
    // THREATS_Navigable_Waterway_Threat_Basic,
    // THREATS_Infrastructure_Damage_Threat_Basic,
    // THREATS_Flood_Mitigation_Threats_Basic,
    // THREATS_Public_Safety_Threats_Basic,
    Work_Layer,
    ticketData,
    featureLayer,
  ]);

  //popup configured
  view.on("click", function (event) {
    view.hitTest(event).then(function (response) {
      const results = response.results;

      // Filter only graphics from FeatureLayers
      const graphics = results.filter(
        (result) =>
          result.graphic.layer && result.graphic.layer.type === "feature"
      );

      if (graphics.length > 0) {
        // Create a popup content string for all features under the click
        let popupContent = "";
        const orderedFields = [
          "COUNTY",
          "Work_Area_Name",
          "Impact",
          "location",
          "image_name",
          "image_url",
          "notes",
        ];
        const hiddenFields = [
          "fid",
          "lat",
          "lon",
          "CreationDate",
          "Creator",
          "EditDate",
          "Editor",
          "GlobalID",
        ]; // fields you want to hide

        graphics.forEach((result, index) => {
          const attrs = result.graphic.attributes;
          popupContent += `<b>Layer ${index + 1} - ${
            result.graphic.layer.title
          }</b><br>`;

          if (index === 0) {
            // Show attributes in defined order for first layer
            orderedFields.forEach((key) => {
              if (attrs[key] !== undefined) {
                if (key === "image_url" && attrs[key]) {
                  popupContent += `<b>Image:</b><br><img src="${attrs[key]}" style="max-width:300px;"><br>`;
                } else {
                  popupContent += `<b>${key}:</b> ${attrs[key]}<br>`;
                }
              }
            });
          } else {
            // For other layers, show all attributes except hidden ones
            for (const key in attrs) {
              if (!hiddenFields.includes(key)) {
                popupContent += `<b>${key}:</b> ${attrs[key]}<br>`;
              }
            }
          }

          popupContent += "<hr>";
        });

        // Show popup
        view.popup.open({
          title: `Found ${graphics.length} feature(s)`,
          content: popupContent,
          location: event.mapPoint,
        });
      } else {
        // Optional fallback if no features were clicked
        view.popup.open({
          title: "No features here",
          content: `Coordinates:<br>Lat: ${event.mapPoint.latitude.toFixed(
            4
          )}, Lon: ${event.mapPoint.longitude.toFixed(4)}`,
          location: event.mapPoint,
        });
      }
    });
  });

  // ------------------selection--------------------------------
  let highlight; // to store the current highlight
  view.whenLayerView(featureLayer).then(function (layerView) {
    view.on("click", function (event) {
      // Clear previous highlight
      if (highlight) {
        highlight.remove();
        highlight = null;
      }

      // Perform hit test to get graphics
      view.hitTest(event).then(function (response) {
        const results = response.results.filter(function (result) {
          return result.graphic.layer === featureLayer;
        });
        // console.log("response", response);

        if (results.length > 0) {
          const graphic = results[0].graphic;

          // Show image
          imageUrl = graphic.attributes.image_url;
          const imageElement = document.getElementById("debrisImage");

          if (imageUrl) {
            imageElement.src = imageUrl;
            imageElement.style.display = "block";
          } else {
            imageElement.style.display = "none";
          }
          // Show image

          //show impact field
          const impactField = graphic.attributes.Impact;
          const impactElement = document.getElementById("threatsCell");

          if (impactField) {
            impactElement.value = impactField;
          } else {
            console.log("Impact filed is not set.");
          }
          //show impact field

          //show notes
          const notesField = graphic.attributes.notes;
          const notesElement = document.getElementById("notesCell");

          if (notesField) {
            notesElement.value = notesField;
          } else {
            console.log("Notes filed is not set.");
          }
          //show notes

          // Highlight selected feature
          highlight = layerView.highlight(graphic);
          // console.log("highlight", highlight);

          // Optional: Zoom to the selected feature
          if (graphic.geometry.extent) {
            view.goTo(graphic.geometry.extent.expand(2));
          } else {
            view.goTo(graphic.geometry); // For point geometries
          }
        }
      });
    });
  });

  //sketch and control buttons
  view.when(() => {
    view.ui.remove("zoom");

    const searchWidget = new Search({ view });
    const zoomWidget = new Zoom({ view });

    // Create a single shared container for both widgets
    const horizontalContainer = document.createElement("div");
    horizontalContainer.style.display = "flex";
    horizontalContainer.style.alignItems = "center";
    horizontalContainer.style.gap = "10px";
    horizontalContainer.style.padding = "2px";
    // horizontalContainer.style.marginLeft = "2px";
    horizontalContainer.style.background = "transparent";
    // horizontalContainer.style.backgroundColor = "#004b23";
    horizontalContainer.style.borderRadius = "6px";

    // Let ArcGIS render them manually
    view.ui.add(searchWidget, "manual");
    view.ui.add(zoomWidget, "manual");

    // Append them in the order you want: Zoom (left), Search (right)
    horizontalContainer.appendChild(searchWidget.container);
    horizontalContainer.appendChild(zoomWidget.container);

    // Add combined container to view
    view.ui.add(horizontalContainer, "top-right");

    //--------------Adding layerlist-----------------
    const layerList = new LayerList({
      view: view,
    });

    const layerListExpand = new Expand({
      view: view,
      content: layerList,
      expandIconClass: "esri-icon-layer-list", // optional: changes icon
      expandTooltip: "Map Layers",
    });

    view.ui.add(layerListExpand, "top-right");

    //---------------Adding legends--------------------------
    const legend = new Legend({
      view: view,
    });

    const legendListExpand = new Expand({
      view: view,
      content: legend,
      expandIconClass: "esri-icon-legend", // optional: changes icon
      expandTooltip: "Legend",
    });

    view.ui.add(legendListExpand, "top-right");

    //sketch

    const sketch = new Sketch({
      view: view,
      layer: graphicsLayer,
      availableCreateTools: ["polygon", "rectangle"],
      creationMode: "single",
      visibleElements: {
        createTools: { point: false, polyline: false, circle: false },
        selectionTools: {
          "lasso-selection": false,
          "rectangle-selection": false,
        },
        settingsMenu: false,
      },
    });

    // Button click listener
    document.getElementById("polygonBtn").addEventListener("click", () => {
      sketch.create("polygon");
      view.ui.add(sketch, "top-right");
    });

    let selectedFeatures = [];
    function updateUI() {
      document.getElementById(
        "featureCount"
      ).textContent = `Selected Features: ${selectedFeatures.length}`;
      const hasSelection = selectedFeatures.length > 0;
    }

    // Refresh button to refresh table
    document
      .getElementById("refreshBtn")
      .addEventListener("click", highlightSelection);

    function highlightSelection() {
      // graphicsLayer.removeAll();
      selectedFeatures.forEach((feature) => {
        graphicsLayer.add(
          new Graphic({
            geometry: feature.geometry,
            symbol: {
              type: "simple-marker",
              style: "circle",
              size: 10,
              color: [0, 255, 255, 0.0],
              outline: { color: [0, 255, 255, 1.0], width: 2 },
            },
          })
        );
      });

      //---------------Table-----------------------------

      const container = document.getElementById("tableContainer");
      container.innerHTML = ""; // Clear before adding new tables

      // Adding new functon to create feature table
      const groupedData = {};

      selectedFeatures.forEach((feature) => {
        const attr = feature.attributes;
        const county = attr.COUNTY || "Unknown County";
        const area = attr.Work_Area_Name || "Unknown Area";

        // Initialize county group
        if (!groupedData[county]) {
          groupedData[county] = {};
        }

        // Initialize area group within county
        if (!groupedData[county][area]) {
          groupedData[county][area] = [];
        }

        // Push feature data into the group
        groupedData[county][area].push({
          threat: attr.Impact || "N/A",
          image_url: attr.image_url || null,
          image_name: attr.image_name || null,
          notes: attr.notes || null,
          location: attr.location || null,
        });
      });

      // Build the HTML directly
      for (const [county, areas] of Object.entries(groupedData)) {
        const countyTable = document.createElement("table");
        countyTable.className = "featureTable";
        countyTable.id = "featureTable"; // Match the original ID

        // Create county row
        const countyRow = document.createElement("tr");
        countyRow.innerHTML = `
    <td class="label">County:</td>
    <td class="value" id="countyCell">${county}</td>
  `;
        countyTable.appendChild(countyRow);

        for (const [area, features] of Object.entries(areas)) {
          // Create area row
          const areaRow = document.createElement("tr");
          areaRow.innerHTML = `
      <td class="label">Area:</td>
      <td class="value" id="areaCell">${area}</td>
    `;
          countyTable.appendChild(areaRow);

          // Create threats row
          const threatSet = new Set(features.map((item) => item.threat));
          const threats = [...threatSet].join(", ");

          const threatsRow = document.createElement("tr");
          threatsRow.innerHTML = `
      <td class="label">Threats:</td>
      <td class="value" id="threatsCell">${threats}</td>
    `;
          countyTable.appendChild(threatsRow);

          // Create Notes row
          const notesSet = new Set(features.map((item) => item.notes));
          const notes = [...notesSet].join(", ");

          const notesRow = document.createElement("tr");
          notesRow.innerHTML = `
      <td class="label">Notes:</td>
      <td class="value" id="notesCell">${notes}</td>
    `;
          countyTable.appendChild(notesRow);

          // Adding lat long to feature table
          const location = features.map((item) => item.location);

          // Create images row
          const imagesRow = document.createElement("tr");
          const imagesContent = features
            .map((item) => {
              if (item.image_url) {
                const cleanLocation = item.location.replace(/[()]/g, "");
                return `
                  <div class="image-with-location">
                    <div class="location-info">${cleanLocation}</div>
                    <img class="img-fluid mx-auto d-block avoid-break" src="${item.image_url}" alt="Feature Image" />
                  </div>
                `;
              }
              return "No image";
            })
            .join("<br>"); // Separate multiple images with line breaks

          imagesRow.innerHTML = `
      <td class="value images-cell" colspan="2">
      <strong>Images:</strong><br />
      ${imagesContent}
      </td>
    `;
          countyTable.appendChild(imagesRow);
        }
        container.appendChild(countyTable);
      }
    }

    sketch.on("create", async (event) => {
      if (event.state === "complete") {
        // console.log("Polygon geometry:", event.graphic.geometry); // Add this

        const query = featureLayer.createQuery();
        query.geometry = event.graphic.geometry;
        query.spatialRelationship = "intersects";
        query.returnGeometry = true;
        query.outFields = ["*"];

        const result = await featureLayer.queryFeatures(query);

        selectedFeatures = result.features;
        graphicsLayer.removeAll();

        highlightSelection();
        updateUI();

        document
          .getElementById("updateBtn")
          .addEventListener("click", async () => {
            const checkboxes = document.querySelectorAll(
              "#impactFields input[type='checkbox']:checked"
            );

            const notes = document.getElementById("notesText").value;

            if (checkboxes.length > 0) {
              const selectedValues = Array.from(checkboxes).map(
                (cb) => cb.value
              );

              for (let feature of selectedFeatures) {
                feature.attributes.Impact = selectedValues.join(", ");
              }
            }

            if (notes) {
              for (let feature of selectedFeatures) {
                feature.attributes.notes = notes;
              }
            }
            const edits = await featureLayer.applyEdits({
              updateFeatures: selectedFeatures,
            });

            if (edits.updateFeatureResults.length > 0) {
              alert("Updated successfully!");
            } else {
              alert("No updates were made.");
            }
          });
      }
    });

    //clear button
    document.getElementById("clearBtn").addEventListener("click", () => {
      graphicsLayer.removeAll();
      selectedFeatures = [];
      highlight = null;
      updateUI();
      const checkboxes = document.querySelectorAll(
        '#impactFields input[type="checkbox"]'
      );
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });
      highlight.remove();
    });
  });

  view.whenLayerView(featureLayer).then((layerView) => {
    featureLayer.queryExtent().then((response) => view.goTo(response.extent));
  });
});

//---------------All Import section---------------------------------------------------------
import { generatePDF } from "./printPdf.js";

//-------------------------------printing pdf----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const button = document
    .getElementById("downloadPDFBtn")
    .addEventListener("click", () => {
      generatePDF();
    });
});

const toggleBtn = document.getElementById("toggleSidebar");
const toggleBtnMap = document.getElementById("toggleSidebarMap");

const sidebar = document.getElementById("sidebar");
const icon = toggleBtn.querySelector("i");
const mainMap = document.getElementById("mainMap");

// Shared toggle function
function toggleSidebar() {
  const isHidden = sidebar.classList.contains("d-none");

  if (isHidden) {
    // Expand the sidebar
    sidebar.classList.remove("d-none");
    mainMap.classList.remove("col-12");
    mainMap.classList.add("col-7");
    sidebar.classList.add("col-4");
    icon.classList.remove("fa-chevron-right");
    icon.classList.add("fa-chevron-left");
  } else {
    // Collapse the sidebar
    sidebar.classList.remove("col-4");
    mainMap.classList.remove("col-7");
    mainMap.classList.add("col-12");
    sidebar.classList.add("d-none");
    icon.classList.remove("fa-chevron-left");
    icon.classList.add("fa-chevron-right");
  }

  // Resize map if ArcGIS view exists
  setTimeout(() => {
    if (typeof view !== "undefined" && view) {
      view.resize();
    }
  }, 300);
}

const baseUrl =
  "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/SGC_Image_Points_V2/FeatureServer/0/query";

// Change this to the actual field you're analyzing
const fieldName = "Impact";

async function getCount(whereClause) {
  const url = `${baseUrl}/query?where=${encodeURIComponent(
    whereClause
  )}&returnCountOnly=true&f=json`;
  const response = await fetch(url);
  const data = await response.json();
  return data.count;
}

async function countByField(field) {
  const total = await getCount("1=1");
  const nullOrEmpty = await getCount(`${field} IS NULL OR ${field} = ''`);
  const hasValue = await getCount(`${field} IS NOT NULL AND ${field} <> ''`);

  // Update the header with counts
  document.getElementById("totalCount").textContent = total;
  document.getElementById("withDataCount").textContent = hasValue;
  document.getElementById("emptyCount").textContent = nullOrEmpty;
}

// Call the function
countByField(fieldName);

// Register both toggle buttons
toggleBtn.addEventListener("click", toggleSidebar);
toggleBtnMap.addEventListener("click", toggleSidebar);
