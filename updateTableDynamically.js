//Updating Table function
export function updateTable(selectedFeatures) {

    if(!Array.isArray(selectedFeatures) || selectedFeatures.length === 0){return}

    //---------------Updating Table Value Dynamically----------------------------
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
            threat: attr.Impacts || "N/A",
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

            //-------------------threats row-----------------------
            // Step 1: Define known threat types
            const knownThreats = [
                "Immediate threat to life, public health, or safety",
                "Immediate threat to improved public or private property",
                "Obstruction to vessel passage in an eligible navigable waterway",
                "Submerged or floating debris threatening navigation or embankment stability",
                "Obstruction to intake structures",
                "Risk of structural damage to bridges, culverts, or other infrastructure",
                "Increased flooding risk to improved property during a 5-year flood even",
                "To Be Removed",
                // Add more known types if needed
            ];

            // Step 2: Extract all threats that match known types
            const matchedThreats = new Set();

            features.forEach((item) => {
                if (!item.threat || item.threat === "N/A") return;

                knownThreats.forEach((threatType) => {
                    if (item.threat.includes(threatType)) {
                        matchedThreats.add(threatType);
                    }
                });
            });

            // Step 3: Convert to list items
            const threatList = [...matchedThreats]
                .map((threat) => `<li>${threat}</li>`)
                .join("");

            // Step 4: Inject into the table
            const threatsRow = document.createElement("tr");
            threatsRow.innerHTML = `
        <td class="label">Threats:</td>
        <td class="value" id="threatsCell">
          <ul style="margin: 0; padding-left: 20px;">${threatList}</ul>
        </td>
      `;
            countyTable.appendChild(threatsRow);

            //-------------------threats row-----------------------

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
            // const location = features.map((item) => item.location);

            // Create images row
            const imagesRow = document.createElement("tr");
            const imagesContent = features
                .map((item) => {
                    if (item.image_url) {
                        const cleanLocation = item.location.replace(/[()]/g, "");
                        const [lat, lon] = cleanLocation
                            .split(",")
                            .map((coord) => Number(parseFloat(coord).toFixed(6)));
                        return `
                <div class="image-with-location">
                  <div class="location-info" style="text-align: center;">${lat},${" "}${lon}</div>
                  <img class="img-fluid mx-auto d-block avoid-break" src="${item.image_url
                            }" alt="Feature Image" />
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