export async function generatePDF() {
  const container = document.getElementById("tableContainer");

  const element = container.cloneNode(true);
  const originalStyles = {
    maxHeight: container.style.maxHeight,
    overflow: container.style.overflow,
  };

  container.style.maxHeight = "none";
  container.style.overflow = "visible";

  try {
    await generatePDFNow(element);
  } catch (error) {
    console.error("Printing failed:", error);
    alert("Failed to generate PDF. Please try again.");
  } finally {
    container.style.maxHeight = originalStyles.maxHeight;
    container.style.overflow = originalStyles.overflow;
  }
}

async function generatePDFNow(element) {
  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (!printWindow) throw new Error("Popup blocked. Please allow popups.");

  const now = new Date();
  const formattedDate = `${now.getMonth() + 1
    }/${now.getDate()}/${now.getFullYear()}`;
  const formattedTime = `${now.getHours()}:${String(now.getMinutes()).padStart(
    2,
    "0"
  )}:${String(now.getSeconds()).padStart(2, "0")}`;


  const printStyles = `
    <style>
      @page {
        size: A4;
        margin: 1.5cm 1cm 2cm 1cm;

        @top-left {
          content: "";
          // background-image: url('path/to/your/logo.png');
          background-size: contain;
          background-repeat: no-repeat;
          height: 1.5cm;
          width: 3cm;
          margin-top: -0.5cm;
        }
       
        @bottom-center {
          content: "Page " counter(page) " of " counter(pages);
          font-size: 9pt;
          font-family: Arial, sans-serif;
          color: #555;
        }
      }

      
      body {
        font-family: Arial, sans-serif;
        line-height: 1.5;
        color: #333;
        margin: 0;
        padding: 15px 0 0 0;
      }
      .report-container {
        padding: 20px;
      }
      .report-header {
        margin-bottom: 10px;
        border-bottom: 2px solid #0066cc;
        padding-bottom: 5px;
      }
      .report-title {
        font-size: 16pt;
        color: #0066cc;
      }
      .report-subtitle {
        font-size: 10pt;
        color: #666;
        margin: 0;
      }
      .section {
        margin: 0;
        page-break-inside: auto;
        page-break-before: auto;
        page-break-after: auto;
      }
      .section-title {
        font-size: 14pt;
        color: #0066cc;
        
      }
      .featureTable {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
        // page-break-inside: avoid;
      }
      .featureTable .label {
        background-color: #f5f5f5;
        text-align: left;
        padding: 8px;
        border: 1px solid #ddd;
        font-weight: bold;
        width: 20%;
      }
      .featureTable .value {
        padding: 8px;
        border: 1px solid #ddd;
        width: 80%;
      }
      .featureTable .county-cell {
        color: #0066cc; /* Blue text color */
        font-weight: bold;
        border-left: none !important;
        border-right: none !important;
        border-top: none !important;
        padding: 8px;
        background-color: #f5f5f5; /* Optional: match the label background */
        page-break-before: always;

      }
      .featureTable .images-cell {
        border-left: none !important;
        border-right: none !important;
        border-bottom: none !important;
        padding: 8px;
        background-color: #f5f5f5; /* Optional: match the label background */
      }
      .location-info {
        font-family: monospace;
        background-color: #f9f9f9;
        padding: 2px 5px;
        border-radius: 3px;
        font-size: 10px;
        margin-bottom: 5px;
        text-align: center;
      }
      .images-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin: 20px 0;
        width: 100%;
        
       
      }
      .image-with-location {
        display: flex;
        flex-direction: column;
        height: 100%;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .image-with-location img {
        width: 100%;
        height: calc(100% - 30px); /* Subtract space for location info */
        object-fit: contain;
        margin: 0 auto;
        box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        background-color: white;
        border-radius: 6px;
        padding: 8px;
        border: 1px solid #ccc;
      }
      .image-location-text {
        text-align: center;
        padding: 5px;
        font-size: 10px;
        background-color: #f9f9f9;
        margin-top: 5px;
        border-radius: 3px;
      }
        
      @media print {
        .no-print {
          display: none;
        }
        .logo-every-page {
          position: fixed;
          display:flex;
          justify-content:end;
          z-index: 1000;
          top:0;
          right:0
        }
        .img-logo{
          width: 153.6px;
          height: 30.7px;
        }
      }
    </style>
  `;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Debris Threat Assessment</title>
        ${printStyles}
      </head>
      <body>
      <div class="logo-every-page">
        <img src="images/CDR_EM_black_transparent.png" alt="Logo" class="img-logo">
      </div>
        <div class="report-container">
          <div class="report-header">
            <h1 class="report-title">Debris Threat Assessment</h1>
            <p class="report-subtitle">Generated on ${formattedDate} at ${formattedTime}</p>
            </div>
            <div id="print-content"></div>
          
        </div>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  const printContent = printWindow.document.getElementById("print-content");
  const contentClone = element.cloneNode(true);
  const featureTables = contentClone.querySelectorAll(".featureTable");

  // Adding map snapshot here
  const screenshotDataUrl = localStorage.getItem("mapScreenshot");

  if (screenshotDataUrl) {
    const mapImage = printWindow.document.createElement("img");
    mapImage.src = screenshotDataUrl;
    mapImage.alt = "Map Screenshot";
    mapImage.style.maxWidth = "100%";
    mapImage.style.height = "auto";
    mapImage.style.display = "block";
    mapImage.style.border = "1px solid #ccc";
    mapImage.style.borderRadius = "6px";
    mapImage.style.boxShadow = "2px 2px 4px rgba(0, 0, 0, 0.2)";
    mapImage.className = "map-screenshot";

    // Center wrapper
    const mapImageWrapper = printWindow.document.createElement("div");
    mapImageWrapper.style.textAlign = "center";
    mapImageWrapper.style.textAlign = "center";
    mapImageWrapper.style.width = "100%";
    mapImageWrapper.style.margin = "auto";
    mapImageWrapper.appendChild(mapImage);

    const mapSection = printWindow.document.createElement("div");
    mapSection.className = "section";
    mapSection.style.display = "flex";
    mapSection.style.flexDirection = "column";
    mapSection.style.justifyContent = "center"; // Vertical centering
    mapSection.style.alignItems = "center"; // Horizontal centering
    mapSection.style.minHeight = "calc(100vh - 4cm)"; // Full page height minus margins
    mapSection.style.pageBreakAfter = "always";
    mapSection.style.width = "100%";

    const title = printWindow.document.createElement("h2");
    title.className = "section-title";
    title.innerText = "Debris Threat Assessment Map";
    title.style.marginBottom = "10px";

    mapSection.appendChild(title);
    mapSection.appendChild(mapImageWrapper);

    const reportContainer = printWindow.document.querySelector(".report-container");
    const header = reportContainer.querySelector(".report-header");

    if (header && mapSection) {
      reportContainer.insertBefore(mapSection, header.nextSibling);
    }
  }

  //-------------------Editing county row-----------------------------------
  let count = 1;
  featureTables.forEach((table) => {
    // Find all rows in the table
    const rows = table.querySelectorAll("tr");

    // Find the county row by checking each row's label text
    for (const row of rows) {
      const labelCell = row.querySelector(".label");
      if (labelCell && labelCell.textContent.trim() === "County:") {
        const valueCell = row.querySelector(".value");

        if (valueCell) {
          // Create new combined cell
          const combinedCell = printWindow.document.createElement("td");
          combinedCell.className = "value county-cell";
          if (screenshotDataUrl) {
            combinedCell.style.pageBreakBefore = "always";
          } else {
            if (count === 1) {
              combinedCell.style.pageBreakBefore = "avoid";
              count++; // ✅ Make sure to increment here
            } else {
              combinedCell.style.pageBreakBefore = "always";
              
            }
          }

          combinedCell.colSpan = 2;
          combinedCell.innerHTML = `<strong>County:</strong> ${valueCell.textContent}`;

          // Replace the entire row with the new cell
          row.innerHTML = "";
          row.appendChild(combinedCell);
        }

        break; // Exit loop after finding county row
      }
    }
  });

  //--------------handling area row here----------------------------------
  featureTables.forEach((table) => {
    const rows = table.querySelectorAll("tr");
    let countySeenBeforeArea = false;

    for (const row of rows) {
      const strongElement = row.querySelector('strong');

      const labelCell = row.querySelector(".label");
      const labelText = labelCell?.textContent.trim();

      if (strongElement && strongElement.textContent.trim() === "County:") {
        countySeenBeforeArea = true;
      }

      if (labelText === "Area:") {
        // Apply style only if county has NOT been seen
        if (!countySeenBeforeArea) {
          row.style.pageBreakBefore = "always";
        } else {
          row.style.pageBreakBefore = "avoid"; // or omit this line if not needed
          countySeenBeforeArea = false;
        }

        // Make the value cell bold
        const valueCell = labelCell.nextElementSibling;
        if (valueCell) {
          valueCell.style.fontWeight = "bold"; // Option 1: apply bold style

          // OR Option 2: wrap text in <strong>
          // valueCell.innerHTML = `<strong>${valueCell.textContent.trim()}</strong>`;
        }

      }
    }
  });

  //removing notes row from report
  featureTables.forEach((table) => {
    // Remove Notes row if it exists
    const rows = table.querySelectorAll("tr");
    rows.forEach((row) => {
      const labelCell = row.querySelector(".label");
      if (labelCell && labelCell.textContent.trim() === "Notes:") {
        row.remove();
      }
    });

  });

  const sectionWrapper = printWindow.document.createElement("div");
  sectionWrapper.className = "section";

  //handling images here
  featureTables.forEach((table, index) => {
    const imagesCells = table.querySelectorAll(".images-cell");
    imagesCells.forEach((imagesCell) => {
      const imageDivs = Array.from(
        imagesCell.querySelectorAll(".image-with-location")
      );
      const label =
        imagesCell.querySelector("strong")?.outerHTML ||
        "<strong>Images:</strong><br />";
      const parentRow = imagesCell.closest("tr");
      const tableBody = parentRow.parentElement;
      // const columnCount = parentRow.children.length;

      // Only keep the label in the original cell
      imagesCell.innerHTML = label;

      // Create new rows for images
      while (imageDivs.length > 0) {
        const newRow = printWindow.document.createElement("tr");
        const newCell = printWindow.document.createElement("td");
        newCell.colSpan = 2;

        const newGrid = printWindow.document.createElement("div");
        newGrid.className = "images-grid";
        newGrid.style.gridTemplateColumns =
          imageDivs.length === 1 ? "repeat(1, 1fr)" : "repeat(1, 1fr)";


        for (let i = 0; i < 1 && imageDivs.length > 0; i++) {
          newGrid.appendChild(imageDivs.shift());
        }

        newCell.appendChild(newGrid);
        newRow.appendChild(newCell);
        tableBody.insertBefore(newRow, parentRow.nextSibling);
      }
     
    });

    // Wrap entire table to prevent breaking between pages
    const sectionGroup = printWindow.document.createElement("div");
    sectionGroup.appendChild(table);
    sectionWrapper.appendChild(sectionGroup);
  });

  printContent.appendChild(sectionWrapper);

  await new Promise((resolve) => {
    if (printWindow.document.readyState === "complete") {
      resolve();
    } else {
      printWindow.onload = resolve;
    }
  });

  const images = printWindow.document.querySelectorAll("img");
  await Promise.all(
    Array.from(images).map((img) => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = img.onerror = resolve;
        }
      });
    })
  );

  setTimeout(() => {
    printWindow.print();
    setTimeout(() => printWindow.close(), 3000);
  }, 1000);
}
