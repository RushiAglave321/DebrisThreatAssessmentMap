export function setupPopup(view) {
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
          "Source",
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
          "created_user",
          "created_date",
          "last_edited_date",
          "last_edited_user",
          "Shape__Area",
          "Shape__Length",
          "Drone_Flyover_Completed",
        ];

        graphics.forEach((result, index) => {
          const attrs = result.graphic.attributes;
          popupContent += `<b>Layer ${index + 1} - ${
            result.graphic.layer.title
          }</b><br>`;

          // Check if image_url exists and is not empty
          if (attrs["image_url"]) {
            popupContent += `<b>Image:</b><br><img src="${attrs["image_url"]}" style="max-width:300px;"><br>`;
          }

          // Show attributes in defined order (excluding image_url if already shown)
          orderedFields.forEach((key) => {
            if (key !== "image_url" && attrs[key] !== undefined) {
              popupContent += `<b>${key}:</b> ${attrs[key]}<br>`;
            }
          });

          // Show remaining non-hidden, non-duplicate attributes
          for (const key in attrs) {
            if (
              !hiddenFields.includes(key) &&
              !orderedFields.includes(key) 
              
            ) {
              popupContent += `<b>${key}:</b> ${attrs[key]}<br>`;
            }
          }

          popupContent += "<hr>";
        });

        view.popup.open({
          title: `Found ${graphics.length} feature(s)`,
          content: popupContent,
          location: event.mapPoint,
        });
      } else {
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
}
