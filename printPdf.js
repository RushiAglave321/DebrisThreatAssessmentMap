export async function generatePDF() {
  const container = document.getElementById("tableContainer");
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
    await generatePDFNow(element);
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
  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (!printWindow) throw new Error("Popup blocked. Please allow popups.");

  const now = new Date();
  const formattedDate = `${
    now.getMonth() + 1
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
        padding: 0;
      }

      .report-container {
        padding: 20px;
      }

      .report-header {
        margin-bottom: 20px;
        border-bottom: 2px solid #0066cc;
        padding-bottom: 10px;
      }

      .report-title {
        font-size: 18pt;
        color: #0066cc;
        margin: 0 0 5px 0;
      }

      .report-subtitle {
        font-size: 12pt;
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
        margin: 10px 0;
        padding-bottom: 5px;
        border-bottom: 1px solid #ddd;
      }

      .featureTable {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
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
        grid-template-columns: repeat(1, 1fr);
        gap: 10px;
        margin-top: 10px;
        page-break-inside: avoid;
      }

      .two-images {
        grid-template-columns: repeat(2, 1fr);
      }

      .image-with-location {
        page-break-inside: avoid;
        border: 1px solid #eee;
        padding: 5px;
        background: white;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .image-with-location img {
        max-width: 100%;
        height: auto;
        max-height: 300px;
        display: block;
        margin: 0 auto;
        object-fit: contain;
      }

      .image-location {
        text-align: center;
        font-size: 10px;
        margin-top: 5px;
        font-family: monospace;
      }

      @media print {
        .no-print {
          display: none;
        }
        
        .image-page-break {
          page-break-after: always;
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

  // Process each table (location)
  featureTables.forEach((table) => {
    const sectionWrapper = printWindow.document.createElement("div");
    sectionWrapper.className = "section";

    // Extract county name and area
    let countyName = "Unknown County";
    let areaName = "Unknown Area";
    const rows = Array.from(table.querySelectorAll("tr"));

    rows.forEach((row) => {
      const label = row.querySelector(".label");
      const value = row.querySelector(".value");
      if (label && value) {
        const labelText = label.textContent.trim().toLowerCase();
        if (labelText === "county:") {
          countyName = value.textContent.trim();
          row.remove();
        } else if (labelText === "area:") {
          areaName = value.textContent.trim();
        }
      }
    });

    // Add section title
    const locTitle = printWindow.document.createElement("h3");
    locTitle.className = "section-title";
    locTitle.textContent = `County: ${countyName} | Area: ${areaName}`;
    sectionWrapper.appendChild(locTitle);

    // Add the table (without county row)
    sectionWrapper.appendChild(table);

    // Process images
    const imagesCells = table.querySelectorAll(".images-cell");
    imagesCells.forEach((imagesCell) => {
      const imageDivs = Array.from(
        imagesCell.querySelectorAll(".image-with-location")
      );

      if (imageDivs.length > 0) {
        // Remove existing content
        imagesCell.innerHTML = "";

        // Determine if we have an area (which means 1 image per page)
        const hasArea = areaName !== "Unknown Area";

        // Group images - 1 per page if has area, 2 otherwise
        const groups = [];
        if (hasArea) {
          // One image per page
          imageDivs.forEach((img) => groups.push([img]));
        } else {
          // Two images per page
          for (let i = 0; i < imageDivs.length; i += 2) {
            groups.push(imageDivs.slice(i, i + 2));
          }
        }

        // Create image groups with proper layout
        groups.forEach((group, index) => {
          const gridWrapper = printWindow.document.createElement("div");
          gridWrapper.className = `images-grid ${
            group.length > 1 ? "two-images" : ""
          }`;

          // Add class for page break after each group except last
          if (index < groups.length - 1) {
            gridWrapper.classList.add("image-page-break");
          }

          group.forEach((div) => {
            // Ensure image has proper styling
            const img = div.querySelector("img");
            if (img) {
              img.style.maxHeight = "300px";
              img.style.width = "auto";
            }
            gridWrapper.appendChild(div.cloneNode(true));
          });

          imagesCell.appendChild(gridWrapper);
        });
      }
    });

    printContent.appendChild(sectionWrapper);
  });

  await new Promise((resolve) => {
    if (printWindow.document.readyState === "complete") {
      resolve();
    } else {
      printWindow.onload = resolve;
    }
  });

  // Wait for all images to load before printing
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
