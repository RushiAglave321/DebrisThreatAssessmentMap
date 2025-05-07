require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/widgets/Search",
  "esri/geometry/geometryEngine",
  "esri/layers/GraphicsLayer",
  "esri/widgets/Sketch",
  "esri/Graphic",
  "esri/layers/MapImageLayer",
  "esri/widgets/LayerList",
  "esri/widgets/Expand",
  "esri/layers/GroupLayer",
  "esri/widgets/Legend",
  "esri/widgets/Zoom",
  "esri/rest/locator",
], (
  Map,
  MapView,
  FeatureLayer,
  Search,
  geometryEngine,
  GraphicsLayer,
  Sketch,
  Graphic,
  MapImageLayer,
  LayerList,
  Expand,
  GroupLayer,
  Legend,
  Zoom,
  locator
) => {
  const map = new Map({ basemap: "streets" });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    zoom: 6,
    center: [-80.19179, 25.76168], // Miami
  });

  view.when(() => {
    view.resize(); // Ensures ArcGIS adjusts the canvas to fit
    view.goTo({
      target: someGeometryOrExtent, // Optional: if you want to center
    });
  });

  //Graphic layer for selection
  const graphicsLayer = new GraphicsLayer({
    title: "Selected Features",
  });
  map.add(graphicsLayer);

  //trying to group layers
  let infrastructureGroup = new GroupLayer({
    title: "Infrastructure Damage Prevention",
    visible: false,
    layers: [
      new FeatureLayer({
        title: "Bridges",
        url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/Bridges/FeatureServer/0",
        outFields: ["*"],
        // visible: false
      }),
    ],
  });

  let publicServicesGroup = new GroupLayer({
    title: "Public Safety",
    visible: false,
    layers: [
      new FeatureLayer({
        title: "Schools",
        url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/Schools/FeatureServer/0",
        outFields: ["*"],
        // visible: false
      }),
      new FeatureLayer({
        title: "Hospital",
        url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/Hospitals/FeatureServer/0",
        outFields: ["*"],
        // visible: false
      }),
      new FeatureLayer({
        title: "Firestations",
        url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/Firestations/FeatureServer/0",
        outFields: ["*"],
        // visible: false
      }),
      new FeatureLayer({
        title: "Evacuation Routes",
        url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/Evacuation_Routes/FeatureServer/0",
        outFields: ["*"],
        // visible: false
      }),
      new FeatureLayer({
        title: "Brownfields",
        url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/Brownfields/FeatureServer/0",
        outFields: ["*"],
        // visible: false
      }),
    ],
  });

  let emergencyGroup = new GroupLayer({
    title: "Flood Mitigation",
    visible: false,
    layers: [
      new FeatureLayer({
        title: "Box Culverts",
        url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/Box_Culverts/FeatureServer/0",
        outFields: ["*"],
        // visible: false
      }),
      new FeatureLayer({
        title: "FDOT Surface Water Drainage Network",
        url: "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/FDOT_Surface_Water_Drainage_Network/FeatureServer/0",
        outFields: ["*"],
        // visible: false
      }),
    ],
  });

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

  // Add grouped layers to map
  // map.addMany([ticketData, featureLayer]);
  map.addMany([
    THREATS_Public_Safety_Threats_Basic,
    THREATS_PS_StormSurge,
    THREATS_Flood_Mitigation_Threats_Basic,
    THREATS_FM_dfirm_fldhaz_100_500Yr,
    THREATS_Infrastructure_Damage_Threat_Basic,
    THREATS_Navigable_Waterway_Threat_Basic,
    THREATS_Critical_Habitat_Threat_Basic,
    THREATS_Protected_Lands_Threat_Basic,
    infrastructureGroup,
    publicServicesGroup,
    emergencyGroup,
    ticketData,
    featureLayer,
    
  ]);

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
          const impactElement = document.getElementById("impactInput");

          if (impactField) {
            imageElement.value = impactField;
          } else {
            console.log("Impact filed is not set.");
          }
          //show impact field

          // console.log("graphic attributes", graphic.attributes);

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

    //legends
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

    function highlightSelection() {
      graphicsLayer.removeAll();
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

      const locatorUrl =
        "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";

      const groupedData = {};

      const reverseGeocodePromises = selectedFeatures.map((feature) => {
        const attr = feature.attributes;
        const latitude = attr.latitude || attr.Lat || attr.lat;
        const longitude = attr.longitude || attr.Lon || attr.lon;

        return locator
          .locationToAddress(locatorUrl, {
            location: { latitude, longitude },
          })
          .then((response) => {
            const address = response.address;
            const county = attr.COUNTY || "Unknown County";
            const area = address || "Unknown Area";

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
            });
          })
          .catch((error) => {
            console.error("Reverse geocoding failed:", error);
          });
      });

      // Once all geocoding is done, build the HTML
      Promise.all(reverseGeocodePromises).then(() => {
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
            const threats = features.map((item) => item.threat).join(", ");
            const threatsRow = document.createElement("tr");
            threatsRow.innerHTML = `
              <td class="label">Threats:</td>
              <td class="value" id="threatsCell">${threats}</td>
            `;
            countyTable.appendChild(threatsRow);

            // Create images row
            const imagesRow = document.createElement("tr");
            const imagesContent = features
              .map((item) =>
                item.image_url
                  ? `<img class="img-fluid mx-auto d-block avoid-break" src="${item.image_url}" alt="Feature Image" />`
                  : "No image"
              )
              .join("<br>"); // Separate multiple images with line breaks

            imagesRow.innerHTML = `
              <td class="label">Images:</td>
              <td class="value">${imagesContent}</td>
            `;
            countyTable.appendChild(imagesRow);
          }

          container.appendChild(countyTable);
        }
      });
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
        highlightSelection();
        updateUI();

        document
          .getElementById("updateBtn")
          .addEventListener("click", async () => {
            console.log("update button");
            const checkboxes = document.querySelectorAll(
              "#impactFields input[type='checkbox']:checked"
            );
            const selectedValues = Array.from(checkboxes).map((cb) => cb.value);
            console.log("selectedValues", selectedValues);

            for (let feature of selectedFeatures) {
              feature.attributes.Impact = selectedValues.join(", ");
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
//-------------------------------printing pdf----------------------------------------------------

async function generatePDF() {
  const container = document.getElementById("tableContainer");

  // Create a clone of the content to preserve original styling
  const element = container.cloneNode(true);

  // Store original styles
  const originalStyles = {
    maxHeight: container.style.maxHeight,
    overflow: container.style.overflow,
  };

  // Temporarily modify styles for printing
  container.style.maxHeight = "none";
  container.style.overflow = "visible";

  try {
    await generatePDFNow(container);
  } catch (error) {
    console.error("Printing failed:", error);
    alert("Failed to generate PDF. Please try again.");
  } finally {
    // Restore original styles
    container.style.maxHeight = originalStyles.maxHeight;
    container.style.overflow = originalStyles.overflow;
  }
}

async function generatePDFNow(element) {
  // Create a print window
  const printWindow = window.open("", "_blank", "width=800,height=600");

  if (!printWindow) {
    throw new Error("Popup was blocked. Please allow popups for this site.");
  }

  // Prepare print-specific styles
  const printStyles = `
    <style>
      @page {
        size: A4;
        margin: 1cm;
      }
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
      }
      .featureTable {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        page-break-inside: avoid;
      }
      .featureTable td {
        padding: 8px;
        border: 1px solid #ddd;
      }
      .label {
        font-weight: bold;
        width: 30%;
      }
      .img-fluid {
        max-width: 100%;
        height: auto;
        max-height:200px;
        margin-bottom:5px
      }
      .avoid-break {
        page-break-inside: avoid;
      }
      .page-break {
        page-break-after: always;
      }
      @media print {
        .no-print {
          display: none;
        }
      }
    </style>
  `;

  // Create the print document
  printWindow.document.open();
  printWindow.document.write(`
    <html>
      <head>
        <title>Debris Threats Report</title>
        ${printStyles}
      </head>
      <body>
        <div id="print-content"></div>
      </body>
    </html>
  `);

  // Process images to ensure they load
  const images = element.querySelectorAll("img");
  const imagePromises = Array.from(images).map((img) => {
    return new Promise((resolve) => {
      if (img.complete && img.naturalHeight !== 0) {
        resolve();
      } else {
        img.onload = resolve;
        img.onerror = resolve; // Continue even if image fails
      }
    });
  });

  // Wait for images to load
  await Promise.all(imagePromises);

  // Append the content to the print window
  const printContent = printWindow.document.getElementById("print-content");
  printContent.appendChild(element.cloneNode(true));

  printWindow.document.close();

  // Wait for the print window to fully load
  await new Promise((resolve) => {
    printWindow.onload = resolve;
  });

  // Trigger print after a short delay
  setTimeout(() => {
    printWindow.print();

    // Close the window after printing (with delay for Firefox)
    setTimeout(() => {
      printWindow.close();
    }, 1000);
  }, 500);
}

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

const baseUrl = 'https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/SGC_Image_Points_V2/FeatureServer/0/query';

// Change this to the actual field you're analyzing
const fieldName = 'Impact'; 


async function getCount(whereClause) {
  const url = `${baseUrl}/query?where=${encodeURIComponent(whereClause)}&returnCountOnly=true&f=json`;
  const response = await fetch(url);
  const data = await response.json();
  return data.count;
}

async function countByField(field) {
  const total = await getCount('1=1');
  const nullOrEmpty = await getCount(`${field} IS NULL OR ${field} = ''`);
  const hasValue = await getCount(`${field} IS NOT NULL AND ${field} <> ''`);

  // Update the header with counts
  document.getElementById('totalCount').textContent = total;
  document.getElementById('withDataCount').textContent = hasValue;
  document.getElementById('emptyCount').textContent = nullOrEmpty;
}

// Call the function
countByField(fieldName);


// Register both toggle buttons
toggleBtn.addEventListener("click", toggleSidebar);
toggleBtnMap.addEventListener("click", toggleSidebar);
