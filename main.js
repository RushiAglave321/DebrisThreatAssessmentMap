//---------------All Import section---------------------------------------------------------
import { generatePDF } from "./printPdf.js";
import { setupPopup } from "./popupHandler.js";
import { updateTable } from "./updateTableDynamically.js";

require([
  "esri/Map",
  "esri/WebMap",
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
  WebMap,
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

  const map = new WebMap({
    portalItem: {
      id: "d5644bd6877a4fe2a9de21af0c93b909"
    }
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    zoom: 6,
    center: [-80.19179, 25.76168], // Miami
  });

  //------------*****MAP TOOL STARTS****-----------------------------------------------
  // -----------Adding basemapgallery -----------------------
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

  //--------------Adding layerlist-----------------
  const layerList = new LayerList({
    view: view,
  });

  const layerListExpand = new Expand({
    view: view,
    content: layerList,
    expandIconClass: "esri-icon-layer-list", // icon
    expandTooltip: "Map Layers",
  });

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

  //---------Adding zoom and search bar-----------------
  view.ui.remove("zoom");

  const searchWidget = new Search({ view });
  const zoomWidget = new Zoom({ view });

  // Create a single shared container for both widgets
  const horizontalContainer = document.createElement("div");
  horizontalContainer.style.display = "flex";
  horizontalContainer.style.alignItems = "center";
  horizontalContainer.style.gap = "10px";
  horizontalContainer.style.padding = "2px";
  horizontalContainer.style.background = "transparent";
  horizontalContainer.style.borderRadius = "6px";
  // Let ArcGIS render them manually
  view.ui.add(searchWidget, "manual");
  view.ui.add(zoomWidget, "manual");

  // Append them in the order you want: Zoom (left), Search (right)
  horizontalContainer.appendChild(searchWidget.container);
  horizontalContainer.appendChild(zoomWidget.container);

  //Adding Order wise map componant
  view.ui.add(horizontalContainer, "top-right"); //zoom and search bar
  view.ui.add(layerListExpand, "top-right"); // layerlist
  view.ui.add(legendListExpand, "top-right"); // legend 

  //--------------------------------------------*****MAP TOOL ENDS****-----------------------------------------------


  //Graphic layer for selection
  const graphicsLayer = new GraphicsLayer({
    title: "Selected Features",
  });
  map.add(graphicsLayer);

  //-----------popup configuration function----------------
  // setupPopup(view);
  //----------popup configuration function------------------

  //------------Sketch Interaction-----------------------------------------------
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

  // -----Polygon Button click - Sketch event listener ---------
  document.getElementById("polygonBtn").addEventListener("click", () => {
    sketch.create("polygon");
    view.ui.add(sketch, "top-right");
  });
  //------------------***********-----------------------------------------------------


  //-----------Main function for wrapping all functionality---------------------------
  let selectedFeatures = []; //Storing Selected Features

  map.when(() => {
    //-----finding layer from webmap------------
    const featureLayer = map.layers.find(layer => layer.title === "Debris - AshBritt")
    if (!featureLayer) {
      console.error("Feature layer not found!");
      return;
    } else {
      console.log("feature layer found")
    }

    //-----To zoom on the feature layer when feature layer is ready
    view.whenLayerView(featureLayer).then((layerView) => {
      featureLayer.queryExtent().then((response) => view.goTo(response.extent));
    });

    sketch.on("create", async (event) => {
      if (event.state === "complete") {
        const query = featureLayer.createQuery();
        query.geometry = event.graphic.geometry;
        query.spatialRelationship = "intersects";
        query.returnGeometry = true;
        query.outFields = ["*"];

        const result = await featureLayer.queryFeatures(query);

        selectedFeatures = result.features;
        graphicsLayer.removeAll();

        // Applying symbology to selected features
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
        //-----------------************-------------------

        updateTable(selectedFeatures); //update values in the table
        updateUI(selectedFeatures); //update selected features
      }
    });

    // ✅ Attach this once, outside the sketch.on block
    document.getElementById("updateBtn").addEventListener("click", async () => {
      if (!selectedFeatures || selectedFeatures.length === 0) {
        alert("No features selected.");
        return;
      }

      const checkboxes = document.querySelectorAll(
        "#impactFields input[type='checkbox']:checked"
      );
      const notes = document.getElementById("notesText").value;

      const selectedValues = Array.from(checkboxes).map((cb) => cb.value);

      for (let feature of selectedFeatures) {
        if (selectedValues.length > 0) {
          feature.attributes.Impacts = selectedValues.join(", ");
        }
        if (notes) {
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

    //------clear button-----------
    document.getElementById("clearBtn").addEventListener("click", () => {
      graphicsLayer.removeAll();
      selectedFeatures = [];

      updateUI(selectedFeatures);
      const checkboxes = document.querySelectorAll(
        '#impactFields input[type="checkbox"]'
      );
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });

      const mapCheckbox = document.getElementById("takeScreenshot");
      if (mapCheckbox) {
        mapCheckbox.checked = false;
        localStorage.removeItem("mapScreenshot");
      }
    });

    // ------Refresh button to refresh table------
    document.getElementById("refreshBtn").addEventListener("click", () => {
      updateTable(selectedFeatures);
    });

    //---------------Print map in report ----------------------
    document.getElementById("takeScreenshot").addEventListener("change", function () {
      if (this.checked) {
        // Hide labels before screenshot
        view.takeScreenshot().then((screenshot) => {
          localStorage.setItem("mapScreenshot", screenshot.dataUrl);
        });

      } else {
        localStorage.removeItem("mapScreenshot");
      }
    });
  })

});


// ---------toggle button for sideview and map-------------------

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

// ---------Showing Statistics of Impact field---------------------
const baseUrl =
  "https://services6.arcgis.com/BbkhAXl184tJwj9J/arcgis/rest/services/SGC_Image_Points_V2/FeatureServer/0/query";

// Change this to the actual field you're analyzing
const fieldName = "Impacts";

async function getCount(whereClause) {
  const url = `${baseUrl}/?where=${encodeURIComponent(
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
//------------------------------------****************------------------------

// Register both toggle buttons
toggleBtn.addEventListener("click", toggleSidebar);
toggleBtnMap.addEventListener("click", toggleSidebar);

//----------------Buttons-------------------------------------------------------------------
//-------------------------------Download pdf Button----------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const button = document
    .getElementById("downloadPDFBtn")
    .addEventListener("click", () => {
      const mapCheckbox = document.getElementById("takeScreenshot");
      if (!mapCheckbox.checked) {
        // mapCheckbox.checked == false;
        localStorage.removeItem("mapScreenshot");
      }
      generatePDF();
    });
});

// Showing a Count of Selected features 
function updateUI(selectedFeatures) {
  document.getElementById(
    "featureCount"
  ).textContent = `Selected Features: ${selectedFeatures.length}`;
}